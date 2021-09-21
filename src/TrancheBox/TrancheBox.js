import React, { Component } from "react";
import { Flex, Icon, Text, Button, Image } from "rimble-ui";
import FunctionsUtil from "../utilities/FunctionsUtil";
import TrancheField from "../TrancheField/TrancheField";

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
      <>
        {/*<DashboardCard
        cardProps={{
          p: 0,
          border: null,
          height: "100%",
          display: "flex",
          flexDirection: "column"
        }}
      >*/}
        <Flex
          my={[3, 0]}
          p={0}
          mx={0}
          justifyContent={[
            "center",
            trancheDetails.type === "AA" ? "left" : "right"
          ]}
        >
          <Flex
            p={0}
            width={[1, 0.94]}
            height={"100%"}
            flexDirection={"column"}
            border={1}
            borderRadius={5}
            my={3}
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
                    size={this.props.isMobile ? "2em" : "2.4em"}
                    alt="random unsplash image"
                    src={trancheDetails.image}
                  />
                  <Flex mx={2}>
                    <Text
                      ml={[2, 0]}
                      fontWeight={4}
                      fontSize={[4, 6]}
                      lineHeight={1}
                    >
                      {trancheDetails.name}
                    </Text>
                  </Flex>
                </Flex>
                <Flex
                  ml={5}
                  mr={3}
                  my={3}
                  alignItems={"flex-start"}
                  flexDirection={"column"}
                >
                  <Flex mx={1} alignItems={"flex-end"} flexDirection={"row"}>
                    <TrancheField
                      fieldInfo={{
                        name: `${trancheDetails.baseName}Apy`,
                        showTooltip: false,
                        props: {
                          decimals: 2,
                          fontWeight: 4,
                          fontSize: [2, 4],
                          lineHeight: "1",
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
                      ml={[2, 3]}
                      my={1}
                      fontSize={1}
                      color={"cellText"}
                      textAlign={"left"}
                      lineHeight={"1"}
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
                    my={3}
                    mr={3}
                    mx={1}
                    fontSize={[2, 3]}
                    fontWeight={2}
                    textAlign={"left"}
                    color={"copyColor"}
                    lineHeight={"1.5"}
                  >
                    {trancheDetails.description.long}
                  </Text>
                </Flex>
              </Flex>
            </Flex>
            <Flex flexDirection={"column"} bg={"near-white2"} mr={4}>
              <Flex width={1} my={3} ml={3} flexDirection={"column"}>
                {trancheDetails.features.map((feature, index) => (
                  <Flex
                    mb={2}
                    mt={[2, 1]}
                    alignItems={"center"}
                    flexDirection={"row"}
                    key={`feature_${index}`}
                  >
                    <Icon
                      ml={3}
                      mr={2}
                      name={"Done"}
                      color={"tick"}
                      my={1}
                      size={this.props.isMobile ? "1.6em" : "2em"}
                    />
                    <Flex mx={2} my={1}>
                      <Text fontWeight={"500"} fontSize={[2, 3]} lineHeight={1}>
                        {feature}
                      </Text>
                    </Flex>
                  </Flex>
                ))}
              </Flex>
            </Flex>
            <Flex width={1} justifyContent={"center"}>
              <Button
                my={3}
                width={0.85}
                contrastColor={"cardBg"}
                mainColor={trancheDetails.color.hex}
                borderRadius={40}
                onClick={e =>
                  this.props.selectTrancheType(trancheDetails.route)
                }
              >
                {this.props.tokenConfig
                  ? `Go to ${trancheDetails.name}`
                  : `Enter the ${trancheDetails.name}`}
              </Button>
            </Flex>
          </Flex>
          {/*[</DashboardCard>]*/}
        </Flex>
      </>
    );
  }
}

export default Base;
