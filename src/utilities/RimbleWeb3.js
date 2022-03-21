import Web3 from "web3";
import React from 'react';
import BigNumber from 'bignumber.js';
import SimpleID from 'simpleid-js-sdk';
import NetworkUtil from "./NetworkUtil";
import { Biconomy } from "@biconomy/mexa";
import * as Sentry from '@sentry/browser';
import FunctionsUtil from './FunctionsUtil';
import globalConfigs from '../configs/globalConfigs';
import { POSClient, use } from '@maticnetwork/maticjs';
import ConnectionModalUtil from "./ConnectionModalsUtil";
import { Web3ClientPlugin } from '@maticnetwork/maticjs-web3';
// import detectEthereumProvider from '@metamask/detect-provider';
import { IFrameEthereumProvider } from '@ledgerhq/iframe-provider';
import ConnectionErrorModal from './components/ConnectionErrorModal';
import TransactionErrorModal from './components/TransactionErrorModal';

require('dotenv').config();

const RimbleTransactionContext = React.createContext({
  web3: {},
  account: {},
  biconomy: {},
  simpleID: {},
  contracts: [],
  web3Infura: {},
  web3Polygon: {},
  tokenConfig: {},
  transactions: {},
  permitClient: {},
  web3Providers: {},
  accountBalance: {},
  maticPOSClient: {},
  initWeb3: () => {},
  accountValidated: {},
  maticPlasmaClient :{},
  initAccount: () => {},
  accountBalanceLow: {},
  contractsNetworks: {},
  initSimpleID: () => {},
  initContract: () => {},
  erc20ForwarderClient: {},
  accountBalanceToken: {},
  checkPreflight: () => {},
  validateAccount: () => {},
  network: {
    current: {},
    required: {},
    checkNetwork: () => {},
    isCorrectNetwork: null,
    isSupportedNetwork: null,
  },
  accountInizialized: false,
  getTokenDecimals: () => {},
  rejectValidation: () => {},
  getAccountBalance: () => {},
  contractsInitialized: false,
  accountValidationPending: {},
  initializeContracts: () => {},
  rejectAccountConnect: () => {},
  enableUnderlyingWithdraw: false,
  connectAndValidateAccount: () => {},
  modals: {
    data: {
      connectionError: {},
      lowFundsModalIsOpen: {},
      noWalletModalIsOpen: {},
      userRejectedConnect: {},
      connectionModalIsOpen: {},
      userRejectedValidation: {},
      wrongNetworkModalIsOpen: {},
      accountValidationPending: {},
      accountConnectionPending: {},
      noWeb3BrowserModalIsOpen: {},
      transactionConnectionModalIsOpen: {},
    },
    methods: {
      openLowFundsModal: () => {},
      closeLowFundsModal: () => {},
      openWrongNetworkModal: () => {},
      closeWrongNetworkModal: () => {},
      openNoWeb3BrowserModal: () => {},
      closeNoWeb3BrowserModal: () => {},
      openConnectionErrorModal: () => {},
      closeConnectionErrorModal: () => {},
      openTransactionErrorModal: () => {},
      closeTransactionErrorModal: () => {},
      openConnectionPendingModal: () => {},
      closeConnectionPendingModal: () => {},
      openUserRejectedConnectionModal: () => {},
      openUserRejectedValidationModal: () => {},
      closeUserRejectedConnectionModal: () => {},
      closeUserRejectedValidationModal: () => {},
    }
  },
  transaction: {
    data: {
      transactions: {}
    },
    meta: {},
    methods: {}
  }
});

let setConnectorName = null;
let biconomyLoginProcessing = false;

class RimbleTransaction extends React.Component {
  static Consumer = RimbleTransactionContext.Consumer;

  componentUnmounted = false;

  // Utils
  functionsUtil = null;

  loadUtils(){
    const props = Object.assign({},this.props);
    props.web3 = this.state.web3;
    props.account = this.state.account;
    props.contracts = this.state.contracts;
    if (this.functionsUtil){
      this.functionsUtil.setProps(props);
    } else {
      this.functionsUtil = new FunctionsUtil(props);
    }
  }

  componentWillUnmount(){
    this.componentUnmounted = true;
  }

  async componentWillMount(){
    this.loadUtils();
    await this.checkNetwork();

    // detect Network account change
    if (window.ethereum){
      window.ethereum.on('networkChanged', async (networkId) => {
        this.handleNetworkChanged(networkId);
        // window.location.reload();
      });
    }

    window.initWeb3 = this.initWeb3;
    window.initAccount = this.initAccount;
  }

  handleNetworkChanged = async (networkId=null) => {
    this.functionsUtil.removeStoredItem('cachedRequests');
    this.functionsUtil.removeStoredItem('cachedRequests_polygon');
    this.functionsUtil.removeStoredItem('transactions');
    await this.props.clearCachedData(async () => {
      // console.log(networkId,this.state.network);
      // const network = await this.checkNetwork();
      // if (network.isCorrectNetwork){
      //   window.location.reload();
      // }

      if (this.state.network.required && networkId && parseInt(networkId) === parseInt(this.state.network.required.id)){
        window.location.reload();
      } else {
        this.setState({
          web3:null,
          contracts:[],
          biconomy:null,
          permitClient:null,
          contractsNetworks:{},
          networkInitialized:false,
          erc20ForwarderClient:null,
          contractsInitialized:false
        },() => {
          this.checkNetwork();
        });
      }
    });
  }

  componentDidMount = async () => {
    // this.initSimpleID();
    // this.initWeb3();

    this.connectGnosisSafe();

    // TEST - Manually triggers transaction error
    // this.openTransactionErrorModal(null,'Your Ledger device is Ineligible');

    window.testTransaction = (method) => {
      const transaction = this.createTransaction();
      transaction.method = method;
      this.addTransaction(transaction);
      return transaction;
    }

    window.updateTransaction = (transaction,hash,status,params) => {
      // Add meta data to transaction
      transaction.status = status;
      transaction.params = params;
      transaction.type = "contract";
      transaction.created = Date.now();
      transaction.transactionHash = hash;

      // console.log('window.updateTransaction',transaction);

      this.updateTransaction(transaction);
      return transaction;
    }
  }

  connectGnosisSafe = () => {
    const gnosisSafeLoaded = this.props.connectors.gnosis.safeLoaded;
    if (gnosisSafeLoaded){
      const walletProvider = this.functionsUtil.getWalletProvider();
      const isGnosisSafe = this.props.connectors.gnosis.safeLoaded && !!this.props.connectors.gnosis.provider.safe;
      // console.log('connectGnosisSafe - isGnosisSafe',this.props.connectors.gnosis.provider.safe,isGnosisSafe,walletProvider);
      if (isGnosisSafe){
        // console.log('connectGnosisSafe - select gnosis connector');
        this.props.setConnector('gnosis','gnosis');
      } else if (walletProvider === 'gnosis') {
        // console.log('connectGnosisSafe - Reset to Infura, isGnosisSafe = false');
        this.props.setConnector('Infura',null);
      }
    }
  }

