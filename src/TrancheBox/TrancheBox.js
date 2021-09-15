import React, { Component } from "react";
import { Flex, Icon, Text, Button, Image } from "rimble-ui";
import FunctionsUtil from "../utilities/FunctionsUtil";
import TrancheField from "../TrancheField/TrancheField";
import DashboardCard from "../DashboardCard/DashboardCard";

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
      <DashboardCard
        cardProps={{
          py: 3,
          px: 3,
          border: null,
          height: "100%",
          display: "flex",
          flexDirection: "column"
        }}
      >
        <Flex
          pb={2}
          mb={3}
          width={1}
          flexDirection={"column"}
          justifyContent={"space-between"}
          alignItems={["flex-start", "baseline"]}
          borderBottom={`1px solid ${this.props.theme.colors.divider}`}
        >
          <Flex alignItems={"center"} flexDirection={"row"}>
            <Image
              mr={2}
              width={this.props.isMobile ? "1.8em" : "2.2em"}
              alt="random unsplash image"
              borderRadius={8}
              src={trancheDetails.image}
            />

            <Text fontWeight={4} fontSize={[4, 6]} lineHeight={"1"}>
              {trancheDetails.name}
            </Text>
          </Flex>
          <Flex
            ml={this.props.isMobile ? "2.2em" : "2.6em"}
            mr={2}
            alignItems={"flex-end"}
            flexDirection={"row"}
          >
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
            <Text fontSize={0} color={"cellText"} textAlign={"left"}>
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
        </Flex>
        <Flex width={1} height={"100%"} flexDirection={"column"}>
          <Text mb={3} fontWeight={3} color={"copyColor"}>
            {trancheDetails.description.long}
          </Text>
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
                <Icon mr={2} name={"Done"} color={"tick"} />
                <Text fontWeight={3} fontSize={[2, 3]}>
                  {feature}
                </Text>
              </Flex>
            ))}
          </Flex>
          <Flex height={"100%"} alignItems={"flex-end"}>
            <Button
              mt={3}
              width={1}
              contrastColor={"cardBg"}
              icon={trancheDetails.icon}
              mainColor={trancheDetails.color.hex}
              borderRadius={40}
              onClick={e => this.props.selectTrancheType(trancheDetails.route)}
            >
              {this.props.tokenConfig
                ? `Go to ${trancheDetails.name}`
                : `Enter the ${trancheDetails.name}`}
            </Button>
          </Flex>
        </Flex>
      </DashboardCard>
    );
  }
}

export default Base;
