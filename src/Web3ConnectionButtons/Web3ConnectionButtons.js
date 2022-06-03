import React from 'react'
import moment from 'moment';
import { useWeb3Context } from 'web3-react';
import GeneralUtil from "../utilities/GeneralUtil";
import ImageButton from '../ImageButton/ImageButton';
import globalConfigs from '../configs/globalConfigs';
import styles from './Web3ConnectionButtons.module.scss';
import { Button, Box, Text, Flex, Link } from 'rimble-ui';

const LOG_ENABLED = false;
const customLog = (...props) => { if (LOG_ENABLED) console.log(moment().format('HH:mm:ss'),...props); };

export default function Web3ConnectionButtons(props) {
  const context = useWeb3Context();

  if (!context.active && !context.error) {
    customLog('context loading', context);
  } else if (context.error) {
    customLog('context error', context);
  } else {
    customLog('context success', context);
  }

  const setConnector = async (connectorName,name) => {
    let walletProvider = connectorName === 'Injected' ? name : connectorName;
    if (localStorage) {
      localStorage.setItem('walletProvider', walletProvider);
      localStorage.setItem('connectorName', connectorName);
    }

    if (props.setConnector && typeof props.setConnector === 'function'){
      props.setConnector(connectorName,walletProvider);
    }
    
    // Close modal
    if (typeof props.connectionCallback === 'function'){
      props.connectionCallback();
    }

    return connectorName;
    // return await context.setConnector(connectorName);
  };

  const unsetConnector = async () => {
    context.unsetConnector();
    if (props.setConnector && typeof props.setConnector === 'function'){
      props.setConnector('Infura','Infura');
    }
  };

  // Show provider fields to detect in-app browser
  // alert(JSON.stringify(Object.keys(window.web3.currentProvider)));
    
  const isOpera = GeneralUtil.isOpera();
  const isDapper = GeneralUtil.hasDapper();
  const isMetamask = GeneralUtil.hasMetaMask();
  const isTrustWallet = GeneralUtil.isTrustWallet();
  const isCoinbaseWallet = GeneralUtil.isCoinbaseWallet();
  const isGnosisSafe = !!props.connectors.gnosis.provider.safe;
  const browserWalletDetected = isMetamask || isOpera || isDapper || isCoinbaseWallet || isTrustWallet;
  
  const allowedConnectors = props.allowedConnectors;
  const registerPage = props.registerPage;

  if (props.connectors.Portis) {
    if (registerPage) {
      props.connectors.Portis.options = props.connectors.Portis.options || {};
      props.connectors.Portis.options.registerPageByDefault = true;
    } else {
      props.connectors.Portis.options = props.connectors.Portis.options || {};
      props.connectors.Portis.options.registerPageByDefault = false;
    }
  }

  let basicConnectorsName = Object.keys(props.connectors).filter(c => c !== 'Infura');

  if (allowedConnectors) {
    basicConnectorsName = basicConnectorsName.filter(n => allowedConnectors.map((v) => { return v.toLowerCase(); }).indexOf(n.toLowerCase()) !== -1 );
  }

  // Handle Gnosis Safe connector
  if (isGnosisSafe){
    const injectedIndex = basicConnectorsName.indexOf('Injected');
    // Remove Injected
    basicConnectorsName.splice(injectedIndex,1);
    // Remove Gnosis
    const gnosisIndex = basicConnectorsName.indexOf('gnosis');
    basicConnectorsName.splice(gnosisIndex,1);
    // Insert Gnosis in first place
    basicConnectorsName.unshift('gnosis');
  } else {
    const gnosisIndex = basicConnectorsName.indexOf('gnosis');
    // Remove Gnosis
    basicConnectorsName.splice(gnosisIndex,1);
  }

  const buttons = basicConnectorsName.map( (connectorName,index) => {
    switch (connectorName) {
      case 'Injected':
        if (browserWalletDetected) {
          let name = null;
          if (isMetamask) {
            name = 'Metamask';
          } else if (isOpera) {
            name = 'Opera';
          } else if (isDapper){
            name = 'Dapper';
          } else if (isCoinbaseWallet){
            name = 'Coinbase';
          } else if (isTrustWallet){
            name = 'TrustWallet';
          }

          const connectorInfo = globalConfigs.connectors[name.toLowerCase()];
          if (connectorInfo && connectorInfo.enabled){
            const walletIcon = connectorInfo.icon ? connectorInfo.icon : `${name.toLowerCase()}.svg`;
            return (
              <Flex
                width={1}
                key={`wallet_${name}`}
                justifyContent={'space-between'}
                style={{
                  flex:'0 100%',
                }}
                flexDirection={['column','row']}
              >
                <ImageButton
                  buttonProps={{
                    border:2
                  }}
                  caption={name}
                  isMobile={true}
                  width={[1,0.48]}
                  imageProps={{width:'auto',height:'42px'}}
                  imageSrc={`images/connectors/${walletIcon}`}
                  handleClick={ async () => await setConnector(connectorName,name)}
                  subcaption={ connectorInfo && connectorInfo.subcaption ? connectorInfo.subcaption : `Connect using ${name}` }
                />
                <ImageButton
                  buttonProps={{
                    border:2
                  }}
                  isMobile={true}
                  width={[1,0.48]}
                  caption={'Watch Address'}
                  imageSrc={`images/tokens/ETH.svg`}
                  subcaption={'Watch an Ethereum address'}
                  imageProps={{width:'auto',height:'42px'}}
                  handleClick={ e => props.setCustomAddress(true) }
                />
              </Flex>
            )
          }
          return null;
        } else {
          const connectorInfo = globalConfigs.connectors[connectorName.toLowerCase()];
          return (
            <ImageButton
              buttonProps={{
                border:2
              }}
              isMobile={true}
              caption={'Browser Wallet'}
              key={`wallet_${connectorName}`}
              imageProps={{width:'auto',height:'42px'}}
              imageSrc={`images/connectors/browser-wallet.png`}
              handleClick={ async () => await setConnector(connectorName) }
              subcaption={ connectorInfo && connectorInfo.subcaption ? connectorInfo.subcaption : `Connect using a browser wallet`}
              buttonStyle={ props.isMobile ? {justifyContent:'flex-start',flex:'0 100%'} : {justifyContent:'flex-start',flex:'0 48%'} }
            />
          );
        }
      default:
        const connectorInfo = globalConfigs.connectors[connectorName.toLowerCase()];
        if (connectorInfo && connectorInfo.enabled){
          const walletIcon = connectorInfo.iconModal ? connectorInfo.iconModal : (connectorInfo.icon ? connectorInfo.icon : `${connectorName.toLowerCase()}.svg`);

          let caption = connectorInfo.name ? connectorInfo.name : connectorName;
          return (
            <ImageButton
              buttonProps={{
                border:2
              }}
              isMobile={true}
              caption={caption}
              key={`wallet_${connectorName}`}
              imageSrc={`images/connectors/${walletIcon}`}
              imageProps={{width:'auto',height:'42px'}}
              handleClick={ async () => await setConnector(connectorName) }
              subcaption={ connectorInfo && connectorInfo.subcaption ? connectorInfo.subcaption : `Connect using ${connectorName}`}
              buttonStyle={ props.isMobile ? {justifyContent:'flex-start',flex:'0 100%'} : {justifyContent:'flex-start',flex:'0 48%'} }
            />
          );
        }
        return null;
    }
  });

  return (
    <Box width={[1]}>
      <Flex flexDirection={'column'} alignItems={"center"}>
        {context.error && (
          <Text.p textAlign="center">
            An error occurred, are you using an Ethereum browser such as
            <Link href="https://metamask.io/" target="_blank" rel="nofollow noopener noreferrer">
              &nbsp; Metamask &nbsp;
            </Link>
             or
            <Link href="https://www.meetdapper.com/" target="_blank" rel="nofollow noopener noreferrer">
              &nbsp; Dapper
            </Link>
            ?
            If you do not have an Ethereum wallet follow the
            "I'm new to Ethereum" flow when connecting.
            If you do have a wallet, click Reset and retry one of the wallet listed below,
            Generic wallet option is used for Ethereum browsers only.
          </Text.p>
        )}
        {(context.active || (context.error && context.connectorName)) && context.connectorName !== 'Infura' && (
          <Button.Outline
            width={[1/2]}
            className={[styles.button]}
            mb={[1, 3]}
            size={'large'}
            key={'reset'}
            onClick={async () => await unsetConnector()}
          >
            {context.active ? "Deactivate Connector" : "Reset"}
          </Button.Outline>
        )}
      </Flex>
      <Flex
        flexWrap={'wrap'}
        flexDirection={'row'}
        justifyContent={'space-between'}
      >
        {buttons}
      </Flex>
    </Box>
  );
}
