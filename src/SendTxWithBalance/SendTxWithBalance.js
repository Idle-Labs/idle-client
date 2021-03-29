import React, { Component } from 'react';
import IconBox from '../IconBox/IconBox';
import ExtLink from '../ExtLink/ExtLink';
import RoundButton from '../RoundButton/RoundButton';
import FunctionsUtil from '../utilities/FunctionsUtil';
import TxProgressBar from '../TxProgressBar/TxProgressBar';
import DashboardCard from '../DashboardCard/DashboardCard';
import { Flex, Box, Text, Icon, Link, Input } from "rimble-ui";
import FastBalanceSelector from '../FastBalanceSelector/FastBalanceSelector';

class SendTxWithBalance extends Component {

  state = {
    processing:{
      txHash:null,
      loading:false
    },
    inputValue:null,
    txSucceeded:false,
    buttonDisabled:true,
    contractApproved:false,
    fastBalanceSelector:null,
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
    await this.loadData();
  }

  async componentDidUpdate(prevProps,prevState){
    this.loadUtils();

    const actionChanged = prevProps.action !== this.props.action;
    const accountChanged = prevProps.account !== this.props.account;
    const tokenBalanceChanged = prevProps.tokenBalance !== this.props.tokenBalance;
    const contractChanged = JSON.stringify(prevProps.contractInfo) !== JSON.stringify(this.props.contractInfo);
    const tokenConfigChanged = JSON.stringify(prevProps.tokenConfig) !== JSON.stringify(this.props.tokenConfig);
    if (actionChanged || accountChanged || tokenBalanceChanged || contractChanged || tokenConfigChanged){
      await this.loadData();
    }

    const contractApprovedChanged = prevState.contractApproved !== this.state.contractApproved;
    if (contractApprovedChanged){
      if (typeof this.props.contractApproved === 'function'){
        this.props.contractApproved(this.state.contractApproved);
      }
    }

    const fastBalanceSelectorChanged = this.state.fastBalanceSelector !== prevState.fastBalanceSelector;
    if (fastBalanceSelectorChanged || actionChanged){
      this.setInputValue();
    }

    const inputValueChanged = prevState.inputValue !== this.state.inputValue;
    if (inputValueChanged){
      if (typeof this.props.changeInputCallback === 'function'){
        this.props.changeInputCallback(this.state.inputValue);
      }
      this.checkButtonDisabled();
    }
  }

  changeInputValue = (e) => {
    const fastBalanceSelector = null;
    const inputValue = e.target.value.length && !isNaN(e.target.value) ? this.functionsUtil.BNify(e.target.value) : this.functionsUtil.BNify(0);
    this.setState((prevState) => ({
      inputValue,
      fastBalanceSelector
    }));
  }

  setInputValue = () => {
    if (this.state.fastBalanceSelector === null){
      return false;
    }
    const selectedPercentage = this.functionsUtil.BNify(this.state.fastBalanceSelector).div(100);
    const inputValue = this.props.tokenBalance ? this.functionsUtil.BNify(this.props.tokenBalance).times(selectedPercentage) : null;
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
    amount = this.functionsUtil.BNify(amount);
    const buttonDisabled = amount.isNaN() || amount.lte(0) || amount.gt(this.props.tokenBalance);
    this.setState({
      buttonDisabled
    });
  }

