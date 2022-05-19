import { Flex } from "rimble-ui";
import React, { Component } from 'react';
import ConnectBox from '../ConnectBox/ConnectBox';
import FunctionsUtil from '../utilities/FunctionsUtil';
import TxProgressBar from '../TxProgressBar/TxProgressBar';

class ExecuteTransaction extends Component {

  state = {
    txStatus:null,
    processing:{
      txHash:null,
      loading:false
    }
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
  }

  async componentDidUpdate(prevProps,prevState){
    this.loadUtils();
  }

  async cancelTransaction(){
    this.setState({
      processing: {
        txHash:null,
        loading:false
      }
    });
  }

  async execute(){

    const callback = (tx,error) => {

      // Send Google Analytics event
      const eventData = {
        eventCategory: 'Transaction',
        eventLabel: this.props.methodName,
        eventAction: this.props.contractName
      };

      if (error){
        eventData.eventLabel = this.functionsUtil.getTransactionError(error);
      }

      // Send Google Analytics event
      if (error || eventData.status !== 'error'){
        this.functionsUtil.sendGoogleAnalyticsEvent(eventData);
      }

      const txSucceeded = tx && tx.status === 'success';
      if (txSucceeded){
        if (typeof this.props.callback === 'function'){
          this.props.callback(tx);
        }
      }

      this.setState({
        processing: {
          txHash:null,
          loading:false
        },
        txStatus:tx ? tx.status : null
      });
    };

    const callbackReceipt = (tx) => {
      const txHash = tx.transactionHash;
      this.setState((prevState) => ({
        txStatus:'processing',
        processing: {
          ...prevState.processing,
          txHash
        }
      }));
    };

    this.setState((prevState) => ({
      txStatus:'loading',
      processing: {
        ...prevState.processing,
        loading:true
      }
    }));

    let params = this.props.params;
    if (typeof this.props.getTransactionParams === 'function'){
      params = this.props.getTransactionParams();
    } else if (typeof this.props.getTransactionParamsAsync === 'function'){
      params = await this.props.getTransactionParamsAsync();
    } else if (typeof this.props.transactionParams === 'object'){
      params = this.props.transactionParams;
    }

    // console.log('ExecuteTransaction',this.props.contractName,this.props.methodName,params);

    if (!params || !this.props.contractName){
      this.setState((prevState) => ({
        txStatus:null,
        processing: {
          ...prevState.processing,
          loading:false
        }
      }));
      return false;
    }

    if (this.props.sendRawTransaction){
      this.functionsUtil.contractMethodSendWrapper(this.props.contractName,this.props.methodName,params,callback,callbackReceipt,null,true,params);
    } else {
      this.functionsUtil.contractMethodSendWrapper(this.props.contractName,this.props.methodName,params,callback,callbackReceipt);
    }
  }

  render() {
    const ExecuteComponent = this.props.Component;
    return (
      <Flex
        {...this.props.parentProps}
      >
        {
          !this.props.account ? (
           <ConnectBox
             {...this.props}
           />
         ) : this.state.txStatus === 'success' && this.props.children ?
            this.props.children
          : this.state.processing && this.state.processing.loading ? (
            <TxProgressBar
              web3={this.props.web3}
              network={this.props.network}
              {...this.props.progressBarProps}
              hash={this.state.processing.txHash}
              cancelTransaction={this.cancelTransaction.bind(this)}
              endMessage={`Finalizing ${this.props.action} request...`}
              waitText={`${this.functionsUtil.capitalize(this.props.action)} estimated in`}
            />
          ) : (
            <ExecuteComponent
              onClick={this.execute.bind(this)}
              {...this.props.componentProps}
            >
              {this.props.componentProps.value}
            </ExecuteComponent>
          )
        }
      </Flex>
    );
  }
}

export default ExecuteTransaction;