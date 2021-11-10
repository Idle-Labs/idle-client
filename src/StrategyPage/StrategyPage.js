import Title from '../Title/Title';
import React, { Component } from 'react';
import FlexLoader from '../FlexLoader/FlexLoader';
import AssetsList from '../AssetsList/AssetsList';
// import RoundButton from '../RoundButton/RoundButton';
import FunctionsUtil from '../utilities/FunctionsUtil';
import DashboardCard from '../DashboardCard/DashboardCard';
import PortfolioDonut from '../PortfolioDonut/PortfolioDonut';
import ActiveCoverages from '../ActiveCoverages/ActiveCoverages';
import GenericSelector from '../GenericSelector/GenericSelector';
import PortfolioEquity from '../PortfolioEquity/PortfolioEquity';
import TransactionsList from '../TransactionsList/TransactionsList';
import EarningsEstimation from '../EarningsEstimation/EarningsEstimation';
import { Flex, Box, Heading, Text, Tooltip, Icon, Loader } from "rimble-ui";
import DashboardIconButton from '../DashboardIconButton/DashboardIconButton';
import TotalBalanceCounter from '../TotalBalanceCounter/TotalBalanceCounter';
import TotalEarningsCounter from '../TotalEarningsCounter/TotalEarningsCounter';
import PolygonBridgeTransactions from '../PolygonBridgeTransactions/PolygonBridgeTransactions';

// const env = process.env;

class StrategyPage extends Component {

  state = {
    portfolio:null,
    depositedTokens:[],
    tokensToMigrate:{},
    aggregatedValues:[],
    remainingTokens:null,
    batchedDeposits:null,
    portfolioLoaded:false,
    portfolioLoading:false,
    availableGovTokens:null,
    portfolioEquityStartDate:null,
    batchedDepositsAvailableTokens:null,
    portfolioEquityQuickSelection:'week',
  };

  // Utils
  functionsUtil = null;
  componentUnmounted = false;

  loadUtils(){
    if (this.functionsUtil){
      this.functionsUtil.setProps(this.props);
    } else {
      this.functionsUtil = new FunctionsUtil(this.props);
    }
  }

  componentWillMount(){
    this.loadUtils();
  }

  componentWillUnmount(){
    this.componentUnmounted = true;
  }

  async componentDidMount(){
    await this.loadPortfolio();
  }

  async componentDidUpdate(prevProps, prevState) {
    this.loadUtils();

    const accountChanged = prevProps.account !== this.props.account;
    const availableTokensChanged = JSON.stringify(prevProps.availableTokens) !== JSON.stringify(this.props.availableTokens);
    if (accountChanged || availableTokensChanged){
      this.setStateSafe({
        portfolioLoaded:false
      },() => {
        this.loadPortfolio();
      });
    }
  }

  async setStateSafe(newState,callback=null) {
    if (!this.componentUnmounted){
      return await this.setState(newState,callback);
    }
    return null;
  }

  setPortfolioEquityQuickSelection(portfolioEquityQuickSelection){
    this.setStateSafe({
      portfolioEquityQuickSelection
    });
  }

