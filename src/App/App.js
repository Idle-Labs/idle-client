import Web3 from "web3";
import jQuery from "jquery";
import theme from "../theme";
import Tos from "../Tos/Tos";
import themeDark from "../theme-dark";
import connectors from "./connectors";
import Web3Provider from "web3-react";
import { Web3Consumer } from "web3-react";
import CookieConsent from "react-cookie-consent";
import RimbleWeb3 from "../utilities/RimbleWeb3";
import FlexLoader from "../FlexLoader/FlexLoader";
import React, { Component, Suspense } from "react";
import GeneralUtil from "../utilities/GeneralUtil";
import Header from "../utilities/components/Header";
import globalConfigs from "../configs/globalConfigs";
import ScrollToTop from "../ScrollToTop/ScrollToTop";
import FunctionsUtil from "../utilities/FunctionsUtil";
import PageNotFound from "../PageNotFound/PageNotFound";
import Web3Debugger from "../Web3Debugger/Web3Debugger";
import availableTokens from "../configs/availableTokens";
import availableTranches from "../configs/availableTranches";
import TransactionToastUtil from "../utilities/TransactionToastUtil";
import { HashRouter as Router, Switch, Route } from "react-router-dom";
import { ThemeProvider, Box, Text, Link, Image, Flex } from "rimble-ui";

// Lazy Loading
const Landing = React.lazy(() => import("../Landing/Landing"));
const Dashboard = React.lazy(() => import("../Dashboard/Dashboard"));
const Governance = React.lazy(() => import("../Governance/Governance"));

class App extends Component {
  state = {
    network: null,
    cachedData: {},
    buyToken: null,
    currentEnv: null,
    selectedTab: '1',
    route: "default", // or 'onboarding'
    themeMode: 'light',
    connecting: false,
    tokenConfig: null,
    genericError: null,
    customAddress: "0x442Aea0Fd2AFbd3391DAE768F7046f132F0a6300",
    connectorName: null,
    selectedToken: null,
    selectedTheme: theme,
    currentSection: null,
    walletProvider: null,
    availableTokens: null,
    buyModalOpened: false,
    selectedProtocol: null,
    selectedStrategy: null,
    toastMessageProps: null,
    callbackAfterLogin: null,
    width: window.innerWidth,
    availableStrategies: null,
    height: window.innerHeight,
    config:globalConfigs.network,
    unsubscribeFromHistory: null,
    enableUnderlyingWithdraw: false,
    availableStrategiesNetworks: null
  };

  // Utils
  functionsUtil = null;
  loadUtils() {
    if (this.functionsUtil) {
      this.functionsUtil.setProps(this.props);
    } else {
      this.functionsUtil = new FunctionsUtil(this.props);
    }
    // window.functionsUtil = this.functionsUtil;
  }

  closeToastMessage = (e) => {
    if (e) {
      e.preventDefault();
    }
    this.setState({
      toastMessageProps: null
    });
  }

  showToastMessage = (props) => {
    this.setState({
      toastMessageProps: props
    });
  }

  processCustomParam = (props, prevProps) => {
    // const params = props ? props.match.params : null;
    // const prevParams = prevProps ? prevProps.match.params : null;

    // Reset params
    /*
    if ( prevParams && params && prevParams.customParam !== params.customParam && (!params || !params.customParam || params.customParam === undefined)){
      this.setState({
        customAddress:null,
        enableUnderlyingWithdraw:false
      });
    } else if (params && typeof params.customParam === 'string') {
      // Check if custom address
      if (params.customParam.toLowerCase().match(/0x[\w]{40}/) && this.state.customAddress !== params.customParam){
        this.setCustomAddress(params.customParam);
      } else if (params && params.customParam === 'withdraw' && !this.state.enableUnderlyingWithdraw){
        this.setState({
          customAddress:null,
          enableUnderlyingWithdraw:true
        });
      }
    }
    */
  }

  clearCachedData = async (callback = null, clear_all = false) => {

    if (!this.state.network){
      return false;
    }

    const requiredNetworkId = this.state.network.required.id;

    const cachedData = { ...this.state.cachedData };
    if (cachedData[requiredNetworkId]){
      Object.keys(cachedData[requiredNetworkId]).forEach(key => {
        const data = cachedData[requiredNetworkId][key];
        if (data.expirationDate !== null) {
          delete cachedData[requiredNetworkId][key];
        }
      });
    }

    const storedCachedData = clear_all ? {} : this.functionsUtil.getStoredItem('cachedData');
    if (storedCachedData && storedCachedData[requiredNetworkId]){
      Object.keys(storedCachedData[requiredNetworkId]).forEach( key => {
        const storedData = storedCachedData[requiredNetworkId][key];
        if (storedData.expirationDate !== null){
          delete storedCachedData[requiredNetworkId][key];
        }
      });
    }

    this.functionsUtil.setLocalStorage('cachedData', storedCachedData, true);

    await this.setState({
      cachedData
    }, () => {
      if (typeof callback === 'function') {
        callback();
      }
    });

    return true;
  }

