import moment from 'moment';
import Title from '../Title/Title';

import React, { Component } from 'react';

import AssetsList from '../AssetsList/AssetsList';
import FlexLoader from '../FlexLoader/FlexLoader';

import globalConfigs from '../configs/globalConfigs';
import FunctionsUtil from '../utilities/FunctionsUtil';
import DashboardCard from '../DashboardCard/DashboardCard';

import { Flex, Text, Box, Icon, Button, Link } from 'rimble-ui';
import ExecuteTransaction from '../ExecuteTransaction/ExecuteTransaction';
import AssetsUnderManagement from '../AssetsUnderManagement/AssetsUnderManagement';
import TranchesList from "../TranchesList/TranchesList";
import StatsAsset from '../StatsAsset/StatsAsset';
import StatsTranche from '../StatsTranche/StatsTranche';

class Stats extends Component {
  state = {
    aum:null,
    apr:null,
    days:'-',
    delta:null,
    earning:null,
    minDate:null,
    maxDate:null,
    carouselMax:1,
    rebalances:'-',
    buttonGroups:[],
    apiResults:null,
    carouselIndex:0,
    idleVersion:null,
    statsVersions:{},
    minStartTime:null,
    endTimestamp:null,
    showAdvanced:true,
    govTokensPool:null,
    unlentBalance:null,
    quickSelection:null,
    startTimestamp:null,
    endTimestampObj:null,
    shouldRebalance:null,
    carouselOffsetLeft:0,
    startTimestampObj:null,
    showRefreshIdleSpeed:false,
    apiResults_unfiltered:null,
    dateRangeModalOpened:false
  };

  quickSelections = {
    day:{
      value:1,
      type:'day',
      label:'Last day',
    },
    week:{
      value:1,
      type:'week',
      label:'Last week',
    },
    weeks:{
      value:2,
      type:'week',
      label:'Last 2 weeks',
    },
    month:{
      value:1,
      type:'month',
      label:'Last month',
    },
    ytd:{
      type:'day',
      label:'Year to date',
      value:moment().diff(moment('01/01/YYYY','DD/MM/YYYY'),'days'),
    },
  };

  // Utils
  functionsUtil = null;
  componentUnmounted = null;
  loadUtils(){
    if (this.functionsUtil){
      this.functionsUtil.setProps(this.props);
    } else {
      this.functionsUtil = new FunctionsUtil(this.props);
    }
  }

  async componentWillMount() {
    this.loadUtils();
    await this.loadParams();
  }

  componentWillUnmount(){
    this.componentUnmounted = true;
  }

  async setStateSafe(newState,callback=null) {
    if (!this.componentUnmounted){
      return this.setState(newState,callback);
    }
    return null;
  }

  showRefreshIdleSpeed(){
    this.setStateSafe({
      showRefreshIdleSpeed:true
    });
  }

  getLatestAvailableVersion(){
    const statsVersions = globalConfigs.stats.versions;
    let latestVersion = null;
    Object.keys(statsVersions).forEach( version => {
      const versionInfo = statsVersions[version];
      if (versionInfo.enabledStrategies.includes(this.props.selectedStrategy)){
        latestVersion = version;
      }
    });

    return latestVersion;
  }

  getVersionInfo(version){
    if (!version){
      version = this.state.idleVersion;
    }

    if (!globalConfigs.stats.versions[version]){
      return null;
    }

    const versionInfo = Object.assign({},globalConfigs.stats.versions[version]);

    if (versionInfo.strategiesParams && versionInfo.strategiesParams[this.props.selectedStrategy]){
      const versionInfoExtra = versionInfo.strategiesParams[this.props.selectedStrategy];
      Object.keys(versionInfoExtra).forEach( param => {
        versionInfo[param] = versionInfoExtra[param];
      });
    }

    return versionInfo;
  }

