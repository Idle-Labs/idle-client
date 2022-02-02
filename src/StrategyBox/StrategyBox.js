import Title from '../Title/Title';
import React, { Component } from 'react';
import styles from './StrategyBox.module.scss';
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

      // Override required network in props
      const newProps = {...this.props};
      if (this.state.network){
        newProps.network = this.state.network;
      }
      // console.log('network',strategyInfo.networkId,newProps.network);

      this.functionsUtil.setProps(newProps);
    } else {
      this.functionsUtil = new FunctionsUtil(this.props);
    }
  }

  async componentWillMount(){
    this.loadUtils();

    const strategyInfo = this.functionsUtil.getGlobalConfig(['landingStrategies',this.props.strategy]);
    
    // Override required network id
    const network = Object.assign({},this.props.network);
    network.required = Object.assign({},this.props.network.required);
    network.current = Object.assign({},this.props.network.current);

    network.required.id = strategyInfo.networkId;
    network.required.name = this.functionsUtil.getGlobalConfig(['network','availableNetworks',strategyInfo.networkId,'name']);

    this.setState({
      network
    },() => {
      this.loadUtils();
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
    
    switch (strategyInfo.type){
      case 'tranche':
        selectedToken = strategyInfo.token;
      break;
      default:
      case 'strategy':
        const availableTokens = this.props.availableStrategiesNetworks[strategyInfo.networkId][strategyInfo.strategy];
        switch (this.props.strategy){
          case 'best':
            aprs = await this.functionsUtil.getAprsFromApi(strategyInfo.networkId);
            if (aprs && aprs.lendRates){
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
            } else if (availableTokens) {
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
            if (aprs && aprs.lendRates){
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
            } else if (availableTokens) {
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

  async goToStrategy(){
    const strategyInfo = this.functionsUtil.getGlobalConfig(['landingStrategies',this.props.strategy]);

    if (strategyInfo.url){
      window.location.href = strategyInfo.url;
      return true;
    }

    let strategyEnv = null;
    const currentEnv = this.functionsUtil.getCurrentEnvironment();
    if (strategyInfo.enabledEnvs.length>0 && !strategyInfo.enabledEnvs.includes(currentEnv)){
      strategyEnv = strategyInfo.enabledEnvs[0];
    }

    if (!strategyEnv){
      await this.props.setRequiredNetwork(strategyInfo.networkId,true);
    }

    window.location.href = this.functionsUtil.getDashboardSectionUrl(strategyInfo.strategy,strategyEnv);
  }

  render() {
    const strategyInfo = this.functionsUtil.getGlobalConfig(['landingStrategies',this.props.strategy]);
    const networkInfo = this.functionsUtil.getGlobalConfig(['network','availableNetworks',strategyInfo.networkId]);

    // const chartColor = strategyInfo.chartColor ? strategyInfo.chartColor : null;
    // const networkTokenInfo = this.functionsUtil.getGlobalConfig(['stats','tokens',networkInfo.baseToken]);
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
          mt:[3,0],
          ml:['0.35em',0],
          width:[1,'21em'],
          mr:['0.35em','2em'],
          alignItems:'center',
          height:'fit-content',
          flexDirection:'column',
          justifyContent:'flex-start',
        }}
        isVisible={ typeof this.props.isVisible !== 'undefined' ? this.props.isVisible : true }
      >
        <Flex
          className={[styles.ribbon,styles[networkInfo.provider]]}
        >
          <Flex
            alignItems={'center'}
            flexDirection={'row'}
            justifyContent={'center'}
            className={[styles.content]}
          >
            <Flex
              p={1}
              mr={2}
              width={'1em'}
              height={'1em'}
              alignItems={'center'}
              borderRadius={'50px'}
              justifyContent={'center'}
              backgroundColor={'white'}
            >
              <Image
                height={'1em'}
                src={`images/networks/${networkInfo.provider}.svg`}
              />
            </Flex>
            <Text
              fontSize={1}
              fontWeight={3}
              color={'white'}
            >
              {networkInfo.name}
            </Text>
          </Flex>
        </Flex>
        {
          strategyInfo.enabledEnvs.includes('beta') && (
            <Flex
              px={2}
              py={'1px'}
              top={'2px'}
              right={'2px'}
              borderRadius={2}
              position={'absolute'}
              alignItems={'center'}
              justifyContent={'center'}
              backgroundColor={'#ff7600'}
            >
              <Text
                fontSize={1}
                fontWeight={3}
                color={'white'}
              >
                BETA
              </Text>
            </Flex>
          )
        }
        {
          /*
          <Flex
            mb={3}
            py={1}
            width={1}
            alignItems={'center'}
            flexDirection={'row'}
            justifyContent={'center'}
            backgroundColor={networkInfo.color}
          >
            <Image
              mr={2}
              height={'1em'}
              src={`images/networks/${networkInfo.provider}-white.svg`}
            />
            <Text
              fontSize={1}
              fontWeight={3}
              color={'white'}
            >
              {networkInfo.name} Network
            </Text>
          </Flex>
          */
        }
        <Flex
          mt={3}
          mb={2}
          justifyContent={'center'}
        >
          <Image
            src={strategyInfo.icon}
            height={['2.2em','2.4em']}
          />
        </Flex>
        <Flex
          mt={2}
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
        {
          /*
          <Flex
            my={1}
            width={1}
            alignItems={'center'}
            justifyContent={'center'}
          >
            <Flex
              pb={'1px'}
              pl={'3px'}
              pr={'6px'}
              alignItems={'center'}
              borderRadius={'50px'}
              flexDirection={'row'}
              display={'inline-flex'}
              justifyContent={'center'}
              backgroundColor={networkInfo.color}
            >
              <Flex
                p={1}
                mr={1}
                width={'1.1em'}
                height={'1.1em'}
                alignItems={'center'}
                borderRadius={'50px'}
                justifyContent={'center'}
                backgroundColor={'white'}
              >
                <Image
                  height={'1.1em'}
                  src={`images/networks/${networkInfo.provider}.svg`}
                />
              </Flex>
              <Text
                fontSize={'13px'}
                color={'white'}
                fontWeight={500}
              >
                {networkInfo.name}
              </Text>
            </Flex>
          </Flex>
          */
        }
        <Flex
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
                    message={this.functionsUtil.getGlobalConfig(['tranches','AA','description','apy'])}
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
                    message={this.functionsUtil.getGlobalConfig(['tranches','BB','description','apy'])}
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
              {
                strategyInfo.type === 'strategy' ? (
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
                ) : strategyInfo.type === 'tranche' && (
                  <TrancheField
                    fieldInfo={{
                      name:'aprChart'
                    }}
                    chartProps={{
                      lineWidth:2
                    }}
                    {...this.props}
                    tokenConfig={tokenConfig}
                    token={strategyInfo.token}
                    network={this.state.network}
                    tranche={strategyInfo.tranche}
                    protocol={strategyInfo.protocol}
                    rowId={`${this.props.strategy}_performance_chart`}
                  />
                )
              }
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
                onClick={ e => this.goToStrategy() }
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
