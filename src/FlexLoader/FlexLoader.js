import React, { Component } from 'react';
import { Flex, Loader, Text } from "rimble-ui";

class FlexLoader extends Component {
  render() {
    const textProps = Object.assign({
      fontFamily:'ctas'
    },this.props.textProps);
    return (
      <Flex
        width={1}
        alignItems={'center'}
        justifyContent={'center'}
        {...this.props.flexProps}
      >
        <Loader {...this.props.loaderProps} />
        {
          this.props.text &&
            <Text {...textProps}>{this.props.text}</Text>
        }
      </Flex>
    );
  }
}

export default FlexLoader;
