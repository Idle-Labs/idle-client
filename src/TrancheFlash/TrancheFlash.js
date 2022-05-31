import Title from "../Title/Title";
import React, { Component } from "react";
import { Link, Flex, Text, Image } from "rimble-ui";
import FunctionsUtil from "../utilities/FunctionsUtil";

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
        <Flex mx={2} my={[2, 4]} width={[1, 0.4]} flexDirection={"column"}>
          <Flex justifyContent={"left"} my={3} width={[1, 0.7]}>
            <Title
              textAlign={'left'}
            >
              {flashData.subtitle}
            </Title>
          </Flex>
          <Flex
            mt={2}
            width={1}
            mb={[2, 3]}
            justifyContent={"left"}
          >
            <Text
              fontSize={2}
              fontWeight={2}
              color={"primary"}
              textAlign={"left"}
            >
              {flashData.desc}
            </Text>
          </Flex>
          <Flex
            mt={2}
            mb={2}
            width={1}
            flexDirection={"column"}
          >
            {
              flashData.questions.map( (question,index) => (
                <Flex
                  my={2}
                  key={`question_${index}`}
                  alignItems={"flex-start"}
                >
                  <Link
                    fontSize={2}
                    fontWeight={2}
                    opacity={"50%"}
                    color={"primary"}
                    textAlign={"left"}
                    onClick={e =>
                      this.props.openTooltipModal(question.desc, question.msg)
                    }
                  >
                    <Flex
                      flexDirection={'row'}
                      alignItems={"flex-start"}
                    >
                      <Image
                        mr={2}
                        src={flashData.helpcircle}
                      />
                      {question.desc}
                    </Flex>
                  </Link>
                </Flex>
              ))
            }
          </Flex>
        </Flex>
        <Flex
          mt={6}
          width={0.2}
          hidden={this.props.isMobile ? 1 : 0}
          alignItems={"flex-start"}
        >
          <Image hidden={this.props.isMobile ? 1 : 0} src={flashData.arrows} />
        </Flex>
        <Flex ml={2} my={[3, 5]} width={[1, 0.4]} flexDirection={"column"}>
          <Flex my={[1, 0]} flexDirection={"row"} alignItems={"flex-start"}>
            <Image
              my={[0, 2]}
              width={["2.4em", "4.7em"]}
              src={this.functionsUtil.getGlobalConfig(["tranches","AA","bubble"])}
            />
            <Text
              mt={[0, 2]}
              mx={2}
              mb={[2, 1]}
              color={"primary"}
              textAlign={"left"}
              fontWeight={2}
              fontSize={2}
              dangerouslySetInnerHTML={{
                __html: flashData.seniorinfo
              }}
            ></Text>
          </Flex>
          <Flex my={[1, 0]} flexDirection={"row"} alignItems={"flex-start"}>
            <Image
              my={[0, 2]}
              ml={[0, 4]}
              width={["2.4em", "4.7em"]}
              src={this.functionsUtil.getGlobalConfig(["tranches","BB","bubble"])}
            />
            <Text
              mx={2}
              mt={[0, 2]}
              mb={[2, 1]}
              fontSize={2}
              fontWeight={2}
              color={"primary"}
              textAlign={"left"}
              dangerouslySetInnerHTML={{
                __html: flashData.juniorinfo
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
