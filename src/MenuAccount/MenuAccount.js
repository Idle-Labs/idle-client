import React, { Component } from "react";
import HoverImage from "../HoverImage/HoverImage"
import RoundButton from "../RoundButton/RoundButton";
import FunctionsUtil from "../utilities/FunctionsUtil";
import ShortHash from "../utilities/components/ShortHash";
import { Flex, Icon, Image, Text } from "rimble-ui";
import DashboardCard from "../DashboardCard/DashboardCard";
import Notifications from "../Notifications/Notifications";
import AccountModal from "../utilities/components/AccountModal";
import NetworkIndicator from "../NetworkIndicator/NetworkIndicator";

class MenuAccount extends Component {
  state = {
    isModalOpen: null,
    idleTokenBalance: null,
    logout: false
  };

  // Utils
  idleGovToken = null;
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

    this.idleGovToken = this.functionsUtil.getIdleGovToken();
  }

  async componentWillMount() {
    this.loadUtils();
    this.loadIdleTokenBalance();
  }
  editCardProp() { }

  async componentDidUpdate(prevProps, prevState) {
    this.loadUtils();

    const requiredNetworkChanged = JSON.stringify(prevProps.network.required) !== JSON.stringify(this.props.network.required);
    if (requiredNetworkChanged) {
      this.loadIdleTokenBalance();
    }

    const accountChanged = prevProps.account !== this.props.account;
    if (accountChanged) {
      this.setState(
        {
          isModalOpen: null
        },
        () => {
          this.loadIdleTokenBalance();
        }
      );
    }
  }

  async loadIdleTokenBalance() {

    if (!this.props.account) {
      return false;
    }

    const currentNetwork = this.functionsUtil.getRequiredNetwork();
    const idleGovTokenConfig = this.functionsUtil.getGlobalConfig(['govTokens', 'IDLE']);
    const idleGovTokenEnabled = idleGovTokenConfig.enabled && idleGovTokenConfig.availableNetworks.includes(currentNetwork.id);
    let idleTokenBalance = null;

    if (idleGovTokenEnabled) {
      idleTokenBalance = this.functionsUtil.BNify(0);
      const [
        balance,
        unclaimed
      ] = await Promise.all([
        this.idleGovToken.getBalance(this.props.account),
        this.idleGovToken.getUnclaimedTokens(this.props.account)
      ]);

      if (balance && unclaimed) {
        idleTokenBalance = this.functionsUtil.BNify(balance).plus(unclaimed);
      }
    }

    return this.setState({
      idleTokenBalance
    });
  }

  toggleModal = modalName => {
    this.setState(state => ({
      ...state,
      isModalOpen: state.isModalOpen === modalName ? null : modalName
    }));
  };

  render() {
    const walletProvider = this.functionsUtil.getStoredItem("walletProvider", false, null);
    const connectorInfo = walletProvider ? this.functionsUtil.getGlobalConfig(["connectors", walletProvider.toLowerCase()]) : null;
    const walletIcon = connectorInfo && connectorInfo.icon ? connectorInfo.icon : walletProvider ? `${walletProvider.toLowerCase()}.svg` : null;



    return this.props.account ? (
      <Flex
        bg={"cardBg"}
        width={1}
        mr={6}
        flexDirection={["column", "row"]}
        alignItems={["flex-start", "center"]}
      >
        <Flex
          mb={[2, 0]}
          flexDirection={"row"}
          alignItems={"center"}
          width={[1, "fit-content"]}
          justifyContent={"space-between"}
        >
          {this.props.isMobile && (
            <Flex ml={1} mr={2}>
              <Icon
                size={"2.4em"}
                color={"copyColor"}
                onClick={this.props.toggleMenu}
                name={this.props.menuOpened ? "Close" : "Menu"}
              />
            </Flex>
          )}
          {
            !this.props.isMobile && (
              <Flex
                mx={2}
                width={'fit-content'}
                alignItems={'center'}
                flexDirection={'row'}
                justifyContent={'space-between'}

              >
                <NetworkIndicator
                  {...this.props}
                />
              </Flex>
            )
          }

          {this.props.isMobile && (
            <Flex

              width={0.86}
              justifyContent={"flex-end"}
            >
              <DashboardCard
                {...this.props}
                cardProps={{
                  border: 0,
                  boxShadow: 0,
                  borderRadius: 0,
                  py: 1,
                  px: [1, 2],
                  mr: 1,
                  display: "flex",
                  width: [1, "auto"],
                  backgroundColor: "cardBg"
                }}
                isInteractive={true}
                handleClick={e => this.toggleModal("account")}
              >
                <Flex
                  p={0}
                  width={1}
                  alignItems={"center"}
                  flexDirection={"row"}
                  justifyContent={["center", "flex-start"]}

                >
                  {connectorInfo ? (
                    <Image
                      mr={[1, 2]}
                      width={"2em"}
                      height={"2em"}
                      display={"inline-flex"}
                      alt={walletProvider.toLowerCase()}
                      src={`images/connectors/${walletIcon}`}
                    />
                  ) : (
                      <Icon
                        mr={[1, 2]}
                        size={"2em"}
                        color={"copyColor"}
                        name={"AccountCircle"}
                      />
                    )}
                  {
                    this.props.isMobile ? (

                      <Text

                        fontSize={2}
                        fontWeight={3}
                        color={"copyColor"}

                        style={{
                          flex: '1',
                          overflow: 'hidden',
                          textOverflow: 'ellipsis'
                        }}
                      >
                        {this.props.account}
                      </Text>

                    ) : (
                        <Flex borderRight={`1px solid ${this.props.theme.colors.divider}`}>
                          <Flex mr={3}>
                            <ShortHash
                              fontSize={2}
                              fontWeight={3}
                              {...this.props}
                              color={"copyColor"}
                              hash={this.props.account}
                            />
                          </Flex>
                        </Flex>
                      )
                  }
                </Flex>
              </DashboardCard>

              <Notifications
                flexProps={{ p: 2 }}
                iconaProps={{ p: 1, size: "40px" }}
                {...this.props} />
            </Flex>
          )
          }
        </Flex>
        <Flex
          pr={2}
          ml={[0, 3]}
          style={{
            flex: "1 1 auto"
          }}
          width={[1, "auto"]}
          alignItems={"center"}
          flexDirection={"row"}
          justifyContent={
            "flex-end"
          }
        >
          {!this.props.isMobile && (<Flex
          >
            <DashboardCard
              {...this.props}
              cardProps={{
                border: 0,
                boxShadow: 0,
                borderRadius: 0,
                py: 1,
                px: [1, 2],
                mr: 1,
                display: "flex",
                width: [1, "auto"],
                backgroundColor: "cardBg"
              }}
              isInteractive={true}
              handleClick={e => this.toggleModal("account")}
            >
              <Flex
                p={0}
                width={1}
                alignItems={"center"}
                flexDirection={"row"}
                justifyContent={["center", "flex-start"]}

              >
                {connectorInfo ? (
                  <Image
                    mr={[1, 2]}
                    width={"2em"}
                    height={"2em"}
                    display={"inline-flex"}
                    alt={walletProvider.toLowerCase()}
                    src={`images/connectors/${walletIcon}`}
                  />
                ) : (
                    <Icon
                      mr={[1, 2]}
                      size={"2em"}
                      color={"copyColor"}
                      name={"AccountCircle"}
                    />
                  )}
                {
                  this.props.isMobile ? (

                    <Text
                      mr={2}
                      fontSize={2}
                      fontWeight={3}
                      color={"copyColor"}

                      style={{
                        flex: '1',
                        overflow: 'hidden',
                        textOverflow: 'ellipsis'
                      }}
                    >
                      {this.props.account}
                    </Text>

                  ) : (
                      <Flex borderRight={`1px solid ${this.props.theme.colors.divider}`}>
                        <Flex mr={3}>
                          <ShortHash
                            fontSize={2}
                            fontWeight={3}
                            {...this.props}
                            color={"copyColor"}
                            hash={this.props.account}
                          />
                        </Flex>
                      </Flex>
                    )
                }
              </Flex>
            </DashboardCard>
          </Flex>)}
          {!this.props.isMobile && (
            <DashboardCard
              {...this.props}
              cardProps={{
                border: 0,
                boxShadow: 0,
                borderRadius: 0,
                py: 1,
                px: [1, 2],
                mr: [2, 0],
                display: "flex",
                width: [1, "auto"],
                backgroundColor: "carddBg"
              }}
              isInteractive={true}
              handleClick={e => this.props.setGovModal(true)}
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
                  width={"1.7em"}
                  height={"1.7em"}
                  display={"inline-flex"}
                  src={`images/tokens/IDLE.svg`}
                />


                {this.state.idleTokenBalance && (
                  <Text color={"copyColor"} fontSize={[1, 2]} fontWeight={500}>
                    {this.state.idleTokenBalance.toFixed(2)} IDLE
                </Text>)
                }
              </Flex>
            </DashboardCard>
          )
          }

          <Flex

            alignItems={"center"}
            flexDirection={"row"}
            justifyContent={"flex-end"}
          >
            {/*governanceEnabled && this.props.isDashboard ? (
              <RoundButton
                buttonProps={{
                  mainColor: "redeem",
                  style: {
                    width: "auto",
                    height: this.props.isMobile ? "38px" : "45px"
                  },
                  size: this.props.isMobile ? "small" : "medium"
                }}
                handleClick={e => {
                  this.props.goToSection(governanceRoute, false);
                }}
              >
                <Flex alignItems={"center"} flexDirection={"row"}>
                  <Icon
                    mr={[1, 2]}
                    size={"1.6em"}
                    color={"white"}
                    name={"ExitToApp"}
                  />
                  <Text fontWeight={3} color={"white"} fontSize={[2, 3]}>
                    Governance
                  </Text>
                </Flex>
              </RoundButton>
            ) : (
                this.props.isGovernance && (
                  <RoundButton
                    buttonProps={{
                      mainColor: "redeem",
                      style: {
                        width: "auto",
                        height: this.props.isMobile ? "38px" : "45px"
                      },
                      size: this.props.isMobile ? "small" : "medium"
                    }}
                    handleClick={e => {
                      this.props.goToSection(dashboardRoute, false);
                    }}
                  >
                    <Flex alignItems={"center"} flexDirection={"row"}>
                      <Icon
                        mr={[1, 2]}
                        size={"1.6em"}
                        color={"white"}
                        name={"ExitToApp"}
                      />
                      <Text fontWeight={3} color={"white"} fontSize={[2, 3]}>
                        Dashboard
                    </Text>
                    </Flex>
                  </RoundButton>
                )
              )*/}
            {/*<RoundButton
              {...this.props}
              buttonProps={{
                px: 0,
                width: "45px",

                mainColor: "white",
                style: {
                  display: "flex",

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
                <Icon
                  mx={2}
                  size={"1em"}
                  color={"grey"}
                  align={"center"}
                  name={"ExitToApp"}
                />
              </Flex>
            </RoundButton>*/}
            {
              /*<ImageButton
                buttonProps={{
                  height: 2,
                  py: 0,
                  px: 0,
                  mx: 0,
                  my: 0,
                  border: 0,
                  boxShadow: 0
                }}

                width={1}
                imageSrc={'images/logout.svg'}
                isMobile={this.props.isMobile}
                // subcaption={'stake LP Tokens'}
                imageProps={{
                  height: "20px"
                }}
                isActive={false}
                handleClick={this.props.account ? e => this.logout() : this.props.connectAndValidateAccount}
              />*/}
            {

              !this.props.isMobile && (
                <DashboardCard
                  {...this.props}
                  cardProps={{
                    border: 0,
                    boxShadow: 0,
                    borderRadius: 0,
                    py: 0,
                    px: 0,
                    mr: 0,
                    display: "flex",
                    width: 1,
                    backgroundColor: "dashbboardBg"
                  }}
                  isInteractive={true}
                  isActive={true}
                  handleClick={this.props.account ? e => this.logout() : this.props.connectAndValidateAccount}
                >
                  <Flex
                    p={0}
                    width={1}
                    alignItems={"center"}
                    flexDirection={"row"}
                    justifyContent={"flex-start"}
                    onMouseEnter={e => this.setState({ isHover: true })}
                    onMouseLeave={e => this.setState({ isHover: false })}
                  >

                    <HoverImage
                      hoverOn={this.state.isHover}
                      hover={'images/logoutHover.svg'}
                      noHover={'images/logout.svg'}
                      imageProps={
                        {

                          mx: 2,
                          width: "24px",
                          height: "24px",
                          display: "inline-flex"

                        }
                      }
                    />
                  </Flex>
                </DashboardCard>
              )
            }

            {!this.props.isMobile && (
              <Notifications
                {...this.props}
                iconaProps={{
                  size: "1.8em"
                }
                }
                flexProps={{
                  ml: 2
                }}
              />
            )}
          </Flex>
        </Flex>
        <AccountModal
          {...this.props}
          isOpen={this.state.isModalOpen === "account"}
          closeModal={e => this.toggleModal("account")}
        />
      </Flex >
    ) : (
        <Flex width={1} px={2}>
          <Flex

            width={1}

            alignItems={"center"}
            justifyContent={["flex-start", "flex-end"]}
            style={{ justifyContent: "flex-start" }}
          >
            {this.props.isMobile && (
              <Flex mr={2}>
                <Icon
                  size={"2.4em"}
                  color={"copyColor"}
                  onClick={this.props.toggleMenu}
                  name={this.props.menuOpened ? "Close" : "Menu"}
                />
              </Flex>
            )}
            {
              !this.props.isMobile && (
                <Flex
                  width={1}
                  justifyContent={['space-between', 'flex-start']}
                >
                  <NetworkIndicator
                    innerProps={{
                      px: 1,
                      py: 0,
                      width: ['100%', 'auto'],
                      height: ['45px', '54px']
                    }}
                    {...this.props}
                  />
                </Flex>
              )
            }
          </Flex>
          <Flex
            width={1}
            alignItems={["center"]}
            flexDirection={"row"}
            justifyContent={"flex-end"}
            style={this.props.isMobile && ({ justifyContent: "flex-end" })}

          >
            {<RoundButton
              {...this.props}
              buttonProps={{
                boxShadow: "null",


                style: {
                  display: "flex",
                  justifyContent: "flex-start"
                }
              }}
              handleClick={this.props.account ? e => this.logout() : this.props.connectAndValidateAccount}
            >
              <Flex
                mr={2}
                width={1}
                alignItems={"center"}
                justifyContent={"flex-start"}
              >

                <Image

                  align={"center"}
                  height={["1.5em", "1em"]}
                  mr={[2, 3]}
                  ml={0}
                  pl={0}
                  src={"images/sidebar/plug_white.svg"}
                />


                <Text
                  pr={1}
                  mr={2}
                  fontWeight={3}
                  color={"white"}
                  fontSize={[2]}
                  alignContent={"center"}
                  justifyContent={"center"}
                >
                  Connect to Idle
                  </Text>

              </Flex>
            </RoundButton>}
            {
              <Notifications
                {...this.props}
                iconaProps={{
                  size: "2.2em"
                }
                }
                flexProps={{
                  ml: 2
                }}
              />
            }
          </Flex>

        </Flex >
      );
  }
}

export default MenuAccount;