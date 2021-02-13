import React, { Component } from 'react';
import FlexLoader from '../FlexLoader/FlexLoader';
import { Box, Flex, Text, Icon } from "rimble-ui";
import RoundButton from '../RoundButton/RoundButton';
import FunctionsUtil from '../utilities/FunctionsUtil';
import DashboardCard from '../DashboardCard/DashboardCard';
import CardIconButton from '../CardIconButton/CardIconButton';
import SendTxWithBalance from '../SendTxWithBalance/SendTxWithBalance';

class ETHWrapper extends Component {

  state = {
    action:null,
    infoBox:null,
    balanceETH:null,
    balanceWETH:null,
    tokenConfig:null,
    tokenBalance:null,
    contractInfo:null,
    selectedToken:null,
    approveEnabled:true,
    approveDescription:null
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
    this.loadBalance();
  }

  async componentDidUpdate(prevProps,prevState){
    this.loadUtils();

    const actionChanged = prevState.action !== this.state.action;
    if (actionChanged){
      this.updateActionData();
    }
  }

  async loadBalance(){

    // Init Contract
    await this.props.initContract(this.props.toolProps.contract.name,this.props.toolProps.contract.address,this.props.toolProps.contract.abi);

    // Load Balances
    const [
      balanceETH,
      balanceWETH
    ] = await Promise.all([
      this.functionsUtil.getETHBalance(this.props.account),
      this.functionsUtil.getTokenBalance('WETH',this.props.account)
    ]);

    const action = this.state.action || 'wrap';
    const tokenBalance = action === 'wrap' ? balanceETH : balanceWETH;

    this.setState({
      action,
      balanceETH,
      balanceWETH,
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
        selectedToken = 'ETH';
        approveEnabled = true;
        tokenConfig = {
          token:'ETH',
          decimals:18
        };
        tokenBalance = this.state.balanceETH;
        approveDescription = 'To Mint new WETH you need to approve the Smart-Contract first';
        infoBox = {
          icon:'FileDownload',
          // iconProps:{
          //   color:this.props.theme.colors.transactions.action.deposit
          // },
          text:`Wrap your ETH and get WETH with a 1:1 ratio`
        };
      break;
      case 'unwrap':
        selectedToken = 'WETH';
        approveEnabled = false;
        tokenBalance = this.state.balanceWETH;
        tokenConfig = this.props.toolProps.contract;
        approveDescription = 'To withdraw your ETH you need to approve the Smart-Contract first';
        infoBox = {
          icon:'FileUpload',
          // iconProps:{
          //   color:this.props.theme.colors.transactions.action.redeem
          // },
          text:`Unwrap your WETH and get back ETH with a 1:1 ratio`
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
        const mintLog = tx.txReceipt && tx.txReceipt.logs ? tx.txReceipt.logs.find( log => log.address.toLowerCase() === this.props.toolProps.contract.address.toLowerCase() ) : null;
        let mintedAmount = mintLog ? parseInt(mintLog.data,16) : amount;
        mintedAmount = this.functionsUtil.fixTokenDecimals(mintedAmount,this.state.tokenConfig.decimals);
        infoBox = {
          icon:'DoneAll',
          iconProps:{
            color:this.props.theme.colors.transactions.status.completed
          },
          text:`You have received <strong>${mintedAmount.toFixed(4)} WETH</strong>`
        }
      break;
      case 'unwrap':
        const withdrawLog = tx.txReceipt && tx.txReceipt.logs ? tx.txReceipt.logs.find( log => log.address.toLowerCase() === this.props.toolProps.contract.address.toLowerCase() ) : null;
        let withdrawnAmount = withdrawLog ? parseInt(withdrawLog.data,16) : amount;
        withdrawnAmount = this.functionsUtil.fixTokenDecimals(withdrawnAmount,this.state.tokenConfig.decimals);
        infoBox = {
          icon:'DoneAll',
          iconProps:{
            color:this.props.theme.colors.transactions.status.completed
          },
          text:`You have received <strong>${withdrawnAmount.toFixed(4)} ETH</strong>`
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
        params.methodName = 'deposit';
      break;
      case 'unwrap':
        params.value = null;
        params.methodParams = [amount];
        params.methodName = 'withdraw';
      break;
      default:
      break;
    }
    return params;
  }

  render() {

    const fullWidth = !!this.props.fullWidth;
    const depositOnly = !!this.props.depositOnly;

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
                  !this.props.depositOnly && (
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
                          iconColor={'wrap'}
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
                        contractInfo={this.props.toolProps.contract}
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
                      <DashboardCard
                        cardProps={{
                          p:3,
                        }}
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
                      </DashboardCard>
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

export default ETHWrapper;
