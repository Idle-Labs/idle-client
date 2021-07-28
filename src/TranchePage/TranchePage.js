import Title from '../Title/Title';
import { Box, Flex } from "rimble-ui";
import React, { Component } from 'react';
import Breadcrumb from '../Breadcrumb/Breadcrumb';
import FunctionsUtil from '../utilities/FunctionsUtil';
import TrancheDetails from '../TrancheDetails/TrancheDetails';
import TransactionsList from '../TransactionsList/TransactionsList';

class TranchePage extends Component {

  state = {
    transactions:[]
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
    this.loadTransactions();
  }

  async componentDidUpdate(prevProps,prevState){
    this.loadUtils();

    const portfolioChanged = (this.props.portfolio && !prevProps.portfolio) || JSON.stringify(this.props.portfolio) !== JSON.stringify(prevProps.portfolio);
    if (portfolioChanged){
      this.loadTransactions();
    }
  }

  loadTransactions(){
    const transactions = this.props.portfolio ? this.props.portfolio.transactions.filter( t => t.protocol.toLowerCase() === this.props.selectedProtocol.toLowerCase() && t.token.toLowerCase() === this.props.selectedToken.toLowerCase() ) : [];
    this.setState({
      transactions
    });
  }

  render() {
    return (
      <Box
        mb={4}
        width={1}
      >
        <Flex
          width={1}
          mb={[2,0]}
          alignItems={'center'}
          flexDirection={'row'}
          justifyContent={'flex-start'}
        >
          <Flex
            width={0.5}
          >
            <Breadcrumb
              {...this.props}
              text={'Tranches'}
              isMobile={this.props.isMobile}
              path={[this.functionsUtil.capitalize(this.props.selectedProtocol),this.props.selectedToken]}
              handleClick={ e => this.props.goToSection(this.props.selectedSection.route) }
            />
          </Flex>
          <Flex
            width={0.5}
            justifyContent={'flex-end'}
          >
            
          </Flex>
        </Flex>
        <Title
          mb={3}
        >
          {this.functionsUtil.capitalize(this.props.selectedProtocol)} - {this.props.selectedToken} - Tranche
        </Title>
        <Flex
          width={1}
          flexDirection={['column','row']}
          justifyContent={'space-between'}
        >
          <Flex
            width={[1,0.47]}
            flexDirection={'column'}
          >
            <TrancheDetails
              {...this.props}
              selectedTranche={'AA'}
              cdoConfig={this.props.tokenConfig.CDO}
              trancheConfig={this.props.tokenConfig['AA']}
            />
          </Flex>
          <Flex
            width={[1,0.47]}
            flexDirection={'column'}
          >
            <TrancheDetails
              {...this.props}
              selectedTranche={'BB'}
              cdoConfig={this.props.tokenConfig.CDO}
              trancheConfig={this.props.tokenConfig['BB']}
            />
          </Flex>
        </Flex>
        {
          this.props.account && this.state.transactions && this.state.transactions.length>0 && 
            <Flex
              mb={[3,4]}
              width={1}
              id={'transactions'}
              flexDirection={'column'}
            >
              <Title my={[3,4]}>Transactions</Title>
              <TransactionsList
                {...this.props}
                enabledTokens={[this.props.selectedToken]}
                transactionsList={this.state.transactions}
                availableActions={this.state.transactions.reduce( (availableActions,t) => {
                  availableActions[t.action.toLowerCase()] = t.action;
                  return availableActions;
                },{})}
                cols={[
                  {
                    title: this.props.isMobile ? '' : 'HASH',
                    props:{
                      width:[0.13,0.18]
                    },
                    fields:[
                      {
                        name:'icon',
                        props:{
                          mr:[0,2]
                        }
                      },
                      {
                        name:'hash',
                        mobile:false
                      }
                    ]
                  },
                  {
                    title:'ACTION',
                    mobile:false,
                    props:{
                      width:0.12,
                    },
                    fields:[
                      {
                        name:'action'
                      }
                    ]
                  },
                  {
                    title:'DATE',
                    props:{
                      width:[0.27,0.15],
                    },
                    fields:[
                      {
                        name:'date'
                      }
                    ]
                  },
                  {
                    mobile:false,
                    title:'STATUS',
                    props:{
                      width:[0.18,0.16],
                      justifyContent:['center','flex-start']
                    },
                    fields:[
                      {
                        name:'statusIcon',
                        props:{
                          mr:[0,2]
                        }
                      },
                      {
                        mobile:false,
                        name:'status'
                      }
                    ]
                  },
                  {
                    title:'AMOUNT',
                    props:{
                      width:[0.23,0.11],
                    },
                    fields:[
                      {
                        name:'amount'
                      },
                    ]
                  },
                  {
                    title:'PROTOCOL',
                    props:{
                      width:[0.21, 0.14],
                    },
                    fields:[
                      {
                        type:'image',
                        name:'custom',
                        path:['protocolIcon'],
                        props:{
                          mr:2,
                          height:['1.4em','2em']
                        }
                      },
                      {
                        type:'text',
                        mobile:false,
                        name:'custom',
                        path:['protocol']
                      }
                    ]
                  },
                  {
                    title:'ASSET',
                    props:{
                      width:[0.16,0.14],
                      justifyContent:['center','flex-start']
                    },
                    fields:[
                      {
                        name:'tokenIcon',
                        props:{
                          mr:[0,2],
                          height:['1.4em','1.6em']
                        }
                      },
                      {
                        mobile:false,
                        name:'tokenName'
                      },
                    ]
                  },
                ]}
              />
            </Flex>
        }
      </Box>
    );
  }
}

export default TranchePage;