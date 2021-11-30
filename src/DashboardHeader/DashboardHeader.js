import ExtLink from "../ExtLink/ExtLink";
import React, { Component } from "react";
import { Box, Flex, Text, Button } from "rimble-ui";
import MenuAccount from "../MenuAccount/MenuAccount";
import GovModal from "../utilities/components/GovModal";
import GovernanceUtil from "../utilities/GovernanceUtil";
import DashboardCard from "../DashboardCard/DashboardCard";

class DashboardHeader extends Component {
  state = {
    unclaimed: null,
    vestingAmount: null,
    govModalOpened: false
  };

  // Utils
  idleGovToken = null;
  functionsUtil = null;
  governanceUtil = null;

  loadUtils() {
    if (this.governanceUtil) {
      this.governanceUtil.setProps(this.props);
    } else {
      this.governanceUtil = new GovernanceUtil(this.props);
    }

    this.functionsUtil = this.governanceUtil.functionsUtil;
    this.idleGovToken = this.functionsUtil.getIdleGovToken();
  }

  async componentWillMount() {
    this.loadUtils();
    this.loadData();
  }

  async componentDidUpdate(prevProps, prevState) {
    this.loadUtils();

    const accountChanged = prevProps.account !== this.props.account;
    const networkChanged = JSON.stringify(prevProps.network.required) !== JSON.stringify(this.props.network.required);
    if (accountChanged || networkChanged) {
      await this.loadData();
    }
  }

  async loadData() {
    const idleGovTokenEnabled = this.functionsUtil.getGlobalConfig([
      "govTokens",
      "IDLE",
      "enabled"
    ]);
    if (idleGovTokenEnabled && this.props.account) {
      const unclaimed = await this.idleGovToken.getUnclaimedTokens(
        this.props.account
      );
      this.setState({
        unclaimed
      });
    }
  }

  setConnector = async connectorName => {
    // Send Google Analytics event
    this.functionsUtil.sendGoogleAnalyticsEvent({
      eventAction: "logout",
      eventCategory: "Connect"
    });

    if (typeof this.props.setConnector === "function") {
      this.props.setConnector(connectorName);
    }

    return await this.props.context.setConnector(connectorName);
  };

  async exit() {
    this.props.goToSection("/", false);
  }

  setGovModal(govModalOpened) {
    this.setState({
      govModalOpened
    });
  }

  render() {
    return (
      <Box >
        <Flex
          py={2}
          width={1}
          bg={"cardBg"}
          flexDirection={"row"}
          justifyContent={"space-between"}
          alignItems={["flex-end", "center"]}
          borderBottom={`1px solid ${this.props.theme.colors.menuRightBorder}`}
        >
          <MenuAccount
            width={1}
            {...this.props}
            setGovModal={this.setGovModal.bind(this)}
            goToSection={this.props.goToSection.bind(this)}
          />
        </Flex>
        {
          this.state.unclaimed && this.state.unclaimed.gt(0) && (
            <DashboardCard
              cardProps={{
                p: 2,
                mt: 3,
                width: 1
              }}
              isActive={true}
              isInteractive={false}
            >
              <Flex
                alignItems={"center"}
                justifyContent={"center"}
                flexDirection={["column", "row"]}
              >
                <Text
                  fontWeight={500}
                  fontSize={"15px"}
                  color={"flashColor"}
                  textAlign={"center"}
                >
                  IDLE Governance Token is now available,
                  <ExtLink
                    ml={1}
                    fontWeight={500}
                    color={"primary"}
                    fontSize={"15px"}
                    hoverColor={"primary"}
                    href={
                      "https://idlefinance.medium.com/idle-governance-is-live-9b55e8f407d7"
                    }
                  >
                    discover more
                  </ExtLink>
                  ! You have {this.state.unclaimed.toFixed(4)} IDLE tokens to
                  claim.
                </Text>
                <Button
                  ml={[0, 2]}
                  mt={[2, 0]}
                  size={"small"}
                  mainColor={"blue"}
                  onClick={e => this.setGovModal(true)}
                >
                  CLAIM NOW
                </Button>
              </Flex>
            </DashboardCard>
          )
        }
        <GovModal
          {...this.props}
          isOpen={this.state.govModalOpened}
          claimCallback={this.loadData.bind(this)}
          closeModal={e => this.setGovModal(false)}
        />
      </Box>
    );
  }
}

export default DashboardHeader;
