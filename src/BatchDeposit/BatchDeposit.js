/*
// batchDeposits[user][batchId] = amount
mapping (address => mapping (uint256 => uint256)) public batchDeposits;
mapping (uint256 => uint256) batchTotals; // in idleToken
mapping (uint256 => uint256) batchRedeemedTotals; // in newIdleToken

uint256 public currBatch;
address public idleToken;
address public newIdleToken;
address public underlying;

function deposit() external
function withdraw(uint256 batchId) external
*/

import Migrate from '../Migrate/Migrate';
import React, { Component } from 'react';
import AssetField from '../AssetField/AssetField';
import FlexLoader from '../FlexLoader/FlexLoader';
import RoundButton from '../RoundButton/RoundButton';
import FunctionsUtil from '../utilities/FunctionsUtil';
import AssetSelector from '../AssetSelector/AssetSelector';
import DashboardCard from '../DashboardCard/DashboardCard';
import TxProgressBar from '../TxProgressBar/TxProgressBar';
import GenericSelector from '../GenericSelector/GenericSelector';
import TransactionField from '../TransactionField/TransactionField';
import { Flex, Box, Text, Icon, Link, Checkbox, Tooltip } from "rimble-ui";

class BatchDeposit extends Component {

  state = {
    canClaim:false,
    batchTotals:{},
    canDeposit:true,
    action:'deposit',
    batchDeposits:{},
    tokenConfig:null,
    processing:{
      execute:{
        txHash:null,
        loading:false
      },
      claim:{
        txHash:null,
        loading:false
      },
    },
    usePermit:false,
    batchRedeems:{},
    lastExecution:null,
    permitEnabled:true,
    hasDeposited:false,
    permitSigned:false,
    selectedToken:null,
    showPermitBox:false,
    currBatchIndex:null,
    batchCompleted:false,
    claimSucceeded:false,
    availableTokens:null,
    selectedStrategy:null,
    componentLoaded:false,
    executeSucceeded:false,
    migrationEnabled:false,
    migrationSucceeded:false,
    selectedTokenConfig:null,
    availableStrategies:null,
    batchDepositEnabled:false,
    migrationContractApproved:false,
    availableDestinationTokens:null,
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
    this.loadStrategies();
  }

  async componentDidUpdate(prevProps,prevState){
    this.loadUtils();

    const tokenFromChanged = prevProps.urlParams.param2 !== this.props.urlParams.param2;
    if (tokenFromChanged){
      this.setState({
        componentLoaded:false
      },async () => {
        await this.loadTokens();
      });
    }

    const selectedStrategyChanged = prevState.selectedStrategy !== this.state.selectedStrategy;
    if (selectedStrategyChanged){
      const selectedToken = Object.keys(this.state.availableTokens)[0];
      this.selectToken(selectedToken);
    }

    const selectedTokenChanged = prevState.selectedToken !== this.state.selectedToken;
    const executeSucceededChanged = prevState.executeSucceeded !== this.state.executeSucceeded;
    const contractApprovedChanged = prevState.migrationContractApproved !== this.state.migrationContractApproved;
    if (selectedTokenChanged || contractApprovedChanged || executeSucceededChanged){
      this.checkBatchs();
    }

  }

  async execute () {

    const loading = true;

    const callbackExecute = (tx,error) => {
      const txSucceeded = tx.status === 'success';

      // Send Google Analytics event
      const eventData = {
        eventAction: 'Execute',
        eventCategory: 'BatchDeposit',
      };

      if (error){
        eventData.eventLabel = this.functionsUtil.getTransactionError(error);
      }

      // Send Google Analytics event
      if (error || eventData.status !== 'error'){
        this.functionsUtil.sendGoogleAnalyticsEvent(eventData);
      }

      this.setState((prevState) => ({
        executeSucceeded:txSucceeded,
        processing: {
          ...prevState.processing,
          execute:{
            txHash:null,
            loading:false
          }
        }
      }));
    };

    const callbackReceiptExecute = (tx) => {
      const txHash = tx.transactionHash;
      this.setState((prevState) => ({
        processing: {
          ...prevState.processing,
          execute:{
            ...prevState.processing.execute,
            txHash
          }
        }
      }));
    };

    this.props.contractMethodSendWrapper(this.state.selectedTokenConfig.migrationContract.name, 'executeBatch', [true], null, callbackExecute, callbackReceiptExecute);

    this.setState((prevState) => ({
      processing: {
        ...prevState.processing,
        execute:{
          ...prevState.processing.execute,
          loading
        }
      }
    }));
  }

