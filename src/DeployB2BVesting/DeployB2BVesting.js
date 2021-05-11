import ExtLink from '../ExtLink/ExtLink';
import React, { Component } from 'react';
import RoundButton from '../RoundButton/RoundButton';
import FunctionsUtil from '../utilities/FunctionsUtil';
import DashboardCard from '../DashboardCard/DashboardCard';
import TxProgressBar from '../TxProgressBar/TxProgressBar';
import CardIconButton from '../CardIconButton/CardIconButton';
import SendTxWithBalance from '../SendTxWithBalance/SendTxWithBalance';
import ExecuteTransaction from '../ExecuteTransaction/ExecuteTransaction';
import { Flex, Text, Heading, Input, Form, Field, Icon, Link, Loader, Button } from "rimble-ui";

class DeployB2BVesting extends Component {

  state = {
    actions:[],
    processing: {
      txHash:null,
      loading:false,
      actionIndex:[]
    },
    action:'deploy',
    validated:false,
    viewAction:null,
    editAction:null,
    newAction:false,
    maxContracts:10,
    tokenConfig:null,
    tokenBalance:null,
    contractInfo:null,
    actionValid:false,
    actionInputs:null,
    claimedTokens:null,
    deployedContracts:[],
    contractDeployed:false,
    inputs:[
      {
        name:'owner',
        type:'address'
      },
      {
        name:'recipient',
        type:'address'
      },
      {
        name:'vestingPeriod',
        type:'uint256'
      }
    ]
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

  setAction(action){
    this.setState({
      action,
      editAction:null,
      viewAction:null,
      claimedTokens:null,
      contractDeployed:null
    });
  }

  async cancelTransaction(){
    this.setState({
      processing: {
        txHash:null,
        loading:false,
        actionIndex:[]
      }
    });
  }

  async componentWillMount(){
    this.loadUtils();
    this.loadContracts();
  }

  async componentDidUpdate(prevProps,prevState){
    this.loadUtils();
    this.validateForm();
    this.checkInputs();

    const contractDeployed = prevState.contractDeployed !== this.state.contractDeployed && this.state.contractDeployed;
    if (contractDeployed){
      this.loadContracts();
    }
  }

  async loadContracts(){
    const tokenConfig = this.functionsUtil.getGlobalConfig(['govTokens','IDLE']);
    const vesterImplementation = this.props.toolProps.contracts.vesterImplementation;
    const fromBlock = this.functionsUtil.getGlobalConfig(['network','firstBlockNumber']);
    const proxyCreated = await this.functionsUtil.getContractPastEvents('ProxyFactory', 'ProxyCreated', {fromBlock, toBlock: 'latest'});
    const deployedContractsAddresses = proxyCreated.filter( p => p.returnValues.implementation.toLowerCase() === vesterImplementation.address.toLowerCase() ).map( p => p.returnValues.proxy );
    // console.log('proxyCreated',proxyCreated,'deployedContractsAddresses',deployedContractsAddresses);

    const deployedContracts = [];
    await this.functionsUtil.asyncForEach(deployedContractsAddresses, async (contractAddress) => {
      const contractName = `b2bVesting_${contractAddress}`;
      const vesterContract = await this.props.initContract(contractName,contractAddress,vesterImplementation.abi);
      const [
        initialized,
        owner,
        recipient,
        vestingPeriod,
        availableBalance,
        depositAmounts,
      ] = await Promise.all([
          this.functionsUtil.genericContractCall(contractName,'initialized'),
          this.functionsUtil.genericContractCall(contractName,'owner'),
          this.functionsUtil.genericContractCall(contractName,'recipient'),
          this.functionsUtil.genericContractCall(contractName,'vestingPeriod'),
          this.functionsUtil.getTokenBalance(tokenConfig.token,contractAddress),
          this.functionsUtil.genericContractCall(contractName,'getDepositAmounts')
      ]);

      let totalDeposited = this.functionsUtil.BNify(0);
      if (depositAmounts) {
        totalDeposited = depositAmounts.reduce( (total,amount) => {
          total = total.plus(amount);
          return total;
        },this.functionsUtil.BNify(0));

        totalDeposited = this.functionsUtil.fixTokenDecimals(totalDeposited,tokenConfig.decimals);
      }

      // console.log(contractName,initialized,owner,recipient,vestingPeriod,depositAmounts,parseFloat(totalDeposited));

      deployedContracts.push({
        owner,
        recipient,
        contractName,
        vestingPeriod,
        totalDeposited,
        contractAddress,
        availableBalance
      });
    });
    const tokenBalance = await this.functionsUtil.getTokenBalance('IDLE',this.props.account);

    // console.log(deployedContracts);

    this.setState({
      tokenConfig,
      tokenBalance,
      deployedContracts
    });
  }

  validateForm(){
    const validated = Object.values(this.state.actions).length>0;
    if (validated !== this.state.validated){
      this.setState({
        validated
      });
    }
  }

  getTransactionParams(amount){
    const params = {
      value:null,
      methodName:'deposit',
      methodParams:[amount]
    };
    return params;
  }

  claimCallback(tx){
    // console.log('claimCallback',tx);
    if (tx.status === 'success'){
      this.loadContracts();

      const claimedTokensLog = tx.txReceipt && tx.txReceipt.logs ? tx.txReceipt.logs.find( log => log.address.toLowerCase() === this.state.tokenConfig.address.toLowerCase() ) : null;
      if (claimedTokensLog){
        const claimedTokens = this.functionsUtil.fixTokenDecimals(parseInt(claimedTokensLog.data,16),this.state.tokenConfig.decimals);
        this.setState({
          claimedTokens
        });
      }
    }
  }

  depositCallback(tx,amount,params){
    // console.log('depositCallback',tx,amount,params);
    if (tx.status === 'success'){
      this.loadContracts();
    }
  }

  validateField(value,type){
    if (value===null){
      return false;
    }
    let valid = true;
    if (type === 'json'){
      valid = this.functionsUtil.isValidJSON(value);
    } else {
      const fieldPattern = this.getPatternByFieldType(type);
      if (fieldPattern){
        valid = value.toString().match(fieldPattern) !== null;
      }
    }
    return valid;
  }
  getPatternByFieldType(type,returnString=false){
    let fieldPattern = null;
    switch (type){
      case 'address':
        fieldPattern = '^0x[a-fA-F0-9]{40}$';
      break;
      case 'address[]':
        fieldPattern = '^((0x[a-fA-F0-9]{40})[,]?)+$';
      break;
      case 'string':
        fieldPattern = '[\\w]+';
      break;
      case 'bool':
        fieldPattern = '(0|1)';
      break;
      case 'uint256':
      case 'uint8':
        fieldPattern = '[\\d]+';
      break;
      default:
        fieldPattern = null;
      break;
    }

    if (!returnString && fieldPattern){
      fieldPattern = new RegExp(fieldPattern);
    }

    return fieldPattern;
  }

  checkInputs(){

    if (!this.state.actionInputs){
      return false;
    }

    const inputs = this.state.inputs;
    let actionValid = Object.values(this.state.actionInputs).length === inputs.length;

    if (actionValid){
      Object.values(this.state.actionInputs).forEach( (inputValue,inputIndex) => {
        const inputInfo = inputs[inputIndex];
        const fieldPattern = this.getPatternByFieldType(inputInfo.type);
        const inputValid = fieldPattern ? inputValue.match(fieldPattern) !== null : true;
        actionValid = actionValid && inputValid;
        // console.log('checkInputs',inputInfo.name,inputInfo.type,inputValue,inputValid,actionValid);
      });
    }

    if (actionValid !== this.state.actionValid){
      this.setState({
        actionValid
      });
    }
  }

  valueChange(e,inputIndex){
    let actionValue = e.target.value;
    this.setState({
      actionValue
    });
  }

  inputChange(e,inputIndex){
    let inputValue = e.target.value;

    this.setState((prevState) => ({
      actionInputs:{
        ...prevState.actionInputs,
        [inputIndex]:inputValue
      }
    }));
  }

  deleteAction(){
    if (this.state.editAction !== null){
      let actions = this.state.actions;
      if (actions[this.state.editAction]){
        delete actions[this.state.editAction];
        actions = Object.values(actions);
        const editAction = null;
        const actionInputs = null;

        this.setState({
          actions,
          editAction,
          actionInputs
        });
      }
    }
  }

  addAction(){

    // Check inputs number
    const inputs = Object
                    .values(this.state.actionInputs).filter( v => v.length>0 )
                    .map( (inputValue,inputIndex) => {
                      const inputInfo = this.state.inputs[inputIndex];
                      switch (inputInfo.type){
                        case 'address[]':
                          inputValue = inputValue.split(',');
                        break;
                        case 'uint256[]':
                          inputValue = inputValue.split(',').map( n => this.functionsUtil.toBN(n) );
                        break;
                        case 'uint256':
                          inputValue = this.functionsUtil.toBN(inputValue);
                        break;
                        default:
                          if (inputInfo.type.substr(-2) === '[]'){
                            inputValue = inputValue.split(',');
                          }
                        break;
                      }

                      return inputValue;
                    });

    if (inputs.length<this.state.inputs.length){
      return false;
    }

    const action = {
      txError:null,
      contractAddress:null,
      inputs:this.state.actionInputs,
    };

    const newAction = false;
    const actions = Object.values(this.state.actions);

    if (this.state.editAction === null){
      actions.push(action);
    } else {
      actions[this.state.editAction] = action;
    }

    const editAction = null;
    const actionInputs = null;

    this.setState({
      actions,
      newAction,
      editAction,
      actionInputs
    });
  }

  setEditAction(editAction){

    if (!this.state.actions[editAction]){
      return false;
    }

    if (editAction === this.state.editAction){
      return false;
    }

    const action = this.state.actions[editAction];

    const newAction = false;
    const actionInputs = action.inputs;

    this.setState({
      newAction,
      editAction,
      actionInputs
    });
  }

  setViewAction(viewAction){

    if (viewAction !== this.state.viewAction){
      const vesterImplementation = this.props.toolProps.contracts.vesterImplementation;
      const deployedContract = this.state.deployedContracts[viewAction];
      const contractInfo = {
        abi:vesterImplementation.abi,
        name:deployedContract.contractName,
        address:deployedContract.contractAddress
      };
      this.setState({
        viewAction,
        contractInfo,
        claimedTokens:null
      });
    }
  }

  setNewAction(newAction){
    if (newAction === this.state.newAction){
      return false;
    }

    const editAction = null;

    this.setState({
      newAction,
      editAction,
    });
  }

  async handleSubmit(e){
    e.preventDefault();

    const vesterImplementation = this.props.toolProps.contracts.vesterImplementation;
    const idleAddress = this.functionsUtil.getGlobalConfig(['govTokens','IDLE','address']);

    const callback = (tx,error,actionIndex) => {
      const txSucceeded = tx.status === 'success';
      const actions = Object.values(this.state.actions);
      const isLastAction = parseInt(actionIndex)===parseInt(this.state.actions.length)-1;
      const contractDeployed = txSucceeded && isLastAction;
      // console.log('callback_1 -',actionIndex,txSucceeded,contractDeployed,tx);
      if (txSucceeded){
        const clonedVesterAddress = tx.txReceipt.events && tx.txReceipt.events.ProxyCreated ? tx.txReceipt.events.ProxyCreated.returnValues[1] : `0x${tx.txReceipt.logs[0].data.substr(-40)}`;
        actions[actionIndex].contractAddress = clonedVesterAddress;
        // console.log('callback_2 -',actionIndex,actions[actionIndex].contractAddress);
      } else {
        actions[actionIndex].txError = true;
      }

      // console.log('callback_3 -',actionIndex,actions);

      this.setState({
        actions,
        contractDeployed
      },()=>{
        if (isLastAction){
          this.cancelTransaction();
        }
      });
    };

    const callbackReceipt = (tx,actionIndex) => {
      const txHash = tx.transactionHash;
      // console.log('callbackReceipt',actionIndex,tx);
      const processing = Object.assign({},this.state.processing);
      processing.txHash = txHash;
      processing.actionIndex.push(actionIndex);
      this.setState({
        processing
      });
    };

    this.state.actions.forEach((action,actionIndex) => {
      const ownerAddress = action.inputs[0];
      const recipientAddress = action.inputs[1];
      const vestingPeriod = action.inputs[2];
      const initSig = "initialize(address,address,address,uint256)";
      const initData = this.props.web3.eth.abi.encodeParameters(
        ['address','address','address','uint256'],
        [ownerAddress,idleAddress,recipientAddress,vestingPeriod]
      );
      const methodParams = [vesterImplementation.address,initSig,initData];
      this.functionsUtil.contractMethodSendWrapper('ProxyFactory', 'createAndCall', methodParams, (tx,error) => callback(tx,error,actionIndex), (tx) => callbackReceipt(tx,actionIndex) );
    });

    this.setState((prevState) => ({
      processing: {
        ...prevState.processing,
        loading:true
      }
    }));

    return false;
  }

  render() {

    return (
      <Flex
        width={1}
        alignItems={'center'}
        flexDirection={'column'}
        justifyContent={'center'}
      >
        <Flex
          width={[1,0.42]}
          alignItems={'stretch'}
          flexDirection={'column'}
          justifyContent={'center'}
        >
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
                  width:0.32
                }}
                text={'Deploy'}
                icon={'CloudUpload'}
                iconColor={'deposit'}
                iconBgColor={'#ced6ff'}
                isActive={ this.state.action === 'deploy' }
                handleClick={ e => this.setAction('deploy') }
              />
              <CardIconButton
                {...this.props}
                cardProps={{
                  px:3,
                  py:3,
                  width:0.32
                }}
                text={'Deposit'}
                iconColor={'deposit'}
                icon={'ArrowDownward'}
                iconBgColor={'#ced6ff'}
                isActive={ this.state.action === 'deposit' }
                handleClick={ e => this.setAction('deposit') }
              />
              <CardIconButton
                {...this.props}
                cardProps={{
                  px:3,
                  py:3,
                  width:0.32
                }}
                text={'Claim'}
                iconColor={'redeem'}
                icon={'ArrowUpward'}
                iconBgColor={'#ceeff6'}
                isActive={ this.state.action === 'claim' }
                handleClick={ e => this.setAction('claim') }
              />
            </Flex>
          </Flex>
          <Flex
            pb={2}
            width={1}
            my={[2,3]}
            borderColor={'divider'}
            borderBottom={'1px solid transparent'}
          >
            <Heading.h4
              fontSize={[2,3]}
              fontWeight={[2,3]}
              style={{
                textTransform:'capitalize'
              }}
            >
              {this.state.action}
            </Heading.h4>
          </Flex>
          <Flex
            flexDirection={'column'}
          >
            {
              this.state.action === 'deploy' ? (
                <Form
                  width={1}
                  validated={this.state.validated}
                  onSubmit={this.handleSubmit.bind(this)}
                >
                  {
                    Object.values(this.state.actions).map( (action,actionIndex) => {
                      return (
                        <DashboardCard
                          cardProps={{
                            py:2,
                            px:3,
                            mb:3,
                            width:1
                          }}
                          titleParentProps={{
                            ml:0,
                            my:1,
                            justifyContent:'center'
                          }}
                          titleProps={{
                            fontSize:2,
                            fontWeight:3
                          }}
                          isInteractive={true}
                          key={`action_${actionIndex}`}
                          title={ this.state.editAction === actionIndex ? 'Edit Contract' : null }
                          handleClick={ e => /*action.contractAddress ? this.functionsUtil.openWindow(this.functionsUtil.getEtherscanAddressUrl(action.contractAddress)) : */this.setEditAction(actionIndex) }
                        >
                          {
                            this.state.editAction === actionIndex ? (
                              <Flex
                                width={1}
                                alignItems={'center'}
                                flexDirection={'column'}
                                justifyContent={'center'}
                              >
                                {
                                  this.state.inputs.map( (input,inputIndex) => {
                                    const fieldType = ['uint256','bool'].includes(input.type) ? 'number' : 'text';
                                    const fieldPattern = this.getPatternByFieldType(input.type,true);
                                    return (
                                      <Field
                                        style={{
                                          width:'100%',
                                          display:'flex',
                                          alignItems:'stretch',
                                          flexDirection:'column'
                                        }}
                                        key={`input_${inputIndex}`}
                                        label={`${input.name} (${input.type})`}
                                      >
                                        <Input
                                          required
                                          width={1}
                                          type={fieldType}
                                          pattern={fieldPattern}
                                          borderColor={'cardBorder'}
                                          backgroundColor={'cardBg'}
                                          placeholder={`${input.name} (${input.type})`}
                                          onChange={ e => this.inputChange(e,inputIndex) }
                                          value={this.state.actionInputs && this.state.actionInputs[inputIndex] ? this.state.actionInputs[inputIndex] : ''}
                                        />
                                      </Field>
                                    )
                                  })
                                }
                                <Flex
                                  mb={2}
                                  width={1}
                                  alignItems={'center'}
                                  flexDirection={'column'}
                                  justifyContent={'center'}
                                >
                                  {
                                    action.contractAddress ? (
                                      <ExtLink
                                        fontSize={1}
                                        color={this.props.theme.colors.transactions.status.completed}
                                        hoverColor={this.props.theme.colors.transactions.status.completed}
                                        href={this.functionsUtil.getEtherscanAddressUrl(action.contractAddress)}
                                      >
                                        Deployed at {action.contractAddress}
                                      </ExtLink>
                                    ) : !this.state.processing.loading && (
                                      <Flex
                                        width={1}
                                        alignItems={'center'}
                                        flexDirection={'column'}
                                        justifyContent={'center'}
                                      >
                                        <RoundButton
                                          buttonProps={{
                                            px:[0,4],
                                            type:'button',
                                            width:[1,'auto'],
                                            disabled:!this.state.actionValid
                                          }}
                                          handleClick={this.addAction.bind(this)}
                                        >
                                          Save Contract
                                        </RoundButton>
                                        <Link
                                          mt={2}
                                          color={'red'}
                                          hoverColor={'red'}
                                          onClick={this.deleteAction.bind(this)}
                                        >
                                          Delete Contract
                                        </Link>
                                      </Flex>
                                    )
                                  }
                                </Flex>
                              </Flex>
                            ) : (
                              <Flex
                                width={1}
                                alignItems={'center'}
                                flexDirection={'row'}
                                justifyContent={'space-between'}
                              >
                                <Text>
                                  {this.functionsUtil.shortenHash(action.inputs[0])} - {this.functionsUtil.shortenHash(action.inputs[1])} - {action.inputs[2]} { action.contractAddress ? '- DEPLOYED' : '' }
                                </Text>
                                { 
                                  action.contractAddress ? (
                                    <Flex
                                      p={'3px'}
                                      alignItems={'center'}
                                      justifyContent={'center'}
                                    >
                                      <Icon
                                        name={'Done'}
                                        align={'center'}
                                        size={this.props.isMobile ? '1.2em' : '1.8em'}
                                        color={this.props.theme.colors.transactions.status.completed}
                                      />
                                    </Flex>
                                  ) : this.state.processing.loading && this.state.processing.actionIndex && this.state.processing.actionIndex.includes(parseInt(actionIndex)) ? (
                                    <Loader size="28px" />
                                  ) : action.txError ? (
                                    <Flex
                                      p={'3px'}
                                      alignItems={'center'}
                                      justifyContent={'center'}
                                    >
                                      <Icon
                                        color={'red'}
                                        name={'Error'}
                                        align={'center'}
                                        size={ this.props.isMobile ? '1.2em' : '1.8em' }
                                      />
                                    </Flex>
                                  ) : (
                                    <Flex
                                      p={['4px','7px']}
                                      borderRadius={'50%'}
                                      alignItems={'center'}
                                      justifyContent={'center'}
                                      backgroundColor={ this.props.theme.colors.transactions.actionBg.redeem }
                                    >
                                      <Icon
                                        name={'Edit'}
                                        align={'center'}
                                        color={'redeem'}
                                        size={ this.props.isMobile ? '1.2em' : '1.4em' }
                                      />
                                    </Flex>
                                  )
                                }
                              </Flex>
                            )
                          }
                        </DashboardCard>
                      );
                    })
                  }
                  {
                    (!this.state.contractDeployed && !this.state.processing.loading && (!this.state.actions || Object.values(this.state.actions).length<this.state.maxContracts)) && (
                      <DashboardCard
                        cardProps={{
                          py:2,
                          px:3,
                          mb:3,
                          width:1
                        }}
                        titleParentProps={{
                          ml:0,
                          my:1,
                          justifyContent:'center'
                        }}
                        titleProps={{
                          fontSize:2,
                          fontWeight:3
                        }}
                        isInteractive={true}
                        handleClick={ e => this.setNewAction(true) }
                        title={ this.state.newAction ? 'Add Contract' : null }
                      >
                        {
                          this.state.newAction ? (
                            <Flex
                              width={1}
                              alignItems={'center'}
                              flexDirection={'column'}
                              justifyContent={'center'}
                            >
                              {
                                this.state.inputs.map( (input,inputIndex) => {
                                  const fieldType = ['uint256','bool'].includes(input.type) ? 'number' : 'text';
                                  const fieldPattern = this.getPatternByFieldType(input.type,true);
                                  return (
                                    <Field
                                      style={{
                                        width:'100%',
                                        display:'flex',
                                        alignItems:'stretch',
                                        flexDirection:'column'
                                      }}
                                      key={`input_${inputIndex}`}
                                      label={`${input.name} (${input.type})`}
                                    >
                                      <Input
                                        required
                                        width={1}
                                        type={fieldType}
                                        pattern={fieldPattern}
                                        borderColor={'cardBorder'}
                                        backgroundColor={'cardBg'}
                                        placeholder={`${input.name} (${input.type})`}
                                        onChange={ e => this.inputChange(e,inputIndex) }
                                        value={this.state.actionInputs && this.state.actionInputs[inputIndex] ? this.state.actionInputs[inputIndex] : ''}
                                      />
                                    </Field>
                                  )
                                })
                              }
                              <Flex
                                width={1}
                                alignItems={'center'}
                                justifyContent={'center'}
                              >
                                <RoundButton
                                  buttonProps={{
                                    px:[0,4],
                                    type:'button',
                                    width:[1,'auto'],
                                    disabled:!this.state.actionValid
                                  }}
                                  handleClick={this.addAction.bind(this)}
                                >
                                  Add Contract
                                </RoundButton>
                              </Flex>
                            </Flex>
                          ) : (
                            <Flex
                              width={1}
                              alignItems={'center'}
                              flexDirection={'row'}
                              justifyContent={'space-between'}
                            >
                              <Text>
                                Add Contract
                              </Text>
                              <Flex
                                p={['4px','7px']}
                                borderRadius={'50%'}
                                alignItems={'center'}
                                justifyContent={'center'}
                                backgroundColor={ this.props.theme.colors.transactions.actionBg.redeem }
                              >
                                <Icon
                                  name={'Add'}
                                  align={'center'}
                                  color={'redeem'}
                                  size={ this.props.isMobile ? '1.2em' : '1.4em' }
                                />
                              </Flex>
                            </Flex>
                          )
                        }
                      </DashboardCard>
                    )
                  }
                  <Flex
                    mb={3}
                    width={1}
                    alignItems={'center'}
                    justifyContent={'center'}
                  >
                    {
                      this.state.contractDeployed ? (
                        <DashboardCard
                          cardProps={{
                            py:3,
                            px:4,
                            width:[1,'100%']
                          }}
                        >
                          <Flex
                            alignItems={'center'}
                            flexDirection={'column'}
                            justifyContent={'center'}
                          >
                            <Icon
                              name={'DoneAll'}
                              align={'center'}
                              size={ this.props.isMobile ? '1.4em' : '2.2em' }
                              color={this.props.theme.colors.transactions.status.completed}
                            />
                            <Text
                              mt={1}
                              fontWeight={3}
                              fontSize={[2,3]}
                              color={'dark-gray'}
                              textAlign={'center'}
                            >
                              B2B Vesting contracts have been deployed
                            </Text>
                          </Flex>
                        </DashboardCard>
                      ) : this.state.processing && this.state.processing.loading ? (
                        <TxProgressBar
                          web3={this.props.web3}
                          hash={this.state.processing.txHash}
                          waitText={`Deployment estimated in`}
                          endMessage={`Finalizing deployment request...`}
                          cancelTransaction={this.cancelTransaction.bind(this)}
                        />
                      ) : (
                        <RoundButton
                          buttonProps={{
                            type:'submit',
                            width:[1,'15em'],
                            disabled:!this.state.validated
                          }}
                        >
                          Deploy Contracts
                        </RoundButton>
                      )
                    }
                  </Flex>
                </Form>
              ) : this.state.action === 'deposit' ?
                this.state.deployedContracts.filter( c => c.owner.toLowerCase() === this.props.account.toLowerCase() ).map( (contractInfo,actionIndex) => {
                  return (
                    <DashboardCard
                      cardProps={{
                        py:2,
                        px:3,
                        mb:3,
                        width:1
                      }}
                      titleParentProps={{
                        ml:0,
                        my:1,
                        justifyContent:'center'
                      }}
                      titleProps={{
                        fontSize:2,
                        fontWeight:3
                      }}
                      isInteractive={true}
                      key={`action_${actionIndex}`}
                      handleClick={ e => this.setViewAction(actionIndex) }
                      title={ this.state.viewAction === actionIndex ? 'View Contract' : null }
                    >
                      {
                        this.state.viewAction === actionIndex ? (
                          <Flex
                            width={1}
                            alignItems={'center'}
                            flexDirection={'column'}
                            justifyContent={'center'}
                          >
                            <Field
                              style={{
                                width:'100%',
                                display:'flex',
                                alignItems:'stretch',
                                flexDirection:'column'
                              }}
                              label={`Contract Address`}
                            >
                              <Input
                                required
                                readOnly
                                width={1}
                                type={'address'}
                                borderColor={'cardBorder'}
                                backgroundColor={'cardBg'}
                                value={contractInfo.contractAddress}
                              />
                            </Field>
                            {
                              this.state.inputs.map( (input,inputIndex) => {
                                const fieldType = ['uint256','bool'].includes(input.type) ? 'number' : 'text';
                                const fieldPattern = this.getPatternByFieldType(input.type,true);
                                return (
                                  <Field
                                    style={{
                                      width:'100%',
                                      display:'flex',
                                      alignItems:'stretch',
                                      flexDirection:'column'
                                    }}
                                    key={`input_${inputIndex}`}
                                    label={`${input.name} (${input.type})`}
                                  >
                                    <Input
                                      required
                                      readOnly
                                      width={1}
                                      type={fieldType}
                                      borderColor={'cardBorder'}
                                      backgroundColor={'cardBg'}
                                      value={contractInfo[input.name]}
                                    />
                                  </Field>
                                )
                              })
                            }
                            <Field
                              style={{
                                width:'100%',
                                display:'flex',
                                alignItems:'stretch',
                                flexDirection:'column'
                              }}
                              label={`Total Deposited`}
                            >
                              <Input
                                required
                                readOnly
                                width={1}
                                type={'address'}
                                borderColor={'cardBorder'}
                                backgroundColor={'cardBg'}
                                value={contractInfo.totalDeposited.toFixed(6)}
                              />
                            </Field>
                            <Field
                              style={{
                                width:'100%',
                                display:'flex',
                                alignItems:'stretch',
                                flexDirection:'column'
                              }}
                              label={`Available Balance`}
                            >
                              <Input
                                required
                                readOnly
                                width={1}
                                type={'address'}
                                borderColor={'cardBorder'}
                                backgroundColor={'cardBg'}
                                value={contractInfo.availableBalance.toFixed(6)}
                              />
                            </Field>
                            <Flex
                              mb={2}
                              width={1}
                              alignItems={'center'}
                              flexDirection={'column'}
                              justifyContent={'center'}
                              borderTop={'1px solid transparent'}
                            >
                              <Flex
                                width={1}
                                alignItems={'center'}
                                flexDirection={'column'}
                                justifyContent={'center'}
                              >
                                <SendTxWithBalance
                                  {...this.props}
                                  action={this.state.action}
                                  tokenConfig={this.state.tokenConfig}
                                  tokenBalance={this.state.tokenBalance}
                                  contractInfo={this.state.contractInfo}
                                  callback={this.depositCallback.bind(this)}
                                  getTransactionParams={this.getTransactionParams.bind(this)}
                                  approveDescription={'You need to approve the Smart-Contract first'}
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
                                        You don't have any $IDLE in your wallet.
                                      </Text>
                                    </Flex>
                                  </DashboardCard>
                                </SendTxWithBalance>
                              </Flex>
                            </Flex>
                          </Flex>
                        ) : (
                          <Flex
                            width={1}
                            alignItems={'center'}
                            flexDirection={'row'}
                            justifyContent={'space-between'}
                          >
                            <Text>
                              {this.functionsUtil.shortenHash(contractInfo.owner)} - {this.functionsUtil.shortenHash(contractInfo.recipient)} - {contractInfo.vestingPeriod} 
                            </Text>
                            <Flex
                              p={['4px','7px']}
                              borderRadius={'50%'}
                              alignItems={'center'}
                              justifyContent={'center'}
                              backgroundColor={ this.props.theme.colors.transactions.actionBg.redeem }
                            >
                              <Icon
                                name={'ZoomIn'}
                                align={'center'}
                                color={'redeem'}
                                size={ this.props.isMobile ? '1.2em' : '1.4em' }
                              />
                            </Flex>
                          </Flex>
                        )
                      }
                    </DashboardCard>
                  );
                })
              : this.state.action === 'claim' &&
                this.state.deployedContracts.filter( c => c.recipient.toLowerCase() === this.props.account.toLowerCase() ).map( (contractInfo,actionIndex) => {
                  return (
                    <DashboardCard
                      cardProps={{
                        py:2,
                        px:3,
                        mb:3,
                        width:1
                      }}
                      titleParentProps={{
                        ml:0,
                        my:1,
                        justifyContent:'center'
                      }}
                      titleProps={{
                        fontSize:2,
                        fontWeight:3
                      }}
                      isInteractive={true}
                      key={`action_${actionIndex}`}
                      handleClick={ e => this.setViewAction(actionIndex) }
                      title={ this.state.viewAction === actionIndex ? 'View Contract' : null }
                    >
                      {
                        this.state.viewAction === actionIndex ? (
                          <Flex
                            width={1}
                            alignItems={'center'}
                            flexDirection={'column'}
                            justifyContent={'center'}
                          >
                            <Field
                              style={{
                                width:'100%',
                                display:'flex',
                                alignItems:'stretch',
                                flexDirection:'column'
                              }}
                              label={`Contract Address`}
                            >
                              <Input
                                required
                                readOnly
                                width={1}
                                type={'address'}
                                borderColor={'cardBorder'}
                                backgroundColor={'cardBg'}
                                value={contractInfo.contractAddress}
                              />
                            </Field>
                            {
                              this.state.inputs.map( (input,inputIndex) => {
                                const fieldType = ['uint256','bool'].includes(input.type) ? 'number' : 'text';
                                const fieldPattern = this.getPatternByFieldType(input.type,true);
                                return (
                                  <Field
                                    style={{
                                      width:'100%',
                                      display:'flex',
                                      alignItems:'stretch',
                                      flexDirection:'column'
                                    }}
                                    key={`input_${inputIndex}`}
                                    label={`${input.name} (${input.type})`}
                                  >
                                    <Input
                                      required
                                      readOnly
                                      width={1}
                                      type={fieldType}
                                      borderColor={'cardBorder'}
                                      backgroundColor={'cardBg'}
                                      value={contractInfo[input.name]}
                                    />
                                  </Field>
                                )
                              })
                            }
                            <Field
                              style={{
                                width:'100%',
                                display:'flex',
                                alignItems:'stretch',
                                flexDirection:'column'
                              }}
                              label={`Total Deposited`}
                            >
                              <Input
                                required
                                readOnly
                                width={1}
                                type={'address'}
                                borderColor={'cardBorder'}
                                backgroundColor={'cardBg'}
                                value={contractInfo.totalDeposited.toFixed(6)}
                              />
                            </Field>
                            <Field
                              style={{
                                width:'100%',
                                display:'flex',
                                alignItems:'stretch',
                                flexDirection:'column'
                              }}
                              label={`Available Balance`}
                            >
                              <Input
                                required
                                readOnly
                                width={1}
                                type={'address'}
                                borderColor={'cardBorder'}
                                backgroundColor={'cardBg'}
                                value={contractInfo.availableBalance.toFixed(6)}
                              />
                            </Field>
                            <Flex
                              mb={2}
                              width={1}
                              alignItems={'center'}
                              flexDirection={'column'}
                              justifyContent={'center'}
                              borderTop={'1px solid transparent'}
                            >
                              <Flex
                                width={1}
                                alignItems={'center'}
                                flexDirection={'column'}
                                justifyContent={'center'}
                              >
                                {
                                  this.state.claimedTokens && (
                                    <Text
                                      mb={2}
                                      fontSize={2}
                                      fontWeight={3}
                                      color={this.props.theme.colors.transactions.status.completed}
                                    >
                                      You have successfully claimed {this.state.claimedTokens.toFixed(4)} {this.state.tokenConfig.token}
                                    </Text>
                                  )
                                }
                                {
                                  contractInfo.availableBalance && contractInfo.availableBalance.gt(0) ? (
                                    <ExecuteTransaction
                                      params={[]}
                                      {...this.props}
                                      Component={Button}
                                      componentProps={{
                                        size:'medium',
                                        value:'Claim',
                                        mainColor:'redeem',
                                      }}
                                      methodName={'claim'}
                                      action={this.state.action}
                                      callback={this.claimCallback.bind(this)}
                                      contractName={contractInfo.contractName}
                                    />
                                  ) : (
                                    <Text
                                      mb={2}
                                      fontSize={2}
                                      fontWeight={3}
                                      color={'cellText'}
                                    >
                                      Nothing to Claim yet.
                                    </Text>
                                  )
                                }
                              </Flex>
                            </Flex>
                          </Flex>
                        ) : (
                          <Flex
                            width={1}
                            alignItems={'center'}
                            flexDirection={'row'}
                            justifyContent={'space-between'}
                          >
                            <Text>
                              {this.functionsUtil.shortenHash(contractInfo.owner)} - {this.functionsUtil.shortenHash(contractInfo.recipient)} - {contractInfo.vestingPeriod} 
                            </Text>
                            <Flex
                              p={['4px','7px']}
                              borderRadius={'50%'}
                              alignItems={'center'}
                              justifyContent={'center'}
                              backgroundColor={ this.props.theme.colors.transactions.actionBg.redeem }
                            >
                              <Icon
                                name={'ZoomIn'}
                                align={'center'}
                                color={'redeem'}
                                size={ this.props.isMobile ? '1.2em' : '1.4em' }
                              />
                            </Flex>
                          </Flex>
                        )
                      }
                    </DashboardCard>
                  );
                })
            }
          </Flex>
        </Flex>
      </Flex>
    );
  }
}

export default DeployB2BVesting;
