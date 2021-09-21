import React, { Component } from "react";
import { Link, Flex, Text, Image } from "rimble-ui";
import FunctionsUtil from "../utilities/FunctionsUtil";

//import DashboardCard from "../DashboardCard/DashboardCard";

class TrancheFlash extends Component {
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
      <Flex
        width={1}
        mx={4}
        flexDirection={["column", "row"]}
        justifyContent={"center"}
      >
        <Flex
          mx={2}
          my={[2,4]}
          width={[1, 0.4]}
          flexDirection={"column"}
        >
          <Flex justifyContent={"left"} my={3} width={[1, 0.7]}>
            <Text
              bold={"true"}
              color={"white"}
              textAlign={"left"}
              fontWeight={4}
              fontSize={[5, 6]}
              lineHeight={1}
            >
              {flashData.subtitle}
            </Text>
          </Flex>
          <Flex justifyContent={"left"} mt={2} mb={[2,4]} width={1}>
            <Text
              color={"white"}
              textAlign={"left"}
              fontWeight={2}
              fontSize={2}
            >
              {flashData.desc}
            </Text>
          </Flex>
          <Flex mt={3} mb={2} flexDirection={"column"} width={1}>
            {flashData.questions.map(question => (
              <Flex my={2} alignItems={"flex-start"}>
                <Image src={flashData.helpcircle} />
                <Link
                  ml={2}
                  fontSize={2}
                  fontWeight={2}
                  opacity={"50%"}
                  color={"white"}
                  textAlign={"left"}
                  onClick={e =>
                    this.props.openTooltipModal(question.desc, question.msg)
                  }
                >
                  {question.desc}
                </Link>
              </Flex>
            ))}
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
          <Flex my={[1, 0]} flexDirection={"row"} alignItems={"flex-start"}>
            <Image
              my={[0, 2]}
              width={['2.4em', '4.7em']}
              src={this.functionsUtil.getGlobalConfig([
                "tranches",
                "AA",
                "bubble"
              ])}
            />
            <Text
              mt={[0, 2]}
              mx={2}
              mb={[2, 1]}
              color={"white"}
              textAlign={"left"}
              fontWeight={2}
              fontSize={2}
              dangerouslySetInnerHTML={{
                __html: flashData.juniorinfo
              }}
            ></Text>
          </Flex>
          <Flex my={[1, 0]} flexDirection={"row"} alignItems={"flex-start"}>
            <Image
              my={[0, 2]}
              ml={[0, 4]}
              width={['2.4em', '4.7em']}
              src={this.functionsUtil.getGlobalConfig([
                "tranches",
                "BB",
                "bubble"
              ])}
            />
            <Text
              mt={[0, 2]}
              mx={2}
              mb={[2, 1]}
              color={"white"}
              textAlign={"left"}
              fontWeight={2}
              fontSize={2}
              dangerouslySetInnerHTML={{
                __html: flashData.seniorinfo
              }}
            ></Text>
          </Flex>
        </Flex>
        {/*<Flex width={0.3}>
          <Text>ABC</Text>
        </Flex>*/}
      </Flex>
    );
  }
}
export default TrancheFlash;