  setCachedData = (key, data, TTL = null, useLocalStorage = false) => {

    if (!this.state.network){
      return false;
    }

    key = key.toLowerCase();
    const currentTime = parseInt(Date.now()/1000);
    const requiredNetworkId = this.state.network.required.id;
    const cachedKeyFound = this.state.cachedData[requiredNetworkId] ? this.state.cachedData[requiredNetworkId][key] : null;

    let storedCachedData = this.functionsUtil.getStoredItem('cachedData',true,{});
    const storedKeyFound = storedCachedData[requiredNetworkId] ? storedCachedData[requiredNetworkId][key] : null;

    const update_stored_key = useLocalStorage && (!storedKeyFound || ((storedKeyFound.expirationDate !== null && storedKeyFound.expirationDate <= currentTime) || JSON.stringify(storedKeyFound.data) !== JSON.stringify(data)));
    const update_key = !cachedKeyFound || ((cachedKeyFound.expirationDate !== null && cachedKeyFound.expirationDate <= currentTime) || JSON.stringify(cachedKeyFound.data) !== JSON.stringify(data)) || update_stored_key;

    let output = false;

    if (update_key) {
      const expirationDate = TTL ? currentTime + (TTL) : null;

      // Save cached data in local storage
      if (useLocalStorage) {
        if (!storedCachedData) {
          storedCachedData = {};
          storedCachedData[requiredNetworkId] = {};
        }

        // const storedData = typeof data === 'object' ? JSON.stringify(data) : data;

        storedCachedData = {
          ...storedCachedData,
          [requiredNetworkId]:{
            ...storedCachedData[requiredNetworkId],
            [key]: {
              data,
              expirationDate
            }
          }
        };
        
        this.functionsUtil.setLocalStorage('cachedData',storedCachedData,true);
      }

      // Set new cached data state
      this.setState((prevState) => ({
        cachedData: {
          ...prevState.cachedData,
          [requiredNetworkId]:{
            ...prevState.cachedData[requiredNetworkId],
            [key]: {
              data,
              expirationDate
            }
          }
        }
      }), () => {
        window.cachedData = this.state.cachedData;
      });

      output = true;
    }

    return output;
  }

  setCallbackAfterLogin = (callbackAfterLogin) => {
    this.setState({
      callbackAfterLogin
    });
  }

  setCustomAddress = (customAddress) => {
    // Reset customAddress if not well formatted
    if (customAddress && !customAddress.toLowerCase().match(/0x[\w]{40}/)) {
      customAddress = null;
    }

    if (customAddress !== this.state.customAddress) {
      this.setState({
        customAddress,
        enableUnderlyingWithdraw: false
      });
    }
  }

  async selectTab(e, tabIndex) {
    return this.setState(state => ({ ...state, selectedTab: tabIndex }));
  }

  async loadAvailableTokens() {
    const newState = {};
    const availableStrategies = {};
    const availableStrategiesNetworks = {};
    const requiredNetwork = this.state.network && this.state.network.isCorrectNetwork ? (this.state.network.current.id || this.state.network.required.id) : this.state.config.requiredNetwork;

    // console.log('loadAvailableTokens_1',this.state.network,requiredNetwork,availableTokens);

    // Load available strategies
    Object.keys(availableTokens).filter( networkId => this.functionsUtil.getGlobalConfig(['network','enabledNetworks']).includes(parseInt(networkId)) ).forEach (networkId => {
      availableStrategiesNetworks[networkId] = {};
      Object.keys(availableTokens[networkId]).forEach((strategy) => {

        availableStrategiesNetworks[networkId][strategy] = Object.keys(availableTokens[networkId][strategy]).reduce((enabledTokens, token) => {
          const tokenConfig = availableTokens[networkId][strategy][token];
          const envEnabled = !tokenConfig.enabledEnvs || !tokenConfig.enabledEnvs.length || tokenConfig.enabledEnvs.includes(this.state.currentEnv);
          if (tokenConfig.enabled && envEnabled) {
            enabledTokens[token] = tokenConfig;
          }
          return enabledTokens;
        }, {});

        if (parseInt(networkId) === parseInt(requiredNetwork)){
          availableStrategies[strategy] = availableStrategiesNetworks[networkId][strategy];
        }
      });
    });

    newState.availableStrategies = availableStrategies;
    newState.availableStrategiesNetworks = availableStrategiesNetworks;

    // console.log('availableStrategiesNetworks',availableStrategiesNetworks);

    // Load strategy
    const selectedStrategy = this.state.selectedStrategy;
    if (selectedStrategy && availableStrategies[selectedStrategy]) {
      newState.availableTokens = availableStrategies[selectedStrategy];

      // Load token
      const selectedToken = this.state.selectedToken;
      if (selectedToken && newState.availableTokens[selectedToken]) {
        newState.tokenConfig = newState.availableTokens[selectedToken];
      }
    }

    // console.log('loadAvailableTokens',newState);

    await this.setState(newState);
  }

