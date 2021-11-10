import React from "react";
import { Box, Flex, Text, Icon } from "rimble-ui";

class WrongNetworkBanner extends React.Component {
  render() {
    const bannerStyle = {
      position: "fixed",
      bottom: 0,
      left: 0,
      right: 0,
      width: "100%",
      zIndex: 9999
    };

    return (
      <Box style={bannerStyle} backgroundColor={'wrongNetworkBannerBg'} p={3}>
        <Flex alignItems={"center"}>
          <Box p={4}>
            <Icon name="Warning" color="gold" size="30" />
          </Box>
          <Flex flexDirection={"column"}>
            <Text fontWeight={"bold"}>
              Looks like you're on the wrong network
            </Text>
            <Text>
              The network you are currently connected{" "}
              <Text.span style={{ textTransform: "capitalize" }}>
                ({this.props.network.current.name})
              </Text.span>{" "}
              is not supported - please switch to the correct network.
            </Text>
          </Flex>
        </Flex>
      </Box>
    );
  }
}

export default WrongNetworkBanner;
