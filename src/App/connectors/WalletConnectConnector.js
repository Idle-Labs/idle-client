import Connector from 'web3-react/dist/connectors/connector';

export default class WalletConnectConnector extends Connector {

  constructor(kwargs) {
    const { api: WalletConnectProvider, defaultNetwork, infuraId, rpc, ...rest } = kwargs;
    super(rest);

    this.rpc = rpc;
    this.provider = null;
    this.infuraId = infuraId;
    this.WalletConnectProvider = WalletConnectProvider;
  }

  async onActivation() {
    if (!this.provider) {
      const params = {
        infuraId:this.infuraId
      };
      if (this.rpc){
        params.rpc = this.rpc;
      }
      this.provider = new this.WalletConnectProvider(params);
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