  async setStrategyToken(selectedStrategy, selectedToken,selectedProtocol=null) {

    const callback = () => {
      this.loadAvailableTokens();
    }

    // console.log(selectedToken,selectedProtocol)
    const newState = {
      tokenConfig: !selectedToken ? null : this.state.tokenConfig,
      availableTokens: !selectedToken ? null : this.state.availableTokens,
      selectedToken: !selectedToken ? selectedToken : this.state.selectedToken,
      selectedStrategy: !selectedStrategy ? selectedStrategy : this.state.selectedStrategy,
    };
    // console.log("here",newState.selectedToken)

    if (selectedStrategy && this.state.availableStrategies && selectedStrategy !== this.state.selectedStrategy && Object.keys(this.state.availableStrategies).includes(selectedStrategy.toLowerCase())) {
      newState.selectedStrategy = selectedStrategy.toLowerCase();
    }
    else if(selectedStrategy==='tranches'&&selectedStrategy!==this.state.selectedStrategy)
    {
      newState.selectedStrategy = selectedStrategy.toLowerCase();
    }

      
     if (selectedToken && selectedToken !== this.state.selectedToken) {
       // console.log("Step1")
        if(selectedStrategy==='tranches') {
          // console.log("Step2");
          // console.log(availableTranches);
          if(availableTranches && Object.keys(availableTranches[selectedProtocol]).includes(selectedToken)) {
            newState.selectedToken = selectedToken;
            newState.availableTokens = availableTranches;
            newState.selectedProtocol = selectedProtocol;
            newState.tokenConfig = availableTranches[selectedProtocol][selectedToken];
          }
        }
      else if (this.state.availableTokens && Object.keys(this.state.availableTokens).includes(selectedToken.toUpperCase())) {
        newState.selectedToken = selectedToken.toUpperCase();
        newState.tokenConfig = this.state.availableTokens[selectedToken];
      } 
      else if (this.state.availableStrategies && Object.keys(this.state.availableStrategies[selectedStrategy]).includes(selectedToken.toUpperCase())) {
        newState.selectedToken = selectedToken.toUpperCase();
        newState.tokenConfig = this.state.availableStrategies[selectedStrategy][newState.selectedToken];
        newState.availableTokens = this.state.availableStrategies[selectedStrategy];
      }
    }

    // console.log('setStrategyToken',selectedStrategy,selectedToken,newState);
    // console.log(newState);
    await this.setState(newState, callback);
  }


  async setRequiredNetwork(requiredNetwork,forceChangeChain=false){
    requiredNetwork = parseInt(requiredNetwork);
    if (globalConfigs.network.enabledNetworks.includes(requiredNetwork)){
      this.functionsUtil.setLocalStorage('requiredNetwork',requiredNetwork);
      // console.log('setRequiredNetwork',requiredNetwork,forceChangeChain);
      if (forceChangeChain || (this.state.currentSection && this.state.currentSection !== 'landing')){
        this.functionsUtil.addEthereumChain(requiredNetwork);
      }
      return await this.setState(prevState => ({
        config:{
          ...prevState.config,
          requiredNetwork
        }
      }));
    }
  }

  async setStrategy(selectedStrategy) {

    const callback = () => {
      this.loadAvailableTokens();
    }
    console.log("availabble",this.state.availableStrategies)

    if (selectedStrategy && selectedStrategy !== this.state.selectedStrategy && (Object.keys(this.state.availableStrategies).includes(selectedStrategy.toLowerCase())||selectedStrategy==='tranches')) {
      selectedStrategy = selectedStrategy.toLowerCase();
      await this.setState({
        selectedStrategy
      }, callback);
    } else if (!selectedStrategy) {
      await this.setState({
        selectedStrategy
      }, callback);
    }
  }

  async setToken(selectedToken) {

    const callback = () => {
      this.loadAvailableTokens();
    }

    if (selectedToken && selectedToken !== this.state.selectedToken && Object.keys(this.state.availableTokens).includes(selectedToken.toUpperCase())) {
      selectedToken = selectedToken.toUpperCase();
      const newState = {
        selectedToken
      };
      newState.tokenConfig = this.state.availableTokens[selectedToken];
      await this.setState(newState, callback);
    } else if (!selectedToken) {
      await this.setState({
        selectedToken,
        tokenConfig: null
      }, callback);
    }
  }

  async componentWillMount() {

    this.loadUtils();

    window.BNify = this.functionsUtil.BNify;

    // Suppress warnings and errors in production
    const isProduction = window.location.origin.toLowerCase().includes(globalConfigs.baseURL.toLowerCase());
    if (isProduction) {
      window.console.error = () => { };
      window.console.warn = () => { };
    }

    window.jQuery = jQuery;

    if (window.localStorage) {
      this.functionsUtil.removeStoredItem('context');
    }

    const themeMode = this.functionsUtil.getStoredItem('themeMode', false);
    if (themeMode) {
      this.setThemeMode(themeMode);
    }

    const requiredNetwork = this.functionsUtil.getStoredItem('requiredNetwork',false);
    if (requiredNetwork){
      this.setRequiredNetwork(requiredNetwork);
    }

    window.closeIframe = (w) => {
      const iFrames = document.getElementsByTagName('iframe');
      for (let i = 0; i < iFrames.length; i++) {
        const iframe = iFrames[i];
        if (iframe.contentWindow === w) {
          window.jQuery(iframe).parents('.iframe-container')[0].remove();
        }
      }
    }

    window.addEventListener('resize', this.handleWindowSizeChange);

    this.loadCurrentEnvironment();
    this.loadCustomAddress();
  }

