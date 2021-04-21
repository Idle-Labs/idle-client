import React, { Component } from 'react';
import FlexLoader from '../FlexLoader/FlexLoader';
import { Box, Flex, Text, Icon } from "rimble-ui";
import RoundButton from '../RoundButton/RoundButton';
import FunctionsUtil from '../utilities/FunctionsUtil';
import DashboardCard from '../DashboardCard/DashboardCard';
import CardIconButton from '../CardIconButton/CardIconButton';
import SendTxWithBalance from '../SendTxWithBalance/SendTxWithBalance';

class TokenWrapper extends Component {

  state = {
    action:null,
    infoBox:null,
    balanceDest:null,
    tokenConfig:null,
    balanceStart:null,
    tokenBalance:null,
    contractInfo:null,
    selectedToken:null,
    approveEnabled:true,
    approveDescription:null,
    showTokenWrapperEnabled:false
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
    this.loadData();
  }

  async componentDidUpdate(prevProps,prevState){
    this.loadUtils();

    const actionChanged = (prevState.action !== this.state.action) || (this.props.action !== prevProps.action);
    const startContractChanged = JSON.stringify(this.props.startContract) !== JSON.stringify(prevProps.startContract);
    const destContractChanged = JSON.stringify(this.props.destContract) !== JSON.stringify(prevProps.destContract);
    if (actionChanged || startContractChanged || destContractChanged){
      this.loadData();
    }
  }

  async loadData(){
    const action = this.props.action || this.state.action || 'wrap';
    this.setState({
      action
    },() => {
      this.loadBalance();
      this.updateActionData();
    });
  }

  async getTokenBalance(contractInfo){

    if (!contractInfo){
      return false;
    }

    let tokenBalance = null;
    switch (contractInfo.name){
      case 'ETH':
        tokenBalance = await this.functionsUtil.getETHBalance(this.props.account);
      break;
      default:
        // Init Contract
        await this.props.initContract(contractInfo.name,contractInfo.address,contractInfo.abi);
        tokenBalance = await this.functionsUtil.getTokenBalance(contractInfo.name,this.props.account);
      break;
    }

    tokenBalance = tokenBalance || this.functionsUtil.BNify(0);

    return tokenBalance;
  }

  async loadBalance(){

    if (!this.props.toolProps.startContract || !this.props.toolProps.destContract){
      return false;
    }

    // Load Balances
    const [
      balanceDest,
      balanceStart
    ] = await Promise.all([
      this.getTokenBalance(this.props.toolProps.destContract),
      this.getTokenBalance(this.props.toolProps.startContract)
    ]);

    const tokenBalance = this.state.action === 'wrap' ? balanceStart : balanceDest;
    // console.log('loadBalance',this.props.toolProps.startContract,parseFloat(balanceStart),this.props.toolProps.destContract,parseFloat(balanceDest));

    this.setState({
      balanceDest,
      balanceStart,
      tokenBalance
    });
  }

  updateActionData(){
    let infoBox = null;
    let tokenConfig = null;
    let tokenBalance = null;
    let selectedToken = null;
    let approveEnabled = true;
    let approveDescription = null;

    switch (this.state.action){
      case 'wrap':
        approveEnabled = true;
        tokenBalance = this.state.balanceStart;
        tokenConfig = this.props.toolProps.startContract;
        selectedToken = this.props.toolProps.startContract.name;
        approveDescription = `To Mint new ${this.props.toolProps.destContract.name} you need to approve the Smart-Contract first`;
        infoBox = {
          icon:'FileDownload',
          // iconProps:{
          //   color:this.props.theme.colors.transactions.action.deposit
          // },
          text:`Wrap your ${this.props.toolProps.startContract.name} and get ${this.props.toolProps.destContract.name}`
        };
      break;
      case 'unwrap':
        selectedToken = this.props.toolProps.destContract.name;
        approveEnabled = false;
        tokenBalance = this.state.balanceDest;
        tokenConfig = this.props.toolProps.destContract;
        approveDescription = `To withdraw your ${this.props.toolProps.startContract.name} you need to approve the Smart-Contract first`;
        infoBox = {
          icon:'FileUpload',
          // iconProps:{
          //   color:this.props.theme.colors.transactions.action.redeem
          // },
          text:`Unwrap your ${this.props.toolProps.destContract.name} and get back ${this.props.toolProps.startContract.name}`
        };
      break;
      default:
      break;
    }

    this.setState({
      infoBox,
      tokenConfig,
      tokenBalance,
      selectedToken,
      approveEnabled,
      approveDescription
    },() => {
      this.loadBalance();
    });
  }

  setAction(action){
    this.setState({
      action
    });
  }

  transactionSucceeded(tx,amount,params){
    let infoBox = null;

    switch (this.state.action){
      case 'wrap':
        const mintLog = tx.txReceipt && tx.txReceipt.logs ? tx.txReceipt.logs.find( log => log.address.toLowerCase() === this.props.toolProps.destContract.address.toLowerCase() ) : null;
        let mintedAmount = mintLog ? parseInt(mintLog.data,16) : amount;
        mintedAmount = this.functionsUtil.fixTokenDecimals(mintedAmount,this.state.tokenConfig.decimals);
        infoBox = {
          icon:'DoneAll',
          iconProps:{
            color:this.props.theme.colors.transactions.status.completed
          },
          text:`You have received <strong>${mintedAmount.toFixed(4)} ${this.props.toolProps.destContract.name}</strong>`
        }
      break;
      case 'unwrap':
        const withdrawLog = tx.txReceipt && tx.txReceipt.logs ? tx.txReceipt.logs.find( log => log.address.toLowerCase() === this.props.toolProps.destContract.address.toLowerCase() ) : null;
        let withdrawnAmount = withdrawLog ? parseInt(withdrawLog.data,16) : amount;
        withdrawnAmount = this.functionsUtil.fixTokenDecimals(withdrawnAmount,this.state.tokenConfig.decimals);
        infoBox = {
          icon:'DoneAll',
          iconProps:{
            color:this.props.theme.colors.transactions.status.completed
          },
          text:`You have received <strong>${withdrawnAmount.toFixed(4)} ${this.props.toolProps.startContract.name}</strong>`
        }
      break;
      default:
      break;
    }

    // Update balances
    this.loadBalance();

    this.setState({
      infoBox
    });
  }

