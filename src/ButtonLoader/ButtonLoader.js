import React, { Component } from "react";
import { Flex, Button, Text } from "rimble-ui";
import LoadingSpinner from "../LoadingSpinner/LoadingSpinner.js";

class ButtonLoader extends Component {
  render() {
    return this.props.isSidebar ? (
      <Button onClick={this.props.handleClick} {...this.props.buttonProps}>
        <Flex
          flexDirection={"column"}
          alignItems={"center"}
          justifyContent={"center"}
        >
          <Flex width={1} display={this.props.isLoading ? "flex" : "none"}>
            <LoadingSpinner />
          </Flex>
          <Flex width={1} display={this.props.isLoading ? "none" : "flex"}>
            {this.props.buttonText}
          </Flex>
        </Flex>
      </Button>
    ) : (
      <Flex alignContent="flex-start" justifyContent="left">
        <Button
          alignContent={"flex-start"}
          alignItems={"flex-start"}
          justifyContent={"flex-start"}
          justifyItems={"flex-start"}
          onClick={this.props.handleClick}
          {...this.props.buttonProps}
        >
          <Flex
            flexDirection={"column"}
            alignContent={"flex-start"}
            alignItems={"flex-start"}
            justifyContent={"flex-start"}
            justifyItems={"flex-start"}
          >
            <Flex display={this.props.isLoading ? "flex" : "none"}>
              <LoadingSpinner />
            </Flex>
            <Flex
              {...this.props.flexProps}
              display={this.props.isLoading ? "none" : "flex"}
            >
              <Flex justifyContent={"flex-start"}>
                <Text {...this.props.textProps}>{this.props.buttonText}</Text>
              </Flex>
            </Flex>
          </Flex>
        </Button>
      </Flex>
    );
  }
}

export default ButtonLoader;
