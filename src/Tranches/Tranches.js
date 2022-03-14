import Title from '../Title/Title';
import React, { Component } from 'react';
import Breadcrumb from '../Breadcrumb/Breadcrumb';
import FlexLoader from '../FlexLoader/FlexLoader';
import TranchePage from '../TranchePage/TranchePage';
import FunctionsUtil from '../utilities/FunctionsUtil';
import TranchesList from '../TranchesList/TranchesList';
import DashboardCard from '../DashboardCard/DashboardCard';
import TrancheWelcome from '../TrancheWelcome/TrancheWelcome';
import GenericPieChart from '../GenericPieChart/GenericPieChart';
import GenericSelector from '../GenericSelector/GenericSelector';
import TransactionsList from '../TransactionsList/TransactionsList';
import TotalBalanceCounter from '../TotalBalanceCounter/TotalBalanceCounter';
import TotalEarningsCounter from '../TotalEarningsCounter/TotalEarningsCounter';
import AssetsUnderManagement from "../AssetsUnderManagement/AssetsUnderManagement";
import { Box, Flex, Heading, Loader, Text, Icon, Tooltip, Image } from "rimble-ui";
import PortfolioEquityTranches from '../PortfolioEquityTranches/PortfolioEquityTranches';

class Tranches extends Component {

  state = {
    portfolio:null,
    transactions:[],
    tokenConfig:null,
    trancheType:null,
    trancheRoute:null,
    selectedToken:null,
    userHasFunds:false,
    depositedTokens:[],
    remainingTokens:[],
    depositedTranches:{},
    remainingTranches:{},
    trancheDetails:null,
    useTrancheType:false,
    portfolioLoaded:false,
    componentLoaded:false,
    selectedProtocol:null,
    allocationChartData:null,
    portfolioEquityQuickSelection:'week'
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

    this.loadPortfolio().then( () => {
      const componentLoaded = true;
      const trancheRoute = this.props.urlParams.param1;
      const tranchesDetails = this.functionsUtil.getGlobalConfig(['tranches']);
      const trancheDetails = Object.values(tranchesDetails).find( t => t.route === trancheRoute );

      if (trancheDetails !== undefined) {
        const trancheType = trancheDetails.type;
        const useTrancheType = !this.state.userHasFunds;
        const selectedToken = this.props.urlParams.param3;
        const selectedProtocol = this.props.urlParams.param2;
        const tokenConfig = selectedProtocol ? (this.props.availableTranches[selectedProtocol] && this.props.availableTranches[selectedProtocol][selectedToken] ? this.props.availableTranches[selectedProtocol][selectedToken] : null) : null;

        if (this.state.userHasFunds && !tokenConfig){
          return this.props.goToSection(this.props.selectedSection.route);
        }

        this.setState({
          trancheType,
          tokenConfig,
          trancheRoute,
          selectedToken,
          trancheDetails,
          useTrancheType,
          selectedProtocol
        });
      } else {
        const selectedToken = this.props.urlParams.param2;
        const selectedProtocol = this.props.urlParams.param1;
        const tokenConfig = this.props.availableTranches[selectedProtocol] && this.props.availableTranches[selectedProtocol][selectedToken] ? this.props.availableTranches[selectedProtocol][selectedToken] : null;
        if (tokenConfig){
          this.setState({
            tokenConfig,
            selectedToken,
            selectedProtocol
          });
        }
      }

      this.setState({
        componentLoaded
      });
    });
  }

  async componentDidMount(){
  }

  async componentDidUpdate(prevProps, prevState) {
    this.loadUtils();

    const accountChanged = prevProps.account !== this.props.account;
    const availableTranchesChanged = JSON.stringify(prevProps.availableTranches) !== JSON.stringify(this.props.availableTranches);
    if (accountChanged || availableTranchesChanged){
      this.setState({
        portfolioLoaded:false
      },() => {
        this.loadPortfolio();
      });
    }
  }

