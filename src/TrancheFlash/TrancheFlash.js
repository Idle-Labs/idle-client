import React, { Component } from "react";
import { Flex, Text, Image, Tooltip } from "rimble-ui";
import FunctionsUtil from "../utilities/FunctionsUtil";

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
            <Flex justifyContent={"left"} my={4} width={[1, 0.8]}>
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
                fontSize={2}
              >
                {flashData.desc}
              </Text>
            </Flex>
            <Flex flexDirection={"column"} width={[1, 0.8]}>
              <Flex my={2}>
                <Tooltip
                  placement={"top"}
                  message={this.functionsUtil.getGlobalConfig([
                    "tranchflash",
                    "workmsg"
                  ])}
                >
                  <Image src={flashData.helpcircle} />
                </Tooltip>
                <Text
                  ml={3}
                  opacity={"50%"}
                  color={"white"}
                  textAlign={"left"}
                  fontWeight={2}
                  fontSize={2}
                >
                  How it Works?
                </Text>
              </Flex>
              <Flex my={2}>
                <Tooltip
                  placement={"left"}
                  message={this.functionsUtil.getGlobalConfig([
                    "tranchflash",
                    "defaultmsg"
                  ])}
                >
                  <Image src={flashData.helpcircle} />
                </Tooltip>
                <Text
                  ml={3}
                  opacity={"50%"}
                  color={"white"}
                  textAlign={"left"}
                  fontWeight={2}
                  fontSize={2}
                >
                  What happens in a case of a default?
                </Text>
              </Flex>
            </Flex>
          </Flex>

          <Flex
            hidden={this.props.isMobile ? 1 : 0}
            alignItems={"flex-start"}
            width={0.2}
            mt={6}
          >
            <Image
              hidden={this.props.isMobile ? 1 : 0}
              src={flashData.arrows}
            />
          </Flex>
          <Flex ml={2} my={[3, 5]} width={[1, 0.4]} flexDirection={"column"}>
            <Flex flexDirection={"row"} alignItems={"flex-start"}>
              <Image
                my={[1, 2]}
                width={[0.1, 0.2]}
                src={this.functionsUtil.getGlobalConfig([
                  "tranches",
                  "AA",
                  "bubble"
                ])}
              />
              <Text
                mx={2}
                mb={[2, 1]}
                color={"white"}
                textAlign={"justify"}
                fontWeight={2}
                fontSize={2}
              >
                {flashData.juniorinfo}
              </Text>
            </Flex>
            <Flex flexDirection={"row"} alignItems={"flex-start"}>
              <Image
                my={[1, 2]}
                ml={[0, 4]}
                width={[0.1, 0.2]}
                src={this.functionsUtil.getGlobalConfig([
                  "tranches",
                  "BB",
                  "bubble"
                ])}
              />
              <Text
                mx={2}
                mb={[2, 1]}
                color={"white"}
                textAlign={"justify"}
                fontWeight={2}
                fontSize={2}
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