  componentDidUpdate = async (prevProps, prevState) => {

    this.loadUtils();

    // console.log('componentDidUpdate',prevProps.connectorName,this.props.connectorName,this.props.context.connectorName,prevProps.context.active,this.props.context.active,(this.props.context.error ? this.props.context.error.message : null));

    const gnosisSafeLoaded = !this.state.gnosisSafeLoaded && this.props.connectors.gnosis.safeLoaded;
    if (gnosisSafeLoaded){
      // console.log('gnosisSafeLoaded');
      this.setState({
        gnosisSafeLoaded:true
      },() => {
        this.connectGnosisSafe();
      });
    }

    if ((prevProps.connectorName !== this.props.connectorName && this.props.connectorName) || (this.props.context.active && prevProps.context.active !== this.props.context.active)){
      // console.log('componentDidUpdate',prevProps.connectorName,this.props.connectorName,prevProps.context.active,this.props.context.active,this.state.networkInitialized);
      this.initWeb3();
    } else if ( prevProps.context !== this.props.context ){
      if (this.props.context.error instanceof Error && this.props.context.error.message.length){
        const errorMessage = this.props.context.error.message;
        const isWalletConnectClosedModalError = (errorMessage === 'User closed WalletConnect modal' || errorMessage === 'User closed modal');
        // this.functionsUtil.customLog('componentDidUpdate',setConnectorName,errorMessage);
        if (setConnectorName === 'WalletConnect' && isWalletConnectClosedModalError){
          // this.functionsUtil.customLog('WalletConnect disconnected! Set Infura connector');
          this.props.setConnector('Infura',null);
          // this.functionsUtil.removeStoredItem('walletProvider');
          // this.functionsUtil.removeStoredItem('connectorName');
          // this.functionsUtil.setLocalStorage('context',JSON.stringify({active:this.props.context.active,connectorName:'Infura'}));
          setConnectorName = null;
          // await this.props.context.setConnector('Infura');
        } else if (!isWalletConnectClosedModalError) {
          this.openConnectionErrorModal(null,errorMessage);
        } else {
          // console.log('initWeb3_2',prevProps.connectorName,this.props.connectorName,prevProps.context.active,this.props.context.active);
          this.initWeb3();
        }
      // WalletConnect double trigger initWeb3
      } else if (this.props.context.active && this.props.context.connectorName!=='WalletConnect' && this.props.connectorName==='WalletConnect'){
        // console.log('initWeb3_3',prevProps.context.connectorName,this.props.context.connectorName,prevProps.context.active,this.props.context.active);
        this.initWeb3();
      }
    } else if ((this.props.context.connectorName && this.props.context.connectorName !== this.props.connectorName) || prevProps.customAddress !== this.props.customAddress){
      // console.log('initWeb3_4',prevProps.context.connectorName,this.props.context.connectorName,prevProps.context.active,this.props.context.active);
      this.initWeb3();
    }

    const currentNetworkChanged = this.state.networkInitialized && prevState.network.current.id !== this.state.network.current.id;
    if (currentNetworkChanged){
      // console.log('currentNetworkChanged',this.state.networkInitialized,JSON.stringify(prevState.network),JSON.stringify(this.state.network));
      this.initWeb3();
    }

    const requiredNetworkChanged = prevState.network.required.id !== this.state.network.required.id;
    if (requiredNetworkChanged){
      // console.log('requiredNetworkChanged',this.state.networkInitialized,JSON.stringify(prevState.network),JSON.stringify(this.state.network));
      this.setState({
        contracts:[],
        contractsNetworks:{},
        contractsInitialized:false
      }, () => {
        this.props.setNetwork(this.state.network);
        this.initWeb3();
      });
    }

    const availableStrategiesChanged = (!prevProps.availableStrategies && this.props.availableStrategies) || (prevProps.availableStrategies && this.props.availableStrategies && JSON.stringify(Object.keys(prevProps.availableStrategies)) !== JSON.stringify(Object.keys(this.props.availableStrategies)));
    // console.log('availableStrategiesChanged',this.props.availableStrategies,availableStrategiesChanged);
    if (availableStrategiesChanged){
      await this.initializeContracts();
    }

    const customAddressChanged = prevProps.customAddress !== this.props.customAddress;
    const contextAccountChanged = prevProps.context.account !== this.props.context.account;
    const accountDisconnected = prevProps.connectorName !== this.props.connectorName && this.props.connectorName === 'Infura';
    if (contextAccountChanged){
      // console.log('contextAccountChanged',prevProps.context.account,this.props.context.account,contextAccountChanged);
    }

    if (accountDisconnected){
      // console.log('accountDisconnected',prevProps.connectorName,this.props.connectorName,accountDisconnected);
    }

    if (customAddressChanged || contextAccountChanged || accountDisconnected){
      this.initAccount();
    }

    // const availableTokensChanged = prevProps.availableTokens && this.props.availableTokens && JSON.stringify(Object.keys(prevProps.availableTokens)) !== JSON.stringify(Object.keys(this.props.availableTokens));

    // Reset tokenDecimals if token is changed
    const tokenChanged = prevProps.selectedToken !== this.props.selectedToken;
    if (tokenChanged){
      this.setState({
        tokenDecimals: null
      });
    }

    // this.functionsUtil.customLog(prevProps.enableUnderlyingWithdraw,this.props.enableUnderlyingWithdraw,this.state.enableUnderlyingWithdraw);
    if (prevProps.enableUnderlyingWithdraw !== this.props.enableUnderlyingWithdraw){
      this.setState({
        enableUnderlyingWithdraw:this.props.enableUnderlyingWithdraw
      });
    }

    const accountChanged = prevState.account !== this.state.account;
    if (accountChanged){
      this.initMaticPosClient();
    }

    if (localStorage){
      const context = JSON.parse(localStorage.getItem('context'));
      if (!context || (this.props.context.active !== context.active || this.props.context.connectorName !== context.connectorName)){
        this.functionsUtil.setLocalStorage('context',JSON.stringify({active:this.props.context.active,connectorName:this.props.context.connectorName}));
      }
    }

    const selectedNetworkChanged = prevProps.config.requiredNetwork !== this.props.config.requiredNetwork;
    if (selectedNetworkChanged){
      // console.log('selectedNetworkChanged',JSON.stringify(prevProps.config.requiredNetwork),this.props.config.requiredNetwork);
      this.handleNetworkChanged();
    }
  }

  initMaticPosClient = async () => {
    let maticPOSClient = null;
    let maticPlasmaClient = null;

    // const infuraConfig = globalConfigs.network.providers.infura;
    const networkId = this.state.network.required.id;
    const polygonConfig = globalConfigs.network.providers.polygon;

    const currentNetwork = this.functionsUtil.getGlobalConfig(['network','availableNetworks',networkId]);
    const polygonNetworkId = currentNetwork.provider === 'polygon' ? networkId : this.functionsUtil.getGlobalConfig(['network','providers','polygon','networkPairs',networkId]);

    const availableNetworks = this.functionsUtil.getGlobalConfig(['network','availableNetworks']);
    const networkConfig = availableNetworks[networkId];

    if (polygonConfig && polygonConfig.enabled && polygonConfig.rpc && Object.keys(polygonConfig.rpc).includes(parseInt(polygonNetworkId).toString())){
      const web3PolygonRpc = polygonConfig.rpc[polygonNetworkId]+this.functionsUtil.getGlobalConfig(['network','providers','polygon','key']);
      const web3InfuraRpc = this.functionsUtil.getGlobalConfig(['network','providers','infura','rpc',networkId])+this.functionsUtil.getGlobalConfig(['network','providers','infura','key']);

      const maticProvider = new Web3(new Web3.providers.HttpProvider(web3PolygonRpc));
      const parentProvider = new Web3(new Web3.providers.HttpProvider(web3InfuraRpc));
      // console.log('parentProvider',web3InfuraRpc);

      // install web3 plugin
      use(Web3ClientPlugin);

      maticPOSClient = new POSClient();

      const maticPOSClientConfig = {
        parent: {
          provider: parentProvider,
          defaultConfig: {
            from : this.state.account
          }
        },
        child: {
          provider: maticProvider,
          defaultConfig: {
            from : this.state.account
          }
        },
        network: networkConfig.network,
        version: networkConfig.version
      };

      await maticPOSClient.init(maticPOSClientConfig);
    }

    window.maticPOSClient = maticPOSClient;
    window.maticPlasmaClient = maticPlasmaClient;

    this.setState({
      maticPOSClient,
      maticPlasmaClient
    });
  }