  async loadParams() {

    if (!this.props.selectedToken){
      return false;
    }

    const newState = {};
    const { match: { params } } = this.props;

    const currentNetworkAvailableTokens = Object.keys(this.props.availableTokens);

    if(this.props.selectedStrategy==='tranches') {
      newState.selectedToken=this.props.selectedToken
    } else if (!!params.customToken && currentNetworkAvailableTokens.indexOf(params.customToken.toUpperCase()) !== -1 ){
      newState.selectedToken = params.customToken.toUpperCase();
    } else {
      newState.selectedToken = this.props.selectedToken.toUpperCase();
    }

    newState.tokenConfig = this.props.availableTokens[newState.selectedToken];
    newState.minStartTime = moment(globalConfigs.stats.tokens[this.props.selectedToken].startTimestamp,'YYYY-MM-DD');
    newState.maxEndDate = moment();

    newState.endTimestampObj = moment(moment().format('YYYY-MM-DD 23:59'),'YYYY-MM-DD HH:mm');

    newState.latestVersion = this.getLatestAvailableVersion();
    newState.idleVersion = this.state.idleVersion === null ? newState.latestVersion : this.state.idleVersion;

    const versionInfo = this.getVersionInfo(newState.idleVersion);

    // console.log('loadParams',newState.latestVersion,newState.idleVersion,versionInfo);

    if (newState.idleVersion && versionInfo.endTimestamp){
      const newEndTimestampObj = moment(moment(versionInfo.endTimestamp*1000).format('YYYY-MM-DD HH:mm'),'YYYY-MM-DD HH:mm');
      if (newState.endTimestampObj.isAfter(newEndTimestampObj)){
        newState.endTimestampObj = newEndTimestampObj;
        newState.endTimestamp = parseInt(newState.endTimestampObj._d.getTime()/1000);
      }

      if (!newState.maxEndDate || newState.maxEndDate.isAfter(newEndTimestampObj)){
        newState.maxEndDate = newEndTimestampObj;
      }
    }

    newState.endTimestamp = parseInt(newState.endTimestampObj._d.getTime()/1000);

    // Set start date
    newState.startTimestampObj = newState.endTimestampObj.clone().subtract(1,'month');
    newState.startTimestamp = parseInt(newState.startTimestampObj._d.getTime()/1000);

    if (newState.idleVersion && versionInfo.startTimestamp){
      const newStartTimestampObj = moment(moment(versionInfo.startTimestamp*1000).format('YYYY-MM-DD HH:mm'),'YYYY-MM-DD HH:mm');
      if (newState.startTimestampObj.isBefore(newStartTimestampObj)){
        newState.startTimestampObj = newStartTimestampObj;
        newState.startTimestamp = parseInt(newState.startTimestampObj._d.getTime()/1000);
      }

      if (newState.minStartTime.isBefore(newStartTimestampObj)){
        newState.minStartTime = newStartTimestampObj;
      }
    }
    newState.minDate = newState.minStartTime._d;
    newState.maxDate = newState.maxEndDate._d;

    if (newState !== this.state){
      await this.setStateSafe(newState);
    }
  }

  setDateRange = (ranges,quickSelection=null) => {

    const minStartTime = moment(globalConfigs.stats.tokens[this.props.selectedToken].startTimestamp);

    let startTimestampObj = moment(ranges.startDate).isSameOrAfter(minStartTime) ? moment(ranges.startDate) : minStartTime;
    let endTimestampObj = moment(ranges.endDate);

    if (startTimestampObj.isSame(endTimestampObj)){
      endTimestampObj.add(1,'day');
    }

    endTimestampObj = moment(endTimestampObj.format('YYYY-MM-DD 23:59'),'YYYY-MM-DD HH:mm');

    if (startTimestampObj.isBefore(this.state.minStartTime)){
      startTimestampObj = this.state.minStartTime;
    }

    if (endTimestampObj.isAfter(this.state.maxEndDate)){
      endTimestampObj = this.state.maxEndDate;
    }

    const startTimestamp = parseInt(startTimestampObj._d.getTime()/1000);
    const endTimestamp = parseInt(endTimestampObj._d.getTime()/1000);

    const newState = {
      minStartTime,
      endTimestamp,
      quickSelection,
      startTimestamp,
      endTimestampObj,
      startTimestampObj
    };

    this.setStateSafe(newState);

    return newState;
  }

  toggleAdvancedCharts = (e) => {
    e.preventDefault();
    this.setStateSafe({
      showAdvanced:!this.state.showAdvanced
    });
  }

  setDateRangeModal = (dateRangeModalOpened) => {
    if (dateRangeModalOpened !== this.state.dateRangeModalOpened){
      this.setStateSafe({
        dateRangeModalOpened
      });
    }
  }