  async loadPortfolio(){
    if (!this.props.account){
      const userHasFunds = false;
      const portfolioLoaded = true;
      this.setState({
        userHasFunds,
        portfolioLoaded
      });
      return false;
    }

    const portfolio = await this.functionsUtil.getAccountPortfolioTranches(this.props.availableTranches,this.props.account);

    if (portfolio){
      const tranchesTokens = [];
      const tranchesBalances = [];
      
      const remainingTranches = {};
      const depositedTranches={};
      const portfolioLoaded = true;
      const tranchesConfig = this.functionsUtil.getGlobalConfig(['tranches']);

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

      const depositedTokens = Object.keys(tranchesTokens);
      
      Object.keys(this.props.availableTranches).forEach(protocol=>{
        Object.keys(this.props.availableTranches[protocol]).forEach(tranche=>
          {
          if(depositedTokens.includes(tranche))
            {
              if(!depositedTranches[protocol])
                depositedTranches[protocol]={}

              depositedTranches[protocol][tranche]={}
              depositedTranches[protocol][tranche]=this.props.availableTranches[protocol][tranche]
          }
          else{
            if(!remainingTranches[protocol])
              remainingTranches[protocol]={}
            remainingTranches[protocol][tranche]={}
            remainingTranches[protocol][tranche]=this.props.availableTranches[protocol][tranche]
          }
        })

      })

      const portfolioDonutData = Object.keys(tranchesTokens).map( token => {
        const balanceValue = parseFloat(tranchesTokens[token].toFixed(4));
        const tokenPercentage = tranchesTokens[token].div(portfolio.totalBalance).times(100);
        const tokenConfig = this.functionsUtil.getGlobalConfig(['stats','tokens',token.toUpperCase()]);
        return {
          id:token,
          name:token,
          label:token,
          valueHoverProps:{
            unit:'$',
            unitPos:'left',
            unitProps:{
              mr:2,
              fontWeight:4,
              fontSize:[3,4]
            }
          },
          valueHover:balanceValue,
          value:Math.round(tokenPercentage),
          description: `$ ${balanceValue} in ${token}`,
          color:'hsl('+tokenConfig.color.hsl.join(',')+')',
          image:tokenConfig && tokenConfig.icon ? tokenConfig.icon : `images/tokens/${token.toUpperCase()}.svg`,
        };
      });

      // Add Staking rewards to Portfolio Donut
      Object.keys(portfolio.stakingRewards).forEach( token => {
        const balanceValue = parseFloat(portfolio.stakingRewards[token].tokenAmountConverted.toFixed(4));
        const tokenPercentage = portfolio.stakingRewards[token].tokenAmountConverted.div(portfolio.totalBalance).times(100);
        const tokenConfig = this.functionsUtil.getGlobalConfig(['stats','tokens',token.toUpperCase()]);
        const govTokenConfig = this.functionsUtil.getGlobalConfig(['govTokens',token]);
        if (govTokenConfig.showBalance){
          portfolioDonutData.push({
            id:token,
            name:token,
            label:token,
            valueHoverProps:{
              unit:'$',
              unitPos:'left',
              unitProps:{
                mr:2,
                fontWeight:4,
                fontSize:[3,4]
              }
            },
            valueHover:balanceValue,
            value:Math.round(tokenPercentage),
            description: `$ ${balanceValue} in ${token}`,
            color:'hsl('+tokenConfig.color.hsl.join(',')+')',
            image:tokenConfig && tokenConfig.icon ? tokenConfig.icon : `images/tokens/${token.toUpperCase()}.svg`,
          });
        }
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

      // console.log('allocationChartData',allocationChartData,'portfolioDonutData',portfolioDonutData);
      
      const transactions = portfolio.transactions;
      const userHasFunds = portfolio && this.functionsUtil.BNify(portfolio.totalBalance).gt(0);

      // console.log('loadPortfolio - userHasFunds',portfolio,userHasFunds);

      this.setState({
        depositedTranches,
        remainingTranches,
        portfolio,
        userHasFunds,
        transactions,
        portfolioLoaded,
        depositedTokens,
        portfolioDonutData,
        allocationChartData,
      });
    }
  }

  selectTrancheType(trancheRoute){
    let route = `${this.props.selectedSection.route}/${trancheRoute}`;
    const tokenConfig = this.props.availableTranches[this.state.selectedProtocol] && this.props.availableTranches[this.state.selectedProtocol][this.state.selectedToken] ? this.props.availableTranches[this.state.selectedProtocol][this.state.selectedToken] : null;
    if (tokenConfig){
      route += `/${this.state.selectedProtocol}/${this.state.selectedToken}`;
    }
    this.props.goToSection(route);
  }
  selectTrancheAndType(type,protocol,token){
    let trancheRoute=null
    if (type==="AA")
     trancheRoute="senior"
    else
       trancheRoute="junior"
    let route = `${this.props.selectedSection.route}/${trancheRoute}`
    const tokenConfig = this.props.availableTranches[protocol] && this.props.availableTranches[protocol][token] ? this.props.availableTranches[protocol][token] : null;
    if(tokenConfig){
      route += `/${protocol}/${token}`;
    }
    this.props.goToSection(route);
  }

  selectTranche(protocol,token){
    const tokenConfig = this.props.availableTranches[protocol] && this.props.availableTranches[protocol][token] ? this.props.availableTranches[protocol][token] : null;
    if (tokenConfig){
      let route = `${this.props.selectedSection.route}`;
      if (this.state.trancheRoute){
        route += `/${this.state.trancheRoute}`;
      }
      route += `/${protocol}/${token}`;

      this.props.goToSection(route);
    }
  }

  setPortfolioEquityQuickSelection(portfolioEquityQuickSelection){
    this.setState({
      portfolioEquityQuickSelection
    });
  }

  goBack(){
    if (this.state.tokenConfig && this.state.trancheType){
      if (!this.state.userHasFunds){
        this.props.goToSection(this.props.selectedSection.route+'/'+this.state.trancheDetails.route);
      } else {
        this.props.goToSection(this.props.selectedSection.route+'/'+this.state.selectedProtocol+'/'+this.state.selectedToken);
      }
    }/* else if (this.state.trancheType){
      this.props.goToSection(this.props.selectedSection.route);
    } */else {
      this.props.goToSection(this.props.selectedSection.route);
    }
  }

  render() {

    const pathLink = [];
    const breadcrumbPath = [];
    if (this.state.trancheType){
      breadcrumbPath.push(this.functionsUtil.capitalize(this.state.trancheDetails.baseName));
      if (this.state.tokenConfig){
        if (!this.state.userHasFunds){
          pathLink.push(this.props.selectedSection.route+'/'+this.state.trancheDetails.route);
        } else if (this.state.tokenConfig){
          pathLink.push(this.props.selectedSection.route+'/'+this.state.selectedProtocol+'/'+this.state.selectedToken);
        }
      }
    }
    if (this.state.selectedProtocol){
      breadcrumbPath.push(this.functionsUtil.getGlobalConfig(['stats','protocols',this.state.selectedProtocol,'label']));
    }
    if (this.state.selectedToken){
      breadcrumbPath.push(this.state.selectedToken);
    }
    //console.log("dep2",this.state.depositedTokens)

    return (
      <Box
        width={1}
      >
        {
          breadcrumbPath.length>0 && (
            <Flex
              width={1}
              mb={[2,0]}
              alignItems={'center'}
              flexDirection={'row'}
              justifyContent={'flex-start'}
            >
              <Flex
                width={0.5}
              >
                <Breadcrumb
                  {...this.props}
                  text={'Tranches'}
                  pathLink={pathLink}
                  path={breadcrumbPath}
                  isMobile={this.props.isMobile}
                  handleClick={this.goBack.bind(this)}
                />
              </Flex>
              <Flex
                width={0.5}
                justifyContent={'flex-end'}
              >
                
              </Flex>
            </Flex>
          )
        }
        {
          !this.state.componentLoaded ? (
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
                my:3,
                minHeight:'60vh',
                flexDirection:'column'
              }}
              text={'Loading Portfolio...'}
            />
          ) : this.state.tokenConfig ? (
            <TranchePage
              {...this.props}
              portfolio={this.state.portfolio}
              trancheType={this.state.trancheType}
              tokenConfig={this.state.tokenConfig}
              userHasFunds={this.state.userHasFunds}
              selectedToken={this.state.selectedToken}
              trancheDetails={this.state.trancheDetails}
              loadPortfolio={this.loadPortfolio.bind(this)}
              selectedProtocol={this.state.selectedProtocol}
              availableTranches={this.props.availableTranches}
              selectTrancheType={this.selectTrancheType.bind(this)}
            />
          ) : !this.state.trancheType && !this.state.userHasFunds ? (
            <TrancheWelcome
              {...this.props}
              selectTrancheType={this.selectTrancheType.bind(this)}
            />
          ) : (
            <Box
              width={1}
            >
              {this.state.useTrancheType ? (
                <Box
                  width={1}
                >
                  <AssetsUnderManagement
                    {...this.props}
                    flexProps={{
                      mb:[3,0]
                    }}
                    loaderAlign={'flex-end'}
                    subtitle={'Total Value Locked on Tranches'}
                    aggregatedStatsMethod={this.functionsUtil.getTrancheAggregatedStats}
                  />
                  <Flex
                    mb={3}
                    width={1}
                    alignItems={'center'}
                    flexDirection={'row'}
                    justifyContent={'center'}
                  >
                    <Image
                      mr={2}
                      src={this.state.trancheDetails.image}
                      size={this.props.isMobile ? '1.8em' : '2.2em'}
                    />
                    <Title
                    >
                      {this.functionsUtil.capitalize(this.state.trancheDetails.baseName)} Tranches
                    </Title>
                  </Flex>
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
                      {this.functionsUtil.getGlobalConfig(['tranches',this.state.trancheType,'description','long'])}
                    </Text>
                  </Flex>
                </Box>
              ) : (
                <Box
                  width={1}
                >
                  <AssetsUnderManagement
                    {...this.props}
                    flexProps={{
                      mb:[3,0]
                    }}
                    loaderAlign={'flex-end'}
                    subtitle={'Total Value Locked on Tranches'}
                    aggregatedStatsMethod={this.functionsUtil.getTrancheAggregatedStats}
                  />
                  <Title
                    mb={3}
                  >
                    Perpetual Yield Tranches
                  </Title>
                </Box>
              )}
              {
                this.state.portfolioLoaded && this.state.userHasFunds && (
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
                                        decimals={5}
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
                            legendProps={{
                              itemWidth:80,
                              itemsSpacing:8
                            }}
                            tooltipFormat={v => v+'%'}
                            defaultLabel={'Total Funds'}
                            sliceLabel={d => {
                              if (parseFloat(d.value)>=5){
                                return d.value+'%';
                              } else {
                                return null;
                              }
                            }}
                            parentId={'portfolio-composition'}
                            chartData={this.state.portfolioDonutData}
                            defaultImage={this.props.selectedSection.image}
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
                            <PortfolioEquityTranches
                              {...this.props}
                              enabledTokens={[]}
                              parentId={'portfolio-performance'}
                              parentIdHeight={'portfolio-composition'}
                              transactionsList={this.state.transactions}
                              quickDateSelection={this.state.portfolioEquityQuickSelection}
                              frequencySeconds={this.functionsUtil.getFrequencySeconds('day',1)}
                            />
                          </Flex>
                        </DashboardCard>
                      </Flex>
                    </Flex>
                  </Flex>
                )
              }
              {
                this.state.depositedTokens.length!==0&&
                (
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
                    Deposited Tranches
                  </Heading.h4>
                </Flex>
                <TranchesList
                  enabledProtocols={[]}
                  trancheType={this.state.trancheType}
                  handleClick={(props) => this.selectTranche(props.protocol,props.token)}
                  colsProps={{
                    fontSize:['10px','14px'],
                  }}
                  cols={[
                    {
                      title:'PROTOCOL', 
                      props:{
                        width:[0.34, this.state.useTrancheType ? 0.15 : 0.13]
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
                        width:[0.15, 0.13],
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
                    
                    /*
                    {
                      title:'TYPE',
                      props:{
                        width:[0.29,0.13],
                      },
                      fields:[
                        {
                          name:'trancheTypeIcon',
                          props:{
                            flexProps:{
                              mr:2
                            },
                            size:'1.4em'
                          }
                        },
                        {
                          name:'trancheType'
                        }
                      ],
                      visible:this.state.useTrancheType
                    },
                    */
                    {
                      title:'POOL',
                      props:{
                        width:[0.25, this.state.useTrancheType ? 0.1 : 0.09],
                      },
                      fields:[
                        {
                          name:this.state.useTrancheType ? `${this.state.trancheDetails.baseName}PoolNoLabel` : 'pool',
                          props:{
                            minPrecision:1,
                            decimals:this.props.isMobile ? 0 : 2,
                          }
                        }
                      ]
                    },
                    {
                      title:this.state.useTrancheType ? 'APY' : 'SENIOR APY',
                      desc:this.functionsUtil.getGlobalConfig(['messages','apyTranches']),
                      visible:!this.state.useTrancheType || this.state.trancheType === 'AA',
                      props:{
                        width:[this.state.useTrancheType ? 0.16 : 0.27,this.state.useTrancheType ? 0.09 : 0.11],
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
                      ],
                    },
                    {
                      title:this.state.useTrancheType ? 'APY' : 'JUNIOR APY',
                      desc:this.functionsUtil.getGlobalConfig(['messages','apyTranches']),
                      visible:!this.state.useTrancheType || this.state.trancheType === 'BB',
                      props:{
                        width:[this.state.useTrancheType ? 0.16 : 0.27,this.state.useTrancheType ? 0.09 : 0.11],
                      },
                      parentProps:{
                        flexDirection:'column',
                        alignItems:'flex-start',
                      },
                      fields:[
                        {
                          name:'juniorApy',
                          props:{
                            flexProps:{
                              mr:3
                            }
                          },
                          showTooltip:true
                        },
                      ],
                    },
                    {
                      mobile:false,
                      title:'APR RATIO',
                      desc:this.functionsUtil.getGlobalConfig(['messages','aprRatio']),
                      props:{
                        width:[0.15, 0.1],
                      },
                      fields:[
                        {
                          name:'trancheAPRSplitRatio',
                          props:{
                            flexProps:{
                              mr:2
                            },
                            height:['1.4em','2em']
                          }
                        },
                        
                      ]
                    },
                    {
                      mobile:false,
                      title:'AUTO-COMPOUNDING',
                      desc:this.functionsUtil.getGlobalConfig(['messages','autoFarming']),
                      props:{
                        width:[0.25,0.17],
                      },
                      fields:[
                        {
                          name:'autoFarming'
                        }
                      ]
                    },
                    {
                      mobile:false,
                      title:'STAKING REWARDS',
                      desc:this.functionsUtil.getGlobalConfig(['messages','stakingRewards']),
                      props:{
                        width:[0.25,this.state.useTrancheType ? 0.15 : 0.13],
                      },
                      fields:[
                        {
                          name:'stakingRewards'
                        }
                      ]
                    },
                    /*
                    {
                      mobile:true,
                      title:'TOKENS',
                      props:{
                        width:[0.16,0.17],
                      },
                      fields:[
                        {
                          name:'govTokens'
                        }
                      ]
                    },
                    */
                    {
                      title:'',
                      mobile:false,
                      props:{
                        width:[0.29, 0.15],
                      },
                      parentProps:{
                        width:1
                      },
                      fields:[
                        {
                          name:'button',
                          label: 'Manage',
                          props:{
                            width:1,
                            fontSize:3,
                            fontWeight:3,
                            height:'45px',
                            borderRadius:4,
                            boxShadow:null,
                            mainColor:'redeem',
                            size: this.props.isMobile ? 'small' : 'medium',
                            handleClick:(props) => this.selectTranche(props.protocol,props.token)
                          }
                        }
                      ]
                    }
                  ]}
                  {...this.props}
                  availableTranches={this.state.depositedTranches}
                />
              </Flex>
              )}
              {(Object.keys(this.state.remainingTranches).length!==0||!this.state.account)&&
                (
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
                  trancheType={this.state.trancheType}
                  handleClick={(props) => this.selectTranche(props.protocol,props.token)}
                  colsProps={{
                    fontSize:['10px','14px'],
                  }}
                  cols={[
                    {
                      title:'PROTOCOL', 
                      props:{
                        width:[0.34, this.state.useTrancheType ? 0.15 : 0.13]
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
                        width:[0.15, 0.13],
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
                    
                    /*
                    {
                      title:'TYPE',
                      props:{
                        width:[0.29,0.13],
                      },
                      fields:[
                        {
                          name:'trancheTypeIcon',
                          props:{
                            flexProps:{
                              mr:2
                            },
                            size:'1.4em'
                          }
                        },
                        {
                          name:'trancheType'
                        }
                      ],
                      visible:this.state.useTrancheType
                    },
                    */
                    {
                      title:'POOL',
                      props:{
                        width:[0.25, this.state.useTrancheType ? 0.1 : 0.09],
                      },
                      fields:[
                        {
                          name:this.state.useTrancheType ? `${this.state.trancheDetails.baseName}PoolNoLabel` : 'pool',
                          props:{
                            minPrecision:1,
                            decimals:this.props.isMobile ? 0 : 2,
                          }
                        }
                      ]
                    },
                    {
                      title:this.state.useTrancheType ? 'APY' : 'SENIOR APY',
                      desc:this.functionsUtil.getGlobalConfig(['messages','apyTranches']),
                      visible:!this.state.useTrancheType || this.state.trancheType === 'AA',
                      props:{
                        width:[this.state.useTrancheType ? 0.16 : 0.27,this.state.useTrancheType ? 0.09 : 0.11],
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
                      ],
                    },
                    {
                      title:this.state.useTrancheType ? 'APY' : 'JUNIOR APY',
                      desc:this.functionsUtil.getGlobalConfig(['messages','apyTranches']),
                      visible:!this.state.useTrancheType || this.state.trancheType === 'BB',
                      props:{
                        width:[this.state.useTrancheType ? 0.16 : 0.27,this.state.useTrancheType ? 0.09 : 0.11],
                      },
                      parentProps:{
                        flexDirection:'column',
                        alignItems:'flex-start',
                      },
                      fields:[
                        {
                          name:'juniorApy',
                          props:{
                            flexProps:{
                              mr:3
                            }
                          },
                          showTooltip:true
                        },
                      ],
                    },
                    {
                      mobile:false,
                      title:'APR RATIO',
                      desc:this.functionsUtil.getGlobalConfig(['messages','aprRatio']),
                      props:{
                        width:[0.15, 0.1],
                      },
                      fields:[
                        {
                          name:'trancheAPRSplitRatio',
                          props:{
                            flexProps:{
                              mr:2
                            },
                            height:['1.4em','2em']
                          }
                        },
                        
                      ]
                    },
                    {
                      mobile:false,
                      title:'AUTO-COMPOUNDING',
                      desc:this.functionsUtil.getGlobalConfig(['messages','autoFarming']),
                      props:{
                        width:[0.25,0.17],
                      },
                      fields:[
                        {
                          name:'autoFarming'
                        }
                      ]
                    },
                    {
                      mobile:false,
                      title:'STAKING REWARDS',
                      desc:this.functionsUtil.getGlobalConfig(['messages','stakingRewards']),
                      props:{
                        width:[0.25,this.state.useTrancheType ? 0.15 : 0.13],
                      },
                      fields:[
                        {
                          name:'stakingRewards'
                        }
                      ]
                    },
                    /*
                    {
                      mobile:true,
                      title:'TOKENS',
                      props:{
                        width:[0.16,0.17],
                      },
                      fields:[
                        {
                          name:'govTokens'
                        }
                      ]
                    },
                    */
                    {
                      title:'',
                      mobile:false,
                      props:{
                        width:[0.29, 0.15],
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
                  availableTranches={this.state.depositedTokens.length!==0?this.state.remainingTranches:this.props.availableTranches}

                />
              </Flex>
              )
              }
              {
                this.props.account && this.state.userHasFunds && 
                  <Flex
                    mb={[3,4]}
                    width={1}
                    id={'transactions'}
                    flexDirection={'column'}
                  >
                    <Title mb={[3,4]}>Transactions</Title>
                    <TransactionsList
                      {...this.props}
                      enabledTokens={this.state.depositedTokens}
                      transactionsList={this.state.transactions}
                      availableActions={this.state.transactions.reduce( (availableActions,t) => {
                        availableActions[t.action.toLowerCase()] = t.action;
                        return availableActions;
                      },{})}
                      cols={[
                        {
                          title: this.props.isMobile ? '' : 'HASH',
                          props:{
                            width:[0.13,0.18]
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
                            width:0.12,
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
                            width:[0.27,0.15],
                          },
                          fields:[
                            {
                              name:'date'
                            }
                          ]
                        },
                        {
                          mobile:false,
                          title:'STATUS',
                          props:{
                            width:[0.18,0.16],
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
                            width:[0.23,0.11],
                          },
                          fields:[
                            {
                              name:'amount'
                            },
                          ]
                        },
                        {
                          title:'PROTOCOL',
                          props:{
                            width:[0.21, 0.14],
                          },
                          fields:[
                            {
                              type:'image',
                              name:'custom',
                              path:['protocolIcon'],
                              props:{
                                mr:2,
                                height:['1.4em','2em']
                              }
                            },
                            {
                              type:'text',
                              mobile:false,
                              name:'custom',
                              path:['protocol']
                            }
                          ]
                        },
                        {
                          title:'ASSET',
                          props:{
                            width:[0.16,0.14],
                            justifyContent:['center','flex-start']
                          },
                          fields:[
                            {
                              name:'tokenIcon',
                              props:{
                                mr:[0,2],
                                height:['1.4em','2em']
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

export default Tranches;