  // Initialize a web3 provider
  initWeb3 = async (connectorName=null) => {

    // Detect ethereum provider
    // const metamaskProvider = await detectEthereumProvider();
    // if (metamaskProvider && (!window.ethereum || window.ethereum !== metamaskProvider)){
    //   window.ethereum = metamaskProvider;
    // }
    if (!this.state.networkInitialized){
      return false;
    }

    const context = this.props.context;
    const networkId = this.state.network.required.id;
    const walletProvider = this.functionsUtil.getWalletProvider();

    // console.log(this.functionsUtil.strToMoment().format('HH:mm:ss'),'initWeb3 - START',networkId,walletProvider);

    const availableNetworks = this.functionsUtil.getGlobalConfig(['network','availableNetworks']);
    const networkConfig = availableNetworks[networkId];
    const provider = networkConfig ? networkConfig.provider : 'infura';
    const web3RpcKey = this.functionsUtil.getGlobalConfig(['network','providers',provider,'key']);
    const web3Rpc = this.functionsUtil.getGlobalConfig(['network','providers',provider,'rpc',networkId])+web3RpcKey;

    const useWeb3Provider = this.state.network.isCorrectNetwork;
    const web3InfuraRpc = this.functionsUtil.getGlobalConfig(['network','providers','infura','rpc',networkId])+this.functionsUtil.getGlobalConfig(['network','providers','infura','key']);

    const enabledNetworks = this.functionsUtil.getGlobalConfig(['network','enabledNetworks']);
    const web3Providers = Object.keys(availableNetworks).filter( netId => enabledNetworks.includes(parseInt(netId)) ).reduce( (acc,netId) => {
      const networkConfig = availableNetworks[netId];
      const providerConfig = this.functionsUtil.getGlobalConfig(['network','providers',networkConfig.provider]);
      const providerRpc = providerConfig.rpc[netId]+providerConfig.key;
      acc[netId] = new Web3(new Web3.providers.HttpProvider(providerRpc));
      return acc;
    },{});

    let web3Polygon = null;
    const web3Infura = new Web3(new Web3.providers.HttpProvider(web3InfuraRpc));

    const polygonConfig = globalConfigs.network.providers.polygon;
    const currentNetwork = this.functionsUtil.getGlobalConfig(['network','availableNetworks',networkId]);
    const polygonNetworkId = currentNetwork.provider === 'polygon' ? networkId : this.functionsUtil.getGlobalConfig(['network','providers','polygon','networkPairs',networkId]);
    if (polygonConfig && polygonConfig.enabled && polygonConfig.rpc && Object.keys(polygonConfig.rpc).includes(parseInt(polygonNetworkId).toString())){
      const web3PolygonRpc = polygonConfig.rpc[polygonNetworkId]+this.functionsUtil.getGlobalConfig(['network','providers','polygon','key']);
      web3Polygon = new Web3(new Web3.providers.HttpProvider(web3PolygonRpc));
      window.web3Polygon = web3Polygon;
    }

    let web3 = useWeb3Provider ? context.library : null;

    // 0x Instant Wallet Provider Injection
    if (!window.RimbleWeb3_context || context.connectorName !== window.RimbleWeb3_context.connectorName){
      window.RimbleWeb3_context = context;
    }

    // Reset setConnectorName if force connectorName
    if (connectorName){
      setConnectorName = null;
    } else {
      connectorName = this.props.connectorName;
    }

    // if (connectorName !== 'Infura' && connectorName !== 'Injected' && !context.library){
    //   connectorName = 'Infura';
    //   this.props.setConnector('Infura',null);
    //   if (web3 && typeof web3.currentProvider.disable === 'function'){
    //     web3.currentProvider.disable();
    //   } else if (context.connector && typeof context.connector.disable === 'function'){
    //     context.connector.disable();
    //   }
    // }

    // const last_context = localStorage ? JSON.parse(localStorage.getItem('context')) : null;

    // this.functionsUtil.customLog('initWeb3',context.active,connectorName,context.connectorName,context.connector,(web3 && web3.currentProvider ? web3.currentProvider.disable : null),(context.connector ? context.connector.disable : null));
    if (context && connectorName === 'Infura' && connectorName !== context.connectorName){
      if (web3 && typeof web3.currentProvider.disable === 'function'){
        web3.currentProvider.disable();
      } else if (context.connector && typeof context.connector.disable === 'function'){
        context.connector.disable();
      }
      web3 = null;
      setConnectorName = null;
    }

    const connectorNameChanged = (context.connectorName && context.connectorName !== connectorName) || (connectorName !== 'Infura' && connectorName !== setConnectorName);

    if (connectorName !== 'ledgerLive'){
      if (!context.active || connectorNameChanged) {
        // Select preferred web3 provider
        if (connectorName && connectorNameChanged){

          if (connectorName === 'gnosis' && !this.state.gnosisSafeLoaded){
            return false;
          }

          // this.functionsUtil.customLog('initWeb3 set connector',connectorName);
          setConnectorName = connectorName;
          await context.setConnector(connectorName);
          // await context.setFirstValidConnector([connectorName, 'Infura']);

          // console.log('initWeb3 - setConnector('+connectorName+') and return web3');
          return web3;
        }
      }
    }

    let web3Host = web3Rpc;
    let web3Provider = null;

    // console.log('initWeb3-PRE',connectorName,web3,context);

    if (!web3) { // safety web3 implementation
      if (window.ethereum) {
        this.functionsUtil.customLog("Using modern web3 provider.");
        web3Provider = window.ethereum;
      } else if (window.web3) {
        this.functionsUtil.customLog("Legacy web3 provider. Try updating.");
        web3Provider = window.web3;
      } else {
        this.functionsUtil.customLog("Non-Ethereum browser detected. Using Infura fallback.");
        web3Host = web3InfuraRpc;
      }
    } else {
      web3Provider = web3.currentProvider;
    }

    let forceCallback = false;

    if ((!connectorName || connectorName === 'Infura') && web3Provider && typeof web3Provider.enable === 'function'){
      try {
        await web3Provider.enable();
      } catch (connectionError){
        web3Provider = null;
        web3Host = web3InfuraRpc;
        forceCallback = true;
      }
    }

    // Ledger Live
    if (connectorName === 'ledgerLive'){
      web3Provider = new IFrameEthereumProvider();
    }

    // Injected web3 provider
    if (web3Provider && useWeb3Provider){
      web3 = new Web3(web3Provider);
    // Infura
    } else if (web3Host) {
      web3 = web3Providers[networkId];
    }

    // console.log('initWeb3',connectorName,web3,context,web3Provider/*,web3Provider===context.library.currentProvider*/);

    const web3Callback = async (initWeb3Index) => {

      // console.log('web3Callback - CHECK INDEX',initWeb3Index,this.state.initWeb3Index,initWeb3Index === this.state.initWeb3Index);
      if (initWeb3Index !== this.state.initWeb3Index){
        return false;
      }

      window.web3Injected = this.state.web3;
      // window.web3InfuraInjected = this.state.web3Infura;

      if (typeof this.props.callbackAfterLogin === 'function'){
        this.props.callbackAfterLogin();
        this.props.setCallbackAfterLogin(null);
      }

      // console.log('web3Callback',this.state.network,this.state.biconomy,this.state.web3);

      // console.log(this.functionsUtil.strToMoment().format('HH:mm:ss'),'initWeb3 - web3Callback');

      // After setting the web3 provider, check network
      try {
        // console.log('checkNetwork_call');
        // Check network after injected web3 loaded
        const isGnosisSafe = this.props.connectors.gnosis.safeLoaded && !!this.props.connectors.gnosis.provider.safe;
        if (!this.state.network.isCorrectNetwork && isGnosisSafe){
          await this.checkNetwork();
        }

        if (this.state.network.isSupportedNetwork){
          await this.initializeContracts();
          if (context.active && context.connectorName===connectorName && context.account){
            // Login with biconomy
            if (this.state.biconomy){
              const biconomy = this.state.biconomy;
              const biconomyInfo = globalConfigs.network.providers.biconomy;
              if (biconomyInfo.enableLogin && !biconomy.isLogin && !biconomyLoginProcessing){
                biconomyLoginProcessing = true;
                biconomy.login(context.account, (error, response) => {
                  // this.functionsUtil.customLog('biconomy login',error,response);
                  // Failed to login with Biconomy
                  if (error) {
                    return this.setState({
                      biconomy:false,
                    },() => {
                      this.initAccount(context.account);
                    });
                  }

                  biconomyLoginProcessing = false;

                  if (response.transactionHash) {
                    this.initAccount(context.account);
                  } else if(response.userContract) {
                    this.initAccount(context.account);
                  }
                });
                return false;
              }
            }

            await this.initAccount(context.account);
          } else {
            await this.initAccount();
            // await this.setState({
            //   accountInizialized: true,
            //   account: this.props.customAddress
            // });
          }
        }
      // Initialize Infura Web3 and display error
      } catch (error) {
        this.openConnectionErrorModal(null,error.message);
      }
    }

    // Save original web3 connector in case Mexa initialization fails
    const originalWeb3 = web3;
    const initWeb3Index = parseInt(this.state.initWeb3Index)+1;


    this.setState({
      web3Infura,
      web3Polygon,
      initWeb3Index,
      web3Providers,
    },() => {
      // this.checkNetwork();
    });

    const biconomyInfo = globalConfigs.network.providers.biconomy;

    // console.log('initWeb3',connectorName,this.state.network,context,useWeb3Provider,web3Provider,web3Host,originalWeb3,web3,this.state.web3,web3!==this.state.web3);

    if (connectorName !== 'Infura' && biconomyInfo && biconomyInfo.enabled && biconomyInfo.supportedNetworks.includes(networkId) && (!walletProvider || !biconomyInfo.disabledWallets.includes(walletProvider.toLowerCase()))){

      const biconomyWeb3Provider = web3Provider ? web3Provider : new Web3.providers.HttpProvider(web3Host);
      if (this.state.biconomy === null || this.state.biconomy.currentProvider !== biconomyWeb3Provider ){
        const biconomy = new Biconomy(biconomyWeb3Provider,biconomyInfo.params);
        if (biconomy && typeof biconomy.onEvent === 'function'){

          // Reset contracts initialized
          this.setState({
            accountInizialized:false,
            contractsInitialized:false
          });

          web3 = new Web3(biconomy);
          biconomy.onEvent(biconomy.READY, () => {
            if (this.componentUnmounted || this.state.biconomy === false || (this.state.biconomy === biconomy && web3 !== this.state.web3)){
              // console.log('biconomy already loaded',biconomyWeb3Provider,this.state.biconomy===biconomy);
              return false;
            }
            
            const permitClient = biconomy.permitClient;
            const erc20ForwarderClient = biconomy.erc20ForwarderClient;

            const newState = {
              web3,
              biconomy,
              web3Infura,
              permitClient,
              web3Providers,
              erc20ForwarderClient
            };
            // console.log('biconomy',newState);

            if (web3 !== this.state.web3){
              this.setState(newState, () => web3Callback(initWeb3Index));
            }
          }).onEvent(biconomy.ERROR, (error, message) => {
            console.error('Biconomy error',error,message,this.state.biconomy);
            web3 = originalWeb3;
            // Handle error while initializing mexa
            if (this.state.biconomy !== false){
              this.setState({
                web3,
                biconomy:false
              }, () => web3Callback(initWeb3Index));
            }
          });
        } else {
          this.setState({
            web3,
            biconomy:false
          }, () => web3Callback(initWeb3Index));
        }
      }
    } else {
      if (web3 !== this.state.web3){
        this.setState({
          web3
        }, () => web3Callback(initWeb3Index) );
      } else if (context.account || forceCallback){
        web3Callback(initWeb3Index);
      }
    }

    return web3;
  }

