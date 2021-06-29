import Connector from 'web3-react/dist/connectors/connector';

export default class GnosisSafeConnector extends Connector {

  constructor(SafeAppConnector) {
    super(...arguments);
    this.safeLoaded = false;
    this.SafeAppConnector = SafeAppConnector;
    this.provider = new this.SafeAppConnector();
    this.checkSafeApp();
  }

  async onActivation() {
    if (!this.provider) {
      this.provider = new this.SafeAppConnector();
    }

    if (this.provider){
      await this.provider.activate();
      return this.provider;
    }
  }

  async getAccount() {
    if (this.provider){
      return await this.provider.getAccount();
    }
  }

  async getProvider(){
    if (this.provider){
      return await this.provider.getProvider();
    }
  }

  async getSafeInfo() {
    if (this.provider){
      return await this.provider.getSafeInfo();
    }
  }

  async getChainId() {
    if (this.provider){
      return await this.provider.getChainId();
    }
  }

  async checkSafeApp() {
    if (this.provider){
      const isSafeApp = await this.provider.isSafeApp();
      this.safeLoaded = true;
      return isSafeApp;
    }
  }

  async disable() {
    if (this.provider){
      this.provider.deactivate();
      return this.provider;
    }
  }
}