  async loadPortfolio(){
    const availableTokens = this.props.availableTokens || {};
    // const currentNetwork = this.functionsUtil.getRequiredNetwork();

    if (this.state.portfolioLoaded || this.state.portfolioLoading){
      return false;
    }

    await this.setStateSafe({
      portfolioLoading:true
    });

    // Load portfolio if account is set
    if (this.props.account){
      const newState = {};
      const firstBlockNumber = this.functionsUtil.getGlobalConfig(['network','firstBlockNumber']);

      // Load data
      const [
        batchedDeposits,
        portfolio,
      ] = await Promise.all([
        // Load claimable batches
        [],//this.functionsUtil.getBatchedDeposits(this.props.account),
        // Load portfolio
        this.functionsUtil.getAccountPortfolio(availableTokens,this.props.account),
        // Load and process Etherscan Txs
        this.functionsUtil.getEtherscanTxs(this.props.account,firstBlockNumber,'latest',Object.keys(availableTokens))
      ]);

      newState.portfolio = portfolio;

      newState.batchedDeposits = batchedDeposits && Object.keys(batchedDeposits).length>0 ? batchedDeposits : null;

      if (newState.batchedDeposits){
        newState.batchedDepositsAvailableTokens = Object.keys(newState.batchedDeposits).reduce( (batchedDepositsAvailableTokens,token) => {
          const batchInfo = newState.batchedDeposits[token];
          const tokenConfig = this.functionsUtil.getGlobalConfig(['tools','batchDeposit','props','availableTokens',token]);
          if (tokenConfig.strategy === this.props.selectedStrategy){
            switch (batchInfo.status){
              case 'pending':
                tokenConfig.statusIcon = 'Timelapse';
                tokenConfig.statusIconProps = {
                  color:this.props.theme.colors.transactions.status.pending
                };
              break;
              case 'executed':
                tokenConfig.statusIcon = 'Done';
                tokenConfig.statusIconProps = {
                  color:this.props.theme.colors.transactions.status.completed
                };
              break;
              default:
              break;
            }
            tokenConfig.token = token;
            tokenConfig.status = batchInfo.status;
            tokenConfig.deposited = batchInfo.batchDeposits;
            tokenConfig.redeemable = batchInfo.batchRedeems;
            batchedDepositsAvailableTokens[tokenConfig.baseToken] = tokenConfig;
          }
          return batchedDepositsAvailableTokens;
        },{});
      }

      newState.depositedTokens = [];
      newState.tokensToMigrate = [];

      if (portfolio){
        const depositedTokens = Object.keys(portfolio.tokensBalance).filter(token => ( this.functionsUtil.BNify(portfolio.tokensBalance[token].idleTokenBalance).gt(0) ));

        newState.depositedTokens = depositedTokens;

        const isRisk = this.props.selectedStrategy === 'risk';

        let avgAPY = this.functionsUtil.BNify(0);
        // let avgScore = this.functionsUtil.BNify(0);
        let totalAmountLent = this.functionsUtil.BNify(0);
        // let totalBalanceWithScore = this.functionsUtil.BNify(0);

        await this.functionsUtil.asyncForEach(depositedTokens,async (token) => {
          const tokenConfig = availableTokens[token];

          const [
            tokenAprs,
            // tokenScore,
            amountLent,
          ] = await Promise.all([
            this.functionsUtil.getTokenAprs(tokenConfig),
            // this.functionsUtil.getTokenScore(tokenConfig,isRisk),
            this.functionsUtil.getAmountDeposited(tokenConfig,this.props.account)
          ]);

          const amountLentToken = await this.functionsUtil.convertTokenBalance(amountLent,token,tokenConfig,isRisk);

          const tokenBalance = portfolio.tokensBalance[token].tokenBalance;
          const tokenWeight = tokenBalance.div(portfolio.totalBalance);
          const tokenAPY = tokenAprs.avgApy && !this.functionsUtil.BNify(tokenAprs.avgApy).isNaN() ? this.functionsUtil.BNify(tokenAprs.avgApy) : this.functionsUtil.BNify(0);

          if (!tokenAPY.isNaN()){
            avgAPY = avgAPY.plus(tokenAPY.times(tokenWeight));
          }

          // if (!tokenScore.isNaN() && tokenScore.gt(0)){
          //   avgScore = avgScore.plus(tokenScore.times(tokenBalance));
          //   totalBalanceWithScore = totalBalanceWithScore.plus(tokenBalance);
          // }

          if (amountLentToken){
            totalAmountLent = totalAmountLent.plus(amountLentToken);
          }
        });

        // if (!totalBalanceWithScore.isNaN() && totalBalanceWithScore.gt(0)){
        //   avgScore = avgScore.div(totalBalanceWithScore);
        // }

        // console.log('avgAPY',avgAPY.toFixed());

        // Add gov tokens to earnings
        const govTokensTotalBalance = await this.functionsUtil.getGovTokensUserTotalBalance(this.props.account,availableTokens,'DAI');
        const govTokensUserBalance = await this.functionsUtil.getGovTokensUserBalances(this.props.account,availableTokens,null);
        const govTokensTotalBalanceTooltip = govTokensUserBalance ? Object.keys(govTokensUserBalance).map( govToken => {
          const balance = govTokensUserBalance[govToken];
          if (balance.gt(0)){
            return `+${balance.toFixed(2)} ${govToken}`;
          } else {
            return null;
          }
        }).filter(v => (v !== null)) : null;

        newState.avgAPY = avgAPY;
        // newState.avgScore = avgScore;
        newState.tokensToMigrate = portfolio.tokensToMigrate;
        newState.govTokensTotalBalance = govTokensTotalBalance;
        newState.govTokensTotalBalanceTooltip = govTokensTotalBalanceTooltip;
      }

      newState.portfolioLoaded = true;
      newState.portfolioLoading = false;
      
      const remainingTokens = Object.keys(availableTokens).filter(token => (!newState.depositedTokens.includes(token) && !Object.keys(newState.tokensToMigrate).includes(token)) );
      newState.remainingTokens = remainingTokens;

      // Portfolio loaded
      this.setStateSafe(newState);
    // Show available assets for not logged users
    } else {
      this.setStateSafe({
        tokensToMigrate:{},
        depositedTokens:[],
        portfolioLoaded:true,
        portfolioLoading:false,
        remainingTokens:Object.keys(availableTokens),
      });
    }
  }

