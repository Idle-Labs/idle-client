import Title from '../Title/Title';
import React, { Component } from 'react';
import { Flex, Box, Text, Input } from "rimble-ui";
import FunctionsUtil from '../utilities/FunctionsUtil';
import ButtonLoader from '../ButtonLoader/ButtonLoader';
import TranchesList from '../TranchesList/TranchesList';
import DashboardCard from '../DashboardCard/DashboardCard';

class GaugesBoostCalculator extends Component {

  state = {
    periodOptions:{
      365:{
        label:'1y'
      },
      730:{
        label:'2y'
      },
      1095:{
        label:'3y'
      },
      1460:{
        label:'4y'
      }
    },
    loading:false,
    idleAmount:'',
    periodValue:'',
    depositAmount:'',
    periodValid:null,
    stkIdleAmount:null,
    selectedPeriod:null,
    availableGauges:null
  }

  // Utils
  functionsUtil = null;

  loadUtils(){
    if (this.functionsUtil){
      this.functionsUtil.setProps(this.props);
    } else {
      this.functionsUtil = new FunctionsUtil(this.props);
    }
  }

  async componentWillMount(){
    this.loadUtils();
  }

  async componentDidUpdate(prevProps,prevState){
    this.loadUtils();

    const idleAmountChanged = prevState.idleAmount !== this.state.idleAmount;
    const periodValueChanged = prevState.periodValue !== this.state.periodValue;
    if (idleAmountChanged || periodValueChanged){
      this.calculateStkIdleAmount();
    }
  }

  calculateStkIdleAmount = () => {
    let stkIdleAmount = this.functionsUtil.BNify(this.state.idleAmount).times(this.state.periodValue).div(1460);
    if (stkIdleAmount.isNaN()){
      stkIdleAmount = this.functionsUtil.BNify(0);
    }
    this.setState({
      stkIdleAmount
    });
  }

  changeDepositAmount = (e) => {
    const depositAmount = e.target.value.length && !isNaN(e.target.value) ? Math.floor(e.target.value) : '';
    this.setState({
      depositAmount
    });
  }

  changeIdleAmount = (e) => {
    const idleAmount = e.target.value.length && !isNaN(e.target.value) ? Math.floor(e.target.value) : '';
    this.setState({
      idleAmount
    });
  }

  changePeriod = (e,selectedPeriod=null) => {
    const periodValue = e.target.value.length && !isNaN(e.target.value) ? e.target.value : '';
    const periodValid = parseInt(periodValue)>=7 && parseInt(periodValue)<=1460;
    this.setState({
      periodValue,
      periodValid,
      selectedPeriod
    });
  }

  selectPeriod = (selectedPeriod) => {
    this.changePeriod({
      target:{
        value:selectedPeriod
      }
    },selectedPeriod);
  }

