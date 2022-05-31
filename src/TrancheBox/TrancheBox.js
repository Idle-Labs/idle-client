import Title from "../Title/Title";
import React, { Component } from "react";
import RoundButton from "../RoundButton/RoundButton";
import FunctionsUtil from "../utilities/FunctionsUtil";
import TrancheField from "../TrancheField/TrancheField";
import { Box, Flex, Icon, Text, Image } from "rimble-ui";

//import DashboardCard from "../DashboardCard/DashboardCard";

class Base extends Component {
  // Utils
  functionsUtil = null;

  state = {
    token:null,
    protocol:null,
    tokenConfig:null
  };

  loadUtils() {
    if (this.functionsUtil) {
      this.functionsUtil.setProps(this.props);
    } else {
      this.functionsUtil = new FunctionsUtil(this.props);
    }
  }

  async componentWillMount() {
    this.loadUtils();
    this.loadData();
  }

  async componentDidUpdate(prevProps, prevState) {
    this.loadUtils();
    const contractsInitialized = this.props.contractsInitialized && prevProps.contractsInitialized !== this.props.contractsInitialized;
    if (contractsInitialized){
      this.loadData();
    }
  }

  async loadData(){
    let token=null;
    let protocol=null;
    const networkId = this.functionsUtil.getRequiredNetworkId();

    const bestTrancheInfo = await this.functionsUtil.getBestTranche(this.props.trancheDetails.type,9999);  

    if(bestTrancheInfo){
      token = bestTrancheInfo.token;
      protocol = bestTrancheInfo.protocol;
    } else {
      const strategyInfo = this.functionsUtil.getGlobalConfig(["strategies","tranches"]);
      token = strategyInfo.token;
      protocol = strategyInfo.protocol;

      // Select first tranche is not available
      if (!this.functionsUtil.getArrayPath([protocol,token],this.props.availableTranchesNetworks[networkId])){
        protocol = Object.keys(this.props.availableTranchesNetworks[networkId])[0];
        token = Object.keys(this.props.availableTranchesNetworks[networkId][protocol])[0];
      }
    }
    
    const tokenConfig = this.props.availableTranchesNetworks[networkId][protocol][token];

    return this.setState({
      token,
      protocol,
      tokenConfig
    });
  }

  render() {
    const trancheDetails = this.props.trancheDetails;
    const tokenConfig = this.props.tokenConfig || this.state.tokenConfig;

    return (
      <Box
        my={[3, 0]}
        boxShadow={1}
        borderRadius={2}
        width={[1, 0.49]}
      >
        <Flex
          p={0}
          mx={0}
          border={"0"}
          height={"100%"}
          borderRadius={2}
          overflow={"hidden"}
          flexDirection={"column"}
          backgroundColor={"cardBg"}
          borderColor={"transparent"}
          justifyContent={["center",trancheDetails.type === "AA" ? "left" : "right"]}
        >
          <Box
            width={1}
            borderBottom={`1px solid ${this.props.theme.colors.divider2}`}
          >
            <Flex
              pb={2}
              mx={2}
              my={3}
              flexDirection={"column"}
            >
              <Flex
                mt={2}
                mb={3}
                alignItems={"center"}
              >
                <Image
                  ml={3}
                  mr={2}
                  alt={trancheDetails.name}
                  src={trancheDetails.image}
                  size={this.props.isMobile ? "2em" : "2.4em"}
                />
                <Flex
                  mx={1}
                >
                  <Title
                    as={'h2'}
                    ml={[2, 0]}
                    lineHeight={1}
                  >
                    {trancheDetails.name}
                  </Title>
                </Flex>
              </Flex>
              <Box
                ml={5}
                mr={3}
                mt={3}
                alignItems={"flex-start"}
                flexDirection={"column"}
              >
                <Flex
                  mr={1}
                  flexDirection={"row"}
                  alignItems={"baseline"}
                >
                  <TrancheField
                    fieldInfo={{
                      showTooltip: false,
                      name: `${trancheDetails.baseName}Apy`,
                      props: {
                        decimals: 2,
                        fontWeight: 4,
                        lineHeight: "1",
                        color: 'primary',
                        fontSize: [3, 4],
                        textAlign: "center",
                        flexProps: {
                          justifyItems: "flex-end"
                        }
                      }
                    }}
                    {...this.props}
                    token={this.state.token}
                    tokenConfig={tokenConfig}
                    tranche={this.props.tranche}
                    protocol={this.state.protocol}
                  />
                  <Text
                    my={1}
                    ml={2}
                    fontSize={1}
                    fontWeight={3}
                    lineHeight={"1"}
                    textAlign={"left"}
                    color={"cellText"}
                  >
                    Current APY for <strong>{this.state.token}</strong>
                  </Text>
                </Flex>
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
              </Box>
            </Flex>
          </Box>
          <Flex
            height={"100%"}
            bg={"cardBgContrast"}
            flexDirection={'column'}
            justifyContent={'space-between'}
          >
            <Box
              mb={3}
              pl={2}
              width={1}
            >
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
            </Box>
            <Flex
              width={1}
              height={"auto"}
              alignItems={"flex-end"}
              justifyContent={"center"}
            >
              <RoundButton
                buttonProps={{
                  my: 3,
                  width: 0.85,
                }}
                handleClick={e => this.props.selectTrancheType(trancheDetails.route)}
              >
                {this.props.tokenConfig ? `Go to ${trancheDetails.name}` : `Enter the ${trancheDetails.name}`}
              </RoundButton>
            </Flex>
          </Flex>
        </Flex>
      </Box>
    );
  }
}

export default Base;
