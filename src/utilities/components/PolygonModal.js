import React from "react";
import ModalCard from './ModalCard';
import ExtLink from '../../ExtLink/ExtLink.js';
import { Text, Modal, Flex, Link } from "rimble-ui";
import FunctionsUtil from '../../utilities/FunctionsUtil';
import RoundButton from '../../RoundButton/RoundButton.js';

class PolygonModal extends React.Component {

  state = {};

  // Utils
  functionsUtil = null;
  loadUtils(){
    if (this.functionsUtil){
      this.functionsUtil.setProps(this.props);
    } else {
      this.functionsUtil = new FunctionsUtil(this.props);
    }
  }

  constructor(props) {
    super(props);
    this.loadUtils();
  }

  componentDidUpdate = async () => {
    this.loadUtils();
  }

  closeModal = async () => {
    this.functionsUtil.setLocalStorage('polygonApproved',true);
    this.props.closeModal();
  }

  render() {
    const polygonBridgeInfo = this.functionsUtil.getGlobalConfig(['tools','polygonBridge']);

    return (
      <Modal
        isOpen={this.props.isOpen}
      >
        <ModalCard
          maxWidth={['960px','650px']}
          closeFunc={this.props.closeModal}
        >
          <ModalCard.Header
            pt={3}
            iconHeight={'2em'}
            title={'Welcome to Idle <> Polygon'}
            icon={'images/protocols/polygon.svg'}
          >
          </ModalCard.Header>
          <ModalCard.Body>
            <Flex
              width={1}
              flexDirection={'column'}
            >
              <Text
                fontSize={2}
                textAlign={'left'}
                color={'dark-gray'}
              >
                You're about to enter Idle Finance in the Polygon Network, make sure to have some <ExtLink color={'link'} fontSize={2} href={this.functionsUtil.getEtherscanAddressUrl(this.functionsUtil.getGlobalConfig(['stats','tokens',this.props.currentNetwork.baseToken,'address']))}>{this.props.currentNetwork.baseToken}</ExtLink> tokens in your wallet to send your transactions! Also you can use our <Link color={'link'} fontSize={2} mainColor={'link'} onClick={ e => this.props.goToSection(`tools/${polygonBridgeInfo.route}`)}>{polygonBridgeInfo.label}</Link> to transfer your tokens from Mainnet to Polygon.<br />If you are not confident with this just switch to Mainnet using your wallet provider.
              </Text>
            </Flex>
            <Flex
              my={3}
              alignItems={'center'}
              flexDirection={'column'}
              justifyContent={'center'}
            >
              <RoundButton
                handleClick={this.closeModal}
                buttonProps={{
                  width:['100%','40%']
                }}
              >
                Let Me In
              </RoundButton>
            </Flex>
          </ModalCard.Body>
        </ModalCard>
      </Modal>
    );
  }
}

export default PolygonModal;