  async checkBatchs(migrationSucceeded=false){

    const migrationContractInfo = this.state.selectedTokenConfig.migrationContract;

    await Promise.all([
      this.props.initContract(migrationContractInfo.name,migrationContractInfo.address,migrationContractInfo.abi),
      this.props.initContract(this.state.tokenConfig.name,this.state.tokenConfig.address,this.state.tokenConfig.abi)
    ]);

    let [
      batchExecutions,
      currBatchIndex,
      migrationContractApproved
    ] = await Promise.all([
      this.functionsUtil.getBatchedDepositExecutions(migrationContractInfo.address),
      this.functionsUtil.genericContractCall(this.state.selectedTokenConfig.migrationContract.name,'currBatch'),
      this.functionsUtil.checkTokenApproved(this.state.tokenConfig.name,migrationContractInfo.address,this.props.account)
    ]);

    // If use Permit don't ask for Approve
    let usePermit = false;
    if (!migrationContractApproved && migrationContractInfo.functions && migrationContractInfo.functions.length === 1){
      const functionInfo = migrationContractInfo.functions[0];
      usePermit = typeof functionInfo.usePermit !== 'undefined' ? functionInfo.usePermit : false;
      const nonceMethod = this.functionsUtil.getGlobalConfig(['permit',this.state.tokenConfig.name,'nonceMethod']);
      const permitContract = this.functionsUtil.getContractByName(this.state.tokenConfig.name);
      usePermit = usePermit && permitContract && (!nonceMethod || permitContract.methods[nonceMethod] !== undefined);
    }

    const newState = {};
    const batchTotals = {};
    const batchRedeems = {};
    const batchDeposits = {};
    let batchCompleted = false;

    currBatchIndex = currBatchIndex || 0;
    for (let batchIndex = 0; batchIndex <= parseInt(currBatchIndex) ; batchIndex++){
      let [
        batchTotal,
        batchRedeem,
        batchDeposit
      ] = await Promise.all([
        this.functionsUtil.genericContractCall(this.state.selectedTokenConfig.migrationContract.name,'batchTotals',[batchIndex]),
        this.functionsUtil.genericContractCall(this.state.selectedTokenConfig.migrationContract.name,'batchRedeemedTotals',[batchIndex]),
        this.functionsUtil.genericContractCall(this.state.selectedTokenConfig.migrationContract.name,'batchDeposits',[this.props.account,batchIndex])
      ]);
      if (batchTotal && batchTotal !== null){
        batchTotals[batchIndex] = this.functionsUtil.fixTokenDecimals(batchTotal,this.state.tokenConfig.decimals);
      }
      if (batchDeposit !== null){
        batchRedeem = this.functionsUtil.fixTokenDecimals(batchRedeem,18);
        batchDeposit = this.functionsUtil.fixTokenDecimals(batchDeposit,this.state.tokenConfig.decimals);
        if (batchDeposit.gt(0)){
          batchDeposits[batchIndex] = batchDeposit;
          // Calculate redeemable idleTokens
          batchRedeems[batchIndex] = batchDeposit.times(batchRedeem).div(batchTotals[batchIndex]);
          if (batchRedeems[batchIndex].gt(batchRedeem)){
            batchRedeems[batchIndex] = batchRedeem;
          }
          // Check claimable
          if (batchIndex < currBatchIndex){
            batchCompleted = true;
          }
        }
      }
    }

    newState.batchDeposits = batchDeposits;

    const hasDeposited = (batchDeposits && Object.keys(batchDeposits).length>0);

    const lastExecution = batchExecutions && batchExecutions.length ? batchExecutions[0] : null;
    const batchDepositInfo = this.functionsUtil.getGlobalConfig(['tools','batchDeposit']);
    const batchDepositEnabled = batchDepositInfo.depositEnabled;

    newState.usePermit = usePermit;
    newState.showPermitBox = false;
    newState.claimSucceeded = false;
    newState.componentLoaded = true;
    newState.executeSucceeded = false;
    newState.batchTotals = batchTotals;
    newState.hasDeposited = hasDeposited;
    newState.batchRedeems = batchRedeems;
    newState.lastExecution = lastExecution;
    newState.currBatchIndex = currBatchIndex;
    newState.batchCompleted = batchCompleted;
    newState.migrationSucceeded = migrationSucceeded;
    newState.batchDepositEnabled = batchDepositEnabled;
    newState.canClaim = batchCompleted || hasDeposited;
    // Prevent user to deposit if the batch has been completed
    newState.canDeposit = batchDepositEnabled && !batchCompleted;
    newState.migrationContractApproved = migrationContractApproved;
    newState.action = hasDeposited || newState.canClaim ? 'redeem' : 'deposit';

    this.setState(newState);
  }