  async loadCurrentEnvironment() {
    const currentEnv = this.functionsUtil.getCurrentEnvironment();
    this.setState({
      currentEnv
    }, async () => {
      // const envRequiredNetwork = this.functionsUtil.getGlobalConfig(['environments',this.state.currentEnv,'requiredNetwork']);
      // const storedRequiredNetwork = this.functionsUtil.getStoredItem('requiredNetwork',null);
      // if (!storedRequiredNetwork || parseInt(storedRequiredNetwork) !== parseInt(envRequiredNetwork)){
      //   const requiredNetwork = storedRequiredNetwork || envRequiredNetwork;
      //   console.log('setRequiredNetwork',requiredNetwork);
      //   await this.setRequiredNetwork(requiredNetwork);
      // }
      this.loadAvailableTokens();
    })
  }

  loadCustomAddress() {
    if (!this.state.customAddress) {
      const walletProvider = this.functionsUtil.getWalletProvider('Infura');
      if (walletProvider === 'custom') {
        const customAddress = this.functionsUtil.getCustomAddress();
        if (customAddress && customAddress !== this.state.customAddress) {
          this.setState({
            customAddress
          });
        }
      }
    }
  }

  componentWillUnmount() {
    window.removeEventListener('resize', this.handleWindowSizeChange);
  }

  checkClientVersion(){
    // Clear all localStorage data except walletProvider and connectorName if version has changed
    const version = this.functionsUtil.getStoredItem('version', false);
    const clientVersionChanged = version !== globalConfigs.version;
    if (clientVersionChanged) {
      console.log(`Client version updated from ${version} to ${globalConfigs.version}`);
      const clearAllCache = this.functionsUtil.getGlobalConfig(['cache','clearAll']);
      // Clear cached data
      this.clearCachedData(() => {
        // Reset Localstorage
        this.functionsUtil.clearStoredData(['walletProvider', 'connectorName', 'themeMode', 'requiredNetwork']);
        this.functionsUtil.setLocalStorage('version', globalConfigs.version);
      }, clearAllCache);
    }

    console.log(`Client Version: ${globalConfigs.version}`);
  }

  componentDidUpdate(prevProps, prevState) {
    this.loadUtils();

    const currentSectionChanged = prevState.currentSection !== this.state.currentSection;
    if (currentSectionChanged) {
      if (this.state.currentSection === 'landing') {
        this.setThemeMode('light', false);
      } else {
        // Get stored Mode
        const themeMode = this.functionsUtil.getStoredItem('themeMode', false) || this.functionsUtil.getGlobalConfig(['dashboard', 'theme', 'mode']);
        this.setThemeMode(themeMode);
      }
    }

    const networkInitialized = !prevState.network && this.state.network;
    if (networkInitialized){
      this.checkClientVersion();
    }

    const tokenChanged = prevState.selectedToken !== this.state.selectedToken;
    const strategyChanged = prevState.selectedStrategy !== this.state.selectedStrategy;
    const networkChanged = JSON.stringify(prevState.network) !== JSON.stringify(this.state.network);

    if (tokenChanged || strategyChanged || networkChanged) {
      this.loadAvailableTokens();
    }
  }

  componentDidMount() {

    // Close iFrame
    // if (window.self !== window.top && window.top.location.href.indexOf(globalConfigs.baseURL) !== -1 && typeof window.parent.closeIframe === 'function' ){
    //   window.parent.closeIframe(window.self);
    // }

    window.showToastMessage = this.showToastMessage;
    window.closeToastMessage = this.closeToastMessage;

    if (localStorage) {
      let connectorName = localStorage.getItem('connectorName') ? localStorage.getItem('connectorName') : 'Infura';
      let walletProvider = localStorage.getItem('walletProvider') ? localStorage.getItem('walletProvider') : 'Infura';

      // Check Ledger Live
      const isLedgerLive = window.location.href.includes("ledger-live=1");
      if (isLedgerLive) {
        connectorName = 'ledgerLive';
        walletProvider = 'ledger';
      }
      // console.log('isLedgerLive',isLedgerLive,connectorName,walletProvider);

      this.setConnector(connectorName, walletProvider);
    }
  }

  handleWindowSizeChange = () => {
    const newState = {
      width: this.state.width,
      height: this.state.height,
    };

    const widthChanged = window.innerWidth !== this.state.width;
    const heightChanged = window.innerHeight !== this.state.height;

    if (widthChanged || heightChanged) {
      if (widthChanged) {
        newState.width = window.innerWidth;
      }
      if (heightChanged) {
        newState.height = window.innerHeight;
      }
      return this.setState(newState);
    }

    return null;
  };

  showRoute(route) {
    return this.setState({ route });
  }

  closeBuyModal(e) {
    if (e) {
      e.preventDefault();
    }
    return this.setState({
      buyToken: null,
      buyModalOpened: false
    });
  }

  openBuyModal(e, buyToken) {
    e.preventDefault();

    return this.setState({
      buyToken,
      buyModalOpened: true
    });
  }

  async logout() {
    // Reset Custom Address
    this.setState({
      customAddress: null
    });
    // Clear cached data
    this.clearCachedData(() => {
      // Reset Localstorage except some keys
      this.functionsUtil.clearStoredData(['version', 'themeMode', 'lastLogin', 'cachedData','requiredNetwork']);
    });
  }