  initContract = async (name, address, abi, useInfuraProvider=false) => {
    // console.log(`initContract: ${name} - addr: ${address}`);
    return await this.createContract(name, address, abi, useInfuraProvider);
  }

  initContractWithoutSet = (name, address, abi, networkId=null) => {
    // Reset networkId is equal to injected
    if (networkId && parseInt(networkId) === parseInt(this.state.network.required.id) && this.state.network.isCorrectNetwork){
      networkId = null;
    }
    const web3Provider = networkId && this.state.web3Providers[networkId] ? this.state.web3Providers[networkId] : (this.state.network.isCorrectNetwork ? this.state.web3 : this.state.web3Providers[this.state.network.required.id]);

    if (!web3Provider){
      return null;
    }

    // Create contract on initialized web3 provider with given abi and address
    try {
      const contract = new web3Provider.eth.Contract(abi, address);
      return {name, contract};
    } catch (error) {
      this.functionsUtil.customLogError("Could not create contract.",name,address,error);
    }

    return null;
  }

  createContract = async (name, address, abi, useInfuraProvider=false) => {

    const web3Provider = useInfuraProvider && this.state.web3Infura ? this.state.web3Infura : (this.state.network.isCorrectNetwork ? this.state.web3 : this.state.web3Providers[this.state.network.required.id]);

    // if (name==='ERC20Predicate'){
    //   console.log('createContract',this.state.network,web3Provider);
    // }

    if (!web3Provider || !abi){
      return null;
    }

    // Create contract on initialized web3 provider with given abi and address
    try {
      const contract = new web3Provider.eth.Contract(abi, address);
      const contractInfo = {name, contract};

      this.setState(prevState => {
        // Remove old contract
        const contracts = prevState.contracts.filter( c => c.name !== contractInfo.name );
        // Insert updated contract
        contracts.push(contractInfo);
        return {
          contracts
        };
      });

      return contractInfo;
    } catch (error) {
      console.error("Could not create contract.",name,address,abi,error);
    }

    return null;
  }

  initSimpleID = () => {

    if (this.state.simpleID){
      return this.state.simpleID;
    }

    const simpleIDInfo = globalConfigs.network.providers.simpleID;
    let simpleID = null;
    const networkId = this.state.network.current.id || this.state.network.required.id;

    if (simpleIDInfo && simpleIDInfo.enabled && simpleIDInfo.supportedNetworks.indexOf(networkId) !== -1 ){
      const simpleIDParams = simpleIDInfo.params;
      simpleIDParams.network = simpleIDInfo.getNetwork(this.state.network.current.id,globalConfigs.network.availableNetworks);
      simpleID = new SimpleID(simpleIDParams);
    }

    window.simpleID = simpleID;

    this.setState({
      simpleID
    });

    return simpleID;
  }

  initAccount = async (account=false) => {
    
    const customAddress = this.props.customAddress;
    const walletProvider = this.functionsUtil.getWalletProvider('Infura');

    if (customAddress){
      // Set custom account
      return this.setState({
        account:customAddress,
        accountInizialized:true,
      },()=>{
        this.getAccountBalance();
      });
    } else if (this.props.connectorName === 'Infura' || !this.props.connectorName || !this.props.context.active){
      return this.setState({
        account:null,
        accountInizialized:true
      });
    }

    // console.log('initAccount_1',this.props.connectorName,this.props.context,this.props.context.account,account,this.state.account);

    try {

      if (this.props.context.active && this.props.context.connectorName===this.props.connectorName && this.props.context.account){
        account = this.props.context.account;
      }

      if (!account){
        const wallets = await this.state.web3.eth.getAccounts();

        if (wallets && wallets.length){
          account = wallets[0];
        }
      }

      if (!account){
        account = this.props.context.account;
      }

      if (!account || this.state.account === account){
        return this.setState({
          accountInizialized: true
        });
      }

      // console.log('initAccount_2',account);

      // Request account access if needed
      if (account){

        // Send address info to SimpleID
        const simpleID = this.initSimpleID();

        if (simpleID){

          const notifications = await simpleID.notifications();

          if (notifications && notifications.length && window.$crisp){

            let shownNotifications = [];
            if (localStorage){
              shownNotifications = localStorage.getItem('shownNotifications') && JSON.parse(localStorage.getItem('shownNotifications')) ? JSON.parse(localStorage.getItem('shownNotifications')) : [];
            }

            notifications.forEach((n,i) => {

              const notificationId = n.name;

              // Show notification if not shown already
              if (shownNotifications.indexOf(notificationId) === -1){
                window.$crisp.push(["do", "message:show", ["text", this.functionsUtil.normalizeSimpleIDNotification(n.content) ]]);

                // Save notification id
                shownNotifications.push(notificationId);
              }
            });

            // Store shown notification
            if (localStorage){
              this.functionsUtil.setLocalStorage('shownNotifications',JSON.stringify(shownNotifications));
            }
          }
        }

        // Send Google Analytics connection event
        this.functionsUtil.sendGoogleAnalyticsEvent({
          eventCategory: 'Connect',
          eventAction: 'connected',
          eventLabel: walletProvider
        });

        // this.functionsUtil.customLog('initAccount',account);

        // Set custom account
        this.setState({
          account,
          // web3SocketProvider,
          accountInizialized: true
        },()=>{
          // After account is complete, get the balance
          this.getAccountBalance();
        });

        // TODO subscribe for account changes, no polling
        // set a state flag which indicates if the subscribe handler has been
        // called at least once
      } else {
        return this.setState({
          account:null,
          accountInizialized: true,
        });
      }
    } catch (error) {

      this.setState({
        accountInizialized: true
      });

      // User denied account access...
      this.functionsUtil.customLog("User cancelled connect request. Error:", error);

      // console.log(error);

      // Catch ledger error
      if (error && error.message && error.message.includes('MULTIPLE_OPEN_CONNECTIONS_DISALLOWED')) {
        return;
      }

      // Send Sentry connection error
      const isError = error instanceof Error;
      if (this.functionsUtil.checkUrlOrigin() && isError){
        Sentry.captureException(error);
      }

      // Reject Connect
      // this.rejectAccountConnect(error);
    }
  }

  // TODO: Can this be moved/combined?
  rejectAccountConnect = error => {
    let modals = { ...this.state.modals };
    modals.data.accountConnectionPending = false;
    modals.data.userRejectedConnect = true;
    this.setState({ modals });
  }

