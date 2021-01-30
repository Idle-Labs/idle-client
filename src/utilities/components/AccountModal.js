import React from "react";
import ModalCard from './ModalCard';
import AssetField from '../../AssetField/AssetField.js';
import FunctionsUtil from '../../utilities/FunctionsUtil';
import { Heading, Modal, Flex, EthAddress } from "rimble-ui";
import ButtonLoader from '../../ButtonLoader/ButtonLoader.js';
import styles from '../../CryptoInput/CryptoInput.module.scss';
import CardIconButton from '../../CardIconButton/CardIconButton';

class AccountModal extends React.Component {

  state = {
    logout: false,
    balances: null
  }

  loadBalances = async () => {

    if (!this.props.availableStrategies || !this.props.contractsInitialized || !this.props.account || this.state.balances !== null){
      return false;
    }

    const balances = [];
    const allTokens = Object.keys(this.props.availableStrategies.best);

    allTokens.forEach( baseToken => {
      const tokens = [];
      tokens.push(baseToken);
      Object.keys(this.props.availableStrategies).forEach( strategy => {
        const strategyToken = this.props.availableStrategies[strategy][baseToken];
        if (strategyToken){
          tokens.push(strategyToken.idle.token);
        }
      });

      balances.push(tokens);
    });

    this.setState({
      balances
    });
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

  componentWillMount() {
    this.loadUtils();
  }

  componentDidMount() {
    this.loadUtils();
    this.loadBalances();
  }

  componentDidUpdate(prevProps) {
    this.loadUtils();

    const accountChanged = prevProps.acccount !== this.props.account;
    const contractsInitialized = !prevProps.contractsInitialized && this.props.contractsInitialized;
    const availableStrategiesChanged = !prevProps.availableStrategies && this.props.availableStrategies;
    if (availableStrategiesChanged || accountChanged || contractsInitialized){
      this.loadBalances();
    }
  }

  setConnector = async (connectorName) => {
    // Send Google Analytics event
    this.functionsUtil.sendGoogleAnalyticsEvent({
      eventCategory: 'Connect',
      eventAction: 'logout'
    });

    if (typeof this.props.setConnector === 'function'){
      this.props.setConnector(connectorName);
    }

    return await this.props.context.setConnector(connectorName);
  }

  async logout(){
    this.setState({
      logout:true
    });

    this.props.logout();
    await this.setConnector('Infura');
    // this.props.closeModal();
  }

  goToSection(section){
    this.props.goToSection(section);
    this.props.closeModal();
  }

  render(){
    if (this.props.account){

      const rows = (Object.keys(this.props.availableStrategies).length+1);
      const renderBalances = this.state.balances && this.state.balances.map( (tokens,i) => {
        return (
          <Flex
            mt={2}
            width={1}
            boxShadow={0}
            key={'balance_'+i}
            alignItems={'center'}
            flexDirection={'row'}
            >
              {
                tokens.map( (token,tokenIndex) => (
                  <Flex
                    width={1/rows}
                    flexDirection={'row'}
                    key={'balance_token_'+token}
                    justifyContent={'flex-start'}
                  >
                    <AssetField
                      token={token}
                      tokenConfig={{
                        token:token
                      }}
                      fieldInfo={{
                        name:'icon',
                        props:{
                          mr:[1,2],
                          ml:[1,4],
                          width:['1.4em','2em'],
                          height:['1.4em','2em']
                        }
                      }}
                    />
                    <AssetField
                      {...this.props}
                      token={token}
                      tokenConfig={{
                        token:token
                      }}
                      fieldInfo={{
                        name:'tokenBalance',
                        props:{
                          fontSize:[0,2],
                          fontWeight:500,
                          color:'cellText'
                        }
                      }}
                    />
                  </Flex>
                ) )
              }
          </Flex>
        );
      });

      const showTools = ['addFunds','tokenSwap'];

      return (
        <Modal isOpen={this.props.isOpen}>
          <ModalCard closeFunc={this.props.closeModal}>
            <ModalCard.Header title={'Account overview'}></ModalCard.Header>
            <ModalCard.Body>
              <Flex
                alignItems={'center'}
                width={["auto", "40em"]}
                flexDirection={'column'}
                justifyContent={'center'}
              >
                <Flex
                  width={1}
                  mb={[2,3]}
                  alignItems={'center'}
                  flexDirection={'column'}
                  maxWidth={['100%','30em']}
                  justifyContent={'stretch'}
                >
                  <EthAddress
                    width={1}
                    address={this.props.account}
                    className={ this.props.themeMode === 'light' ? styles.ethInput : styles.ethInputDark }
                  />
                </Flex>
                <Flex
                  width={1}
                  mb={[2,3]}
                  alignItems={'center'}
                  flexDirection={'column'}
                  maxWidth={['100%','30em']}
                >
                  <Heading.h4
                    color={'copyColor'}
                    textAlign={'center'}
                  >
                    Balances:
                  </Heading.h4>
                  { renderBalances }
                </Flex>
                <Flex
                  width={1}
                  mb={[2,3]}
                  alignItems={'center'}
                  flexDirection={'column'}
                  justifyContent={'center'}
                >
                  <Heading.h4
                    mb={2}
                    color={'copyColor'}
                    textAlign={'center'}
                  >
                    Tools:
                  </Heading.h4>
                  <Flex
                    width={1}
                    alignItems={'center'}
                    justifyContent={'center'}
                    flexDirection={['column','row']}
                  >
                    {
                      showTools.map( toolName => {
                        const toolConfig = this.functionsUtil.getGlobalConfig(['tools',toolName]);
                        return (
                          <CardIconButton
                            {...this.props}
                            key={`tool_${toolName}`}
                            cardProps={{
                              mx:[0,2],
                              my:[2,0],
                              width:'auto',
                              minWidth:['50%','auto']
                            }}
                            icon={toolConfig.icon}
                            text={toolConfig.label}
                            handleClick={ e => this.goToSection(`tools/${toolConfig.route}`) }
                          />
                        )
                      })
                    }
                  </Flex>
                </Flex>
              </Flex>
            </ModalCard.Body>

            <ModalCard.Footer>
              {(this.props.context.active || (this.props.context.error && this.props.context.connectorName)) && (
                <ButtonLoader
                  buttonText={'Logout wallet'}
                  isLoading={this.state.logout}
                  handleClick={ async () => { await this.logout() } }
                  buttonProps={{className:styles.gradientButton,borderRadius:'2rem',mt:[4,8],minWidth:['95px','145px'],size:['auto','medium']}}
                >
                </ButtonLoader>
              )}
            </ModalCard.Footer>
          </ModalCard>
        </Modal>
      );
    }
    return null;
  }
}

export default AccountModal;
