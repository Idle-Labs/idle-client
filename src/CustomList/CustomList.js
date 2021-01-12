import { Flex } from "rimble-ui";
import React, { Component } from 'react';
import TableRow from '../TableRow/TableRow';
import CustomField from '../CustomField/CustomField';
import TableHeader from '../TableHeader/TableHeader';
import FunctionsUtil from '../utilities/FunctionsUtil';

class CustomList extends Component {

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

    return (
      <Flex id="custom-list-container" width={1} flexDirection={'column'}>
        <TableHeader
          {...this.props}
          cols={this.props.cols}
          isMobile={this.props.isMobile}
        />
        <Flex id="custom-list" flexDirection={'column'}>
          {
            this.props.rows.map( (row,rowIndex) => {
              return (
                <TableRow
                  row={row}
                  {...this.props}
                  key={`asset-${rowIndex}`}
                  fieldComponent={CustomField}
                  rowId={`asset-col-${rowIndex}`}
                  cardId={`asset-card-${rowIndex}`}
                />
              );
            })
          }
        </Flex>
      </Flex>
    );
  }
}

export default CustomList;