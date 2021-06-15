import React, { Component } from 'react';
import { Text, Loader } from "rimble-ui";
import FunctionsUtil from '../FunctionsUtil';

class ShortHash extends Component {

  state = {
    text:null
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

  async componentWillMount(){
    this.loadUtils();
    this.loadData();
  }

  async componentWillUnmount(){
    this.componentUnmounted = true;
  }

  async componentDidUpdate(prevProps,prevState){
    this.loadUtils();
    const hashChanged = prevProps.hash !== this.props.hash;
    if (hashChanged){
      this.loadData();
    }
  }

  async setStateSafe(newState,callback=null) {
    if (!this.componentUnmounted){
      return this.setState(newState,callback);
    }
    return null;
  }

  async loadData(){
    const resolveAddress = this.props.resolveAddress !== false;
    let text = this.functionsUtil.shortenHash(this.props.hash);
    const ensName = resolveAddress ? await this.functionsUtil.getENSName(this.props.hash) : null;
    if (ensName){
      text = ensName;
    }
    this.setStateSafe({
      text
    });
  }

  render() {
    const loader = (<Loader size="20px" />);
    return this.state.text ? <Text display={'inline'} {...this.props}>{this.state.text}</Text> : loader;
  }
}

export default ShortHash;