  async loadStrategies(){

    // Init tokens contracts
    const availableStrategiesKeys = {};
    await this.functionsUtil.asyncForEach(Object.keys(this.props.toolProps.availableTokens),async (token) => {
      const tokenConfig = this.props.toolProps.availableTokens[token];
      const tokenContract = this.functionsUtil.getContractByName(tokenConfig.token);
      if (!tokenContract && tokenConfig.abi){
        await this.props.initContract(tokenConfig.token,tokenConfig.address,tokenConfig.abi);
      }
      availableStrategiesKeys[tokenConfig.strategy] = true;
    });

    const availableStrategies = Object.keys(availableStrategiesKeys).map( strategy => {
      const strategyConfig = this.functionsUtil.getGlobalConfig(['strategies',strategy]);
      return {
        value:strategy,
        icon:strategyConfig.icon,
        label:strategyConfig.title
      };
    });

    // console.log('availableStrategies',availableStrategies);

    if (availableStrategies && availableStrategies.length>0){
      let selectedStrategy = availableStrategies[0].value;
      let selectedToken = this.props.urlParams.param2 && this.props.toolProps.availableTokens[this.props.urlParams.param2] ? this.props.urlParams.param2 : null;
      if (selectedToken){
        const selectedTokenConfig = this.props.toolProps.availableTokens[selectedToken];
        selectedToken = selectedTokenConfig.baseToken;
        selectedStrategy = selectedTokenConfig.strategy;
      }

      this.setState({
        availableStrategies
      },() => {
        this.selectStrategy(selectedStrategy,selectedToken);
      });
    }
  }

  /*
  async loadTokens(){
    const selectedToken = this.props.urlParams.param2 && this.props.toolProps.availableTokens[this.props.urlParams.param2] ? this.props.urlParams.param2 : null;
    if (selectedToken){
      this.selectToken(selectedToken);
    }
  }
  */

  async selectStrategy (selectedStrategy,selectedToken=null) {
    const availableTokens = Object.keys(this.props.toolProps.availableTokens)
      .filter(key => this.props.toolProps.availableTokens[key].strategy === selectedStrategy )
      .reduce((obj, key) => {
        const tokenConfig = this.props.toolProps.availableTokens[key];
        const baseTokenConfig = this.props.availableStrategies[selectedStrategy][tokenConfig.baseToken];

        tokenConfig.abi = baseTokenConfig.abi;
        tokenConfig.token = baseTokenConfig.token;
        tokenConfig.address = baseTokenConfig.address;
        tokenConfig.decimals = baseTokenConfig.decimals;
        obj[tokenConfig.baseToken] = tokenConfig;
        return obj;
      }, {});

    this.setState({
      availableTokens,
      selectedStrategy
    },() => {
      if (selectedToken){
        this.selectToken(selectedToken);
      }
    });
  }

  async selectToken (selectedToken) {
    const selectedTokenConfig = this.state.availableTokens[selectedToken];
    const strategyAvailableTokens = this.props.availableStrategies[selectedTokenConfig.strategy];

    const baseTokenConfig = strategyAvailableTokens[selectedTokenConfig.token];

    const tokenConfig = {
      name:baseTokenConfig.token,
      token:baseTokenConfig.token,
      address:baseTokenConfig.address,
      decimals:baseTokenConfig.decimals
    };

    // Add Idle Token config
    tokenConfig.idle = baseTokenConfig.idle;

    // Add migration info
    const oldContract = {
      abi:baseTokenConfig.abi,
      name:baseTokenConfig.token,
      token:baseTokenConfig.token,
      address:baseTokenConfig.address
    };
    
    const migrationContract = selectedTokenConfig.migrationContract;

    // Add migration function
    if (baseTokenConfig.migrateFunction){
      migrationContract.functions[0].name = baseTokenConfig.migrateFunction;
    }

    tokenConfig.migration = {
      enabled:true,
      oldContract,
      migrationContract,
      migrationSucceeded:false
    };

    await this.props.setStrategyToken(selectedTokenConfig.strategy,baseTokenConfig.token);

    this.setState({
      tokenConfig,
      selectedToken,
      selectedTokenConfig
    },() => {
      // Select strategy and available tokens
      if (selectedTokenConfig.strategy !== this.state.selectedStrategy){
        const selectedStrategy = selectedTokenConfig.strategy;
        this.selectStrategy(selectedStrategy);
      }
    });
  }