  approve = async () => {
    // Check if the migration contract is approved
    const contractApproved = await this.checkContractApproved();

    if (!contractApproved){

      const callbackApprove = (tx,error) => {
        // Send Google Analytics event
        const eventData = {
          eventAction: 'approve',
          eventCategory: 'CurveDeposit',
          eventLabel: tx ? tx.status : null
        };

        const txSucceeded = tx && tx.status === 'success';

        if (error){
          eventData.eventLabel = this.functionsUtil.getTransactionError(error);
        }

        // Send Google Analytics event
        if (error || eventData.status !== 'error'){
          this.functionsUtil.sendGoogleAnalyticsEvent(eventData);
        }

        this.setState((prevState) => ({
          contractApproved: txSucceeded, // True
          processing: {
            ...prevState.processing,
            txHash:null,
            loading:false
          }
        }));

        if (typeof this.props.callbackApprove === 'function' && txSucceeded){
          this.props.callbackApprove(tx);
        }
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

      this.functionsUtil.enableERC20(this.props.tokenConfig.token,this.props.contractInfo.address,callbackApprove,callbackReceiptApprove);

      this.setState((prevState) => ({
        processing: {
          ...prevState.processing,
          txHash:null,
          loading:true
        },
        contractApproved:false
      }));
    } else {
      this.setState({
        contractApproved:true
      });
    }
  }

  executeTx = async () => {

    const inputValue = this.state.inputValue ? this.functionsUtil.BNify(this.state.inputValue) : null;
    if (!inputValue){
      return false;
    }

    const _amount = this.functionsUtil.normalizeTokenAmount(inputValue,this.props.tokenConfig.decimals);
    const params = await this.props.getTransactionParams(_amount);

    const callback = (tx,error) => {
      const txSucceeded = tx.status === 'success';

      // Send Google Analytics event
      const eventData = {
        eventLabel: tx.status,
        eventCategory: `CurveDeposit`,
        eventValue: inputValue.toFixed(),
        eventAction: this.props.tokenConfig.token,
      };

      if (error){
        eventData.eventLabel = this.functionsUtil.getTransactionError(error);
      }

      // Send Google Analytics event
      if (error || eventData.status !== 'error'){
        this.functionsUtil.sendGoogleAnalyticsEvent(eventData);
      }

      this.setState({
        txSucceeded,
        processing: {
          txHash:null,
          loading:false
        }
      });

      if (txSucceeded){
        // Reset input
        this.changeInputValue({
          target:{
            value:0
          }
        });
        // Call upper component callback
        if (typeof this.props.callback === 'function'){
          this.props.callback(tx,_amount,params);
        }
      }
    };

    const callbackReceipt = (tx) => {
      const txHash = tx.transactionHash;
      this.setState((prevState) => ({
        processing: {
          ...prevState.processing,
          txHash
        }
      }));
    };

    if (params){
      const {
        methodName,
        methodParams
      } = params;

      const value = params.value || null;

      const contractName = this.props.contractInfo.name;
      this.props.contractMethodSendWrapper(contractName, methodName, methodParams, value, callback, callbackReceipt);

      this.setState((prevState) => ({
        processing: {
          ...prevState.processing,
          loading:true
        }
      }));
    }
  }

  cancelTransaction = async () => {
    this.setState({
      processing: {
        txHash:null,
        loading:false
      }
    });
  }

  async checkContractApproved(){

    if (this.props.approveEnabled !== undefined && !this.props.approveEnabled){
      return true;
    }

    const contractInfo = await this.props.initContract(this.props.contractInfo.name,this.props.contractInfo.address,this.props.contractInfo.abi);
    if (contractInfo){
      const contractApproved = await this.functionsUtil.checkTokenApproved(this.props.tokenConfig.token,this.props.contractInfo.address,this.props.account);
      return contractApproved;
    }
    return null;
  }

  async loadData(){
    const inputValue = null;
    const contractApproved = await this.checkContractApproved();
    this.setState({
      inputValue,
      contractApproved
    });
  }

  approveCallback = () => {
    this.loadData();
  }

  render() {

    return (
      <Flex
        width={1}
        alignItems={'stretch'}
        flexDirection={'column'}
        justifyContent={'center'}
      >
        {
          this.props.tokenConfig && this.props.tokenBalance && this.functionsUtil.BNify(this.props.tokenBalance).gt(0) ? (
            <Box
              width={1}
            >
              {
                this.props.infoBox && (
                  <IconBox
                    cardProps={{
                      mb:3
                    }}
                    {...this.props.infoBox}
                  />
                )
              }
              {
                this.props.steps && this.props.steps.length>0 && (
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
                      {
                        this.props.steps.map( (step,stepIndex) => (
                          <Flex
                            width={1}
                            alignItems={'center'}
                            flexDirection={'row'}
                            key={`step_${stepIndex}`}
                          >
                            <Icon
                              size={'1.5em'}
                              name={ step.completed ? 'CheckBox' : step.icon}
                              color={ step.completed ? this.props.theme.colors.transactions.status.completed : 'cellText'}
                            />
                            {
                              step.link ? (
                                <ExtLink
                                  ml={2}
                                  fontSize={2}
                                  color={'blue'}
                                  fontWeight={1}
                                  href={step.link}
                                  textAlign={'left'}
                                  hoverColor={'blue'}
                                >
                                  {step.description}
                                </ExtLink>
                              ) : (
                                <Text
                                  ml={2}
                                  fontSize={2}
                                  fontWeight={1}
                                  color={'cellText'}
                                  textAlign={'left'}
                                >
                                  {step.description}
                                </Text>
                              )
                            }
                          </Flex>
                        ) )
                      }
                    </Flex>
                  </DashboardCard>
                )
              }
              {
                !this.state.contractApproved ?
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
                          {this.props.approveDescription}
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
                      mt={2}
                      mb={3}
                      width={1}
                      flexDirection={'column'}
                    >
                      <Flex
                        mb={1}
                        alignItems={'center'}
                        flexDirection={'row'}
                        justifyContent={this.props.balanceSelectorInfo ? 'space-between' : 'flex-end'}
                      >
                        {
                          this.props.balanceSelectorInfo && (
                            <Flex
                              width={1}
                              maxWidth={'50%'}
                              alignItems={'center'}
                              flexDirection={'row'}
                            >
                              <Text
                                fontSize={1}
                                fontWeight={3}
                                textAlign={'left'}
                                style={{
                                  maxWidth:'100%',
                                  overflow:'hidden',
                                  whiteSpace:'nowrap',
                                  textOverflow:'ellipsis'
                                }}
                                color={this.props.balanceSelectorInfo.color ? this.props.balanceSelectorInfo.color : 'copyColor'}
                              >
                                {this.props.balanceSelectorInfo.text}
                              </Text>
                            </Flex>
                          )
                        }
                        {
                          this.props.tokenBalance && (
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
                                Balance: {this.props.tokenBalance.toFixed(this.props.isMobile ? 2 : 4)} {this.props.tokenConfig.token}
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
                        borderColor={'cardBorder'}
                        backgroundColor={'cardBg'}
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
                            style:{
                              textTransform:'capitalize'
                            },
                            disabled:this.state.buttonDisabled
                          }}
                          handleClick={this.executeTx.bind(this)}
                        >
                          {this.props.action}
                        </RoundButton>
                      </Flex>
                    </Flex>
                  </Box>
                )
              }
            </Box>
          ) : this.props.children
        }
      </Flex>
    );
  }
}

export default SendTxWithBalance;