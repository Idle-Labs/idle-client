import Title from '../Title/Title';
import React, { Component } from 'react';
import { Box, Flex, Icon, Text } from "rimble-ui";
import Breadcrumb from '../Breadcrumb/Breadcrumb';
import AssetsList from '../AssetsList/AssetsList';
import RoundButton from '../RoundButton/RoundButton';
import FunctionsUtil from '../utilities/FunctionsUtil';
import BuyModal from '../utilities/components/BuyModal';
import FundsOverview from '../FundsOverview/FundsOverview';
import DashboardCard from '../DashboardCard/DashboardCard';
import DepositRedeem from '../DepositRedeem/DepositRedeem';
import CardIconButton from '../CardIconButton/CardIconButton';
import ActiveCoverages from '../ActiveCoverages/ActiveCoverages';
import TransactionsList from '../TransactionsList/TransactionsList';
import EstimatedEarnings from '../EstimatedEarnings/EstimatedEarnings';

class AssetPage extends Component {

  state = {
    tokenApy:{},
    tokenFees:{},
    tokenBalance:{},
    tokenApproved:{},
    activeModal:null,
    idleTokenPrice:{},
    userHasFunds:false,
    govTokensBalance:{},
    idleTokenBalance:{},
    redeemableBalance:{},
    govTokensDisabled:{},
    availableGovTokens:{},
    tokenFeesPercentage:{},
    componentMounted:false,
    govTokensUserBalances:{}
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

  resetModal = () => {
    this.setState({
      activeModal: null
    });
  }

  setActiveModal = activeModal => {
    this.setState({
      activeModal
    });
  }

  async loadTokensInfo(){

    if (!this.props.account || !this.props.contractsInitialized){
      return this.setState({
        userHasFunds:false
      });
    }

    const newState = {...this.state};
    // await this.functionsUtil.asyncForEach(Object.keys(this.props.availableTokens),async (token) => {
    const token = this.props.selectedToken;
    const tokenConfig = this.props.availableTokens[token];
    const govTokenAvailableTokens = {};
    govTokenAvailableTokens[token] = tokenConfig;

    const [
      tokenFeesPercentage,
      idleTokenPrice,
      tokenApy,
      tokenBalance,
      tokenFees,
      idleTokenBalance,
      tokenApproved,
      govTokensUserBalances,
      govTokensBalance
    ] = await Promise.all([
      this.functionsUtil.getTokenFees(tokenConfig),
      this.functionsUtil.getIdleTokenPrice(tokenConfig),
      this.functionsUtil.getTokenApy(this.props.tokenConfig),
      this.functionsUtil.getTokenBalance(token,this.props.account),
      this.functionsUtil.getUserTokenFees(tokenConfig,this.props.account),
      this.functionsUtil.getTokenBalance(tokenConfig.idle.token,this.props.account),
      this.functionsUtil.checkTokenApproved(token,tokenConfig.idle.address,this.props.account),
      this.functionsUtil.getGovTokensUserBalances(this.props.account,govTokenAvailableTokens,null,null),
      this.functionsUtil.getGovTokensUserTotalBalance(this.props.account,govTokenAvailableTokens,'DAI',false)
    ]);

    newState.tokenFees[token] = tokenFees;
    newState.tokenBalance[token] = tokenBalance;
    newState.tokenApproved[token] = tokenApproved;
    newState.idleTokenPrice[token] = idleTokenPrice;
    newState.idleTokenBalance[token] = idleTokenBalance;
    newState.govTokensBalance[token] = govTokensBalance;
    newState.tokenFeesPercentage[token] = tokenFeesPercentage;
    newState.govTokensUserBalances[token] = govTokensUserBalances;
    newState.govTokensDisabled[token] = tokenConfig.govTokensDisabled;
    newState.tokenApy[token] = tokenApy && !tokenApy.isNaN() ? tokenApy : null;
    newState.redeemableBalance[token] = idleTokenBalance && idleTokenPrice ? idleTokenBalance.times(idleTokenPrice) : this.functionsUtil.BNify(0);
    // });

    newState.availableGovTokens = this.functionsUtil.getTokenGovTokens(this.props.tokenConfig);

    // console.log('govTokensBalance',newState.govTokensBalance);
    // console.log('availableGovTokens',newState.availableGovTokens);
    // console.log('govTokensUserBalances',newState.govTokensUserBalances);

    newState.componentMounted = true;
    newState.userHasFunds = this.props.account && newState.idleTokenBalance[token] && this.functionsUtil.BNify(newState.idleTokenBalance[token]).gt(0);

    // console.log('loadTokensInfo',this.props.account,this.props.contractsInitialized,newState);

    this.setState(newState);
  }

  async componentWillMount(){
    this.loadUtils();
    await this.loadTokensInfo();
    window.loadTokensInfo = this.loadTokensInfo.bind(this);
  }

  async componentDidUpdate(prevProps, prevState) {
    this.loadUtils();
    const accountChanged = prevProps.account !== this.props.account;
    const selectedTokenChanged = prevProps.selectedToken !== this.props.selectedToken;
    const availableTokensChanged = JSON.stringify(prevProps.availableTokens) !== JSON.stringify(this.props.availableTokens);
    const transactionsChanged = prevProps.transactions && this.props.transactions && Object.values(prevProps.transactions).filter(tx => (tx.status==='success')).length !== Object.values(this.props.transactions).filter(tx => (tx.status==='success')).length;
    if (accountChanged || transactionsChanged || availableTokensChanged || selectedTokenChanged){
      // console.log('AssetPage - availableTokensChanged',availableTokensChanged);
      this.loadTokensInfo();
    }
  }

  render() {

    const currentNetwork = this.functionsUtil.getRequiredNetwork();
    const nexusMutualConfig = this.functionsUtil.getGlobalConfig(['tools','nexusMutual']);

    return (
      <Box
        width={1}
      >
        <Flex
          width={1}
          mb={[3,4]}
          alignItems={'center'}
          flexDirection={'row'}
          justifyContent={'flex-start'}
        >
          <Flex
            width={0.5}
          >
            <Breadcrumb
              {...this.props}
              isMobile={this.props.isMobile}
              path={[this.props.selectedToken]}
              handleClick={ e => this.props.goToSection(this.props.selectedStrategy) }
              text={this.functionsUtil.getGlobalConfig(['strategies',this.props.selectedStrategy,'title'])}
            />
          </Flex>
          <Flex
            width={0.5}
            justifyContent={'flex-end'}
          >
            <CardIconButton
              icon={'Add'}
              {...this.props}
              text={'Add funds'}
              handleClick={ e => this.setActiveModal('buy') }
            />
          </Flex>
        </Flex>
        <Title
          mb={[3,4]}
        >
          Deposit / Redeem
        </Title>
        {
          /*
          currentNetwork.id === 137 ? (
            <Flex
              width={1}
              minHeight={'45vh'}
              alignItems={'center'}
              flexDirection={'row'}
              justifyContent={'center'}
            >
              <DashboardCard
                cardProps={{
                  p:3,
                  width:[1,0.5],
                }}
              >
                <Flex
                  aligItems={'center'}
                  alignItems={'center'}
                  flexDirection={'column'}
                >
                  <Icon
                    size={'2.3em'}
                    color={'cellText'}
                    name={'AccessTime'}
                  />
                  <Text
                    mt={2}
                    fontSize={2}
                    color={'cellText'}
                    textAlign={'center'}
                  >
                    Hang on, please!<br />The {this.functionsUtil.getGlobalConfig(['strategies',this.props.selectedStrategy,'title'])} strategy has not yet been activated in Polygon.
                  </Text>
                  <RoundButton
                    buttonProps={{
                      mt:3,
                      width:[1,1/2]
                    }}
                    handleClick={e => this.props.goToSection(`stake`)}
                  >
                    Go to Staking
                  </RoundButton>
                </Flex>
              </DashboardCard>
            </Flex>
          ) :
          */
          (
            <>
              <Flex
                width={1}
              >
                <DepositRedeem
                  {...this.props}
                  tokenFees={this.state.tokenFees[this.props.selectedToken]}
                  tokenBalance={this.state.tokenBalance[this.props.selectedToken]}
                  tokenApproved={this.state.tokenApproved[this.props.selectedToken]}
                  govTokensBalance={this.state.govTokensBalance[this.props.selectedToken]}
                  idleTokenBalance={this.state.idleTokenBalance[this.props.selectedToken]}
                  redeemableBalance={this.state.redeemableBalance[this.props.selectedToken]}
                  tokenFeesPercentage={this.state.tokenFeesPercentage[this.props.selectedToken]}
                  govTokensUserBalances={this.state.govTokensUserBalances[this.props.selectedToken]}
                />
              </Flex>
              {
                this.state.userHasFunds && nexusMutualConfig.enabled && nexusMutualConfig.availableNetworks.includes(currentNetwork.id) && Object.keys(nexusMutualConfig.props.availableTokens).includes(this.props.tokenConfig.idle.token) && (
                  <Flex
                    width={1}
                    id={'active-coverages'}
                    flexDirection={'column'}
                  >
                    <ActiveCoverages
                      {...this.props}
                      titleProps={{
                        mb:3,
                        mt:[3,4],
                      }}
                      title={'Coverage'}
                      availableTokens={[this.props.tokenConfig.idle.token]}
                    >
                      <Flex
                        width={1}
                        alignItems={'center'}
                        id={'no-active-cover'}
                        flexDirection={'column'}
                        justifyContent={'center'}
                      >
                        <DashboardCard
                          cardProps={{
                            py:3,
                            px:[3,4],
                            width:[1,'auto'],
                          }}
                        >
                          <Flex
                            alignItems={'center'}
                            flexDirection={'column'}
                            justifyContent={'center'}
                          >
                            <Icon
                              my={[0,2]}
                              size={'3em'}
                              name={nexusMutualConfig.icon}
                            />
                            <Text
                              mb={1}
                              fontSize={[2,3]}
                              fontWeight={500}
                              textAlign={'center'}
                            >
                              You don't have an active coverage
                            </Text>
                            <Text
                              mb={2}
                              color={'link'}
                              fontSize={[1,2]}
                              fontWeight={500}
                              textAlign={'center'}
                            >
                              {nexusMutualConfig.desc}
                            </Text>
                            <RoundButton
                              buttonProps={{
                                mt:1,
                                width:'auto',
                                minHeight:'40px',
                                size:this.props.isMobile ? 'small' : 'medium'
                              }}
                              handleClick={ e => this.props.goToSection(`tools/${nexusMutualConfig.route}/deposit/${this.props.tokenConfig.idle.token}`) }
                            >
                              <Flex
                                alignItems={'center'}
                                flexDirection={'row'}
                                justifyContent={'center'}
                              >
                                <Text
                                  color={'white'}
                                  fontSize={[1,2]}
                                  fontWeight={500}
                                >
                                  Get Covered
                                </Text>
                                <Icon
                                  ml={1}
                                  size={'1.3em'}
                                  name={'KeyboardArrowRight'}
                                />
                              </Flex>
                            </RoundButton>
                          </Flex>
                        </DashboardCard>
                      </Flex>
                    </ActiveCoverages>
                  </Flex>
                )
              }
              {
                this.state.userHasFunds && this.props.account && (
                  <Flex
                    mb={[0,4]}
                    width={1}
                    flexDirection={'column'}
                    id={'funds-overview-container'}
                  >
                    <Title my={[3,4]}>Funds Overview</Title>
                    <FundsOverview
                      {...this.props}
                      tokenFees={this.state.tokenFees[this.props.selectedToken]}
                    />
                  </Flex>
                )
              }
              {
                this.state.userHasFunds && this.props.account && !this.state.govTokensDisabled[this.props.selectedToken] && Object.keys(this.state.availableGovTokens).length>0 && 
                  <Flex
                    width={1}
                    id={"yield-farming"}
                    flexDirection={'column'}
                  >
                    <Title my={[3,4]}>Yield Farming</Title>
                    <AssetsList
                      enabledTokens={Object.keys(this.state.availableGovTokens)}
                      cols={[
                        {
                          title:'TOKEN',
                          props:{
                            width:[0.30,0.15]
                          },
                          fields:[
                            {
                              name:'icon',
                              props:{
                                mr:2,
                                height:['1.4em','2.3em']
                              }
                            },
                            {
                              name:'tokenName'
                            }
                          ]
                        },
                        {
                          mobile:false,
                          title:'BALANCE',
                          props:{
                            width:[0.33, 0.25],
                          },
                          fields:[
                            {
                              name:'tokenBalance',
                              props:{
                                decimals: this.props.isMobile ? 6 : 8
                              }
                            }
                          ]
                        },
                        {
                          title:'REDEEMABLE',
                          desc:this.functionsUtil.getGlobalConfig(['messages','govTokenRedeemableBalance']),
                          props:{
                            width:[0.35,0.30],
                            justifyContent:['center','flex-start']
                          },
                          fields:[
                            {
                              name:'redeemableBalance',
                              props:{
                                decimals: this.props.isMobile ? 6 : 8
                              }
                            },
                          ]
                        },
                        {
                          title:'DISTRIBUTION',
                          desc:this.functionsUtil.getGlobalConfig(['messages','userDistributionSpeed']),
                          props:{
                            width:[0.35,0.30],
                          },
                          fields:[
                            {
                              name:'userDistributionSpeed',
                              props:{
                                decimals:6
                              }
                            }
                          ]
                        },
                        /*
                        {
                          title:'APR',
                          desc:this.functionsUtil.getGlobalConfig(['messages','govTokenApr']),
                          props:{
                            width:[0.2,0.17],
                          },
                          fields:[
                            {
                              name:'apr',
                            }
                          ]
                        },
                        {
                          title:'TOKEN PRICE',
                          desc:this.functionsUtil.getGlobalConfig(['messages','tokenPrice']),
                          mobile:false,
                          props:{
                            width: 0.17,
                          },
                          parentProps:{
                            width:1,
                            pr:[2,4]
                          },
                          fields:[
                            {
                              name:'tokenPrice',
                              props:{
                                unit:'$',
                                unitPos:'left',
                                unitProps:{
                                  mr:1,
                                  fontWeight:3,
                                  fontSize:[0,2],
                                  color:'cellText'
                                }
                              }
                            }
                          ]
                        },
                        */
                      ]}
                      {...this.props}
                      availableTokens={this.state.availableGovTokens}
                    />
                  </Flex>
              }
              {
              this.props.account && this.state.tokenApy[this.props.selectedToken] && 
                <Flex
                  mb={[3,4]}
                  width={1}
                  flexDirection={'column'}
                  id={'estimated-earnings-container'}
                >
                  <Title my={[3,4]}>Estimated earnings</Title>
                  <EstimatedEarnings
                    {...this.props}
                    tokenApy={this.state.tokenApy[this.props.selectedToken]}
                  />
                </Flex>
              }
              {
              this.props.account && 
                <Flex
                  mb={[3,4]}
                  width={1}
                  flexDirection={'column'}
                  id={'transactions-container'}
                >
                  <Title my={[3,4]}>Transactions</Title>
                  <TransactionsList
                    {...this.props}
                    enabledTokens={[this.props.selectedToken]}
                    cols={[
                      {
                        title: this.props.isMobile ? '' : 'HASH',
                        props:{
                          width:[0.15,0.24]
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
                          width:0.15,
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
                          width:[0.32,0.23],
                        },
                        fields:[
                          {
                            name:'date'
                          }
                        ]
                      },
                      {
                        title:'STATUS',
                        props:{
                          width:[0.18,0.22],
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
                          width:0.19,
                        },
                        fields:[
                          {
                            name:'amount'
                          },
                        ]
                      },
                      {
                        title:'ASSET',
                        props:{
                          width:[0.15,0.20],
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
            </>
          )
        }

        <BuyModal
          {...this.props}
          closeModal={this.resetModal}
          buyToken={this.props.selectedToken}
          isOpen={this.state.activeModal === 'buy'}
        />
      </Box>
    );
  }
}

export default AssetPage;