  setNetwork(network) {
    this.setState({
      network,
      availableStrategies:null
    });
  }

  setConnector(connectorName, walletProvider) {

    let connectorInfo = globalConfigs.connectors[connectorName.toLowerCase()];
    if (!connectorInfo && walletProvider) {
      connectorInfo = globalConfigs.connectors[walletProvider.toLowerCase()];
    }

    // console.log('setConnector - BEFORE',connectorInfo,connectorName,walletProvider);

    if ((connectorInfo && !connectorInfo.enabled) || (connectorName !== 'Injected' && !Object.keys(globalConfigs.connectors).includes(connectorName.toLowerCase())) || (walletProvider && !Object.keys(globalConfigs.connectors).includes(walletProvider.toLowerCase()))) {
      connectorName = 'Infura';
      walletProvider = 'Infura';
    } else if (connectorName === 'Injected') {
      const hasMetamask = GeneralUtil.hasMetaMask();
      const hasDapper = GeneralUtil.hasDapper()

      // Check if injected connector is valid
      switch (walletProvider) {
        case 'Metamask':
          if (!hasMetamask && hasDapper) {
            walletProvider = 'Dapper';
          }
          break;
        case 'Dapper':
          if (!hasDapper && hasMetamask) {
            walletProvider = 'Metamask';
          }
          break;
        default:
          break;
      }
    }

    this.functionsUtil.setLocalStorage('connectorName', connectorName);
    this.functionsUtil.setLocalStorage('walletProvider', walletProvider);

    return this.setState({
      connectorName,
      walletProvider
    }, () => {
      this.loadCustomAddress();
    });
  }

  setThemeMode(themeMode, store = true) {
    let selectedTheme = null;

    // Check Dark Mode Enabled
    const darkModeEnabled = this.functionsUtil.getGlobalConfig(['dashboard', 'theme', 'darkModeEnabled']);
    if (themeMode === 'dark' && !darkModeEnabled) {
      themeMode = 'light';
    }

    switch (themeMode) {
      default:
      case 'light':
        selectedTheme = theme;
        break;
      case 'dark':
        selectedTheme = themeDark;
        break;
    }

    if (store) {
      this.functionsUtil.setLocalStorage('themeMode', themeMode);
    }

    this.setState({
      themeMode,
      selectedTheme
    });
  }

  setCurrentSection(currentSection) {
    this.setState({
      currentSection
    });
  }

