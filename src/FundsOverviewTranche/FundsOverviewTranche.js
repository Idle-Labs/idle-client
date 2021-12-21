import Title from '../Title/Title';
import React, { Component } from 'react';
import FunctionsUtil from '../utilities/FunctionsUtil';
import TrancheField from '../TrancheField/TrancheField';
import DashboardCard from '../DashboardCard/DashboardCard';
import { Flex, Heading, Text, Tooltip, Icon } from "rimble-ui";
import PortfolioEquityTranches from '../PortfolioEquityTranches/PortfolioEquityTranches';

class FundsOverviewTranche extends Component {

  state = {
    // govTokensAprs:null,
    aggregatedValues:[],
    govTokensTotalApr:null,
    govTokensUserBalance:null,
    govTokensDistribution:null,
    govTokensTotalBalance:null,
    govTokensTotalAprTooltip:null,
    idleTokenUserDistribution:null,
    govTokensDistributionTooltip:null,
    govTokensTotalBalanceTooltip:null
  };

  // Utils
  functionsUtil = null;
  idleGovToken = null;

  loadUtils(){
    if (this.functionsUtil){
      this.functionsUtil.setProps(this.props);
    } else {
      this.functionsUtil = new FunctionsUtil(this.props);
    }

    this.idleGovToken = this.functionsUtil.getIdleGovToken();
  }

  async componentWillMount(){
    this.loadUtils();
  }

  async componentDidMount(){

    /*
    const govTokenAvailableTokens = {};
    govTokenAvailableTokens[this.props.selectedToken] = this.props.tokenConfig;

    const isRisk = this.props.selectedStrategy === 'risk';

    const [
      // govTokensAprs,
      idleTokenUserDistribution,
      govTokensUserBalance,
      apy,
      depositTimestamp,
      days
    ] = await Promise.all([
      // this.functionsUtil.getGovTokensAprs(this.props.selectedToken,this.props.tokenConfig),
      this.idleGovToken.getUserDistribution(this.props.account,govTokenAvailableTokens,true),
      this.functionsUtil.getGovTokensUserBalances(this.props.account,govTokenAvailableTokens,null),
      this.functionsUtil.loadTrancheField('apy',this.props.selectedToken,this.props.tokenConfig,this.props.account,false),
      this.functionsUtil.loadTrancheField('depositTimestamp',this.props.selectedToken,this.props.tokenConfig,this.props.account),
      this.functionsUtil.loadTrancheField('daysFirstDeposit',this.props.selectedToken,this.props.tokenConfig,this.props.account),
    ]);

    let avgAPY = await this.functionsUtil.getAvgAPYStats(this.props.tokenConfig.address,isRisk,depositTimestamp);

    if (!avgAPY || this.functionsUtil.BNify(avgAPY).lte(0)){
      avgAPY = apy;
    }

    const govTokensTotalBalance = govTokensUserBalance ? Object.values(govTokensUserBalance).reduce( (totBalance,govTokenBalance) => {
      return totBalance.plus(this.functionsUtil.BNify(govTokenBalance));
    },this.functionsUtil.BNify(0)) : null;

    const govTokensTotalBalanceTooltip = govTokensUserBalance ? Object.keys(govTokensUserBalance).map( govToken => {
      const balance = govTokensUserBalance[govToken];
      if (balance.gt(0)){
        return `+${balance.toFixed(2)} ${govToken}`;
      } else {
        return null;
      }
    }).filter(v => (v !== null)) : null;

    const aggregatedValues = [
      {
        flexProps:{
          width:[1,0.32],
        },
        props:{
          title:'Avg APY',
          desc:this.functionsUtil.getGlobalConfig(['messages','apyLong']),
          children:(
            <Flex
              width={1}
              alignItems={'center'}
              height={['55px','59px']}
              flexDirection={'column'}
              justifyContent={'center'}
            >
              <Text
                lineHeight={1}
                fontWeight={[3,4]}
                color={'copyColor'}
                fontFamily={'counter'}
                fontSize={['1.7em','1.7em']}
                dangerouslySetInnerHTML={{ __html: (avgAPY ? avgAPY.toFixed(2)+'%' : '0.00%') }}
              />
            </Flex>
          )
        }
      },
      {
        flexProps:{
          width:[1,0.32],
        },
        props:{
          title:'Current Allocation',
          children:(
            <Flex
              width={1}
              id={'allocationChart'}
              height={['55px','59px']}
              flexDirection={'column'}
            >
              <TrancheField
                {...this.props}
                showLoader={true}
                fieldInfo={{
                  name:'allocationChart'
                }}
                parentId={'allocationChart'}
                token={this.props.selectedToken}
                tokenConfig={this.props.tokenConfig}
              />
            </Flex>
          ),
          label:'',
        }
      },
      {
        flexProps:{
          width:[1,0.32],
        },
        props:{
          title:'Days since first deposit',
          children:(
            <Flex
              width={1}
              alignItems={'center'}
              height={['55px','59px']}
              flexDirection={'column'}
              justifyContent={'center'}
            >
              <Text
                lineHeight={1}
                fontWeight={[3,4]}
                color={'copyColor'}
                fontFamily={'counter'}
                fontSize={['1.7em','1.7em']}
                dangerouslySetInnerHTML={{ __html: (days ? parseInt(days) : '-') }}
              />
            </Flex>
          )
        }
      }
    ];

    this.setState({
      // govTokensAprs,
      aggregatedValues,
      // govTokensTotalApr,
      govTokensUserBalance,
      govTokensTotalBalance,
      // govTokensTotalAprTooltip,
      idleTokenUserDistribution,
      govTokensTotalBalanceTooltip
    });
    */
  }