  async componentDidMount() {

    if (!this.props.web3){
      this.props.initWeb3();
      return false;
    }

    /*
    const style = document.createElement('style');
    style.id = 'crisp-custom-style';
    style.type = 'text/css';
    style.innerHTML = `
    .crisp-client{
      display:none !important;
    }`;
    document.body.appendChild(style);
    */

    this.loadUtils();
    await this.loadParams();
    this.loadApiData();
    this.loadCarousel();
  }

  loadCarousel(){
    const carouselMax = this.props.isMobile ? 3 : 2;
    this.setStateSafe({
      carouselMax
    });
  }

  async componentDidUpdate(prevProps,prevState) {
    const contractsInitialized = prevProps.contractsInitialized !== this.props.contractsInitialized;
    const strategyChanged = prevProps.selectedStrategy !== this.props.selectedStrategy;
    const tokenChanged = prevProps.selectedToken !== this.props.selectedToken || JSON.stringify(prevProps.tokenConfig) !== JSON.stringify(this.props.tokenConfig);
    const dateChanged = prevState.startTimestamp !== this.state.startTimestamp || prevState.endTimestamp !== this.state.endTimestamp;
    const versionChanged = prevState.idleVersion !== this.state.idleVersion;
    const mobileChanged = prevProps.isMobile !== this.props.isMobile;

    if (mobileChanged){
      this.loadCarousel();
    }

    if (contractsInitialized || tokenChanged || strategyChanged || versionChanged){
      // console.log('componentDidUpdate',this.props.selectedStrategy,this.props.selectedToken);
      await this.componentDidMount();
    } else if (dateChanged){
      this.loadApiData();
    }
  }

  filterTokenData = (apiResults) => {
    return apiResults.filter((r,i) => {
      return (!this.state.startTimestamp || r.timestamp >= this.state.startTimestamp) && (!this.state.endTimestamp || r.timestamp <= this.state.endTimestamp);
    });
  }

  setIdleVersion = idleVersion => {
    this.setStateSafe({
      idleVersion
    });
  }