  getAccountBalance = async (increaseAmount) => {

    if (!this.state.web3){
      return false;
    }

    increaseAmount = increaseAmount ? this.functionsUtil.BNify(increaseAmount) : null;

    try {

      let [
        accountBalance,
        accountBalanceToken,
        tokenDecimals
      ] = await Promise.all([
        this.state.web3.eth.getBalance(this.state.account), // Get ETH balance
        this.getTokenBalance(this.state.account), // Get token balance
        this.getTokenDecimals()
      ]);

      // console.log('getAccountBalance',this.state.web3,this.state.account,accountBalance,accountBalanceToken,tokenDecimals);

      if (accountBalance) {

        // Convert to wei if decimals found
        if (accountBalance.toString().includes('.')){
          accountBalance = this.state.web3.utils.toWei(accountBalance);
        }

        // Convert to Eth amount
        accountBalance = this.state.web3.utils.fromWei(
          accountBalance,
          'ether'
        );

        accountBalance = this.functionsUtil.BNify(accountBalance).toString();

        this.setState({
          accountBalance
        });

        this.functionsUtil.customLog("account balance: ", accountBalance);
      }

      // this.functionsUtil.customLog('accountBalance',res,(accountBalanceToken ? accountBalanceToken.toString() : null),tokenDecimals,increaseAmount);

      if (accountBalanceToken) {

        accountBalanceToken = this.functionsUtil.BNify(accountBalanceToken);

        // Increase balance amount if passed and balance didn't change
        if (increaseAmount && this.state.accountBalanceToken && this.functionsUtil.normalizeTokenAmount(this.state.accountBalanceToken,tokenDecimals).toString() === accountBalanceToken.toString()){
          accountBalanceToken = accountBalanceToken.plus(increaseAmount);
        }
        
        accountBalanceToken = this.functionsUtil.fixTokenDecimals(accountBalanceToken,tokenDecimals).toString();

        // this.functionsUtil.customLog('increaseAmount',(increaseAmount ? increaseAmount.toString() : '0'),(this.state.accountBalanceToken ? this.state.accountBalanceToken.toString() : '0'),(accountBalanceToken ? accountBalanceToken.toString() : 'ERROR'));
        // this.functionsUtil.customLog(`account balance ${this.props.selectedToken}: `, accountBalanceToken);

        this.setState({
          accountBalanceToken,
          [`accountBalance${this.props.selectedToken}`]:accountBalanceToken
        });

      } else {
        this.functionsUtil.customLog('accountBalanceToken is not set:',accountBalanceToken);
      }
    } catch (error) {
      this.functionsUtil.customLog("Failed to get account balance.", error);
    }
  }

  initializeContracts = async () => {

    if (!this.state.web3 || !this.props.availableStrategies){
      return false;
    }

    // console.log(this.functionsUtil.strToMoment().format('HH:mm:ss'),'initializeContracts - START',this.state.network.required.id,this.props.availableStrategies,this.props.availableStrategiesNetworks);

    const contracts = [];
    const contractsNetworks = {};
    const requiredNetworkId = parseInt(this.state.network.required.id);
    const availableNetworks = this.functionsUtil.getGlobalConfig(['network','enabledNetworks']);

    if (this.props.availableStrategiesNetworks){
      Object.keys(this.props.availableStrategiesNetworks).forEach( networkId => {
        contractsNetworks[networkId] = [];
        const strategies = this.props.availableStrategiesNetworks[networkId];
        Object.keys(strategies).forEach( strategy => {
          const availableTokens = this.props.availableStrategiesNetworks[networkId][strategy];
          Object.keys(availableTokens).forEach( token => {
            const tokenConfig = availableTokens[token];

            this.functionsUtil.customLog('initializeContracts, init contract',token, tokenConfig.address);
            contractsNetworks[networkId].push(this.initContractWithoutSet(token, tokenConfig.address, tokenConfig.abi, networkId));

            this.functionsUtil.customLog('initializeContracts, init contract',tokenConfig.idle.token, tokenConfig.idle.address);
            contractsNetworks[networkId].push(this.initContractWithoutSet(tokenConfig.idle.token, tokenConfig.idle.address, tokenConfig.idle.abi, networkId));

            tokenConfig.protocols.forEach(async (p,i) => {
              this.functionsUtil.customLog('initializeContracts, init '+p.token+' contract',p);
              contractsNetworks[networkId].push(this.initContractWithoutSet(p.token, p.address, p.abi, networkId));
            });
          })
        });
      });
    }

    // console.log('initializeContracts',this.state.network,this.state.web3,contracts,this.props.availableStrategies);

    const contractsToInitialize = this.functionsUtil.getGlobalConfig(['contracts',requiredNetworkId]);
    if (contractsToInitialize){
      Object.keys(contractsToInitialize).forEach( contractName => {
        const contractInfo = contractsToInitialize[contractName];
        if (contractInfo.address !== null && contractInfo.abi !== null){
          const networkId = contractInfo.networkId ? parseInt(contractInfo.networkId) : requiredNetworkId;
          // console.log('initializeContracts, init contract', requiredNetworkId, contractName, contractInfo.address);
          contracts.push(this.initContractWithoutSet(contractName, contractInfo.address, contractInfo.abi, networkId));
          contractsNetworks[requiredNetworkId].push(this.initContractWithoutSet(contractName, contractInfo.address, contractInfo.abi, networkId));
        }
      });
    }

    const govTokens = this.functionsUtil.getGlobalConfig(['govTokens']);
    if (govTokens){
      Object.keys(govTokens).forEach( token => {
        const govTokenConfig = govTokens[token];
        if (!govTokenConfig.enabled){
          return;
        }
        availableNetworks.forEach( networkId => {
          // Initialize govToken contracts
          const contractAddress = govTokenConfig.addresses && govTokenConfig.addresses[networkId] ? govTokenConfig.addresses[networkId] : govTokenConfig.address;
          this.functionsUtil.customLog('initializeContracts, init contract', token, contractAddress);
          if (parseInt(networkId) === parseInt(requiredNetworkId)){
            contracts.push(this.initContractWithoutSet(token, contractAddress, govTokenConfig.abi));
          }
          contractsNetworks[networkId].push(this.initContractWithoutSet(token, contractAddress, govTokenConfig.abi, networkId));
        });
      });
    }

    if (this.props.availableStrategies){
      // Initialize Tokens Contracts
      Object.keys(this.props.availableStrategies).forEach( strategy => {
        const availableTokens = this.props.availableStrategies[strategy];
        Object.keys(availableTokens).forEach( token => {
          const tokenConfig = availableTokens[token];

          this.functionsUtil.customLog('initializeContracts, init contract',token, tokenConfig.address);
          contracts.push(this.initContractWithoutSet(token, tokenConfig.address, tokenConfig.abi));

          // Initialize idleTokens contracts
          this.functionsUtil.customLog('initializeContracts, init contract',tokenConfig.idle.token, tokenConfig.idle.address);
          contracts.push(this.initContractWithoutSet(tokenConfig.idle.token, tokenConfig.idle.address, tokenConfig.idle.abi));

          // Initialize protocols contracts
          tokenConfig.protocols.forEach(async (p,i) => {
            this.functionsUtil.customLog('initializeContracts, init '+p.token+' contract',p);
            contracts.push(this.initContractWithoutSet(p.token, p.address, p.abi));
          });

          // Check migration contract
          if (tokenConfig.migration){

            if (tokenConfig.migration.oldContract){
              const oldContract = tokenConfig.migration.oldContract;
              this.functionsUtil.customLog('initializeContracts, init '+oldContract.name+' contract',oldContract);
              contracts.push(this.initContractWithoutSet(oldContract.name, oldContract.address, oldContract.abi));
            }

            // Initialize protocols contracts
            if (tokenConfig.migration.oldProtocols){
              tokenConfig.migration.oldProtocols.forEach(async (p,i) => {
                this.functionsUtil.customLog('initializeContracts, init '+p.token+' contract',p);
                contracts.push(this.initContractWithoutSet(p.token, p.address, p.abi));
              });
            }

            if (tokenConfig.migration.migrationContract){
              const migrationContract = tokenConfig.migration.migrationContract;
              this.functionsUtil.customLog('initializeContracts, init '+migrationContract.name+' contract',migrationContract);
              contracts.push(this.initContractWithoutSet(migrationContract.name, migrationContract.address, migrationContract.abi));
            }
          }
        })
      });
    }

    const tranchesConfig = this.functionsUtil.getGlobalConfig(['strategies','tranches']);
    if (this.props.availableTranches){
      Object.keys(this.props.availableTranches).forEach( protocol => {
        const tokens = this.props.availableTranches[protocol];
        Object.keys(tokens).forEach( token => {
          const tokenConfig = tokens[token];
          if (!tranchesConfig.availableNetworks || tranchesConfig.availableNetworks.includes(requiredNetworkId)){
            if (tokenConfig.abi){
              contracts.push(this.initContractWithoutSet(tokenConfig.token,tokenConfig.address,tokenConfig.abi));
            }
            contracts.push(this.initContractWithoutSet(tokenConfig.AA.name,tokenConfig.AA.address,tokenConfig.AA.abi));
            contracts.push(this.initContractWithoutSet(tokenConfig.BB.name,tokenConfig.BB.address,tokenConfig.BB.abi));
            contracts.push(this.initContractWithoutSet(tokenConfig.CDO.name,tokenConfig.CDO.address,tokenConfig.CDO.abi));
            contracts.push(this.initContractWithoutSet(tokenConfig.AA.CDORewards.name,tokenConfig.AA.CDORewards.address,tokenConfig.AA.CDORewards.abi));
            contracts.push(this.initContractWithoutSet(tokenConfig.BB.CDORewards.name,tokenConfig.BB.CDORewards.address,tokenConfig.BB.CDORewards.abi));
          }

          if (tokenConfig.abi){
            contractsNetworks[1].push(this.initContractWithoutSet(tokenConfig.token,tokenConfig.address,tokenConfig.abi,1));
          }
          contractsNetworks[1].push(this.initContractWithoutSet(tokenConfig.AA.name,tokenConfig.AA.address,tokenConfig.AA.abi,1));
          contractsNetworks[1].push(this.initContractWithoutSet(tokenConfig.BB.name,tokenConfig.BB.address,tokenConfig.BB.abi,1));
          contractsNetworks[1].push(this.initContractWithoutSet(tokenConfig.CDO.name,tokenConfig.CDO.address,tokenConfig.CDO.abi,1));
          contractsNetworks[1].push(this.initContractWithoutSet(tokenConfig.AA.CDORewards.name,tokenConfig.AA.CDORewards.address,tokenConfig.AA.CDORewards.abi,1));
          contractsNetworks[1].push(this.initContractWithoutSet(tokenConfig.BB.CDORewards.name,tokenConfig.BB.CDORewards.address,tokenConfig.BB.CDORewards.abi,1));
        });
      });
    }

    const newContracts = Object.assign([],this.state.contracts);
    contracts.forEach( contractInfo => {
      if (contractInfo){
        const contractFound = newContracts.find( c => c.name===contractInfo.name );
        if (!contractFound){
          newContracts.push(contractInfo);
        } else {
          const contractIndex = newContracts.indexOf(contractFound);
          newContracts[contractIndex] = contractInfo;
        }
      }
    });

    // console.log('initializeContracts',newContracts);

    const newState = {
      contractsNetworks,
      contracts:newContracts,
      contractsInitialized:true
    };

    return this.setState(newState);
  }

