import ExtLink from '../ExtLink/ExtLink';
import React, { Component } from 'react';
import FunctionsUtil from '../utilities/FunctionsUtil';
import RoundButton from '../RoundButton/RoundButton';
import DashboardCard from '../DashboardCard/DashboardCard';
import TxProgressBar from '../TxProgressBar/TxProgressBar';
import { Flex, Text, Heading, Input, Form, Field, Icon, Link, Loader } from "rimble-ui";

class DeployB2BVesting extends Component {

  state = {
    actions:[],
    processing: {
      txHash:null,
      loading:false,
      actionIndex:[]
    },
    validated:false,
    editAction:null,
    newAction:false,
    maxContracts:10,
    actionValid:false,
    actionInputs:null,
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
  }

  async componentDidUpdate(prevProps,prevState){
    this.loadUtils();
    this.validateForm();
    this.checkInputs();
  }

  validateForm(){
    const validated = Object.values(this.state.actions).length>0;
    if (validated !== this.state.validated){
      this.setState({
        validated
      });
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
        const clonedVesterAddress = tx.txReceipt.events && tx.txReceipt.events.ProxyCreated ? tx.txReceipt.events.ProxyCreated.returnValues[1] : tx.txReceipt.logs[0].data.substr(-40);
        actions[actionIndex].contractAddress = `0x${clonedVesterAddress}`;
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

      // console.log('createAndCall',actionIndex,initData);

      this.functionsUtil.contractMethodSendWrapper('proxyFactory', 'createAndCall', [vesterImplementation.address,initSig,initData], (tx,error) => callback(tx,error,actionIndex), (tx) => callbackReceipt(tx,actionIndex) );
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
            pb={2}
            width={1}
            mb={[2,3]}
            borderColor={'divider'}
            borderBottom={'1px solid transparent'}
          >
            <Heading.h4
              fontSize={[2,3]}
              fontWeight={[2,3]}
            >
              Contracts
            </Heading.h4>
          </Flex>
          <Flex
            flexDirection={'column'}
          >
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
                      handleClick={ e => action.contractAddress ? this.functionsUtil.openWindow(this.functionsUtil.getEtherscanAddressUrl(action.contractAddress)) : this.setEditAction(actionIndex) }
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
                              <RoundButton
                                buttonProps={{
                                  px:[0,4],
                                  width:[1,'auto'],
                                  type:'button',
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
                (!this.state.contractDeployed && (!this.state.actions || Object.values(this.state.actions).length<this.state.maxContracts)) && (
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
                          name={'Done'}
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
                          B2B Vesting contracts has been deployed
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
          </Flex>
        </Flex>
      </Flex>
    );
  }
}

export default DeployB2BVesting;
