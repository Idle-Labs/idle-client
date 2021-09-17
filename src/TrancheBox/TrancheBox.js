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
          p={0}
          mx={0}
          justifyContent={trancheDetails.type === "AA" ? "left" : "right"}
        >
          <Flex
            p={0}
            width={0.92}
            height={"100%"}
            flexDirection={"column"}
            border={1}
          >
            <Flex
              width={1}
              borderBottom={`1px solid ${this.props.theme.colors.divider2}`}
            >
              <Flex
                pb={2}
                mx={2}
                my={3}
                flexDirection={"row"}
                justifyContent={"space-between"}
                alignItems={["flex-start", "baseline"]}
              >
                <Image
                  mx={2}
                  mr={1}
                  width={["2em", "2.4em"]}
                  alt="random unsplash image"
                  borderRadius={8}
                  src={trancheDetails.image}
                />

                <Flex alignItems={"flex-start"} flexDirection={"column"}>
                  <Text textfontWeight={4} fontSize={[4, 6]} lineHeight={"2"}>
                    {trancheDetails.name}
                  </Text>
                  <Flex alignItems={"flex-start"} flexDirection={"row"}>
                    <TrancheField
                      fieldInfo={{
                        name: `${trancheDetails.baseName}Apy`,
                        showTooltip: false,
                        props: {
                          decimals: 2,
                          fontWeight: 4,
                          fontSize: [2, 4],
                          lineHeight: "2",
                          textAlign: "center",
                          flexProps: {
                            justifyContent: "center"
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
                      fontSize={0}
                      color={"cellText"}
                      textAlign={"left"}
                      lineHeight={"4"}
                    >
                      Current APY (variable)
                    </Text>

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
                  </Flex>
                  <Text
                    mr={3}
                    mb={3}
                    fontWeight={2}
                    textAlign={"justify"}
                    color={"copyColor"}
                    lineHeight={"2"}
                  >
                    {trancheDetails.description.long}
                  </Text>
                </Flex>
              </Flex>
            </Flex>
            <Flex bg={"near-white2"}>
              <Flex
                width={1}
                height={["100%", "20em"]}
                flexDirection={"column"}
                mx={3}
              >
                <Flex width={1} my={3} flexDirection={"column"}>
                  {trancheDetails.features.map((feature, index) => (
                    <Flex
                      mb={2}
                      width={1}
                      mt={[0, 1]}
                      alignItems={"center"}
                      flexDirection={"row"}
                      key={`feature_${index}`}
                    >
                      <Icon
                        mx={2}
                        mr={3}
                        name={"Done"}
                        color={"tick"}
                        my={2}
                        size={this.props.isMobile ? "2em" : "2.4em"}
                      />
                      <Text
                        fontWeight={3}
                        fontSize={[2, 3]}
                        my={2}
                        lineHeight={1}
                      >
                        {feature}
                      </Text>
                    </Flex>
                  ))}
                </Flex>
                <Flex height={"100%"} alignItems={"flex-end"}>
                  <Button
                    my={3}
                    width={1}
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
            </Flex>
            {/*[</DashboardCard>]*/}
          </Flex>
        </Flex>
      </>
    );
  }
}

export default Base;
