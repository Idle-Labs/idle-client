import Title from '../Title/Title';
import React, { Component } from 'react';
import TranchePage from '../TranchePage/TranchePage';
import FunctionsUtil from '../utilities/FunctionsUtil';
import TranchesList from '../TranchesList/TranchesList';
import DashboardCard from '../DashboardCard/DashboardCard';
import GenericPieChart from '../GenericPieChart/GenericPieChart';
import GenericSelector from '../GenericSelector/GenericSelector';
import { Box, Flex, Heading, Loader, Text, Icon, Tooltip } from "rimble-ui";
import TotalBalanceCounter from '../TotalBalanceCounter/TotalBalanceCounter';
import TotalEarningsCounter from '../TotalEarningsCounter/TotalEarningsCounter';

class Tranches extends Component {

  state = {
    portfolio:null,
    tokenConfig:null,
    selectedToken:null,
    portfolioLoaded:false,
    selectedProtocol:null,
    allocationChartData:null
  };

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

  async componentDidMount(){
    const selectedToken = this.props.urlParams.param2;
    const selectedProtocol = this.props.urlParams.param1;
    const tokenConfig = this.props.availableTranches[selectedProtocol] && this.props.availableTranches[selectedProtocol][selectedToken] ? this.props.availableTranches[selectedProtocol][selectedToken] : null;
    if (tokenConfig){
      this.setState({
        tokenConfig,
        selectedToken,
        selectedProtocol,
      });
    } else {
      await this.loadPortfolio();
    }
  }

  async componentDidUpdate(prevProps, prevState) {
    this.loadUtils();

    const accountChanged = prevProps.account !== this.props.account;
    const availableTokensChanged = JSON.stringify(prevProps.availableTranches) !== JSON.stringify(this.props.availableTranches);
    if (accountChanged || availableTokensChanged){
      this.setState({
        portfolioLoaded:false
      },() => {
        this.loadPortfolio();
      });
    }
  }

  async loadPortfolio(){
    const portfolio = await this.functionsUtil.getAccountPortfolioTranches(this.props.availableTranches,this.props.account);
    if (portfolio){
      const portfolioLoaded = true;
      console.log('loadPortfolio',portfolio);

      const tranchesConfig = this.functionsUtil.getGlobalConfig(['tranches']);

      const tranchesTokens = [];
      const tranchesBalances = [];
      portfolio.tranchesBalance.forEach( trancheInfo => {
        if (!tranchesBalances[trancheInfo.tranche]){
          tranchesBalances[trancheInfo.tranche] = {
            weight:this.functionsUtil.BNify(0),
            balance:this.functionsUtil.BNify(0)
          };
        }
        tranchesBalances[trancheInfo.tranche].weight = tranchesBalances[trancheInfo.tranche].weight.plus(trancheInfo.trancheWeight);
        tranchesBalances[trancheInfo.tranche].balance = tranchesBalances[trancheInfo.tranche].balance.plus(trancheInfo.tokenBalance);

        if (!tranchesTokens[trancheInfo.token]){
          tranchesTokens[trancheInfo.token] = this.functionsUtil.BNify(0);
        }
        tranchesTokens[trancheInfo.token] = tranchesTokens[trancheInfo.token].plus(trancheInfo.tokenBalance);

      });

      const portfolioDonutData = Object.keys(tranchesTokens).map( token => {
        const balanceValue = parseFloat(tranchesTokens[token].toFixed(4));
        const tokenConfig = this.functionsUtil.getGlobalConfig(['stats','tokens',token]);
        return {
          id:token,
          name:token,
          label:token,
          value:balanceValue,
          description: `$ ${balanceValue} in ${token}`,
          color:'hsl('+tokenConfig.color.hsl.join(',')+')',
          image:tokenConfig.icon || `images/tokens/${token}.svg`,
        };
      });

      const allocationChartData = Object.keys(tranchesBalances).map((trancheName,i)=>{
        const trancheConfig = tranchesConfig[trancheName];
        const balanceInfo = tranchesBalances[trancheName];
        const weightValue = parseFloat(balanceInfo.weight.times(100).toFixed(2));
        return {
          id:trancheName,
          name:trancheName,
          value:weightValue,
          label: trancheConfig.name,
          color:'hsl('+trancheConfig.color.hsl.join(',')+')',
          description: `$ ${balanceInfo.balance.toFixed(2)} in ${trancheConfig.name}`
        };
      });

      console.log('allocationChartData',allocationChartData,'portfolioDonutData',portfolioDonutData);

      this.setState({
        portfolio,
        portfolioLoaded,
        portfolioDonutData,
        allocationChartData
      });
    }
  }

