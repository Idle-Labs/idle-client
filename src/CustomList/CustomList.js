import React, { Component } from 'react';
import TableRow from '../TableRow/TableRow';
import { Flex, Link, Icon, Text } from "rimble-ui";
import CustomField from '../CustomField/CustomField';
import TableHeader from '../TableHeader/TableHeader';
import FunctionsUtil from '../utilities/FunctionsUtil';

class CustomList extends Component {

  state = {
    page:1,
    rowsPerPage:5,
    totalPages:null,
    processedRows:null
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
    this.processRows();
  }

  async componentDidUpdate(prevProps, prevState) {
    this.loadUtils();

    const rowsChanged = JSON.stringify(prevProps.rows) !== JSON.stringify(this.props.rows);

    if (rowsChanged){
      this.setState({
        page:1,
      },()=>{
        this.processRows();
      })
      return false;
    }
    const pageChanged = prevState.page !== this.state.page;
    if (pageChanged){
      this.processRows();
    }
  }

  processRows = (page=null) => {
    page = page ? page : this.state.page;

    const totalRows = this.props.rows.length;
    const totalPages = Math.ceil(totalRows/this.state.rowsPerPage);
    
    let processedRows = [];
    if (this.props.paginationEnabled){
      this.props.rows.forEach((row, i) => {
        if (i>=((page-1)*this.state.rowsPerPage) && i<((page-1)*this.state.rowsPerPage)+this.state.rowsPerPage) {
          processedRows.push(row);
        }
      });
    } else {
      processedRows = this.props.rows;
    }

    this.setState({
      totalPages,
      processedRows
    });
  }

  prevPage(e){
    if (e){
      e.preventDefault();
    }
    const page = Math.max(1,this.state.page-1);
    this.setState({
      page
    });
  }

  nextPage(e){
    if (e){
      e.preventDefault();
    }
    const page = Math.min(this.state.totalPages,this.state.page+1);this.processRows(page);
    this.setState({
      page
    });
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
            this.state.processedRows.map( (row,rowIndex) => {
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
        {
          this.props.paginationEnabled && (
            <Flex
              height={'50px'}
              alignItems={'center'}
              flexDirection={'row'}
              justifyContent={'flex-end'}
              id={'transactions-list-pagination'}
            >
              <Flex mr={3}>
                <Link mr={1} onClick={ e => this.prevPage(e) }>
                  <Icon
                    name={'KeyboardArrowLeft'}
                    size={'2em'}
                    color={ this.state.page>1 ? 'arrowActive' : 'arrowInactive' }
                  />
                </Link>
                <Link onClick={ e => this.nextPage(e) }>
                  <Icon
                    name={'KeyboardArrowRight'}
                    size={'2em'}
                    color={ this.state.page<this.state.totalPages ? 'arrowActive' : 'arrowInactive' }
                  />
                </Link>
              </Flex>
              <Flex alignItems={'center'}>
                <Text 
                  fontSize={1}
                  fontWeight={3}
                  color={'cellText'}
                >
                  Page {this.state.page} of {this.state.totalPages}
                </Text>
              </Flex>
            </Flex>
          )
        }
      </Flex>
    );
  }
}

export default CustomList;