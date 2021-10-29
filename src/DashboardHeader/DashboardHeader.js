import ExtLink from "../ExtLink/ExtLink";
import React, { Component } from "react";
import MenuAccount from "../MenuAccount/MenuAccount";
import GovModal from "../utilities/components/GovModal";
import GovernanceUtil from "../utilities/GovernanceUtil";
import { Box, Flex, Text, Icon, Button } from "rimble-ui";
import DashboardCard from "../DashboardCard/DashboardCard";
import DelegateVesting from "../DelegateVesting/DelegateVesting";

class DashboardHeader extends Component {
  state = {
    unclaimed: null,
    activeNews: null,
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

    const stakingConfig = this.functionsUtil.getGlobalConfig(["tools","stake"]);
    const nexusMutualConfig = this.functionsUtil.getGlobalConfig(["tools","nexusMutual"]);
    const stakingPolygonConfig = this.functionsUtil.getGlobalConfig(["tools","stakePolygon"]);

    const flashNews = {
      1:[
        {
          name: "Governance Forum",
          icon: "LightbulbOutline",
          text: `Do you have any idea to improve the Idle Protocol? Let's discuss it in our`,
          link: {
            text: `Governance Forum`,
            url: this.functionsUtil.getGlobalConfig(["forumURL"])
          }
        },
        {
          icon: stakingConfig.icon,
          name: stakingConfig.label,
          text: `You can now stake your $IDLE token and take part of the fee-sharing for long-term holders.`,
          link: {
            text: `Stake Now`,
            url: this.functionsUtil.getDashboardSectionUrl(`tools/${stakingConfig.route}`)
          }
        },
        {
          icon: nexusMutualConfig.icon,
          name: nexusMutualConfig.label,
          text: `Protect your funds against smart-contract attacks with Nexus Mutual.`,
          link: {
            text: `Get Covered`,
            url: this.functionsUtil.getDashboardSectionUrl(`tools/${this.functionsUtil.getGlobalConfig(["tools","nexusMutual","route"])}`)
          }
        }
      ],
      137:[
        {
          icon: stakingPolygonConfig.icon,
          name: stakingPolygonConfig.label,
          text: `SushiSwap LP Staking on Polygon is now available!`,
          link: {
            text: `Stake Now`,
            url: this.functionsUtil.getDashboardSectionUrl(`tools/${stakingPolygonConfig.route}`)
          }
        }
      ]
    }

    const currentNetworkId = this.functionsUtil.getRequiredNetworkId();
    const activeFlashNews = flashNews[currentNetworkId];
    const activeNews = activeFlashNews[Math.floor(Math.random() * activeFlashNews.length)];
    this.setState({
      activeNews
    });

    return null;
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
      <Box mb={3}>
        <Flex
          pb={2}
          width={1}
          flexDirection={"row"}
          justifyContent={"space-between"}
          alignItems={["flex-end", "center"]}
          borderBottom={`1px solid ${this.props.theme.colors.divider}`}
        >
          <MenuAccount
            width={1}
            {...this.props}
            setGovModal={this.setGovModal.bind(this)}
          />
        </Flex>
        {this.state.unclaimed && this.state.unclaimed.gt(0) ? (
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
        ) : (
          this.props.isDashboard &&
          this.state.activeNews && (
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
                <Icon
                  mr={1}
                  size={"1.2em"}
                  color={"flashColor"}
                  name={this.state.activeNews.icon}
                />
                <Text
                  fontWeight={500}
                  fontSize={"15px"}
                  color={"flashColor"}
                  textAlign={"center"}
                >
                  {this.state.activeNews.text}
                </Text>
                <ExtLink
                  ml={1}
                  fontWeight={500}
                  color={"primary"}
                  fontSize={"15px"}
                  hoverColor={"primary"}
                  href={this.state.activeNews.link.url}
                  onClick={e =>
                    this.functionsUtil.sendGoogleAnalyticsEvent({
                      eventCategory: "UI",
                      eventAction: "flashNews",
                      eventLabel: this.state.activeNews.name
                    })
                  }
                >
                  <Flex
                    alignItems={"center"}
                    flexDirection={"row"}
                    justifyContent={"center"}
                  >
                    {this.state.activeNews.link.text}
                    <Icon
                      ml={1}
                      size={"0.9em"}
                      color={"primary"}
                      name={"OpenInNew"}
                    />
                    .
                  </Flex>
                </ExtLink>
              </Flex>
            </DashboardCard>
          )
        )}
        {this.props.isGovernance && <DelegateVesting {...this.props} />}
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
