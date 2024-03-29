import React from "react";
import {
  Box,
  Text,
  Link,
  Icon,
  Flex,
  Field,
  Modal,
  Input,
  Loader,
  Button,
  Heading
} from "rimble-ui";
import ModalCard from './ModalCard.js';
import styles from './Header.module.scss';
import FunctionsUtil from '../FunctionsUtil.js';
import ImageButton from '../../ImageButton/ImageButton.js';
import TransactionFeeModal from "./TransactionFeeModal.js";
import Web3ConnectionButtons from "../../Web3ConnectionButtons/Web3ConnectionButtons.js";

import {
  Link as RouterLink
} from "react-router-dom";

class ConnectionModal extends React.Component {
  // TODO save pref in localstorage and do not show 'Before connecting' info every time
  state = {
    validated:false,
    showTxFees:false,
    customAddress:'',
    currentSection:null,
    showInstructions:false,
    askCustomAddress:false,
    closeRemainingTime:null,
    customAddressError:false,
    newToEthereumChoice:null
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

  toggleShowTxFees = e => {
    e.preventDefault();

    this.setState({
      showTxFees: !this.state.showTxFees
    });
  }

  setStoredSection = () => {
    let currentSection = null;
    if (localStorage){
      currentSection = localStorage.getItem('currentSection');
      if (currentSection){
        this.setState({
          currentSection
        });
      }
    }
    return currentSection;
  }

  componentDidMount = () => {
    this.loadUtils();
    this.setStoredSection();
  }

  componentDidUpdate = () => {
    this.loadUtils();
  }

  resetModal = e => {
    this.setState({
      showTxFees: false,
      currentSection:null,
      askCustomAddress:false,
      showInstructions: false,
      newToEthereumChoice:null,
    });
  }

  setConnector = async (connectorName,name) => {
    let walletProvider = connectorName === 'Injected' ? name : connectorName;

    // Send Google Analytics event
    this.functionsUtil.sendGoogleAnalyticsEvent({
      eventCategory:'Connect',
      eventLabel:walletProvider,
      eventAction:'select_wallet'
    });

    if (this.props.setConnector && typeof this.props.setConnector === 'function'){
      this.props.setConnector(connectorName,walletProvider);
    }

    // Set Wallet choice
    this.setState({
      newToEthereumChoice: connectorName
    });

    this.closeCountdown();

    return connectorName;

    // return await window.RimbleWeb3_context.setConnector(connectorName);
  }

  closeCountdown = () => {
    const closeRemainingTime = this.state.closeRemainingTime ? this.state.closeRemainingTime-1 : 5;
    if (!closeRemainingTime){
      this.closeModal();
    } else {
      setTimeout(() => { this.closeCountdown() },1000);
    }
    this.setState({
      closeRemainingTime
    });
  }

  setWalletChoice = (e,choice) => {
    e.preventDefault();
    this.setState({
      newToEthereumChoice: choice
    });
  }

  closeModal = () => {
    // Reset modal
    this.resetModal();
    // Set latest stored sections
    this.setStoredSection();
    // Close modal
    this.props.closeModal();
  }

  setCurrentSection = (e,currentSection) => {
    e.preventDefault();
    this.setState({
      currentSection
    });

    if (currentSection!=='instructions'){
      // Send Google Analytics event
      this.functionsUtil.sendGoogleAnalyticsEvent({
        eventCategory: 'Connect',
        eventAction: 'select_mode',
        eventLabel: currentSection
      });

      this.functionsUtil.setLocalStorage('currentSection',currentSection);
    }
  }

  connectCustomAddress = () => {
    const addressValid = this.functionsUtil.checkAddress(this.state.customAddress);
    if (addressValid){
      this.setCustomAddress(false);
      this.functionsUtil.setCustomAddress(this.state.customAddress);
      this.setConnector('custom','custom');
      setTimeout(() => { this.closeModal() },1000);
      return true;
    } else {
      return this.setState({
        customAddressError:true
      });
    }
  }

  updateCustomAddress = (e) => {
    const customAddressError = false;
    const customAddress = e.target.value;
    const validated = this.functionsUtil.checkAddress(customAddress);
    this.setState({
      validated,
      customAddress,
      customAddressError
    });
  }

  setCustomAddress = (askCustomAddress) => {
    this.setState({
      askCustomAddress
    });
  }

  renderModalContent = () => {

    const TOSacceptance = (
      <Box>
        <Text textAlign={'center'} fontSize={1} py={[2,3]}>By connecting, I accept Idle's <RouterLink to="/terms-of-service" color={'primary'} style={{color:this.props.theme.colors.primary,textDecoration:'underline'}} target={'_blank'} rel="nofollow noopener noreferrer">Terms of Service</RouterLink></Text>
      </Box>
    );

    const newToEthereum = this.state.currentSection === 'new';
    const showConnectionButtons = this.state.currentSection === 'wallet';
    const showInstructions = this.state.currentSection === 'instructions';

    if (showInstructions){
      return (
        <React.Fragment>
          <ModalCard.Header title={'Before you connect'} subtitle={'Connecting lets you use Idle via your Ethereum account.'}></ModalCard.Header>
          <ModalCard.Body>
            <Flex
              flexDirection={['column', 'row']}
              justifyContent={"space-between"}
              my={[0, 3]}
            >
              <Box flex={'1 1'} width={1} mt={[0, 0]} mb={[4, 0]} mr={4}>
                <Flex justifyContent={"center"} mb={3}>
                  <Icon
                    name="Public"
                    color="skyBlue"
                    size="4em"
                  />
                </Flex>
                <Heading fontSize={2} textAlign={'center'}>The blockchain is public</Heading>
                <Text fontSize={1} textAlign={'center'}>
                  Your Ethereum account activity is public on the
                  blockchain. Choose an account you don’t mind being
                  linked with your activity here.
                </Text>
              </Box>
              <Box flex={'1 1'} width={1} mt={[0, 0]} mb={[4, 0]} mr={4}>
                <Flex justifyContent={"center"} mb={3}>
                  <Icon
                    name="AccountBalanceWallet"
                    color="skyBlue"
                    size="4em"
                  />
                </Flex>
                <Heading fontSize={2} textAlign={'center'}>Have some Ether for fees</Heading>
                <Text fontSize={1} mb={3} textAlign={'center'}>
                  You’ll need Ether to pay transaction fees. Buy Ether
                  from exchanges like Coinbase or directly via enabled wallet
                  such as Portis or Dapper.<br />
                  <Link
                    title="Learn about Ethereum transaction fees"
                    fontWeight={'0'}
                    color={'blue'}
                    textAlign={'center'}
                    hoverColor={'blue'}
                    href="#"
                    onClick={this.toggleShowTxFees}
                  >
                    What are transaction fees?
                  </Link>
                </Text>
              </Box>
              <Box flex={'1 1'} width={1} mt={[0, 0]} mb={[4, 0]}>
                <Flex justifyContent={"center"} mb={3}>
                  <Icon
                    name="People"
                    color="skyBlue"
                    size="4em"
                  />
                </Flex>
                <Heading fontSize={2} textAlign={'center'}>Have the right account ready</Heading>
                <Text fontSize={1} textAlign={'center'}>
                  If you have multiple Ethereum accounts, check that the
                  one you want to use is active in your browser.
                </Text>
              </Box>
            </Flex>
          </ModalCard.Body>
        </React.Fragment>
      );
    }

    if (this.state.askCustomAddress){
      return (
        <Box>
          <ModalCard.Header
            title={'Connect ETH wallet'}
            icon={'images/idle-mark.png'}
            subtitle={'And get started with Idle.'}
          >
          </ModalCard.Header>
          <ModalCard.Body>
            <Flex
              width={1}
              minWidth={[1,'30em']}
              flexDirection={'column'}
              justifyContent={'center'}
            >
              <Field
                width={1}
                label={'Ethereum address'}
              >
                <Input
                  required
                  width={1}
                  type={'text'}
                  className={styles.input}
                  borderColor={'cardBorder'}
                  backgroundColor={'cardBg'}
                  pattern={'^0x[a-fA-F0-9]{40}$'}
                  value={this.state.customAddress}
                  onChange={ e => this.updateCustomAddress(e) }
                  placeholder={'Insert a valid Ethereum address'}
                />
              </Field>
              {
                this.state.customAddressError && (
                  <Text
                    mb={2}
                    fontSize={2}
                    color={'red'}
                    fontWeight={3}
                    textAlign={'center'}
                  >
                    Insert a valid Ethereum Address
                  </Text>
                )
              }
              <Button
                px={[3,4]}
                mx={'auto'}
                fontWeight={3}
                size={'medium'}
                fontSize={[2,2]}
                borderRadius={4}
                contrastColor={'primary'}
                className={[styles.gradientButton]}
                onClick={ e => this.connectCustomAddress() }
              >
                CONNECT
              </Button>
            </Flex>
            <Flex
              pt={3}
              alignItems={'center'}
              justifyContent={'center'}
            >
              <Link
                hoverColor={'blue'}
                textAlign={'center'}
                onClick={ e => this.setCustomAddress(false) }
              >
                Select another Wallet
              </Link>
            </Flex>
            { TOSacceptance }
          </ModalCard.Body>
        </Box>
      );
    }

    if (showConnectionButtons) {
      return (
        <Box>
          <ModalCard.Header title={'Select your Wallet'} subtitle={'And get started with Idle.'} icon={'images/idle-mark.png'}></ModalCard.Header>
          <ModalCard.Body>
            <Flex width={1} px={[0,5]} flexDirection={'column'} justifyContent={'center'}>
              <Web3ConnectionButtons
                width={1/2}
                isMobile={this.props.isMobile}
                setConnector={this.setConnector}
                connectors={this.props.connectors}
                connectionCallback={this.closeModal}
                size={this.props.isMobile ? 'medium' : 'large'}
                setCustomAddress={this.setCustomAddress.bind(this)}
              />
            </Flex>
            <Flex pt={3} alignItems={'center'} justifyContent={'center'}>
              <Link textAlign={'center'} hoverColor={'blue'} onClick={ e => this.setCurrentSection(e,'new') }>I don't have a wallet</Link>
            </Flex>
            { TOSacceptance }
          </ModalCard.Body>
        </Box>
      );
    }

    if (newToEthereum) {
      return (
        <React.Fragment>
          <ModalCard.Header title={'Let\'s create your first Ethereum wallet'} icon={'images/idle-mark.png'}></ModalCard.Header>
          <ModalCard.Body>
            {
              !this.state.newToEthereumChoice ? (
                <Flex width={1} px={[0,4]} flexDirection={'column'} justifyContent={'center'}>
                  <Box mb={3}>
                    <Text fontSize={[2,3]} textAlign={'center'} fontWeight={2} lineHeight={1.5}>
                      Connect with e-mail or phone number?
                    </Text>
                  </Box>
                  <Flex mb={3} flexDirection={['column','row']} alignItems={'center'} justifyContent={'center'}>
                    <ImageButton
                      buttonProps={{
                        border:2
                      }}
                      caption={'Use e-mail'}
                      imageSrc={'images/email.svg'}
                      isMobile={this.props.isMobile}
                      subcaption={'Powered by Portis'}
                      handleClick={ e => this.setConnector('Portis','Portis') }
                      imageProps={ this.props.isMobile ? {width:'auto',height:'42px'} : {mb:'3px',width:'auto',height:'55px'}}
                    />
                    <ImageButton
                      buttonProps={{
                        border:2
                      }}
                      caption={'Use phone number'}
                      isMobile={this.props.isMobile}
                      imageSrc={'images/mobile.svg'}
                      subcaption={'Powered by Fortmatic'}
                      handleClick={ e => this.setConnector('Fortmatic','Fortmatic') }
                      imageProps={ this.props.isMobile ? {width:'auto',height:'42px'} : {mb:'3px',width:'auto',height:'55px'}}
                    />
                  </Flex>
                  <Flex alignItems={'center'} justifyContent={'center'}>
                    <Link textAlign={'center'} hoverColor={'blue'} onClick={ e => this.setCurrentSection(e,'wallet') }>I already have a wallet</Link>
                  </Flex>
                </Flex>
              ) : (
                <Box>
                  <Text fontSize={3} textAlign={'center'} fontWeight={2} lineHeight={1.5}>
                    We are connecting you to {this.state.newToEthereumChoice} wallet provider...
                  </Text>
                  <Flex
                    mt={2}
                    justifyContent={'center'}
                    alignItems={'center'}
                    textAlign={'center'}>
                    <Loader size="40px" /> <Text ml={2} color={'dark-gray'}>Closing in {this.state.closeRemainingTime} seconds...</Text>
                  </Flex>
                </Box>
              )
            }
            { TOSacceptance }
          </ModalCard.Body>
        </React.Fragment>
      );
    }

    return (
      <React.Fragment>
        <ModalCard.Header title={'Connect to Idle'} icon={'images/idle-mark.png'}></ModalCard.Header>
        <ModalCard.Body>
          {
            <Flex
              width={1}
              px={[0,4]}
              flexDirection={'column'}
              justifyContent={'center'}
            >
              <Box mb={3}>
                <Text
                  fontWeight={2}
                  fontSize={[2,3]}
                  lineHeight={1.5}
                  textAlign={'center'}
                >
                  How do you want to connect to Idle?
                </Text>
              </Box>
              <Flex
                mb={[2,3]}
                alignItems={'center'}
                justifyContent={'center'}
                flexDirection={['column','row']}
              >
                <ImageButton
                  buttonProps={{
                    border:2
                  }}
                  caption={`Ethereum wallet`}
                  isMobile={this.props.isMobile}
                  subcaption={'Choose your favourite'}
                  imageSrc={'images/ethereum-wallet.svg'}
                  handleClick={ e => this.setCurrentSection(e,'wallet') }
                  imageProps={this.props.isMobile ? {width:'auto',height:'42px'} : {width:'auto',height:'55px',marginBottom:'5px'}}
                />
                <ImageButton
                  buttonProps={{
                    border:2
                  }}
                  caption={`New wallet`}
                  isMobile={this.props.isMobile}
                  subcaption={'Use email / phone'}
                  imageSrc={'images/new-wallet.png'}
                  handleClick={ e => this.setCurrentSection(e,'new') }
                  imageProps={this.props.isMobile ? {width:'auto',height:'42px'} : {width:'auto',height:'55px',marginBottom:'5px'}}
                />
              </Flex>
              <Flex
                alignItems={'center'}
                justifyContent={'center'}
              >
                <Link
                  color={'primary'}
                  hoverColor={'primary'}
                  onClick={ e => this.setCustomAddress(true) }
                >
                  Watch Ethereum Address
                </Link>
              </Flex>
            </Flex>
          }
          { TOSacceptance }
        </ModalCard.Body>
      </React.Fragment>
    );
  }

  renderFooter = () => {

    if (this.state.newToEthereumChoice || (this.state.currentSection && this.state.askCustomAddress)){
      return null;
    }

    return (
      <ModalCard.Footer>
        { !this.state.currentSection ? (
            <Button
              className={[styles.gradientButton,styles.empty]}
              onClick={ e => this.setCurrentSection(e,'instructions') }
              size={'medium'}
              borderRadius={4}
              contrastColor={'blue'}
              fontWeight={3}
              fontSize={[2,2]}
              mx={'auto'}
              px={[4,5]}
            >
              READ INSTRUCTIONS
            </Button>
          ) : (!this.state.askCustomAddress || this.state.currentSection==='instructions') && (
            <Button
              className={[styles.gradientButton,styles.empty]}
              onClick={this.resetModal}
              size={'medium'}
              borderRadius={4}
              contrastColor={'blue'}
              fontWeight={3}
              fontSize={[2,2]}
              mx={'auto'}
              px={[4,5]}
            >
              BACK
            </Button>
          )
        }
      </ModalCard.Footer>
    );
  }

  render() {
    return (
      <Modal isOpen={this.props.isOpen}>
        <ModalCard closeFunc={this.closeModal}>
          {this.state.showTxFees === false ? (
            <React.Fragment>
              {this.renderModalContent()}
              {this.renderFooter()}
            </React.Fragment>
          ) : (
            <Box>
              <TransactionFeeModal />
              {this.renderFooter()}
            </Box>
          )}

        </ModalCard>
      </Modal>
    );
  }
}

export default ConnectionModal;
