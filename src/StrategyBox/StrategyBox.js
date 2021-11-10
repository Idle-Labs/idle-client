import Title from '../Title/Title';
import React, { Component } from 'react';
import AssetField from '../AssetField/AssetField';
import FunctionsUtil from '../utilities/FunctionsUtil';
import TrancheField from '../TrancheField/TrancheField';
import DashboardCard from '../DashboardCard/DashboardCard';
import { Flex, Text, Link, Icon, Tooltip, Image, Loader } from "rimble-ui";

class StrategyBox extends Component {

  state = {
    network:null,
    selectedToken:null
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

    const strategyInfo = this.functionsUtil.getGlobalConfig(['landingStrategies',this.props.strategy]);
    // Over-ride required network id
    const network = Object.assign({},this.props.network);
    network.required = Object.assign({},this.props.network.required);
    network.current = Object.assign({},this.props.network.current);

    network.required.id = strategyInfo.networkId;
    network.required.name = this.functionsUtil.getGlobalConfig(['network','availableNetworks',strategyInfo.networkId,'name']);

    // console.log('StrategyBox',this.props.strategy,strategyInfo.strategy,strategyInfo.networkId,this.props.network.required,network.required);

    this.setState({
      network
    },() => {
      this.loadData();
    });
  }

  componentDidMount(){
  }

  async componentDidUpdate(prevProps,prevState){
    this.loadUtils();

    const contractsInitialized = !prevProps.contractsInitialized && this.props.contractsInitialized;
    if (contractsInitialized){
      this.loadData();
    }
  }

  loadData = async () => {

    const strategyInfo = this.functionsUtil.getGlobalConfig(['landingStrategies',this.props.strategy]);

    // console.log('loadData - contractsInitialized',this.props.contractsInitialized);

    if (!this.props.contractsInitialized){
      return false;
    }

    let aprs = {};
    const tokensAprs = {};
    let highestValue = null;
    let selectedToken = null;
    const availableTokens = this.props.availableStrategies[this.props.strategy];
    
    switch (strategyInfo.type){
      case 'tranche':
        selectedToken = strategyInfo.token;
      break;
      default:
      case 'strategy':
        switch (this.props.strategy){
          case 'best':
            aprs = await this.functionsUtil.getAprsFromApi(strategyInfo.networkId);
            if (aprs){
              aprs.lendRates.forEach( aprInfo => {
                const tokenAPR = this.functionsUtil.BNify(aprInfo.apy);
                if (tokenAPR){
                  const token = aprInfo.tokenSymbol;
                  tokensAprs[token] = tokenAPR;
                  if (!highestValue || highestValue.lt(tokenAPR)){
                    highestValue = tokenAPR;
                    selectedToken = token;
                  }
                }
              });
            } else {
              await this.functionsUtil.asyncForEach(Object.keys(availableTokens),async (token) => {
                const tokenConfig = availableTokens[token];
                const tokenAPR = await this.functionsUtil.getTokenAprs(tokenConfig);
                if (tokenAPR && tokenAPR.avgApr !== null){
                  tokensAprs[token] = tokenAPR.avgApr;
                  if (!highestValue || highestValue.lt(tokenAPR.avgApr)){
                    highestValue = tokenAPR.avgApr;
                    selectedToken = token;
                  }
                }
              });
            }
          break;
          case 'polygon':
            aprs = await this.functionsUtil.getAprsFromApi(strategyInfo.networkId);
            if (aprs){
              aprs.lendRates.forEach( aprInfo => {
                const tokenAPR = this.functionsUtil.BNify(aprInfo.apy);
                if (tokenAPR){
                  const token = aprInfo.tokenSymbol;
                  tokensAprs[token] = tokenAPR;
                  if (!highestValue || highestValue.lt(tokenAPR)){
                    highestValue = tokenAPR;
                    selectedToken = token;
                  }
                }
              });
            } else {
              await this.functionsUtil.asyncForEach(Object.keys(availableTokens),async (token) => {
                const tokenConfig = availableTokens[token];
                const tokenAPR = await this.functionsUtil.getTokenAprs(tokenConfig);
                if (tokenAPR && tokenAPR.avgApr !== null){
                  tokensAprs[token] = tokenAPR.avgApr;
                  if (!highestValue || highestValue.lt(tokenAPR.avgApr)){
                    highestValue = tokenAPR.avgApr;
                    selectedToken = token;
                  }
                }
              });
            }
          break;
          case 'risk':
          default:
            selectedToken = strategyInfo.token;
          break;
        }
      break;
    }

    // console.log('loadData',strategyInfo.type,this.props.strategy,strategyInfo.strategy,selectedToken);

    this.setState({
      selectedToken
    });
  }