  selectTranche(protocol,token){
    const tokenConfig = this.props.availableTranches[protocol] && this.props.availableTranches[protocol][token] ? this.props.availableTranches[protocol][token] : null;
    if (tokenConfig){
      const route = `${this.props.selectedSection.route}/${protocol}/${token}`;
      // console.log('selectTranche',route);
      this.props.goToSection(route);
    }
  }

  render() {
    return (
      <Box
        width={1}
      >
        {
          this.state.tokenConfig ? (
            <TranchePage
              {...this.props}
              tokenConfig={this.state.tokenConfig}
              selectedToken={this.state.selectedToken}
              selectedProtocol={this.state.selectedProtocol}
              availableTranches={this.props.availableTranches}
            />
          ) : (
            <Box
              width={1}
            >
              <Title
                mb={3}
              >
                Tranches
              </Title>
              {
                this.state.portfolioLoaded && (
                  <Flex
                    width={1}
                    flexDirection={'column'}
                  >
                    <Flex
                      mb={3}
                      width={1}
                      mt={[2,0]}
                      alignItems={'center'}
                      justifyContent={'center'}
                      flexDirection={['column','row']}
                    >
                      <Flex
                        pr={[0,2]}
                        width={[1,1/3]}
                        flexDirection={'column'}
                      >
                        <DashboardCard
                          cardProps={{
                            py:[3,0],
                            mb:[2,0],
                            display:'flex',
                            alignItems:'center',
                            height:['auto','125px'],
                            justifyContent:'center'
                          }}
                        >
                          <Flex
                            width={1}
                            alignItems={'center'}
                            flexDirection={'column'}
                            justifyContent={'center'}
                          >
                            {
                              this.state.portfolio.avgAPY ? (
                                <Text
                                  lineHeight={1}
                                  fontWeight={[3,4]}
                                  color={'copyColor'}
                                  fontFamily={'counter'}
                                  fontSize={[4,'1.7em']}
                                  dangerouslySetInnerHTML={{ __html: this.state.portfolio.avgAPY.toFixed(2)+'<small>%</small>' }}
                                >
                                </Text>
                              ) : (
                                <Loader size="20px" />
                              )
                            }
                            <Flex
                              mt={2}
                              width={1}
                              alignItems={'center'}
                              flexDirection={'row'}
                              justifyContent={'center'}
                            >
                              <Text
                                fontWeight={2}
                                fontSize={[1,2]}
                                color={'cellText'}
                              >
                                Avg APY
                              </Text>
                              <Tooltip
                                placement={'bottom'}
                                message={this.functionsUtil.getGlobalConfig(['messages','apyLong'])}
                              >
                                <Icon
                                  ml={2}
                                  name={"Info"}
                                  size={'1em'}
                                  color={'cellTitle'}
                                />
                              </Tooltip>
                            </Flex>
                          </Flex>
                        </DashboardCard>
                      </Flex>
                      <Flex
                        pr={[0,2]}
                        width={[1,1/3]}
                        flexDirection={'column'}
                      >
                        <DashboardCard
                          cardProps={{
                            py:[3,0],
                            mb:[2,0],
                            display:'flex',
                            alignItems:'center',
                            height:['auto','125px'],
                            justifyContent:'center'
                          }}
                        >
                          <Flex
                            width={1}
                            alignItems={'center'}
                            flexDirection={'column'}
                            justifyContent={'center'}
                          >
                            {
                              this.state.portfolio ? (
                                <Flex
                                  alignItems={'center'}
                                  flexDirection={'column'}
                                  justifyContent={'center'}
                                >
                                  <TotalBalanceCounter
                                    decimals={5}
                                    {...this.props}
                                    portfolio={this.state.portfolio}
                                  />
                                  <Flex
                                    width={1}
                                    alignItems={'center'}
                                    flexDirection={'row'}
                                    justifyContent={'center'}
                                  >
                                    <Flex
                                      width={0.45}
                                      alignItems={'center'}
                                      justifyContent={'flex-end'}
                                    >
                                      <Text
                                        fontSize={1}
                                        fontWeight={3}
                                        fontFamily={this.props.theme.fonts.counter}
                                        color={this.props.theme.colors.transactions.status.completed}
                                      >
                                        +{this.state.portfolio.totalEarningsPerc.toFixed(2)}%
                                      </Text>
                                    </Flex>
                                    <Text
                                      mx={1}
                                      fontSize={1}
                                      fontWeight={3}
                                      fontFamily={this.props.theme.fonts.counter}
                                      color={this.props.theme.colors.transactions.status.completed}
                                    >|</Text>
                                    <Flex
                                      width={0.45}
                                      alignItems={'center'}
                                      justifyContent={'flex-start'}
                                    >
                                      <TotalEarningsCounter
                                        {...this.props}
                                        unit={'+$'}
                                        decimals={4}
                                        counterStyle={{
                                          fontSize:14,
                                          fontWeight:600,
                                          color:this.props.theme.colors.transactions.status.completed
                                        }}
                                        portfolio={this.state.portfolio}
                                      />
                                    </Flex>
                                  </Flex>
                                </Flex>
                              ) : (
                                <Loader size="20px" />
                              )
                            }
                            <Flex
                              width={1}
                              alignItems={'center'}
                              flexDirection={'row'}
                              justifyContent={'center'}
                            >
                              <Text
                                fontWeight={2}
                                fontSize={[1,2]}
                                color={'cellText'}
                              >
                                Total Balance
                              </Text>
                              {
                                /*
                                this.state.govTokensTotalBalance && (
                                  <Tooltip
                                    placement={'bottom'}
                                    message={'Total Balance does not include accrued governance tokens: '+(this.state.govTokensTotalBalance && this.state.govTokensTotalBalance.gt(0) ? ` (${this.state.govTokensTotalBalanceTooltip.join(' / ')})` : '')}
                                  >
                                    <Icon
                                      ml={2}
                                      name={"Info"}
                                      size={'1em'}
                                      color={'cellTitle'}
                                    />
                                  </Tooltip>
                                )
                                */
                              }
                            </Flex>
                          </Flex>
                        </DashboardCard>
                      </Flex>
                      <Flex
                        width={[1,1/3]}
                        flexDirection={'column'}
                      >
                        <DashboardCard
                          cardProps={{
                            py:[3,0],
                            mb:[2,0],
                            display:'flex',
                            alignItems:'center',
                            height:['auto','125px'],
                            justifyContent:'center'
                          }}
                        >
                          <Flex
                            width={1}
                            alignItems={'center'}
                            flexDirection={'column'}
                            justifyContent={'center'}
                          >
                            {
                              this.state.allocationChartData ? (
                                <Flex
                                  width={1}
                                  alignItems={'center'}
                                  id={'allocationChart'}
                                  height={['55px','59px']}
                                  flexDirection={'column'}
                                  justifyContent={'center'}
                                >
                                  <GenericPieChart
                                    {...this.props}
                                    inline={true}
                                    showLoader={false}
                                    tooltipFormat={v => v+'%'}
                                    sliceLabel={d => d.value+'%'}
                                    width={ this.props.isMobile ? 55 : 59 }
                                    height={ this.props.isMobile ? 55 : 59 }
                                    chartData={this.state.allocationChartData}
                                  />
                                </Flex>
                              ) : (
                                <Loader size="20px" />
                              )
                            }
                            <Flex
                              mt={2}
                              width={1}
                              alignItems={'center'}
                              flexDirection={'row'}
                              justifyContent={'center'}
                            >
                              <Text
                                fontWeight={2}
                                fontSize={[1,2]}
                                color={'cellText'}
                              >
                                Portfolio Distribution
                              </Text>
                              {
                                /*
                                <Tooltip
                                  placement={'bottom'}
                                  message={this.functionsUtil.getGlobalConfig(['messages','riskScoreShort'])}
                                >
                                  <Icon
                                    ml={2}
                                    name={"Info"}
                                    size={'1em'}
                                    color={'cellTitle'}
                                  />
                                </Tooltip>
                                */
                              }
                            </Flex>
                          </Flex>
                        </DashboardCard>
                      </Flex>
                    </Flex>
                    <Flex
                      mb={3}
                      width={1}
                      id={"portfolio-charts"}
                      justifyContent={'space-between'}
                      flexDirection={['column','row']}
                    >
                      <Flex
                        mb={[3,0]}
                        width={[1,0.328]}
                        flexDirection={'column'}
                        id={"portfolio-composition"}
                      >
                        <DashboardCard
                          title={'Composition'}
                          titleProps={ !this.props.isMobile ? {
                            style:{
                              minHeight:'39px'
                            }
                          } : null}
                        >
                          <GenericPieChart
                            {...this.props}
                            showLegend={true}
                            showLoader={false}
                            sliceLabel={d => d.value}
                            defaultLabel={'Total Funds'}
                            parentId={'portfolio-composition'}
                            chartData={this.state.portfolioDonutData}
                            defaultImage={`images/protocols/idle.svg`}
                            defaultValue={`$ ${this.functionsUtil.formatMoney(parseFloat(this.state.portfolio.totalBalance),4)}`}
                            margin={this.props.isMobile ? { top: 15, right: 25, bottom: 30, left: 25 } : { top: 30, right: 50, bottom: 60, left: 50 }}
                          />
                        </DashboardCard>
                      </Flex>
                      <Flex
                        width={[1,0.666]}
                        flexDirection={'column'}
                      >
                        <DashboardCard>
                          <Flex
                            pt={[3,4]}
                            px={[3,4]}
                            aligItems={'center'}
                            flexDirection={['column','row']}
                          >
                            <Flex
                              width={[1,0.7]}
                              flexDirection={'column'}
                              justifyContent={'flex-start'}
                            >
                              <Title
                                fontWeight={4}
                                fontSize={[2,3]}
                                textAlign={'left'}
                              >
                                Performance
                              </Title>
                            </Flex>
                            <Flex
                              mt={[2,0]}
                              width={[1,0.3]}
                              flexDirection={'column'}
                              justifyContent={'flex-end'}
                            >
                              <GenericSelector
                                innerProps={{
                                  p:0,
                                  px:1
                                }}
                                defaultValue={
                                  {value:'week',label:'1W'}
                                }
                                name={'performance-time'}
                                options={[
                                  {value:'week',label:'1W'},
                                  {value:'month',label:'1M'},
                                  {value:'month3',label:'3M'},
                                  {value:'month6',label:'6M'},
                                  {value:'all',label:'MAX'},
                                ]}
                                // onChange={ v => this.setPortfolioEquityQuickSelection(v) }
                              />
                            </Flex>
                          </Flex>
                          <Flex
                            ml={[0,3]}
                            aligItems={'center'}
                            justifyContent={'center'}
                            id={"portfolio-performance"}
                          >
                            {
                              /*
                              <PortfolioEquity
                                {...this.props}
                                enabledTokens={[]}
                                parentId={'portfolio-performance'}
                                parentIdHeight={'portfolio-composition'}
                                quickDateSelection={this.state.portfolioEquityQuickSelection}
                                frequencySeconds={this.functionsUtil.getFrequencySeconds('day',1)}
                              />
                              */
                            }
                          </Flex>
                        </DashboardCard>
                      </Flex>
                    </Flex>
                  </Flex>
                )
              }
              <Flex
                width={1}
                mb={[3,4]}
                id={"migrate-assets"}
                flexDirection={'column'}
              >
                <Flex
                  pb={2}
                  width={1}
                  mb={[2,3]}
                  borderColor={'divider'}
                  borderBottom={'1px solid transparent'}
                >
                  <Heading.h4
                    fontSize={[2,4]}
                    fontWeight={[3,4]}
                  >
                    Available Tranches
                  </Heading.h4>
                </Flex>
                <TranchesList
                  enabledProtocols={[]}
                  availableTranches={this.props.availableTranches}
                  handleClick={(props) => this.selectTranche(props.protocol,props.token)}
                  cols={[
                    {
                      title:'PROTOCOL',
                      props:{
                        width:[0.27,0.15]
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
                        }
                      ]
                    },
                    {
                      title:'TOKEN',
                      props:{
                        width:[0.21, 0.12],
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
                          name:'tokenName'
                        }
                      ]
                    },
                    {
                      title:'POOL',
                      props:{
                        width:[0.21, 0.12],
                      },
                      fields:[
                        {
                          name:'pool',
                          props:{
                            decimals:2
                          }
                        }
                      ]
                    },
                    {
                      title:'SENIOR APY',
                      props:{
                        width:[0.29,0.15],
                      },
                      parentProps:{
                        flexDirection:'column',
                        alignItems:'flex-start',
                      },
                      fields:[
                        {
                          name:'seniorApy',
                          showTooltip:true
                        },
                      ]
                    },
                    {
                      title:'JUNIOR APY',
                      props:{
                        width:[0.29,0.15],
                      },
                      parentProps:{
                        flexDirection:'column',
                        alignItems:'flex-start',
                      },
                      fields:[
                        {
                          name:'juniorApy',
                          showTooltip:true
                        },
                      ]
                    },
                    {
                      mobile:false,
                      title:'REWARD TOKENS',
                      props:{
                        width:[0.25,0.15],
                      },
                      fields:[
                        {
                          name:'govTokens'
                        }
                      ]
                    },
                    {
                      title:'',
                      mobile:this.props.account === null,
                      props:{
                        width:[ this.props.account === null ? 0.29 : 0 ,0.16],
                      },
                      parentProps:{
                        width:1
                      },
                      fields:[
                        {
                          name:'button',
                          label: 'Deposit',
                          props:{
                            width:1,
                            fontSize:3,
                            fontWeight:3,
                            height:'45px',
                            borderRadius:4,
                            boxShadow:null,
                            mainColor:'deposit',
                            size: this.props.isMobile ? 'small' : 'medium',
                            handleClick:(props) => this.selectTranche(props.protocol,props.token)
                          }
                        }
                      ]
                    }
                  ]}
                  {...this.props}
                />
              </Flex>
            </Box>
          )
        }
      </Box>
    );
  }
}

export default Tranches;