  loadApiData = async () => {

    /*
    if (!this.props.selectedToken || !this.props.tokenConfig){
      return false;
    }

    const startTimestamp = this.state.minDate ? parseInt(this.functionsUtil.strToMoment(this.functionsUtil.strToMoment(this.state.minDate).format('DD/MM/YYYY 00:00:00'),'DD/MM/YYYY HH:mm:ss')._d.getTime()/1000) : null;
    const endTimestamp = this.state.maxDate ? parseInt(this.functionsUtil.strToMoment(this.functionsUtil.strToMoment(this.state.maxDate).format('DD/MM/YYYY 23:59:59'),'DD/MM/YYYY HH:mm:ss')._d.getTime()/1000) : null;

    const isRisk = ['v3','v4'].includes(this.state.idleVersion) && this.props.selectedStrategy === 'risk';
    let apiResults_unfiltered = await this.functionsUtil.getTokenApiData(this.props.tokenConfig.address,isRisk,startTimestamp,endTimestamp,true,7200);

    const apiResults = this.filterTokenData(apiResults_unfiltered);

    // console.log('loadApiData',startTimestamp,endTimestamp,new Date(startTimestamp*1000),new Date(endTimestamp*1000),apiResults,apiResults_unfiltered);

    if (!apiResults || !apiResults_unfiltered || !apiResults.length || !apiResults_unfiltered.length){
      return false;
    }

    const firstResult = apiResults[0];
    const lastResult = Object.values(apiResults).pop();

    window.moment = moment;

    let days = (lastResult.timestamp-firstResult.timestamp)/86400;
    if (days === 0){
      days = 1;
    }

    let apr = null;
    let delta = 'N/A';

    const idleTokens = this.functionsUtil.fixTokenDecimals(lastResult.idleSupply,18);
    const firstIdlePrice = this.functionsUtil.fixTokenDecimals(firstResult.idlePrice,this.props.tokenConfig.decimals);
    const lastIdlePrice = this.functionsUtil.fixTokenDecimals(lastResult.idlePrice,this.props.tokenConfig.decimals);

    // Calculate AUM
    let aum = idleTokens.times(lastIdlePrice);

    // Convert Token balance
    aum = await this.functionsUtil.convertTokenBalance(aum,this.props.selectedToken,this.props.tokenConfig,isRisk);

    const compoundInfo = this.props.tokenConfig.protocols.filter((p) => { return p.name === 'compound' })[0];
    const firstCompoundData = compoundInfo ? firstResult.protocolsData.filter((p) => { return p.protocolAddr.toLowerCase() === compoundInfo.address.toLowerCase() })[0] : null;
    const lastCompoundData = compoundInfo ? lastResult.protocolsData.filter((p) => { return p.protocolAddr.toLowerCase() === compoundInfo.address.toLowerCase() })[0] : null;

    if (this.state.idleVersion === 'v4') {

      apr = apiResults.reduce( (sum,r) => {
        const idleRate = this.functionsUtil.fixTokenDecimals(r.idleRate,18);
        return this.functionsUtil.BNify(sum).plus(idleRate);
      },0);

      // Calculate average
      apr = apr.div(apiResults.length);

      if (compoundInfo){
        const compoundWithCOMPInfo = globalConfigs.stats.protocols.compoundWithCOMP;
        const rateField = compoundWithCOMPInfo.rateField ? compoundWithCOMPInfo.rateField : 'rate';

        let compoundAvgApr = apiResults.reduce( (sum,r) => {

          const compoundData = r.protocolsData.find((pData,x) => {
            return pData.protocolAddr.toLowerCase() === compoundInfo.address.toLowerCase()
          });

          let compoundRate = typeof rateField === 'object' && rateField.length ? rateField.reduce((acc,field) => {
            if (compoundData && compoundData[field]){
              return this.functionsUtil.BNify(acc).plus(this.functionsUtil.BNify(compoundData[field]));
            }
            return this.functionsUtil.BNify(acc);
          },0) : this.functionsUtil.BNify(compoundData[rateField]);

          compoundRate = this.functionsUtil.fixTokenDecimals(compoundRate,18);

          return this.functionsUtil.BNify(sum).plus(compoundRate);
        },0);

        // Calculate average
        compoundAvgApr = compoundAvgApr.div(apiResults.length);

        // compoundAvgApr = this.functionsUtil.apr2apy(compoundAvgApr.div(100)).times(100);
        // apr = this.functionsUtil.apr2apy(apr.div(100)).times(100);

        delta = apr.minus(compoundAvgApr);
        if (parseFloat(delta)<0){
          delta = 0
        }
        delta = delta.toFixed(2);
      }

      apr = apr.toFixed(2);

    } else {
      const earning = lastIdlePrice.div(firstIdlePrice).minus(1).times(100);
      apr = earning.times(365).div(days).toFixed(2);

      if (firstCompoundData && lastCompoundData){
        const firstCompoundPrice = this.functionsUtil.fixTokenDecimals(firstCompoundData.price,this.props.tokenConfig.decimals);
        const lastCompoundPrice = this.functionsUtil.fixTokenDecimals(lastCompoundData.price,this.props.tokenConfig.decimals);
        const compoundApr = lastCompoundPrice.div(firstCompoundPrice).minus(1).times(100);
        delta = earning.minus(compoundApr).times(365).div(days);
        if (parseFloat(delta)<0){
          delta = 0
        }
        delta = delta.toFixed(2);
      }
    }

    // Count rebalances
    let rebalances = 0;
    apiResults.forEach((row,index) => {
      if (index){
        const prevRow = apiResults[index-1];

        const totalAllocation = row.protocolsData.reduce((accumulator,protocolAllocation) => {
          const allocation = this.functionsUtil.fixTokenDecimals(protocolAllocation.allocation,this.props.tokenConfig.decimals);
          return this.functionsUtil.BNify(accumulator).plus(allocation);
        },0);

        const prevTotalAllocation = prevRow.protocolsData.reduce((accumulator,protocolAllocation) => {
          const allocation = this.functionsUtil.fixTokenDecimals(protocolAllocation.allocation,this.props.tokenConfig.decimals);
          return this.functionsUtil.BNify(accumulator).plus(allocation);
        },0);

        let hasRebalanced = false;
        row.protocolsData.forEach( p => {
          if (hasRebalanced){
            return;
          }
          const prevP = prevRow.protocolsData.find( prevP => (prevP.protocolAddr.toLowerCase() === p.protocolAddr.toLowerCase()) );
          const allocation = this.functionsUtil.fixTokenDecimals(p.allocation,this.props.tokenConfig.decimals);
          const prevAllocation = prevP ? this.functionsUtil.fixTokenDecimals(prevP.allocation,this.props.tokenConfig.decimals) : this.functionsUtil.BNify(0);
          const allocationPerc = parseInt(parseFloat(allocation.div(totalAllocation).times(100)));
          const prevAllocationPerc = parseInt(parseFloat(prevAllocation.div(prevTotalAllocation).times(100)));
          if (allocationPerc!==prevAllocationPerc){
            rebalances++;
            hasRebalanced = true;
          }
        });
      }
    });

    // Add gov tokens balance to AUM
    const availableTokens = {};
    availableTokens[this.props.selectedToken] = this.props.tokenConfig;
    const govTokensPool = await this.functionsUtil.getGovTokenPool(null,availableTokens,'DAI');
    if (govTokensPool){
      aum = aum.plus(govTokensPool);
    }

    let unlentBalance = await this.functionsUtil.getUnlentBalance(this.props.tokenConfig);
    if (unlentBalance){
      unlentBalance = this.functionsUtil.formatMoney(parseFloat(unlentBalance));
    }

    this.setStateSafe({
      aum,
      apr,
      days,
      delta,
      apiResults,
      rebalances,
      govTokensPool,
      unlentBalance,
      apiResults_unfiltered
    });
    */
  }

