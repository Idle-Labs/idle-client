import Migrate from '../Migrate/Migrate';
import IconBox from '../IconBox/IconBox';
import React, { Component } from 'react';
// import ExtLink from '../ExtLink/ExtLink';
import AssetField from '../AssetField/AssetField';
import FlexLoader from '../FlexLoader/FlexLoader';
import ConnectBox from '../ConnectBox/ConnectBox';
import CurveRedeem from '../CurveRedeem/CurveRedeem';
import RoundButton from '../RoundButton/RoundButton';
import SmartNumber from '../SmartNumber/SmartNumber';
import FunctionsUtil from '../utilities/FunctionsUtil';
import BuyModal from '../utilities/components/BuyModal';
import DashboardCard from '../DashboardCard/DashboardCard';
import AssetSelector from '../AssetSelector/AssetSelector';
import TxProgressBar from '../TxProgressBar/TxProgressBar';
import ShareModal from '../utilities/components/ShareModal';
import CardIconButton from '../CardIconButton/CardIconButton';
import TransactionField from '../TransactionField/TransactionField';
import FastBalanceSelector from '../FastBalanceSelector/FastBalanceSelector';
import { Flex, Text, Input, Box, Icon, Link, Checkbox, Tooltip, Image } from "rimble-ui";

class DepositRedeem extends Component {

  state = {
    txError: {},
    tokenAPY: '-',
    inputValue: {},
    processing: {},
    curveAPY: null,
    totalAUM: null,
    canRedeem: false,
    maxSlippage: 0.2,
    canDeposit: false,
    action: 'deposit',
    directMint: false,
    activeModal: null,
    tokenGovTokens: {},
    showBuyFlow: false,
    maxUnlentPerc: null,
    unlentBalance: null,
    tokenApproved: false,
    skipMigration: false,
    redeemSkipGov: false,
    showRedeemFlow: false,
    contractPaused: false,
    buttonDisabled: false,
    canRedeemCurve: false,
    erc20ForwarderTx: null,
    signedParameters: null,
    minAmountForMint: null,
    showMaxSlippage: false,
    redeemGovTokens: false,
    canDepositCurve: false,
    redeemSkipGovTokens: [],
    fastBalanceSelector: {},
    actionProxyContract: {},
    migrationEnabled: false,
    componentMounted: false,
    curveTokenBalance: null,
    agreeSkipGovTokens: false,
    redeemCurveEnabled: false,
    depositCurveBalance: null,
    depositCurveEnabled: true,
    showAdvancedOptions: false,
    skipGovTokensGasSave: null,
    depositCurveSlippage: null,
    erc20ForwarderContract: {},
    erc20ForwarderEnabled: false,
    showETHWrapperEnabled: false,
    skipGovTokensGasSaveUSD: null,
    metaTransactionsEnabled: true,
    skippedGovTokensBalance: null,
    minAmountForMintReached: false,
    loadingErc20ForwarderTx: false
  };

  // Utils
  functionsUtil = null;

  loadUtils() {
    if (this.functionsUtil) {
      this.functionsUtil.setProps(this.props);
    } else {
      this.functionsUtil = new FunctionsUtil(this.props);
    }
  }

  async componentWillMount() {
    this.loadUtils();
    await this.loadProxyContracts();
  }

  async componentDidMount() {
    this.loadTokenInfo();
  }

  setShowRedeemFlow = (showRedeemFlow) => {
    this.setState({
      showRedeemFlow
    });
  }

  setShowBuyFlow = (showBuyFlow) => {
    this.setState({
      showBuyFlow
    });
  }

  toggleShowAdvancedOptions = showAdvancedOptions => {
    this.setState((prevState) => ({
      showAdvancedOptions: !prevState.showAdvancedOptions
    }));
  }

  toggleSkipMigration = skipMigration => {
    this.setState({
      skipMigration
    });
  }

  toggleRedeemCurve = redeemCurveEnabled => {
    this.setState({
      redeemCurveEnabled
    });
  }

  toggleDepositCurve = depositCurveEnabled => {
    this.setState({
      depositCurveEnabled
    });
  }

  toggleShowETHWrapper = showETHWrapperEnabled => {
    this.setState({
      showETHWrapperEnabled
    });
  }

  toggleAgreeSkipGovTokens = agreeSkipGovTokens => {
    this.setState({
      agreeSkipGovTokens
    });
  }

  toggleSkipMint = (directMint) => {
    this.setState({
      directMint
    });
  }

  toggleRedeemGovTokens = (redeemGovTokens) => {
    this.setState({
      redeemGovTokens,
      redeemSkipGovTokens: [],
      agreeSkipGovTokens: false,
      skippedGovTokensBalance: this.functionsUtil.BNify(0),
      redeemSkipGov: redeemGovTokens ? false : this.state.redeemSkipGov
    });
  }

  toggleRedeemSkipGov = (redeemSkipGov) => {
    this.setState({
      redeemSkipGov,
      redeemSkipGovTokens: [],
      agreeSkipGovTokens: false,
      skippedGovTokensBalance: this.functionsUtil.BNify(0),
      redeemGovTokens: redeemSkipGov ? false : this.state.redeemGovTokens
    });
  }

  getSkippedGovTokensFlags = async () => {
    const govTokensIndexes = await this.functionsUtil.getGovTokensIndexes(this.props.account, this.props.tokenConfig);
    const govTokensFlags = Object.keys(govTokensIndexes).map(token => {
      return this.state.redeemSkipGovTokens.includes(token);
    });
    // console.log('getSkippedGovTokensFlags',govTokensIndexes,govTokensFlags);
    return govTokensFlags;
  }

  calculateSkippedGovTokens = async () => {
    let skippedGovTokensBalance = this.functionsUtil.BNify(0);
    const DAITokenConfig = this.functionsUtil.getGlobalConfig(['stats', 'tokens', 'DAI']);

    await this.functionsUtil.asyncForEach(this.state.redeemSkipGovTokens, async (govToken) => {
      const govTokenConfig = this.functionsUtil.getGlobalConfig(['govTokens', govToken]);
      const govTokenPrice = await this.functionsUtil.getUniswapConversionRate(DAITokenConfig, govTokenConfig);
      const skippedAmount = this.props.govTokensUserBalances[govToken].times(govTokenPrice);
      skippedGovTokensBalance = skippedGovTokensBalance.plus(skippedAmount);
    });

    const _skipGovTokenRedeem = await this.getSkippedGovTokensFlags();
    const WETHTokenConfig = this.functionsUtil.getGlobalConfig(['stats', 'tokens', 'WETH']);

    const [
      wethPrice,
      redeemGasUsage,
      skipGovRedeemGasUsage
    ] = await Promise.all([
      this.functionsUtil.getUniswapConversionRate(DAITokenConfig, WETHTokenConfig),
      this.functionsUtil.estimateMethodGasUsage(this.props.tokenConfig.idle.token, 'redeemIdleToken', [this.functionsUtil.normalizeTokenAmount(this.props.idleTokenBalance, this.props.tokenConfig.decimals)], this.props.account),
      this.functionsUtil.estimateMethodGasUsage(this.props.tokenConfig.idle.token, 'redeemIdleTokenSkipGov', [this.functionsUtil.normalizeTokenAmount(this.props.idleTokenBalance, this.props.tokenConfig.decimals), _skipGovTokenRedeem], this.props.account)
    ]);

    const skipGovTokensGasSave = redeemGasUsage && skipGovRedeemGasUsage ? redeemGasUsage.minus(skipGovRedeemGasUsage) : this.functionsUtil.BNify(0);
    const skipGovTokensGasSaveUSD = skipGovTokensGasSave ? skipGovTokensGasSave.times(wethPrice) : this.functionsUtil.BNify(0);

    this.setState({
      skipGovTokensGasSave,
      skipGovTokensGasSaveUSD,
      skippedGovTokensBalance
    });
    return skippedGovTokensBalance;
  }

  setRedeemSkipGovTokens = (token, checked) => {
    this.setState((prevState) => {
      const redeemSkipGovTokens = Object.assign([], prevState.redeemSkipGovTokens);
      if (!checked && redeemSkipGovTokens.includes(token)) {
        redeemSkipGovTokens.splice(redeemSkipGovTokens.indexOf(token), 1);
      } else if (checked && !redeemSkipGovTokens.includes(token)) {
        redeemSkipGovTokens.push(token);
      }
      return {
        redeemSkipGovTokens
      };
    }, () => {
      this.calculateSkippedGovTokens();
    });
  }

  toggleErc20ForwarderEnabled = (erc20ForwarderEnabled) => {
    const newState = {
      erc20ForwarderEnabled
    };

    this.setState(newState, () => {
      this.cancelTransaction();
    });
  }

  toggleMetaTransactionsEnabled = (metaTransactionsEnabled) => {
    this.setState({
      metaTransactionsEnabled
    });
  }

