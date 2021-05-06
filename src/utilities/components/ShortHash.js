import React, { Component } from 'react';
import { Text, Loader } from "rimble-ui";
import FunctionsUtil from '../FunctionsUtil';

class ShortHash extends Component {

  state = {
    text:null
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

  async componentDidUpdate(prevProps,prevState){
    this.loadUtils();
  }

  async loadData(){
    const resolveAddress = this.props.resolveAddress !== false;
    let text = this.functionsUtil.shortenHash(this.props.hash);
    const ensName = resolveAddress ? await this.functionsUtil.getENSName(this.props.hash) : null;
    // console.log('ShortHash',resolveAddress,this.props.hash,ensName);
    if (ensName){
      text = ensName;
    }
    this.setState({
      text
    });
  }

  render() {
    const loader = (<Loader size="20px" />);
    return this.state.text ? <Text display={'inline'} {...this.props}>{this.state.text}</Text> : loader;
  }
}

export default ShortHash;