  async claim () {
    if (!this.state.batchCompleted){
      return null;
    }

    const loading = true;
    const claimableValue = 0;
    const batchId = Object.keys(this.state.batchDeposits)[0];

    const callbackClaim = (tx,error) => {
      const txSucceeded = tx.status === 'success';

      // Send Google Analytics event
      const eventData = {
        eventAction: 'Claim',
        eventCategory: `BatchDeposit`,
        eventValue: parseInt(claimableValue),
        eventLabel: this.props.selectedToken,
      };

      if (error){
        eventData.eventLabel = this.functionsUtil.getTransactionError(error);
      }

      // Send Google Analytics event
      if (error || eventData.status !== 'error'){
        this.functionsUtil.sendGoogleAnalyticsEvent(eventData);
      }

      this.setState((prevState) => ({
        claimSucceeded:txSucceeded,
        processing: {
          ...prevState.processing,
          claim:{
            txHash:null,
            loading:false
          }
        }
      }));
    };

    const callbackReceiptClaim = (tx) => {
      const txHash = tx.transactionHash;
      this.setState((prevState) => ({
        processing: {
          ...prevState.processing,
          claim:{
            ...prevState.processing.claim,
            txHash
          }
        }
      }));
    };

    this.props.contractMethodSendWrapper(this.state.selectedTokenConfig.migrationContract.name, 'withdraw', [batchId], null, callbackClaim, callbackReceiptClaim);

    this.setState((prevState) => ({
      processing: {
        ...prevState.processing,
        claim:{
          ...prevState.processing.claim,
          loading
        }
      }
    }));
  }

  async callbackPermit(){
    this.setState({
      permitSigned:true
    });
  }

  showPermitBox(){
    this.setState({
      showPermitBox:true
    });
  }

  async callbackApprove(migrationContractApproved){
    // console.log('callbackApprove',this.state.migrationContractApproved,migrationContractApproved);
    if (migrationContractApproved !== this.state.migrationContractApproved){
      this.setState({
        migrationContractApproved
      });
    }
  }

  setAction = (action) => {
    if (action !== null && ['deposit','redeem'].includes(action.toLowerCase())){
      const migrationSucceeded = false;
      this.setState({
        action,
        migrationSucceeded
      });
    }
  }

  togglePermitEnabled(permitEnabled){
    this.setState({
      permitEnabled
    });
  }

  migrationEnabledCallback = (migrationEnabled) => {
    this.setState({
      migrationEnabled
    });
  }

  migrationCallback = (tx) => {
    this.checkBatchs(true);
  }

