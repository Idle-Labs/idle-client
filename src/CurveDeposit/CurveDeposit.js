import React, { Component } from 'react';
import RoundButton from '../RoundButton/RoundButton';
import FunctionsUtil from '../utilities/FunctionsUtil';
import TxProgressBar from '../TxProgressBar/TxProgressBar';
import DashboardCard from '../DashboardCard/DashboardCard';
import { Flex, Box, Text, Icon, Tooltip, Link, Input } from "rimble-ui";
import FastBalanceSelector from '../FastBalanceSelector/FastBalanceSelector';

class CurveDeposit extends Component {

  state = {
    processing:{
      txHash:null,
      loading:false
    },
    inputValue:null,
    maxSlippage:0.2,
    depositSlippage:null,
    redeemableBalance:null,
    migrationContract:null,
    curveTokensBalance:null,
    migrationSucceeded:false,
    fastBalanceSelector:null,
    migrationContractApproved:false,
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
  }

  async componentDidMount(){
    await this.initToken();
  }

  async componentDidUpdate(prevProps,prevState){
    this.loadUtils();

    const accountChanged = prevProps.account !== this.props.account;
    const idleTokenBalanceChanged = prevProps.idleTokenBalance !== this.props.idleTokenBalance;
    if (accountChanged || idleTokenBalanceChanged){
      await this.initToken();
    }
    
    const fastBalanceSelectorChanged = this.state.fastBalanceSelector !== prevState.fastBalanceSelector;
    if (fastBalanceSelectorChanged){
      this.setInputValue();
    }

    const inputValueChanged = this.state.inputValue !== prevState.inputValue;
    if (inputValueChanged){
      this.calculateSlippage();
    }
  }

  changeInputValue = (e) => {
    const inputValue = e.target.value.length && !isNaN(e.target.value) ? this.functionsUtil.BNify(e.target.value) : this.functionsUtil.BNify(0);
    this.checkButtonDisabled(inputValue);

    const fastBalanceSelector = null;

    this.setState((prevState) => ({
      inputValue,
      fastBalanceSelector,
    }));
  }

  setInputValue = () => {
    if (this.state.fastBalanceSelector === null){
      return false;
    }

    const selectedPercentage = this.functionsUtil.BNify(this.state.fastBalanceSelector).div(100);
    const inputValue = this.props.idleTokenBalance ? this.functionsUtil.BNify(this.props.idleTokenBalance).times(selectedPercentage) : null;

    this.checkButtonDisabled(inputValue);

    this.setState({
      inputValue
    });
  }

  getFastBalanceSelector = () => {
    if (this.state.fastBalanceSelector === null){
      return false;
    }
    return this.functionsUtil.BNify(this.state.fastBalanceSelector).div(100);
  }

  setFastBalanceSelector = (fastBalanceSelector) => {
    this.setState({
      fastBalanceSelector
    });
  }

  checkButtonDisabled = (amount=null) => {

    if (!amount){
      amount = this.state.inputValue;
    }

    const buttonDisabled = !amount || amount.gt(this.state.idleTokenBalance);

    this.setState({
      buttonDisabled
    });
  }

  approve = async () => {
    const migrationContract = this.state.migrationContract;
    if (migrationContract){

      // Check if the migration contract is approved
      const migrationContractApproved = await this.checkMigrationContractApproved();

      if (!migrationContractApproved){

        const callbackApprove = (tx,error) => {
          // Send Google Analytics event
          const eventData = {
            eventAction: 'approve',
            eventCategory: 'CurveDeposit',
            eventLabel: tx ? tx.status : null
          };

          const txSucceeded = tx && tx.status === 'success';

          // console.log('callbackApprove',tx,error);

          if (error){
            eventData.eventLabel = this.functionsUtil.getTransactionError(error);
          }

          // Send Google Analytics event
          if (error || eventData.status !== 'error'){
            this.functionsUtil.sendGoogleAnalyticsEvent(eventData);
          }

          this.setState((prevState) => ({
            migrationContractApproved: txSucceeded, // True
            processing: {
              ...prevState.processing,
              txHash:null,
              loading:false
            }
          }));

          if (typeof this.props.callbackApprove === 'function' && txSucceeded){
            this.props.callbackApprove(tx);
          }

          this.checkMigration();
        };

        const callbackReceiptApprove = (tx) => {
          const txHash = tx.transactionHash;
          this.setState((prevState) => ({
            processing: {
              ...prevState.processing,
              txHash
            }
          }));
        };

        this.functionsUtil.enableERC20(this.props.selectedToken,migrationContract.address,callbackApprove,callbackReceiptApprove);

        this.setState((prevState) => ({
          processing: {
            ...prevState.processing,
            txHash:null,
            loading:true
          },
          migrationContractApproved:false
        }));
      } else {
        this.setState({
          migrationContractApproved:true
        });
      }
    }
  }

