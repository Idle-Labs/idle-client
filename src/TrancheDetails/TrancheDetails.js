import { Flex, Text } from "rimble-ui";
import React, { Component } from 'react';
import FlexLoader from '../FlexLoader/FlexLoader';
import FunctionsUtil from '../utilities/FunctionsUtil';
import BuyModal from '../utilities/components/BuyModal';
import TrancheField from '../TrancheField/TrancheField';
import DashboardCard from '../DashboardCard/DashboardCard';
import CardIconButton from '../CardIconButton/CardIconButton';
import SendTxWithBalance from '../SendTxWithBalance/SendTxWithBalance';

class TrancheDetails extends Component {

  state = {
    balanceProp:null,
    tokenConfig:null,
    contractInfo:null,
    tokenBalance:null,
    trancheBalance:null,
    buttonDisabled:null,
    approveEnabled:null,
    approveDescription:null,
    selectedAction:'deposit',
    userHasAvailableFunds:false
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

    const accountChanged = this.props.account !== prevProps.account;
    if (accountChanged){
      this.loadData();
    }

    const selectedActionChange = prevState.selectedAction !== this.state.selectedAction;
    if (selectedActionChange){
      this.loadActionData();
    }
  }

  async loadData(){

    if (!this.props.account){
      return null;
    }

    const [
      tokenBalance,
      trancheBalance
    ] = await Promise.all([
      this.functionsUtil.getTokenBalance(this.props.selectedToken,this.props.account),
      this.functionsUtil.getTokenBalance(this.props.trancheConfig.name,this.props.account)
    ]);

    const userHasAvailableFunds = trancheBalance && trancheBalance.gt(0);

    // console.log('trancheBalance',this.props.trancheConfig,this.functionsUtil.getContractByName(this.props.trancheConfig.name),trancheBalance);

    this.setState({
      tokenBalance,
      trancheBalance,
      userHasAvailableFunds
    }, () => {
      this.loadActionData();
    });
  }

  loadActionData(){
    let balanceProp = null;
    let tokenConfig = null;
    let contractInfo = null;
    let approveEnabled = null;

    switch (this.state.selectedAction){
      case 'deposit':
        approveEnabled = true;
        contractInfo = this.props.cdoConfig;
        tokenConfig = this.props.tokenConfig;
        balanceProp = this.state.tokenBalance;
      break;
      case 'stake':
        approveEnabled = true;
        tokenConfig = this.props.trancheConfig;
        balanceProp = this.state.trancheBalance;
        contractInfo = this.props.trancheConfig.CDORewards;
      break;
      case 'withdraw':
        approveEnabled = false;
        contractInfo = this.props.cdoConfig;
        tokenConfig = this.props.tokenConfig;
        balanceProp = this.state.tokenBalance;
      break;
      default:
      break;
    }

    const approveDescription = `To ${this.state.selectedAction} your <strong>${tokenConfig.token}</strong> you need to approve the Smart-Contract first.`;

    // console.log('loadActionData',tokenConfig,contractInfo,tokenConfig);

    this.setState({
      tokenConfig,
      balanceProp,
      contractInfo,
      approveEnabled,
      approveDescription
    })
  }

  changeInputCallback(){

  }

  contractApprovedCallback(){

  }

  getTransactionParams(amount){
    let methodName = null;
    let methodParams = null;

    if (this.props.trancheConfig.functions[this.state.selectedAction]){
      methodName = this.props.trancheConfig.functions[this.state.selectedAction];
      methodParams = [amount];
    }

    return {
      methodName,
      methodParams
    };
  }

  transactionSucceeded(){
    this.loadData();
  }

  setSelectedAction(selectedAction){
    this.setState({
      selectedAction
    });
  }