  selectToken = async (strategy,token) => {
    await this.props.setStrategyToken(strategy,token);
    this.props.changeToken(token);

  }
  selectTranche = async (strategy,protocol,token) => {
    await this.props.setStrategyToken(strategy,token,protocol);
    this.props.changeProtocolToken(protocol,token);
    console.log("THIS CHECK", this.props.selectedStrategy)
  }

  handleCarousel = action => {
    let carouselIndex = this.state.carouselIndex;
    if (action==='next' && carouselIndex<this.state.carouselMax){
      carouselIndex++;
    } else if (action==='back' && carouselIndex>0){
      carouselIndex--;
    }

    const $element = window.jQuery(`#carousel-cursor > div:eq(${carouselIndex})`);
    const carouselOffsetLeft = -parseFloat($element.position().left)+'px';

    this.setStateSafe({
      carouselIndex,
      carouselOffsetLeft
    });
  }

  render() {

    const networkId = this.functionsUtil.getRequiredNetworkId();
    const idleTokenAvailableNetworks = this.functionsUtil.getGlobalConfig(['govTokens','IDLE','availableNetworks']);
    const idleTokenEnabled = this.functionsUtil.getGlobalConfig(['govTokens','IDLE','enabled']) && idleTokenAvailableNetworks.includes(networkId);
    
    const refreshIdleSpeedConfig = this.functionsUtil.getGlobalConfig(['contract','methods','refreshIdleSpeed']);
    const refreshIdleSpeedEnabled = refreshIdleSpeedConfig.enabled && refreshIdleSpeedConfig.availableNetworks.includes(networkId);

    const apyLong = this.functionsUtil.getGlobalConfig(['messages','apyLong']);

    if (!this.props.availableStrategies){
      return (
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
          text={'Loading assets...'}
        />
      );
    }

    const statsTokens = this.functionsUtil.getGlobalConfig(['stats','tokens']);

    if (!this.props.selectedToken){
      const strategies = this.functionsUtil.getGlobalConfig(['strategies']);
      const enabledTokens = [];
      const statsProtocols = this.functionsUtil.getGlobalConfig(['stats','protocols']);

      Object.keys(statsTokens).forEach(token => {
        const tokenInfo = statsTokens[token];
        if (tokenInfo.enabled){
          enabledTokens.push(token);
        }
      });
      return (
        <Flex
          mb={3}
          width={1}
          flexDirection={'column'}
        >
          <AssetsUnderManagement
            {...this.props}
            loaderAlign={'flex-end'}
          />
          {
            Object.keys(strategies).map(strategy => 
             
              {
                if(strategy==='risk')
                return false;

                const strategyInfo = strategies[strategy];
                const availableTokens = this.props.availableStrategies[strategy];

                if (!availableTokens || !Object.keys(availableTokens).length){
                  return false;
                }
                
                // Get available protocols name
                const availableProtocolsKeys = [];
                Object.keys(availableTokens).forEach( token => {
                  availableTokens[token].protocols.forEach( protocolInfo => {
                    if (availableProtocolsKeys.indexOf(protocolInfo.name)<0){
                      availableProtocolsKeys.push(protocolInfo.name);
                    }
                  });
                });

                const availableProtocols = availableProtocolsKeys.map( protocolName => {
                  return statsProtocols[protocolName];
                },{});

                return (
                  <Box
                    mb={2}
                    width={1}
                    flexDirection={'column'}
                    justifyContent={'center'}
                    key={`strategy-container-${strategy}`}
                  >
                    <Title
                      mt={3}
                      mb={[3,4]}
                    >
                      <Flex
                        flexDirection={'row'}
                        alignItems={'baseline'}
                        justifyContent={'center'}
                      >
                        {strategyInfo.title}
                        {
                          strategyInfo.titlePostfix &&
                            <Text
                              ml={2}
                              fontWeight={3}
                              fontSize={[2,4]}
                              color={'dark-gray'}
                            >
                              {strategyInfo.titlePostfix}
                            </Text>
                        }
                      </Flex>
                    </Title>
                    <AssetsList
                      enabledTokens={enabledTokens}
                      handleClick={(props) => this.selectToken(strategy,props.token)}
                      cols={[
                        {
                          title:'CURRENCY',
                          props:{
                            width:[0.26,0.15]
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
                            width:[0.20,0.14],
                          },
                          fields:[
                            {
                              name:'allocationChart',
                              mobile:false,
                              parentProps:{
                                width:0.3
                              },
                              style:{
                                overflow:'visible'
                              },
                              showLoader:false,
                            },
                            {
                              name:'pool',
                              props:{
                                ml:1
                              },
                              parentProps:{
                                width:[1,0.7]
                              }
                            }
                          ]
                        },
                        {
                          title:'APY',
                          desc:apyLong,
                          props:{
                            width: [0.29,0.15],
                          },
                          parentProps:{
                            flexDirection:'column',
                            alignItems:'flex-start',
                            justifyContent:networkId === 1 ? 'flex-start' : 'center',
                          },
                          fields:[
                            {
                              name:'apy',
                              showTooltip:true
                            },
                            networkId === 1 ? {
                              name:'idleDistribution',
                              showLoader:false,
                              props:{
                                decimals:this.props.isMobile ? 1 : 2,
                                fontSize:this.props.isMobile ? '9px' : 0
                              }
                            } : null,
                          ]
                        },
                        {
                          title:'FARMING',
                          desc:this.functionsUtil.getGlobalConfig(['messages','yieldFarming']),
                          mobile:false,
                          props:{
                            width:[0.27,0.14],
                          },
                          fields:[
                            {
                              name:'govTokens'
                            }
                          ]
                        },
                        {
                          title:'APR LAST WEEK',
                          mobile:false,
                          props:{
                            width: 0.25,
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
                          props:{
                            width:[0.29,0.15],
                          },
                          parentProps:{
                            width:1
                          },
                          fields:[
                            {
                              name:'button',
                              label:this.props.isMobile ? 'View' : 'View stats',
                              props:{
                                width:1,
                                fontSize:3,
                                fontWeight:3,
                                height:'45px',
                                borderRadius:4,
                                boxShadow:null,
                                mainColor:'redeem',
                                size: this.props.isMobile ? 'small' : 'medium',
                                handleClick:(props) => this.selectToken(strategy,props.token)



                              }
                            }
                          ]
                        }
                      ]}
                      {...this.props}
                      selectedStrategy={strategy}
                      availableTokens={availableTokens}
                    />
                    {
                      !this.props.isMobile &&
                        <Flex
                          mt={2}
                          alignItems={'center'}
                          flexDirection={'row'}
                          justifyContent={'flex-end'}
                        >
                          {
                            availableProtocols.filter( p => p.legend ).map( (p,index) => (
                              <Flex
                                mr={3}
                                alignItems={'center'}
                                flexDirection={'row'}
                                key={`legend_${index}`}
                              >
                                <Box
                                  mr={1}
                                  width={'10px'}
                                  height={'10px'}
                                  borderRadius={'50%'}
                                  backgroundColor={`rgb(${p.color.rgb.join(',')})`}
                                >
                                </Box>
                                <Text.span
                                  fontSize={1}
                                  color={'cellText'}
                                >
                                  {p.label}
                                </Text.span>
                              </Flex>
                            ))
                          }
                        </Flex>
                    }
                  </Box>
                );
              }
            )
          }

          <Title mb={[3,4]}>Tranches</Title>
          <TranchesList
              enabledProtocols={[]}
              availableTranches={this.props.availableTranches}
              handleClick={(props) => this.selectTranche('tranches',props.protocol,props.token)}
              cols={[
                {
                  title:'PROTOCOL',
                  props:{
                    width:[0.25, 0.14]
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
                    width:[0.25, 0.14],
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
                    width:[0.25, 0.14],
                  },
                  fields:[
                    {
                      name:'pool',
                      props:{
                        minPrecision:1,
                        decimals:this.props.isMobile ? 0 : 2,
                      }
                    }
                  ]
                },
                {
                  title:'SENIOR APY',
                  props:{
                    width:[0.28, 0.14],
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
                  title:'JUNIOR APY',
                  props:{
                    width:[0.28, 0.14],
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
                  props:{
                    width:[0.24, 0.13],
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
                  /*
                {
                  mobile:false,
                  title:'AUTO-FARMING',
                  props:{
                    width:[0.25,this.state.useTrancheType ? 0.14 : 0.14],
                  },
                  fields:[
                    {
                      name:'autoFarming'
                    }
                  ]
                },
          */
                  /*
                {
                  mobile:false,
                  title:'STAKING REWARDS',
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
                      label: 'View Stats',
                      props:{
                        width:1,
                        fontSize:3,
                        fontWeight:3,
                        height:'45px',
                        borderRadius:4,
                        boxShadow:null,
                        mainColor:'redeem',
                        size: this.props.isMobile ? 'small' : 'medium',
                        handleClick:(props) => this.selectTranche('tranches',props.protocol,props.token)
                      }
                    }
                  ]
                }

              ]}
              {...this.props}
          />
          {
            idleTokenEnabled && refreshIdleSpeedEnabled && !this.state.showRefreshIdleSpeed ? (
              <Flex
                mb={4}
                width={1}
                mt={[2,3]}
                alignItems={'center'}
                flexDirection={'row'}
                justifyContent={'center'}
              >
                <Link
                  hoverColor={'primary'}
                  onClick={this.showRefreshIdleSpeed.bind(this)}
                >
                  Refresh Idle Speed
                </Link>
              </Flex>
            ) : idleTokenEnabled && refreshIdleSpeedEnabled && this.state.showRefreshIdleSpeed &&
              <DashboardCard
                cardProps={{
                  p:2,
                  mb:4,
                  width:1,
                  mt:[2,3],
                }}
                isActive={true}
                isInteractive={false}
              >
                <Flex
                  alignItems={'center'}
                  flexDirection={'column'}
                  justifyContent={'center'}
                >
                  <Text
                    fontWeight={500}
                    color={'flashColor'}
                    textAlign={'center'}
                    fontSize={[1,'15px']}
                  >
                    By executing this transaction you can adjust the IDLE distribution speed among the pools.
                  </Text>
                  <ExecuteTransaction
                    action={'Refresh'}
                    Component={Button}
                    parentProps={{
                      mt:1
                    }}
                    componentProps={{
                      size:'small',
                      mainColor:'blue',
                      value:'REFRESH IDLE SPEED'
                    }}
                    params={[]}
                    contractName={'IdleController'}
                    methodName={'refreshIdleSpeeds'}
                    {...this.props}
                  >
                    <Flex
                      flexDirection={'row'}
                      alignItems={'center'}
                      justifyContent={'center'}
                    >
                      <Icon
                        mr={1}
                        name={'Done'}
                        size={'1.4em'}
                        color={this.props.theme.colors.transactions.status.completed}
                      />
                      <Text
                        fontWeight={500}
                        fontSize={'15px'}
                        color={'copyColor'}
                        textAlign={'center'}
                      >
                        Idle Speed Refreshed
                      </Text>
                    </Flex>
                  </ExecuteTransaction>
                </Flex>
              </DashboardCard>
          }
        </Flex>
      );
    } else {
      return this.props.selectedStrategy==='best' ? (
         <StatsAsset
           {...this.props}
         />
      ) : this.props.selectedStrategy==='tranches' && (
        <StatsTranche
           {...this.props}
         />
      )
    }
  }
}

export default Stats;