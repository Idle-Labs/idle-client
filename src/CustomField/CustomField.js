import React, { Component } from 'react';
import AssetField from '../AssetField/AssetField';
import SmartNumber from '../SmartNumber/SmartNumber';
import RoundButton from '../RoundButton/RoundButton';
import FunctionsUtil from '../utilities/FunctionsUtil';
import { Text, Icon, Image, Link, Flex, Loader } from "rimble-ui";

class CustomField extends Component {

  state = {};

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
    
  }

  async componentDidUpdate(prevProps, prevState) {
    this.loadUtils();
  }

  render(){
    const fieldInfo = this.props.fieldInfo;

    const fieldProps = {
      fontWeight:3,
      fontSize:[0,2],
      color:'cellText'
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

    let output = null;
    let CustomComponent = null;
    let componentHasChildren = false;
    const fieldType = fieldInfo.type;
    const fieldPath = fieldInfo.path;
    const showLoader = !!fieldInfo.showLoader;
    let customValue = fieldPath ? this.functionsUtil.getArrayPath(fieldPath,this.props.row) : null;

    // Add custom field extra props
    if (fieldPath){
      const customFieldName = Object.values(fieldPath).pop();
      if (this.props.row[`${customFieldName}Props`]){
        const customFieldProps = this.props.row[`${customFieldName}Props`];
        // Replace props
        if (customFieldProps && Object.keys(customFieldProps).length){
          Object.keys(customFieldProps).forEach(p => {
            fieldProps[p] = customFieldProps[p];
          });
        }
      }
    }

    switch (fieldType){
      case 'image':
        CustomComponent = Image;
        fieldProps.src = customValue;
      break;
      case 'number':
        customValue = customValue ? this.functionsUtil.BNify(customValue).toString() : null;
        CustomComponent = SmartNumber;
        fieldProps.number = customValue;
      break;
      case 'link':
        CustomComponent = Link;
      break;
      case 'icon':
        CustomComponent = Icon;
        fieldProps.name = customValue;
      break;
      case 'bgIcon':
        CustomComponent = (props) => (
          <Flex
            p={'5px'}
            borderRadius={'50%'}
            alignItems={'center'}
            justifyContent={'center'}
            backgroundColor={props.bgColor}
          >
            <Icon
              align={'center'}
              name={customValue}
              color={props.color}
              size={this.props.isMobile ? '1em' : '1.4em'}
            />
          </Flex>
        );
        fieldProps.name = customValue;
      break;
      case 'button':
        componentHasChildren = true;
        CustomComponent = RoundButton;
        customValue = fieldInfo.label || fieldProps.label;
        fieldProps.onClick=() => fieldProps.handleClick(this.props)
        fieldProps.buttonProps = fieldProps;
      break;
      case 'html':
        output = (<Text {...fieldProps} dangerouslySetInnerHTML={{
          __html: customValue
        }} />);
      break;
      case 'tokensList':
        output = customValue && Object.keys(customValue).length>0 ? (
          <Flex
            width={1}
            alignItems={'center'}
            flexDirection={'row'}
            justifyContent={'flex-start'}
            {...fieldInfo.parentProps}
          >
            {
              Object.keys(customValue).map( (token,tokenIndex) => {
                const tokenConfig = customValue[token];
                return (
                  <AssetField
                    token={token}
                    tokenConfig={tokenConfig}
                    key={`asset_${tokenIndex}`}
                    fieldInfo={{
                      name:'iconTooltip',
                      tooltipProps:{
                        message:`${token}`
                      },
                      props:{
                        borderRadius:'50%',
                        position:'relative',
                        height:['1.4em','2em'],
                        ml:tokenIndex ? '-10px' : 0,
                        zIndex:Object.values(customValue).length-tokenIndex,
                        boxShadow:['1px 1px 1px 0px rgba(0,0,0,0.1)','1px 2px 3px 0px rgba(0,0,0,0.1)'],
                      }
                    }}
                  />
                );
              })
            }
          </Flex>
        ) : null;
      break;
      default:
        CustomComponent = Text;
        componentHasChildren = true;
      break;
    }

    if (!customValue && showLoader){
      return (<Loader size="20px" />);
    }

    return CustomComponent ? (componentHasChildren ? (<CustomComponent {...fieldProps}>{customValue}</CustomComponent>) : (<CustomComponent {...fieldProps} />) ) : output;
  }
}

export default CustomField;