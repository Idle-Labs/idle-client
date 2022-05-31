import { Flex } from "rimble-ui";
import React, { Component } from "react";
import RoundButton from "../RoundButton/RoundButton.js";
import LoadingSpinner from "../LoadingSpinner/LoadingSpinner.js";

class ButtonLoader extends Component {
  render() {
    return (
      <RoundButton
        handleClick={this.props.handleClick}
        buttonProps={{width:'auto',...this.props.buttonProps}}
      >
        <Flex
          flexDirection={"column"}
          alignItems={"center"}
          justifyContent={"center"}
        >
          {
            this.props.isLoading ? (
              <Flex width={1} display={this.props.isLoading ? "flex" : "none"}>
                <LoadingSpinner />
              </Flex>
            ) : this.props.buttonText
          }
        </Flex>
      </RoundButton>
    );
  }
}

export default ButtonLoader;
