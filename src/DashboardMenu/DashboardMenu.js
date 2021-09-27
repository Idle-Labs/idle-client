import ExtLink from "../ExtLink/ExtLink";
import React, { Component } from "react";
import { Link as RouterLink } from "react-router-dom";
import CardIconButton from "../CardIconButton/CardIconButton";
import FunctionsUtil from "../utilities/FunctionsUtil";
import { Flex, Box, Icon, Text, Image, Link } from "rimble-ui";
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

    return await this.props.context.setConnector(connectorName);
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
          <RouterLink to="/">
            <Image
              height={"42px"}
              position={"relative"}
              src={
                this.functionsUtil.checkUrlOrigin()
                  ? !isDarkTheme
                    ? "images/logo-gradient.svg"
                    : "images/logo-dark.svg"
                  : !isDarkTheme
                  ? "images/logo-gradient-beta.png"
                  : "images/logo-white-beta.png"
              }
            />
          </RouterLink>
        </Flex>
        {!this.props.isMobile && (
          <Flex>
            {this.props.account ? (
              <CardIconButton
                textProps={{ color: !isDarkTheme ? "white" : "black", ml: 2 }}
                cardProps={{
                  mb: 2,
                  alignContent: "left",
                  justifyContent: "left",
                  backgroundColor: "deposit",
                  borderRadius: 4,
                  width: "100%"
                }}
                isSidebar="true"
                align={"left"}
                iconProps={{ height: "1.6em", width: "1.6em", mx: 2 }}
                icon={"ExitToApp"}
                iconColor={!isDarkTheme ? "white" : "black"}
                iconBgColor={"deposit"}
                {...this.props}
                text={"Logout"}
                handleClick={async () => {
                  await this.logout();
                }}
              />
            ) : (
              <CardIconButton
                textProps={{
                  alignContent: "center",
                  justifyContent: "center",

                  ml: 1,
                  color: !isDarkTheme ? "white" : "black"
                }}
                cardProps={{
                  mb: 2,
                  alignContent: "center",
                  justifyContent: "center",
                  backgroundColor: "deposit",
                  borderRadius: 4,
                  width: "100%"
                }}
                align={"left"}
                imageProps={{ height: "1.6em", width: "1.6em", mx: 2 }}
                image={
                  isDarkTheme
                    ? "images/sidebar/plug.svg"
                    : "images/sidebar/plug_white.svg"
                }
                {...this.props}
                text={"Connect"}
                handleClick={this.props.connectAndValidateAccount}
              />
            )}
          </Flex>
        )}
        {visibleLinks.map((menuLink, menuIndex) => {
          const isExternalLink = menuLink.isExternalLink;
          const LinkComponent = isExternalLink ? ExtLink : RouterLink;
          const activeImage =
            isDarkTheme && menuLink.imageDark
              ? menuLink.imageDark
              : menuLink.image;
          const inactiveImage =
            isDarkTheme && menuLink.imageInactiveDark
              ? menuLink.imageInactiveDark
              : menuLink.imageInactive;
          return (
            <Box width={"auto"} my={[2, "12px"]} key={`menu-${menuIndex}`}>
              <LinkComponent
                to={menuLink.route}
                href={menuLink.route}
                onClick={this.props.closeMenu}
                style={{ textDecoration: "none" }}
              >
                <Flex
                  py={3}
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
                    width={1}
                    alignItems={"center"}
                    flexDirection={"row"}
                    justifyContent={"flex-start"}
                  >
                    {menuLink.image && (
                      <Image
                        mr={3}
                        ml={2}
                        mb={0}
                        align={"center"}
                        height={"1.6em"}
                        src={menuLink.selected ? activeImage : inactiveImage}
                      />
                    )}

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
            {/*
                  <Link
                    style={{textDecoration:'none'}}
                    onClick={ e => this.props.setThemeMode(this.props.themeMode === 'light' ? 'dark' : 'light') }
                  >
                    <Flex
                      py={[2,3]}
                      px={[2,3]}
                      borderRadius={[0,2]}
                      flexDirection={'row'}
                      alignItems={'center'}
                      backgroundColor={'transparent'}
                    >
                      <Flex
                        width={1}
                        alignItems={'center'}
                        flexDirection={['column','row']}
                        justifyContent={['center','flex-start']}
                      >
                        {
                          this.props.themeMode === 'light' ? (
                            <Icon
                              mr={[0,3]}
                              ml={[0,2]}
                              mb={[1,0]}
                              size={'1.6em'}
                              align={'center'}
                              color={'copyColor'}
                              name={'Brightness2'}
                            />
                          ) : (
                            <Icon
                              mr={[0,3]}
                              ml={[0,2]}
                              mb={[1,0]}
                              size={'1.6em'}
                              name={'WbSunny'}
                              align={'center'}
                              color={'copyColor'}
                            />
                          )
                        }
                        <Text
                          fontWeight={3}
                          color={'copyColor'}
                          textAlign={'center'}
                          fontSize={['11px',2]}
                          style={{
                            whiteSpace:'nowrap'
                          }}
                        >
                          {this.props.themeMode === 'light' ? 'Dark Mode' : 'Back to Light'}
                        </Text>
                      </Flex>
                    </Flex>
                  </Link>
                */}
          </Flex>
        )}
        {/*
        !this.props.isMobile  &&
          <Box
            width={'auto'}
            borderTop={`1px solid ${theme.colors.divider}`}
          >
            <Flex
              p={[2,3]}
              style={{
                cursor:'pointer'
              }}
              borderRadius={[0,2]}
              flexDirection={'row'}
              alignItems={'center'}
              onClick={ e => this.setBuyModalOpened(true) }
            >
              <Flex
                width={1}
                alignItems={'center'}
                flexDirection={['column','row']}
                justifyContent={['center','flex-start']}
              >
                <Icon
                  mr={[0,3]}
                  ml={[0,2]}
                  mb={[1,0]}
                  size={'1.6em'}
                  align={'center'}
                  color={'copyColor'}
                  name={'AddCircleOutline'}
                />
                <Text
                  fontWeight={3}
                  fontSize={[0,2]}
                  color={'copyColor'}
                  textAlign={'center'}
                  style={{
                    whiteSpace:'nowrap'
                  }}
                >
                  Add Funds
                </Text>
              </Flex>
            </Flex>
          </Box>
        <BuyModal
          {...this.props}
          isOpen={this.state.buyModalOpened}
          closeModal={ e => this.setBuyModalOpened(false) }
        />
        */}
      </Flex>
    );
  }
}

export default DashboardMenu;