  deposit = async () => {

    const inputValue = this.state.inputValue ? this.functionsUtil.BNify(this.state.inputValue) : null;
    if (!inputValue){
      return false;
    }

    const callbackDeposit = (tx,error) => {
      const txSucceeded = tx.status === 'success';

      // Send Google Analytics event
      const eventData = {
        eventLabel: tx.status,
        eventCategory: `CurveDeposit`,
        eventAction: this.props.selectedToken,
        eventValue: inputValue.toFixed()
      };

      if (error){
        eventData.eventLabel = this.functionsUtil.getTransactionError(error);
      }

      // Send Google Analytics event
      if (error || eventData.status !== 'error'){
        this.functionsUtil.sendGoogleAnalyticsEvent(eventData);
      }

      this.setState((prevState) => ({
        processing: {
          txHash:null,
          loading:false
        }
      }));

      if (typeof this.props.callbackDeposit === 'function' && txSucceeded){
        this.props.callbackDeposit(tx);
      }
    };

    const callbackReceiptDeposit = (tx) => {
      const txHash = tx.transactionHash;
      this.setState((prevState) => ({
        processing: {
          ...prevState.processing,
          txHash
        }
      }));
    };

    const contractName = this.state.migrationContract.name;
    const _amount = this.functionsUtil.normalizeTokenAmount(inputValue,this.props.tokenConfig.decimals);
    const depositParams = await this.getMigrationParams(_amount);

    this.props.contractMethodSendWrapper(contractName, 'add_liquidity', depositParams, null, callbackDeposit, callbackReceiptDeposit);

    this.setState((prevState) => ({
      processing: {
        ...prevState.processing,
        loading:true
      }
    }));
  }

  cancelTransaction = async () => {
    this.setState({
      processing: {
        txHash:null,
        loading:false
      }
    });
  }

  setMaxSlippage = (maxSlippage) => {
    this.setState({
      maxSlippage
    });
  }

  async getMigrationParams(toMigrate){
    const migrationParams = [];
    const curveTokenConfig = this.functionsUtil.getGlobalConfig(['curve','availableTokens',this.props.selectedToken]);

    if (!curveTokenConfig){
      return false;
    }
    
    const migrationContractParams = curveTokenConfig.migrationParams;
    if (migrationContractParams.n_coins){
      const amounts = await this.functionsUtil.getCurveAmounts(this.props.selectedToken,toMigrate,true);
      let minMintAmount = await this.functionsUtil.getCurveTokenAmount(amounts);

      if (this.state.maxSlippage){
        minMintAmount = this.functionsUtil.BNify(minMintAmount);
        minMintAmount = minMintAmount.minus(minMintAmount.times(this.functionsUtil.BNify(this.state.maxSlippage).div(100)));
        minMintAmount = this.functionsUtil.integerValue(minMintAmount);
      }

      migrationParams.push(amounts);
      migrationParams.push(minMintAmount);
    }

    return migrationParams;
  }

  async calculateSlippage(){
    const inputValue = this.state.inputValue ? this.functionsUtil.BNify(this.state.inputValue) : null;

    if (inputValue){
      let underlyingBalanceToDeposit = inputValue;
      if (underlyingBalanceToDeposit){
        const idleTokenPrice = await this.functionsUtil.getIdleTokenPrice(this.props.tokenConfig);
        if (idleTokenPrice){
          underlyingBalanceToDeposit = underlyingBalanceToDeposit.times(idleTokenPrice);
        }
      } else {
        underlyingBalanceToDeposit = this.functionsUtil.BNify(0);
      }

      const normalizeIdleTokenBalance = this.functionsUtil.normalizeTokenAmount(underlyingBalanceToDeposit,this.props.tokenConfig.decimals);
      let depositSlippage = await this.functionsUtil.getCurveSlippage(this.props.tokenConfig.idle.token,normalizeIdleTokenBalance);
      if (depositSlippage){
        depositSlippage = depositSlippage.times(100);
      }

      this.setState({
        depositSlippage
      });
    }
  }

