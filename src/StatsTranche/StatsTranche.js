import moment from 'moment';
import StatsChart from '../Stats/StatsChart';
import React, { Component } from 'react';
import Rebalance from '../Rebalance/Rebalance';
import StatsCard from '../StatsCard/StatsCard';
import Breadcrumb from '../Breadcrumb/Breadcrumb';
import SmartNumber from '../SmartNumber/SmartNumber';
import globalConfigs from '../configs/globalConfigs';
import FunctionsUtil from '../utilities/FunctionsUtil';
import DashboardCard from '../DashboardCard/DashboardCard';
import AssetSelector from '../AssetSelector/AssetSelector';
import GenericSelector from '../GenericSelector/GenericSelector';
import RoundIconButton from '../RoundIconButton/RoundIconButton';
import VariationNumber from '../VariationNumber/VariationNumber';
import AllocationChart from '../AllocationChart/AllocationChart';
import DateRangeModal from '../utilities/components/DateRangeModal';
import { Flex, Text, Heading, Box, Icon } from 'rimble-ui';
class StatsTranche extends Component {

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
    minStartTime:null,
    endTimestamp:null,
    apiResults_aa:null,
    apiResults_bb:null,
    govTokensPool:null,
    unlentBalance:null,
    quickSelection:null,
    startTimestamp:null,
    endTimestampObj:null,
    shouldRebalance:null,
    carouselOffsetLeft:0,
    startTimestampObj:null,
    apiResults_unfiltered:null,
    apiResults_unfiltered_aa:null,
    apiResults_unfiltered_bb:null,
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
    await this.loadApiData();
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

  async loadParams() {

    if (!this.props.selectedToken || !this.props.tokenConfig){
      return false;
    }

    const newState = {};
    const { match: { params } } = this.props;

    // console.log('loadParams',params,this.props);

    const currentNetworkAvailableTokens = Object.keys(this.props.availableTokens);

    if (!!params.customToken && currentNetworkAvailableTokens.indexOf(params.customToken.toUpperCase()) !== -1 ){
      newState.selectedToken = params.customToken.toUpperCase();
    } else {
      newState.selectedToken = this.props.selectedToken.toUpperCase();
    }

    newState.tokenConfig = this.props.availableTokens[newState.selectedToken];
    newState.minStartTime = moment('2021-12-01','YYYY-MM-DD');
    newState.maxEndDate = moment();

    newState.endTimestampObj = moment(moment().format('YYYY-MM-DD 23:59'),'YYYY-MM-DD HH:mm');

    newState.endTimestamp = parseInt(newState.endTimestampObj._d.getTime()/1000);

    // Set start date
    newState.startTimestampObj = newState.endTimestampObj.clone().subtract(1,'month');
    newState.startTimestamp = parseInt(newState.startTimestampObj._d.getTime()/1000);

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

    // console.log('componentDidUpdate',this.props.selectedStrategy,this.props.selectedProtocol,this.props.selectedToken,this.props.tokenConfig);

    const contractsInitialized = prevProps.contractsInitialized !== this.props.contractsInitialized;
    const strategyChanged = prevProps.selectedStrategy !== this.props.selectedStrategy;
    const protocolChanged = prevProps.selectedProtocol !== this.props.selectedProtocol;
    const tokenChanged = prevProps.selectedToken !== this.props.selectedToken || JSON.stringify(prevProps.tokenConfig) !== JSON.stringify(this.props.tokenConfig);
    const dateChanged = prevState.startTimestamp !== this.state.startTimestamp || prevState.endTimestamp !== this.state.endTimestamp;
    const mobileChanged = prevProps.isMobile !== this.props.isMobile;

    if (mobileChanged){
      this.loadCarousel();
    }

    if (contractsInitialized || tokenChanged || strategyChanged || protocolChanged){
      await this.componentDidMount();
    } else if (dateChanged){
      this.loadApiData();
    }
  }

  filterTokenData = (apiResults) => {
    return apiResults.filter((r,i) => {
      return (!this.state.startTimestamp || r.timeStamp >= this.state.startTimestamp) && (!this.state.endTimestamp || r.timeStamp <= this.state.endTimestamp);
    });
  }

