import Connector from 'web3-react/dist/connectors/connector';

export default class WalletConnectConnector extends Connector {

  constructor(kwargs) {
    const { api: WalletConnectProvider, defaultNetwork, infuraId, ...rest } = kwargs;
    super(rest);

    this.provider = null;
    this.WalletConnectProvider = WalletConnectProvider;
    this.infuraId = infuraId;
  }

  async onActivation() {
    if (!this.provider) {
      this.provider = new this.WalletConnectProvider({
        infuraId:this.infuraId
      });
    }

    if (this.provider){
      await this.provider.enable();
      return this.provider;
    }
  }

  async getProvider(){
    return this.provider;
  }

  async disable() {
    if (this.provider){
      this.provider.close();
      return this.provider;
    }
  }
}
