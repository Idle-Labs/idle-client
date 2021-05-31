import React, { Component } from 'react';
import FlexLoader from '../FlexLoader/FlexLoader';
import { Flex, Box, Text, Icon } from "rimble-ui";
import RoundButton from '../RoundButton/RoundButton';
import FunctionsUtil from '../utilities/FunctionsUtil';
// import TokenWrapper from '../TokenWrapper/TokenWrapper';
import AssetSelector from '../AssetSelector/AssetSelector';
import DashboardCard from '../DashboardCard/DashboardCard';
import CardIconButton from '../CardIconButton/CardIconButton';
import GenericSelector from '../GenericSelector/GenericSelector';
import SendTxWithBalance from '../SendTxWithBalance/SendTxWithBalance';
import ExecuteTransaction from '../ExecuteTransaction/ExecuteTransaction';

class PolygonBridge extends Component {

  state = {
    stats:[],
    steps:null,
    txsToExit:[],
    infoBox:null,
    polygonTxs:[],
    globalStats:[],
    inputValue:null,
    description:null,
    tokenConfig:null,
    balanceProp:null,
    tokenBalance:null,
    contractInfo:null,
    stakedBalance:null,
    selectedToken:null,
    rewardMultiplier:1,
    accountingData:null,
    selectedAction:null,
    selectedOption:null,
    successMessage:null,
    permitEnabled:false,
    poolTokenPrice:null,
    availableTokens:null,
    availableNetworks:[],
    approveEnabled:false,
    rewardTokenPrice:null,
    contractApproved:false,
    tokenWrapperProps:null,
    distributionSpeed:null,
    defaultTransaction:null,
    approveDescription:null,
    selectedTransaction:null,
    balanceSelectorInfo:null,
    transactionSucceeded:null
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

  componentWillMount(){
    this.loadUtils();
  }

  componentDidMount(){
    this.loadData();
    this.loadPolygonTxs();
  }

  async loadPolygonTxs(){
    const polygonTxs = await this.functionsUtil.getPolygonBridgeTxs();
    this.setState({
      polygonTxs
    });
  }

  async componentDidUpdate(prevProps,prevState){
    this.loadUtils();

    const selectedTokenChanged = prevState.selectedToken !== this.state.selectedToken;
    if (selectedTokenChanged){
      const tokenConfig = this.props.toolProps.availableTokens[this.state.selectedToken];
      const rootTokenConfig = tokenConfig.rootToken;
      const childTokenConfig = tokenConfig.childToken;

      // Init contracts
      if (rootTokenConfig && childTokenConfig){
        await Promise.all([
          this.props.initContract(rootTokenConfig.name,rootTokenConfig.address,rootTokenConfig.abi),
          this.props.initContract(childTokenConfig.name,childTokenConfig.address,childTokenConfig.abi)
        ]);
      }

      this.setState({
        tokenConfig
      },() => {
        this.updateData();
      });
    } else {
      const selectedActionChanged = prevState.selectedAction !== this.state.selectedAction;
      const contractApprovedChanged = prevState.contractApproved !== this.state.contractApproved;
      if (selectedActionChanged || contractApprovedChanged){
        this.updateData(selectedActionChanged);
      }
    }

    const contractInfoChanged = JSON.stringify(prevState.contractInfo) !== JSON.stringify(this.state.contractInfo);
    if (contractInfoChanged){
      this.changeInputCallback();
    }
  }

  async changeInputCallback(inputValue=null){

  }

  getTransactionParams(amount){
    let value = null;
    let methodName = null;
    let methodParams = [];
    let contractName = null;
    amount = this.functionsUtil.toBN(amount);
    switch (this.state.selectedAction){
      case 'Deposit':
        switch (this.state.selectedToken){
          case 'ETH':
            methodName = 'depositEtherFor';
            contractName = 'RootChainManager';
            value = this.props.web3.eth.abi.encodeParameter('uint256', amount);
            methodParams = [this.props.account];
          break;
          default:
            methodName = 'depositFor';
            contractName = 'RootChainManager';
            const depositData = this.props.web3.eth.abi.encodeParameter('uint256', amount);
            methodParams = [this.props.account,this.state.tokenConfig.rootToken.address,depositData];
          break;
        }
      break;
      case 'Withdraw':
        methodName = 'withdraw';
        methodParams = [amount];
        contractName = this.state.tokenConfig.childToken.name;
      break;
      default:
      break;
    }

    // console.log('getTransactionParams',{
    //   value,
    //   methodName,
    //   methodParams,
    //   contractName
    // });

    return {
      value,
      methodName,
      methodParams,
      contractName
    };
  }

  exitCallback(){

  }

  async getExitTransactionParams(){
    const txHash = this.state.selectedTransaction;
    const exitCalldata = await this.props.maticPOSClient.exitERC20(txHash, { from:this.props.account, encodeAbi: true })
    if (exitCalldata && exitCalldata.data){
      return exitCalldata.data;
    }
    return null;
  }

  async contractApproved(contractApproved){
    this.setState({
      contractApproved
    });
  }

  async selectTransaction(selectedTransaction){
    this.setState({
      selectedTransaction
    });
  }

  async transactionSucceeded(tx,amount,params){
    /*
    switch (this.state.selectedAction){
      case 'Deposit':
        const depositedTokensLog = tx.txReceipt && tx.txReceipt.logs ? tx.txReceipt.logs.find( log => log.address.toLowerCase() === this.state.tokenConfig.address.toLowerCase() && log.topics.find( t => t.toLowerCase().includes(this.state.contractInfo.address.replace('0x','').toLowerCase()) ) && log.topics.find( t => t.toLowerCase().includes(this.props.account.replace('0x','').toLowerCase()) ) && log.data.toLowerCase()!=='0xffffffffffffffffffffffffffffffffffffffffffffffffffffffffffffffff'.toLowerCase() ) : null;
        const depositedTokens = depositedTokensLog ? this.functionsUtil.fixTokenDecimals(parseInt(depositedTokensLog.data,16),this.state.tokenConfig.decimals) : this.functionsUtil.BNify(0);
      break;
      case 'Withdraw':
        const withdrawnTokensLog = tx.txReceipt && tx.txReceipt.logs ? tx.txReceipt.logs.find( log => log.address.toLowerCase() === this.state.tokenConfig.address.toLowerCase() && log.topics.find( t => t.toLowerCase().includes(this.state.contractInfo.address.replace('0x','').toLowerCase()) ) && log.topics.find( t => t.toLowerCase().includes(this.props.account.replace('0x','').toLowerCase()) ) && log.data.toLowerCase()!=='0xffffffffffffffffffffffffffffffffffffffffffffffffffffffffffffffff'.toLowerCase() ) : null;
        const withdrawnTokens = withdrawnTokensLog ? this.functionsUtil.fixTokenDecimals(parseInt(withdrawnTokensLog.data,16),this.state.tokenConfig.decimals) : (tx.txReceipt && tx.txReceipt.events && tx.txReceipt.events.Transfer ? this.functionsUtil.fixTokenDecimals(tx.txReceipt.events.Transfer.returnValues.value,this.state.tokenConfig.decimals) : this.functionsUtil.BNify(0));
      break;
      default:
      break;
    }
    */
    const transactionSucceeded = tx;
    this.setState({
      transactionSucceeded
    },() => {
      this.updateData();
    });
  }

  async updateData(selectedActionChanged=false){
    const newState = {};
    const isETH = this.state.selectedToken==='ETH';
    switch (this.state.selectedAction){
      case 'Deposit':
        newState.steps = [];
        newState.permitEnabled = false;
        newState.availableNetworks = [1,5];
        newState.approveEnabled = !isETH;
        newState.contractInfo = this.props.toolProps.contracts.ERC20Predicate;
        newState.approveDescription = `Approve the contract to deposit your ${this.state.selectedToken}`;
        newState.balanceProp = isETH ? await this.functionsUtil.getETHBalance(this.props.account) : await this.functionsUtil.getTokenBalance(this.state.tokenConfig.rootToken.name,this.props.account);
        if (this.state.transactionSucceeded){
          let depositedTokensLog = null;
          let depositedTokensEvent = null;
          if (!isETH){
            depositedTokensEvent = this.state.transactionSucceeded.txReceipt && this.state.transactionSucceeded.txReceipt.events ? Object.values(this.state.transactionSucceeded.txReceipt.events).find( event => event.address.toLowerCase() === this.state.tokenConfig.rootToken.address.toLowerCase() && event.raw.topics.find( t => t.toLowerCase().includes(this.state.contractInfo.address.replace('0x','').toLowerCase()) ) && event.raw.topics.find( t => t.toLowerCase().includes(this.props.account.replace('0x','').toLowerCase()) ) && event.raw.data.toLowerCase()!=='0xffffffffffffffffffffffffffffffffffffffffffffffffffffffffffffffff'.toLowerCase() ) : null;
            depositedTokensLog = this.state.transactionSucceeded.txReceipt && this.state.transactionSucceeded.txReceipt.logs ? this.state.transactionSucceeded.txReceipt.logs.find( log => log.address.toLowerCase() === this.state.tokenConfig.rootToken.address.toLowerCase() && log.topics.find( t => t.toLowerCase().includes(this.state.contractInfo.address.replace('0x','').toLowerCase()) ) && log.topics.find( t => t.toLowerCase().includes(this.props.account.replace('0x','').toLowerCase()) ) && log.data.toLowerCase()!=='0xffffffffffffffffffffffffffffffffffffffffffffffffffffffffffffffff'.toLowerCase() ) : null;
          } else {
            depositedTokensEvent = this.state.transactionSucceeded.txReceipt && this.state.transactionSucceeded.txReceipt.events ? Object.values(this.state.transactionSucceeded.txReceipt.events).find( event => event.address.toLowerCase() === this.props.toolProps.contracts.EtherPredicate.address.toLowerCase() && event.raw.topics.find( t => t.toLowerCase().includes(this.props.account.replace('0x','').toLowerCase()) ) && event.raw.data.toLowerCase()!=='0xffffffffffffffffffffffffffffffffffffffffffffffffffffffffffffffff'.toLowerCase() ) : null;
            depositedTokensLog = this.state.transactionSucceeded.txReceipt && this.state.transactionSucceeded.txReceipt.logs ? this.state.transactionSucceeded.txReceipt.logs.find( log => log.address.toLowerCase() === this.props.toolProps.contracts.EtherPredicate.address.toLowerCase() && log.topics.find( t => t.toLowerCase().includes(this.props.account.replace('0x','').toLowerCase()) ) && log.data.toLowerCase()!=='0xffffffffffffffffffffffffffffffffffffffffffffffffffffffffffffffff'.toLowerCase() ) : null;
          }
          const depositedTokens = depositedTokensLog ? this.functionsUtil.fixTokenDecimals(parseInt(depositedTokensLog.data,16),this.state.tokenConfig.decimals) : ( depositedTokensEvent ? this.functionsUtil.fixTokenDecimals(parseInt(depositedTokensEvent.raw.data,16),this.state.tokenConfig.decimals) : this.functionsUtil.BNify(0));
          debugger;
          newState.infoBox = {
            icon:'DoneAll',
            iconProps:{
              color:this.props.theme.colors.transactions.status.completed
            },
            text:`You have successfully deposited <strong>${depositedTokens.toFixed(4)} ${this.state.selectedToken}</strong> in the Polygon chain. Please wait up to 10 minutes for your balance to be accounted in the Polygon chain.`
          }
        } else {
          newState.infoBox = {
            icon:'InfoOutline',
            iconProps:{
              color:'cellText'
            },
            text:`Please note that deposit of funds takes ~7-8 minutes to be accounted in the Polygon chain.`
          }
        }
      break;
      case 'Withdraw':
        newState.permitEnabled = false;
        newState.approveEnabled = false;
        newState.approveDescription = '';
        newState.availableNetworks = [137,80001];
        newState.contractInfo = this.state.tokenConfig.childToken;
        newState.balanceProp = await this.functionsUtil.getTokenBalance(this.state.tokenConfig.childToken.name,this.props.account);

        const currentNetwork = this.functionsUtil.getCurrentNetwork();
        const maticNetwork = currentNetwork.name;
        const mainNetwork = currentNetwork.network === 'mainnet' ? this.functionsUtil.getGlobalConfig(['network','availableNetworks',1,'name']) : this.functionsUtil.getGlobalConfig(['network','availableNetworks',5,'name']);
        newState.steps = [
          {
            icon:'LooksOne',
            completed:false,
            description:`Withdraw ${this.state.selectedToken} from ${maticNetwork} network`
          },
          {
            icon:'LooksTwo',
            completed:false,
            description:`Wait for the checkpoint to be submitted`
          },
          {
            icon:'Looks3',
            completed:false,
            description:`Exit ${this.state.selectedToken} from ${mainNetwork} network`
          },
        ];
        if (this.state.transactionSucceeded){
          const withdrawnTokensEvent = this.state.transactionSucceeded.txReceipt && this.state.transactionSucceeded.txReceipt.events ? Object.values(this.state.transactionSucceeded.txReceipt.events).find( event => event.address.toLowerCase() === this.state.tokenConfig.childToken.address.toLowerCase() && event.raw.topics.find( t => t.toLowerCase().includes(this.state.contractInfo.address.replace('0x','').toLowerCase()) ) && event.raw.topics.find( t => t.toLowerCase().includes(this.props.account.replace('0x','').toLowerCase()) ) && event.raw.data.toLowerCase()!=='0xffffffffffffffffffffffffffffffffffffffffffffffffffffffffffffffff'.toLowerCase() ) : null;
          const withdrawnTokensLog = this.state.transactionSucceeded.txReceipt && this.state.transactionSucceeded.txReceipt.logs ? this.state.transactionSucceeded.txReceipt.logs.find( log => log.address.toLowerCase() === this.state.tokenConfig.childToken.address.toLowerCase() && log.topics.find( t => t.toLowerCase().includes(this.state.contractInfo.address.replace('0x','').toLowerCase()) ) && log.topics.find( t => t.toLowerCase().includes(this.props.account.replace('0x','').toLowerCase()) ) && log.data.toLowerCase()!=='0xffffffffffffffffffffffffffffffffffffffffffffffffffffffffffffffff'.toLowerCase() ) : null;
          const withdrawnTokens = withdrawnTokensLog ? this.functionsUtil.fixTokenDecimals(parseInt(withdrawnTokensLog.data,16),this.state.tokenConfig.decimals) : (this.state.transactionSucceeded.txReceipt && this.state.transactionSucceeded.txReceipt.events && this.state.transactionSucceeded.txReceipt.events.Transfer ? this.functionsUtil.fixTokenDecimals(this.state.transactionSucceeded.txReceipt.events.Transfer.returnValues.value,this.state.tokenConfig.decimals) : ( withdrawnTokensEvent ? this.functionsUtil.fixTokenDecimals(parseInt(withdrawnTokensEvent.raw.data,16),this.state.tokenConfig.decimals)  : this.functionsUtil.BNify(0)));
          newState.infoBox = {
            icon:'DoneAll',
            iconProps:{
              color:this.props.theme.colors.transactions.status.completed
            },
            text:`You have successfully withdrawn <strong>${withdrawnTokens.toFixed(4)} ${this.state.selectedToken}</strong> from the Polygon chain. Please wait up to 2-3 hours to be able to complete the withdrawal.`
          }
        } else {
          newState.infoBox = {
            icon:'InfoOutline',
            iconProps:{
              color:'cellText'
            },
            text:`Please note that withdrawals from the Polygon chain take up to 2-3 hours to be completed.`
          }
        }
      break;
      case 'Exit':
        newState.availableNetworks = [1,5];
        newState.txsToExit = this.state.polygonTxs.filter( tx => tx.included && !tx.exited && tx.token === this.state.selectedToken ).map( tx => {
          const label = this.functionsUtil.strToMoment(tx.timeStamp*1000).format('DD-MM-YYYY HH:mm')+' - '+tx.value.toFixed(6)+' '+tx.token;
          return {
            label,
            data:tx,
            value:tx.hash
          }
        });

        newState.defaultTransaction = newState.txsToExit.length>0 ? newState.txsToExit[0] : null;
        newState.selectedTransaction = newState.defaultTransaction ? newState.defaultTransaction.data.hash : null;
      break;
      default:
      break;
    }

    if (selectedActionChanged){
      newState.infoBox = null;
      newState.transactionSucceeded = false;
    }

    if (!newState.balanceProp){
      newState.balanceProp = this.functionsUtil.BNify(0);
    }

    // console.log('updateData',newState);

    this.setState(newState);
  }

  async loadData(){
    const availableTokens = Object.keys(this.props.toolProps.availableTokens).reduce( (output,token) => {
      const tokenConfig = this.props.toolProps.availableTokens[token];
      if (tokenConfig.enabled){
        output.push({
          value:token,
          label:token,
          ...tokenConfig
        });
      }
      return output;
    },[]);

    const selectedToken = this.props.urlParams.param2 && this.props.toolProps.availableTokens[this.props.urlParams.param2] ? this.props.urlParams.param2 : (this.props.selectedToken || this.state.selectedToken || availableTokens[0].value);
    const selectedOption = availableTokens.find( t => t.value === selectedToken );
    const selectedAction = this.props.action || this.state.action || 'Deposit';

    this.setState({
      selectedToken,
      selectedOption,
      selectedAction,
      availableTokens
    });
  }

  async exitSelectedTransaction(){

  }

  selectToken(selectedToken){
    this.setState({
      selectedToken
    });
  }

  setAction(selectedAction){
    this.setState({
      selectedAction
    });
  }

  render() {
    const fullWidth = !!this.props.fullWidth;
    const isExit = this.state.selectedAction === 'Exit';
    const isDeposit = this.state.selectedAction === 'Deposit';
    const isWithdraw = this.state.selectedAction === 'Withdraw';
    const currentNetwork = this.functionsUtil.getCurrentNetwork();
    const currentNetworkId = currentNetwork.id;

    return (
      <Flex
        width={1}
        alignItems={'center'}
        flexDirection={'column'}
        justifyContent={'center'}
      >
        {
          !this.state.availableTokens ? (
            <Flex
              mt={4}
              flexDirection={'column'}
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
                text={'Loading tokens...'}
              />
            </Flex>
          ) : (
            <Flex
              width={1}
              alignItems={'center'}
              justifyContent={'center'}
            >
              {
                !this.state.availableTokens.length ? (
                  <Text
                    fontWeight={2}
                    fontSize={[2,3]}
                    color={'dark-gray'}
                    textAlign={'center'}
                  >
                    There are no active tokens.
                  </Text>
                ) : (
                  <Flex
                    alignItems={'stretch'}
                    flexDirection={'column'}
                    justifyContent={'center'}
                    width={[1,fullWidth ? 1 : 0.36]}
                  >
                    {
                      !this.props.selectedToken && (
                        <Box
                          width={1}
                        >
                          <Text
                            mb={1}
                          >
                            Select Token:
                          </Text>
                          <AssetSelector
                            id={'tokens'}
                            {...this.props}
                            showBalance={false}
                            isSearchable={false}
                            onChange={this.selectToken.bind(this)}
                            selectedToken={this.state.selectedToken}
                            availableTokens={this.props.toolProps.availableTokens}
                          />
                        </Box>
                      )
                    }
                    {
                      this.state.selectedToken && (
                        <Box
                          mt={2}
                          width={1}
                        >
                          {
                            !this.props.action && (
                              <Box
                                width={1}
                              >
                                <Text
                                  mb={2}
                                >
                                  Choose the action:
                                </Text>
                                <Flex
                                  mb={3}
                                  alignItems={'center'}
                                  flexDirection={'row'}
                                  justifyContent={'space-between'}
                                >
                                  <CardIconButton
                                    {...this.props}
                                    cardProps={{
                                      px:3,
                                      py:2,
                                      width:0.325
                                    }}
                                    textProps={{
                                      fontWeight:2,
                                      fontSize:[1,2]
                                    }}
                                    text={'Deposit'}
                                    iconColor={'deposit'}
                                    icon={'ArrowDownward'}
                                    iconBgColor={'#ced6ff'}
                                    handleClick={ e => this.setAction('Deposit') }
                                    isActive={ this.state.selectedAction === 'Deposit' }
                                  />
                                  <CardIconButton
                                    {...this.props}
                                    cardProps={{
                                      px:3,
                                      py:2,
                                      width:0.325
                                    }}
                                    textProps={{
                                      fontWeight:2,
                                      fontSize:[1,2]
                                    }}
                                    text={'Withdraw'}
                                    iconColor={'redeem'}
                                    icon={'ArrowUpward'}
                                    iconBgColor={'#ceeff6'}
                                    handleClick={ e => this.setAction('Withdraw') }
                                    isActive={ this.state.selectedAction === 'Withdraw' }
                                  />
                                  <CardIconButton
                                    {...this.props}
                                    cardProps={{
                                      px:3,
                                      py:2,
                                      width:0.325
                                    }}
                                    textProps={{
                                      fontWeight:2,
                                      fontSize:[1,2]
                                    }}
                                    text={'Exit'}
                                    icon={'SwapHoriz'}
                                    iconColor={'redeem'}
                                    iconBgColor={'#ceeff6'}
                                    handleClick={ e => this.setAction('Exit') }
                                    isActive={ this.state.selectedAction === 'Exit' }
                                  />
                                </Flex>
                              </Box>
                            )
                          }
                          {
                            !this.state.availableNetworks.includes(currentNetworkId) ? (
                              <DashboardCard
                                cardProps={{
                                  p:3,
                                  mb:3,
                                  width:1
                                }}
                              >
                                <Flex
                                  alignItems={'center'}
                                  flexDirection={'column'}
                                >
                                  <Icon
                                    size={'1.8em'}
                                    name={'Warning'}
                                    color={'cellText'}
                                  />
                                  <Text
                                    mt={1}
                                    fontSize={2}
                                    color={'cellText'}
                                    textAlign={'center'}
                                  >
                                    The <strong>{this.functionsUtil.capitalize(currentNetwork.name)} network</strong> is not supported for this function, please switch to <strong>{this.functionsUtil.getGlobalConfig(['network','availableNetworks',this.functionsUtil.getGlobalConfig(['network','providers','polygon','networkPairs',currentNetworkId]),'name'])} network</strong>.
                                  </Text>
                                </Flex>
                              </DashboardCard>
                            ) : (this.state.tokenConfig && this.state.balanceProp && this.state.contractInfo) ? (
                              <Box
                                mt={1}
                                width={1}
                                mb={[4,3]}
                              >
                                {
                                  (isDeposit || isWithdraw) ? (
                                    <SendTxWithBalance
                                      {...this.props}
                                      error={this.state.error}
                                      steps={this.state.steps}
                                      infoBox={this.state.infoBox}
                                      action={this.state.selectedAction}
                                      tokenConfig={this.state.tokenConfig}
                                      tokenBalance={this.state.balanceProp}
                                      contractInfo={this.state.contractInfo}
                                      permitEnabled={this.state.permitEnabled}
                                      approveEnabled={this.state.approveEnabled}
                                      callback={this.transactionSucceeded.bind(this)}
                                      approveDescription={this.state.approveDescription}
                                      contractApproved={this.contractApproved.bind(this)}
                                      balanceSelectorInfo={this.state.balanceSelectorInfo}
                                      changeInputCallback={this.changeInputCallback.bind(this)}
                                      getTransactionParams={this.getTransactionParams.bind(this)}
                                    >
                                      <DashboardCard
                                        cardProps={{
                                          p:3
                                        }}
                                      >
                                        <Flex
                                          alignItems={'center'}
                                          flexDirection={'column'}
                                        >
                                          <Icon
                                            name={'MoneyOff'}
                                            color={'cellText'}
                                            size={this.props.isMobile ? '1.8em' : '2.3em'}
                                          />
                                          <Text
                                            mt={1}
                                            fontSize={2}
                                            color={'cellText'}
                                            textAlign={'center'}
                                          >
                                            {
                                              isDeposit ? (
                                                `You don't have any ${this.state.selectedToken} in your wallet.`
                                              ) : isWithdraw && (
                                                `You don't have any ${this.state.selectedToken} to withdraw.`
                                              )
                                            }
                                          </Text>
                                        </Flex>
                                      </DashboardCard>
                                    </SendTxWithBalance>
                                  ) : isExit && (
                                    <Box
                                      width={1}
                                    >
                                      {
                                        this.state.txsToExit.length ? (
                                          <Box
                                            width={1}
                                          >
                                            <Text mb={1}>
                                              Select Transaction:
                                            </Text>
                                            <GenericSelector
                                              {...this.props}
                                              isSearchable={false}
                                              name={'transactions'}
                                              options={this.state.txsToExit}
                                              onChange={this.selectTransaction.bind(this)}
                                              defaultValue={this.state.defaultTransaction}
                                            />
                                            {
                                              this.state.selectedTransaction && (
                                                <ExecuteTransaction
                                                  action={'Exit'}
                                                  Component={RoundButton}
                                                  parentProps={{
                                                    mt:3,
                                                    alignItems:'center',
                                                    justifyContent:'center'
                                                  }}
                                                  componentProps={{
                                                    buttonProps:{
                                                      value:'Exit',
                                                      width:[1,1/3],
                                                      size:'medium',
                                                      mainColor:'redeem'
                                                    },
                                                    value:'Exit Transaction',
                                                  }}
                                                  params={[]}
                                                  methodName={'exit'}
                                                  sendRawTransaction={true}
                                                  contractName={'RootChainManager'}
                                                  callback={this.exitCallback.bind(this)}
                                                  getTransactionParamsAsync={this.getExitTransactionParams.bind(this)}
                                                  {...this.props}
                                                >
                                                  <Flex
                                                    flexDirection={'row'}
                                                    alignItems={'center'}
                                                    justifyContent={'center'}
                                                  >
                                                    <Icon
                                                      mr={1}
                                                      name={'Done'}
                                                      size={'1.4em'}
                                                      color={this.props.theme.colors.transactions.status.completed}
                                                    />
                                                    <Text
                                                      fontWeight={500}
                                                      fontSize={'15px'}
                                                      color={'copyColor'}
                                                      textAlign={'center'}
                                                    >
                                                      Transaction successfully exited!
                                                    </Text>
                                                  </Flex>
                                                </ExecuteTransaction>
                                              )
                                            }
                                          </Box>
                                        ) : (
                                          <DashboardCard
                                            cardProps={{
                                              p:3,
                                              width:1
                                            }}
                                          >
                                            <Flex
                                              alignItems={'center'}
                                              flexDirection={'column'}
                                            >
                                              <Icon
                                                size={'1.8em'}
                                                name={'Warning'}
                                                color={'cellText'}
                                              />
                                              <Text
                                                mt={1}
                                                fontSize={2}
                                                color={'cellText'}
                                                textAlign={'center'}
                                              >
                                                You cannot exit any transaction yet.
                                              </Text>
                                            </Flex>
                                          </DashboardCard>
                                        )
                                      }
                                    </Box>
                                  )
                                }
                              </Box>
                            ) : (
                              <Flex
                                mt={3}
                                mb={3}
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
                                  text={'Loading info...'}
                                />
                              </Flex>
                            )
                          }
                        </Box>
                      )
                    }
                  </Flex>
                )
              }
            </Flex>
          )
        }
      </Flex>
    );
  }
}

export default PolygonBridge;