  loadApiData = async () => {

    if (!this.props.selectedToken || !this.props.selectedProtocol || !this.props.selectedStrategy || !this.props.tokenConfig){
      console.log("FAILED HERE")
      return false;
    }

    const startTimestamp = this.state.minDate ? parseInt(this.functionsUtil.strToMoment(this.functionsUtil.strToMoment(this.state.minDate).format('DD/MM/YYYY 00:00:00'),'DD/MM/YYYY HH:mm:ss')._d.getTime()/1000) : null;
    const endTimestamp = this.state.maxDate ? parseInt(this.functionsUtil.strToMoment(this.functionsUtil.strToMoment(this.state.maxDate).format('DD/MM/YYYY 23:59:59'),'DD/MM/YYYY HH:mm:ss')._d.getTime()/1000) : null;

    let apiResults_unfiltered_aa = await this.functionsUtil.getSubgraphTrancheInfo(this.props.tokenConfig.AA.address,startTimestamp,endTimestamp);
    let apiResults_unfiltered_bb = await this.functionsUtil.getSubgraphTrancheInfo(this.props.tokenConfig.BB.address,startTimestamp,endTimestamp);

    const apiResults_aa = this.filterTokenData(apiResults_unfiltered_aa);
    const apiResults_bb = this.filterTokenData(apiResults_unfiltered_bb);
    if (!apiResults_aa || !apiResults_unfiltered_aa || !apiResults_aa.length || !apiResults_unfiltered_aa.length || !apiResults_bb || !apiResults_unfiltered_bb || !apiResults_bb.length || !apiResults_unfiltered_bb.length){
      return false;
    }

    /*
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
    aum = await this.functionsUtil.convertTokenBalance(aum,this.props.selectedToken,this.props.tokenConfig);

    const compoundInfo = this.props.tokenConfig.protocols.filter((p) => { return p.name === 'compound' })[0];
    const firstCompoundData = compoundInfo ? firstResult.protocolsData.filter((p) => { return p.protocolAddr.toLowerCase() === compoundInfo.address.toLowerCase() })[0] : null;
    const lastCompoundData = compoundInfo ? lastResult.protocolsData.filter((p) => { return p.protocolAddr.toLowerCase() === compoundInfo.address.toLowerCase() })[0] : null;

    apr = apiResults.reduce( (sum,r) => {
      const idleRate = this.functionsUtil.fixTokenDecimals(r.idleRate,18);
      return this.functionsUtil.BNify(sum).plus(idleRate);
    },0);

    // Calculate average
    apr = apr.div(apiResults.length);
    apr = apr.toFixed(2);

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
    */
    this.setStateSafe({
      // aum,
      // apr,
      // days,
      // delta,
      // apiResults,
      // rebalances,
      // govTokensPool,
      // unlentBalance,
      apiResults_aa,
      apiResults_bb,
      apiResults_unfiltered_aa,
      apiResults_unfiltered_bb
    });
  }