  async calculateGaugesData(){

    if (this.functionsUtil.BNify(this.state.depositAmount).isNaN() || this.functionsUtil.BNify(this.state.idleAmount).isNaN() || this.functionsUtil.BNify(this.state.depositAmount).lte(0) || this.functionsUtil.BNify(this.state.idleAmount).lte(0) || !this.state.periodValid){
      return false;
    }

    this.setState({
      loading:true
    });

    const gaugesOrderKeys = {};
    const availableGauges = {};

    const depositAmount = this.functionsUtil.BNify(this.state.depositAmount);
    const veTokenBalance = this.functionsUtil.BNify(this.state.stkIdleAmount);
    const veTokenConfig = this.functionsUtil.getGlobalConfig(['tools','gauges','props','veToken']);

    let dailyDistributionRate = await this.functionsUtil.genericContractCallCached('GaugeDistributor','rate');
    dailyDistributionRate = this.functionsUtil.fixTokenDecimals(dailyDistributionRate,18).times(86400);

    const gaugesConfigs = this.functionsUtil.getGlobalConfig(['tools','gauges','props','availableGauges']);
    await this.functionsUtil.asyncForEach(Object.keys(gaugesConfigs), async (gaugeToken) => {
      const gaugeConfig = gaugesConfigs[gaugeToken];
      if (!availableGauges[gaugeConfig.protocol]){
        availableGauges[gaugeConfig.protocol] = {};
      }

      const cdoConfig = this.props.availableTranches[gaugeConfig.protocol] ? this.props.availableTranches[gaugeConfig.protocol][gaugeToken] : null;
      
      if (cdoConfig){
        const liquidityGaugeContract = this.functionsUtil.getContractByName(gaugeConfig.name);
        if (!liquidityGaugeContract && gaugeConfig.abi){
          await this.props.initContract(gaugeConfig.name,gaugeConfig.address,gaugeConfig.abi);
        }
        const underlyingTokenConfig = this.functionsUtil.getTokenConfig(gaugeConfig.underlyingToken);

        let [
          tokenConversionRate,
          trancheVirtualPrice
        ] = await Promise.all([
          this.functionsUtil.getTokenConversionRate(underlyingTokenConfig),
          this.functionsUtil.genericContractCallCached(cdoConfig.CDO.name, 'virtualPrice', [cdoConfig.AA.address])
        ]);

        trancheVirtualPrice = this.functionsUtil.fixTokenDecimals(trancheVirtualPrice,18);

        const stakedBalance = depositAmount.div(tokenConversionRate).div(trancheVirtualPrice);

        let [
          gaugeNextWeight,
          rewardsTokens,
          gaugeTotalSupply,
          userBoostInfo,
          gaugeWorkingSupply,
          gaugeWeight
        ] = await Promise.all([
          this.functionsUtil.getGaugeNextWeight(gaugeConfig),
          this.functionsUtil.getGaugeRewardsTokens(gaugeConfig),
          this.functionsUtil.getTokenTotalSupply(gaugeConfig.name),
          this.functionsUtil.calculateGaugeBoost(gaugeToken,stakedBalance,veTokenBalance),
          this.functionsUtil.genericContractCallCached(gaugeConfig.name,'working_supply'),
          this.functionsUtil.genericContractCallCached('GaugeController','gauge_relative_weight',[gaugeConfig.address])
        ]);

        // console.log(gaugeConfig.name,tokenConversionRate,trancheVirtualPrice,stakedBalance.toFixed(),veTokenBalance.toFixed());

        const userWorkingBalance = userBoostInfo.workingBalance;

        const claimableRewardsTokens = Object.keys(rewardsTokens).reduce( (claimableRewards,token) => {
          const tokenConfig = rewardsTokens[token];
          claimableRewards[token] = this.functionsUtil.fixTokenDecimals(tokenConfig.balance,tokenConfig.decimals);
          return claimableRewards;
        },{});

        gaugeWeight = this.functionsUtil.fixTokenDecimals(gaugeWeight,18);
        gaugeNextWeight = this.functionsUtil.fixTokenDecimals(gaugeNextWeight,18);
        gaugeTotalSupply = this.functionsUtil.fixTokenDecimals(gaugeTotalSupply,18);
        const gaugeDistributionRate = dailyDistributionRate.times(gaugeWeight);

        const gaugeUserShare = stakedBalance.div(gaugeTotalSupply.plus(stakedBalance));

        const userBoostedShare = this.functionsUtil.BNify(userWorkingBalance).div(gaugeWorkingSupply);
        let userBoostedDistribution = gaugeDistributionRate.times(userBoostedShare);
        if (userBoostedDistribution.gt(gaugeDistributionRate)){
          userBoostedDistribution = gaugeDistributionRate;
        }

        const claimableTokens = Object.keys(claimableRewardsTokens).length ? Object.keys(claimableRewardsTokens).map( token => {
          let text = ``;
          if (!this.functionsUtil.BNify(userBoostedDistribution).isNaN() && token.toLowerCase() === veTokenConfig.rewardToken.toLowerCase()){
            text += `~${userBoostedDistribution.toFixed(4)} ${token}/day`;
          } else if (rewardsTokens[token].rate){
            let userDistributionRate = rewardsTokens[token].rate.times(gaugeUserShare);
            if (userDistributionRate.gt(rewardsTokens[token].rate)){
              userDistributionRate = rewardsTokens[token].rate;
            }
            text += `~${userDistributionRate.toFixed(4)} ${token}/day`;
          }
          return text;
        }).join('<br />') : '-';

        const distributionRate = Object.keys(rewardsTokens).length ? Object.keys(rewardsTokens).map( token => {
          if (token.toLowerCase() === veTokenConfig.rewardToken.toLowerCase()){
            return `${gaugeDistributionRate.toFixed(4)} ${token}/day`;
          } else {
            const tokenDistributionRate = rewardsTokens[token].rate;
            return `${tokenDistributionRate.toFixed(4)} ${token}/day`;
          }
        }).join('<br />') : '-';

        availableGauges[gaugeConfig.protocol][gaugeToken] = cdoConfig;
        availableGauges[gaugeConfig.protocol][gaugeToken].rewardsTokens = rewardsTokens;
        availableGauges[gaugeConfig.protocol][gaugeToken].totalSupply = gaugeTotalSupply;
        availableGauges[gaugeConfig.protocol][gaugeToken].depositedAmount = stakedBalance;
        availableGauges[gaugeConfig.protocol][gaugeToken].claimableTokens = claimableTokens;
        availableGauges[gaugeConfig.protocol][gaugeToken].distributionRate = distributionRate;
        availableGauges[gaugeConfig.protocol][gaugeToken].boost = userBoostInfo.boost.toFixed(2)+'x';
        availableGauges[gaugeConfig.protocol][gaugeToken].weight = gaugeWeight.times(100).toFixed(2)+'%';
        availableGauges[gaugeConfig.protocol][gaugeToken].nextWeight = gaugeNextWeight.times(100).toFixed(2)+'%';
        availableGauges[gaugeConfig.protocol][gaugeToken].gaugeUserShare = this.functionsUtil.BNify(Math.min(gaugeUserShare.times(100),100)).toFixed(2)+'%';

        gaugesOrderKeys[`${userBoostInfo.boost.toFixed(2)}_${gaugeWeight.times(100).toFixed(2)}_${gaugeConfig.protocol}_${gaugeToken}`] = {
          gaugeToken,
          gaugeConfig
        };
      }
    });

    const gaugesOrderedKeys = Object.keys(gaugesOrderKeys).sort().reverse().reduce(
      (obj, key) => { 
        obj[key] = gaugesOrderKeys[key]; 
        return obj;
      }, 
      {}
    );


    const availableGaugesSorted = {};
    Object.values(gaugesOrderedKeys).forEach( g => {
      if (!availableGaugesSorted[g.gaugeConfig.protocol]){
        availableGaugesSorted[g.gaugeConfig.protocol] = {};
      }
      availableGaugesSorted[g.gaugeConfig.protocol][g.gaugeToken] = availableGauges[g.gaugeConfig.protocol][g.gaugeToken];
    });

    // console.log('availableGauges',availableGaugesSorted,gaugesOrderedKeys);
    this.setState({
      loading:false,
      availableGauges:availableGaugesSorted
    });
  }