  getContractByName = async (contractName) => {
    let contract = this.state.contracts.find(c => c.name === contractName);

    if (!contract && this.props.tokenConfig) {
      const tokenConfig = this.props.tokenConfig;
      contract = await this.initContract(contractName, tokenConfig.address, tokenConfig.abi);
    }

    return contract ? contract.contract : null;
  }

  getTokenDecimals = async () => {
    let tokenDecimals = null;

    if (!this.state.tokenDecimals){

      tokenDecimals = await this.functionsUtil.getTokenDecimals(this.props.selectedToken);

      this.setState({
        tokenDecimals
      });
    } else {
      tokenDecimals = await (new Promise( async (resolve, reject) => {
        resolve(this.state.tokenDecimals);
      }));
    }

    return tokenDecimals;
  }

  getTokenBalance = async (account) => {
    const contract = await this.getContractByName(this.props.selectedToken);

    if (!contract) {
      this.functionsUtil.customLogError('Wrong contract name', this.props.selectedToken);
      return null;
    }

    if (!contract.methods['balanceOf']){
      this.customLogError('Wrong method name balanceOf');
      return null;
    }

    return await contract.methods.balanceOf(account).call().catch(error => {
      this.functionsUtil.customLog(`Failed to get ${this.props.selectedToken} balance`, error);
    });
  }

  determineAccountLowBalance = () => {
    // If provided a minimum from config then use it, else default to 1
    const accountBalanceMinimum =
      typeof this.props.config !== "undefined" &&
      typeof this.props.config.accountBalanceMinimum !== "undefined"
        ? this.props.config.accountBalanceMinimum
        : 1;
    // Determine if the account balance is low
    const accountBalanceLow =
      this.state.accountBalance < accountBalanceMinimum;

    this.setState({
      accountBalanceLow
    });
  }

  connectAndValidateAccount = async (callbackAfterLogin) => {
    // Check for account
    if (!this.state.account) {
      this.props.setCallbackAfterLogin(callbackAfterLogin);
      // Show modal to connect account
      this.openConnectionModal();
    }
  }

  getRequiredNetwork = () => {
     const networkId = typeof this.props.config !== "undefined" && typeof this.props.config.requiredNetwork !== "undefined" ? this.props.config.requiredNetwork : globalConfigs.network.requiredNetwork;
     const networkName = networkId && globalConfigs.network.availableNetworks[networkId] ? globalConfigs.network.availableNetworks[networkId].name : 'unknown';
     return {
       id: networkId,
       name: networkName
     };
   }

   getCurrentNetwork = async (networkId=null) => {
     const currentWeb3 = this.functionsUtil.getCurrentWeb3();

     // console.log('getCurrentNetwork',this.state.web3,currentWeb3);

     networkId = parseInt(networkId) || await currentWeb3.eth.net.getId();
     const networkName = this.functionsUtil.getGlobalConfig(['network','availableNetworks',networkId,'name']) || await currentWeb3.eth.net.getNetworkType();

     return {
       id:networkId,
       name:networkName
     }
   }

  getNetworkId = async () => {
    try {
      return this.state.web3.eth.net.getId((error, networkId) => {
        let current = { ...this.state.network.current };
        current.id = networkId;
        let network = Object.assign({},this.state.network);
        network.current = current;
        network.isCorrectNetwork = globalConfigs.network.enabledNetworks.includes(networkId);
        this.setState({ network });
      });
    } catch (error) {
      this.functionsUtil.customLog("Could not get network ID: ", error);
    }
  }

  checkNetwork = async (networkId=null) => {
    const network = {...this.state.network};

    network.required = this.getRequiredNetwork();
    network.current = await this.getCurrentNetwork(networkId);

    const networkInitialized = !!network.current.id;
    network.isCorrectNetwork = !networkInitialized || network.current.id === network.required.id;
    network.isSupportedNetwork = !network.current.id || globalConfigs.network.enabledNetworks.includes(network.current.id);

    const currentNetworkChanged = network.current.id && network.current.id !== this.state.network.current.id;
    const requiredNetworkChanged = network.required.id && network.required.id !== this.state.network.required.id;

    const updateNetwork = !this.state.network.current.id || currentNetworkChanged || requiredNetworkChanged || !this.state.networkInitialized;

    // console.log('checkNetwork','networkId:'+networkId,', curr: '+this.state.network.current.id,', netID: '+network.current.id,', required: '+network.required.id,', correct: '+network.isCorrectNetwork,', update: '+updateNetwork);
    if (updateNetwork){
      this.setState({
        network,
        networkInitialized
      });
    }

    return network;
  }