  selectToken = async (strategy,token) => {
    await this.props.setStrategyToken(strategy,token);
    this.props.changeToken(token);
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
  const apyLong = this.functionsUtil.getGlobalConfig(['messages','apyLong']);
  const statsTokens = this.functionsUtil.getGlobalConfig(['stats','tokens']);
  const idleTokenAvailableNetworks = this.functionsUtil.getGlobalConfig(['govTokens','IDLE','availableNetworks']);
  const idleTokenEnabled = this.functionsUtil.getGlobalConfig(['govTokens','IDLE','enabled']) && idleTokenAvailableNetworks.includes(networkId);

  const valueProps = {
    lineHeight:1,
    fontSize:[4,5],
    fontWeight:[3,4],
    color:'statValue'
  };

  const unitProps = {
    ml:2,
    lineHeight:1,
    fontWeight:[2,3],
    color:'statValue',
    fontSize:[3,'23px'],
  };

  const tokenConfig = statsTokens[this.props.selectedToken.toUpperCase()];

  // const disabledCharts = tokenConfig.disabledCharts || [];

  let performanceTooltip = null;

  return (
      <Flex
        p={0}
        width={1}
        flexDirection={'column'}
      >
        <Box
          mb={[3,4]}
        >
          <Flex
            flexDirection={['column','row']}
          >
            <Flex
                width={[1,0.4]}
            >
              <Breadcrumb
                {...this.props}
                showPathMobile={true}
                text={'ASSETS OVERVIEW'}
                isMobile={this.props.isMobile}
                handleClick={ e => this.props.goToSection('stats') }
                path={[this.functionsUtil.getGlobalConfig(['strategies',this.props.selectedStrategy,'title'])]}
              />
            </Flex>
            <Flex
              mt={[3,0]}
              width={[1,0.6]}
              flexDirection={['column','row']}
              justifyContent={['center','space-between']}
            >
              <Flex
                width={[1,0.26]}
                flexDirection={'column'}
              >
                {
                  /*
                  <GenericSelector
                    innerProps={{
                    p:1,
                    height:['100%','46px'],
                    }}
                    name={'idle-version'}
                    options={versionsOptions}
                    defaultValue={versionDefaultValue}
                    onChange={ v => this.setIdleVersion(v) }
                  />
                  */
                }
              </Flex>
              <Flex
                mt={[3,0]}
                width={[1,0.3]}
                flexDirection={'column'}
              >
                <AssetSelector
                  innerProps={{
                    p:1
                  }}
                  {...this.props}
                />
              </Flex>
              <Flex
                mt={[3,0]}
                width={[1,0.39]}
                flexDirection={'column'}
              >
                <DashboardCard
                  cardProps={{
                    p:1,
                    display:'flex',
                    alignItems:'center',
                    height:['46px','100%'],
                    justifyContent:'center'
                    }}
                    isInteractive={true}
                    handleClick={ e => this.setDateRangeModal(true) }
                  >
                    <Text
                      fontWeight={3}
                      color={'copyColor'}
                    >
                      {
                        this.state.quickSelection ?
                          this.quickSelections[this.state.quickSelection].label
                        : this.state.startTimestampObj && this.state.endTimestampObj &&
                          `${this.state.startTimestampObj.format('DD/MM/YY')} - ${this.state.endTimestampObj.format('DD/MM/YY')}`
                      }
                    </Text>
                </DashboardCard>
              </Flex>
            </Flex>
            </Flex>
        </Box>
        {
          (!tokenConfig || !tokenConfig.enabled) ? (
            <Flex
                width={1}
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
                  alignItems={'center'}
                  flexDirection={'column'}
                >
                  <Icon
                    size={'2.3em'}
                    color={'cellText'}
                    name={'DoNotDisturb'}
                  />
                  <Text
                    mt={2}
                    fontSize={2}
                    color={'cellText'}
                    textAlign={'center'}
                  >
                    Stats for {this.props.selectedToken} are not available!
                  </Text>
                </Flex>
              </DashboardCard>
            </Flex>
          ) : this.functionsUtil.strToMoment(tokenConfig.startTimestamp).isAfter(Date.now()) ? (
            <Flex
              width={1}
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
                    Stats for {this.props.selectedToken} will be available shortly!
                  </Text>
                </Flex>
              </DashboardCard>
            </Flex>
            ) : (
            <Box
              width={1}
            >
              <DashboardCard
                title={'Historical Performance'}
                description={performanceTooltip}
                cardProps={{
                    mb:[3,4]
                }}
              >
                <Flex
                  mb={3}
                  width={1}
                  id={'chart-PRICE'}
                >
                  <StatsChart
                    height={ 350 }
                    {...this.state}
                    parentId={'chart-PRICE'}
                    theme={this.props.theme}
                    chartMode={'PRICE_TRANCHE'}
                    isMobile={this.props.isMobile}
                    contracts={this.props.contracts}
                    themeMode={this.props.themeMode}
                    tokenConfig={this.props.tokenConfig}
                    apiResults_aa={this.state.apiResults_aa}
                    apiResults_bb={this.state.apiResults_bb}
                    selectedToken={this.props.selectedToken}

                  />
                </Flex>
              </DashboardCard>
              <DashboardCard
                        cardProps={{
                            mr:4,
                            height:'fit-content',
                            style:this.props.isMobile ? {width:'100%'} : {width:'32vw'}
                        }}
                        >
                        <Flex id='chart-VOL' width={1}>
                            <Flex
                            mb={3}
                            width={1}
                            flexDirection={'column'}
                            alignItems={'flex-start'}
                            justifyContent={'center'}
                            >
                            <Heading.h4
                                mb={2}
                                ml={3}
                                mt={3}
                                fontWeight={4}
                                fontSize={[2,3]}
                                textAlign={'left'}
                                color={'dark-gray'}
                                lineHeight={'initial'}
                            >
                                Volume
                            </Heading.h4>
                            <StatsChart
                                height={300}
                                {...this.state}
                                chartMode={'VOL_TRANCHE'}
                                parentId={'chart-VOL'}
                                theme={this.props.theme}
                                isMobile={this.props.isMobile}
                                themeMode={this.props.themeMode}
                                contracts={this.props.contracts}
                                apiResults={this.state.apiResults_aa}
                                idleVersion={this.state.idleVersion}
                                tokenConfig={this.props.tokenConfig}
                                apiResults_unfiltered={this.state.apiResults_unfiltered_aa}
                            />
                            </Flex>
                        </Flex>
                        </DashboardCard>
                        <DashboardCard
                        cardProps={{
                            mr:4,
                            height:'fit-content',
                            style:this.props.isMobile ? {width:'100%'} : {width:'32vw'}
                        }}
                        >
                        <Flex
                            width={1}
                            id='chart-AUM'
                        >
                            <Flex
                            mb={3}
                            width={1}
                            flexDirection={'column'}
                            alignItems={'flex-start'}
                            justifyContent={'center'}
                            >
                            <Heading.h4
                                ml={3}
                                mt={3}
                                mb={2}
                                fontWeight={4}
                                fontSize={[2,3]}
                                textAlign={'left'}
                                color={'dark-gray'}
                                lineHeight={'initial'}
                            >
                                Asset Under Management
                            </Heading.h4>
                            <StatsChart
                                height={300}
                                {...this.state}
                                chartMode={'AUM_TRANCHE'}
                                parentId={'chart-AUM'}
                                theme={this.props.theme}
                                isMobile={this.props.isMobile}
                                themeMode={this.props.themeMode}
                                contracts={this.props.contracts}
                                apiResults_aa={this.state.apiResults_aa}
                                apiResults_bb={this.state.apiResults_bb}
                                idleVersion={this.state.idleVersion}
                                tokenConfig={this.props.tokenConfig}
                            />
                            </Flex>
                        </Flex>
                        </DashboardCard>
              {
                /*
                <DashboardCard
                  cardProps={{
                      pb:3,
                      mb:[3,4]
                  }}
                  >
                  <Flex
                      flexDirection={['column','row']}
                      justifyContent={'space-between'}
                  >
                      {
                      this.state.idleVersion === this.state.latestVersion && 
                      <Flex
                          pt={2}
                          width={[1,1/3]}
                          id={'allocation-chart'}
                          flexDirection={'column'}
                          alignItems={'flex-start'}
                          justifyContent={'flex-start'}
                      >
                          <AllocationChart
                          height={310}
                          {...this.props}
                          parentId={'allocation-chart'}
                          />
                          <Rebalance
                          {...this.props}
                          />
                      </Flex>
                      }
                      <Flex
                      mb={[0,3]}
                      id={'chart-ALL'}
                      pl={[0,this.state.idleVersion === this.state.latestVersion ? 0 : 3]}
                      width={[1, this.state.idleVersion === this.state.latestVersion ? 2/3 : 1]}
                      >
                      <Flex alignItems={'flex-start'} justifyContent={'flex-start'} flexDirection={'column'} width={1}>
                          <Heading.h4
                          mb={2}
                          ml={3}
                          mt={[3,4]}
                          fontWeight={4}
                          fontSize={[2,3]}
                          textAlign={'left'}
                          color={'dark-gray'}
                          lineHeight={'initial'}
                          >
                          Allocations over time
                          </Heading.h4>
                          <StatsChart
                          height={350}
                          {...this.state}
                          chartMode={'ALL'}
                          parentId={'chart-ALL'}
                          theme={this.props.theme}
                          isMobile={this.props.isMobile}
                          themeMode={this.props.themeMode}
                          contracts={this.props.contracts}
                          apiResults={this.state.apiResults}
                          idleVersion={this.state.idleVersion}
                          apiResults_unfiltered={this.state.apiResults_unfiltered}
                          />
                      </Flex>
                      </Flex>
                  </Flex>
                  </DashboardCard>

                  <Flex
                  position={'relative'}
                  >
                  <Flex
                      width={1}
                      id={'carousel-container'}
                      justifyContent={'flex-end'}
                  >
                      <RoundIconButton
                      buttonProps={{
                          mr:3
                      }}
                      iconName={'ArrowBack'}
                      disabled={this.state.carouselIndex === 0}
                      handleClick={ e => this.handleCarousel('back') }
                      />
                      <RoundIconButton
                      iconName={'ArrowForward'}
                      handleClick={ e => this.handleCarousel('next') }
                      disabled={this.state.carouselIndex === this.state.carouselMax}
                      />
                  </Flex>
                  <Flex
                      mt={5}
                      height={'400px'}
                      position={'absolute'}
                      id={'carousel-cursor'}
                      width={['444%','200%']}
                      justifyContent={'flex-start'}
                      left={this.state.carouselOffsetLeft}
                      style={{
                      transition:'left 0.3s ease-in-out'
                      }}
                  >
                      <DashboardCard
                      cardProps={{
                          mr:4,
                          height:'fit-content',
                          style:this.props.isMobile ? {width:'100%'} : {width:'32vw'}
                      }}
                      >
                      <Flex
                          width={1}
                          id='chart-AUM'
                      >
                          <Flex
                          mb={3}
                          width={1}
                          flexDirection={'column'}
                          alignItems={'flex-start'}
                          justifyContent={'center'}
                          >
                          <Heading.h4
                              ml={3}
                              mt={3}
                              mb={2}
                              fontWeight={4}
                              fontSize={[2,3]}
                              textAlign={'left'}
                              color={'dark-gray'}
                              lineHeight={'initial'}
                          >
                              Asset Under Management
                          </Heading.h4>
                          <StatsChart
                              height={300}
                              {...this.state}
                              chartMode={'AUM'}
                              parentId={'chart-AUM'}
                              theme={this.props.theme}
                              isMobile={this.props.isMobile}
                              themeMode={this.props.themeMode}
                              contracts={this.props.contracts}
                              apiResults={this.state.apiResults}
                              idleVersion={this.state.idleVersion}
                              apiResults_unfiltered={this.state.apiResults_unfiltered}
                          />
                          </Flex>
                      </Flex>
                      </DashboardCard>
                      <DashboardCard
                      cardProps={{
                          mr:4,
                          height:'fit-content',
                          style:this.props.isMobile ? {width:'100%'} : {width:'32vw'}
                      }}
                      >
                      <Flex id='chart-APR' width={1}>
                          <Flex
                          mb={3}
                          width={1}
                          flexDirection={'column'}
                          alignItems={'flex-start'}
                          justifyContent={'center'}
                          >
                          <Heading.h4
                              mb={2}
                              ml={3}
                              mt={3}
                              fontWeight={4}
                              fontSize={[2,3]}
                              textAlign={'left'}
                              color={'dark-gray'}
                              lineHeight={'initial'}
                          >
                              APRs
                          </Heading.h4>
                          <StatsChart
                              height={300}
                              {...this.state}
                              chartMode={'APR'}
                              parentId={'chart-APR'}
                              theme={this.props.theme}
                              isMobile={this.props.isMobile}
                              themeMode={this.props.themeMode}
                              contracts={this.props.contracts}
                              apiResults={this.state.apiResults}
                              idleVersion={this.state.idleVersion}
                              apiResults_unfiltered={this.state.apiResults_unfiltered}
                          />
                          </Flex>
                      </Flex>
                      </DashboardCard>
                      <DashboardCard
                      cardProps={{
                          mr:4,
                          height:'fit-content',
                          style:this.props.isMobile ? {width:'100%'} : {width:'32vw'}
                      }}
                      >
                      <Flex id='chart-VOL' width={1}>
                        <Flex
                          mb={3}
                          width={1}
                          flexDirection={'column'}
                          alignItems={'flex-start'}
                          justifyContent={'center'}
                        >
                          <Heading.h4
                            mb={2}
                            ml={3}
                            mt={3}
                            fontWeight={4}
                            fontSize={[2,3]}
                            textAlign={'left'}
                            color={'dark-gray'}
                            lineHeight={'initial'}
                          >
                              Volume
                          </Heading.h4>
                          <StatsChart
                              height={300}
                              {...this.state}
                              chartMode={'VOL'}
                              parentId={'chart-VOL'}
                              theme={this.props.theme}
                              isMobile={this.props.isMobile}
                              themeMode={this.props.themeMode}
                              contracts={this.props.contracts}
                              apiResults={this.state.apiResults}
                              idleVersion={this.state.idleVersion}
                              apiResults_unfiltered={this.state.apiResults_unfiltered}
                          />
                          </Flex>
                      </Flex>
                      </DashboardCard>
                  </Flex>
                  </Flex>
                */
              }
            </Box>
          )
        }
        <DateRangeModal
          {...this.props}
          minDate={this.state.minDate}
          maxDate={this.state.maxDate}
          handleSelect={this.setDateRange}
          quickSelections={this.quickSelections}
          isOpen={this.state.dateRangeModalOpened}
          closeModal={e => this.setDateRangeModal(false)}
          startDate={this.state.startTimestampObj ? this.state.startTimestampObj._d : null}
          endDate={this.state.endTimestampObj ? this.state.endTimestampObj._d : null}
        />
        </Flex>
    );
  }
}
export default StatsTranche