  render() {

    if (!this.state.selectedStrategy){
      return null;
    }

    const usePermit = this.state.permitEnabled && this.state.usePermit;
    // const batchId = this.state.batchDeposits && Object.keys(this.state.batchDeposits).length>0 ? Object.keys(this.state.batchDeposits)[0] : null;
    const batchRedeem = this.state.batchRedeems && Object.values(this.state.batchRedeems).length>0 ? Object.values(this.state.batchRedeems)[0] : null;
    const batchDeposit = this.state.batchDeposits && Object.values(this.state.batchDeposits).length>0 ? Object.values(this.state.batchDeposits)[0] : null;
    const contractApproved = (usePermit && this.state.permitSigned) || (!usePermit && this.state.migrationContractApproved);
    const canExecuteBatch = this.state.batchTotals && this.state.batchTotals[this.state.currBatchIndex] && this.state.batchTotals[this.state.currBatchIndex].gt(0);
    const strategyDefaultValue = this.state.selectedStrategy ? this.state.availableStrategies.find( s => s.value === this.state.selectedStrategy ) : this.state.availableStrategies[0];

    const CustomOptionValue = props => {
      const label = props.label;
      const tokenConfig = {
        icon:props.data.icon
      };

      return (
        <Flex
          width={1}
          alignItems={'center'}
          flexDirection={'row'}
          justifyContent={'space-between'}
        >
          <Flex
            alignItems={'center'}
          >
            <AssetField
              token={label}
              tokenConfig={tokenConfig}
              fieldInfo={{
                name:'icon',
                props:{
                  mr:2,
                  width:'2em',
                  height:'2em'
                }
              }}
            />
            <AssetField
              token={label}
              fieldInfo={{
                name:'tokenName',
                props:{
                  fontSize:[1,2],
                  fontWeight:500,
                  color:'copyColor'
                }
              }}
            />
          </Flex>
        </Flex>
      );
    }

    const CustomValueContainer = props => {

      const options = props.selectProps.options;
      const selectProps = options.indexOf(props.selectProps.value) !== -1 ? props.selectProps.value : null;

      if (!selectProps){
        return null;
      }

      const label = selectProps.label;
      const tokenConfig = {
        icon:selectProps.icon
      };

      return (
        <Flex
          style={{
            flex:'1'
          }}
          justifyContent={'space-between'}
          {...props.innerProps}
        >
          <Flex
            p={0}
            width={1}
            {...props.innerProps}
            alignItems={'center'}
            flexDirection={'row'}
            style={{cursor:'pointer'}}
            justifyContent={'flex-start'}
          >
            <AssetField
              token={label}
              tokenConfig={tokenConfig}
              fieldInfo={{
                name:'icon',
                props:{
                  mr:2,
                  height:'2em'
                }
              }}
            />
            <AssetField
              token={label}
              fieldInfo={{
                name:'tokenName',
                props:{
                  fontSize:[1,2],
                  fontWeight:500,
                  color:'copyColor'
                }
              }}
            />
          </Flex>
        </Flex>
      );
    }

    return (
      <Flex
        width={1}
        mt={[2,3]}
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
          <Box
            width={1}
          >
            <Text
              mb={1}
            >
              Choose the strategy:
            </Text>
            <GenericSelector
              {...this.props}
              name={'strategy'}
              isSearchable={false}
              defaultValue={strategyDefaultValue}
              CustomOptionValue={CustomOptionValue}
              options={this.state.availableStrategies}
              onChange={this.selectStrategy.bind(this)}
              CustomValueContainer={CustomValueContainer}
            />
          </Box>
          {
            this.state.availableTokens && 
              <Box
                mt={2}
                width={1}
              >
                <Text
                  mb={1}
                >
                  Select asset to deposit:
                </Text>
                <AssetSelector
                  {...this.props}
                  id={'token-from'}
                  showBalance={true}
                  isSearchable={false}
                  onChange={this.selectToken.bind(this)}
                  selectedToken={this.state.selectedToken}
                  availableTokens={this.state.availableTokens}
                />
              </Box>
          }
          {
            !this.state.componentLoaded && (
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
                  text={'Loading asset info...'}
                />
              </Flex>
            )
          }
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
            ) : this.state.componentLoaded &&  this.state.selectedTokenConfig && (this.state.canDeposit || this.state.canClaim) && (
              <Box
                width={1}
              >
                <DashboardCard
                  cardProps={{
                    p:3,
                    px:4,
                    mt:3,
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
                        name={ contractApproved ? 'CheckBox' : 'LooksOne'}
                        color={ contractApproved ? this.props.theme.colors.transactions.status.completed : 'cellText'}
                      />
                      <Text
                        ml={2}
                        fontSize={2}
                        color={'cellText'}
                        textAlign={'left'}
                      >
                        {
                          usePermit ? 'Sign Approve message' : 'Approve the batch deposit contract'
                        }
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
                        name={ (this.state.hasDeposited || this.state.batchCompleted) ? 'CheckBox' : 'LooksTwo'}
                        color={ (this.state.hasDeposited || this.state.batchCompleted) ? this.props.theme.colors.transactions.status.completed : 'cellText'}
                      />
                      <Text
                        ml={2}
                        fontSize={2}
                        color={'cellText'}
                        textAlign={'left'}
                      >
                        Deposit your {this.state.selectedToken}
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
                        name={ this.state.batchCompleted ? 'CheckBox' : 'Looks3'}
                        color={ this.state.batchCompleted ? this.props.theme.colors.transactions.status.completed : 'cellText'}
                      />
                      <Text
                        ml={2}
                        fontSize={2}
                        color={'cellText'}
                        textAlign={'left'}
                      >
                        Wait for batch execution
                        <Link
                          ml={1}
                          fontWeight={2}
                          color={'primary'}
                          display={'inline'}
                          hoverColor={'primary'}
                          onClick={ e => this.props.openTooltipModal('Batch Execution Schedule',this.functionsUtil.getGlobalConfig(['messages','batchDepositExecutionSchedule'])) }
                        >
                          (Read More)
                        </Link>
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
                        name={ this.state.claimSucceeded ? 'CheckBox' : 'Looks4'}
                        color={ this.state.claimSucceeded ? this.props.theme.colors.transactions.status.completed : 'cellText'}
                      />
                      <Flex
                        width={1}
                        alignItems={'center'}
                        flexDirection={'row'}
                        justifyContent={'flex-start'}
                      >
                        <Text
                          ml={1}
                          fontSize={2}
                          color={'cellText'}
                          textAlign={'left'}
                        >
                          Claim your {this.state.tokenConfig.idle.token}
                        </Text>
                        <Tooltip
                          placement={'top'}
                          message={`You will start earning gov tokens after the batch is executed and you claim your ${this.state.tokenConfig.idle.token}`}
                        >
                          <Icon
                            ml={1}
                            size={'1.2em'}
                            name={'Warning'}
                            color={'#ffe000'}
                            style={{
                              cursor:'pointer'
                            }}
                          />
                        </Tooltip>
                      </Flex>
                    </Flex>
                  </Flex>
                </DashboardCard>
              </Box>
            )
          }
          {
            this.state.componentLoaded && this.props.account && this.state.availableTokens && this.state.selectedToken && (
              <Box width={1}>
                {
                  (contractApproved || this.state.canClaim) && 
                    <Flex
                      mt={2}
                      flexDirection={'column'}
                    >
                      <Text mb={2}>
                        Choose the action:
                      </Text>
                      <Flex
                        alignItems={'center'}
                        flexDirection={'row'}
                        justifyContent={'space-between'}
                      >
                        <DashboardCard
                          cardProps={{
                            p:3,
                            width:0.48,
                            onMouseDown:() => {
                              return this.state.canDeposit ? this.setAction('deposit') : null;
                            }
                          }}
                          isInteractive={true}
                          isDisabled={ !this.state.canDeposit }
                          isActive={ this.state.action === 'deposit' }
                        >
                          <Flex
                            my={1}
                            alignItems={'center'}
                            flexDirection={'row'}
                            justifyContent={'center'}
                          >
                            <TransactionField
                              transaction={{
                                action:'deposit'
                              }}
                              fieldInfo={{
                                name:'icon',
                                props:{
                                  mr:3
                                }
                              }}
                            />
                            <Text
                              fontSize={3}
                              fontWeight={3}
                            >
                              Deposit
                            </Text>
                          </Flex>
                        </DashboardCard>
                        <DashboardCard
                          cardProps={{
                            p:3,
                            width:0.48,
                            onMouseDown:() => {
                              return this.state.canClaim ? this.setAction('redeem') : null;
                            }
                          }}
                          isInteractive={true}
                          isDisabled={ !this.state.canClaim }
                          isActive={ this.state.action === 'redeem' }
                        >
                          <Flex
                            my={1}
                            alignItems={'center'}
                            flexDirection={'row'}
                            justifyContent={'center'}
                          >
                            <TransactionField
                              transaction={{
                                action:'redeem'
                              }}
                              fieldInfo={{
                                name:'icon',
                                props:{
                                  mr:3
                                }
                              }}
                            />
                            <Text
                              fontSize={3}
                              fontWeight={3}
                            >
                              Claim
                            </Text>
                          </Flex>
                        </DashboardCard>
                      </Flex>
                    </Flex>
                }
                {
                  this.state.showPermitBox && this.state.action === 'deposit' && this.state.usePermit && this.state.migrationEnabled && !this.state.migrationSucceeded ? (
                    <DashboardCard
                      cardProps={{
                        py:3,
                        px:2,
                        mt:3,
                        display:'flex',
                        alignItems:'center',
                        flexDirection:'column',
                        justifyContent:'center',
                      }}
                    >
                      <Flex
                        width={1}
                        alignItems={'center'}
                        flexDirection={'column'}
                        justifyContent={'center'}
                      >
                        <Icon
                          size={'1.8em'}
                          color={'cellText'}
                          name={'LightbulbOutline'}
                        />
                        <Text
                          mt={1}
                          fontSize={1}
                          color={'cellText'}
                          textAlign={'center'}
                        >
                          {this.state.selectedToken} supports Approve and Deposit in a single transaction, disable this feature and try again if you can't deposit in the batch.
                        </Text>
                      </Flex>
                      <Checkbox
                        mt={1}
                        required={false}
                        checked={this.state.permitEnabled}
                        label={`Approve and Deposit in a single transaction`}
                        onChange={ e => this.togglePermitEnabled(e.target.checked) }
                      />
                    </DashboardCard>
                  ) : !this.state.showPermitBox && this.state.action === 'deposit' && this.state.usePermit && this.state.migrationEnabled && !this.state.migrationSucceeded && (
                    <Flex
                      p={0}
                      mt={3}
                      width={1}
                      borderRadius={2}
                      alignItems={'center'}
                      flexDirection={'row'}
                      justifyContent={'center'}
                    >
                      <Link
                        textAlign={'center'}
                        hoverColor={'primary'}
                        onClick={this.showPermitBox.bind(this)}
                      >
                        Having trouble with the Batch Deposit?
                      </Link>
                    </Flex>
                  )
                }
                {
                  this.state.action === 'deposit' ? 
                    this.state.batchDepositEnabled ? (
                      <Migrate
                        {...this.props}
                        showActions={false}
                        usePermit={usePermit}
                        getTokenPrice={false}
                        isMigrationTool={true}
                        showBalanceSelector={true}
                        migrationIcon={'FileDownload'}
                        waitText={'Deposit estimated in'}
                        tokenConfig={this.state.tokenConfig}
                        selectedToken={this.state.selectedToken}
                        migrationParams={toMigrate => [toMigrate]}
                        selectedStrategy={this.props.selectedStrategy}
                        callbackPermit={this.callbackPermit.bind(this)}
                        callbackApprove={this.callbackApprove.bind(this)}
                        migrationCallback={this.migrationCallback.bind(this)}
                        migrationEnabledCallback={this.migrationEnabledCallback.bind(this)}
                        migrationText={`Deposit your ${this.state.selectedToken} and wait until it is converted to the new ${this.state.tokenConfig.idle.token}.`}
                      >
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
                              You don't have any {this.state.selectedToken} in your wallet.
                            </Text>
                          </Flex>
                        </DashboardCard>
                      </Migrate>
                    ) : (
                      <DashboardCard
                        cardProps={{
                          p:3,
                          my:3
                        }}
                      >
                        <Flex
                          alignItems={'center'}
                          flexDirection={'column'}
                        >
                          <Text
                            fontSize={2}
                            color={'cellText'}
                            textAlign={'center'}
                          >
                            Batch Deposit is disabled for this asset.
                          </Text>
                        </Flex>
                      </DashboardCard>
                    )
                  : (
                    <DashboardCard
                      cardProps={{
                        p:3,
                        mt:3
                      }}
                    >
                      {
                        this.state.processing.claim.loading ? (
                          <Flex
                            flexDirection={'column'}
                          >
                            <TxProgressBar {...this.props} web3={this.props.web3} waitText={`Claim estimated in`} endMessage={`Finalizing approve request...`} hash={this.state.processing.claim.txHash} />
                          </Flex>
                        ) : this.state.claimSucceeded ? (
                          <Flex
                            alignItems={'center'}
                            flexDirection={'column'}
                          >
                            <Icon
                              name={'DoneAll'}
                              size={this.props.isMobile ? '1.8em' : '2.3em'}
                              color={this.props.theme.colors.transactions.status.completed}
                            />
                            <Text
                              mt={[1,2]}
                              fontSize={2}
                              color={'cellText'}
                              textAlign={'center'}
                            >
                              You have successfully withdrawn your {this.state.tokenConfig.idle.token}!
                            </Text>
                            <Link
                              mt={2}
                              textAlign={'center'}
                              hoverColor={'primary'}
                              onClick={ e => this.props.goToSection(this.state.selectedTokenConfig.strategy+'/'+this.state.selectedTokenConfig.baseToken) }
                            >
                              Go to the Dashboard
                            </Link>
                          </Flex>
                        ) : this.state.batchCompleted ? (
                          <Flex
                            alignItems={'center'}
                            flexDirection={'column'}
                          >
                            <Icon
                              size={this.props.isMobile ? '1.8em' : '2.3em'}
                              color={'cellText'}
                              name={'FileUpload'}
                            />
                            <Text
                              fontSize={2}
                              color={'cellText'}
                              textAlign={'center'}
                            >
                              The Batch has been executed!<br />You can now claim your {batchRedeem.toFixed(4)} {this.state.tokenConfig.idle.token}
                            </Text>
                            <Text
                              fontSize={1}
                              color={'#ff9900'}
                              textAlign={'center'}
                            >
                              (You need to claim your {this.state.tokenConfig.idle.token} to start earning Gov Tokens)
                            </Text>
                            <Flex
                              width={1}
                              alignItems={'center'}
                              flexDirection={'column'}
                              justifyContent={'space-between'}
                            >
                              <RoundButton
                                buttonProps={{
                                  mt:2,
                                  width:[1,0.5],
                                  mainColor:this.props.theme.colors.redeem
                                }}
                                handleClick={ e => this.claim() }
                              >
                                Claim
                              </RoundButton>
                            </Flex>
                          </Flex>
                        ) : (
                          <Flex
                            alignItems={'center'}
                            flexDirection={'column'}
                          >
                            <Icon
                              size={'1.8em'}
                              color={'cellText'}
                              name={'HourglassEmpty'}
                            />
                            <Text
                              mt={[1,2]}
                              fontSize={2}
                              color={'cellText'}
                              textAlign={'center'}
                            >
                              <Text.span
                                color={'cellText'}
                              >
                                You have successfully deposited <strong>{batchDeposit.toFixed(4)} {this.state.selectedToken}</strong>, please wait until the batch is executed to claim your {this.state.tokenConfig.idle.token}.
                              </Text.span>
                            </Text>
                          </Flex>
                        )
                      }
                    </DashboardCard>
                  )
                }
                {
                  this.state.batchTotals[this.state.currBatchIndex] && 
                    <DashboardCard
                      cardProps={{
                        p:2,
                        my:3
                      }}
                    >
                      {
                        this.state.processing.execute.loading ? (
                          <Flex
                            width={1}
                            alignItems={'center'}
                            flexDirection={'column'}
                            justifyContent={'center'}
                          >
                            <TxProgressBar {...this.props} waitText={`Batch execution estimated in`} endMessage={`Finalizing batch execution request...`} hash={this.state.processing.execute.txHash} />
                          </Flex>
                        ) : this.state.executeSucceeded ? (
                          <Flex
                            width={1}
                            alignItems={'center'}
                            flexDirection={'column'}
                            justifyContent={'center'}
                          >
                            <Icon
                              size={this.props.isMobile ? '1.8em' : '2.3em'}
                              name={'DoneAll'}
                              color={this.props.theme.colors.transactions.status.completed}
                            />
                            <Text
                              mt={[1,2]}
                              fontSize={2}
                              color={'cellText'}
                              textAlign={'center'}
                            >
                              The Batch has been executed!
                            </Text>
                          </Flex>
                        ) : (
                          <Flex
                            width={1}
                            alignItems={'center'}
                            flexDirection={'column'}
                            justifyContent={'center'}
                          >
                            <Text
                              fontWeight={500}
                              color={'copyColor'}
                              textAlign={'center'}
                            >
                              Batch Pool: {this.state.batchTotals[this.state.currBatchIndex].toFixed(4)} {this.state.selectedToken}
                            </Text>
                            {
                              canExecuteBatch && 
                                <Link
                                  textAlign={'center'}
                                  hoverColor={'primary'}
                                  onClick={this.execute.bind(this)}
                                >
                                  Execute Batch
                                </Link>
                            }
                            {
                              this.state.batchTotals[this.state.currBatchIndex].lt(this.state.selectedTokenConfig.minPoolSize) && (
                                <Text
                                  mb={1}
                                  fontSize={1}
                                  color={'alert'}
                                  textAlign={'center'}
                                >
                                  (The pool size has to reach at least {this.functionsUtil.formatMoney(this.state.selectedTokenConfig.minPoolSize,0)} {this.state.selectedToken} to be executed)
                                </Text>
                              )
                            }
                            {
                              this.state.lastExecution && (
                                <Text
                                  fontSize={0}
                                  color={'cellText'}
                                  textAlign={'center'}
                                >
                                  Last Batch Execution: {this.functionsUtil.strToMoment(this.state.lastExecution.timeStamp*1000).utc().format('YYYY-MM-DD HH:mm UTC')}
                                </Text>
                              )
                            }
                          </Flex>
                        )
                      }
                    </DashboardCard>
                }
              </Box>
            )
          }
        </Flex>
      </Flex>
    );
  }
}

export default BatchDeposit;