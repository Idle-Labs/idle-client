import ExtLink from "../ExtLink/ExtLink";
import React, { Component } from "react";
import RoundButton from "../RoundButton/RoundButton";
import { Link as RouterLink } from "react-router-dom";
import FunctionsUtil from "../utilities/FunctionsUtil";
import { Flex, Box, Icon, Text, Image, Link } from "rimble-ui";
import NetworkIndicator from "../NetworkIndicator/NetworkIndicator";

class DashboardMenu extends Component {
  state = {
    logout: false,
    buyModalOpened: false,
    isHover: false
  };

  // Utils
  functionsUtil = null;
  setConnector = async connectorName => {
    // Send Google Analytics event
    this.functionsUtil.sendGoogleAnalyticsEvent({
      eventCategory: "Connect",
      eventAction: "logout"
    });

    if (typeof this.props.setConnector === "function") {
      this.props.setConnector(connectorName);
    }

    return await this.props.context.unsetConnector();
    // return await this.props.context.setConnector(connectorName);
  };

  async logout() {
    this.setState({
      logout: true
    });

    this.props.logout();
    await this.setConnector("Infura");
    // this.props.closeModal();
  }
  loadUtils() {
    if (this.functionsUtil) {
      this.functionsUtil.setProps(this.props);
    } else {
      this.functionsUtil = new FunctionsUtil(this.props);
    }
  }
  setGovModal(govModalOpened) {
    this.setState({
      govModalOpened
    });
  }

  setBuyModalOpened(buyModalOpened) {
    this.setState({
      buyModalOpened
    });
  }

  async componentWillMount() {
    this.loadUtils();
  }

  async componentDidUpdate(prevProps, prevState) {
    this.loadUtils();
  }