  async loadProxyContracts() {

    if (!this.props.contractsInitialized){
      return false;
    }

    const actions = ['deposit', 'redeem'];
    const newState = {
      actionProxyContract: {},
      erc20ForwarderContract: {}
    };

    await this.functionsUtil.asyncForEach(actions, async (action) => {
      let mintProxyContractInfo = null;
      const depositErc20ForwarderEnabled = this.functionsUtil.getGlobalConfig(['contract', 'methods', action, 'erc20ForwarderEnabled']);

      if (depositErc20ForwarderEnabled) {
        mintProxyContractInfo = this.functionsUtil.getGlobalConfig(['contract', 'methods', action, 'erc20ForwarderProxyContract', 'forwarder']);

        await this.props.initContract(mintProxyContractInfo.name, mintProxyContractInfo.address, mintProxyContractInfo.abi);

        // Init contract for erc20 forwarder
        const erc20ForwarderContractInfo = this.functionsUtil.getGlobalConfig(['contract', 'methods', action, 'erc20ForwarderProxyContract', 'tokens', this.props.selectedToken]);
        if (erc20ForwarderContractInfo) {
          mintProxyContractInfo = erc20ForwarderContractInfo;
          const erc20ForwarderContract = await this.props.initContract(erc20ForwarderContractInfo.name, erc20ForwarderContractInfo.address, erc20ForwarderContractInfo.abi);
          if (erc20ForwarderContract){
            newState.erc20ForwarderContract[action] = erc20ForwarderContractInfo;
            newState.erc20ForwarderContract[action].contract = erc20ForwarderContract.contract;
          }
        }
      }

      if (!mintProxyContractInfo) {
        mintProxyContractInfo = this.functionsUtil.getGlobalConfig(['contract', 'methods', action, 'proxyContract']);
      }

      const hasProxyContract = mintProxyContractInfo && mintProxyContractInfo.enabled;
      newState.actionProxyContract[action] = hasProxyContract ? mintProxyContractInfo : null;
      if (hasProxyContract) {
        const proxyContract = await this.props.initContract(mintProxyContractInfo.name, mintProxyContractInfo.address, mintProxyContractInfo.abi);
        if (proxyContract){
          newState.actionProxyContract[action].contract = proxyContract.contract;
          newState.actionProxyContract[action].approved = await this.functionsUtil.checkTokenApproved(this.props.selectedToken, mintProxyContractInfo.address, this.props.account);
        }
      }
    });

    // console.log('loadProxyContracts',newState);

    return await this.setState(newState);
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

  async loadAPY() {
    const tokenAprs = await this.functionsUtil.getTokenAprs(this.props.tokenConfig);
    if (tokenAprs && tokenAprs.avgApy !== null) {
      const tokenAPY = this.functionsUtil.BNify(tokenAprs.avgApy).toFixed(2);

      let curveAPY = null;
      if (this.state.canDepositCurve) {
        curveAPY = await this.functionsUtil.getCurveAPY();
        // console.log('curveAPY',curveAPY);
        if (curveAPY) {
          curveAPY = curveAPY.plus(tokenAPY);
        }
      }
      this.setState({
        tokenAPY,
        curveAPY
      });
    }
  }

  getReferralAddress() {
    let _referral = this.functionsUtil.getQueryStringParameterByName('_referral');
    if (!this.functionsUtil.checkAddress(_referral)) {
      _referral = null;
    }
    return _referral;
  }

  async componentDidUpdate(prevProps, prevState) {
    this.loadUtils();

    // console.log('componentDidUpdate',this.props.tokenBalance);

    if (this.props.tokenBalance === null) {
      return false;
    }

    const accountChanged = prevProps.account !== this.props.account;
    const tokenChanged = prevProps.selectedToken !== this.props.selectedToken;
    const contractsInitialized = prevProps.contractsInitialized !== this.props.contractsInitialized;
    const erc20ForwarderEnabledChanged = prevState.erc20ForwarderEnabled !== this.state.erc20ForwarderEnabled;
    const tokenBalanceChanged = prevProps.tokenBalance !== this.props.tokenBalance && this.props.tokenBalance !== null;

    if (accountChanged || tokenChanged || tokenBalanceChanged || erc20ForwarderEnabledChanged || contractsInitialized) {
      await this.loadProxyContracts();
      this.loadTokenInfo();
      return false;
    }

    const actionChanged = this.state.action !== prevState.action;
    const fastBalanceSelectorChanged = this.state.fastBalanceSelector[this.state.action] !== prevState.fastBalanceSelector[this.state.action];

    if (actionChanged || fastBalanceSelectorChanged) {
      this.setInputValue();
    }

    const inputValueChanged = prevState.inputValue[this.state.action] !== this.state.inputValue[this.state.action];
    if (inputValueChanged) {
      // this.checkMinAmountForMint();
    }

    const redeemSkipGovChanged = prevState.redeemSkipGov !== this.state.redeemSkipGov;
    const redeemGovTokensChanged = prevState.redeemGovTokens !== this.state.redeemGovTokens;
    const agreeSkipGovTokensChanged = prevState.agreeSkipGovTokens !== this.state.agreeSkipGovTokens;
    const redeemSkipGovTokensChanged = JSON.stringify(prevState.redeemSkipGovTokens) !== JSON.stringify(this.state.redeemSkipGovTokens);

    if (redeemGovTokensChanged || actionChanged || redeemSkipGovTokensChanged || redeemSkipGovChanged || agreeSkipGovTokensChanged) {
      this.checkButtonDisabled();
    }

    const depositCurveChanged = prevState.depositCurveEnabled !== this.state.depositCurveEnabled;
    const metaTransactionsChanged = prevState.metaTransactionsEnabled !== this.state.metaTransactionsEnabled;
    if (metaTransactionsChanged || depositCurveChanged) {
      const tokenApproved = await this.checkTokenApproved();
      this.setState({
        tokenApproved
      });
    }

    const inputChanged = prevState.inputValue[this.state.action] !== this.state.inputValue[this.state.action];
    if (inputChanged) {
      this.calculateCurveSlippage();
    }
  }

  async checkMinAmountForMint() {
    let showPoolPerc = false;
    let totalAUM = this.state.totalAUM;
    let maxUnlentPerc = this.state.maxUnlentPerc;
    const isRisk = this.props.selectedStrategy === 'risk';
    const inputValue = this.functionsUtil.BNify(this.state.inputValue[this.state.action]);

    if (inputValue.gt(this.props.tokenBalance)) {
      return false;
    }

    const convertedAmount = await this.functionsUtil.convertTokenBalance(inputValue, this.props.selectedToken, this.props.tokenConfig, isRisk);
    let minAmountForMint = this.functionsUtil.BNify(this.functionsUtil.getGlobalConfig(['contract', 'methods', 'deposit', 'minAmountForMint']));
    let minAmountForMintReached = convertedAmount.gte(minAmountForMint);

    // Check token minAmountForMint
    if (minAmountForMintReached) {
      if (this.props.tokenConfig.deposit && this.props.tokenConfig.deposit.minAmountForMint && convertedAmount.lt(this.props.tokenConfig.deposit.minAmountForMint)) {
        minAmountForMintReached = false;
      } else {
        [
          maxUnlentPerc,
          totalAUM
        ] = await Promise.all([
          maxUnlentPerc || this.functionsUtil.genericContractCall(this.props.tokenConfig.idle.token, 'maxUnlentPerc'),
          totalAUM || this.functionsUtil.loadAssetField('pool', this.props.selectedToken, this.props.tokenConfig, this.props.account)
        ]);

        if (maxUnlentPerc && totalAUM) {
          const depositPerc = inputValue.div(totalAUM).times(100);
          maxUnlentPerc = this.functionsUtil.BNify(maxUnlentPerc);
          const maxUnlentPercFormatted = maxUnlentPerc.div(1e3).times(2);
          if (depositPerc.lt(maxUnlentPercFormatted)) {
            minAmountForMintReached = false;
          } else if (totalAUM.times(maxUnlentPercFormatted.div(100)).gt(minAmountForMint)) {
            showPoolPerc = true;
            minAmountForMint = totalAUM.times(maxUnlentPercFormatted.div(100));
          }
        }
      }
    }

    this.setState({
      totalAUM,
      showPoolPerc,
      maxUnlentPerc,
      minAmountForMint,
      minAmountForMintReached
    });
  }

  async calculateCurveSlippage() {
    const amount = this.state.inputValue[this.state.action] ? this.functionsUtil.BNify(this.state.inputValue[this.state.action]) : null;

    if (!amount || amount.lte(0)) {
      return false;
    }

    const curvePoolContractInfo = this.functionsUtil.getGlobalConfig(['curve', 'poolContract']);

    const normalizedAmount = this.functionsUtil.normalizeTokenAmount(amount, curvePoolContractInfo.decimals);
    const newState = {};

    switch (this.state.action) {
      case 'deposit':
        newState.depositCurveBalance = amount;
        newState.depositCurveSlippage = await this.functionsUtil.getCurveSlippage(this.props.tokenConfig.idle.token, normalizedAmount, true);
        break;
      case 'redeem':
        // newState.redeemBalance = amount;
        // newState.withdrawSlippage = await this.functionsUtil.getCurveSlippage(this.props.tokenConfig.idle.token,normalizedAmount,true);
        break;
      default:
        break;
    }
    // console.log('calculateCurveSlippage',newState);

    this.setState(newState);
  }

  checkUseProxyContract = () => {
    const proxyContract = this.state.actionProxyContract[this.state.action];
    const depositErc20ForwarderEnabled = this.functionsUtil.getGlobalConfig(['contract', 'methods', 'deposit', 'erc20ForwarderEnabled']) && this.state.erc20ForwarderEnabled;
    const depositMetaTransactionsEnabled = this.functionsUtil.getGlobalConfig(['contract', 'methods', 'deposit', 'metaTransactionsEnabled']) && this.state.metaTransactionsEnabled;
    return ((depositErc20ForwarderEnabled || depositMetaTransactionsEnabled) && proxyContract && this.props.biconomy);
  }

  approveContract = async (callbackApprove, callbackReceiptApprove) => {
    if (this.state.depositCurveEnabled) {
      const curveDepositContract = this.functionsUtil.getGlobalConfig(['curve', 'depositContract']);
      this.functionsUtil.enableERC20(this.props.selectedToken, curveDepositContract.address, callbackApprove, callbackReceiptApprove);
    } else {
      // Check Proxy Contract Approved for Deposit with Biconomy
      const useProxyContract = this.checkUseProxyContract();
      if (useProxyContract) {
        const proxyContract = this.state.actionProxyContract[this.state.action];
        this.functionsUtil.enableERC20(this.props.selectedToken, proxyContract.address, callbackApprove, callbackReceiptApprove);
      } else {
        this.functionsUtil.enableERC20(this.props.selectedToken, this.props.tokenConfig.idle.address, callbackApprove, callbackReceiptApprove);
      }
    }
  }

  checkTokenApproved = async () => {
    let tokenApproved = false;
    if (this.state.depositCurveEnabled) {
      const curveDepositContract = this.functionsUtil.getGlobalConfig(['curve', 'depositContract']);
      tokenApproved = await this.functionsUtil.checkTokenApproved(this.props.selectedToken, curveDepositContract.address, this.props.account);
    } else {
      // Check Proxy Contract Approved for Deposit with Biconomy
      const useProxyContract = this.checkUseProxyContract();
      if (useProxyContract) {
        // Check for Permit Deposit
        const depositErc20ForwarderEnabled = this.functionsUtil.getGlobalConfig(['contract', 'methods', 'deposit', 'erc20ForwarderEnabled']) && this.state.erc20ForwarderEnabled;
        if (depositErc20ForwarderEnabled) {
          const permitEnabled = this.functionsUtil.getGlobalConfig(['permit', this.props.selectedToken]);
          if (permitEnabled) {
            return true;
          }
        }
        // Check proxy contract approved
        const proxyContract = this.state.actionProxyContract[this.state.action];
        tokenApproved = await this.functionsUtil.checkTokenApproved(this.props.selectedToken, proxyContract.address, this.props.account);
        // console.log('tokenApproved 1',tokenApproved);
      } else {
        tokenApproved = await this.functionsUtil.checkTokenApproved(this.props.selectedToken, this.props.tokenConfig.idle.address, this.props.account);
        // console.log('tokenApproved 2',tokenApproved);
      }
    }

    return tokenApproved;
  }

  approveToken = async () => {

    // Check if the token is already approved
    const tokenApproved = await this.checkTokenApproved();

    if (tokenApproved) {
      return this.setState((prevState) => ({
        tokenApproved,
        processing: {
          ...prevState.processing,
          approve: {
            txHash: null,
            loading: false
          }
        }
      }));
    }

    const callbackApprove = (tx, error) => {
      // Send Google Analytics event
      const eventData = {
        eventCategory: 'Approve',
        eventAction: this.props.selectedToken,
        eventLabel: tx.status,
      };

      if (error) {
        eventData.eventLabel = this.functionsUtil.getTransactionError(error);
      }

      // Send Google Analytics event
      if (error || eventData.status !== 'error') {
        this.functionsUtil.sendGoogleAnalyticsEvent(eventData);
      }

      this.setState((prevState) => ({
        tokenApproved: (tx.status === 'success'), // True
        processing: {
          ...prevState.processing,
          approve: {
            txHash: null,
            loading: false
          }
        }
      }));
    };

    const callbackReceiptApprove = (tx) => {
      const txHash = tx.transactionHash;
      this.setState((prevState) => ({
        processing: {
          ...prevState.processing,
          approve: {
            ...prevState.processing['approve'],
            txHash
          }
        }
      }));
    };

    this.approveContract(callbackApprove, callbackReceiptApprove);

    this.setState((prevState) => ({
      processing: {
        ...prevState.processing,
        approve: {
          txHash: null,
          loading: true
        }
      }
    }));
  }

  loadTokenInfo = async () => {

    if (this.state.componentMounted) {
      this.setState({
        componentMounted: false
      });
    }

    const curveConfig = this.functionsUtil.getGlobalConfig(['curve']);
    const curveTokenConfig = this.functionsUtil.getGlobalConfig(['curve', 'availableTokens', this.props.tokenConfig.idle.token]);
    const curveTokenEnabled = curveConfig.enabled && curveTokenConfig && curveTokenConfig.enabled;

    const [
      tokenApproved,
      contractPaused,
      curveSwapContract,
      curveDepositContract,
      unlentBalance,
      { migrationEnabled },
      curveTokenBalance,
    ] = await Promise.all([
      this.checkTokenApproved(),
      this.functionsUtil.checkContractPaused(),
      this.functionsUtil.getCurveSwapContract(),
      this.functionsUtil.getCurveDepositContract(),
      this.functionsUtil.getUnlentBalance(this.props.tokenConfig),
      this.functionsUtil.checkMigration(this.props.tokenConfig, this.props.account),
      curveTokenEnabled ? this.functionsUtil.getCurveTokenBalance(this.props.account) : null
    ]);

    const canDeposit = this.props.tokenBalance && this.functionsUtil.BNify(this.props.tokenBalance).gt(0);
    const canRedeem = this.props.idleTokenBalance && this.functionsUtil.BNify(this.props.idleTokenBalance).gt(0);

    const canDepositCurve = curveTokenEnabled && canDeposit;
    const depositCurveEnabled = canDepositCurve;

    const showETHWrapperEnabled = this.props.selectedToken === 'WETH' && (this.state.showETHWrapperEnabled || !canDeposit);

    const canRedeemCurve = curveTokenEnabled && curveTokenBalance && curveTokenBalance.gt(0);
    const redeemCurveEnabled = canRedeemCurve;

    const tokenGovTokens = this.functionsUtil.getTokenGovTokens(this.props.tokenConfig);

    const newState = { ...this.state };

    // Check curve deposit enabled
    if (newState.depositCurveEnabled && !curveTokenEnabled) {
      newState.depositCurveEnabled = false;
    }


    newState.canRedeem = canRedeem;
    newState.canDeposit = canDeposit;
    newState.unlentBalance = unlentBalance;
    newState.tokenApproved = tokenApproved;
    newState.tokenGovTokens = tokenGovTokens;
    newState.contractPaused = contractPaused;
    newState.canRedeemCurve = canRedeemCurve;
    newState.canDepositCurve = canDepositCurve;
    newState.migrationEnabled = migrationEnabled;
    newState.curveTokenBalance = curveTokenBalance;
    newState.curveSwapContract = curveSwapContract;
    newState.redeemCurveEnabled = redeemCurveEnabled;
    newState.depositCurveEnabled = depositCurveEnabled;
    newState.curveDepositContract = curveDepositContract;
    newState.showETHWrapperEnabled = showETHWrapperEnabled;

    newState.txError = {
      redeem: false,
      deposit: false
    };
    newState.processing = {
      redeem: {
        txHash: null,
        loading: false
      },
      deposit: {
        txHash: null,
        loading: false
      },
      approve: {
        txHash: null,
        loading: false
      },
      boost: {
        txHash: null,
        loading: false
      }
    };
    newState.inputValue = {
      boost: null,
      redeem: null,
      deposit: null
    };
    newState.fastBalanceSelector = {
      boost: null,
      redeem: null,
      deposit: null
    };

    newState.componentMounted = true;

    this.setState(newState, () => {
      this.checkAction();
      this.loadAPY();
    });
  }

  cancelTransaction = async () => {
    this.setState((prevState) => ({
      erc20ForwarderTx: null,
      loadingErc20ForwarderTx: false,
      processing: {
        ...prevState.processing,
        approve: {
          txHash: null,
          loading: false
        },
        [this.state.action]: {
          txHash: null,
          loading: false
        }
      }
    }));
  }

  executeAction = async () => {

    let contractSendResult = null;
    const redeemGovTokens = this.state.redeemGovTokens;
    const selectedPercentage = this.getFastBalanceSelector();
    const inputValue = this.state.inputValue[this.state.action];
    const redeemSkipGov = this.state.redeemSkipGov && this.state.redeemSkipGovTokens.length > 0 && this.state.agreeSkipGovTokens;

    const depositErc20ForwarderEnabled = this.functionsUtil.getGlobalConfig(['contract', 'methods', 'deposit', 'erc20ForwarderEnabled']) && this.state.erc20ForwarderEnabled;
    const depositMetaTransactionsEnabled = this.functionsUtil.getGlobalConfig(['contract', 'methods', 'deposit', 'metaTransactionsEnabled']) && this.state.metaTransactionsEnabled;

    let loading = true;

    switch (this.state.action) {
      case 'deposit':

        if (this.state.buttonDisabled || !inputValue || this.functionsUtil.BNify(inputValue).lte(0)) {
          return false;
        }

        if (!this.state.tokenApproved) {
          return this.approveToken();
        }

        if (localStorage) {
          this.functionsUtil.setLocalStorage('redirectToFundsAfterLogged', 0);
        }

        this.setState({
          lendingProcessing: this.props.account,
          lendAmount: '',
          genericError: '',
        });

        const callbackDeposit = (tx, error) => {

          if (!tx && error) {
            tx = {
              status: 'error'
            };
          }

          const txError = tx.status === 'error';
          const txSucceeded = tx.status === 'success';

          const eventData = {
            eventCategory: 'Deposit',
            eventAction: this.props.selectedToken,
            eventLabel: tx.status,
            eventValue: parseInt(inputValue)
          };

          if (error) {
            eventData.eventLabel = this.functionsUtil.getTransactionError(error);
          }

          // Send Google Analytics event
          if (error || eventData.status !== 'error') {
            this.functionsUtil.sendGoogleAnalyticsEvent(eventData);
          }

          this.setState((prevState) => ({
            processing: {
              ...prevState.processing,
              [this.state.action]: {
                txHash: null,
                loading: false
              }
            }
          }));

          if (txSucceeded) {
            this.setState((prevState) => ({
              activeModal: 'share',
              inputValue: {
                ...prevState.inputValue,
                [this.state.action]: this.functionsUtil.BNify(0)
              }
            }));
          } else if ((this.state.metaTransactionsEnabled || this.state.erc20ForwarderEnabled) && txError) {
            this.setState({
              erc20ForwarderTx: null,
              loadingErc20ForwarderTx: false,
              txError: {
                [this.state.action]: true
              }
            });
          }
        };

        const callbackReceiptDeposit = (tx) => {
          // console.log('callbackReceiptDeposit',tx);
          const txHash = tx.transactionHash;
          this.setState((prevState) => ({
            processing: {
              ...prevState.processing,
              [this.state.action]: {
                ...prevState.processing[this.state.action],
                txHash
              }
            }
          }));
        };

        const curveConfig = this.functionsUtil.getGlobalConfig(['curve']);
        const curveTokenEnabled = curveConfig.enabled && this.functionsUtil.getGlobalConfig(['curve', 'availableTokens', this.props.tokenConfig.idle.token, 'enabled']);

        // Curve Deposit
        if (curveTokenEnabled && this.state.depositCurveEnabled) {

          const curvePoolContractInfo = this.functionsUtil.getGlobalConfig(['curve', 'poolContract']);
          const tokensToDeposit = this.functionsUtil.normalizeTokenAmount(inputValue, curvePoolContractInfo.decimals);

          const amounts = await this.functionsUtil.getCurveAmounts(this.props.tokenConfig.idle.token, tokensToDeposit);
          let minMintAmount = await this.functionsUtil.getCurveTokenAmount(amounts);
          if (this.state.maxSlippage) {
            minMintAmount = this.functionsUtil.BNify(minMintAmount);
            minMintAmount = minMintAmount.minus(minMintAmount.times(this.functionsUtil.BNify(this.state.maxSlippage).div(100)));
            minMintAmount = this.functionsUtil.integerValue(minMintAmount);
          }

          const depositParams = [amounts, minMintAmount];

          contractSendResult = await this.functionsUtil.contractMethodSendWrapper(this.state.curveDepositContract.name, 'add_liquidity', depositParams, callbackDeposit, callbackReceiptDeposit);
          // Normal Deposit
        } else {
          const tokensToDeposit = this.functionsUtil.normalizeTokenAmount(inputValue, this.props.tokenConfig.decimals);

          // const gasLimitDeposit = this.functionsUtil.BNify(1000000);
          let depositParams = [];

          // Use Proxy Contract if enabled
          const useProxyContract = this.checkUseProxyContract();
          if (useProxyContract) {
            const mintProxyContractInfo = this.state.actionProxyContract[this.state.action];
            const mintProxyContract = mintProxyContractInfo.contract;

            // Use Meta-Transactions
            if (depositMetaTransactionsEnabled) {
              depositParams = [tokensToDeposit, this.props.tokenConfig.idle.address];
              const functionCall = mintProxyContract.methods[mintProxyContractInfo.function](...depositParams);
              const functionSignature = functionCall.encodeABI();
              // console.log('mintProxyContract',mintProxyContractInfo.function,depositParams);
              // if (this.state.metaTransactionsEnabled){
              contractSendResult = await this.functionsUtil.sendBiconomyTxWithPersonalSign(mintProxyContractInfo.name, functionSignature, callbackDeposit, callbackReceiptDeposit);
              // } else {
              //   contractSendResult = await this.functionsUtil.contractMethodSendWrapper(mintProxyContractInfo.name, mintProxyContractInfo.function, depositParams, callbackDeposit, callbackReceiptDeposit);
              // }
              // Use Erc20 Forwarder
            } else if (depositErc20ForwarderEnabled) {

              // Check if the deposit method require the nonce
              const methodAbi = mintProxyContractInfo.contract._jsonInterface.find(f => f.name === mintProxyContractInfo.function);
              const useNonce = methodAbi ? methodAbi.inputs.find(i => i.name === 'nonce') : true;

              // Build ERC20 Forwarder Tx
              if (!this.state.erc20ForwarderTx) {
                this.setState({
                  txError: {
                    [this.state.action]: false
                  },
                  loadingErc20ForwarderTx: true
                }, async () => {
                  const erc20ForwarderContract = this.state.erc20ForwarderContract[this.state.action];
                  const signedParameters = await this.functionsUtil.signPermit(this.props.selectedToken, this.props.account, erc20ForwarderContract.name, 0, tokensToDeposit);

                  // console.log('signedParameters_1',signedParameters);

                  if (signedParameters) {

                    const { expiry, nonce, r, s, v } = signedParameters;

                    if (useNonce) {
                      depositParams = [tokensToDeposit, parseInt(nonce), expiry, v, r, s];
                    } else {
                      depositParams = [tokensToDeposit, expiry, v, r, s];
                    }

                    if (mintProxyContractInfo.function === 'foo') {
                      depositParams = [];
                    }

                    // console.log('permitAndDeposit',mintProxyContractInfo.name, mintProxyContractInfo.function, depositParams);

                    // contractSendResult = await this.functionsUtil.contractMethodSendWrapper(mintProxyContractInfo.name, mintProxyContractInfo.function, depositParams, callbackDeposit, callbackReceiptDeposit);

                    const permitType = erc20ForwarderContract.permitType;
                    const functionCall = erc20ForwarderContract.contract.methods[erc20ForwarderContract.function](...depositParams);
                    const functionSignature = functionCall.encodeABI();

                    // console.log('functionSignature',permitType, erc20ForwarderContract.function, depositParams);

                    let gasLimit = null;
                    try {
                      gasLimit = await functionCall.estimateGas({ from: this.props.account }); // 5000000;
                      if (gasLimit) {
                        gasLimit = this.functionsUtil.BNify(gasLimit).times(1.2);
                      } else {
                        gasLimit = this.functionsUtil.BNify(1000000);
                      }
                    } catch (error) {
                      // console.log('Gas Estimate - Error: ',error);
                    }

                    if (!gasLimit) {
                      gasLimit = this.functionsUtil.BNify(1000000);
                    }

                    // console.log('gasEstimate',mintProxyContractInfo.name, depositParams, parseFloat(gasLimit));

                    // debugger;

                    const erc20ForwarderTx = await this.functionsUtil.buildBiconomyErc20ForwarderTx(erc20ForwarderContract.name, this.props.tokenConfig.address, permitType, functionSignature, gasLimit);
                    // console.log('erc20ForwarderTx',erc20ForwarderTx);
                    return this.setState({
                      erc20ForwarderTx,
                      loadingErc20ForwarderTx: false
                    });
                  } else {
                    return this.setState((prevState) => ({
                      processing: {
                        ...prevState.processing,
                        [this.state.action]: {
                          txHash: null,
                          loading: false
                        }
                      },
                      signedParameters: null,
                      erc20ForwarderTx: null,
                      loadingErc20ForwarderTx: false
                    }));
                  }
                });
                // Send ERC20 Forwarder Tx
              } else {
                this.setState({
                  txError: {
                    [this.state.action]: false
                  },
                  loadingErc20ForwarderTx: true
                }, async () => {
                  const metaInfo = {};
                  const permitOptions = {};
                  const erc20ForwarderContract = this.state.erc20ForwarderContract[this.state.action];
                  const erc20ForwarderBaseContract = this.functionsUtil.getGlobalConfig(['contract', 'methods', this.state.action, 'erc20ForwarderProxyContract', 'forwarder']);

                  const permitValue = `${tokensToDeposit}00`;
                  const incrementNonce = 1; // useNonce ? 1 : 0;
                  const signedParameters = await this.functionsUtil.signPermit(this.props.selectedToken, this.props.account, erc20ForwarderBaseContract.name, incrementNonce, permitValue);

                  // console.log('signedParameters_2',signedParameters);

                  if (signedParameters) {

                    this.setState({
                      signedParameters
                    });

                    const permitConfig = this.functionsUtil.getGlobalConfig(['permit', this.props.selectedToken]);
                    const setValue = permitConfig.type.find(t => t.name === 'value');

                    const { expiry, nonce, r, s, v } = signedParameters;
                    permitOptions.v = v;
                    permitOptions.r = r;
                    permitOptions.s = s;
                    permitOptions.allowed = true;
                    permitOptions.expiry = parseInt(expiry);
                    permitOptions.holder = this.props.account;
                    permitOptions.value = setValue ? permitValue : 0;
                    permitOptions.nonce = parseInt(nonce.toString());
                    permitOptions.spender = erc20ForwarderBaseContract.address;

                    metaInfo.permitData = permitOptions;
                    metaInfo.permitType = erc20ForwarderContract.permitType;

                    // console.log('sendBiconomyTxWithErc20Forwarder',permitOptions,metaInfo);

                    await this.functionsUtil.asyncTimeout(200);

                    contractSendResult = await this.functionsUtil.sendBiconomyTxWithErc20Forwarder(this.state.erc20ForwarderTx.request, metaInfo, callbackDeposit, callbackReceiptDeposit);

                    this.setState({
                      erc20ForwarderTx: null,
                      loadingErc20ForwarderTx: false
                    });
                  } else {
                    return this.setState((prevState) => ({
                      processing: {
                        ...prevState.processing,
                        [this.state.action]: {
                          txHash: null,
                          loading: false
                        }
                      },
                      signedParameters: null,
                      erc20ForwarderTx: null,
                      loadingErc20ForwarderTx: false
                    }));
                  }
                });
              }
            }
            // Use main contract if no proxy contract exists
          } else {
            /*
            let _skipMint = !this.state.directMint && this.functionsUtil.getGlobalConfig(['contract','methods','deposit','skipMint']);
            _skipMint = typeof this.props.tokenConfig.skipMintForDeposit !== 'undefined' ? this.props.tokenConfig.skipMintForDeposit : _skipMint;

            // Check if deposited amount is greated that general lower limit for direct mint
            if (_skipMint && this.state.minAmountForMintReached){
              _skipMint = false;
            }
            */
            // Always skip mint
            let _skipMint = true;

            const _referral = this.getReferralAddress() || '0x0000000000000000000000000000000000000000';
            depositParams = [tokensToDeposit, _skipMint, _referral];
            // console.log('depositParams',depositParams);
            contractSendResult = await this.functionsUtil.contractMethodSendWrapper(this.props.tokenConfig.idle.token, 'mintIdleToken', depositParams, callbackDeposit, callbackReceiptDeposit);
          }
        }
        break;
      case 'redeem':

        if (redeemGovTokens) {
          const callbackRedeem = (tx, error) => {
            const txSucceeded = tx.status === 'success';

            // Send Google Analytics event
            const eventData = {
              eventCategory: `Redeem_gov`,
              eventAction: this.props.selectedToken,
              eventLabel: tx.status,
              eventValue: 0
            };

            if (error) {
              eventData.eventLabel = this.functionsUtil.getTransactionError(error);
            }

            // Send Google Analytics event
            if (error || eventData.status !== 'error') {
              this.functionsUtil.sendGoogleAnalyticsEvent(eventData);
            }

            this.setState((prevState) => ({
              processing: {
                ...prevState.processing,
                [this.state.action]: {
                  txHash: null,
                  loading: false
                }
              }
            }));

            if (txSucceeded) {
              this.setState((prevState) => ({
                inputValue: {
                  ...prevState.inputValue,
                  [this.state.action]: this.functionsUtil.BNify(0)
                }
              }));
            }
          };

          const callbackReceiptRedeem = (tx) => {
            const txHash = tx.transactionHash;
            this.setState((prevState) => ({
              processing: {
                ...prevState.processing,
                [this.state.action]: {
                  ...prevState.processing[this.state.action],
                  txHash
                }
              }
            }));
          };

          contractSendResult = await this.functionsUtil.contractMethodSendWrapper(this.props.tokenConfig.idle.token, 'redeemIdleToken', [0], callbackRedeem, callbackReceiptRedeem);

        } else {

          if (this.state.buttonDisabled || !inputValue || this.functionsUtil.BNify(inputValue).lte(0)) {
            return false;
          }

          const txData = {
            value: this.functionsUtil.BNify(inputValue)
          };

          let idleTokenToRedeem = null;
          if (selectedPercentage) {
            idleTokenToRedeem = this.functionsUtil.BNify(this.props.idleTokenBalance).times(selectedPercentage);
          } else {
            const idleTokenPriceWithFee = await this.functionsUtil.getIdleTokenPriceWithFee(this.props.tokenConfig, this.props.account)
            idleTokenToRedeem = this.functionsUtil.BNify(this.functionsUtil.normalizeTokenAmount(inputValue, this.props.tokenConfig.decimals)).div(idleTokenPriceWithFee);
          }

          // Check if idleTokens to redeem > idleToken balance
          if (idleTokenToRedeem.gt(this.functionsUtil.BNify(this.props.idleTokenBalance))) {
            idleTokenToRedeem = this.functionsUtil.BNify(this.props.idleTokenBalance);
          }

          // Normalize number
          idleTokenToRedeem = this.functionsUtil.normalizeTokenAmount(idleTokenToRedeem, 18);

          if (!idleTokenToRedeem) {
            return false;
          }

          const callbackRedeem = (tx, error) => {
            const txSucceeded = tx.status === 'success';

            // Send Google Analytics event
            const eventData = {
              eventCategory: `Redeem_partial`,
              eventAction: this.props.selectedToken,
              eventLabel: tx.status,
              eventValue: parseInt(inputValue)
            };

            if (error) {
              eventData.eventLabel = this.functionsUtil.getTransactionError(error);
            }

            // Send Google Analytics event
            if (error || eventData.status !== 'error') {
              this.functionsUtil.sendGoogleAnalyticsEvent(eventData);
            }

            this.setState((prevState) => ({
              processing: {
                ...prevState.processing,
                [this.state.action]: {
                  txHash: null,
                  loading: false
                }
              }
            }));

            if (txSucceeded) {
              this.setState((prevState) => ({
                inputValue: {
                  ...prevState.inputValue,
                  [this.state.action]: this.functionsUtil.BNify(0)
                }
              }));
            }
          };

          const callbackReceiptRedeem = (tx) => {
            const txHash = tx.transactionHash;
            this.setState((prevState) => ({
              processing: {
                ...prevState.processing,
                [this.state.action]: {
                  ...prevState.processing[this.state.action],
                  txHash
                }
              }
            }));
          };

          let redeemMethod = 'redeemIdleToken';
          let redeemParams = [idleTokenToRedeem];

          if (redeemSkipGov) {
            redeemMethod = 'redeemIdleTokenSkipGov';
            const _skipGovTokenRedeem = await this.getSkippedGovTokensFlags();
            redeemParams.push(_skipGovTokenRedeem);
          }

          contractSendResult = await this.functionsUtil.contractMethodSendWrapper(this.props.tokenConfig.idle.token, redeemMethod, redeemParams, callbackRedeem, callbackReceiptRedeem, txData);
        }
        break;
      default: // Reset loading if not handled action
        loading = false;
        break;
    }

    if (contractSendResult !== false || loading !== this.state.processing[this.state.action].loading) {
      this.setState((prevState) => ({
        processing: {
          ...prevState.processing,
          [this.state.action]: {
            ...prevState.processing[this.state.action],
            loading
          }
        }
      }));
    }
  }

  setMaxSlippage = (maxSlippage) => {
    this.setState({
      maxSlippage
    });
  }

  showMaxSlippage = () => {
    this.setState({
      showMaxSlippage: true
    });
  }

  checkAction = () => {
    let action = this.state.action;

    switch (action) {
      case 'redeem':
        if (!this.state.canRedeem) {
          action = 'deposit';
        }
        break;
      default:
        break;
    }

    if (action !== this.state.action) {
      this.setState({
        action
      }, () => {
        this.checkButtonDisabled();
      });
    } else {
      this.checkButtonDisabled();
    }
  }

  checkButtonDisabled = (amount = null) => {

    if (!this.state.action) {
      return false;
    }

    if (!amount) {
      amount = this.state.inputValue[this.state.action];
    }

    let buttonDisabled = false;

    switch (this.state.action) {
      case 'deposit':
        buttonDisabled = buttonDisabled || (amount && (amount.lte(0) || amount.gt(this.props.tokenBalance)));
        break;
      case 'redeem':
        buttonDisabled = !this.state.canRedeemCurve && !this.state.redeemGovTokens && (buttonDisabled || (!amount || amount.lte(0) || amount.gt(this.props.redeemableBalance)));

        if (!buttonDisabled && this.state.redeemSkipGov && this.state.redeemSkipGovTokens.length > 0 && !this.state.agreeSkipGovTokens) {
          buttonDisabled = true;
        }
        // console.log('checkButtonDisabled',this.state.redeemSkipGov,this.state.redeemSkipGovTokens.length,this.state.agreeSkipGovTokens,buttonDisabled);
        break;
      default:
        break;
    }

    this.setState({
      buttonDisabled
    });
  }

  setInputValue = () => {
    if (!this.state.action || this.state.fastBalanceSelector[this.state.action] === null) {
      return false;
    }

    const selectedPercentage = this.functionsUtil.BNify(this.state.fastBalanceSelector[this.state.action]).div(100);
    let amount = null;

    switch (this.state.action) {
      case 'deposit':
        amount = this.props.tokenBalance ? this.functionsUtil.BNify(this.props.tokenBalance).times(selectedPercentage) : null;
        break;
      case 'redeem':
        amount = this.props.redeemableBalance ? this.functionsUtil.BNify(this.props.redeemableBalance).times(selectedPercentage) : null;
        break;
      default:
        break;
    }

    this.checkButtonDisabled(amount);

    this.setState((prevState) => ({
      inputValue: {
        ...prevState.inputValue,
        [this.state.action]: amount
      }
    }));
  }

  getFastBalanceSelector = () => {
    if (this.state.fastBalanceSelector[this.state.action] === null) {
      return false;
    }

    return this.functionsUtil.BNify(this.state.fastBalanceSelector[this.state.action]).div(100);
  }

  setFastBalanceSelector = (percentage) => {
    if (!this.state.action) {
      return false;
    }
    this.setState((prevState) => ({
      fastBalanceSelector: {
        ...prevState.fastBalanceSelector,
        [this.state.action]: percentage
      }
    }));
  }

  changeInputValue = async (e) => {
    if (!this.state.action) {
      return false;
    }
    const amount = e.target.value.length && !isNaN(e.target.value) ? this.functionsUtil.BNify(e.target.value) : this.functionsUtil.BNify(0);
    this.checkButtonDisabled(amount);

    this.setState((prevState) => ({
      fastBalanceSelector: {
        ...prevState.fastBalanceSelector,
        [this.state.action]: null
      },
      inputValue: {
        ...prevState.inputValue,
        [this.state.action]: amount
      }
    }));
  }

  setAction = (action) => {
    switch (action.toLowerCase()) {
      case 'deposit':

        break;
      case 'redeem':
        if (!this.state.canRedeem && !this.state.canRedeemCurve) {
          action = null;
        }
        break;
      default:
        action = null;
        break;
    }

    if (action !== null) {
      this.setState({
        action
      });
    }
  }

  render() {

    if (!this.props.selectedToken || !this.props.tokenConfig) {
      return null;
    }


    const viewOnly = this.props.connectorName === 'custom';
    const currentNetwork = this.functionsUtil.getCurrentNetwork();

    const isDepositDisabled = this.props.tokenConfig.canDeposit && !this.props.tokenConfig.canDeposit.enabled;
    // const depositDisabledMessage1 = isDepositDisabled && this.props.tokenConfig.canDeposit.disabledMessageDepositKey ? this.functionsUtil.getGlobalConfig(['messages', this.props.tokenConfig.canDeposit.disabledMessageDepositKey]) : null;
    // const depositDisabledMessage2 = this.state.canRedeem ? this.functionsUtil.getGlobalConfig(['messages', this.props.tokenConfig.canDeposit.disabledMessageRedeemKey]) : "";
    const depositDisabledMessage = isDepositDisabled ? (this.state.canRedeem && this.props.tokenConfig.canDeposit.disabledMessageRedeemKey ? this.functionsUtil.getGlobalConfig(['messages', this.props.tokenConfig.canDeposit.disabledMessageRedeemKey]) : (this.props.tokenConfig.canDeposit.disabledMessageDepositKey ? this.functionsUtil.getGlobalConfig(['messages', this.props.tokenConfig.canDeposit.disabledMessageDepositKey]) : null) ) : null;

    const govTokensDisabled = this.props.tokenConfig.govTokensDisabled;
    const govTokensEnabled = !govTokensDisabled && this.functionsUtil.getGlobalConfig(['strategies', this.props.selectedStrategy, 'govTokensEnabled']) && Object.keys(this.state.tokenGovTokens).length > 0;
    const skipMintForDepositEnabled = typeof this.props.tokenConfig.skipMintForDeposit !== 'undefined' ? this.props.tokenConfig.skipMintForDeposit : true;
    const skipMintCheckboxEnabled = this.functionsUtil.getGlobalConfig(['contract', 'methods', 'deposit', 'skipMintCheckboxEnabled']) && skipMintForDepositEnabled;

    const showRedeemFlow = this.state.canRedeem && (!this.state.redeemCurveEnabled || this.state.showRedeemFlow) && this.state.action === 'redeem';

    const redeemGovTokenEnabled = this.functionsUtil.getGlobalConfig(['contract', 'methods', 'redeemGovTokens', 'enabled']) && govTokensEnabled && showRedeemFlow;// && this.props.govTokensBalance.gt(0);
    const redeemGovTokens = redeemGovTokenEnabled && this.state.redeemGovTokens;

    const redeemSkipGovConfig = this.functionsUtil.getGlobalConfig(['contract', 'methods', 'redeemSkipGov']);
    const redeemSkipGovEnabled = redeemSkipGovConfig && !redeemSkipGovConfig.disabledTokens.includes(this.props.tokenConfig.idle.token) && govTokensEnabled && showRedeemFlow;
    const redeemSkipGov = redeemSkipGovEnabled && this.state.redeemSkipGov && Object.keys(this.props.govTokensUserBalances).length > 0 && this.props.govTokensBalance.gt(0);
    const redeemSkipGovNoTokens = redeemSkipGovEnabled && this.state.redeemSkipGov && (!Object.keys(this.props.govTokensUserBalances).length || this.props.govTokensBalance.lte(0));


    const showAdvancedRedeemOptions = redeemGovTokenEnabled || redeemSkipGovEnabled;
    // console.log('showAdvancedRedeemOptions',showAdvancedRedeemOptions,redeemGovTokenEnabled,redeemSkipGovEnabled,govTokensEnabled,showRedeemFlow);

    const depositErc20ForwarderEnabled = this.functionsUtil.getGlobalConfig(['contract', 'methods', 'deposit', 'erc20ForwarderEnabled']);
    const depositMetaTransactionsEnabled = this.functionsUtil.getGlobalConfig(['contract', 'methods', 'deposit', 'metaTransactionsEnabled']);
    const depositErc20ForwarderEnabledTokens = this.functionsUtil.getGlobalConfig(['contract', 'methods', 'deposit', 'erc20ForwarderProxyContract', 'tokens']);

    // Biconomy Start
    const metaTransactionsAvailable = depositMetaTransactionsEnabled && this.props.biconomy && this.state.actionProxyContract[this.state.action];
    const useMetaTx = metaTransactionsAvailable && this.state.metaTransactionsEnabled;

    const erc20ForwarderEnabled = depositErc20ForwarderEnabled && Object.keys(depositErc20ForwarderEnabledTokens).includes(this.props.selectedToken) && depositErc20ForwarderEnabledTokens[this.props.selectedToken].enabled && this.props.biconomy && this.props.erc20ForwarderClient && this.state.actionProxyContract[this.state.action] && !isDepositDisabled;

    // console.log(erc20ForwarderEnabled,depositErc20ForwarderEnabled,this.props.biconomy,this.props.erc20ForwarderClient,this.state.actionProxyContract[this.state.action]);
    // Biconomy End

    const totalBalance = this.state.action === 'deposit' ? this.props.tokenBalance : this.props.redeemableBalance;
    const migrateText = this.state.migrationEnabled && this.props.tokenConfig.migration.message !== undefined ? this.props.tokenConfig.migration.message : null;

    const curveConfig = this.functionsUtil.getGlobalConfig(['curve']);
    const curveTokenEnabled = curveConfig.enabled && this.functionsUtil.getGlobalConfig(['curve', 'availableTokens', this.props.tokenConfig.idle.token, 'enabled']);

    const depositCurve = curveTokenEnabled && this.state.depositCurveEnabled && this.state.action === 'deposit';

    const showDepositOptions = this.state.action === 'deposit' && !this.state.contractPaused && (curveTokenEnabled || this.state.tokenApproved);

    const showDepositCurve = showDepositOptions && curveTokenEnabled && this.state.componentMounted && (!this.state.migrationEnabled || this.state.skipMigration) && this.state.canDepositCurve && this.state.action === 'deposit';
    const showRedeemCurve = curveTokenEnabled && this.state.componentMounted && (!this.state.migrationEnabled || this.state.skipMigration) && this.state.canRedeemCurve && this.state.action === 'redeem';

    const showCurveSlippage = depositCurve && this.state.depositCurveSlippage && this.state.depositCurveBalance && !this.state.buttonDisabled;

    const showRebalanceOption = false && this.state.canDeposit && skipMintCheckboxEnabled && this.state.action === 'deposit';
    const showAdvancedDepositOptions = showDepositCurve || showRebalanceOption;

    const batchDepositInfo = this.functionsUtil.getGlobalConfig(['tools','batchDeposit']);

    const batchDepositEnabled = batchDepositInfo.enabled && typeof batchDepositInfo.props.availableTokens[this.props.tokenConfig.idle.token] !== 'undefined' && batchDepositInfo.availableNetworks.includes(currentNetwork.id);
    
    const batchDepositDepositEnabled = batchDepositInfo.depositEnabled;

    const showBatchDeposit = !useMetaTx && batchDepositEnabled && batchDepositDepositEnabled && !this.props.isMigrationTool && this.state.action === 'deposit';

    const ethWrapperInfo = this.functionsUtil.getGlobalConfig(['tools', 'ethWrapper']);
    const ETHWrapperComponent = ethWrapperInfo.subComponent;
    const showETHWrapper = this.props.selectedToken === 'WETH' && ethWrapperInfo.enabled && ethWrapperInfo.availableNetworks.includes(currentNetwork.id) && !this.props.isMigrationTool && this.state.action === 'deposit';

    const polygonBridgeInfo = this.functionsUtil.getGlobalConfig(['tools','polygonBridge']);
    // const PolygonBridgeComponent = polygonBridgeInfo.subComponent;
    const polygonNetworkId = this.functionsUtil.getGlobalConfig(['network','providers','polygon','networkPairs',currentNetwork.id]);
    // const polygonNetwork = this.functionsUtil.getGlobalConfig(['network','availableNetworks',polygonNetworkId]);

    const canPerformAction = /*!depositCurve && !this.state.redeemCurveEnabled && */((this.state.action === 'deposit' && this.state.canDeposit && !isDepositDisabled) || (this.state.action === 'redeem' && this.state.canRedeem) || redeemGovTokens) && (!this.state.showETHWrapperEnabled || this.state.action === 'redeem') && (!this.state.showPolygonBridgeEnabled || this.state.action === 'redeem');
    const showActionFlow = !redeemGovTokens && canPerformAction;

    const showBuyFlow = this.state.componentMounted && currentNetwork.provider === 'infura' && (!showDepositCurve || this.state.showBuyFlow) && !this.state.depositCurveEnabled && this.state.tokenApproved && !this.state.contractPaused && (!this.state.migrationEnabled || this.state.skipMigration) && this.state.action === 'deposit' && !isDepositDisabled && !this.state.canDeposit && !this.state.showETHWrapperEnabled;
    const showPolygonBridge = this.state.componentMounted && this.state.action === 'deposit' && !this.state.canDeposit && currentNetwork.provider === 'polygon';
    const showPolygonBridgeBanner = !showPolygonBridge && currentNetwork.provider === 'polygon' && polygonNetworkId && polygonBridgeInfo.enabled && this.state.action === 'deposit';

    const buyToken = this.functionsUtil.BNify(this.props.accountBalance).gt(0) ? this.props.selectedToken : this.functionsUtil.getBaseToken();

    const _referral = this.getReferralAddress();
    const showReferral = _referral && this.state.action === 'deposit' && showActionFlow && !showBuyFlow;

    return (
      <Flex
        width={1}
        alignItems={'center'}
        flexDirection={'column'}
        justifyContent={'center'}
      >
        <Flex
          width={[1, 0.36]}
          alignItems={'stretch'}
          flexDirection={'column'}
          justifyContent={'center'}
        >
          <Box
            width={1}
          >
            <Text mb={1}>
              Select your asset:
            </Text>
            <AssetSelector
              {...this.props}
            />
          </Box>
          {
            viewOnly ? (
              <IconBox
                cardProps={{
                  mt: 3
                }}
                icon={'Visibility'}
                text={'You are using Idle in "Read-Only" mode.<br />Logout and connect with your wallet to interact.'}
              />
            ) : (
                <Migrate
                  {...this.props}
                  migrateTextBefore={migrateText}
                  migrateText={migrateText !== null ? '' : null}
                  toggleSkipMigration={this.toggleSkipMigration.bind(this)}
                >
                  {
                    !this.props.account ? (
                      <ConnectBox
                        {...this.props}
                      />
                    ) : this.state.componentMounted ? (
                      this.state.action && (
                        <Box
                          width={1}
                        >
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
                                  p: 3,
                                  width: 0.48,
                                  onMouseDown: () => {
                                    this.setAction('deposit');
                                  }
                                }}
                                isInteractive={true}
                                isActive={this.state.action === 'deposit'}

                              >
                                <Flex
                                  my={1}
                                  alignItems={'center'}
                                  flexDirection={'row'}
                                  justifyContent={'center'}
                                >
                                  <TransactionField
                                    transaction={{
                                      action: 'deposit'
                                    }}
                                    fieldInfo={{
                                      name: 'icon',
                                      props: {
                                        mr: 3
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
                                  p: 3,
                                  width: 0.48,
                                  onMouseDown: () => {
                                    this.setAction('redeem');
                                  }
                                }}
                                isInteractive={true}
                                isActive={this.state.action === 'redeem'}
                                isDisabled={!this.state.canRedeem && !this.state.canRedeemCurve}
                              >
                                <Flex
                                  my={1}
                                  alignItems={'center'}
                                  flexDirection={'row'}
                                  justifyContent={'center'}
                                >
                                  <TransactionField
                                    transaction={{
                                      action: 'redeem'
                                    }}
                                    fieldInfo={{
                                      name: 'icon',
                                      props: {
                                        mr: 3
                                      }
                                    }}
                                  />
                                  <Text
                                    fontSize={3}
                                    fontWeight={3}
                                  >
                                    Redeem
                                </Text>
                                </Flex>
                              </DashboardCard>
                            </Flex>
                            {
                              isDepositDisabled && (
                                <IconBox
                                  cardProps={{
                                    mt: 3
                                  }}
                                  iconProps={{
                                    color:'#ffe000'
                                  }}
                                  icon={'Warning'}
                                  text={depositDisabledMessage}
                                >
                                  {
                                    this.state.action === 'deposit' && this.state.canRedeem && (
                                      <RoundButton
                                        buttonProps={{
                                          mt:3,
                                          width:[1,1/2]
                                        }}
                                        handleClick={e => this.setAction('redeem')}
                                      >
                                        Redeem
                                      </RoundButton>
                                    )
                                  }
                                </IconBox>
                              )
                            }
                          </Flex>
                          {
                            (showRedeemFlow && this.state.unlentBalance) &&
                            <DashboardCard
                              cardProps={{
                                py: 2,
                                px: 2,
                                mt: 3,
                                display: 'flex',
                                alignItems: 'center',
                                flexDirection: 'column',
                                justifyContent: 'center',
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
                                  name={'LocalGasStation'}
                                />
                                <Text
                                  px={2}
                                  fontSize={1}
                                  color={'cellText'}
                                  textAlign={'center'}
                                >
                                  Available balance for Cheap Redeem
                                </Text>
                                <Flex
                                  alignItems={'center'}
                                  flexDirection={'row'}
                                >
                                  <Text
                                    fontSize={1}
                                    fontWeight={3}
                                    color={'dark-gray'}
                                    textAlign={'center'}
                                    hoverColor={'copyColor'}
                                  >
                                    {this.state.unlentBalance.toFixed(4)} {this.props.selectedToken}
                                  </Text>
                                  <Tooltip
                                    placement={'top'}
                                    message={this.functionsUtil.getGlobalConfig(['messages', 'cheapRedeem'])}
                                  >
                                    <Icon
                                      ml={1}
                                      size={'1em'}
                                      color={'cellTitle'}
                                      name={"InfoOutline"}
                                    />
                                  </Tooltip>
                                </Flex>
                              </Flex>
                            </DashboardCard>
                          }
                          {
                            showAdvancedRedeemOptions ? (
                              <DashboardCard
                                cardProps={{
                                  pt: 2,
                                  px: 2,
                                  mt: 3,
                                  display: 'flex',
                                  alignItems: 'center',
                                  flexDirection: 'column',
                                  justifyContent: 'center',
                                  pb: this.state.showAdvancedOptions ? 3 : 2,
                                }}
                              >
                                <Flex
                                  width={1}
                                  alignItems={'center'}
                                  flexDirection={'row'}
                                  justifyContent={'center'}
                                >
                                  <Link
                                    ml={1}
                                    mainColor={'primary'}
                                    hoverColor={'primary'}
                                    onClick={this.toggleShowAdvancedOptions}
                                  >
                                    {this.state.showAdvancedOptions ? 'Hide' : 'Show'} advanced options
                                </Link>
                                  <Icon
                                    size={'1.8em'}
                                    color={'cellText'}
                                    name={this.state.showAdvancedOptions ? 'ArrowDropUp' : 'ArrowDropDown'}
                                  />
                                </Flex>
                                {
                                  this.state.showAdvancedOptions &&
                                  <Flex
                                    mt={1}
                                    flexDirection={'column'}
                                  >
                                    {
                                      redeemGovTokenEnabled &&
                                      <Flex
                                        alignItems={'center'}
                                        justifyContent={'row'}
                                      >
                                        <Checkbox
                                          required={false}
                                          checked={this.state.redeemGovTokens}
                                          label={`Redeem governance tokens only`}
                                          onChange={e => this.toggleRedeemGovTokens(e.target.checked)}
                                        />
                                        <Link
                                          color={'link'}
                                          hoverColor={'link'}
                                          onClick={e => this.props.openTooltipModal('Redeem governance tokens', `This feature allows you to redeem just the amount of governance tokens accrued${this.props.govTokensBalance && this.props.govTokensBalance.gt(0) ? ` (~${this.props.govTokensBalance.toFixed(2)}$)` : null} without redeeming the underlying token.`)}
                                        >
                                          (read more)
                                          </Link>
                                      </Flex>
                                    }
                                    {
                                      redeemSkipGovEnabled &&
                                      <Flex
                                        alignItems={'center'}
                                        flexDirection={'row'}
                                      >
                                        <Checkbox
                                          required={false}
                                          checked={this.state.redeemSkipGov}
                                          label={`Redeem without governance tokens`}
                                          onChange={e => this.toggleRedeemSkipGov(e.target.checked)}
                                        />
                                        <Icon
                                          mr={1}
                                          size={'1.2em'}
                                          name={'Warning'}
                                          color={'#ffe000'}
                                        />
                                        <Link
                                          color={'link'}
                                          hoverColor={'link'}
                                          onClick={e => this.props.openTooltipModal('Redeem without governance tokens', this.functionsUtil.getGlobalConfig(['messages', 'redeemSkipGov']))}
                                        >
                                          (read more)
                                          </Link>
                                      </Flex>
                                    }
                                  </Flex>
                                }
                              </DashboardCard>
                            ) : showAdvancedDepositOptions ? (
                              <DashboardCard
                                cardProps={{
                                  pt: 2,
                                  px: 2,
                                  mt: 3,
                                  display: 'flex',
                                  alignItems: 'center',
                                  flexDirection: 'column',
                                  justifyContent: 'center',
                                  pb: this.state.showAdvancedOptions ? 3 : 2,
                                }}
                              >
                                <Flex
                                  width={1}
                                  alignItems={'center'}
                                  flexDirection={'row'}
                                  justifyContent={'center'}
                                >
                                  <Link
                                    ml={1}
                                    mainColor={'primary'}
                                    hoverColor={'primary'}
                                    onClick={this.toggleShowAdvancedOptions}
                                  >
                                    {this.state.showAdvancedOptions ? 'Hide' : 'Show'} advanced options
                                </Link>
                                  <Icon
                                    size={'1.8em'}
                                    color={'cellText'}
                                    name={this.state.showAdvancedOptions ? 'ArrowDropUp' : 'ArrowDropDown'}
                                  />
                                </Flex>
                                {
                                  this.state.showAdvancedOptions &&
                                  <Flex
                                    mt={1}
                                    flexDirection={'column'}
                                  >
                                    {
                                      showDepositCurve &&
                                      <Flex
                                        alignItems={'center'}
                                        justifyContent={'row'}
                                      >
                                        <Checkbox
                                          required={false}
                                          disabled={this.state.directMint}
                                          label={`Deposit in the Curve Pool`}
                                          checked={this.state.depositCurveEnabled}
                                          onChange={e => this.toggleDepositCurve(e.target.checked)}
                                        />
                                        <Link
                                          mainColor={'primary'}
                                          hoverColor={'primary'}
                                          onClick={e => this.props.openTooltipModal('How Curve works', this.functionsUtil.getGlobalConfig(['messages', 'curveInstructions']))}
                                        >
                                          (read more)
                                          </Link>
                                      </Flex>
                                    }
                                    {
                                      showRebalanceOption &&
                                      <Flex
                                        alignItems={'center'}
                                        justifyContent={'row'}
                                      >
                                        <Checkbox
                                          required={false}
                                          label={`Rebalance the pool`}
                                          checked={this.state.directMint}
                                          disabled={this.state.depositCurveEnabled}
                                          onChange={e => this.toggleSkipMint(e.target.checked)}
                                        />
                                        <Tooltip
                                          placement={'bottom'}
                                          message={this.functionsUtil.getGlobalConfig(['messages', 'directMint'])}
                                        >
                                          <Icon
                                            size={'1em'}
                                            color={'cellTitle'}
                                            name={"InfoOutline"}
                                          />
                                        </Tooltip>
                                      </Flex>
                                    }
                                  </Flex>
                                }
                              </DashboardCard>
                            ) : (
                                  <Flex
                                    width={1}
                                    flexDirection={'column'}
                                  >
                                    {
                                      showDepositCurve && (
                                        <Flex
                                          width={1}
                                          flexDirection={'column'}
                                          justifyContent={'center'}
                                        >
                                          <DashboardCard
                                            isRainbow={true}
                                            cardProps={{
                                              py: 3,
                                              px: 2,
                                              mt: 3,
                                              display: 'flex',
                                              alignItems: 'center',
                                              flexDirection: 'column',
                                              justifyContent: 'center',
                                            }}
                                          >
                                            <Flex
                                              width={1}
                                              alignItems={'center'}
                                              flexDirection={'column'}
                                              justifyContent={'center'}
                                            >
                                              <Image
                                                height={'1.8em'}
                                                src={curveConfig.params.image}
                                              />
                                              <Text
                                                mt={2}
                                                px={2}
                                                fontSize={1}
                                                color={'dark-gray'}
                                                textAlign={'center'}
                                              >
                                                Deposit your tokens in the Curve Pool and boost your APY up to {this.state.curveAPY ? this.state.curveAPY.toFixed(2) : '-'}%.
                                          <Link
                                                  ml={1}
                                                  mainColor={'primary'}
                                                  hoverColor={'primary'}
                                                  onClick={e => this.props.openTooltipModal('How Curve works', this.functionsUtil.getGlobalConfig(['messages', 'curveInstructions']))}
                                                >
                                                  Read More
                                          </Link>
                                              </Text>
                                              <Checkbox
                                                mt={2}
                                                required={false}
                                                label={`Deposit in Curve`}
                                                checked={this.state.depositCurveEnabled}
                                                onChange={e => this.toggleDepositCurve(e.target.checked)}
                                              />
                                            </Flex>
                                          </DashboardCard>
                                          {
                                            (!this.state.showBuyFlow && !this.state.depositCurveEnabled && !this.state.canDeposit) &&
                                            <Link
                                              textAlign={'center'}
                                              hoverColor={'primary'}
                                              onClick={e => this.setShowBuyFlow(true)}
                                            >
                                              I just want to deposit more {this.props.selectedToken}
                                            </Link>
                                          }
                                        </Flex>
                                      )
                                    }
                                    {
                                      showRebalanceOption && (
                                        <DashboardCard
                                          cardProps={{
                                            py: 3,
                                            px: 2,
                                            mt: 3,
                                            display: 'flex',
                                            alignItems: 'center',
                                            flexDirection: 'column',
                                            justifyContent: 'center',
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
                                              name={'InfoOutline'}
                                            />
                                            <Text
                                              mt={1}
                                              px={2}
                                              fontSize={1}
                                              color={'cellText'}
                                              textAlign={'center'}
                                            >
                                              By checking this flag you can rebalance the pool and help all users gain an additional APR
                                      </Text>
                                          </Flex>
                                          <Checkbox
                                            mt={2}
                                            required={false}
                                            label={`Rebalance the pool`}
                                            checked={this.state.directMint}
                                            onChange={e => this.toggleSkipMint(e.target.checked)}
                                          />
                                        </DashboardCard>
                                      )
                                    }
                                    {
                                      redeemGovTokenEnabled && (
                                        <DashboardCard
                                          cardProps={{
                                            py: 3,
                                            px: 2,
                                            mt: 3,
                                            display: 'flex',
                                            alignItems: 'center',
                                            flexDirection: 'column',
                                            justifyContent: 'center',
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
                                              name={'InfoOutline'}
                                            />
                                            <Text
                                              mt={1}
                                              px={2}
                                              fontSize={1}
                                              color={'cellText'}
                                              textAlign={'center'}
                                            >
                                              By redeeming your {this.props.selectedToken} you will automatically get also the proportional amount of governance tokens accrued{this.props.govTokensBalance && this.props.govTokensBalance.gt(0) ? ` (~ $${this.props.govTokensBalance.toFixed(2)})` : null}.
                                      </Text>
                                          </Flex>
                                          <Checkbox
                                            mt={2}
                                            required={false}
                                            checked={this.state.redeemGovTokens}
                                            label={`Redeem governance tokens only`}
                                            onChange={e => this.toggleRedeemGovTokens(e.target.checked)}
                                          />
                                        </DashboardCard>
                                      )
                                    }
                                  </Flex>
                                )
                          }
                          {
                            redeemSkipGov ? (
                              <DashboardCard
                                cardProps={{
                                  mt: 2,
                                  mb: 2,
                                  py: 2,
                                  px: 1
                                }}
                              >
                                <Flex
                                  alignItems={'center'}
                                  flexDirection={'column'}
                                >
                                  <Text
                                    mt={1}
                                    fontSize={2}
                                    color={'cellText'}
                                    textAlign={'center'}
                                  >
                                    Select the gov tokens you want to give away:
                                </Text>
                                  <Flex
                                    mt={2}
                                    width={1}
                                    boxShadow={0}
                                    style={{
                                      flexWrap: 'wrap'
                                    }}
                                    alignItems={'center'}
                                    justifyContent={'center'}
                                  >
                                    {
                                      Object.keys(this.props.govTokensUserBalances).map(token => {
                                        const balance = this.props.govTokensUserBalances[token];
                                        const isActive = this.state.redeemSkipGovTokens.includes(token);
                                        const tokenConfig = this.functionsUtil.getGlobalConfig(['govTokens', token]);
                                        return (
                                          <Flex
                                            p={2}
                                            mb={1}
                                            mx={1}
                                            width={'auto'}
                                            style={{
                                              cursor: 'pointer'
                                            }}
                                            borderRadius={2}
                                            flexDirection={'row'}
                                            key={`skipGovToken_${token}`}
                                            justifyContent={'flex-start'}
                                            backgroundColor={isActive ? '#2a4b78' : 'cardBgHover'}
                                            onClick={e => this.setRedeemSkipGovTokens(token, !this.state.redeemSkipGovTokens.includes(token))}
                                          >
                                            <Checkbox
                                              m={0}
                                              required={false}
                                              checked={isActive}
                                              onChange={e => this.setRedeemSkipGovTokens(token, e.target.checked)}
                                            />
                                            <AssetField
                                              token={token}
                                              tokenConfig={tokenConfig}
                                              fieldInfo={{
                                                name: 'icon',
                                                props: {
                                                  mr: 1,
                                                  width: ['1.4em', '1.6em'],
                                                  height: ['1.4em', '1.6em']
                                                }
                                              }}
                                            />
                                            <SmartNumber
                                              ml={1}
                                              fontSize={[0, 2]}
                                              fontWeight={500}
                                              maxPrecision={4}
                                              color={'cellText'}
                                              number={balance.toString()}
                                            />
                                          </Flex>
                                        );
                                      })
                                    }
                                  </Flex>
                                </Flex>
                              </DashboardCard>
                            ) : redeemSkipGovNoTokens && (
                              <DashboardCard
                                cardProps={{
                                  p: 2,
                                  my: 2
                                }}
                              >
                                <Flex
                                  alignItems={'center'}
                                  flexDirection={'column'}
                                  justifyContent={'center'}
                                >
                                  <Icon
                                    size={'1.8em'}
                                    name={'MoneyOff'}
                                    color={'cellText'}
                                  />
                                  <Text
                                    mt={1}
                                    fontSize={1}
                                    color={'cellText'}
                                    textAlign={'center'}
                                  >
                                    You don't have any gov tokens to give away.
                                </Text>
                                </Flex>
                              </DashboardCard>
                            )
                          }
                          {
                            redeemSkipGov && this.functionsUtil.BNify(this.state.skippedGovTokensBalance).gt(0) ? (
                              <DashboardCard
                                cardProps={{
                                  p: 2,
                                  my: 2
                                }}
                              >
                                <Flex
                                  alignItems={'center'}
                                  flexDirection={'column'}
                                  justifyContent={'center'}
                                >
                                  <Icon
                                    size={'1.8em'}
                                    name={'Warning'}
                                    color={'#ffe000'}
                                  />
                                  <Text
                                    mt={1}
                                    fontSize={1}
                                    color={'red'}
                                    textAlign={'center'}
                                  >
                                    You are giving away {this.functionsUtil.formatMoney(this.state.skippedGovTokensBalance)}$ worth of governance tokens!
                                </Text>
                                  {
                                    this.state.skipGovTokensGasSave && this.state.skipGovTokensGasSave.gte(0.0001) && (
                                      <Text
                                        mt={1}
                                        fontSize={1}
                                        color={'#00b84a'}
                                        textAlign={'center'}
                                      >
                                        This will save you {this.state.skipGovTokensGasSave.toFixed(4)} ETH of gas (~{this.state.skipGovTokensGasSaveUSD.toFixed(2)}$)
                                    </Text>
                                    )
                                  }
                                  <Text
                                    mt={1}
                                    fontSize={1}
                                    color={'cellText'}
                                    textAlign={'center'}
                                  >
                                    To proceed with the redeem please give your authorization by checking the following flag:
                                </Text>
                                  <Checkbox
                                    my={1}
                                    required={false}
                                    checked={this.state.agreeSkipGovTokens}
                                    label={`I agree to give away my governance tokens`}
                                    onChange={e => this.toggleAgreeSkipGovTokens(e.target.checked)}
                                  />
                                </Flex>
                              </DashboardCard>
                            ) : redeemSkipGov && this.state.redeemSkipGovTokens.length > 0 && (
                              <DashboardCard
                                cardProps={{
                                  p: 3,
                                  my: 2
                                }}
                              >
                                <FlexLoader
                                  flexProps={{
                                    flexDirection: 'row'
                                  }}
                                  loaderProps={{
                                    size: '25px',
                                  }}
                                  textProps={{
                                    ml: 2
                                  }}
                                  text={'Loading estimated gas usage...'}
                                />
                              </DashboardCard>
                            )
                          }
                          {
                            showReferral && (
                              <DashboardCard
                                cardProps={{
                                  py: 3,
                                  px: 2,
                                  mt: 3,
                                  display: 'flex',
                                  alignItems: 'center',
                                  flexDirection: 'column',
                                  justifyContent: 'center',
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
                                    name={'Share'}
                                    color={'cellText'}
                                  />
                                  <Text
                                    mt={1}
                                    px={2}
                                    fontSize={1}
                                    color={'cellText'}
                                    textAlign={'center'}
                                  >
                                    You are depositing with the following referral address:
                                </Text>
                                  <Text
                                    mt={1}
                                    px={2}
                                    fontSize={1}
                                    fontWeight={500}
                                    textAlign={'center'}
                                    color={this.props.theme.colors.transactions.status.completed}
                                  >
                                    {_referral}
                                  </Text>
                                </Flex>
                              </DashboardCard>
                            )
                          }
                          {
                            (metaTransactionsAvailable && !showBuyFlow && !this.state.contractPaused) ? (
                              <DashboardCard
                                cardProps={{
                                  py: 3,
                                  px: 2,
                                  my: 3,
                                  display: 'flex',
                                  alignItems: 'center',
                                  flexDirection: 'column',
                                  justifyContent: 'center',
                                }}
                              >
                                {
                                  this.state.metaTransactionsEnabled && this.state.txError[this.state.action] && this.state.actionProxyContract[this.state.action].approved ? (
                                    <Flex
                                      width={1}
                                      alignItems={'center'}
                                      flexDirection={'column'}
                                      justifyContent={'center'}
                                    >
                                      <Icon
                                        size={'1.8em'}
                                        name={'Warning'}
                                        color={'cellText'}
                                      />
                                      <Text
                                        mt={1}
                                        fontSize={1}
                                        color={'cellText'}
                                        textAlign={'center'}
                                      >
                                        Seems like you are having some trouble with Meta-Transactions... Disable them by unchecking the box below and try again!
                                    </Text>
                                    </Flex>
                                  ) : this.functionsUtil.getWalletProvider() === 'WalletConnect' && this.state.metaTransactionsEnabled ? (
                                    <Flex
                                      width={1}
                                      alignItems={'center'}
                                      flexDirection={'column'}
                                      justifyContent={'center'}
                                    >
                                      <Icon
                                        size={'1.8em'}
                                        name={'Warning'}
                                        color={'cellText'}
                                      />
                                      <Text
                                        mt={1}
                                        fontSize={1}
                                        color={'cellText'}
                                        textAlign={'center'}
                                      >
                                        Please disable Meta-Transactions if you are using Argent Wallet to avoid failed transactions!
                                    </Text>
                                    </Flex>
                                  ) : (
                                        <Text
                                          mt={1}
                                          fontSize={1}
                                          color={'cellText'}
                                          textAlign={'center'}
                                        >
                                          Meta-Transactions are {this.state.metaTransactionsEnabled ? 'enabled' : 'disabled'} for {this.state.action}s!<br />
                                          {
                                            this.state.metaTransactionsEnabled && !this.state.actionProxyContract[this.state.action].approved && `Please either enable the Smart-Contract to enjoy gas-less ${this.state.action} or just disable meta-tx.`
                                          }
                                        </Text>
                                      )
                                }
                                <Checkbox
                                  mt={2}
                                  required={false}
                                  checked={this.state.metaTransactionsEnabled}
                                  onChange={e => this.toggleMetaTransactionsEnabled(e.target.checked)}
                                  label={`${this.functionsUtil.capitalize(this.state.action)} with Meta-Transaction`}
                                />
                              </DashboardCard>
                            ) : (erc20ForwarderEnabled && !showBuyFlow && !this.state.contractPaused) && (
                              <DashboardCard
                                cardProps={{
                                  p: 3,
                                  my: 3,
                                  display: 'flex',
                                  alignItems: 'center',
                                  flexDirection: 'column',
                                  justifyContent: 'center',
                                }}
                              >
                                <Text
                                  mb={2}
                                  fontSize={2}
                                  color={'cellText'}
                                  textAlign={'center'}
                                >
                                  How do you prefer to pay gas fees for this {this.state.action}?
                                </Text>
                                <Flex
                                  width={[1, 0.7]}
                                  alignItems={'center'}
                                  flexDirection={'row'}
                                  justifyContent={'space-between'}
                                >
                                  <CardIconButton
                                    {...this.props}
                                    cardProps={{
                                      py: 2,
                                      px: [2, 3],
                                      width: 0.48
                                    }}
                                    textProps={{
                                      ml: [1, 2],
                                    }}
                                    text={this.props.selectedToken}
                                    isActive={this.state.erc20ForwarderEnabled}
                                    imageProps={{
                                      height: this.props.isMobile ? '1.4em' : '1.8em',
                                      width: this.props.isMobile ? '1.4em' : '1.8em'
                                    }}
                                    image={`/images/tokens/${this.props.selectedToken}.svg`}
                                    handleClick={e => this.toggleErc20ForwarderEnabled(true)}
                                  />
                                  <CardIconButton
                                    {...this.props}
                                    cardProps={{
                                      py: 2,
                                      px: [2, 3],
                                      width: 0.48
                                    }}
                                    textProps={{
                                      ml: [1, 2],
                                    }}
                                    text={'ETH'}
                                    isActive={!this.state.erc20ForwarderEnabled}
                                    imageProps={{
                                      height: this.props.isMobile ? '1.4em' : '1.8em',
                                      width: this.props.isMobile ? '1.4em' : '1.8em'
                                    }}
                                    image={`/images/tokens/ETH.svg`}
                                    handleClick={e => this.toggleErc20ForwarderEnabled(false)}
                                  />
                                </Flex>
                                {
                                  this.state.erc20ForwarderEnabled && this.state.txError[this.state.action] && (
                                    <Text
                                      mt={2}
                                      fontSize={1}
                                      color={'red'}
                                      textAlign={'center'}
                                    >
                                      The meta-transaction cannot be executed due to insufficient funds, fund your wallet or select ETH and try again.
                                  </Text>
                                  )
                                }
                                {
                                  /*
                                  <Text
                                    mt={2}
                                    fontSize={'11px'}
                                    color={'cellText'}
                                    textAlign={'center'}
                                  >
                                    Powered by <ExtLink fontSize={'11px'} href={'https://biconomy.io'}>Biconomy</ExtLink>
                                  </Text>
                                  */
                                }
                              </DashboardCard>
                            )
                          }
                          {
                            (this.state.minAmountForMintReached && this.state.action === 'deposit') && (
                              <DashboardCard
                                cardProps={{
                                  p: 3,
                                  mt: 3
                                }}
                              >
                                <Flex
                                  alignItems={'center'}
                                  flexDirection={'column'}
                                >
                                  <Icon
                                    size={'1.8em'}
                                    color={'cellText'}
                                    name={'InfoOutline'}
                                  />
                                  <Text
                                    mt={1}
                                    fontSize={2}
                                    color={'cellText'}
                                    textAlign={'center'}
                                  >
                                    By depositing more than {this.functionsUtil.formatMoney(this.state.minAmountForMint)}$ {this.state.showPoolPerc ? `(${this.state.minAmountForMint.div(this.state.totalAUM).times(100).toFixed(0)}% of the pool)` : null} the pool will be automatically rebalanced, gas cost may be higher.
                                </Text>
                                </Flex>
                              </DashboardCard>
                            )
                          }
                          {
                            showBatchDeposit ? (
                              <Flex
                                p={2}
                                mt={3}
                                width={1}
                                borderRadius={2}
                                alignItems={'center'}
                                flexDirection={'row'}
                                justifyContent={'center'}
                                backgroundColor={'DashboardCard'}
                                border={`1px solid ${this.props.theme.colors.primary}`}
                              >
                                <Link
                                  textAlign={'center'}
                                  hoverColor={'primary'}
                                  href={`/#/dashboard/tools/${batchDepositInfo.route}/${this.props.tokenConfig.idle.token}`}
                                >
                                  Gas fees too high? Save gas with our Batch Deposit!
                                </Link>
                                <Icon
                                  ml={1}
                                  size={'1em'}
                                  color={'primary'}
                                  name={'LocalGasStation'}
                                />
                              </Flex>
                            ) : showETHWrapper ? (
                              <Flex
                                width={1}
                                alignItems={'center'}
                                flexDirection={'column'}
                                justifyContent={'center'}
                              >
                                <DashboardCard
                                  cardProps={{
                                    py: 3,
                                    px: 2,
                                    mt: 3,
                                    display: 'flex',
                                    alignItems: 'center',
                                    flexDirection: 'column',
                                    justifyContent: 'center',
                                    pb: this.state.showAdvancedOptions ? 3 : 2,
                                  }}
                                >
                                  <Flex
                                    alignItems={'center'}
                                    justifyContent={'row'}
                                  >
                                    <Checkbox
                                      required={false}
                                      checked={this.state.showETHWrapperEnabled}
                                      label={`Convert your ETH to WETH`}
                                      onChange={e => this.toggleShowETHWrapper(e.target.checked)}
                                    />
                                  </Flex>
                                </DashboardCard>
                                {
                                  this.state.showETHWrapperEnabled &&
                                  <ETHWrapperComponent
                                    {...this.props}
                                    action={'wrap'}
                                    fullWidth={true}
                                    toolProps={ethWrapperInfo.props}
                                  />
                                }
                              </Flex>
                            ) : showPolygonBridgeBanner && (
                              <Flex
                                p={2}
                                mt={3}
                                width={1}
                                borderRadius={2}
                                alignItems={'center'}
                                flexDirection={'column'}
                                justifyContent={'center'}
                                backgroundColor={'DashboardCard'}
                                border={`1px solid ${this.props.theme.colors.primary}`}
                              >
                                <Image
                                  height={'1.2em'}
                                  src={polygonBridgeInfo.image}
                                />
                                <Flex
                                  width={1}
                                  alignItems={'center'}
                                  flexDirection={'row'}
                                  justifyContent={'center'}
                                >
                                  <Link
                                    textAlign={'center'}
                                    hoverColor={'primary'}
                                    href={`/#/dashboard/tools/${polygonBridgeInfo.route}/${this.props.selectedToken}`}
                                  >
                                    Use the {polygonBridgeInfo.label} to deposit your {this.props.selectedToken}
                                  </Link>
                                  <Icon
                                    ml={1}
                                    size={'1em'}
                                    color={'primary'}
                                    name={'ArrowForward'}
                                  />
                                </Flex>
                              </Flex>
                            )
                          }
                          {
                            showRedeemCurve && this.state.canRedeem && (
                              <Flex
                                width={1}
                                flexDirection={'column'}
                                justifyContent={'center'}
                              >
                                <DashboardCard
                                  isRainbow={true}
                                  cardProps={{
                                    py: 3,
                                    px: 2,
                                    mt: 3,
                                    display: 'flex',
                                    alignItems: 'center',
                                    flexDirection: 'column',
                                    justifyContent: 'center',
                                  }}
                                >
                                  <Flex
                                    width={1}
                                    alignItems={'center'}
                                    flexDirection={'column'}
                                    justifyContent={'center'}
                                  >
                                    <Image
                                      height={'1.8em'}
                                      src={curveConfig.params.image}
                                    />
                                    <Text
                                      mt={2}
                                      px={2}
                                      fontSize={1}
                                      color={'dark-gray'}
                                      textAlign={'center'}
                                    >
                                      Redeem your tokens from the Curve Pool.
                                    <Link
                                        ml={1}
                                        mainColor={'primary'}
                                        hoverColor={'primary'}
                                        onClick={e => this.props.openTooltipModal('How Curve works', this.functionsUtil.getGlobalConfig(['messages', 'curveInstructions']))}
                                      >
                                        Read More
                                    </Link>
                                    </Text>
                                    {
                                      this.state.canRedeem &&
                                      <Checkbox
                                        mt={2}
                                        required={false}
                                        label={`Redeem from Curve`}
                                        checked={this.state.redeemCurveEnabled}
                                        onChange={e => this.toggleRedeemCurve(e.target.checked)}
                                      />
                                    }
                                  </Flex>
                                </DashboardCard>
                                {
                                  this.canRedeem &&
                                  <Link
                                    textAlign={'center'}
                                    hoverColor={'primary'}
                                    onClick={e => this.setShowRedeemFlow(true)}
                                  >
                                    I just want to redeem my {this.props.selectedToken}
                                  </Link>
                                }
                              </Flex>
                            )
                          }
                          {
                            (this.state.contractPaused && this.state.action === 'deposit') ? (
                              <DashboardCard
                                cardProps={{
                                  p: 3,
                                  mt: 3
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
                                    Deposits for {this.props.selectedToken} are temporarily unavailable due to Smart-Contract maintenance. Redeems are always available.
                                </Text>
                                </Flex>
                              </DashboardCard>
                            ) : (!this.state.tokenApproved && this.state.action === 'deposit' && !this.state.showETHWrapperEnabled && !isDepositDisabled) ? (
                              <DashboardCard
                                isDisabled={isDepositDisabled}
                                cardProps={{
                                  p: 3,
                                  mt: 3
                                }}
                              >
                                {
                                  this.state.processing['approve'] && this.state.processing['approve'].loading ? (
                                    <Flex
                                      flexDirection={'column'}
                                    >
                                      <TxProgressBar
                                        {...this.props}
                                        waitText={`Approve estimated in`}
                                        endMessage={`Finalizing approve request...`}
                                        hash={this.state.processing['approve'].txHash}
                                        cancelTransaction={this.cancelTransaction.bind(this)}
                                      />
                                    </Flex>
                                  ) : (
                                    <Flex
                                      alignItems={'center'}
                                      flexDirection={'column'}
                                    >
                                      <Icon
                                        size={'1.8em'}
                                        name={'LockOpen'}
                                        color={'cellText'}
                                      />
                                      <Text
                                        mt={3}
                                        fontSize={2}
                                        color={'cellText'}
                                        textAlign={'center'}
                                      >
                                        {
                                          this.state.depositCurveEnabled ?
                                            `To ${this.functionsUtil.capitalize(this.state.action)} your ${this.props.selectedToken} in the Curve Pool you need to approve the Smart-Contract first.`
                                            : useMetaTx ?
                                              `To ${this.functionsUtil.capitalize(this.state.action)} your ${this.props.selectedToken} into Idle using Meta-Transaction you need to approve our Smart-Contract first.`
                                              :
                                              `To ${this.functionsUtil.capitalize(this.state.action)} your ${this.props.selectedToken} into Idle you need to approve our Smart-Contract first.`
                                        }
                                      </Text>
                                      <RoundButton
                                        buttonProps={{
                                          mt: 3,
                                          width: [1, 1 / 2]
                                        }}
                                        handleClick={this.approveToken.bind(this)}
                                      >
                                        Approve
                                      </RoundButton>
                                    </Flex>
                                  )
                                }
                              </DashboardCard>
                            ) : (!showBuyFlow && canPerformAction) && (
                              !this.state.processing[this.state.action].loading ? (
                                <Flex
                                  mt={2}
                                  flexDirection={'column'}
                                >
                                  {
                                    showActionFlow && (
                                      <Flex
                                        mb={3}
                                        width={1}
                                        flexDirection={'column'}
                                      >
                                        {
                                          (totalBalance || this.props.tokenFeesPercentage) && (
                                            <Box
                                              mb={1}
                                              width={1}
                                            >
                                              {
                                                this.state.showMaxSlippage && showCurveSlippage && (
                                                  <Box
                                                    mb={2}
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
                                                        [0.2, 0.5, 1, 5].map(slippage => (
                                                          <FastBalanceSelector
                                                            cardProps={{
                                                              p: 1
                                                            }}
                                                            textProps={{
                                                              fontSize: 1
                                                            }}
                                                            percentage={slippage}
                                                            key={`selector_${slippage}`}
                                                            onMouseDown={() => this.setMaxSlippage(slippage)}
                                                            isActive={this.state.maxSlippage === parseFloat(slippage)}
                                                          />
                                                        ))
                                                      }
                                                    </Flex>
                                                  </Box>
                                                )
                                              }
                                              <Flex
                                                width={1}
                                                alignItems={'center'}
                                                flexDirection={'row'}
                                                justifyContent={'space-between'}
                                              >
                                                {
                                                  showCurveSlippage ? (
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
                                                          whiteSpace: 'nowrap'
                                                        }}
                                                        color={this.state.depositCurveSlippage.gt(0) ? this.props.theme.colors.transactions.status.failed : this.props.theme.colors.transactions.status.completed}
                                                      >
                                                        {
                                                          parseFloat(this.state.depositCurveSlippage.times(100).toFixed(2)) === 0 ?
                                                            'No Slippage'
                                                            : `${this.state.depositCurveSlippage.gt(0) ? 'Slippage: ' : 'Bonus: '} ${this.state.depositCurveSlippage.times(100).abs().toFixed(2)}%`
                                                        }
                                                      </Text>
                                                      <Tooltip
                                                        placement={'top'}
                                                        message={this.functionsUtil.getGlobalConfig(['messages', 'curveBonusSlippage'])}
                                                      >
                                                        <Icon
                                                          ml={1}
                                                          size={'1em'}
                                                          color={'cellTitle'}
                                                          name={"InfoOutline"}
                                                        />
                                                      </Tooltip>
                                                      <Link
                                                        ml={1}
                                                        color={'copyColor'}
                                                        hoverColor={'primary'}
                                                        onClick={this.showMaxSlippage}
                                                      >
                                                        change
                                                    </Link>
                                                    </Flex>
                                                  ) : this.props.tokenFeesPercentage && (
                                                    <Flex
                                                      alignItems={'center'}
                                                      flexDirection={'row'}
                                                    >
                                                      <Text
                                                        fontSize={1}
                                                        fontWeight={3}
                                                        color={'dark-gray'}
                                                        textAlign={'right'}
                                                        hoverColor={'copyColor'}
                                                      >
                                                        Performance fee: {this.props.tokenFeesPercentage.times(100).toFixed(2)}%
                                                    </Text>
                                                      <Tooltip
                                                        placement={'top'}
                                                        message={this.functionsUtil.getGlobalConfig(['messages', 'performanceFee'])}
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
                                                  totalBalance && (
                                                    <Link
                                                      fontSize={1}
                                                      fontWeight={3}
                                                      color={'dark-gray'}
                                                      textAlign={'right'}
                                                      hoverColor={'copyColor'}
                                                      onClick={(e) => this.setFastBalanceSelector(100)}
                                                    >
                                                      {totalBalance.toFixed(6)} {this.props.selectedToken}
                                                    </Link>
                                                  )
                                                }
                                              </Flex>
                                            </Box>
                                          )
                                        }
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
                                          value={this.state.inputValue[this.state.action] !== null ? this.functionsUtil.BNify(this.state.inputValue[this.state.action]).toFixed() : ''}
                                        />
                                        <Flex
                                          mt={2}
                                          alignItems={'center'}
                                          flexDirection={'row'}
                                          justifyContent={'space-between'}
                                        >
                                          {
                                            [25, 50, 75, 100].map(percentage => (
                                              <FastBalanceSelector
                                                percentage={percentage}
                                                key={`selector_${percentage}`}
                                                onMouseDown={() => this.setFastBalanceSelector(percentage)}
                                                isActive={this.state.fastBalanceSelector[this.state.action] === parseInt(percentage)}
                                              />
                                            ))
                                          }
                                        </Flex>
                                      </Flex>
                                    )
                                  }
                                  {
                                    canPerformAction && (
                                      <Flex
                                        justifyContent={'center'}
                                        mt={redeemGovTokens ? 2 : 0}
                                      >
                                        <RoundButton
                                          buttonProps={{
                                            width: 'auto',
                                            minWidth: [1, 1 / 2],
                                            style: {
                                              textTransform: 'capitalize'
                                            },
                                            disabled: this.state.buttonDisabled
                                          }}
                                          handleClick={this.state.buttonDisabled ? null : this.executeAction.bind(this)}
                                        >
                                          {this.state.action}{redeemGovTokens ? ' Gov Tokens' : '' /*(depositCurve ? ' in Curve' : '')*/}
                                        </RoundButton>
                                      </Flex>
                                    )
                                  }
                                </Flex>
                              ) : this.state.loadingErc20ForwarderTx ? (
                                <Flex
                                  mt={3}
                                  flexDirection={'column'}
                                >
                                  <FlexLoader
                                    flexProps={{
                                      flexDirection: 'row'
                                    }}
                                    loaderProps={{
                                      size: '25px',
                                    }}
                                    textProps={{
                                      ml: 2
                                    }}
                                    text={this.state.erc20ForwarderTx ? (this.state.signedParameters ? 'Please Sign the Transaction...' : 'Please Sign the Permit...') : 'Calculating transaction fees...'}
                                  />
                                </Flex>
                              ) : this.state.erc20ForwarderTx ? (
                                <DashboardCard
                                  cardProps={{
                                    p: 3,
                                    mt: 3,
                                    display: 'flex',
                                    alignItems: 'center',
                                    flexDirection: 'column',
                                    justifyContent: 'center',
                                  }}
                                >
                                  <Text
                                    mb={2}
                                    fontSize={2}
                                    color={'cellText'}
                                    textAlign={'center'}
                                  >
                                    The required gas fee to perform the {this.state.action} is <strong>{this.state.erc20ForwarderTx.cost} {this.props.selectedToken}</strong>
                                  </Text>
                                  <Flex
                                    width={1}
                                    alignItems={'center'}
                                    flexDirection={'row'}
                                    justifyContent={'center'}
                                  >
                                    <DashboardCard
                                      cardProps={{
                                        mx: 2,
                                        py: 2,
                                        px: [2, 3],
                                        width: 0.40,
                                        onMouseDown: () => {
                                          this.executeAction()
                                        }
                                      }}
                                      isInteractive={true}
                                    >
                                      <Flex
                                        my={1}
                                        alignItems={'center'}
                                        flexDirection={'row'}
                                        justifyContent={'center'}
                                      >
                                        <Flex
                                          mr={2}
                                          alignItems={'center'}
                                          justifyContent={'center'}
                                        >
                                          <Icon
                                            align={'center'}
                                            color={'#00b84a'}
                                            name={'CheckCircle'}
                                            size={this.props.isMobile ? '1em' : '1.8em'}
                                          />
                                        </Flex>
                                        <Text
                                          fontWeight={3}
                                          fontSize={[2, 3]}
                                        >
                                          Confirm
                                      </Text>
                                      </Flex>
                                    </DashboardCard>
                                    <DashboardCard
                                      cardProps={{
                                        mx: 2,
                                        py: 2,
                                        px: [2, 3],
                                        width: 0.40,
                                        onMouseDown: () => {
                                          this.cancelTransaction();
                                        }
                                      }}
                                      isInteractive={true}
                                    >
                                      <Flex
                                        my={1}
                                        alignItems={'center'}
                                        flexDirection={'row'}
                                        justifyContent={'center'}
                                      >
                                        <Flex
                                          mr={2}
                                          alignItems={'center'}
                                          justifyContent={'center'}
                                        >
                                          <Icon
                                            name={'Cancel'}
                                            align={'center'}
                                            color={'#e13636'}
                                            size={this.props.isMobile ? '1em' : '1.8em'}
                                          />
                                        </Flex>
                                        <Text
                                          fontWeight={3}
                                          fontSize={[2, 3]}
                                        >
                                          Decline
                                      </Text>
                                      </Flex>
                                    </DashboardCard>
                                  </Flex>
                                </DashboardCard>
                              ) : (
                                      <Flex
                                        mt={3}
                                        alignItems={'center'}
                                        flexDirection={'column'}
                                        justifyContent={'center'}
                                      >
                                        <TxProgressBar
                                          {...this.props}
                                          cancelTransaction={this.cancelTransaction.bind(this)}
                                          hash={this.state.processing[this.state.action].txHash}
                                          endMessage={`Finalizing ${this.state.action} request...`}
                                          waitText={`${this.functionsUtil.capitalize(this.state.action)} estimated in`}
                                        />
                                      </Flex>
                                    )
                            )
                          }
                        </Box>
                      )
                    ) : (
                      <Flex
                        mt={4}
                        flexDirection={'column'}
                      >
                        <FlexLoader
                          flexProps={{
                            flexDirection: 'row'
                          }}
                          loaderProps={{
                            size: '30px'
                          }}
                          textProps={{
                            ml: 2
                          }}
                          text={'Loading asset info...'}
                        />
                      </Flex>
                    )
                  }
                </Migrate>
              )
          }
        </Flex>
        {
          /*
          showDepositCurve && this.state.depositCurveEnabled ? (
            <CurveDeposit
              {...this.props}
            />
          ) :
          */
          showRedeemCurve && this.state.redeemCurveEnabled && (
            <Box
              mt={3}
              width={1}
            >
              <CurveRedeem
                {...this.props}
              />
            </Box>
          )
        }
        {
          showBuyFlow ? (
            <Flex
              mt={3}
              width={[1,0.5]}
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
          ) : showPolygonBridge && (
            <Flex
              mt={3}
              width={[1,0.36]}
              alignItems={'stretch'}
              flexDirection={'column'}
              justifyContent={'center'}
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
                  <Image
                    height={'2em'}
                    src={polygonBridgeInfo.image}
                  />
                  <Text
                    mt={1}
                    fontSize={2}
                    color={'cellText'}
                    textAlign={'center'}
                  >
                    <strong>You don't have enough {buyToken} in your wallet!</strong><br />Use the {polygonBridgeInfo.label} to transfer your {buyToken} in Polygon.
                  </Text>
                  <RoundButton
                    buttonProps={{
                      mt:2,
                      width:[1,1/2]
                    }}
                    handleClick={ e => this.props.goToSection(`tools/${polygonBridgeInfo.route}/${buyToken}`)}
                  >
                    Deposit {buyToken}
                  </RoundButton>
                </Flex>
              </DashboardCard>
            </Flex>
          )
        }
        <ShareModal
          confettiEnabled={true}
          icon={`images/medal.svg`}
          title={`Congratulations!`}
          account={this.props.account}
          closeModal={this.resetModal}
          tokenName={this.props.selectedToken}
          isOpen={this.state.activeModal === 'share'}
          text={`You have successfully deposited in Idle!<br />Enjoy <strong>${this.state.tokenAPY}% APY</strong> on your <strong>${this.props.selectedToken}</strong>!`}
          tweet={`I'm earning ${this.state.tokenAPY}% APY on my ${this.props.selectedToken} with @idlefinance! Go to ${this.functionsUtil.getGlobalConfig(['baseURL'])} and start earning now from your idle tokens!`}
        />
      </Flex>
    );
  }
}

export default DepositRedeem;
