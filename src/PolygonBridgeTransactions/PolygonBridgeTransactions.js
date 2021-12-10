import { Flex } from "rimble-ui";
import Title from '../Title/Title';
import React, { Component } from 'react';
import CustomList from '../CustomList/CustomList';
import FunctionsUtil from '../utilities/FunctionsUtil';

class PolygonBridgeTransactions extends Component {

  state = {
    loaded:false,
    bridgeEnabled:false,
    polygonTransactions:null,
    polygonTransactionsAvailableTokens:null
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
  }

  async componentDidMount(){
    this.loadData();
  }

  async componentDidUpdate(prevProps,prevState){
    this.loadUtils();

    const accountChanged = prevProps.account !== this.props.account;
    if (accountChanged){
      this.loadData();
    }
  }

  async loadData(){
    if (!this.props.account){
      return false;
    }

    let polygonTransactionsAvailableTokens = null;
    const currentNetwork = this.functionsUtil.getRequiredNetwork();
    const polygonBridgeConfig = this.functionsUtil.getGlobalConfig(['tools','polygonBridge']);
    const bridgeEnabled = polygonBridgeConfig.enabled && polygonBridgeConfig.availableNetworks.includes(currentNetwork.id);

    if (!bridgeEnabled){
      return this.setState({
        loaded:true,
        bridgeEnabled
      });
    }

    const polygonTransactions = await this.functionsUtil.getPolygonBridgeTxs(this.props.account);

    // console.log('polygonTransactions',this.props.account,this.props.web3,polygonTransactions);

    if (polygonTransactions && polygonTransactions.length>0){
      polygonTransactionsAvailableTokens = polygonTransactions.map( (tx) => {
        const tokenConfig = this.functionsUtil.getGlobalConfig(['tools','polygonBridge','props','availableTokens',tx.tokenSymbol]);
        let actionIcon = null;
        switch (tx.action){
          default:
          case 'Deposit':
            actionIcon = 'ArrowDownward';
          break;
          case 'Withdraw':
            actionIcon = 'ArrowUpward';
          break;
          case 'Exit':
            actionIcon = 'Undo';
          break;
        }
        const depositInfo = {
          actionIcon,
          amount:tx.value,
          token:tx.tokenSymbol,
          action:tx.action.toUpperCase(),
          bridgeType:tx.bridgeType.toUpperCase(),
          status:tx.included ? 'Completed' : 'pending',
          hash:this.functionsUtil.shortenHash(tx.hash),
          statusIcon:tx.included ? 'Done' : 'Timelapse',
          actionIconProps:{
            color:this.props.theme.colors.transactions.action[tx.action.toLowerCase()],
            bgColor:this.props.theme.colors.transactions.actionBg[tx.action.toLowerCase()]
          },
          url:this.functionsUtil.getEtherscanTransactionUrl(tx.hash,tx.networkId),
          date:this.functionsUtil.strToMoment(parseInt(tx.timeStamp)*1000).format('DD MMM, YYYY'),
          statusIconProps:{
            color:tx.included ? this.props.theme.colors.transactions.status.completed : this.props.theme.colors.transactions.status.pending
          },
          tokenIcon:tokenConfig.icon || this.functionsUtil.getGlobalConfig(['stats','tokens',tx.tokenSymbol.toUpperCase(),'icon']) || `images/tokens/${tx.tokenSymbol}.svg`
        };
        return depositInfo;
      });
    }

    // console.log('PolygonBridgeTransactions',polygonTransactions,polygonTransactionsAvailableTokens);

    this.setState({
      loaded:true,
      bridgeEnabled,
      polygonTransactions,
      polygonTransactionsAvailableTokens
    });
  }

  render() {

    if (!this.state.loaded || !this.state.bridgeEnabled){
      return null;
    }

    return (
      <Flex
        width={1}
        alignItems={'center'}
        flexDirection={'column'}
        justifyContent={'center'}
      >
        {
          this.props.title && ((this.state.polygonTransactionsAvailableTokens && this.state.polygonTransactionsAvailableTokens.length>0) || this.props.children) && (
            <Title
              {...this.props.titleProps}
            >
              {this.props.title}
            </Title>
          )
        }
        {
          this.state.polygonTransactionsAvailableTokens && this.state.polygonTransactionsAvailableTokens.length>0 ? (
            <CustomList
              paginationEnabled={true}
              handleClick={(props) => this.functionsUtil.openWindow(props.row.url)}
              cols={[
                {
                  title:'HASH',
                  mobile:false,
                  props:{
                    width:[0.44,0.18],
                    justifyContent:['center','flex-start']
                  },
                  fields:[
                    {
                      type:'bgIcon',
                      path:['actionIcon'],
                    },
                    {
                      type:'text',
                      path:['hash'],
                      props:{
                        ml:[0,2]
                      }
                    },
                  ]
                },
                {
                  title:'ACTION',
                  props:{
                    width:[0.25,0.14],
                    justifyContent:['center','flex-start']
                  },
                  fields:[
                    {
                      type:'text',
                      path:['action'],
                    },
                  ]
                },
                {
                  title:'DATE',
                  props:{
                    width:[0.25,0.15],
                    justifyContent:['center','flex-start']
                  },
                  fields:[
                    {
                      type:'text',
                      path:['date'],
                    },
                  ]
                },
                {
                  title:'BRIDGE',
                  mobile:false,
                  props:{
                    width:[0.44,0.12],
                    justifyContent:['center','flex-start']
                  },
                  fields:[
                    {
                      type:'text',
                      path:['bridgeType'],
                    },
                  ]
                },
                {
                  title:'STATUS',
                  props:{
                    width:[0.25,0.15],
                    justifyContent:['center','flex-start']
                  },
                  fields:[
                    {
                      type:'icon',
                      mobile:false,
                      path:['statusIcon'],
                      props:{
                        mr:2,
                        size:this.props.isMobile ? '1.2em' : '1.8em'
                      }
                    },
                    {
                      name:'custom',
                      path:['status'],
                      props:{
                        style:{
                          textTransform:'capitalize'
                        }
                      }
                    }
                  ]
                },
                {
                  mobile:false,
                  title:'AMOUNT',
                  props:{
                    width:[0.25, 0.15],
                  },
                  fields:[
                    {
                      type:'number',
                      path:['amount'],
                      props:{
                        decimals: 4
                      }
                    },
                    {
                      name:'tokenName',
                      props:{
                        ml:2
                      }
                    }
                  ]
                },
                {
                  title:'TOKEN',
                  props:{
                    width:[0.25,0.13]
                  },
                  fields:[
                    {
                      type:'image',
                      path:['tokenIcon'],
                      props:{
                        mr:2,
                        height:['1.4em','1.6em']
                      }
                    },
                    {
                      type:'text',
                      path:['token'],
                    }
                  ]
                },
              ]}
              {...this.props}
              rows={this.state.polygonTransactionsAvailableTokens}
            />
          ) : this.props.children
        }
      </Flex>
    )
  }
}

export default PolygonBridgeTransactions;