  render() {
    const govTokenConfig = this.functionsUtil.getGlobalConfig(['governance','props','tokenName']);
    return (
      <Flex
        width={1}
        alignItems={'center'}
        flexDirection={'column'}
        justifyContent={'center'}
      >
        <Box
          width={1}
          maxWidth={['100%','35em']}
        >
          <Box
            mt={2}
            width={1}
          >
            <Text
              mb={1}
            >
              How many dollars do you want to deposit?
            </Text>
            <Input
              min={0}
              step={0.01}
              width={'100%'}
              type={"number"}
              required={true}
              height={'3.4em'}
              borderRadius={2}
              fontWeight={500}
              borderColor={'cardBorder'}
              backgroundColor={'cardBg'}
              boxShadow={'none !important'}
              value={this.state.depositAmount}
              placeholder={`Insert dollars amount`}
              onChange={this.changeDepositAmount.bind(this)}
              border={`1px solid ${this.props.theme.colors.cardBorder}`}
            />
          </Box>
          <Box
            mt={2}
            width={1}
          >
            <Text
              mb={1}
            >
              How many {govTokenConfig} do you want to stake?
            </Text>
            <Input
              min={0}
              step={0.01}
              width={'100%'}
              type={"number"}
              required={true}
              height={'3.4em'}
              borderRadius={2}
              fontWeight={500}
              borderColor={'cardBorder'}
              backgroundColor={'cardBg'}
              boxShadow={'none !important'}
              value={this.state.idleAmount}
              onChange={this.changeIdleAmount.bind(this)}
              placeholder={`Insert ${govTokenConfig} amount`}
              border={`1px solid ${this.props.theme.colors.cardBorder}`}
            />
          </Box>
          <Box
            mt={2}
            width={1}
          >
            <Text
              mb={1}
            >
              For how many days?
            </Text>
            <Input
              min={0}
              step={1}
              width={'100%'}
              type={"number"}
              required={true}
              height={'3.4em'}
              borderRadius={2}
              fontWeight={500}
              borderWidth={'1px'}
              borderStyle={'solid'}
              backgroundColor={'cardBg'}
              boxShadow={'none !important'}
              value={this.state.periodValue}
              placeholder={'Insert days of staking'}
              onChange={this.changePeriod.bind(this)}
              borderColor={!this.state.periodValid && this.state.periodValue && this.state.periodValue.length>0 ? 'red' : 'cardBorder'}
            />
            {
              !this.state.periodValid && this.state.periodValue && this.state.periodValue.length>0 && (
                <Text
                  my={1}
                  fontSize={2}
                  color={'red'}
                >
                  Enter a period between 1 week and 4 years!
                </Text>
              )
            }
            <Flex
              mt={2}
              alignItems={'center'}
              flexDirection={'row'}
              justifyContent={'space-between'}
            >
              {
                Object.keys(this.state.periodOptions).map( period => {
                  const periodInfo = this.state.periodOptions[period];
                  const isActive = this.state.selectedPeriod===period;
                  const width = (1/Object.keys(this.state.periodOptions).length)-0.01;
                  return (
                    <DashboardCard
                      cardProps={{
                        p:2,
                        width:width,
                      }}
                      isActive={isActive}
                      isInteractive={true}
                      key={`stakePeriod_${period}`}
                      handleClick={e => this.selectPeriod(period)}
                    >
                      <Text
                        fontSize={2}
                        fontWeight={3}
                        textAlign={'center'}
                        color={isActive ? 'primary' : 'legend'}
                      >
                        {periodInfo.label}
                      </Text>
                    </DashboardCard>
                  );
                })
              }
            </Flex>
          </Box>
          <Flex
            mt={2}
            width={1}
            justifyContent={'center'}
          >
            <ButtonLoader
              buttonProps={{
                my:2,
                mx:[0, 2],
                size:'medium',
                disabled:(this.functionsUtil.BNify(this.state.depositAmount).isNaN() || this.functionsUtil.BNify(this.state.idleAmount).isNaN() || this.functionsUtil.BNify(this.state.depositAmount).lte(0) || this.functionsUtil.BNify(this.state.idleAmount).lte(0) || !this.state.periodValid)
              }}
              buttonText={'CALCULATE BOOST'}
              isLoading={this.state.loading}
              handleClick={ e => this.calculateGaugesData(e) }
            />
          </Flex>
        </Box>
        {
          this.state.availableGauges && (
            <Flex
              mt={3}
              width={1}
              mb={[3,4]}
              flexDirection={'column'}
            >
              <Flex
                pb={2}
                width={1}
                mb={[2,3]}
                borderColor={'divider'}
                borderBottom={'1px solid transparent'}
              >
                <Title
                  as={'h4'}
                  fontSize={[2,4]}
                  fontWeight={[3,4]}
                >
                  Available Gauges
                </Title>
              </Flex>
              <TranchesList
                handleClick={null}
                enabledProtocols={[]}
                colsProps={{
                  fontSize:['10px','14px'],
                }}
                cols={[
                  {
                    title:'PROTOCOL', 
                    props:{
                      width:[0.35, 0.12]
                    },
                    fields:[
                      {
                        name:'protocolIcon',
                        props:{
                          mr:2,
                          height:['1.4em','2em']
                        }
                      },
                      {
                        name:'protocolName'
                      },
                      {
                        mobile:false,
                        name:'experimentalBadge',
                        props:{
                          ml:1,
                          height:'1.5em'
                        }
                      }
                    ]
                  },
                  {
                    title:'TOKEN',
                    props:{
                      width:[0.16, 0.14],
                    },
                    fields:[
                      {
                        name:'tokenIcon',
                        props:{
                          mr:2,
                          height:['1.4em','2em']
                        }
                      },
                      {
                        mobile:false,
                        name:'tokenName'
                      }
                    ]
                  },
                  {
                    mobile:false,
                    title:'WEIGHT',
                    props:{
                      width:[0.25,0.07],
                    },
                    fields:[
                      {
                        type:'text',
                        name:'custom',
                        showLoader:true,
                        path:['tokenConfig','weight']
                      }
                    ]
                  },
                  {
                    mobile:false,
                    title:'TOTAL SUPPLY',
                    props:{
                      width:[0.26, 0.1],
                    },
                    fields:[
                      {
                        type:'number',
                        name:'custom',
                        showLoader:true,
                        path:['tokenConfig','totalSupply'],
                        props:{
                          minPrecision:1,
                          flexProps:{
                            justifyContent:'flex-start'
                          },
                          decimals:this.props.isMobile ? 2 : 3
                        }
                      }
                    ]
                  },
                  {
                    mobile:false,
                    title:'REWARDS',
                    props:{
                      width:[0.23, 0.08],
                    },
                    fields:[
                      {
                        name:'custom',
                        showLoader:true,
                        type:'tokensList',
                        path:['tokenConfig','rewardsTokens'],
                        props:{
                          
                        }
                      }
                    ]
                  },
                  {
                    mobile:false,
                    title:'DISTRIBUTION RATE',
                    props:{
                      width:[0.15, 0.13],
                    },
                    fields:[
                      {
                        type:'html',
                        name:'custom',
                        showLoader:true,
                        props:{
                          fontSize:1,
                          lineHeight:1.3,
                        },
                        path:['tokenConfig','distributionRate'],
                      }
                    ]
                  },
                  {
                    mobile:false,
                    title:'DEPOSITED',
                    props:{
                      color:'copyColor',
                      width:[0.25,0.08],
                    },
                    fields:[
                      {
                        type:'number',
                        name:'custom',
                        showLoader:true,
                        path:['tokenConfig','depositedAmount'],
                        props:{
                          minPrecision:1,
                          color:'copyColor',
                          flexProps:{
                            justifyContent:'flex-start'
                          },
                          decimals:this.props.isMobile ? 2 : 3
                        }
                      }
                    ]
                  },
                  {
                    mobile:false,
                    title:'POOL SHARE',
                    props:{
                      color:'copyColor',
                      width:[0.27,0.09],
                    },
                    fields:[
                      {
                        type:'text',
                        name:'custom',
                        showLoader:true,
                        path:['tokenConfig','gaugeUserShare'],
                        props:{
                          color:'copyColor',
                          flexProps:{
                            justifyContent:'flex-start'
                          },
                        }
                      },
                    ],
                  },
                  {
                    title:'BOOST',
                    props:{
                      color:'copyColor',
                      width:[0.2,0.06],
                    },
                    fields:[
                      {
                        type:'text',
                        name:'custom',
                        showLoader:true,
                        path:['tokenConfig','boost'],
                        props:{
                          color:'copyColor',
                          flexProps:{
                            justifyContent:'flex-start'
                          }
                        }
                      },
                    ],
                  },
                  {
                    title:'CLAIMABLE REWARDS',
                    props:{
                      color:'copyColor',
                      width:[0.39,0.13],
                    },
                    fields:[
                      {
                        type:'html',
                        showLoader:true,
                        props:{
                          fontSize:[0,1],
                          lineHeight:1.3,
                          color:'copyColor'
                        },
                        name:'custom',
                        path:['tokenConfig','claimableTokens']
                      }
                    ]
                  },
                ]}
                {...this.props}
                availableTranches={this.state.availableGauges}
              />
            </Flex>
          )
        }
      </Flex>
    );
  }
}

export default GaugesBoostCalculator;
