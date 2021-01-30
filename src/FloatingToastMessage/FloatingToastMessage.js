import React, { Component } from 'react';
import { Flex, ToastMessage, Link, Icon } from "rimble-ui";

class FloatingToastMessage extends Component {
  state = {}

  render() {
    let ToastComponent = null;

    switch (this.props.variant){
      case 'success':
        ToastComponent = ToastMessage.Success;
      break;
      case 'processing':
        ToastComponent = ToastMessage.Processing;
      break;
      case 'failure':
        ToastComponent = ToastMessage.Failure;
      break;
      default:
      break;
    }

    if (ToastComponent){
      return (
        <Flex
          right={'0'}
          bottom={'0'}
          zIndex={'9999'}
          position={'fixed'}
          p={ !this.props.isMobile ? '1em' : 0 }
          width={ !this.props.isMobile ? '420px': '100vw' }
        >
          <ToastComponent
            closeElem={false}
            style={{width:'100%'}}
            backgroundColor={'cardBg'}
            message={this.props.message}
            secondaryMessage={this.props.secondaryMessage}
          />
          <Link onClick={this.props.handleClose} style={ this.props.isMobile ? {position:'absolute',top:'10px',right:'10px',width:'20px',height:'20px'} : {position:'absolute',top:'22px',right:'22px',width:'16px',height:'16px'}}>
            <Icon
              name={'Close'}
              color={'dark-gray'}
              size={ this.props.isMobile ? '20' : '16' }
            />
          </Link>
        </Flex>
      );
    }

    return null;
  }
}

export default FloatingToastMessage;