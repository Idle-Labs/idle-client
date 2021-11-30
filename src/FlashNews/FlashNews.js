import ExtLink from "../ExtLink/ExtLink";
import React, { Component } from 'react';
import { Flex, Icon, Text } from "rimble-ui";
import FunctionsUtil from '../utilities/FunctionsUtil';
import DashboardCard from "../DashboardCard/DashboardCard";

class FlashNews extends Component {

  state = {
    activeNews:null
  }

  // Utils
  functionsUtil = null;

  loadUtils(){
    if (this.functionsUtil){
      this.functionsUtil.setProps(this.props);
    } else {
      this.functionsUtil = new FunctionsUtil(this.props);
    }
  }

  async componentDidMount(){
    this.loadUtils();

    const stakingConfig = this.functionsUtil.getGlobalConfig(["tools", "stake"]);
    const nexusMutualConfig = this.functionsUtil.getGlobalConfig(["tools", "nexusMutual"]);
    const stakingPolygonConfig = this.functionsUtil.getGlobalConfig(["tools", "stakePolygon"]);

    const flashNews = {
      1: [
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
            url: this.functionsUtil.getDashboardSectionUrl(`tools/${this.functionsUtil.getGlobalConfig(["tools", "nexusMutual", "route"])}`)
          }
        }
      ],
      137: [
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
    };

    const currentNetworkId = this.functionsUtil.getRequiredNetworkId();
    const activeFlashNews = flashNews[currentNetworkId];
    const activeNews = activeFlashNews[Math.floor(Math.random() * activeFlashNews.length)];
    this.setState({
      activeNews
    });
  }

  async componentDidUpdate(prevProps,prevState){
    this.loadUtils();
  }

  render() {
    return this.state.activeNews ? (
      <DashboardCard
        cardProps={{
          p: 2,
          mb: 3,
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
    ) : null;
  }
}

export default FlashNews;
