import React, { Component } from 'react';
import { Flex, Text, Tooltip, Icon } from "rimble-ui";

class TooltipText extends Component {
  render() {
    return (
      <Flex
        width={1}
        alignItems={'center'}
        flexDirection={'row'}
        {...this.props.flexProps}
      >
        <Text
          fontWeight={3}
          fontSize={[1,2]}
          color={'cellText'}
          {...this.props.textProps}
        >
          {this.props.text}
        </Text>
        <Tooltip
          placement={'top'}
          message={this.props.message}
          {...this.props.tooltipProps}
        >
          <Icon
            ml={1}
            style={{
              cursor:'pointer'
            }}
            name={"Info"}
            color={'cellTitle'}
            size={ this.props.isMobile ? '0.8em' : '1em'}
            {...this.props.iconProps}
          />
        </Tooltip>
      </Flex>
    );
  }
}

export default TooltipText;