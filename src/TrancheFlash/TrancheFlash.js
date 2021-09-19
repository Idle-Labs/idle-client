import React, { Component } from "react";
import { Flex, Icon, Text, Button, Image } from "rimble-ui";
import FunctionsUtil from "../utilities/FunctionsUtil";
import TrancheDetails from "../TrancheDetails/TrancheDetails";

//import DashboardCard from "../DashboardCard/DashboardCard";

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
    const flashData = this.functionsUtil.getGlobalConfig(["tranchflash"]);
    return (
      <>
        <Flex
          width={1}
          mx={4}
          flexDirection={["column", "row"]}
          justifyContent={"center"}
        >
          <Flex mx={2} my={4} width={[1, 0.4]} flexDirection={"column"}>
            <Flex justifyContent={"left"} my={4} width={0.8}>
              <Text
                bold={"true"}
                color={"white"}
                textAlign={"left"}
                fontWeight={4}
                fontSize={7}
                lineHeight={1}
              >
                {flashData.subtitle}
              </Text>
            </Flex>
            <Flex justifyContent={"left"} my={4} width={[1, 0.8]}>
              <Text
                color={"white"}
                textAlign={"left"}
                fontWeight={2}
                fontSize={3}
              >
                {flashData.desc}
              </Text>
            </Flex>
          </Flex>
          <Flex hidden={this.props.isMobile ? 1 : 0} width={0.2} mb={5}>
            <Image
              hidden={this.props.isMobile ? 1 : 0}
              src={flashData.arrows}
            />
          </Flex>
          <Flex my={5} width={[1, 0.4]} flexDirection={"column"}>
            <Flex flexDirection={"row"}>
              <Image
                my={[0, 2]}
                width={[0.1, 0.2]}
                src={this.functionsUtil.getGlobalConfig([
                  "tranches",
                  "AA",
                  "bubble"
                ])}
              />
              <Text
                my={[2, 1]}
                color={"white"}
                textAlign={"justify"}
                fontWeight={2}
                fontSize={3}
              >
                {flashData.juniorinfo}
              </Text>
            </Flex>
            <Flex>
              <Image
                my={[0, 2]}
                ml={[0, 4]}
                width={[0.1, 0.2]}
                src={this.functionsUtil.getGlobalConfig([
                  "tranches",
                  "BB",
                  "bubble"
                ])}
              />
              <Text
                my={[3, 1]}
                color={"white"}
                textAlign={"justify"}
                fontWeight={2}
                fontSize={3}
              >
                {flashData.seniorinfo}
              </Text>
            </Flex>
          </Flex>
          {/*<Flex width={0.3}>
            <Text>ABC</Text>
          </Flex>*/}
        </Flex>
      </>
    );
  }
}
export default Base;