  render() {

    const trancheDetails = this.functionsUtil.getGlobalConfig(['tranches',this.props.selectedTranche]);

    return (
      <DashboardCard
        cardProps={{
          py:3,
          px:3
        }}
        titleProps={{
          pb:2,
          fontSize:[3,4]
        }}
        titleParentProps={{
          ml:0,
          mt:0,
          mb:3,
          style:{
            borderBottom:`1px solid ${this.props.theme.colors.divider}`
          }
        }}
        title={trancheDetails.name}
      >
        <Flex
          style={{
            flexBasis:'0',
            flex:'1 1 0px',
            flexWrap:'wrap',
            borderBottom:`1px solid ${this.props.theme.colors.divider}`
          }}
          alignItems={'flex-start'}
          justifyContent={'flex-start'}
        >
          <Flex
            mb={3}
            width={[0.5,0.33]}
            flexDirection={'column'}
          >
            <Text
              mb={1}
              fontWeight={3}
              fontSize={[1,2]}
              color={'cellText'}
            >
              Protocol
            </Text>
            <Flex
              alignItems={'center'}
              flexDirection={'row'}
            >
              <TrancheField
                {...this.props}
                fieldInfo={{
                  name:'protocolIcon',
                  props:{
                    mr:2,
                    height:['1.4em','2em']
                  }
                }}
                token={this.props.selectedToken}
                tokenConfig={this.props.tokenConfig}
                protocol={this.props.selectedProtocol}
                trancheConfig={this.props.trancheConfig}
              />
              <TrancheField
                {...this.props}
                fieldInfo={{
                  name:'protocolName',
                  props:{
                    fontSize:[2,3],
                    color:'copyColor'
                  }
                }}
                token={this.props.selectedToken}
                tokenConfig={this.props.tokenConfig}
                protocol={this.props.selectedProtocol}
                trancheConfig={this.props.trancheConfig}
              />
            </Flex>
          </Flex>
          <Flex
            mb={3}
            width={[0.5,0.33]}
            flexDirection={'column'}
          >
            <Text
              mb={1}
              fontWeight={3}
              fontSize={[1,2]}
              color={'cellText'}
            >
              Token
            </Text>
            <Flex
              alignItems={'center'}
              flexDirection={'row'}
            >
              <TrancheField
                {...this.props}
                fieldInfo={{
                  name:'tokenIcon',
                  props:{
                    mr:2,
                    height:['1.4em','2em']
                  }
                }}
                token={this.props.selectedToken}
                tokenConfig={this.props.tokenConfig}
                protocol={this.props.selectedProtocol}
                trancheConfig={this.props.trancheConfig}
              />
              <TrancheField
                {...this.props}
                fieldInfo={{
                  name:'tokenName',
                  props:{
                    fontSize:[2,3],
                    color:'copyColor'
                  }
                }}
                token={this.props.selectedToken}
                tokenConfig={this.props.tokenConfig}
                protocol={this.props.selectedProtocol}
                trancheConfig={this.props.trancheConfig}
              />
            </Flex>
          </Flex>
          <Flex
            mb={3}
            width={[0.5,0.33]}
            flexDirection={'column'}
          >
            <Text
              fontWeight={3}
              fontSize={[1,2]}
              color={'cellText'}
            >
              Pool Size
            </Text>
            <TrancheField
              {...this.props}
              fieldInfo={{
                name:'tranchePool',
                props:{
                  decimals:2,
                  fontSize:[2,3],
                  color:'copyColor'
                }
              }}
              token={this.props.selectedToken}
              tranche={this.props.selectedTranche}
              tokenConfig={this.props.tokenConfig}
              protocol={this.props.selectedProtocol}
              trancheConfig={this.props.trancheConfig}
            />
          </Flex>
          <Flex
            mb={3}
            width={[0.5,0.33]}
            flexDirection={'column'}
            alignItems={'flex-start'}
          >
            <Text
              mb={1}
              fontWeight={3}
              fontSize={[1,2]}
              color={'cellText'}
            >
              Auto-Farming
            </Text>
            <TrancheField
              {...this.props}
              fieldInfo={{
                name:'autoFarming',
                parentProps:{
                  justifyContent:'flex-start'
                }
              }}
              token={this.props.selectedToken}
              tokenConfig={this.props.tokenConfig}
              protocol={this.props.selectedProtocol}
              trancheConfig={this.props.trancheConfig}
            />
          </Flex>
          <Flex
            mb={3}
            width={[0.5,0.33]}
            flexDirection={'column'}
          >
            <Text
              mb={1}
              fontWeight={3}
              fontSize={[1,2]}
              color={'cellText'}
            >
              Staking Rewards
            </Text>
            <TrancheField
              {...this.props}
              fieldInfo={{
                name:'stakingRewards',
                props:{
                  decimals:2,
                  fontSize:[2,3],
                  color:'copyColor'
                }
              }}
              token={this.props.selectedToken}
              tranche={this.props.selectedTranche}
              tokenConfig={this.props.tokenConfig}
              protocol={this.props.selectedProtocol}
              trancheConfig={this.props.trancheConfig}
            />
          </Flex>
          <Flex
            mb={3}
            width={[0.5,0.33]}
            flexDirection={'column'}
          >
            <Text
              fontWeight={3}
              fontSize={[1,2]}
              color={'cellText'}
            >
              APY
            </Text>
            <TrancheField
              {...this.props}
              fieldInfo={{
                name:'trancheApy',
                props:{
                  decimals:2,
                  fontSize:[2,3],
                  color:'copyColor'
                }
              }}
              token={this.props.selectedToken}
              tranche={this.props.selectedTranche}
              tokenConfig={this.props.tokenConfig}
              protocol={this.props.selectedProtocol}
              trancheConfig={this.props.trancheConfig}
            />
          </Flex>
        </Flex>
        <Flex
          py={2}
          style={{
            borderBottom:`1px solid ${this.props.theme.colors.divider}`
          }}
        >
          <Text
            color={'cellText'}
          >
            {trancheDetails.description}
          </Text>
        </Flex>
        {
          this.state.balanceProp && this.state.tokenConfig ? (
            <Flex
              width={1}
              flexDirection={'column'}
            >
              <Flex
                mt={3}
                alignItems={'center'}
                flexDirection={'row'}
                justifyContent={'space-between'}
              >
                <CardIconButton
                  {...this.props}
                  textProps={{
                    fontSize:[1,2]
                  }}
                  cardProps={{
                    px:3,
                    py:2,
                    width:0.32
                  }}
                  text={'Deposit'}
                  iconColor={'deposit'}
                  icon={'ArrowDownward'}
                  iconBgColor={'#ced6ff'}
                  isActive={ this.state.selectedAction === 'deposit' }
                  handleClick={ e => this.setSelectedAction('deposit') }
                />
                <CardIconButton
                  {...this.props}
                  textProps={{
                    fontSize:[1,2]
                  }}
                  cardProps={{
                    px:3,
                    py:2,
                    width:0.32
                  }}
                  text={'Stake'}
                  icon={'Layers'}
                  iconColor={'deposit'}
                  iconBgColor={'#ced6ff'}
                  isDisabled={ !this.state.userHasAvailableFunds }
                  isActive={ this.state.selectedAction === 'stake' }
                  handleClick={ e => this.state.userHasAvailableFunds ? this.setSelectedAction('stake') : null }
                />
                <CardIconButton
                  {...this.props}
                  textProps={{
                    fontSize:[1,2]
                  }}
                  cardProps={{
                    px:3,
                    py:2,
                    width:0.32
                  }}
                  text={'Withdraw'}
                  icon={'ArrowUpward'}
                  iconColor={'redeem'}
                  iconBgColor={'#ceeff6'}
                  isDisabled={ !this.state.userHasAvailableFunds }
                  isActive={ this.state.selectedAction === 'withdraw' }
                  handleClick={ e => this.state.userHasAvailableFunds ? this.setSelectedAction('withdraw') : null }
                />
              </Flex>
              <Flex
                mt={3}
              >
                <SendTxWithBalance
                  error={null}
                  {...this.props}
                  permitEnabled={false}
                  tokenConfig={this.state.tokenConfig}
                  tokenBalance={this.state.balanceProp}
                  contractInfo={this.state.contractInfo}
                  approveEnabled={this.state.approveEnabled}
                  buttonDisabled={this.state.buttonDisabled}
                  callback={this.transactionSucceeded.bind(this)}
                  approveDescription={this.state.approveDescription}
                  changeInputCallback={this.changeInputCallback.bind(this)}
                  contractApproved={this.contractApprovedCallback.bind(this)}
                  getTransactionParams={this.getTransactionParams.bind(this)}
                  action={this.functionsUtil.capitalize(this.state.selectedAction)}
                >
                  <Flex
                    width={1}
                    alignItems={'stretch'}
                    flexDirection={'column'}
                    justifyContent={'center'}
                  >
                    <BuyModal
                      {...this.props}
                      showInline={true}
                      availableMethods={[]}
                      buyToken={this.props.selectedToken}
                    />
                  </Flex>
                </SendTxWithBalance>
              </Flex>
            </Flex>
          ) : (
            <FlexLoader
              flexProps={{
                mt:3,
                flexDirection:'row'
              }}
              loaderProps={{
                size:'30px'
              }}
              textProps={{
                ml:2
              }}
              text={'Loading Tranche Data...'}
            />
          )
        }
      </DashboardCard>
    );
  }
}

export default TrancheDetails;