  async componentDidUpdate(prevProps,prevState){
    this.loadUtils();
  }

  render() {
    const stakingRewards = this.props.tokenConfig && this.props.trancheType ? this.props.tokenConfig[this.props.trancheType].CDORewards.stakingRewards : [];
    const stakingRewardsEnabled = stakingRewards.length ? stakingRewards.filter( t => t.enabled ) : null;
    const stakingEnabled = stakingRewardsEnabled && stakingRewardsEnabled.length>0;
    const colWidth = stakingEnabled ? 1/6 : 1/5;

    return (
      <Flex
        width={1}
        flexDirection={'column'}
      >
        {
          this.state.aggregatedValues.length>0 && 
            <Flex
              width={1}
              mb={[0,3]}
              mt={[2,0]}
              alignItems={'center'}
              flexDirection={['column','row']}
              justifyContent={'space-between'}
            >
              {
                this.state.aggregatedValues.map((v,i) => (
                  <Flex
                    {...v.flexProps}
                    flexDirection={'column'}
                    key={`aggregatedValue_${i}`}
                  >
                    <DashboardCard
                      cardProps={{
                        py:[2,3],
                        mb:[3,0]
                      }}
                    >
                      <Flex
                        width={1}
                        alignItems={'center'}
                        flexDirection={'column'}
                        justifyContent={'center'}
                      >
                        {
                          v.props.children ? v.props.children : (
                            <Text
                              lineHeight={1}
                              fontWeight={[3,4]}
                              color={'copyColor'}
                              fontFamily={'counter'}
                              fontSize={[4,'1.7em']}
                              dangerouslySetInnerHTML={{ __html: v.props.value }}
                            >
                            </Text>
                          )
                        }
                        <Flex
                          mt={2}
                          width={1}
                          alignItems={'center'}
                          justifyContent={'center'}
                        >
                          <Text
                            fontWeight={2}
                            fontSize={[1,2]}
                            color={'cellText'}
                          >
                            {v.props.title}
                          </Text>
                          {
                            v.props.desc && 
                              <Tooltip
                                placement={'bottom'}
                                message={v.props.desc}
                              >
                                <Icon
                                  ml={2}
                                  name={"Info"}
                                  size={'1em'}
                                  color={'cellTitle'}
                                />
                              </Tooltip>
                          }
                        </Flex>
                      </Flex>
                    </DashboardCard>
                  </Flex>
                ))
              }
            </Flex>
        }
        <DashboardCard
          cardProps={{
            px:2,
            py:3
          }}
        >
          {
            this.props.transactionsList && this.props.transactionsList.length>0 && (
              <Flex
                width={1}
                ml={[0,3]}
                id={"funds-overview"}
              >
                <PortfolioEquityTranches
                  {...this.props}
                  chartHeight={350}
                  parentId={'funds-overview'}
                  chartToken={this.props.selectedToken}
                  enabledTokens={[this.props.selectedToken]}
                  frequencySeconds={this.functionsUtil.getFrequencySeconds('day',1)}
                />
              </Flex>
            )
          }
          <Flex
            width={1}
            flexDirection={['column','row']}
          >
            <Flex
              mb={[2,0]}
              width={[1,colWidth]}
              alignItems={'center'}
              flexDirection={'column'}
              justifyContent={'flex-start'}
            >
              <Title
                mb={2}
                fontSize={[3,4]}
                component={Heading.h3}
              >
                Deposited
              </Title>
              <TrancheField
                {...this.props}
                addTokenName={false}
                fieldInfo={{
                  name:'trancheDeposited',
                  props:{
                    decimals:7,
                    fontWeight:300,
                    maxPrecision:8,
                    fontSize:['1.8em','1.9em'],
                    color:this.props.theme.colors.counter,
                    flexProps:{
                      justifyContent:'center'
                    }
                  }
                }}
              />
            </Flex>
            {
              stakingEnabled && (
                <Flex
                  mb={[2,0]}
                  width={[1,colWidth]}
                  alignItems={'center'}
                  flexDirection={'column'}
                  justifyContent={'flex-start'}
                >
                  <Title
                    mb={2}
                    fontSize={[3,4]}
                    component={Heading.h3}
                  >
                    Staked Amount
                  </Title>
                  <TrancheField
                    {...this.props}
                    addTokenName={false}
                    fieldInfo={{
                      name:'trancheStaked',
                      props:{
                        decimals:7,
                        fontWeight:300,
                        maxPrecision:8,
                        fontSize:['1.8em','1.9em'],
                        color:this.props.theme.colors.counter,
                        flexProps:{
                          justifyContent:'center'
                        }
                      }
                    }}
                  />
                </Flex>
              )
            }
            <Flex
              mb={[2,0]}
              width={[1,colWidth]}
              alignItems={'center'}
              flexDirection={'column'}
              justifyContent={'flex-start'}
            >
              <Title
                mb={2}
                fontSize={[3,4]}
                component={Heading.h3}
              >
                Redeemable
              </Title>
              <TrancheField
                {...this.props}
                addTokenName={false}
                fieldInfo={{
                  name:'trancheRedeemableWithStaked',
                  props:{
                    decimals:7,
                    maxPrecision:8,
                    style:{
                      fontWeight:300,
                      color:this.props.theme.colors.counter,
                      fontSize: this.props.isMobile ? '1.8em' : '1.9em',
                    },
                    flexProps:{
                      justifyContent:'center'
                    }
                  }
                }}
              />
              <Flex
                width={1}
                mt={'-8px'}
                justifyContent={'center'}
              >
                <TrancheField
                  {...this.props}
                  addTokenName={false}
                  fieldInfo={{
                    name:'earningsPerc',
                    props:{
                      fontSize:1,
                      fontWeight:2,
                      color:'cellText',
                      flexProps:{
                        justifyContent:'center'
                      }
                    }
                  }}
                />
              </Flex>
            </Flex>
            <Flex
              mb={[2,0]}
              width={[1,colWidth]}
              alignItems={'center'}
              flexDirection={'column'}
              justifyContent={'flex-start'}
            >
              <Title
                mb={2}
                fontSize={[3,4]}
                component={Heading.h3}
              >
                Earnings
              </Title>
              <TrancheField
                {...this.props}
                addTokenName={false}
                fieldInfo={{
                  name:'earningsCounter',
                  props:{
                    decimals:7,
                    maxPrecision:8,
                    style:{
                      fontWeight:300,
                      fontSize:this.props.isMobile ? '1.8em' : '1.9em',
                      color:this.props.theme.colors.counter
                    },
                    flexProps:{
                      justifyContent:'center'
                    }
                  }
                }}
              />
              {
                this.state.govTokensTotalBalanceTooltip && this.state.govTokensTotalBalanceTooltip.length>0 && (
                  <Flex
                    width={1}
                    alignItems={'center'}
                    flexDirection={'column'}
                    justifyContent={'center'}
                  >
                    {
                      this.state.govTokensTotalBalanceTooltip.map((govTokenBalance,govTokenIndex) => (
                        <Text
                          fontSize={1}
                          lineHeight={1}
                          fontWeight={2}
                          color={'cellText'}
                          textAlign={'center'}
                          mt={govTokenIndex ? 1 : 0}
                          key={`govToken_${govTokenIndex}`}
                        >
                          {govTokenBalance}
                        </Text>
                      ))
                    }
                  </Flex>
                )
              }
            </Flex>
            <Flex
              mb={[2,0]}
              width={[1,colWidth]}
              alignItems={'center'}
              flexDirection={'column'}
              justifyContent={'flex-start'}
            >
              <Title
                mb={2}
                fontSize={[3,4]}
                component={Heading.h3}
              >
                Fees
              </Title>
              <TrancheField
                {...this.props}
                addTokenName={false}
                fieldInfo={{
                  name:'feesCounter',
                  props:{
                    decimals:7,
                    maxPrecision:8,
                    style:{
                      fontWeight:300,
                      fontSize:this.props.isMobile ? '1.8em' : '1.9em',
                      color:this.props.theme.colors.counter
                    },
                    flexProps:{
                      justifyContent:'center'
                    }
                  }
                }}
              />
            </Flex>
            <Flex
              mb={[2,0]}
              width={[1,colWidth]}
              alignItems={'center'}
              flexDirection={'column'}
              justifyContent={'flex-start'}
            >
              <Title
                mb={2}
                fontSize={[3,4]}
                component={Heading.h3}
              >
                Realized APY
              </Title>
              <TrancheField
                {...this.props}
                addTokenName={false}
                fieldInfo={{
                  name:'realizedApy',
                  props:{
                    decimals:2,
                    fontWeight:300,
                    fontSize:['1.8em','1.9em'],
                    color:this.props.theme.colors.counter,
                    flexProps:{
                      justifyContent:'center'
                    }
                  }
                }}
              />
              {
                this.state.idleTokenUserDistribution && (
                  <Flex
                    width={1}
                    alignItems={'center'}
                    flexDirection={'column'}
                    justifyContent={'center'}
                  >
                    <Text
                      mt={1}
                      fontSize={1}
                      lineHeight={1}
                      fontWeight={2}
                      color={'cellText'}
                      textAlign={'center'}
                    >
                      {this.state.idleTokenUserDistribution.toFixed(4)} {this.idleGovToken.tokenName}/{this.idleGovToken.tokenConfig.distributionFrequency}
                    </Text>
                  </Flex>
                )
              }
            </Flex>
          </Flex>
        </DashboardCard>
      </Flex>
    );
  }
}

export default FundsOverviewTranche;