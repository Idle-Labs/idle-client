import React, { Component } from "react";
import RoundButton from "../RoundButton/RoundButton";
import FunctionsUtil from "../utilities/FunctionsUtil";
import TrancheField from "../TrancheField/TrancheField";
import { Box, Flex, Icon, Text, Image } from "rimble-ui";

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
    const trancheDetails = this.props.trancheDetails;
    const strategyInfo = this.functionsUtil.getGlobalConfig([
      "strategies",
      "tranches"
    ]);

    const tokenConfig =
      this.props.tokenConfig ||
      this.props.availableTranches[strategyInfo.protocol][strategyInfo.token];

    return (
      <Box my={[3, 0]} boxShadow={1} width={[1, 0.49]} borderRadius={2}>
        <Flex
          height={"100%"}
          p={0}
          mx={0}
          borderColor={"transparent"}
          border={"0"}
          borderRadius={2}
          overflow={"hidden"}
          flexDirection={"column"}
          backgroundColor={"cardBg"}
          justifyContent={[
            "center",
            trancheDetails.type === "AA" ? "left" : "right"
          ]}
        >
          <Flex
            width={1}
            borderBottom={`1px solid ${this.props.theme.colors.divider2}`}
          >
            <Flex pb={2} mx={2} my={3} flexDirection={"column"}>
              <Flex mt={3} alignItems={"center"}>
                <Image
                  ml={3}
                  mr={1}
                  src={trancheDetails.image}
                  alt={"random unsplash image"}
                  size={this.props.isMobile ? "2em" : "2.4em"}
                />
                <Flex mx={1}>
                  <Text
                    ml={[2, 0]}
                    fontWeight={4}
                    fontSize={[4, 5]}
                    lineHeight={1}
                  >
                    {trancheDetails.name}
                  </Text>
                </Flex>
              </Flex>
              <Flex
                ml={5}
                mr={3}
                mt={3}
                alignItems={"flex-start"}
                flexDirection={"column"}
              >
                <Flex mr={1} flexDirection={"row"} alignItems={"baseline"}>
                  <TrancheField
                    fieldInfo={{
                      name: `${trancheDetails.baseName}Apy`,
                      showTooltip: false,
                      props: {
                        decimals: 2,
                        fontWeight: 4,
                        lineHeight: "1",
                        fontSize: [3, 4],
                        textAlign: "center",
                        flexProps: {
                          justifyItems: "flex-end"
                        },
                        color: this.props.trancheDetails.color.hex
                      }
                    }}
                    {...this.props}
                    tokenConfig={tokenConfig}
                    token={strategyInfo.token}
                    tranche={strategyInfo.tranche}
                    protocol={strategyInfo.protocol}
                  />
                  <Text
                    my={1}
                    ml={[2, 3]}
                    fontSize={1}
                    lineHeight={"1"}
                    textAlign={"left"}
                    color={"cellText"}
                  >
                    Current APY (variable)
                  </Text>
                </Flex>
                {/*
                <TrancheField
                  fieldInfo={{
                    showLoader:false,
                    name:'trancheIDLEDistribution',
                    props:{
                      decimals:2,
                      fontWeight:2,
                      fontSize:[0,1],
                      color:'cellText',
                      textAlign:'center',
                      flexProps:{
                        justifyContent:'center'
                      }
                    },
                  }}
                  {...this.props}
                  tokenConfig={tokenConfig}
                  token={strategyInfo.token}
                  trancheConfig={tokenConfig.AA}
                  tranche={strategyInfo.tranche}
                  protocol={strategyInfo.protocol}
                />
                */}
                <Text
                  mt={3}
                  fontWeight={2}
                  fontSize={[1, 2]}
                  textAlign={"left"}
                  lineHeight={"1.5"}
                  color={"copyColor"}
                >
                  {trancheDetails.description.long}
                </Text>
              </Flex>
            </Flex>
          </Flex>
          <Flex bg={"cardBgContrast"} height={"100%"} flexDirection={"column"}>
            <Flex mt={3} my={3} pl={2} width={1} flexDirection={"column"}>
              {trancheDetails.features.map((feature, index) => (
                <Flex
                  mb={2}
                  my={1}
                  px={2}
                  mt={[2, 1]}
                  alignItems={"center"}
                  flexDirection={"row"}
                  key={`feature_${index}`}
                >
                  <Icon
                    mr={2}
                    ml={3}
                    name={"Done"}
                    color={"tick"}
                    size={this.props.isMobile ? "1.6em" : "1.8em"}
                  />
                  <Text ml={[2, 1]} fontSize={[1, 2]} fontWeight={"500"}>
                    {feature}
                  </Text>
                </Flex>
              ))}
            </Flex>
            <Flex
              height={"100%"}
              alignItems={"flex-end"}
              width={1}
              justifyContent={"center"}
            >
              <RoundButton
                buttonProps={{
                  my: 3,
                  width: 0.85,
                  fontSize: 2,
                  contrastColor: "white",
                  mainColor: trancheDetails.color.hex
                }}
                handleClick={e =>
                  this.props.selectTrancheType(trancheDetails.route)
                }
              >
                {this.props.tokenConfig
                  ? `Go to ${trancheDetails.name}`
                  : `Enter the ${trancheDetails.name}`}
              </RoundButton>
            </Flex>
          </Flex>
        </Flex>
      </Box>
    );
  }
}

export default Base;
