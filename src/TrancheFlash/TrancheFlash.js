import React, { Component } from "react";
import { Flex, Icon, Text, Button, Image } from "rimble-ui";
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
        <Flex width={1} flexDirection={"row"}>
          <Flex width={0.5} flexDirection={"column"}>
            <Flex width={0.9}>
              <Text bold={"true"} color={"white"} fontWeight={4} fontSize={7}>
                {flashData.title}
              </Text>
            </Flex>
          </Flex>
          <Flex></Flex>
        </Flex>
      </>
    );
  }
}
export default Base;