  async checkMigrationContractApproved(){
    const migrationContract = this.state.migrationContract || await this.functionsUtil.getCurveSwapContract();
    if (migrationContract){
      return await this.functionsUtil.checkTokenApproved(this.props.tokenConfig.idle.token,migrationContract.address,this.props.account);
    }
    return false;
  }

  async initToken(){

    // Init and check migration contract
    const migrationContract = await this.functionsUtil.getCurveSwapContract();
    const migrationContractApproved = await this.checkMigrationContractApproved();

    this.setState({
      migrationContract,
      migrationContractApproved
    });
  }

  approveCallback = () => {
    this.initToken();
  }

  migrationCallback = () => {
    this.setState({
      migrationSucceeded:true
    });
  }

  render() {

    if (!this.props.selectedToken){
      return null;
    }

    // const curveConfig = this.functionsUtil.getGlobalConfig(['curve']);
    const hasCurveTokens = this.state.curveTokensBalance && this.state.curveTokensBalance.gt(0);

    return (
      <Flex
        width={1}
        alignItems={'center'}
        flexDirection={'column'}
        justifyContent={'center'}
      >
        <Flex
          width={[1,0.36]}
          alignItems={'stretch'}
          flexDirection={'column'}
          justifyContent={'center'}
        >
            {
              this.props.idleTokenBalance && this.props.idleTokenBalance.gt(0) && (
                <Box
                  width={1}
                >
                  <DashboardCard
                    cardProps={{
                      p:3,
                      px:[2,4]
                    }}
                  >
                    <Flex
                      alignItems={'center'}
                      flexDirection={'column'}
                    > 
                      <Flex
                        width={1}
                        alignItems={'center'}
                        flexDirection={'row'}
                      >
                        <Icon
                          size={'1.5em'}
                          name={ this.state.migrationContractApproved ? 'CheckBox' : 'LooksOne'}
                          color={ this.state.migrationContractApproved ? this.props.theme.colors.transactions.status.completed : 'cellText'}
                        />
                        <Text
                          ml={2}
                          fontSize={2}
                          color={'cellText'}
                          textAlign={'left'}
                        >
                          Approve the Curve contract
                        </Text>
                      </Flex>
                      <Flex
                        mt={2}
                        width={1}
                        alignItems={'center'}
                        flexDirection={'row'}
                      >
                        <Icon
                          size={'1.5em'}
                          name={ hasCurveTokens ? 'CheckBox' : 'LooksTwo'}
                          color={ hasCurveTokens ? this.props.theme.colors.transactions.status.completed : 'cellText'}
                        />
                        <Text
                          ml={2}
                          fontSize={2}
                          color={'cellText'}
                          textAlign={'left'}
                        >
                          Deposit your {this.props.tokenConfig.idle.token}
                        </Text>
                      </Flex>
                    </Flex>
                  </DashboardCard>
                  {
                    !this.state.migrationContractApproved ?
                      this.state.processing.loading ? (
                        <Flex
                          mt={3}
                          flexDirection={'column'}
                        >
                          <TxProgressBar
                            web3={this.props.web3}
                            waitText={`Approve estimated in`}
                            hash={this.state.processing.txHash}
                            endMessage={`Finalizing approve request...`}
                            cancelTransaction={this.cancelTransaction.bind(this)}
                          />
                        </Flex>
                      ) : (
                        <DashboardCard
                          cardProps={{
                            p:3,
                            mt:3,
                          }}
                        >
                          <Flex
                            alignItems={'center'}
                            flexDirection={'column'}
                          >
                            <Icon
                              size={'2.3em'}
                              name={'LockOpen'}
                              color={'cellText'}
                            />
                            <Text
                              mt={1}
                              fontSize={2}
                              color={'cellText'}
                              textAlign={'center'}
                            >
                              To deposit your {this.props.selectedToken} in the Curve Pool you need to approve the Smart-Contract first.
                            </Text>
                            <RoundButton
                              buttonProps={{
                                mt:3,
                                width:[1,1/2]
                              }}
                              handleClick={this.approve.bind(this)}
                            >
                              Approve
                            </RoundButton>
                          </Flex>
                        </DashboardCard>
                      )
                    : this.state.processing.loading ? (
                      <Flex
                        mt={3}
                        flexDirection={'column'}
                      >
                        <TxProgressBar
                          web3={this.props.web3}
                          waitText={`Deposit estimated in`}
                          hash={this.state.processing.txHash}
                          endMessage={`Finalizing deposit request...`}
                          cancelTransaction={this.cancelTransaction.bind(this)}
                        />
                      </Flex>
                    ) : (
                      <Box
                        mt={2}
                        width={1}
                      >
                        <Flex
                          alignItems={'center'}
                          flexDirection={'row'}
                        >
                          <Text>
                            Choose max slippage:
                          </Text>
                          <Tooltip
                            placement={'top'}
                            message={`Max additional slippage on top of the one shown below`}
                          >
                            <Icon
                              ml={1}
                              size={'1em'}
                              color={'cellTitle'}
                              name={"InfoOutline"}
                            />
                          </Tooltip>
                        </Flex>
                        <Flex
                          mt={2}
                          alignItems={'center'}
                          flexDirection={'row'}
                          justifyContent={'space-between'}
                        >
                          {
                            [0.2,0.5,1,5].map( slippage => (
                              <FastBalanceSelector
                                cardProps={{
                                  p:1
                                }}
                                textProps={{
                                  fontSize:1
                                }}
                                percentage={slippage}
                                key={`selector_${slippage}`}
                                onMouseDown={()=>this.setMaxSlippage(slippage)}
                                isActive={this.state.maxSlippage === parseFloat(slippage)}
                              />
                            ))
                          }
                        </Flex>
                        <Flex
                          mt={2}
                          mb={3}
                          width={1}
                          flexDirection={'column'}
                        >
                          <Flex
                            mb={1}
                            alignItems={'center'}
                            flexDirection={'row'}
                            justifyContent={this.state.depositSlippage ? 'space-between' : 'flex-end'}
                          >
                            {
                              this.state.depositSlippage && (
                                <Flex
                                  width={1}
                                  maxWidth={'50%'}
                                  alignItems={'center'}
                                  flexDirection={'row'}
                                >
                                  <Text
                                    fontSize={1}
                                    fontWeight={3}
                                    textAlign={'right'}
                                    style={{
                                      whiteSpace:'nowrap'
                                    }}
                                    color={ parseFloat(this.state.depositSlippage.toFixed(3))>0 ? this.props.theme.colors.transactions.status.failed : this.props.theme.colors.transactions.status.completed }
                                  >
                                    {
                                      parseFloat(this.state.depositSlippage.toFixed(3)) === 0 ?
                                        'No Slippage'
                                      : `${ this.state.depositSlippage.gt(0) ? 'Slippage: ' : 'Bonus: ' } ${this.state.depositSlippage.abs().toFixed(3)}%`
                                    }
                                  </Text>
                                  <Tooltip
                                    placement={'top'}
                                    message={this.state.depositSlippage.gt(0) ? 'Slippage comes from depositing too many coins not in balance, and current coin prices are additionally accounted for' : 'Bonus comes as an advantage from current coin prices which usually appears for coins which are high in balance'}
                                  >
                                    <Icon
                                      ml={1}
                                      size={'1em'}
                                      color={'cellTitle'}
                                      name={"InfoOutline"}
                                    />
                                  </Tooltip>
                                </Flex>
                              )
                            }
                            {
                              this.props.idleTokenBalance && (
                                <Flex
                                  width={1}
                                  maxWidth={'50%'}
                                  alignItems={'center'}
                                  flexDirection={'row'}
                                  justifyContent={'flex-end'}
                                >
                                  <Link
                                    fontSize={1}
                                    fontWeight={3}
                                    color={'dark-gray'}
                                    textAlign={'right'}
                                    hoverColor={'copyColor'}
                                    onClick={ (e) => this.setFastBalanceSelector(100) }
                                    style={{
                                      maxWidth:'100%',
                                      overflow:'hidden',
                                      whiteSpace:'nowrap',
                                      textOverflow:'ellipsis'
                                    }}
                                  >
                                    {this.props.idleTokenBalance.toFixed(this.props.isMobile ? 2 : 4)} {this.props.selectedToken}
                                  </Link>
                                </Flex>
                              )
                            }
                          </Flex>
                          <Input
                            min={0}
                            type={"number"}
                            required={true}
                            height={'3.4em'}
                            borderRadius={2}
                            fontWeight={500}
                            boxShadow={'none !important'}
                            placeholder={`Insert amount`}
                            onChange={this.changeInputValue.bind(this)}
                            border={`1px solid ${this.props.theme.colors.divider}`}
                            value={this.state.inputValue !== null ? this.functionsUtil.BNify(this.state.inputValue).toFixed() : ''}
                          />
                          <Flex
                            mt={2}
                            alignItems={'center'}
                            flexDirection={'row'}
                            justifyContent={'space-between'}
                          >
                            {
                              [25,50,75,100].map( percentage => (
                                <FastBalanceSelector
                                  percentage={percentage}
                                  key={`selector_${percentage}`}
                                  onMouseDown={()=>this.setFastBalanceSelector(percentage)}
                                  isActive={this.state.fastBalanceSelector === parseInt(percentage)}
                                />
                              ))
                            }
                          </Flex>
                          <Flex
                            mt={2}
                            justifyContent={'center'}
                          >
                            <RoundButton
                              buttonProps={{
                                mt:2,
                                width:[1,1/2],
                                disabled:this.state.buttonDisabled
                              }}
                              handleClick={this.deposit.bind(this)}
                            >
                              Deposit
                            </RoundButton>
                          </Flex>
                        </Flex>
                      </Box>
                    )
                  }
                </Box>
              )
            }
          {
            /*
            this.state.tokenConfig && this.state.redeemableBalance ? (
              <Box width={1}>
                <Migrate
                  {...this.props}
                  showActions={false}
                  getTokenPrice={false}
                  migrationTextProps={{
                    fontWeight:500
                  }}
                  isMigrationTool={true}
                  migrationImage={{
                    mb:1,
                    height:'1.8em',
                    src:curveConfig.params.image
                  }}
                  showBalanceSelector={true}
                  waitText={'Deposit estimated in'}
                  tokenConfig={this.state.tokenConfig}
                  callbackApprove={this.approveCallback.bind(this)}
                  migrationParams={this.getMigrationParams.bind(this)}
                  migrationCallback={this.migrationCallback.bind(this)}
                  approveText={`To deposit your ${this.props.tokenConfig.idle.token} you need to approve Curve smart-contract first.`}
                  migrationText={`You can deposit ${this.state.redeemableBalance.toFixed(4)} ${this.props.tokenConfig.idle.token} in the Curve Pool${ this.state.depositSlippage ? (this.state.depositSlippage.gte(0) ? ` with <span style="color:${this.props.theme.colors.transactions.status.failed}">${this.state.depositSlippage.times(100).toFixed(2)}% of slippage</span>` : ` with <span style="color:${this.props.theme.colors.transactions.status.completed}">${Math.abs(parseFloat(this.state.depositSlippage.times(100).toFixed(2)))}% of bonus</span>`) : '' }.`}
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
                            size={'2.3em'}
                            name={'Input'}
                            color={'cellText'}
                          />
                          <Text
                            mt={2}
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
                      <DashboardCard
                        cardProps={{
                          p:3
                        }}
                      >
                        {
                          this.state.migrationSucceeded ? (
                            <Flex
                              alignItems={'center'}
                              flexDirection={'column'}
                            >
                              <Icon
                                size={'2.3em'}
                                name={'DoneAll'}
                                color={this.props.theme.colors.transactions.status.completed}
                              />
                              <Text
                                mt={2}
                                fontSize={2}
                                color={'cellText'}
                                textAlign={'center'}
                              >
                                You have successfully deposited your {this.props.tokenConfig.idle.token} in the Curve Pool!
                              </Text>
                            </Flex>
                          ) : (
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
                                You don't have any {this.props.tokenConfig.idle.token} in your wallet.
                              </Text>
                            </Flex>
                          )
                        }
                      </DashboardCard>
                    )
                  }
                </Migrate>
              </Box>
            ) : null
            */
          }
        </Flex>
      </Flex>
    );
  }
}

export default CurveDeposit;