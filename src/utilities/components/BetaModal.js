import React from "react";
import ModalCard from './ModalCard';
import { Text, Modal, Flex, Link } from "rimble-ui";
import FunctionsUtil from '../../utilities/FunctionsUtil';
import RoundButton from '../../RoundButton/RoundButton.js';

class BetaModal extends React.Component {

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
    this.functionsUtil.setLocalStorage('betaApproved',true);
    this.props.closeModal();
  }

  render() {

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
            iconHeight={'40px'}
            title={'Beta Version'}
            icon={'images/warning.svg'}
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
                You're about to enter Idle Finance Beta Dashboard – this is the place where several un-audited and risky features are being tested!<br />Please use at your own risk, or visit the official website at <Link fontSize={2} mainColor={'primary'} hoverColor={'primary'} href={this.functionsUtil.getGlobalConfig(['baseURL'])}>{this.functionsUtil.getGlobalConfig(['baseURL'])}</Link>.
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
                Continue Anyway
              </RoundButton>
            </Flex>
          </ModalCard.Body>
        </ModalCard>
      </Modal>
    );
  }
}

export default BetaModal;