import React, { Component } from 'react';
import { Flex, Text, Blockie, Loader } from "rimble-ui";
import FunctionsUtil from '../../utilities/FunctionsUtil';

class DelegateField extends Component {

  state = {
    value:null
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
    this.loadData();
  }

  async componentDidUpdate(prevProps, prevState) {
    this.loadUtils();
    const delegateChanged = JSON.stringify(prevProps.delegate) !== JSON.stringify(this.props.delegate);
    if (delegateChanged){
      this.loadData();
    }
  }

  async loadData(){
    const fieldInfo = this.props.fieldInfo;
    const delegate = Object.assign({},this.props.delegate);

    let value = delegate[fieldInfo.name];
    switch (fieldInfo.name){
      case 'votes':
        value = this.functionsUtil.formatMoney(this.functionsUtil.BNify(value).toFixed(2,1),2);
      break;
      case 'delegators':
        value = delegate.delegators.length;
      break;
      case 'delegate':
        const ensName = await this.functionsUtil.getENSName(value);
        value = ensName || value;
      break;
      default:
      break;
    }

    this.setState({
      value
    });
  }

  render(){
    let output = null;
    const fieldInfo = this.props.fieldInfo;
    const delegate = Object.assign({},this.props.delegate);

    const fieldProps = {
      fontWeight:3,
      fontSize:[0,2],
      color:'cellText',
      style:{
        maxWidth:'100%',
        overflow: 'hidden',
        textOverflow: 'ellipsis'
      },
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

    switch (fieldInfo.name){
      case 'avatar':
        output = (
          <Flex
            {...fieldProps}
            alignItems={'center'}
            justifyContent={'center'}
          >
            <Blockie
              opts={{
                size: 7,
                color: "#dfe",
                bgcolor: "#a71",
                spotcolor: "#000",
                seed: delegate.delegate,
              }}
            />
          </Flex>
        );
      break;
      default:
        output = this.state.value !== null ? (
          <Text
            {...fieldProps}
          >
            {this.state.value}
          </Text>
        ) : (<Loader size={"20px"} />);
      break;
    }
    return output;
  }
}

export default DelegateField;
