import React from "react";
import ModalCard from './ModalCard';
import { Text, Modal, Flex } from "rimble-ui";
import FunctionsUtil from '../../utilities/FunctionsUtil';
import RoundButton from '../../RoundButton/RoundButton.js';

class TooltipModal extends React.Component {

  state = {};

  // Utils
  functionsUtil = null;
  loadUtils() {
    if (this.functionsUtil) {
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
          maxWidth={['960px', '540px']}
          closeFunc={this.props.closeModal}
          ptBox={5}
          ptInner={2}
          prBox={4}
        >
          <ModalCard.Header
            nomb="true"
            nopb="true"
            py={5}
            px={5}
            title={this.props.title}
            fontSize={5}
            alignItems={"flex-start"}
            fontColor={"newblue"}
            borderBottom={`none`}
          >
          </ModalCard.Header>
          <ModalCard.Body>
            <Flex
              width={1}
              flexDirection={'column'}
              pb={2}
            >
              <Text
                fontSize={2}
                textAlign={'left'}
                color={'dark-gray'}
                dangerouslySetInnerHTML={{ __html: this.props.content }}
              >
              </Text>
            </Flex>
            <Flex
              pt={4}
              my={3}
              alignItems={'flex-start'}
              flexDirection={'column'}
              justifyContent={'center'}
            >
              <RoundButton
                handleClick={this.closeModal}
                buttonProps={{
                  width: ['100%', '40%']
                }}
              >
                Close
              </RoundButton>
            </Flex>
          </ModalCard.Body>
        </ModalCard>
      </Modal>
    );
  }
}

export default TooltipModal;