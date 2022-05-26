import { Line } from '@nivo/line';
import CountUp from 'react-countup';
import React, { Component } from 'react';
import AssetField from '../AssetField/AssetField';
import CustomField from '../CustomField/CustomField';
import TooltipText from '../TooltipText/TooltipText';
import RoundButton from '../RoundButton/RoundButton';
import FunctionsUtil from '../utilities/FunctionsUtil';
import GenericChart from '../GenericChart/GenericChart';
import CustomTooltip from '../CustomTooltip/CustomTooltip';
import CustomTooltipRow from '../CustomTooltip/CustomTooltipRow';
import { Image, Text, Loader, Flex, Icon, Tooltip } from "rimble-ui";

class TrancheField extends Component {

  state = {
    ready:false
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

  async componentWillUnmount(){
    this.componentUnmounted = true;
  }

  async componentWillMount(){
    this.loadUtils();
  }

  async componentDidMount(){
    this.loadField();
    // console.log('componentDidMount',this.props.protocol,this.props.token,this.props.tranche);
  }

  async setStateSafe(newState,callback=null) {
    if (!this.componentUnmounted){
      return this.setState(newState,callback);
    }
    return null;
  }

  async componentDidUpdate(prevProps, prevState) {
    this.loadUtils();

    const tokenChanged = prevProps.token !== this.props.token;
    const accountChanged = prevProps.account !== this.props.account;
    const trancheChanged = prevProps.tranche !== this.props.tranche;
    const mobileChanged = prevProps.isMobile !== this.props.isMobile;
    const protocolChanged = prevProps.protocol !== this.props.protocol;
    const themeModeChanged = prevProps.themeMode !== this.props.themeMode;
    const fieldChanged = prevProps.fieldInfo.name !== this.props.fieldInfo.name;
    const contractsInitialized = !prevProps.contractsInitialized && this.props.contractsInitialized;
    const portfolioChanged = this.props.portfolio ? ((this.props.portfolio && !prevProps.portfolio) || JSON.stringify(this.props.portfolio) !== JSON.stringify(prevProps.portfolio)) : false;
    const requiredNetworkChanged = (!prevProps.network && this.props.network) || (prevProps.network && this.props.network && JSON.stringify(prevProps.network.required) !== JSON.stringify(this.props.network.required));
    const transactionsChanged = prevProps.transactions && this.props.transactions && Object.values(prevProps.transactions).filter(tx => (tx.status==='success')).length !== Object.values(this.props.transactions).filter(tx => (tx.status==='success')).length;

    if (fieldChanged || tokenChanged || protocolChanged || trancheChanged || portfolioChanged || accountChanged || transactionsChanged || contractsInitialized || requiredNetworkChanged){
      // console.log('componentDidUpdate-1',fieldChanged,tokenChanged,protocolChanged,trancheChanged,accountChanged,transactionsChanged,(contractsInitialized && !this.state.ready));
      this.setStateSafe({
        ready:false
      },() => {
        this.loadField();
      });
    } else if (mobileChanged || themeModeChanged){
      // console.log('componentDidUpdate-2',mobileChanged,themeModeChanged);
      const oldState = Object.assign({},this.state);
      this.setStateSafe({
        ready:false
      },() => {
        this.setState(oldState);
      });
    }
  }

  loadField = async(fieldName=null) => {

    if (this.componentUnmounted || !this.props.protocol || !this.props.token || !this.props.tokenConfig || !this.props.contractsInitialized){
      return false;
    }

    const setState = fieldName === null;
    const fieldInfo = this.props.fieldInfo;
    if (!fieldName){
      fieldName = fieldInfo.name;
    }

    const fieldProps = fieldInfo.props;
    const addGovTokens = typeof this.props.addGovTokens !== 'undefined' ? this.props.addGovTokens : true;
    const formatValue = typeof this.props.formatValue !== 'undefined' ? this.props.formatValue : true;
    const addTokenName = typeof this.props.addTokenName !== 'undefined' ? this.props.addTokenName : true;

    const tranchesConfig = this.functionsUtil.getGlobalConfig(['tranches']);
    const seniorTrancheName = this.functionsUtil.capitalize(tranchesConfig.AA.baseName);
    const juniorTrancheName = this.functionsUtil.capitalize(tranchesConfig.BB.baseName);

    let output = null;
    if (this.props.token){
      switch (fieldName){
        case 'aprChart':
          // Set start timestamp for v3 tokens
          const endTimestamp = parseInt(Date.now()/1000);
          const startTimestamp = endTimestamp-(7*24*60*60);

          // Check for cached data
          let aprChartData = [];
          const cachedDataKey = `trancheAprChart_${this.props.tokenConfig.address}`;
          const cachedData = this.functionsUtil.getCachedData(cachedDataKey);

          if (cachedData !== null && cachedData[0] && cachedData[0].data && cachedData[0].data.length>0){
            aprChartData = cachedData;
          } else {
            const [
              apiResults_aa,
              apiResults_bb
            ] = await Promise.all([
              this.functionsUtil.getSubgraphTrancheInfo(this.props.tokenConfig.AA.address,startTimestamp,endTimestamp),
              this.functionsUtil.getSubgraphTrancheInfo(this.props.tokenConfig.BB.address,startTimestamp,endTimestamp)
            ]);

            let itemIndex = 0;
            let maxChartValue = 0;
            const totalItems_aa = apiResults_aa.length;
            const totalItems_bb = apiResults_bb.length;

            aprChartData.push({
              color:tranchesConfig.AA.color.hex,
              id:`${this.props.token} ${seniorTrancheName} APY`,
              data:apiResults_aa.map((d,i) => {
                const x = this.functionsUtil.strToMoment(d.timeStamp*1000).format("YYYY/MM/DD HH:mm");
                const y = parseFloat(this.functionsUtil.apr2apy(this.functionsUtil.fixTokenDecimals(d.apr,18).div(100)).times(100));
                maxChartValue = Math.max(maxChartValue,y);
                const itemPos = Math.floor(itemIndex++/totalItems_aa*100);
                return { x, y, itemPos };
              })
            });

            itemIndex = 0;
            aprChartData.push({
              color:tranchesConfig.BB.color.hex,
              id:`${this.props.token} ${juniorTrancheName} APY`,
              data:apiResults_bb.map((d,i) => {
                const x = this.functionsUtil.strToMoment(d.timeStamp*1000).format("YYYY/MM/DD HH:mm");
                const y = parseFloat(this.functionsUtil.apr2apy(this.functionsUtil.fixTokenDecimals(d.apr,18).div(100)).times(100));
                maxChartValue = Math.max(maxChartValue,y);
                const itemPos = Math.floor(itemIndex++/totalItems_bb*100);
                return { x, y, itemPos };
              })
            });

            if (aprChartData.length && aprChartData[0].data.length>0){
              this.functionsUtil.setCachedData(cachedDataKey,aprChartData);
            }
          }

          // Add same value
          if (aprChartData[0].data.length === 1){
            const newPoint = Object.assign({},aprChartData[0].data[0]);
            newPoint.x = this.functionsUtil.strToMoment(newPoint,"YYYY/MM/DD HH:mm").add(1,'hours').format("YYYY/MM/DD HH:mm")
            aprChartData[0].data.push(newPoint);
          }

          let aprChartWidth = 0;
          let aprChartHeight = 0;

          const resizeAprChart = () => {
            const aprChartRowElement = this.props.parentId && document.getElementById(this.props.parentId) ? document.getElementById(this.props.parentId) : document.getElementById(this.props.rowId);
            if (aprChartRowElement){
              const $aprChartRowElement = window.jQuery(aprChartRowElement);
              aprChartWidth = $aprChartRowElement.innerWidth()-parseFloat($aprChartRowElement.css('padding-right'))-parseFloat($aprChartRowElement.css('padding-left'));
              aprChartHeight = $aprChartRowElement.innerHeight();
              if (aprChartWidth !== this.state.aprChartWidth || !this.state.aprChartHeight){
                this.setStateSafe({
                  aprChartWidth,
                  aprChartHeight: this.state.aprChartHeight ? this.state.aprChartHeight : aprChartHeight
                });
              }
            }
          }

          // Set chart width and Height and set listener
          resizeAprChart();
          window.removeEventListener('resize', resizeAprChart.bind(this));
          window.addEventListener('resize', resizeAprChart.bind(this));

          // Set chart type
          const aprChartType = Line;

          const aprChartProps = {
            pointSize:0,
            lineWidth:1,
            useMesh:false,
            axisLeft:null,
            animate:false,
            axisBottom:null,
            enableArea:true,
            areaOpacity:0.1,
            curve:'monotoneX',
            enableGridX:false,
            enableGridY:false,
            pointBorderWidth:2,
            isInteractive:true,
            colors:d => d.color,
            enableSlices:this.props.isMobile ? false : 'x',
            yFormat:value => parseFloat(value).toFixed(2)+'%',
            fill:[
              { match: { id: this.props.token } , id: 'gradientArea' },
            ],
            margin: { top: 10, right: 0, bottom: 0, left: 0 },
            sliceTooltip:(slideData) => {
              const { slice } = slideData;
              const point = slice.points[0];
              return (
                <CustomTooltip
                  point={point}
                >
                  {
                  typeof slice.points === 'object' && slice.points.length &&
                    slice.points.map(point => {
                      const protocolName = point.serieId;
                      const protocolEarning = point.data.yFormatted;
                      // const protocolApy = point.data.apy;
                      return (
                        <CustomTooltipRow
                          key={point.id}
                          color={point.color}
                          label={protocolName}
                          value={protocolEarning}
                        />
                      );
                    })
                  }
                </CustomTooltip>
              );
            }
          };

          if (this.props.chartProps){
            // Replace props
            if (this.props.chartProps && Object.keys(this.props.chartProps).length){
              Object.keys(this.props.chartProps).forEach(p => {
                aprChartProps[p] = this.props.chartProps[p];
              });
            }
          }

          if (setState){
            this.setStateSafe({
              ready:true,
              aprChartType,
              aprChartData,
              aprChartProps,
              aprChartWidth,
              aprChartHeight
            });
          }
          output = aprChartData;
        break;
        default:
          output = await this.functionsUtil.loadTrancheField(fieldName,fieldProps,this.props.protocol,this.props.token,this.props.tranche,this.props.tokenConfig,this.props.trancheConfig,this.props.account,addGovTokens,formatValue,addTokenName);
          if (output !== undefined && setState){
            this.setStateSafe({
              ready:true,
              [fieldName]:output
            });
          }
        break;
      }
    }

    return output;
  }

  render(){
    let output = null;
    const fieldInfo = this.props.fieldInfo;
    const showLoader = fieldInfo.showLoader === undefined || fieldInfo.showLoader;
    const loader = showLoader ? (<Loader size="20px" />) : null;

    const fieldProps = {
      fontWeight:3,
      fontSize:[0,2],
      color:'cellText',
      flexProps:{
        justifyContent:'flex-start'
      }
    };

    // Replace props
    if (fieldInfo.props && Object.keys(fieldInfo.props).length){
      Object.keys(fieldInfo.props).forEach(p => {
        fieldProps[p] = fieldInfo.props[p];
      });
    }

    // Merge with funcProps
    if (fieldInfo.funcProps && Object.keys(fieldInfo.funcProps).length){
      Object.keys(fieldInfo.funcProps).forEach(p => {
        if (typeof fieldInfo.funcProps[p]==='function'){
          fieldProps[p] = fieldInfo.funcProps[p](this.props);
        }
      });
    }

    // const tokenName = this.functionsUtil.getGlobalConfig(['stats','tokens',this.props.token,'label']) || this.functionsUtil.capitalize(this.props.token);

    // const tokenConfig = this.props.tokenConfig;// || this.functionsUtil.getGlobalConfig(['stats','tokens',this.props.token]);
    const maxPrecision = fieldProps && parseInt(fieldProps.maxPrecision)>=0 ? fieldProps.maxPrecision : 5;
    const decimals = fieldProps && parseInt(fieldProps.decimals)>=0 ? fieldProps.decimals : ( this.props.isMobile ? 2 : 3 );
    const minPrecision = fieldProps && parseInt(fieldProps.minPrecision)>=0 ? fieldProps.minPrecision : ( this.props.isMobile ? 3 : 4 );

    // console.log('TrancheField',fieldInfo.name,fieldProps);
    const flexProps = fieldProps.flexProps;
    delete fieldProps.flexProps;

    switch (fieldInfo.name){
      case 'protocolIcon':
        const protocolConfig = this.functionsUtil.getGlobalConfig(['stats', 'protocols', this.props.protocol]);
        const protocolIcon = protocolConfig && protocolConfig.icon ? protocolConfig.icon : `${this.props.protocol}.svg`;
        output = (
          <Image src={`images/protocols/${protocolIcon}`} {...fieldProps} />
        );
      break;
      case 'experimentalBadge':
        output = null;
        if (this.state.experimentalBadge && this.functionsUtil.BNify(this.state.experimentalBadge).gt(0)){
          const limitCap = this.functionsUtil.abbreviateNumber(this.state.experimentalBadge, 2, maxPrecision, 0) + ` ${this.props.token}`;
          output = (
            <Tooltip
              placement={'top'}
              message={`This pool is experimental and has a cap limit of ${limitCap}`}
            >
              <Image src={`images/experimental.png`} {...fieldProps} />
            </Tooltip>
          );
        }
      break;
      case 'statusBadge':
        output = null;
        let badgeText = null;
        let badgeColor = null;

        if (!this.state.statusBadge){
          output = loader;
        } else {
          if (this.functionsUtil.BNify(this.state.statusBadge).gt(0)){
            badgeText = 'Experimental';
            badgeColor = 'experimental';
          } else {
            badgeText = 'Production';
            badgeColor = 'production';
          }
          output = (
            <Flex
              px={2}
              py={1}
              borderRadius={2}
              alignItems={'center'}
              justifyContent={'center'}
              backgroundColor={badgeColor}
            >
              <Text
                fontSize={1}
                fontWeight={3}
                color={'white'}
              >
                {badgeText}
              </Text>
            </Flex>
          );
        }
      break;
      case 'trancheTypeIcon':
        const trancheDetails = this.functionsUtil.getGlobalConfig(['tranches',this.props.tranche]);
        output = (
          <Flex
            p={'6px'}
            borderRadius={'50%'}
            alignItems={'center'}
            justifyContent={'center'}
            backgroundColor={`rgba(${trancheDetails.color.rgb.join(',')},0.2)`}
            {...flexProps}
          >
            <Icon
              {...fieldProps}
              align={'center'}
              name={trancheDetails.icon}
              color={trancheDetails.color.hex}
            />
          </Flex>
        );
      break;
      case 'tokenIcon':
        const tokenConfig = this.functionsUtil.getGlobalConfig(['stats','tokens',this.props.token.toUpperCase()]);
        const tokenIcon = tokenConfig && tokenConfig.icon ? tokenConfig.icon : `images/tokens/${this.props.token}.svg`;
        output = (
          <Image src={tokenIcon} {...fieldProps} />
        );
      break;
      case 'button':
        const buttonLabel = typeof fieldInfo.label === 'function' ? fieldInfo.label(this.props) : fieldInfo.label;
        output = (
          <RoundButton buttonProps={fieldProps} handleClick={() => fieldProps.handleClick(this.props) }>{buttonLabel}</RoundButton>
        );
      break;
      case 'custom':
        output = (
          <CustomField
            row={this.props}
            fieldInfo={fieldInfo}
          />
        );
      break;
      case 'feesCounter':
        output = this.state.ready && this.state.feesCounter && this.state.feesCounter.feesStart && this.state.feesCounter.feesEnd ? (
          <CountUp
            delay={0}
            decimal={'.'}
            separator={''}
            useEasing={false}
            duration={31536000}
            decimals={decimals}
            end={parseFloat(this.state.feesCounter.feesEnd)}
            start={parseFloat(this.state.feesCounter.feesStart)}
            formattingFn={ n => this.functionsUtil.abbreviateNumber(n,decimals,maxPrecision,minPrecision) }
          >
            {({ countUpRef, start }) => (
              <span style={fieldProps.style} ref={countUpRef} />
            )}
          </CountUp>
        ) : loader
      break;
      case 'earningsCounter':
        output = this.state.ready && this.state.earningsCounter && this.state.earningsCounter.earningsStart && this.state.earningsCounter.earningsEnd ? (
          <CountUp
            delay={0}
            decimal={'.'}
            separator={''}
            useEasing={false}
            duration={31536000}
            decimals={decimals}
            end={parseFloat(this.state.earningsCounter.earningsEnd)}
            start={parseFloat(this.state.earningsCounter.earningsStart)}
            formattingFn={ n => this.functionsUtil.abbreviateNumber(n,decimals,maxPrecision,minPrecision) }
          >
            {({ countUpRef, start }) => (
              <span style={fieldProps.style} ref={countUpRef} />
            )}
          </CountUp>
        ) : loader
      break;
      case 'trancheApyWithTooltip':
        if (this.state[fieldInfo.name]){
          let tooltipMessage = [`${this.props.token}: ${this.state[fieldInfo.name].baseApy.toFixed(decimals)+'%'}`];
          Object.keys(this.state[fieldInfo.name].tokensApy).forEach( govToken => {
            const value = this.state[fieldInfo.name].tokensApy[govToken].toFixed(decimals);
            tooltipMessage.push(`${govToken}: ${value}%`);
            // return `${govToken}: ${value}%`;
          });//.join("; ");
          tooltipMessage = tooltipMessage.join('; ');
          const formattedApy = this.state[fieldInfo.name].formattedApy;
          if (Object.keys(this.state[fieldInfo.name].tokensApy).length>0){
            output = (
              <TooltipText
                tooltipProps={{
                  placement:"right"
                }}
                text={formattedApy}
                textProps={fieldProps}
                message={tooltipMessage}
              />
            );
          } else {
            output = (<Text {...fieldProps} dangerouslySetInnerHTML={{__html:formattedApy}}></Text>);
          }
        } else {
          output = (this.state[fieldInfo.name] === undefined ? loader : null);
        }
      break;
      case 'aprChart':
        output = this.state.aprChartData ? (
          <GenericChart
            {...this.state.aprChartProps}
            type={this.state.aprChartType}
            data={this.state.aprChartData}
            width={this.state.aprChartWidth}
            height={this.state.aprChartHeight}
          />
        ) : loader
      break;
      case 'govTokens':
      case 'autoFarming':
      case 'stakingRewards':
        output = this.state[fieldInfo.name] && Object.keys(this.state[fieldInfo.name]).length>0 ? (
          <Flex
            width={1}
            alignItems={'center'}
            flexDirection={'row'}
            justifyContent={'flex-start'}
            {...fieldInfo.parentProps}
          >
            {
              Object.keys(this.state[fieldInfo.name]).map( (govToken,govTokenIndex) => {
                const govTokenConfig = this.state[fieldInfo.name][govToken];
                return (
                  <AssetField
                    token={govToken}
                    tokenConfig={govTokenConfig}
                    key={`asset_${govTokenIndex}`}
                    fieldInfo={{
                      name:'iconTooltip',
                      tooltipProps:{
                        message:`${govToken}`+(this.state.getGovTokensDistributionSpeed && this.state.getGovTokensDistributionSpeed[govToken] ? `: ${this.state.getGovTokensDistributionSpeed[govToken].toFixed(decimals)}/${govTokenConfig.distributionFrequency} (for the whole pool)` : '')
                      },
                      props:{
                        borderRadius:'50%',
                        position:'relative',
                        height:['1.4em','2em'],
                        ml:govTokenIndex ? '-10px' : 0,
                        zIndex:Object.values(this.state[fieldInfo.name]).length-govTokenIndex,
                        boxShadow:['1px 1px 1px 0px rgba(0,0,0,0.1)','1px 2px 3px 0px rgba(0,0,0,0.1)'],
                      }
                    }}
                  />
                );
              })
            }
          </Flex>
        ) : this.state[fieldInfo.name] ? (
          <Text {...fieldProps}>-</Text>
        ) : loader
      break;
      default:
        let formattedValue = this.state[fieldInfo.name];
        if (this.state[fieldInfo.name] && this.state[fieldInfo.name]._isBigNumber){
          formattedValue = this.state[fieldInfo.name].toFixed(decimals);
        }

        output = this.state[fieldInfo.name] ? (
          <Text {...fieldProps} dangerouslySetInnerHTML={{__html:formattedValue}}></Text>
        ) : (this.state[fieldInfo.name] === undefined ? loader : null)
      break;
    }
    return output;
  }
}

export default TrancheField;
