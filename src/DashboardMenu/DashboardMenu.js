import ExtLink from "../ExtLink/ExtLink";
import React, { Component } from "react";
import RoundButton from "../RoundButton/RoundButton";
import { Link as RouterLink } from "react-router-dom";
import FunctionsUtil from "../utilities/FunctionsUtil";
import { Flex, Box, Icon, Text, Image, Link } from "rimble-ui";
import NetworkIndicator from "../NetworkIndicator/NetworkIndicator";
import DashboardCard from "../DashboardCard/DashboardCard";
class DashboardMenu extends Component {
  state = {
    logout: false,
    buyModalOpened: false
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
    const currentNetwork = this.functionsUtil.getRequiredNetwork();
    const governanceConfig = this.functionsUtil.getGlobalConfig(['governance']);

    const governanceRoute = governanceConfig.baseRoute;
    const governanceEnabled = governanceConfig.enabled && governanceConfig.availableNetworks.includes(currentNetwork.id);
    const dashboardRoute = this.functionsUtil.getGlobalConfig(['dashboard', 'baseRoute']) + '/' + Object.keys(this.props.availableStrategies)[0];

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

    return (
      <Flex p={0} height={"100%"} flexDirection={"column"}>
        <Flex
          p={3}
          mb={3}
          flexDirection={"row"}
          alignItems={"center"}
          justifyContent={"flex-start"}
        >
          <RouterLink
            to={"/"}
          >
            <Image
              height={"42px"}
              position={"relative"}
              src={this.functionsUtil.checkUrlOrigin() ? !isDarkTheme ? "images/logo-gradient.svg" : "images/logo-dark.svg" : !isDarkTheme ? "images/logo-gradient-beta.png" : "images/logo-white-beta.png"}
            />
          </RouterLink>
        </Flex>
        <Flex
          width={1}
          borderBottom={`1px solid ${this.props.theme.colors.divider}`}
          mb={3}
          pb={3}
        >
          {/*<RoundButton
            {...this.props}
            buttonProps={{
              mb: 3,
              style: {
                display: "flex",
                paddingLeft: 16,
                justifyContent: "flex-start"
              }
            }}
            handleClick={this.props.account ? e => this.logout() : this.props.connectAndValidateAccount}
          >
            <Flex
              width={1}
              alignItems={"center"}
              justifyContent={"flex-start"}
            >
              {this.props.account ? (
                <Icon
                  mx={2}
                  size={"1.4em"}
                  color={"white"}
                  align={"center"}
                  name={"ExitToApp"}
                />
              ) : (
                  <Image
                    mx={2}
                    align={"center"}
                    height={"1.6em"}
                    src={"images/sidebar/plug_white.svg"}
                  />
                )}
              <Text
                ml={1}
                fontWeight={3}
                color={"white"}
                fontSize={[1, 2]}
                alignContent={"center"}
                justifyContent={"center"}
              >
                {this.props.account ? "Logout" : "Connect"}
              </Text>
            </Flex>
          </RoundButton>*/}

          {governanceEnabled && this.props.isDashboard ? (
            <DashboardCard
              {...this.props}
              cardProps={{
                border: 1,
                boxShadow: 0,
                borderRadius: 0,
                py: 1,
                px: [1, 2],
                ml: [0, 3],
                mr: [2, 0],
                display: "flex",
                width: [1, "auto"],
                mb: [0, 3]
              }}
              isInteractive={true}
              handleClick={e => this.props.goToSection(governanceRoute, false)}
            >
              <Flex
                p={0}
                width={1}
                alignItems={"center"}
                flexDirection={"row"}
                justifyContent={["center", "flex-start"]}
              >
                <Image
                  mr={1}
                  width={"1.3em"}
                  height={"1.3em"}
                  display={"inline-flex"}
                  src={`images/tokens/IDLE.svg`}
                />



                <Text color={"black"} fontSize={[1, 2]} fontWeight={500}>
                  Switch to Governance
                </Text>

              </Flex>
            </DashboardCard>

          ) : (
              this.props.isGovernance && (
                <DashboardCard
                  {...this.props}
                  cardProps={{
                    border: 1,
                    boxShadow: 0,
                    borderRadius: 0,
                    py: 1,
                    px: [1, 2],
                    ml: [0, 3],
                    mr: [2, 0],
                    display: "flex",
                    width: [1, "auto"],
                    mb: [0, 3]
                  }}
                  isInteractive={true}
                  handleClick={e => this.props.goToSection(dashboardRoute, false)}
                >
                  <Flex
                    p={0}
                    width={1}
                    alignItems={"center"}
                    flexDirection={"row"}
                    justifyContent={["center", "flex-start"]}
                  >
                    <Image
                      mr={1}
                      width={"1.3em"}
                      height={"1.3em"}
                      display={"inline-flex"}
                      src={`images/tokens/IDLE.svg`}
                    />



                    <Text color={"black"} fontSize={[1, 2]} fontWeight={500}>
                      Switch to Dashboard
                </Text>

                  </Flex>
                </DashboardCard>
              )
            )}
        </Flex>
        {
          this.props.isMobile && (
            <Flex
              mb={3}
              width={'100%'}
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
        {visibleLinks.map((menuLink, menuIndex) => {
          const isExternalLink = menuLink.isExternalLink;
          const LinkComponent = isExternalLink ? ExtLink : RouterLink;
          const activeImage = isDarkTheme && menuLink.imageDark ? menuLink.imageDark : menuLink.image;
          const inactiveImage = isDarkTheme && menuLink.imageInactiveDark ? menuLink.imageInactiveDark : menuLink.imageInactive;
          return (
            <Box
              width={"auto"}
              my={[2, "8px"]}
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
                  flexDirection={"row"}
                  alignItems={"center"}
                  border={menuLink.selected ? 2 : null}
                  backgroundColor={
                    menuLink.selected ? "menuHover" : "transparent"
                  }
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
                          height={"1.6em"}
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
                          size={"1.6em"}
                        />
                      )
                    }
                    <Text
                      fontSize={2}
                      fontWeight={3}
                      color={"copyColor"}
                      textAlign={"center"}
                      style={{
                        whiteSpace: "nowrap"
                      }}
                    >
                      {menuLink.label}
                    </Text>
                  </Flex>
                </Flex>
              </LinkComponent>
            </Box>
          );
        })}
        {darkModeEnabled && (
          <Flex
            my={2}
            width={"auto"}
            height={"100%"}
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
                  justifyContent={
                    this.props.themeMode === "light" ? "flex-end" : "flex-start"
                  }
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