  render() {
    const strategyInfo = this.functionsUtil.getGlobalConfig(['landingStrategies',this.props.strategy]);
    const strategyUrl = strategyInfo.url ? strategyInfo.url : '/#'+this.functionsUtil.getGlobalConfig(['dashboard','baseRoute'])+'/'+this.props.strategy;
    // const chartColor = strategyInfo.chartColor ? strategyInfo.chartColor : null;
    let tokenConfig = null;
    switch (strategyInfo.type){
      case 'tranche':
        tokenConfig = this.props.availableTranches[strategyInfo.protocol][strategyInfo.token];
      break;
      default:
      case 'strategy':
        tokenConfig = this.state.selectedToken ? this.props.availableStrategiesNetworks[strategyInfo.networkId][strategyInfo.strategy][this.state.selectedToken] : null;
      break;
    }

    // console.log('StrategyBox',strategyInfo.type,strategyInfo.strategy,this.state.selectedToken,strategyInfo.networkId,this.props.network.required,this.state.network.required);

    return (
      <DashboardCard
        cardProps={{
          pt:[3,3],
          mt:[3,0],
          ml:['0.35em',0],
          width:[1,'21em'],
          mr:['0.35em','2em'],
          alignItems:'center',
          flexDirection:'column',
          justifyContent:'flex-start',
          height:['fit-content','400px']
        }}
        isVisible={ typeof this.props.isVisible !== 'undefined' ? this.props.isVisible : true }
      >
        <Flex
          mb={2}
          justifyContent={'center'}
        >
          <Image
            src={strategyInfo.icon}
            height={['2.2em','2.8em']}
          />
        </Flex>
        <Flex
          my={2}
          alignItems={'center'}
          justifyContent={'center'}
        >
          <Title
            fontWeight={5}
            fontSize={[4,'1.7em']}
          >
            {strategyInfo.title}
          </Title>
        </Flex>
        <Flex
          mt={2}
          mb={[2,3]}
          minHeight={'50px'}
          alignItems={'flex-start'}
          justifyContent={'center'}
        >
          <Text
            px={[3,4]}
            fontWeight={500}
            textAlign={'center'}
          >
            {strategyInfo.desc}
          </Text>
        </Flex>
        {
          strategyInfo.comingSoon ? (
            <Flex
              mt={3}
              mb={[0,3]}
              height={'126px'}
              flexDirection={'row'}
              justifyContent={'center'}
              alignItems={['flex-end','end']}
            >
              <Image
                width={1}
                src={'/images/strategy-placeholder.jpg'}
              />
            </Flex>
          ) : strategyInfo.type === 'strategy' ? (
            <Flex
              mt={[0,3]}
              flexDirection={'row'}
              alignItems={'flex-start'}
              justifyContent={'center'}
              minHeight={['69px','88px']}
            >
              <Flex
                width={0.5}
                alignItems={'center'}
                flexDirection={'column'}
                justifyContent={'center'}
                borderRight={`1px solid ${this.props.theme.colors.divider}`}
              >
                <Flex
                  width={1}
                  alignItems={'center'}
                  justifyContent={'center'}
                >
                  <Text
                    fontSize={2}
                    fontWeight={4}
                    color={'cellText'}
                    textAlign={'center'}
                  >
                    APY
                  </Text>
                  <Tooltip
                    placement={'bottom'}
                    message={this.functionsUtil.getGlobalConfig(['messages','apyLong'])}
                  >
                    <Icon
                      ml={1}
                      name={"Info"}
                      size={'1em'}
                      color={'cellTitle'}
                    />
                  </Tooltip>
                </Flex>
                <AssetField
                  fieldInfo={{
                    name:'apy',
                    showTooltip:false,
                    props:{
                      decimals:2,
                      fontWeight:4,
                      color:'copyColor',
                      textAlign:'center',
                      fontSize:[3,'1.8em'],
                      flexProps:{
                        justifyContent:'center'
                      }
                    },
                  }}
                  {...this.props}
                  tokenConfig={tokenConfig}
                  network={this.state.network}
                  token={this.state.selectedToken}
                  selectedStrategy={strategyInfo.strategy}
                />
                <AssetField
                  fieldInfo={{
                    showLoader:false,
                    name:'idleDistribution',
                    props:{
                      decimals:2,
                      fontWeight:2,
                      fontSize:[0,1],
                      color:'cellText',
                      textAlign:'center',
                      flexProps:{
                        justifyContent:'center'
                      }
                    },
                  }}
                  {...this.props}
                  tokenConfig={tokenConfig}
                  network={this.state.network}
                  token={this.state.selectedToken}
                  selectedStrategy={strategyInfo.strategy}
                />
              </Flex>
              <Flex
                width={0.5}
                alignItems={'center'}
                flexDirection={'column'}
                justifyContent={'center'}
              >
                <Flex
                  width={1}
                  alignItems={'center'}
                  justifyContent={'center'}
                >
                  <Text
                    fontSize={2}
                    fontWeight={4}
                    color={'cellText'}
                    textAlign={'center'}
                  >
                    TOKEN
                  </Text>
                </Flex>
                {
                  tokenConfig ? (
                    <Flex
                      alignItems={'center'}
                      flexDirection={'row'}
                    >
                      <AssetField
                        fieldInfo={{
                          name:'icon',
                          props:{
                            mr:[1,2],
                            fontWeight:4,
                            textAlign:'center',
                            size: this.props.isMobile ? '1.4em' : '1.8em'
                          },
                        }}
                        {...this.props}
                        tokenConfig={tokenConfig}
                        network={this.state.network}
                        token={this.state.selectedToken}
                        selectedStrategy={strategyInfo.strategy}
                      />
                      <AssetField
                        fieldInfo={{
                          name:'tokenName',
                          props:{
                            fontWeight:4,
                            color:'copyColor',
                            textAlign:'center',
                            fontSize:[3,'1.6em'],
                            flexProps:{
                              justifyContent:'center'
                            }
                          },
                        }}
                        {...this.props}
                        tokenConfig={tokenConfig}
                        network={this.state.network}
                        token={this.state.selectedToken}
                        selectedStrategy={strategyInfo.strategy}
                      />
                    </Flex>
                  ) : (
                    <Flex
                      alignItems={'center'}
                      flexDirection={'row'}
                    >
                      <Loader size="20px" />
                    </Flex>
                  )
                }
              </Flex>
            </Flex>
          ) : strategyInfo.type === 'tranche' && (
            <Flex
              mt={[0,3]}
              flexDirection={'row'}
              alignItems={'flex-start'}
              justifyContent={'center'}
              minHeight={['69px','88px']}
            >
              <Flex
                width={0.5}
                alignItems={'center'}
                flexDirection={'column'}
                justifyContent={'center'}
                borderRight={`1px solid ${this.props.theme.colors.divider}`}
              >
                <Flex
                  width={1}
                  alignItems={'center'}
                  justifyContent={'center'}
                >
                  <Text
                    fontSize={2}
                    fontWeight={4}
                    color={'cellText'}
                    textAlign={'center'}
                  >
                    Senior APY
                  </Text>
                  <Tooltip
                    placement={'bottom'}
                    message={this.functionsUtil.getGlobalConfig(['tranches','AA','description','deposit'])}
                  >
                    <Icon
                      ml={1}
                      name={"Info"}
                      size={'1em'}
                      color={'cellTitle'}
                    />
                  </Tooltip>
                </Flex>
                <TrancheField
                  fieldInfo={{
                    name:'seniorApy',
                    showTooltip:false,
                    props:{
                      decimals:2,
                      fontWeight:4,
                      color:'copyColor',
                      textAlign:'center',
                      fontSize:[3,'1.8em'],
                      flexProps:{
                        justifyContent:'center'
                      }
                    },
                  }}
                  {...this.props}
                  tokenConfig={tokenConfig}
                  token={strategyInfo.token}
                  network={this.state.network}
                  tranche={strategyInfo.tranche}
                  protocol={strategyInfo.protocol}
                />
                <TrancheField
                  fieldInfo={{
                    showLoader:false,
                    name:'trancheIDLEDistribution',
                    props:{
                      decimals:2,
                      fontWeight:2,
                      fontSize:[0,1],
                      color:'cellText',
                      textAlign:'center',
                      flexProps:{
                        justifyContent:'center'
                      }
                    },
                  }}
                  {...this.props}
                  tokenConfig={tokenConfig}
                  token={strategyInfo.token}
                  network={this.state.network}
                  trancheConfig={tokenConfig.AA}
                  tranche={strategyInfo.tranche}
                  protocol={strategyInfo.protocol}
                />
              </Flex>
              <Flex
                width={0.5}
                alignItems={'center'}
                flexDirection={'column'}
                justifyContent={'center'}
              >
                <Flex
                  width={1}
                  alignItems={'center'}
                  justifyContent={'center'}
                >
                  <Text
                    fontSize={2}
                    fontWeight={4}
                    color={'cellText'}
                    textAlign={'center'}
                  >
                    Junior APY
                  </Text>
                  <Tooltip
                    placement={'bottom'}
                    message={this.functionsUtil.getGlobalConfig(['tranches','BB','description','deposit'])}
                  >
                    <Icon
                      ml={1}
                      name={"Info"}
                      size={'1em'}
                      color={'cellTitle'}
                    />
                  </Tooltip>
                </Flex>
                <TrancheField
                  fieldInfo={{
                    name:'juniorApy',
                    showTooltip:false,
                    props:{
                      decimals:2,
                      fontWeight:4,
                      color:'copyColor',
                      textAlign:'center',
                      fontSize:[3,'1.8em'],
                      flexProps:{
                        justifyContent:'center'
                      }
                    },
                  }}
                  {...this.props}
                  tokenConfig={tokenConfig}
                  token={strategyInfo.token}
                  network={this.state.network}
                  tranche={strategyInfo.tranche}
                  protocol={strategyInfo.protocol}
                />
                <TrancheField
                  fieldInfo={{
                    showLoader:false,
                    name:'trancheIDLEDistribution',
                    props:{
                      decimals:2,
                      fontWeight:2,
                      fontSize:[0,1],
                      color:'cellText',
                      textAlign:'center',
                      flexProps:{
                        justifyContent:'center'
                      }
                    },
                  }}
                  {...this.props}
                  tokenConfig={tokenConfig}
                  token={strategyInfo.token}
                  network={this.state.network}
                  trancheConfig={tokenConfig.BB}
                  tranche={strategyInfo.tranche}
                  protocol={strategyInfo.protocol}
                />
              </Flex>
            </Flex>
          )
        }
        {
          !strategyInfo.comingSoon && 
            <Flex
              mt={2}
              width={1}
              height={'60px'}
              flexDirection={'row'}
              alignItems={'center'}
              justifyContent={'center'}
              id={`${this.props.strategy}_performance_chart`}
            >
              {
                /*
                <Image
                  width={1}
                  height={'60px'}
                  src={`/images/strategies/${this.props.strategy}-chart.png`}
                />
                */
              }
              <AssetField
                fieldInfo={{
                  name:'aprChart'
                }}
                chartProps={{
                  lineWidth:2
                }}
                {...this.props}
                tokenConfig={tokenConfig}
                network={this.state.network}
                token={this.state.selectedToken}
                rowId={`${this.props.strategy}_performance_chart`}
              />
            </Flex>
        }
        <Flex
          width={1}
          height={'64px'}
          position={'relative'}
          boxShadow={'0px -6px 6px -4px rgba(0,0,0,0.1)'}
        >
          {
            strategyInfo.comingSoon ? (
              <Flex
                width={1}
                alignItems={'center'}
                flexDirection={'row'}
                justifyContent={'center'}
              >
                <Text
                  mr={2}
                  fontSize={3}
                  fontWeight={550}
                  color={'copyColor'}
                  style={{
                    fontStyle:'italic'
                  }}
                  hoverColor={'copyColor'}
                >
                  Coming Soon
                </Text>
              </Flex>
            ) : (
              <Link
                href={strategyUrl}
                style={{display:'flex',width:'100%'}}
                >
                  <Flex
                    width={1}
                    alignItems={'center'}
                    flexDirection={'row'}
                    justifyContent={'center'}
                  >
                    <Text
                      mr={2}
                      fontSize={3}
                      fontWeight={4}
                      color={'copyColor'}
                      hoverColor={'copyColor'}
                    >
                      Start with {strategyInfo.title}
                    </Text>
                    <Icon
                      size={'1.2em'}
                      color={'copyColor'}
                      name={'ArrowForward'}
                    />
                  </Flex>
              </Link>
            )
          }
        </Flex>
      </DashboardCard>
    );
  }
}

export default StrategyBox;
