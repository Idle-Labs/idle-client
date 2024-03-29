import { Flex } from "rimble-ui";
import React, { Component } from 'react';
import TableRow from '../TableRow/TableRow';
import TableHeader from '../TableHeader/TableHeader';
import FunctionsUtil from '../utilities/FunctionsUtil';
import TrancheField from '../TrancheField/TrancheField';

class TranchesList extends Component {

  state = {};

  // Utils
  functionsUtil = null;

  loadUtils(){
    if (this.functionsUtil){
      this.functionsUtil.setProps(this.props);
    } else {
      this.functionsUtil = new FunctionsUtil(this.props);
    }
  }

  async componentDidMount(){
    this.loadUtils();
  }

  async componentDidUpdate(prevProps, prevState) {
    this.loadUtils();
  }

  render() {

    let enabledProtocols = this.props.enabledProtocols;
    if (!enabledProtocols || !enabledProtocols.length){
      enabledProtocols = Object.keys(this.props.availableTranches);
    }
    const depositedTokens=this.props.depositedTokens;
    return (
      <Flex id="tranches-list-container" width={1} flexDirection={'column'}>
        <TableHeader
          {...this.props}
          cols={this.props.cols}
          isMobile={this.props.isMobile}
          colsProps={this.props.colsProps}
        />
       {
         this.props.isDeposit?
       (
         depositedTokens &&
        <Flex id="tranches-list" flexDirection={'column'}>
          {
            depositedTokens.map( token => {
              const tokenConfig = this.props.availableTranches[token.protocol][token.token];
              return (
                <TableRow
                  {...this.props}
                  token={token.token}
                  addTokenName={false}
                  tranche={token.tranche}
                  protocol={token.protocol}
                  tokenConfig={tokenConfig}
                  rowId={`tranche-col-${token.protocol}`}
                  cardId={`tranche-card-${token.protocol}`}
                  fieldComponent={this.props.fieldComponent || TrancheField}
                  key={`tranche-${token.protocol}-${token.token+token.tranche}`}
                  trancheConfig={token.tranche==="AA"?tokenConfig.AA:tokenConfig.BB}
                />
              )
            })
          }
        </Flex>
       ):
       (
         <Flex id="tranches-list" flexDirection={'column'}>
          {
            enabledProtocols.map(protocol => {
              const protocolConfig = this.props.availableTranches[protocol];
              if (!protocolConfig){
                return null;
              }
              const tranche = this.props.trancheType || null;
              return Object.keys(protocolConfig).map( token => {
                return(
                  <TableRow
                    {...this.props}
                    token={token}
                    tranche={tranche}
                    protocol={protocol}
                    rowId={`tranche-col-${protocol}`}
                    tokenConfig={protocolConfig[token]}
                    cardId={`tranche-card-${protocol}`}
                    key={`tranche-${protocol}-${token}`}
                    fieldComponent={this.props.fieldComponent || TrancheField}
                  />
                  )
               })
            })
          }
        </Flex>
        )
        }
      </Flex>
    );
  }
}

export default TranchesList;
