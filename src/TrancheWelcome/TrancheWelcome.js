import Title from "../Title/Title";
import React, { Component } from "react";
import { Box, Flex } from "rimble-ui";
import TrancheBox from "../TrancheBox/TrancheBox";
import FunctionsUtil from "../utilities/FunctionsUtil";
import TrancheFlash from "../TrancheFlash/TrancheFlash";
class Base extends Component {
  // Utils
  functionsUtil = null;

  loadUtils() {
    if (this.functionsUtil) {
      this.functionsUtil.setProps(this.props);
    } else {
      this.functionsUtil = new FunctionsUtil(this.props);
    }
  }

  async componentWillMount() {
    this.loadUtils();
  }

  async componentDidUpdate(prevProps, prevState) {
    this.loadUtils();
  }

  render() {
    const tranchesDetails = this.functionsUtil.getGlobalConfig(["tranches"]);
    return (
      <Box mx={[0, 5]} mb={3} width={1} maxWidth={8} aligItems={"center"}>
        <Flex
          width={1}
          flexDirection={"column"}
          justifyContent={"space-between"}
        >
          {!this.props.tokenConfig ? (
            <>
              <Title fontSize={[5, 6]} mb={3}>
                Perpetual Yield Tranches
              </Title>
              <Flex
                width={1}
                mb={[3, 4]}
                mx={"auto"}
                aligItems={"center"}
                justifyContent={"center"}
              ></Flex>
              <Flex border={1} borderRadius={5} bg={"newblue"}>
                <TrancheFlash {...this.props}></TrancheFlash>
              </Flex>
            </>
          ) : (
            <Title
              mb={3}
              fontWeight={2}
              fontSize={[3, 4]}
              color={"copyColor"}
              textAlign={"center"}
            >
              Select your preferred Tranche
            </Title>
          )}
          <Flex my={3} mx={0} justifyContent={"center"}>
            <Flex
              width={1}
              flexDirection={["column", "row"]}
              justifyContent={"space-between"}
            >
              {Object.keys(tranchesDetails).map(trancheType => (
                <TrancheBox
                  {...this.props}
                  tokenConfig={this.props.tokenConfig}
                  trancheDetails={tranchesDetails[trancheType]}
                />
              ))}
            </Flex>
          </Flex>
        </Flex>
      </Box>
    );
  }
}

export default Base;