  contractMethodSendWrapper = async (contractName, contractMethod, params = [], value = null, callback = null, callback_receipt = null, gasLimit = null, txData = null) => {
    // Is it on the correct network?
    if (!this.state.network.isCorrectNetwork) {
      // wrong network modal
      this.state.modals.methods.openWrongNetworkModal();
      return false;
    }

    // Is a wallet connected and verified?
    if (!this.state.account) {
      this.openConnectionModal();
      if (typeof callback === 'function') {
        callback(null,'account_not_connected');
      }
      return false;
    }

    // Are there a minimum amount of funds?
    if (this.state.accountBalanceLow) {
      this.openLowFundsModal();
      if (typeof callback === 'function') {
        callback(null,'account_balance_low');
      }
      return false;
    }

    // Is the contract loaded?

    // Create new tx and add to collection
    // Maybe this needs to get moved out of the wrapper?
    let transaction = this.createTransaction(txData);
    transaction.method = contractMethod;

    this.addTransaction(transaction);

    // Add meta data to transaction
    transaction.type = "contract";
    transaction.status = "started";
    transaction.params = params;

    // Show toast for starting transaction
    this.updateTransaction(transaction);

    const { account, contracts } = this.state;
    let contract = contracts.find(c => c.name === contractName);
    if (!contract) {
      if (typeof callback === 'function') {
        callback(null,'contract_not_found');
      }
      return this.functionsUtil.customLog(`No contract with name ${contractName}`);
    }

    contract = contract.contract;

    // Does the method exists?
    // if (typeof contract.methods[contractMethod] === 'undefined'){
    //   return false;
    // }

    let manualConfirmationTimeoutId = null;

    try {

      if (!value){
        value = this.functionsUtil.BNify(0);
      }

      this.functionsUtil.customLog('contractMethodSendWrapper',contractName,contract._address,account,contractMethod,params,(value ? { from: account, value } : { from: account }));

      // estimate gas price
      let gas = await contract.methods[contractMethod](...params)
        .estimateGas(value ? { from: account, value } : { from: account })
        .catch(e => console.error(e));

      if (gas) {

        gas = this.functionsUtil.BNify(gas);
        gas = gas.plus(gas.times(this.functionsUtil.BNify('0.2'))); // Increase 20% of enstimation

        // Check if gas is under the gasLimit param
        if (gasLimit && gas.lt(this.functionsUtil.BNify(gasLimit))){
          gas = this.functionsUtil.BNify(gasLimit);
        }

        // Convert gasLimit toBN with web3 utils
        gas = this.state.web3.utils.toBN(gas.integerValue(BigNumber.ROUND_FLOOR));
      }

      const confirmationCallback = (confirmationNumber, receipt) => {

        // this.functionsUtil.customLog('confirmationCallback', confirmationNumber, receipt);

        if (manualConfirmationTimeoutId){
          window.clearTimeout(manualConfirmationTimeoutId);
        }

        // this.functionsUtil.customLog('txOnConfirmation', receipt);
        // Update confirmation count on each subsequent confirmation that's received
        transaction.confirmationCount += 1;

        const call_callback = !globalConfigs.network.isForked && typeof callback === 'function' && transaction.confirmationCount===1;

        // How many confirmations should be received before informing the user
        const confidenceThreshold = this.props.config.requiredConfirmations || 1;

        if (transaction.confirmationCount === 1) {
          // Initial confirmation receipt
          transaction.status = "confirmed";
        } else if (transaction.confirmationCount < confidenceThreshold) {
          // Not enough confirmations to match threshold
        }

        if (transaction.confirmationCount === confidenceThreshold) {
          // Confirmations match threshold
          // Check the status from result since we are confident in the result
          if (receipt.status) {
            transaction.status = "success";
          } else if (!receipt.status) {
            transaction.status = "error";
          }
        } else if (transaction.confirmationCount > confidenceThreshold) {
          // Confidence threshold met
        }


        if (call_callback){
          // Update transaction with receipt details
          if (receipt){
            transaction.txReceipt = receipt;
          }
          transaction.recentEvent = "confirmation";
          this.updateTransaction(transaction);
          
          callback(transaction);

          this.functionsUtil.customLog('Confirmed', confirmationNumber, receipt, transaction);
        }
      };

      const manualConfirmation = (transactionHash,timeout) => {
        if (!transactionHash){
          return false;
        }
        this.state.web3.eth.getTransactionReceipt(transactionHash,(err,txReceipt) => {
          if (txReceipt && txReceipt.status){
            this.functionsUtil.customLog('Tx manualConfirmation', txReceipt);
            confirmationCallback(1,txReceipt);
          } else {
            manualConfirmationTimeoutId = window.setTimeout( () => manualConfirmation(transactionHash,timeout) , timeout);
          }
        });
      };

      const receiptCallback = receipt => {

        // this.functionsUtil.customLog('txOnReceipt', receipt);

        if (manualConfirmationTimeoutId){
          window.clearTimeout(manualConfirmationTimeoutId);
        }

        // Received receipt, met total number of confirmations
        if (receipt){
          transaction.txReceipt = receipt;
        }
        transaction.recentEvent = "receipt";

        // If the network is forked use the receipt for confirmation
        if (globalConfigs.network.isForked){
          transaction.status = "success";
          if (typeof callback === 'function') {
            callback(transaction);
          }
        } else {
          this.updateTransaction(transaction);

          // Transaction mined, wait for manual confirmation
          if (receipt.status){
            manualConfirmationTimeoutId = window.setTimeout( () => manualConfirmation(receipt.transactionHash,4000), 2000);
          }
        }
      };

      // const networkId = this.functionsUtil.getGlobalConfig(['network','requiredNetwork']);
      // const common = { customChain:{ chainId: 1337, networkId: 1337 } };

      return contract.methods[contractMethod](...params)
        .send(value ? { from: account, value, gas/*, common*/ } : { from: account, gas/*, common*/ })
        .on("transactionHash", hash => {
          this.functionsUtil.customLog('txOnTransactionHash', hash);

          if (!hash){
            this.functionsUtil.customLog('Skip transactionHash due to hash empty', hash);
            return false;
          }

          transaction.transactionHash = hash;
          transaction.status = "pending";
          transaction.recentEvent = "transactionHash";
          this.updateTransaction(transaction);

          if (callback_receipt){
            callback_receipt(transaction);
          }

          // Wait for manual confirmation only for mobile
          if (this.props.isMobile){
            if (manualConfirmationTimeoutId){
              window.clearTimeout(manualConfirmationTimeoutId);
            }
            manualConfirmationTimeoutId = window.setTimeout( () => manualConfirmation(hash,60000), 20000);
          }
        })
        .on("receipt", receiptCallback)
        .on("confirmation", confirmationCallback)
        .on("error", error => {

          console.log('Tx error',error);
          
          const isDeniedTx = error && error.message && typeof error.message.includes === 'function' ? error.message.includes('User denied transaction signature') : false;
          
          // Set error on transaction
          transaction.status = "error";
          transaction.recentEvent = "error";
          this.updateTransaction(transaction);


          // Show ToastProvider
          if (!isDeniedTx){
            window.toastProvider.addMessage("Something went wrong", {
              icon: 'Block',
              actionHref: "",
              actionText: "",
              variant: "failure",
              colorTheme: 'light',
              secondaryMessage: "Please retry",
            });

            const isError = error instanceof Error;

            if (typeof error.message !== 'undefined'){
              this.openTransactionErrorModal(null,error.message);
            } else if (this.functionsUtil.checkUrlOrigin() && isError){
              Sentry.captureException(error);
            }
          }

          if (typeof callback === 'function') {
            callback(transaction,error);
          }
        });
    } catch (error) {

      console.log('Tx catch error',error);

      transaction.status = "error";
      this.updateTransaction(transaction);

      // TODO: should this be a custom error? What is the error here?
      // TODO: determine how to handle error messages globally
      window.toastProvider.addMessage("Something went really wrong, we are sorry", {
        icon: 'Block',
        actionHref: "",
        actionText: "",
        variant: "failure",
        colorTheme: 'light',
        secondaryMessage: "Try refreshing the page :(",
      });

      const isDeniedTx = error && error.message ? error.message.includes('User denied transaction signature') : false;

      const isError = error instanceof Error;
      if ( this.functionsUtil.checkUrlOrigin() && isError && !isDeniedTx){
        Sentry.captureException(error);
      }

      if (typeof callback === 'function') {
        // this.functionsUtil.customLog('Tx Failed',error,transaction,typeof callback);
        callback(transaction,error);
      }

      return false;
    }
  }

  // Create tx
  createTransaction = (txData=null) => {
    let transaction = {
      ...txData
    };
    transaction.txReceipt = {};
    transaction.created = Date.now();
    transaction.confirmationCount = 0;
    transaction.status = "initialized";
    transaction.lastUpdated = Date.now();
    transaction.token = this.props.selectedToken;
    transaction.strategy = this.props.selectedStrategy;
    transaction.networkId = this.functionsUtil.getGlobalConfig(['network','requiredNetwork']);
    return transaction;
  }

  addTransaction = transaction => {
    const transactions = { ...this.state.transactions };
    transactions[`tx${transaction.created}`] = transaction;
    this.setState({ transactions });
  }

  // Add/update transaction in state
  updateTransaction = updatedTransaction => {
    const transactions = { ...this.state.transactions };
    const transaction = { ...updatedTransaction };
    transaction.lastUpdated = Date.now();
    transactions[`tx${updatedTransaction.created}`] = transaction;
    this.setState({ transactions });

    // Save transactions in localStorage only if pending or succeeded
    // console.log('updateTransaction',transaction);
    if (transaction.transactionHash){
      // Clear cached data
      this.functionsUtil.clearCachedData();

      // Store transaction
      this.functionsUtil.addStoredTransaction(`tx${transaction.created}`,transaction);
    }

    return transaction;
  }

  // CONNECTION MODAL METHODS
  closeConnectionModal = e => {
    if (typeof e !== "undefined") {
      e.preventDefault();
    }

    let modals = { ...this.state.modals };
    modals.data.connectionModalIsOpen = false;
    // this.functionsUtil.customLog("this.state", this.state);
    this.setState({ modals });
  }

  openConnectionModal = e => {
    if (typeof e !== "undefined") {
      e.preventDefault();
    }

    let modals = { ...this.state.modals };
    modals.data.connectionModalIsOpen = true;
    this.setState({ modals: modals });
  }

  closeConnectionPendingModal = e => {
    if (typeof e !== "undefined") {
      e.preventDefault();
    }

    let modals = { ...this.state.modals };
    modals.data.accountConnectionPending = false;
    this.setState({ modals });
  }

  openConnectionPendingModal = e => {
    if (typeof e !== "undefined") {
      e.preventDefault();
    }

    let modals = { ...this.state.modals };
    modals.data.accountConnectionPending = true;
    modals.data.transactionConnectionModalIsOpen = false;
    modals.data.connectionModalIsOpen = false;

    this.setState({ modals });
  }