  render() {
    if (!this.props.menu.length) {
      return null;
    }

    const currentNetworkId = this.functionsUtil.getRequiredNetworkId();
    const landingStrategies = this.functionsUtil.getGlobalConfig(['landingStrategies']);
    const visibleStrategies = Object.keys(landingStrategies).filter(s => landingStrategies[s].visible && (!landingStrategies[s].availableNetworks.length || landingStrategies[s].availableNetworks.includes(currentNetworkId)) && (!landingStrategies[s].enabledEnvs.length || landingStrategies[s].enabledEnvs.includes(this.props.currentEnv)) );

    const governanceConfig = this.functionsUtil.getGlobalConfig(['governance']);
    const governanceRoute = governanceConfig.baseRoute;
    const dashboardRoute = this.functionsUtil.getGlobalConfig(['dashboard', 'baseRoute']) + '/' + visibleStrategies[0];

    const visibleLinks = this.props.menu.filter(menuLink => {
      const isVisible = menuLink.visible === undefined || menuLink.visible;
      const showMobile = menuLink.mobile === undefined || menuLink.mobile;
      return isVisible && (!this.props.isMobile || showMobile);
    });

    if (!visibleLinks.length) {
      return null;
    }

    const isDarkTheme = this.props.themeMode === "dark";
    const darkModeEnabled = this.functionsUtil.getGlobalConfig([
      "dashboard",
      "theme",
      "darkModeEnabled"
    ]);

    const isProdEnv = this.functionsUtil.checkUrlOrigin();
    const isChristmas = this.functionsUtil.checkChristmas();
    let logoSrc = isProdEnv ? (!isDarkTheme ? "images/logo-gradient.svg" : "images/logo-dark.svg") : (!isDarkTheme ? "images/logo-gradient-beta.png" : "images/logo-white-beta.png");

    let logoHeight = '42px';
    if (isChristmas && isProdEnv){
      logoHeight = '62px';
      logoSrc = !isDarkTheme ? "images/logo-gradient-christmas.svg" : "images/logo-dark-christmas.svg";
    }

    return (
      <Flex
        p={0}
        height={"100%"}
        flexDirection={"column"}
      >
        <Flex
          p={4}
          pb={2}
          mb={3}
          flexDirection={"row"}
          alignItems={"center"}
          justifyContent={"flex-start"}
        >
          <RouterLink
            to={"/"}
          >
            <Image
              src={logoSrc}
              height={logoHeight}
              position={"relative"}
            />
          </RouterLink>
        </Flex>
        <Flex
          my={3}
          width={1}
          alignItems={'center'}
          justifyContent={"center"}
        >
          <RoundButton
            px={2}
            py={1}
            buttonProps={{
              border:1,
              width:'auto',
              mainColor:'secondaryCtaBg',
              contrastColor:'secondaryCtaText'
            }}
            handleClick={e => this.props.isDashboard ? this.props.goToSection(governanceRoute, false) : this.props.goToSection(dashboardRoute, false) }
          >
            Switch to {this.props.isDashboard ? 'Governance' : 'Dashboard'}
          </RoundButton>
        </Flex>
        {
          this.props.isMobile && (
            <Flex
              width={'82%'}
              alignSelf={'center'}
              alignItems={'stretch'}
              flexDirection={'column'}
              justifyContent={'space-between'}
            >
              <NetworkIndicator
                {...this.props}
              />
            </Flex>
          )
        }
        <Flex
          px={3}
          height={'100%'}
          style={{
            overflowY:'scroll'
          }}
          flexDirection={"column"}
        >
          {
            visibleLinks.map((menuLink, menuIndex) => {
              const isExternalLink = menuLink.isExternalLink;
              const LinkComponent = isExternalLink ? ExtLink : RouterLink;
              const activeImage = isDarkTheme && menuLink.imageDark ? menuLink.imageDark : menuLink.image;
              const inactiveImage = isDarkTheme && menuLink.imageInactiveDark ? menuLink.imageInactiveDark : menuLink.imageInactive;
              return (
                <Box
                  width={"auto"}
                  my={[1, "8px"]}
                  key={`menu-${menuIndex}`}
                >
                  <LinkComponent
                    to={menuLink.route}
                    href={menuLink.route}
                    onClick={this.props.closeMenu}
                    style={{ textDecoration: "none" }}
                  >
                    <Flex
                      py={2}
                      px={3}
                      borderRadius={2}
                      alignItems={"center"}
                      flexDirection={"row"}
                      backgroundColor={"transparent"}
                    >
                      <Flex
                        py={1}
                        width={1}
                        alignItems={"center"}
                        flexDirection={"row"}
                        justifyContent={"flex-start"}
                      >
                        {
                          menuLink.image ? (
                            <Image
                              mr={3}
                              ml={2}
                              mb={0}
                              align={"center"}
                              height={["1.2em","1.6em"]}
                              src={menuLink.selected ? activeImage : inactiveImage}
                            />
                          ) : menuLink.icon && (
                            <Icon
                              name={menuLink.icon}
                              color={
                                menuLink.selected
                                  ? "menuIconActive"
                                  : isDarkTheme
                                    ? "white"
                                    : "dark-gray"
                              }
                              mr={3}
                              ml={2}
                              mb={0}
                              size={ this.props.isMobile ? "1.2em" : "1.6em"}
                            />
                          )
                        }
                        <Text
                          fontWeight={3}
                          fontSize={[1,2]}
                          style={{
                            whiteSpace: "nowrap"
                          }}
                          textAlign={"center"}
                          color={menuLink.selected ? "primary" : "text"}
                        >
                          {menuLink.label}
                        </Text>
                      </Flex>
                    </Flex>
                  </LinkComponent>
                </Box>
              );
            })
          }
        </Flex>

        {darkModeEnabled && (
          <Flex
            my={2}
            width={"auto"}
            height={"auto"}
            flexDirection={"column"}
            justifyContent={"flex-end"}
          >
            <Link
              style={{ textDecoration: "none" }}
              onClick={e =>
                this.props.setThemeMode(
                  this.props.themeMode === "light" ? "dark" : "light"
                )
              }
            >
              <Flex
                p={2}
                alignItems={"center"}
                flexDirection={"row"}
                justifyContent={"flex-end"}
              >
                <Icon
                  mr={2}
                  ml={2}
                  size={"1.4em"}
                  align={"center"}
                  color={"copyColor"}
                  name={"Brightness2"}
                />
                <Flex
                  px={"0.2em"}
                  width={"3.4em"}
                  height={"1.6em"}
                  alignItems={"center"}
                  borderRadius={"1.6em"}
                  backgroundColor={"cellText"}
                  justifyContent={this.props.themeMode === "light" ? "flex-end" : "flex-start"}
                >
                  <Box
                    width={"1.3em"}
                    height={"1.3em"}
                    borderRadius={"1.3em"}
                    backgroundColor={"copyColor"}
                  ></Box>
                </Flex>
                <Icon
                  ml={2}
                  size={"1.4em"}
                  align={"center"}
                  name={"WbSunny"}
                  color={"copyColor"}
                />
              </Flex>
            </Link>
          </Flex>
        )}
      </Flex>
    );
  }
}

export default DashboardMenu;
