import React, { Component } from 'react';
import SmartNumber from '../SmartNumber/SmartNumber';
import { Text, Icon, Image, Button } from "rimble-ui";
import FunctionsUtil from '../utilities/FunctionsUtil';

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

    let CustomComponent = null;
    let componentHasChildren = false;
    const fieldType = fieldInfo.type;
    const fieldPath = fieldInfo.path;
    let customValue = fieldPath ? this.functionsUtil.getArrayPath(fieldPath,this.props.row) : null;

    switch (fieldType){
      case 'image':
        CustomComponent = Image;
        fieldProps.src = customValue;
      break;
      case 'number':
        customValue = this.functionsUtil.BNify(customValue).toString();
        CustomComponent = SmartNumber;
        fieldProps.number = customValue;
      break;
      case 'icon':
        CustomComponent = Icon;
        fieldProps.name = customValue;
      break;
      case 'button':
        CustomComponent = Button;
        componentHasChildren = true;
        customValue = fieldInfo.label || fieldProps.label;
        fieldProps.onClick=() => fieldProps.handleClick(this.props)
      break;
      default:
        CustomComponent = Text;
        componentHasChildren = true;
      break;
    }

    if (!customValue){
      return null;
    }

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

    return CustomComponent ? (componentHasChildren ? (<CustomComponent {...fieldProps}>{customValue}</CustomComponent>) : (<CustomComponent {...fieldProps} />) ) : null;
  }
}

export default CustomField;