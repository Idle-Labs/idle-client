import { Flex } from "rimble-ui";
import Title from '../Title/Title';
import React, { Component } from 'react';
import CustomList from '../CustomList/CustomList';
import FunctionsUtil from '../utilities/FunctionsUtil';

class TrancheHarvests extends Component {

  state = {
    rows:[]
  }

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
    let rows = [];
    const distributions = await this.functionsUtil.getTrancheStakingRewardsDistributions(this.props.tokenConfig,this.props.trancheConfig);

    await this.functionsUtil.asyncForEach(Object.keys(distributions), async (token) => {
      const txs = distributions[token];
      const tokenConfig = this.functionsUtil.getGlobalConfig(['stats','tokens',token]);
      await this.functionsUtil.asyncForEach(txs, async (tx) => {
        const tokenIcon = tokenConfig && tokenConfig.icon ? tokenConfig.icon : `images/tokens/${token}.svg`;
        const blockInfo = await this.functionsUtil.getBlockInfo(tx.blockNumber);
        const timeStamp = blockInfo.timestamp*1000;
        const date = this.functionsUtil.strToMoment(timeStamp).format('YYYY/MM/DD HH:mm');
        const amount = this.functionsUtil.fixTokenDecimals(tx.returnValues.amount||tx.returnValues.value,tokenConfig.decimals);
        // console.log(token,date,amount.toString());
        rows.push({
          date,
          token,
          timeStamp,
          tokenIcon,
          hash:tx.transactionHash,
          amount:this.functionsUtil.formatMoney(amount.toString(),8),
          shortHash:this.functionsUtil.shortenHash(tx.transactionHash,10,6)
        });
      });
    });

    rows = rows.sort((a,b) => (parseInt(a.timeStamp) < parseInt(b.timeStamp) ? 1 : -1));

    return this.setState({rows});
  }

  render() {
    return this.state.rows.length>0 ? (
      <Flex
        mb={[0,4]}
        width={1}
        flexDirection={'column'}
        id={'funds-overview-container'}
      >
        <Title my={[3,4]}>Staking Rewards Distribution</Title>
        <CustomList
          rows={this.state.rows}
          paginationEnabled={true}
          handleClick={ props => this.functionsUtil.openWindow(this.functionsUtil.getEtherscanTransactionUrl(props.row.hash)) }
          cols={[
            {
              mobile:false,
              title:'HASH',
              props:{
                width:[0.25,0.25]
              },
              fields:[
                {
                  type:'text',
                  path:['shortHash'],
                }
              ]
            },
            {
              title:'DATE',
              props:{
                width:[0.35,0.25],
              },
              fields:[
                {
                  type:'text',
                  path:['date'],
                }
              ]
            },
            {
              title:'TOKEN',
              props:{
                width:[0.35,0.25]
              },
              fields:[
                {
                  type:'image',
                  props:{
                    mr:2,
                    size:this.props.isMobile ? '1.2em' : '1.8em'
                  },
                  path:['tokenIcon']
                },
                {
                  type:'text',
                  path:['token'],
                }
              ]
            },
            {
              title:'AMOUNT',
              props:{
                width:[0.30,0.25],
                justifyContent:['center','flex-start']
              },
              fields:[
                {
                  type:'text',
                  path:['amount'],
                  props:{
                    decimals: this.props.isMobile ? 4 : 8
                  }
                },
              ]
            }
          ]}
          {...this.props}
        />
      </Flex>
    ) : null;
  }
}

export default TrancheHarvests;