  render(){
    const viewOnly = this.props.connectorName === 'custom';
    const currentNetwork = this.functionsUtil.getRequiredNetwork();
    const govTokens = this.functionsUtil.getGlobalConfig(['govTokens']);
    const apyLong = this.functionsUtil.getGlobalConfig(['messages','apyLong']);
    const yieldFarming = this.functionsUtil.getGlobalConfig(['messages','yieldFarming']);
    const nexusMutualConfig = this.functionsUtil.getGlobalConfig(['tools','nexusMutual']);
    const batchDepositConfig = this.functionsUtil.getGlobalConfig(['tools','batchDeposit']);
    const polygonBridgeConfig = this.functionsUtil.getGlobalConfig(['tools','polygonBridge']);
    const strategyName = this.functionsUtil.getGlobalConfig(['strategies',this.props.selectedStrategy,'title']);

    return (
      <Box
        width={1}
      >
        <Title
          mb={3}
        >
          {strategyName} strategy
        </Title>
        {
          /*
          currentNetwork.id === 137 ? (
            <Flex
              width={1}
              minHeight={'45vh'}
              alignItems={'center'}
              flexDirection={'row'}
              justifyContent={'center'}
            >
              <DashboardCard
                cardProps={{
                  p:3,
                  width:[1,0.5],
                }}
              >
                <Flex
                  aligItems={'center'}
                  alignItems={'center'}
                  flexDirection={'column'}
                >
                  <Icon
                    size={'2.3em'}
                    color={'cellText'}
                    name={'AccessTime'}
                  />
                  <Text
                    mt={2}
                    fontSize={2}
                    color={'cellText'}
                    textAlign={'center'}
                  >
                    Hang on, please!<br />The {strategyName} strategy has not yet been activated in Polygon.
                  </Text>
                  <RoundButton
                    buttonProps={{
                      mt:3,
                      width:[1,1/2]
                    }}
                    handleClick={e => this.props.goToSection(`stake`)}
                  >
                    Go to Staking
                  </RoundButton>
                </Flex>
              </DashboardCard>
            </Flex>
          ) :
          */
          !this.state.portfolioLoaded ? (
            <FlexLoader
              textProps={{
                textSize:4,
                fontWeight:2
              }}
              loaderProps={{
                mb:3,
                size:'40px'
              }}
              flexProps={{
                minHeight:'50vh',
                flexDirection:'column'
              }}
              text={'Loading portfolio...'}
            />
          ) : (
            <Box
              width={1}
            >
              {
                this.props.account && this.state.depositedTokens.length>0 ? (
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
                              this.state.avgAPY ? (
                                <Text
                                  lineHeight={1}
                                  fontWeight={[3,4]}
                                  color={'copyColor'}
                                  fontFamily={'counter'}
                                  fontSize={[4,'1.7em']}
                                  dangerouslySetInnerHTML={{ __html: this.state.avgAPY.toFixed(2)+'<small>%</small>' }}
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
                                    mt={1}
                                    width={1}
                                    alignItems={'center'}
                                    flexDirection={'row'}
                                    justifyContent={'center'}
                                  >
                                    {
                                      /*
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
                                      */
                                    }
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
                              this.state.portfolio ? (
                                <Text
                                  lineHeight={1}
                                  fontWeight={[3,4]}
                                  color={'copyColor'}
                                  fontFamily={'counter'}
                                  fontSize={[4,'1.7em']}
                                  dangerouslySetInnerHTML={{ __html: '<small>+</small>'+this.state.portfolio.totalEarningsPerc.toFixed(2)+'<small>%</small>' }}
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
                                Total Profit
                              </Text>
                              <Tooltip
                                placement={'bottom'}
                                message={this.functionsUtil.getGlobalConfig(['messages','totalProfitPerc'])}
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
                    </Flex>
                    <Flex
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
                          <PortfolioDonut
                            {...this.props}
                            parentId={'portfolio-composition'}
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
                                onChange={ v => this.setPortfolioEquityQuickSelection(v) }
                              />
                            </Flex>
                          </Flex>
                          <Flex
                            ml={[0,3]}
                            aligItems={'center'}
                            justifyContent={'center'}
                            id={"portfolio-performance"}
                          >
                            <PortfolioEquity
                              {...this.props}
                              enabledTokens={[]}
                              parentId={'portfolio-performance'}
                              parentIdHeight={'portfolio-composition'}
                              quickDateSelection={this.state.portfolioEquityQuickSelection}
                              frequencySeconds={this.functionsUtil.getFrequencySeconds('day',1)}
                            />
                          </Flex>
                        </DashboardCard>
                      </Flex>
                    </Flex>
                  </Flex>
                ) : (
                  <Flex
                    mb={3}
                    mx={'auto'}
                    width={[1,0.8]}
                    aligItems={'center'}
                    justifyContent={'center'}
                  >
                    <Text
                      fontWeight={2}
                      fontSize={[1,2]}
                      textAlign={'center'}
                    >
                      {
                        this.props.isMobile ?
                          this.functionsUtil.getGlobalConfig(['strategies',this.props.selectedStrategy,'descShort'])
                        :
                          this.functionsUtil.getGlobalConfig(['strategies',this.props.selectedStrategy,'descLong'])
                      }
                    </Text>
                  </Flex>
                )
              }
              {
                !viewOnly && this.state.depositedTokens.length>0 && this.props.account && nexusMutualConfig.enabled && (
                  <Flex
                    mt={3}
                    width={1}
                    id={"tools"}
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
                        Tools
                      </Heading.h4>
                    </Flex>
                    <Flex
                      flexDirection={['column','row']}
                    >
                      {
                        ['addFunds','nexusMutual','tokenSwap'].map( (toolName,toolIndex) => {
                          const toolConfig = this.functionsUtil.getGlobalConfig(['tools',toolName]);
                          return (
                            <Flex
                              width={[1,1/3]}
                              key={`tool_${toolIndex}`}
                              mb={toolIndex<2 ? [2,0] : 0}
                              pr={toolIndex<2 ? [0,3] : 0}
                            >
                              <DashboardIconButton
                                {...this.props}  
                                icon={toolConfig.icon}
                                text={toolConfig.desc}
                                image={toolConfig.image}
                                title={toolConfig.label}
                                handleClick={ e => this.props.goToSection(`tools/${toolConfig.route}`) }
                              />
                            </Flex>
                          );
                        })
                      }
                    </Flex>
                  </Flex>
                )
              }
              {
                nexusMutualConfig.enabled && nexusMutualConfig.availableNetworks.includes(currentNetwork.id) && this.state.portfolio && this.state.portfolio.totalBalance.gt(0) && (
                  <Flex
                    width={1}
                    id={'active-coverages'}
                    flexDirection={'column'}
                  >
                    <ActiveCoverages
                      {...this.props}
                      title={'Coverage'}
                      titleProps={{
                        my:4
                      }}
                    />
                  </Flex>
                )
              }
              {
                this.state.batchedDeposits && (
                  <Flex
                    width={1}
                    mb={[0,3]}
                    id={'batched-deposits'}
                    flexDirection={'column'}
                  >
                    <Title my={[3,4]}>Batched Deposits</Title>
                    <Flex
                      width={1}
                      flexDirection={'column'}
                    >
                      <AssetsList
                        enabledTokens={Object.keys(this.state.batchedDepositsAvailableTokens)}
                        cols={[
                          {
                            title:'TOKEN',
                            props:{
                              width:[0.3,0.2]
                            },
                            fields:[
                              {
                                name:'icon',
                                props:{
                                  mr:2,
                                  height:['1.4em','2.3em']
                                }
                              },
                              {
                                name:'tokenName'
                              }
                            ]
                          },
                          {
                            mobile:false,
                            title:'DEPOSITED',
                            props:{
                              width:[0.33, 0.21],
                            },
                            fields:[
                              {
                                name:'custom',
                                type:'number',
                                path:['deposited'],
                                props:{
                                  decimals: 4
                                }
                              },
                              {
                                name:'tokenName',
                                props:{
                                  ml:2
                                }
                              }
                            ]
                          },
                          {
                            title:'REDEEMABLE',
                            props:{
                              width:[0.44,0.23],
                              justifyContent:['center','flex-start']
                            },
                            fields:[
                              {
                                name:'custom',
                                type:'number',
                                path:['redeemable'],
                                props:{
                                  decimals: 4
                                }
                              },
                              {
                                type:'text',
                                name:'custom',
                                path:['token'],
                                props:{
                                  ml:2
                                }
                              }
                            ]
                          },
                          {
                            title:'STATUS',
                            props:{
                              width:[0.26,0.19],
                              justifyContent:['center','flex-start']
                            },
                            fields:[
                              {
                                type:'icon',
                                mobile:false,
                                name:'custom',
                                path:['statusIcon'],
                                props:{
                                  mr:2,
                                  size:this.props.isMobile ? '1.2em' : '1.8em'
                                }
                              },
                              {
                                name:'custom',
                                path:['status'],
                                props:{
                                  style:{
                                    textTransform:'capitalize'
                                  }
                                }
                              }
                            ]
                          },
                          {
                            title:'',
                            visibleOnDesktop:true,
                            mobile:this.props.account === null,
                            props:{
                              width:[0.35,0.17],
                            },
                            parentProps:{
                              width:1
                            },
                            fields:[
                              {
                                name:'button',
                                label:'Claim',
                                funcProps:{
                                  disabled:(props) => (props.tokenConfig.status === 'pending')
                                },
                                props:{
                                  width:1,
                                  fontSize:3,
                                  fontWeight:3,
                                  height:'45px',
                                  borderRadius:4,
                                  boxShadow:null,
                                  mainColor:'migrate',
                                  size: this.props.isMobile ? 'small' : 'medium',
                                  handleClick:(props) => this.props.goToSection(`tools/${batchDepositConfig.route}/${props.tokenConfig.token}`)
                                }
                              }
                            ]
                          }
                        ]}
                        {...this.props}
                        availableTokens={this.state.batchedDepositsAvailableTokens}
                      />
                    </Flex>
                  </Flex>
                )
              }
              <Flex
                width={1}
                id={'available-assets'}
                flexDirection={'column'}
                mb={!this.state.depositedTokens.length ? 4 : 0}
              >
                {
                  (this.state.depositedTokens.length>0 || Object.keys(this.state.tokensToMigrate).length>0 || this.state.remainingTokens.length>0 ) &&
                    <Title my={[3,4]}>Available assets</Title>
                }
                <Flex width={1} flexDirection={'column'}>
                  {
                    Object.keys(this.state.tokensToMigrate).length>0 &&
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
                          Assets to migrate
                        </Heading.h4>
                      </Flex>
                      <AssetsList
                        enabledTokens={Object.keys(this.state.tokensToMigrate)}
                        handleClick={(props) => this.props.changeToken(props.token)}
                        cols={[
                          {
                            title:'CURRENCY',
                            props:{
                              width:[0.27,0.15]
                            },
                            fields:[
                              {
                                name:'icon',
                                props:{
                                  mr:2,
                                  height:['1.4em','2.3em']
                                }
                              },
                              {
                                name:'tokenName'
                              }
                            ]
                          },
                          {
                            title:'POOL',
                            visibleOnDesktop:true,
                            mobile:this.props.account !== null,
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
                            title:'APY',
                            desc:apyLong,
                            props:{
                              width:[0.26,0.15],
                            },
                            parentProps:{
                              flexDirection:'column',
                              alignItems:'flex-start',
                            },
                            fields:[
                              {
                                name:'apy',
                                showTooltip:true
                              },
                              {
                                showLoader:false,
                                name:'idleDistribution',
                                props:{
                                  decimals:this.props.isMobile ? 1 : 2,
                                  fontSize:this.props.isMobile ? '9px' : 0
                                },
                                visible:currentNetwork.provider==='infura' ? true : false
                              },
                            ]
                          },
                          {
                            title:'OLD APY',
                            props:{
                              width:[0.26,0.12],
                            },
                            fields:[
                              {
                                name:'oldApy'
                              }
                            ]
                          },
                          {
                            title:'BALANCE',
                            mobile:false,
                            props:{
                              width:[0.16,0.14],
                            },
                            parentProps:{
                              width:1,
                              pr:[2,4]
                            },
                            fields:[
                              {
                                name:'amountToMigrate',
                              }
                            ]
                          },
                          {
                            mobile:false,
                            title:'FARMING',
                            desc:yieldFarming,
                            props:{
                              width:[0.25,0.15],
                              textAlign:'center'
                            },
                            fields:[
                              {
                                name:'govTokens'
                              }
                            ]
                          },
                          {
                            title:'',
                            visibleOnDesktop:true,
                            mobile:this.props.account === null,
                            props:{
                              width:[ this.props.account === null ? 0.29 : 0 ,0.17],
                            },
                            parentProps:{
                              width:1
                            },
                            fields:[
                              {
                                name:'button',
                                label: 'Migrate',
                                props:{
                                  width:1,
                                  fontSize:3,
                                  fontWeight:3,
                                  height:'45px',
                                  borderRadius:4,
                                  boxShadow:null,
                                  mainColor:'migrate',
                                  size: this.props.isMobile ? 'small' : 'medium',
                                  handleClick:(props) => this.props.changeToken(props.token)
                                }
                              }
                            ]
                          }
                        ]}
                        {...this.props}
                      />
                    </Flex>
                  }
                  {
                  this.state.depositedTokens.length>0 &&
                    <Flex
                      mb={ this.state.remainingTokens.length>0 ? [3,4] : 0 }
                      width={1}
                      id={"deposited-assets"}
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
                          Deposited assets
                        </Heading.h4>
                      </Flex>
                      <AssetsList
                        enabledTokens={this.state.depositedTokens}
                        handleClick={(props) => this.props.changeToken(props.token)}
                        cols={[
                          {
                            title:'CURRENCY',
                            props:{
                              width:[0.27,0.13]
                            },
                            fields:[
                              {
                                name:'icon',
                                props:{
                                  mr:2,
                                  height:['1.4em','2.3em']
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
                              width:[0.21,0.11],
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
                            title:'APY',
                            desc:apyLong,
                            props:{
                              width:[0.30,0.16],
                            },
                            parentProps:{
                              flexDirection:'column',
                              alignItems:'flex-start',
                            },
                            fields:[
                              {
                                name:'apy',
                                showTooltip:true
                              },
                              {
                                name:'idleDistribution',
                                showLoader:false,
                                props:{
                                  decimals:this.props.isMobile ? 1 : 2,
                                  fontSize:this.props.isMobile ? '9px' : 0
                                },
                                visible:currentNetwork.provider==='infura' ? true : false
                              },
                            ]
                          },
                          {
                            title:'DEPOSITED',
                            props:{
                              width:[0.22,0.15],
                              justifyContent:['center','flex-start']
                            },
                            fields:[
                              {
                                name:'amountLent'
                              }
                            ]
                          },
                          {
                            mobile:false,
                            title:'FARMING',
                            desc:yieldFarming,
                            props:{
                              width:[0.25,0.13],
                              textAlign:'center'
                            },
                            fields:[
                              {
                                name:'govTokens',
                                props:{
                                  decimals:2
                                }
                              }
                            ]
                          },
                          {
                            mobile:false,
                            title:'EARNINGS',
                            props:{
                              width:[0.15,0.15],
                              textAlign:'center'
                            },
                            parentProps:{
                              alignItems:'center',
                              flexDirection:'column',
                            },
                            fields:[
                              {
                                name:'earnings',
                                props:{
                                  decimals:3
                                }
                              },
                              {
                                name:'earningsPerc',
                                showLoader:false,
                                showDirection:false,
                                props:{
                                  fontSize:0,
                                  decimals:3
                                }
                              }
                            ]
                          },
                          /*
                          {
                            title:'EARNINGS %',
                            props:{
                              width:[0.27,0.14],
                            },
                            fields:[
                              {
                                name:'earningsPerc'
                              }
                            ]
                          },
                          */
                          {
                            title:'',
                            mobile:false,
                            props:{
                              width:0.17,
                            },
                            parentProps:{
                              width:1
                            },
                            fields:[
                              {
                                name:'button',
                                label:'Manage',
                                props:{
                                  width:1,
                                  fontSize:3,
                                  fontWeight:3,
                                  height:'45px',
                                  borderRadius:4,
                                  boxShadow:null,
                                  mainColor:'redeem',
                                  size: this.props.isMobile ? 'small' : 'medium',
                                  handleClick:(props) => this.props.changeToken(props.token)
                                }
                              }
                            ]
                          }
                        ]}
                        {...this.props}
                      />
                    </Flex>
                  }
                  {
                    this.state.remainingTokens.length>0 &&
                    <Flex id="remaining-assets" width={1} flexDirection={'column'}>
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
                          Available assets
                        </Heading.h4>
                      </Flex>
                      <AssetsList
                        enabledTokens={this.state.remainingTokens}
                        handleClick={(props) => this.props.changeToken(props.token)}
                        cols={[
                          {
                            title:'CURRENCY',
                            props:{
                              width:[0.27,0.13]
                            },
                            fields:[
                              {
                                name:'icon',
                                props:{
                                  mr:2,
                                  height:['1.4em','2.3em']
                                }
                              },
                              {
                                name:'tokenName'
                              }
                            ]
                          },
                          {
                            mobile:true,
                            title:'POOL',
                            visibleOnDesktop:true,
                            props:{
                              width:[0.21, 0.13],
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
                            title:'APY',
                            desc:apyLong,
                            props:{
                              width:[0.31,0.16],
                            },
                            parentProps:{
                              flexDirection:'column',
                              alignItems:'flex-start',
                            },
                            fields:[
                              {
                                name:'apy',
                                showTooltip:true
                              },
                              {
                                name:'idleDistribution',
                                showLoader:false,
                                props:{
                                  decimals:this.props.isMobile ? 1 : 2,
                                  fontSize:this.props.isMobile ? '9px' : 0
                                },
                                visible:currentNetwork.provider==='infura' ? true : false
                              },
                            ]
                          },
                          {
                            title:'FARMING',
                            visibleOnDesktop:true,
                            mobile:this.props.account !== null,
                            desc:yieldFarming,
                            props:{
                              width:[0.22,0.16],
                              textAlign:'center'
                            },
                            fields:[
                              {
                                name:'govTokens',
                                props:{
                                  decimals:2
                                }
                              }
                            ]
                          },
                          {
                            title:'APR LAST WEEK',
                            mobile:false,
                            props:{
                              width:0.25,
                            },
                            parentProps:{
                              width:1,
                              pr:[2,4]
                            },
                            fields:[
                              {
                                name:'aprChart',
                                style:{
                                  overflow:'visible',
                                },
                              }
                            ]
                          },
                          {
                            title:'',
                            visibleOnDesktop:true,
                            mobile:this.props.account === null,
                            props:{
                              width:[ this.props.account === null ? 0.26 : 0 , 0.17],
                            },
                            parentProps:{
                              width:1
                            },
                            fields:[
                              {
                                name:'button',
                                label: (props) => {
                                  return Object.keys(this.state.tokensToMigrate).includes(props.token) ? 'Migrate' : 'Deposit';
                                },
                                props:{
                                  width:1,
                                  fontSize:3,
                                  fontWeight:3,
                                  height:'45px',
                                  borderRadius:4,
                                  boxShadow:null,
                                  size: this.props.isMobile ? 'small' : 'medium',
                                  handleClick:(props) => this.props.changeToken(props.token)
                                },
                                funcProps:{
                                  mainColor: (props) => {
                                    return Object.keys(this.state.tokensToMigrate).includes(props.token) ? 'migrate' : 'deposit'
                                  }
                                }
                              }
                            ]
                          }
                        ]}
                        {...this.props}
                      />
                    </Flex>
                  }
                </Flex>
              </Flex>
              {
                this.state.depositedTokens.length>0 &&
                  <Flex
                    width={1}
                    id={"yield-farming"}
                    flexDirection={'column'}
                  >
                    <Title my={[3,4]}>Yield Farming</Title>
                    <AssetsList
                      enabledTokens={Object.keys(this.functionsUtil.getGovTokensFarming())}
                      cols={[
                        {
                          title:'TOKEN',
                          props:{
                            width:[0.3,0.15]
                          },
                          fields:[
                            {
                              name:'icon',
                              props:{
                                mr:2,
                                height:['1.4em','2.3em']
                              }
                            },
                            {
                              name:'tokenName'
                            }
                          ]
                        },
                        {
                          mobile:false,
                          title:'BALANCE',
                          props:{
                            width:[0.33, 0.25],
                          },
                          fields:[
                            {
                              name:'tokenBalance',
                              props:{
                                decimals: this.props.isMobile ? 6 : 8
                              }
                            }
                          ]
                        },
                        {
                          title:'REDEEMABLE',
                          desc:this.functionsUtil.getGlobalConfig(['messages','govTokenRedeemableBalance']),
                          props:{
                            width:[0.35,0.30],
                            justifyContent:['center','flex-start']
                          },
                          fields:[
                            {
                              name:'redeemableBalance',
                              props:{
                                decimals: this.props.isMobile ? 6 : 8
                              }
                            },
                          ]
                        },
                        {
                          title:'DISTRIBUTION',
                          desc:this.functionsUtil.getGlobalConfig(['messages','userDistributionSpeed']),
                          props:{
                            width:[0.35,0.30],
                          },
                          fields:[
                            {
                              name:'userDistributionSpeed',
                              props:{
                                decimals:6
                              }
                            }
                          ]
                        },
                        /*
                        {
                          mobile:false,
                          title:'APR',
                          desc:this.functionsUtil.getGlobalConfig(['messages','govTokenApr']),
                          props:{
                            width:[0.2,0.15],
                          },
                          fields:[
                            {
                              name:'apr',
                            }
                          ]
                        },
                        {
                          title:'TOKEN PRICE',
                          desc:this.functionsUtil.getGlobalConfig(['messages','tokenPrice']),
                          mobile:false,
                          props:{
                            width: 0.17,
                          },
                          parentProps:{
                            width:1,
                            pr:[2,4]
                          },
                          fields:[
                            {
                              name:'tokenPrice',
                              props:{
                                unit:'$',
                                unitPos:'left',
                                unitProps:{
                                  mr:1,
                                  fontWeight:3,
                                  fontSize:[0,2],
                                  color:'cellText'
                                }
                              }
                            }
                          ]
                        },
                        */
                      ]}
                      {...this.props}
                      availableTokens={govTokens}
                    />
                  </Flex>
              }
              {
                this.state.depositedTokens.length>0 &&
                  <Flex
                    width={1}
                    id="earnings-estimation"
                    flexDirection={'column'}
                  >
                    <Title my={[3,4]}>Estimated earnings</Title>
                    <EarningsEstimation
                      {...this.props}
                      enabledTokens={this.state.depositedTokens}
                    />
                  </Flex>
              }
              {
                this.props.account && polygonBridgeConfig.enabled && polygonBridgeConfig.availableNetworks.includes(currentNetwork.id) && (
                  <Flex
                    width={1}
                    flexDirection={'column'}
                    id={'polygon-transactions'}
                  >
                    <PolygonBridgeTransactions
                      {...this.props}
                      title={'Polygon Bridge Transactions'}
                      titleProps={{
                        my:4
                      }}
                    />
                  </Flex>
                )
              }
              {
                this.props.account && this.state.depositedTokens.length>0 && 
                  <Flex
                    mb={[3,4]}
                    width={1}
                    id={'transactions'}
                    flexDirection={'column'}
                  >
                    <Title my={[3,4]}>Transactions</Title>
                    <TransactionsList
                      {...this.props}
                      enabledTokens={[]}
                      cols={[
                        {
                          title: this.props.isMobile ? '' : 'HASH',
                          props:{
                            width:[0.15,0.24]
                          },
                          fields:[
                            {
                              name:'icon',
                              props:{
                                mr:[0,2]
                              }
                            },
                            {
                              name:'hash',
                              mobile:false
                            }
                          ]
                        },
                        {
                          title:'ACTION',
                          mobile:false,
                          props:{
                            width:0.15,
                          },
                          fields:[
                            {
                              name:'action'
                            }
                          ]
                        },
                        {
                          title:'DATE',
                          props:{
                            width:[0.32,0.23],
                          },
                          fields:[
                            {
                              name:'date'
                            }
                          ]
                        },
                        {
                          title:'STATUS',
                          props:{
                            width:[0.18,0.22],
                            justifyContent:['center','flex-start']
                          },
                          fields:[
                            {
                              name:'statusIcon',
                              props:{
                                mr:[0,2]
                              }
                            },
                            {
                              mobile:false,
                              name:'status'
                            }
                          ]
                        },
                        {
                          title:'AMOUNT',
                          props:{
                            width:0.19,
                          },
                          fields:[
                            {
                              name:'amount'
                            },
                          ]
                        },
                        {
                          title:'ASSET',
                          props:{
                            width:[0.15,0.20],
                            justifyContent:['center','flex-start']
                          },
                          fields:[
                            {
                              name:'tokenIcon',
                              props:{
                                mr:[0,2],
                                height:['1.4em','1.6em']
                              }
                            },
                            {
                              mobile:false,
                              name:'tokenName'
                            },
                          ]
                        },
                      ]}
                    />
                  </Flex>
              }
            </Box>
          )
        }
      </Box>
    );
  }
}

export default StrategyPage;