  closeTransactionErrorModal = e => {
    if (typeof e !== "undefined") {
      e.preventDefault();
    }

    let modals = { ...this.state.modals };
    modals.data.transactionError = false;
    this.setState({ modals });
  }

  openTransactionErrorModal = (e,error) => {
    if (typeof e !== "undefined" && e) {
      e.preventDefault();
    }

    let modals = { ...this.state.modals };
    modals.data.transactionError = error;

    this.setState({ modals });
  }

  closeConnectionErrorModal = e => {
    if (typeof e !== "undefined") {
      e.preventDefault();
    }


    if (!this.state.modals.data.connectionError){
      return false;
    }

    let modals = { ...this.state.modals };
    modals.data.connectionError = false;
    this.setState({ modals });
  }

  openConnectionErrorModal = (e,error) => {
    if (typeof e !== "undefined" && e) {
      e.preventDefault();
    }

    let modals = { ...this.state.modals };

    // Handle generic error
    if (error==='[object Object]'){
      error = 'Unable to access to the wallet.'
    }
    
    if (this.state.modals.data.connectionError !== error){
      // console.log('openConnectionErrorModal',typeof error,typeof error === 'object' ? JSON.stringify(error) : error);
      modals.data.connectionError = error;
      this.setState({ modals });
    }
  }

  closeUserRejectedConnectionModal = e => {
    if (typeof e !== "undefined") {
      e.preventDefault();
    }

    let modals = { ...this.state.modals };
    modals.data.userRejectedConnect = false;
    this.setState({ modals });
  }

  openUserRejectedConnectionModal = e => {
    if (typeof e !== "undefined") {
      e.preventDefault();
    }

    let modals = { ...this.state.modals };
    modals.data.userRejectedConnect = true;
    this.setState({ modals });
  }

  closeNoWeb3BrowserModal = e => {
    if (typeof e !== "undefined") {
      e.preventDefault();
    }

    let modals = { ...this.state.modals };
    modals.data.noWeb3BrowserModalIsOpen = false;
    this.setState({ modals });
  }

  openNoWeb3BrowserModal = e => {
    if (typeof e !== "undefined") {
      e.preventDefault();
    }

    let modals = { ...this.state.modals };
    modals.data.noWeb3BrowserModalIsOpen = true;
    this.setState({ modals });
  }

  closeNoWalletModal = e => {
    if (typeof e !== "undefined") {
      e.preventDefault();
    }

    let modals = { ...this.state.modals };
    modals.data.noWalletModalIsOpen = false;
    this.setState({ modals });
  }

  openNoWalletModal = e => {
    if (typeof e !== "undefined") {
      e.preventDefault();
    }

    let modals = { ...this.state.modals };
    modals.data.noWalletModalIsOpen = true;
    this.setState({ modals });
  }

  closeWrongNetworkModal = e => {
    if (typeof e !== "undefined") {
      e.preventDefault();
    }

    let modals = { ...this.state.modals };
    modals.data.wrongNetworkModalIsOpen = false;
    this.setState({ modals });
  }

  openWrongNetworkModal = e => {
    if (typeof e !== "undefined") {
      e.preventDefault();
    }

    let modals = { ...this.state.modals };
    modals.data.wrongNetworkModalIsOpen = true;
    this.setState({ modals });
  }

  closeLowFundsModal = e => {
    if (typeof e !== "undefined") {
      e.preventDefault();
    }

    let modals = { ...this.state.modals };
    modals.data.lowFundsModalIsOpen = false;
    this.setState({ modals });
  }

  openLowFundsModal = e => {
    if (typeof e !== "undefined") {
      e.preventDefault();
    }

    let modals = { ...this.state.modals };
    modals.data.lowFundsModalIsOpen = true;
    this.setState({ modals });
  }

  state = {
    web3: null,
    context:null,
    account: null,
    contracts: [],
    biconomy: null,
    simpleID: null,
    web3Infura:null,
    initWeb3Index:0,
    transactions: {},
    web3Providers:{},
    CrispClient: null,
    permitClient:null,
    tokenDecimals:null,
    maticPOSClient: null,
    accountBalance: null,
    contractsNetworks: {},
    web3Subscription: null,
    accountValidated: null,
    gnosisSafeLoaded:false,
    maticPlasmaClient:null,
    accountBalanceDAI: null,
    initWeb3: this.initWeb3,
    accountBalanceLow: null,
    networkInitialized:false,
    accountInizialized:false,
    erc20ForwarderClient:null,
    subscribedTransactions:{},
    contractsInitialized:false,
    initAccount: this.initAccount,
    accountValidationPending: null,
    initSimpleID: this.initSimpleID,
    initContract: this.initContract,
    checkPreflight: this.checkPreflight,
    validateAccount: this.validateAccount,
    rejectValidation: this.rejectValidation,
    getTokenDecimals: this.getTokenDecimals,
    getAccountBalance: this.getAccountBalance,
    initializeContracts: this.initializeContracts,
    rejectAccountConnect: this.rejectAccountConnect,
    contractMethodSendWrapper: this.contractMethodSendWrapper,
    connectAndValidateAccount: this.connectAndValidateAccount,
    enableUnderlyingWithdraw: this.props.enableUnderlyingWithdraw,
    network: {
      current: {},
      required: {},
      isCorrectNetwork: null,
      checkNetwork: this.checkNetwork
    },
    modals: {
      data: {
        connectionError: null,
        lowFundsModalIsOpen: null,
        userRejectedConnect: null,
        connectionModalIsOpen: null,
        userRejectedValidation: null,
        wrongNetworkModalIsOpen: null,
        accountConnectionPending: null,
        accountValidationPending: null,
        transactionConnectionModalIsOpen: null,
        noWalletModalIsOpen: this.noWalletModalIsOpen,
        noWeb3BrowserModalIsOpen: this.noWeb3BrowserModalIsOpen,
      },
      methods: {
        openLowFundsModal: this.openLowFundsModal,
        openNoWalletModal: this.openNoWalletModal,
        closeNoWalletModal: this.closeNoWalletModal,
        closeLowFundsModal: this.closeLowFundsModal,
        openConnectionModal: this.openConnectionModal,
        closeConnectionModal: this.closeConnectionModal,
        openWrongNetworkModal: this.openWrongNetworkModal,
        closeWrongNetworkModal: this.closeWrongNetworkModal,
        openNoWeb3BrowserModal: this.openNoWeb3BrowserModal,
        closeNoWeb3BrowserModal: this.closeNoWeb3BrowserModal,
        openConnectionErrorModal: this.openConnectionErrorModal,
        closeConnectionErrorModal: this.closeConnectionErrorModal,
        openTransactionErrorModal: this.openTransactionErrorModal,
        closeTransactionErrorModal: this.closeTransactionErrorModal,
        openConnectionPendingModal: this.openConnectionPendingModal,
        closeConnectionPendingModal: this.closeConnectionPendingModal,
        openUserRejectedValidationModal: this.openUserRejectedValidationModal,
        openUserRejectedConnectionModal: this.openUserRejectedConnectionModal,
        closeUserRejectedValidationModal: this.closeUserRejectedValidationModal,
        closeUserRejectedConnectionModal: this.closeUserRejectedConnectionModal,
      }
    },
    transaction: {
      data: {
        transactions: null
      },
      meta: {},
      methods: {}
    }
  }

  render() {
    const connectionErrorModalOpened = typeof this.state.modals.data.connectionError === 'string' && this.state.modals.data.connectionError.length>0;
    const transactionErrorModalOpened = typeof this.state.modals.data.transactionError === 'string' && this.state.modals.data.transactionError.length>0;
    return (
      <div>
        <RimbleTransactionContext.Provider
          {...this.props}
          value={this.state}
        />
        <ConnectionModalUtil
          {...this.props}
          modals={this.state.modals}
          network={this.state.network}
          account={this.state.account}
          isMobile={this.props.isMobile}
          initAccount={this.state.initAccount}
          setConnector={this.props.setConnector}
          validateAccount={this.state.validateAccount}
          accountValidated={this.state.accountValidated}
          accountConnectionPending={this.state.accountConnectionPending}
          accountValidationPending={this.state.accountValidationPending}
        />
        <TransactionErrorModal
          modals={this.state.modals}
          account={this.state.account}
          context={this.props.context}
          isOpen={transactionErrorModalOpened}
        />
        <ConnectionErrorModal
          modals={this.state.modals}
          account={this.state.account}
          context={this.props.context}
          isOpen={connectionErrorModalOpened}
          setConnector={this.props.setConnector}
        />
        <NetworkUtil
          web3={this.state.web3}
          theme={this.props.theme}
          network={this.state.network}
          currentSection={this.props.currentSection}
        />
      </div>
    );
  }
}

export default RimbleTransaction;
