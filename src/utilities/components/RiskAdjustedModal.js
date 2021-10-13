import React from "react";
import ModalCard from './ModalCard';
import { Text, Modal, Flex } from "rimble-ui";
import ExtLink from '../../ExtLink/ExtLink.js';
import FunctionsUtil from '../../utilities/FunctionsUtil';
import RoundButton from '../../RoundButton/RoundButton.js';

class RiskAdjustedModal extends React.Component {

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
            icon={'images/warning.svg'}
            title={'Risk Adjusted Dismissed'}
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
                The Risk Adjusted strategy has been dismissed after the execution of <ExtLink fontSize={2} href={this.functionsUtil.getAppUrl('#/governance/proposals/14')}>IIP-14</ExtLink> on the 13th October 2021. An incentive program has been released to let users migrate their funds in the <ExtLink fontSize={2} href={'https://beta.idle.finance/#/dashboard/tranches/senior/idle'}>Senior Tranche</ExtLink> in order to keep a similar risk profile as the Risk-Adjusted strategy. Read the <ExtLink fontSize={2} href={'https://gov.idle.finance/t/risk-adjusted-removal-for-tranches-migration/673'}>Governance Forum Post</ExtLink> for further information about the migration program.
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
                Got it
              </RoundButton>
            </Flex>
          </ModalCard.Body>
        </ModalCard>
      </Modal>
    );
  }
}

export default RiskAdjustedModal;