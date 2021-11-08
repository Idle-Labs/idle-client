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

    return (
      <Flex id="tranches-list-container" width={1} flexDirection={'column'}>
        <TableHeader
          {...this.props}
          cols={this.props.cols}
          isMobile={this.props.isMobile}
        />
        <Flex id="tranches-list" flexDirection={'column'}>
          {
            enabledProtocols.map(protocol => {
              const protocolConfig = this.props.availableTranches[protocol];
              if (!protocolConfig){
                return null;
              }
              const tranche = this.props.trancheType || null;
              return Object.keys(protocolConfig).map( token => (
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
              ))
            })
          }
        </Flex>
      </Flex>
    );
  }
}

export default TranchesList;