  render() {
    const isMobile = this.state.width <= 768;
    const governanceEnabled = this.functionsUtil.getGlobalConfig(['governance', 'enabled']);

    // console.log(this.state.selectedToken,this.state.tokenConfig);

    const SuspenseLoader = (
      <Flex
        width={1}
        minHeight={'100vh'}
        alignItems={'center'}
        flexDirection={'column'}
        justifyContent={'center'}
        backgroundColor={'selectBg'}
      >
        <FlexLoader
          textProps={{
            textSize: 4,
            fontWeight: 2
          }}
          loaderProps={{
            mb: 3,
            size: '80px',
            color: 'primary'
          }}
          flexProps={{
            my: 3,
            flexDirection: 'column'
          }}
          text={''}
        />
      </Flex>
    );

    return (
      <Router>
        <ScrollToTop />
        <ThemeProvider
          theme={this.state.selectedTheme}
        >
          <Web3Provider
            web3Api={Web3}
            connectors={connectors}
            libraryName={'web3.js'}
          >
            <Web3Consumer
              recreateOnNetworkChange={false}
              recreateOnAccountChange={false}
            >
              {context => {
                //console.log('Web3Consumer render',context);
                return (
                  <RimbleWeb3
                    context={context}
                    isMobile={isMobile}
                    connectors={connectors}
                    config={this.state.config}
                    theme={this.state.selectedTheme}
                    cachedData={this.state.cachedData}
                    tokenConfig={this.state.tokenConfig}
                    availableTranches={availableTranches}
                    setNetwork={this.setNetwork.bind(this)}
                    customAddress={this.state.customAddress}
                    selectedToken={this.state.selectedToken}
                    connectorName={this.state.connectorName}
                    currentSection={this.state.currentSection}
                    walletProvider={this.state.walletProvider}
                    setConnector={this.setConnector.bind(this)}
                    availableTokens={this.state.availableTokens}
                    setCachedData={this.setCachedData.bind(this)}
                    clearCachedData={this.clearCachedData.bind(this)}
                    callbackAfterLogin={this.state.callbackAfterLogin}
                    availableStrategies={this.state.availableStrategies}
                    setCallbackAfterLogin={this.setCallbackAfterLogin.bind(this)}
                    enableUnderlyingWithdraw={this.state.enableUnderlyingWithdraw}
                    availableStrategiesNetworks={this.state.availableStrategiesNetworks}
                  >
                    <RimbleWeb3.Consumer>
                      {({
                        web3,
                        modals,
                        network,
                        account,
                        initWeb3,
                        simpleID,
                        biconomy,
                        contracts,
                        web3Infura,
                        web3Polygon,
                        transaction,
                        initAccount,
                        initContract,
                        checkNetwork,
                        transactions,
                        initSimpleID,
                        permitClient,
                        tokenDecimals,
                        maticPOSClient,
                        accountBalance,
                        needsPreflight,
                        validateAccount,
                        rejectValidation,
                        accountValidated,
                        getTokenDecimals,
                        getAccountBalance,
                        contractsNetworks,
                        accountBalanceLow,
                        networkInitialized,
                        accountInizialized,
                        accountBalanceToken,
                        userRejectedConnect,
                        initializeContracts,
                        erc20ForwarderClient,
                        rejectAccountConnect,
                        contractsInitialized,
                        userRejectedValidation,
                        accountValidationPending,
                        connectAndValidateAccount,
                        contractMethodSendWrapper,
                        initContractCustomProvider
                      }) => {
                        return (
                          <Box>
                            <Switch>
                              <Route
                                path="/dashboard/:section?/:param1?/:param2?/:param3?"
                                render={
                                  (props) => 
                                    <Suspense
                                      fallback={SuspenseLoader}
                                    >
                                      <Dashboard
                                        {...props}
                                        web3={web3}
                                        modals={modals}
                                        network={network}
                                        context={context}
                                        account={account}
                                        isDashboard={true}
                                        initWeb3={initWeb3}
                                        biconomy={biconomy}
                                        isMobile={isMobile}
                                        simpleID={simpleID}
                                        contracts={contracts}
                                        web3Infura={web3Infura}
                                        web3Polygon={web3Polygon}
                                        initAccount={initAccount}
                                        permitClient={permitClient}
                                        initSimpleID={initSimpleID}
                                        initContract={initContract}
                                        transactions={transactions}
                                        buyToken={this.state.buyToken}
                                        logout={this.logout.bind(this)}
                                        maticPOSClient={maticPOSClient}
                                        accountBalance={accountBalance}
                                        themeMode={this.state.themeMode}
                                        theme={this.state.selectedTheme}
                                        validateAccount={validateAccount}
                                        currentEnv={this.state.currentEnv}
                                        connecting={this.state.connecting}
                                        cachedData={this.state.cachedData}
                                        setToken={this.setToken.bind(this)}
                                        accountValidated={accountValidated}
                                        getTokenDecimals={getTokenDecimals}
                                        rejectValidation={rejectValidation}
                                        tokenConfig={this.state.tokenConfig}
                                        contractsNetworks={contractsNetworks}
                                        availableTranches={availableTranches}
                                        getAccountBalance={getAccountBalance}
                                        accountBalanceLow={accountBalanceLow}
                                        accountInizialized={accountInizialized}
                                        networkInitialized={networkInitialized}
                                        selectedToken={this.state.selectedToken}
                                        connectorName={this.state.connectorName}
                                        setStrategy={this.setStrategy.bind(this)}
                                        userRejectedConnect={userRejectedConnect}
                                        accountBalanceToken={accountBalanceToken}
                                        initializeContracts={initializeContracts}
                                        walletProvider={this.state.walletProvider}
                                        buyModalOpened={this.state.buyModalOpened}
                                        erc20ForwarderClient={erc20ForwarderClient}
                                        contractsInitialized={contractsInitialized}
                                        openBuyModal={this.openBuyModal.bind(this)}
                                        rejectAccountConnect={rejectAccountConnect}
                                        handleMenuClick={this.selectTab.bind(this)}
                                        setConnector={this.setConnector.bind(this)}
                                        setThemeMode={this.setThemeMode.bind(this)}
                                        availableTokens={this.state.availableTokens}
                                        closeBuyModal={this.closeBuyModal.bind(this)}
                                        setCachedData={this.setCachedData.bind(this)}
                                        selectedStrategy={this.state.selectedStrategy}
                                        selectedProtocol={this.state.selectedProtocol}
                                        userRejectedValidation={userRejectedValidation}
                                        clearCachedData={this.clearCachedData.bind(this)}
                                        setStrategyToken={this.setStrategyToken.bind(this)}
                                        accountValidationPending={accountValidationPending}
                                        availableStrategies={this.state.availableStrategies}
                                        setCurrentSection={this.setCurrentSection.bind(this)}
                                        connectAndValidateAccount={connectAndValidateAccount}
                                        contractMethodSendWrapper={contractMethodSendWrapper}
                                        setRequiredNetwork={this.setRequiredNetwork.bind(this)}
                                        initContractCustomProvider={initContractCustomProvider}
                                        setCallbackAfterLogin={this.setCallbackAfterLogin.bind(this)}
                                        availableStrategiesNetworks={this.state.availableStrategiesNetworks}
                                      />
                                    </Suspense>

                                }
                              >
                              </Route>
                              {
                                governanceEnabled && (
                                  <Route
                                    path="/governance/:section?/:item_id?"
                                    render={
                                      (props) =>
                                        <Suspense
                                          fallback={SuspenseLoader}
                                        >
                                          <Governance
                                            {...props}
                                            web3={web3}
                                            modals={modals}
                                            network={network}
                                            context={context}
                                            account={account}
                                            initWeb3={initWeb3}
                                            biconomy={biconomy}
                                            isMobile={isMobile}
                                            simpleID={simpleID}
                                            isGovernance={true}
                                            contracts={contracts}
                                            web3Infura={web3Infura}
                                            web3Polygon={web3Polygon}
                                            initAccount={initAccount}
                                            initSimpleID={initSimpleID}
                                            initContract={initContract}
                                            checkNetwork={checkNetwork}
                                            transactions={transactions}
                                            buyToken={this.state.buyToken}
                                            logout={this.logout.bind(this)}
                                            accountBalance={accountBalance}
                                            themeMode={this.state.themeMode}
                                            theme={this.state.selectedTheme}
                                            validateAccount={validateAccount}
                                            currentEnv={this.state.currentEnv}
                                            connecting={this.state.connecting}
                                            cachedData={this.state.cachedData}
                                            setToken={this.setToken.bind(this)}
                                            accountValidated={accountValidated}
                                            getTokenDecimals={getTokenDecimals}
                                            rejectValidation={rejectValidation}
                                            tokenConfig={this.state.tokenConfig}
                                            contractsNetworks={contractsNetworks}
                                            getAccountBalance={getAccountBalance}
                                            accountBalanceLow={accountBalanceLow}
                                            accountInizialized={accountInizialized}
                                            networkInitialized={networkInitialized}
                                            selectedToken={this.state.selectedToken}
                                            connectorName={this.state.connectorName}
                                            setStrategy={this.setStrategy.bind(this)}
                                            userRejectedConnect={userRejectedConnect}
                                            accountBalanceToken={accountBalanceToken}
                                            initializeContracts={initializeContracts}
                                            walletProvider={this.state.walletProvider}
                                            buyModalOpened={this.state.buyModalOpened}
                                            contractsInitialized={contractsInitialized}
                                            openBuyModal={this.openBuyModal.bind(this)}
                                            rejectAccountConnect={rejectAccountConnect}
                                            handleMenuClick={this.selectTab.bind(this)}
                                            setConnector={this.setConnector.bind(this)}
                                            setThemeMode={this.setThemeMode.bind(this)}
                                            availableTokens={this.state.availableTokens}
                                            closeBuyModal={this.closeBuyModal.bind(this)}
                                            setCachedData={this.setCachedData.bind(this)}
                                            selectedStrategy={this.state.selectedStrategy}
                                            userRejectedValidation={userRejectedValidation}
                                            clearCachedData={this.clearCachedData.bind(this)}
                                            setStrategyToken={this.setStrategyToken.bind(this)}
                                            accountValidationPending={accountValidationPending}
                                            availableStrategies={this.state.availableStrategies}
                                            setCurrentSection={this.setCurrentSection.bind(this)}
                                            connectAndValidateAccount={connectAndValidateAccount}
                                            contractMethodSendWrapper={contractMethodSendWrapper}
                                            setRequiredNetwork={this.setRequiredNetwork.bind(this)}
                                            setCallbackAfterLogin={this.setCallbackAfterLogin.bind(this)}
                                            availableStrategiesNetworks={this.state.availableStrategiesNetworks}
                                          />
                                        </Suspense>
                                    }
                                  >
                                  </Route>
                                )
                              }
                              <Route>
                                <Header
                                  modals={modals}
                                  network={network}
                                  context={context}
                                  account={account}
                                  initWeb3={initWeb3}
                                  isMobile={isMobile}
                                  contracts={contracts}
                                  initAccount={initAccount}
                                  initContract={initContract}
                                  buyToken={this.state.buyToken}
                                  accountBalance={accountBalance}
                                  logout={this.logout.bind(this)}
                                  validateAccount={validateAccount}
                                  connecting={this.state.connecting}
                                  accountValidated={accountValidated}
                                  getTokenDecimals={getTokenDecimals}
                                  rejectValidation={rejectValidation}
                                  setToken={e => { this.setToken(e) }}
                                  tokenConfig={this.state.tokenConfig}
                                  contractsNetworks={contractsNetworks}
                                  getAccountBalance={getAccountBalance}
                                  accountBalanceLow={accountBalanceLow}
                                  networkInitialized={networkInitialized}
                                  selectedToken={this.state.selectedToken}
                                  connectorName={this.state.connectorName}
                                  userRejectedConnect={userRejectedConnect}
                                  accountBalanceToken={accountBalanceToken}
                                  walletProvider={this.state.walletProvider}
                                  buyModalOpened={this.state.buyModalOpened}
                                  contractsInitialized={contractsInitialized}
                                  openBuyModal={this.openBuyModal.bind(this)}
                                  rejectAccountConnect={rejectAccountConnect}
                                  handleMenuClick={this.selectTab.bind(this)}
                                  setConnector={this.setConnector.bind(this)}
                                  availableTokens={this.state.availableTokens}
                                  closeBuyModal={this.closeBuyModal.bind(this)}
                                  userRejectedValidation={userRejectedValidation}
                                  accountValidationPending={accountValidationPending}
                                  connectAndValidateAccount={connectAndValidateAccount}
                                  setRequiredNetwork={this.setRequiredNetwork.bind(this)}
                                  availableStrategiesNetworks={this.state.availableStrategiesNetworks}
                                />

                                {
                                  this.state.route === "onboarding" && (
                                    <Web3Debugger
                                      web3={web3}
                                      account={account}
                                      accountBalance={accountBalance}
                                      accountBalanceToken={accountBalanceToken}
                                      accountBalanceLow={accountBalanceLow}
                                      initAccount={initAccount}
                                      rejectAccountConnect={rejectAccountConnect}
                                      userRejectedConnect={userRejectedConnect}
                                      accountValidated={accountValidated}
                                      accountValidationPending={accountValidationPending}
                                      rejectValidation={rejectValidation}
                                      userRejectedValidation={userRejectedValidation}
                                      validateAccount={validateAccount}
                                      connectAndValidateAccount={connectAndValidateAccount}
                                      modals={modals}
                                      network={network}
                                      transaction={transaction}
                                    />
                                  )
                                }

                                {
                                  this.state.route === "default" && (
                                    <Switch>
                                      <Route exact path="/"
                                        render={(props) =>
                                          <Suspense
                                            fallback={SuspenseLoader}
                                          >
                                            <Landing
                                              {...props}
                                              web3={web3}
                                              network={network}
                                              account={account}
                                              isMobile={isMobile}
                                              simpleID={simpleID}
                                              contracts={contracts}
                                              initContract={initContract}
                                              innerWidth={this.state.width}
                                              logout={this.logout.bind(this)}
                                              innerHeight={this.state.height}
                                              accountBalance={accountBalance}
                                              themeMode={this.state.themeMode}
                                              theme={this.state.selectedTheme}
                                              setToken={e => {this.setToken(e)}}
                                              cachedData={this.state.cachedData}
                                              currentEnv={this.state.currentEnv}
                                              connecting={this.state.connecting}
                                              selectedTab={this.state.selectedTab}
                                              tokenConfig={this.state.tokenConfig}
                                              accountBalanceLow={accountBalanceLow}
                                              getAccountBalance={getAccountBalance}
                                              availableTranches={availableTranches}
                                              contractsNetworks={contractsNetworks}
                                              networkInitialized={networkInitialized}
                                              customAddress={this.state.customAddress}
                                              selectedToken={this.state.selectedToken}
                                              accountBalanceToken={accountBalanceToken}
                                              closeToastMessage={this.closeToastMessage}
                                              contractsInitialized={contractsInitialized}
                                              openBuyModal={this.openBuyModal.bind(this)}
                                              setThemeMode={this.setThemeMode.bind(this)}
                                              processCustomParam={this.processCustomParam}
                                              availableTokens={this.state.availableTokens}
                                              setCachedData={this.setCachedData.bind(this)}
                                              updateSelectedTab={this.selectTab.bind(this)}
                                              toastMessageProps={this.state.toastMessageProps}
                                              clearCachedData={this.clearCachedData.bind(this)}
                                              availableStrategies={this.state.availableStrategies}
                                              setCurrentSection={this.setCurrentSection.bind(this)}
                                              connectAndValidateAccount={connectAndValidateAccount}
                                              setRequiredNetwork={this.setRequiredNetwork.bind(this)}
                                              availableStrategiesNetworks={this.state.availableStrategiesNetworks}
                                            />
                                            <CookieConsent
                                              expires={365}
                                              buttonText={"Ok"}
                                              location={"bottom"}
                                              acceptOnScroll={true}
                                              cookieName={"cookieAccepted"}
                                              acceptOnScrollPercentage={5}
                                              style={{ background: "rgba(255,255,255,0.95)", zIndex: '9999999' }}
                                              buttonStyle={{ display: isMobile ? "block" : "none", backgroundColor: '#0036ff', color: 'white', marginTop: isMobile ? "0px" : "15px" }}
                                            >
                                              <Flex flexDirection={'row'} alignItems={['flex-start', 'center']} justifyContent={'flex-start'} maxHeight={['150px', 'initial']} style={isMobile ? { overflowY: 'scroll' } : null}>
                                                <Image display={['none', 'block']} src={'images/cookie.svg'} width={'42px'} height={'42px'} />
                                                <Text pl={[0, 3]} color={'dark-gray'} fontSize={1} textAlign={'justify'}>
                                                  This website or its third-party tools process personal data (e.g. browsing data or IP addresses) and use cookies or other identifiers, which are necessary for its functioning and required to achieve the purposes illustrated in the cookie policy. To learn more, please refer to the <Link href={'https://www.iubenda.com/privacy-policy/61211749/cookie-policy'} target={'_blank'} rel="nofollow noopener noreferrer" hoverColor={'blue'}>cookie policy</Link>.
                                                  You accept the use of cookies or other identifiers by closing or dismissing this notice, by scrolling this page, by clicking a link or button or by continuing to browse otherwise.
                                              </Text>
                                              </Flex>
                                            </CookieConsent>
                                          </Suspense>
                                        }
                                      ></Route>
                                      <Route exact path="/terms-of-service">
                                        <Tos />
                                      </Route>
                                      <Route>
                                        <PageNotFound />
                                      </Route>
                                    </Switch>
                                  )
                                }
                              </Route>
                            </Switch>
                            <TransactionToastUtil
                              transactions={transactions}
                              themeMode={this.state.themeMode}
                            />
                          </Box>
                        )
                      }}
                    </RimbleWeb3.Consumer>
                  </RimbleWeb3>
                );
              }}
            </Web3Consumer>
          </Web3Provider>
        </ThemeProvider>
      </Router>
    );
  }
}

export default App;
