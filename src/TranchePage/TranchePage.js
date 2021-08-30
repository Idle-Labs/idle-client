import Title from '../Title/Title';
import { Box, Flex } from "rimble-ui";
import React, { Component } from 'react';
import GenericFaqs from '../GenericFaqs/GenericFaqs';
import FunctionsUtil from '../utilities/FunctionsUtil';
import TrancheWelcome from '../TrancheWelcome/TrancheWelcome';
import TrancheDetails from '../TrancheDetails/TrancheDetails';
import TransactionsList from '../TransactionsList/TransactionsList';
import FundsOverviewTranche from '../FundsOverviewTranche/FundsOverviewTranche';
import StakingRewardsTranche from '../StakingRewardsTranche/StakingRewardsTranche';

class TranchePage extends Component {

  state = {
    transactions:[],
    componentLoaded:false
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
    this.loadTransactions();
  }

  async componentDidMount(){
  }

  async componentDidUpdate(prevProps,prevState){
    this.loadUtils();

    const portfolioChanged = (this.props.portfolio && !prevProps.portfolio) || JSON.stringify(this.props.portfolio) !== JSON.stringify(prevProps.portfolio);
    if (portfolioChanged){
      this.loadTransactions();
    }
  }

  loadTransactions(){
    const transactions = this.props.portfolio ? this.props.portfolio.transactions.filter( t => t.protocol.toLowerCase() === this.props.selectedProtocol.toLowerCase() && t.token.toLowerCase() === this.props.selectedToken.toLowerCase() && (!this.props.trancheType || t.tranche === this.props.trancheType) ) : [];

    // console.log('loadTransactions',this.props.selectedProtocol,this.props.selectedToken,this.props.trancheType,transactions);
    const componentLoaded = true;

    this.setState({
      transactions,
      componentLoaded
    });
  }

  render() {
    const tranchesDetails = this.functionsUtil.getGlobalConfig(['tranches']);
    const filteredTranchesTypes = Object.keys(tranchesDetails).filter( trancheType => !this.props.trancheType || this.props.trancheType === trancheType );
    return (
      <Box
        mb={4}
        width={1}
      >
        <Title
          mb={3}
        >
          {this.functionsUtil.capitalize(this.props.selectedProtocol)} - {this.props.selectedToken} - {this.props.trancheDetails ? this.props.trancheDetails.name : 'Tranches'} 
        </Title>
        {
          !this.props.trancheType ? (
            <TrancheWelcome
              {...this.props}
              tokenConfig={this.props.tokenConfig}
              selectTrancheType={this.props.selectTrancheType}
            />
          ) : (
            <Flex
              mt={2}
              width={1}
              flexDirection={['column','row']}
              justifyContent={this.props.trancheType ? 'center' : 'space-between'}
            >
              {
                filteredTranchesTypes.map( trancheType => (
                  <Flex
                    mb={[3,0]}
                    flexDirection={'column'}
                    key={`tranche_${trancheType}`}
                    width={[1,Math.min(0.5,(1/filteredTranchesTypes.length)-0.02)]}
                  >
                    <TrancheDetails
                      {...this.props}
                      selectedTranche={trancheType}
                      cdoConfig={this.props.tokenConfig.CDO}
                      selectTrancheType={this.props.selectTrancheType}
                      trancheConfig={this.props.tokenConfig[trancheType]}
                    />
                  </Flex>
                ))
              }
            </Flex>
          )
        }
        {
          this.state.componentLoaded && this.props.account && this.props.userHasFunds && this.props.trancheType &&
            <Flex
              mb={[0,4]}
              width={1}
              flexDirection={'column'}
              id={'funds-overview-container'}
            >
              <Title my={[3,4]}>Staking Rewards</Title>
              <StakingRewardsTranche
                {...this.props}
                token={this.props.selectedToken}
                tranche={this.props.trancheType}
                tokenConfig={this.props.tokenConfig}
                protocol={this.props.selectedProtocol}
                transactionsList={this.state.transactions}
                trancheConfig={this.props.tokenConfig[this.props.trancheType]}
              />
            </Flex>
        }
        {
          this.state.componentLoaded && this.props.account && this.props.userHasFunds && this.props.trancheType &&
            <Flex
              mb={[0,4]}
              width={1}
              flexDirection={'column'}
              id={'funds-overview-container'}
            >
              <Title my={[3,4]}>Funds Overview</Title>
              <FundsOverviewTranche
                {...this.props}
                token={this.props.selectedToken}
                tranche={this.props.trancheType}
                tokenConfig={this.props.tokenConfig}
                protocol={this.props.selectedProtocol}
                transactionsList={this.state.transactions}
                trancheConfig={this.props.tokenConfig[this.props.trancheType]}
              />
            </Flex>
        }
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
        {
          this.props.trancheType && (
            <Flex
              width={1}
              id={'faqs'}
              alignItems={'center'}
              flexDirection={'column'}
              justifyContent={'center'}
            >
              <Title
                my={3}
              >
                Frequently asked questions
              </Title>
              <Flex
                width={[1,0.5]}
                alignItems={'center'}
                flexDirection={'column'}
                justifyContent={'center'}
              >
                <GenericFaqs
                  showSections={false}
                  questions={{
                    '':[
                      {
                        q: 'Is there a locking period?',
                        a: `There are no locking period or epochs and users are free to enter and exit at any time, the interest earned (and governance tokens, after being partially sold in the market) will be split between the two classes according to a predefined ratio called trancheAPRSplitRatio (eg 20% interest to Senior tranche holders and 80% to Junior tranche) so the rate is variable for both classes of tranches.`
                      },
                      {
                        q: 'How the APR is determined?',
                        a: `To determine the actual APR for each tranche class, we also need to know the ratio between the current underlying value of Senior and Junior tranches (ie SeniorRatio = Senior Value / (Senior Value + Junior Value)), for more info <a href="https://github.com/Idle-Labs/idle-tranches#idle-dynamic-tranches" target="_blank" rel="nofollow noopener noreferrer" style="color:${this.props.theme.colors.link}">view the readme</a>`
                      },
                      {
                        q: 'What happens in case of hack?',
                        a: `In case of hack, an emergency shutdown can be triggered (by both the guardian, which would be a multi-sig wallet, and the owner which will be the Idle governance) in order to pause both deposits and redeems, the redistribution of remaining funds can happens selectively, by allowing only Senior tranche holders to withdraw first directly in the main contract, or through a separate contract for more complex cases and resolutions (managed by the Idle governance).`
                      },
                      {
                        q: 'How are fees collected?',
                        a: `A Fee is collected on harvests in the form Senior tranche or Junior tranche supply diluition (based on the current Senior tranche ratio in value) and it's basically a performance fee, currently set at 10% of the interest generated and it will be redirected to the Idle fee collector address.`
                      },
                      {
                        q: 'What are staking rewards?',
                        a: `To keep a good ratio between Senior and Junior tranches and an healthy APR part of farmed governance tokens (eg stkAAVE or IDLE) are redistributed to users who stakes their tranche tokens in specific tranche rewards contracts.`
                      } 
                    ]
                  }}
                />
              </Flex>
            </Flex>
          )
        }
      </Box>
    );
  }
}

export default TranchePage;