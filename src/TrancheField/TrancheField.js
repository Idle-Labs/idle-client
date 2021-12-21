// import { Line } from '@nivo/line';
import CountUp from 'react-countup';
import React, { Component } from 'react';
import AssetField from '../AssetField/AssetField';
import CustomField from '../CustomField/CustomField';
// import SmartNumber from '../SmartNumber/SmartNumber';
import FunctionsUtil from '../utilities/FunctionsUtil';
// import GenericChart from '../GenericChart/GenericChart';
// import CustomTooltip from '../CustomTooltip/CustomTooltip';
import { Image, Text, Loader, Button, Flex, Icon, Tooltip } from "rimble-ui";
// import VariationNumber from '../VariationNumber/VariationNumber';
// import AllocationChart from '../AllocationChart/AllocationChart';
// import CustomTooltipRow from '../CustomTooltip/CustomTooltipRow';

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
    const requiredNetworkChanged = (!prevProps.network && this.props.network) || (prevProps.network && this.props.network && JSON.stringify(prevProps.network.required) !== JSON.stringify(this.props.network.required));
    const transactionsChanged = prevProps.transactions && this.props.transactions && Object.values(prevProps.transactions).filter(tx => (tx.status==='success')).length !== Object.values(this.props.transactions).filter(tx => (tx.status==='success')).length;

    if (fieldChanged || tokenChanged || protocolChanged || trancheChanged || accountChanged || transactionsChanged || contractsInitialized || requiredNetworkChanged){
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

    let output = null;
    if (this.props.token){
      switch (fieldName){
        default:
          output = await this.functionsUtil.loadTrancheField(fieldName,fieldProps,this.props.protocol,this.props.token,this.props.tranche,this.props.tokenConfig,this.props.trancheConfig,this.props.account,addGovTokens,formatValue,addTokenName);
          if (output && setState){
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
    const fieldInfo = this.props.fieldInfo;
    let output = null;

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
    const maxPrecision = fieldProps && fieldProps.maxPrecision ? fieldProps.maxPrecision : 5;
    const decimals = fieldProps && fieldProps.decimals ? fieldProps.decimals : ( this.props.isMobile ? 2 : 3 );
    const minPrecision = fieldProps && fieldProps.minPrecision ? fieldProps.minPrecision : ( this.props.isMobile ? 3 : 4 );

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
        if (this.props.tokenConfig.experimental){
          output = (
            <Tooltip
              placement={'top'}
              message={`This pool is experimental, use at your own risk.`}
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
        if (this.props.tokenConfig.experimental){
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
          <Button {...fieldProps} onClick={() => fieldProps.handleClick(this.props) }>{buttonLabel}</Button>
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
        output = this.state.ready && this.state.feesCounter.feesStart && this.state.feesCounter.feesEnd ? (
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
        ) : loader
      break;
    }
    return output;
  }
}

export default TrancheField;