  getTransactionParams(amount){
    const params = {};
    switch (this.state.action){
      case 'wrap':
        params.value = amount;
        params.methodParams = [];
        params.methodName = this.props.toolProps.startContract.wrapMethod;
      break;
      case 'unwrap':
        params.value = null;
        params.methodParams = [amount];
        params.methodName = this.props.toolProps.destContract.unwrapMethod;
      break;
      default:
      break;
    }
    return params;
  }

  render() {

    const fullWidth = !!this.props.fullWidth;

    return (
      <Flex
        width={1}
        alignItems={'center'}
        flexDirection={'column'}
        justifyContent={'center'}
        mt={[2,fullWidth ? 2 : 3]}
      >
        <Flex
          alignItems={'stretch'}
          flexDirection={'column'}
          justifyContent={'center'}
          width={[1,fullWidth ? 1 : 0.36]}
        >
          {
            !this.props.account ? (
              <DashboardCard
                cardProps={{
                  p:3,
                  mt:3
                }}
              >
                <Flex
                  alignItems={'center'}
                  flexDirection={'column'}
                >
                  <Icon
                    size={this.props.isMobile ? '1.8em' : '2.3em'}
                    name={'Input'}
                    color={'cellText'}
                  />
                  <Text
                    mt={[1,2]}
                    fontSize={2}
                    color={'cellText'}
                    textAlign={'center'}
                  >
                    Please connect with your wallet interact with Idle.
                  </Text>
                  <RoundButton
                    buttonProps={{
                      mt:2,
                      width:[1,1/2]
                    }}
                    handleClick={this.props.connectAndValidateAccount}
                  >
                    Connect
                  </RoundButton>
                </Flex>
              </DashboardCard>
            ) : (
              <Box
                width={1}
              >
                {
                  !this.props.action && (
                    <Flex
                      width={1}
                      flexDirection={'column'}
                    >
                      <Text
                        mb={2}
                      >
                        Choose the action:
                      </Text>
                      <Flex
                        alignItems={'center'}
                        flexDirection={'row'}
                        justifyContent={'space-between'}
                      >
                        <CardIconButton
                          {...this.props}
                          cardProps={{
                            px:3,
                            py:3,
                            width:0.48
                          }}
                          text={'Wrap'}
                          iconColor={'deposit'}
                          icon={'ArrowDownward'}
                          iconBgColor={'#ced6ff'}
                          isActive={ this.state.action === 'wrap' }
                          handleClick={ e => this.setAction('wrap') }
                        />
                        <CardIconButton
                          {...this.props}
                          cardProps={{
                            px:3,
                            py:3,
                            width:0.48
                          }}
                          text={'Unwrap'}
                          iconColor={'redeem'}
                          icon={'ArrowUpward'}
                          iconBgColor={'#ceeff6'}
                          isActive={ this.state.action === 'unwrap' }
                          handleClick={ e => this.setAction('unwrap') }
                        />
                      </Flex>
                    </Flex>

                  )
                }
                <Box
                  width={1}
                  my={fullWidth ? 2 : 3}
                >
                  {
                    this.state.tokenBalance!==null ? (
                      <SendTxWithBalance
                        {...this.props}
                        approveEnabled={false}
                        action={this.state.action}
                        infoBox={this.state.infoBox}
                        tokenConfig={this.state.tokenConfig}
                        tokenBalance={this.state.tokenBalance}
                        contractInfo={this.props.toolProps.destContract}
                        callback={this.transactionSucceeded.bind(this)}
                        approveDescription={this.state.approveDescription}
                        // changeInputCallback={this.changeInputCallback.bind(this)}
                        getTransactionParams={this.getTransactionParams.bind(this)}
                      >
                        <DashboardCard
                          cardProps={{
                            p:3,
                          }}
                        >
                          <Flex
                            alignItems={'center'}
                            flexDirection={'column'}
                          >
                            <Icon
                              size={'2.3em'}
                              name={'MoneyOff'}
                              color={'cellText'}
                            />
                            <Text
                              mt={2}
                              fontSize={2}
                              color={'cellText'}
                              textAlign={'center'}
                            >
                              You don't have any {this.state.selectedToken} to {this.state.action} in your wallet.
                            </Text>
                          </Flex>
                        </DashboardCard>
                      </SendTxWithBalance>
                    ) : (
                      <Flex
                        width={1}
                      >
                        <FlexLoader
                          flexProps={{
                            flexDirection:'row'
                          }}
                          loaderProps={{
                            size:'30px'
                          }}
                          textProps={{
                            ml:2
                          }}
                          text={'Loading Balance...'}
                        />
                      </Flex>
                    )
                  }
                </Box>
              </Box>
            )
          }
        </Flex>
      </Flex>
    );
  }
}

export default TokenWrapper;