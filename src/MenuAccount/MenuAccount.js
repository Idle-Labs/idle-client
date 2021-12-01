import React, { Component } from "react";
import HoverImage from "../HoverImage/HoverImage"
import RoundButton from "../RoundButton/RoundButton";
import FunctionsUtil from "../utilities/FunctionsUtil";
import ShortHash from "../utilities/components/ShortHash";
import Notifications from "../Notifications/Notifications";
import AccountModal from "../utilities/components/AccountModal";
import { Flex, Icon, Image, Text, Link, Loader } from "rimble-ui";
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

  componentWillMount() {
    this.loadUtils();
  }

  async componentDidMount() {
    this.loadIdleTokenBalance();
  }

  async componentDidUpdate(prevProps, prevState) {
    this.loadUtils();

    const requiredNetworkChanged = JSON.stringify(prevProps.network.required) !== JSON.stringify(this.props.network.required);
    const accountInizialized = this.props.accountInizialized && prevProps.accountInizialized !== this.props.accountInizialized;
    const contractsInitialized = this.props.contractsInitialized && prevProps.contractsInitialized !== this.props.contractsInitialized;
    if (requiredNetworkChanged || accountInizialized || contractsInitialized) {
      this.loadIdleTokenBalance();
    }

    const accountChanged = prevProps.account !== this.props.account;
    if (accountChanged) {
      this.setState({
          isModalOpen: null
      },() => {
        this.loadIdleTokenBalance();
      });
    }
  }

  async loadIdleTokenBalance() {

    if (!this.props.account || !this.props.contractsInitialized) {
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
        width={1}
        mr={[0,5]}
        bg={"cardBg"}
        flexDirection={["column", "row"]}
        alignItems={["flex-start", "center"]}
      >
        <Flex
          px={[2,0]}
          flexDirection={"row"}
          alignItems={"center"}
          width={[1, "fit-content"]}
          justifyContent={"space-between"}
        >
          {
            this.props.isMobile && (
              <Flex
                ml={1}
                mr={2}
                width={'12%'}
              >
                <Icon
                  size={"2.4em"}
                  color={"copyColor"}
                  onClick={this.props.toggleMenu}
                  name={this.props.menuOpened ? "Close" : "Menu"}
                />
              </Flex>
            )
          }
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
          {
            this.props.isMobile && (
              <Flex
                width={'87%'}
                justifyContent={"space-between"}
              >
                <Link
                  style={{
                    width:'80%',
                    display:'flex',
                    overflow:'hidden',
                    textDecoration:'none'
                  }}
                  onClick={e => this.toggleModal("account")}
                >
                  <Flex
                    p={0}
                    width={'100%'}
                    alignItems={"center"}
                    flexDirection={"row"}
                    justifyContent={["center", "flex-start"]}
                  >
                  {
                    connectorInfo ? (
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
                    )
                  }
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
                      <Flex
                        pr={3}
                        borderRight={`1px solid ${this.props.theme.colors.divider}`}
                      >
                        <ShortHash
                          fontSize={2}
                          fontWeight={3}
                          {...this.props}
                          color={"copyColor"}
                          hash={this.props.account}
                        />
                      </Flex>
                    )
                  }
                  </Flex>
                </Link>
                <Notifications
                  flexProps={{ p: 2 }}
                  iconProps={{ p: 1, size: "2.5em" }}
                  {...this.props}
                />
              </Flex>
            )
          }
        </Flex>
        {
          !this.props.isMobile && (
            <Flex
              pr={[2,0]}
              style={{
                flex: "1 1 auto"
              }}
              width={[1, "auto"]}
              alignItems={"center"}
              flexDirection={"row"}
              justifyContent={"flex-end"}
            >
              <Link
                mr={3}
                style={{
                  textDecoration:'none'
                }}
                onClick={e => this.toggleModal("account")}
              >
                <Flex
                  p={0}
                  width={1}
                  alignItems={"center"}
                  flexDirection={"row"}
                  justifyContent={["center", "flex-start"]}
                >
                  {
                    connectorInfo ? (
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
                    )
                  }
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
                      <Flex
                        pr={3}
                        borderRight={`1px solid ${this.props.theme.colors.divider}`}
                      >
                        <ShortHash
                          fontSize={2}
                          fontWeight={3}
                          {...this.props}
                          color={"copyColor"}
                          hash={this.props.account}
                        />
                      </Flex>
                    )
                  }
                </Flex>
              </Link>
              <Link
                style={{
                  textDecoration:'none'
                }}
                onClick={e => this.props.setGovModal(true)}
              >
                <Flex
                  p={0}
                  width={1}
                  alignItems={"center"}
                  flexDirection={"row"}
                  justifyContent={["center", "flex-start"]}
                >
                  <Image
                    mr={2}
                    width={"1.7em"}
                    height={"1.7em"}
                    display={"inline-flex"}
                    src={`images/tokens/IDLE.svg`}
                  />
                  {
                    this.state.idleTokenBalance ? (
                      <Text
                        fontWeight={3}
                        fontSize={[1, 2]}
                        color={"copyColor"}
                      >
                        {this.state.idleTokenBalance.toFixed(2)} IDLE
                      </Text>
                    ) : <Loader size={'20px'} />
                  }
                </Flex>
              </Link>
              <Flex
                ml={3}
                alignItems={"center"}
                flexDirection={"row"}
                justifyContent={"flex-end"}
              >
                <Link
                  style={{
                    textDecoration:'none'
                  }}
                  onClick={this.props.account ? e => this.logout() : this.props.connectAndValidateAccount}
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
                      noHover={'images/logout.svg'}
                      hover={'images/logoutHover.svg'}
                      imageProps={{
                        mx: 2,
                        width: "24px",
                        height: "24px",
                        display: "inline-flex"
                      }}
                    />
                  </Flex>
                </Link>
                <Notifications
                  {...this.props}
                  iconProps={{
                    size: "2.1em"
                  }}
                  flexProps={{
                    ml: 2
                  }}
                />
              </Flex>
            </Flex>
          )
        }
        <AccountModal
          {...this.props}
          isOpen={this.state.isModalOpen === "account"}
          closeModal={e => this.toggleModal("account")}
        />
      </Flex>
    ) : (
      <Flex
        px={2}
        width={1}
        mr={[0,5]}
      >
        <Flex
          width={1}
          alignItems={"center"}
          style={{ justifyContent: "flex-start" }}
          justifyContent={["flex-start", "flex-end"]}
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
          flexDirection={"row"}
          alignItems={["center"]}
          justifyContent={"flex-end"}
        >
          <RoundButton
            {...this.props}
            buttonProps={{
              width:'auto',
              boxShadow: "none",
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
                ml={0}
                pl={0}
                mr={[2, 3]}
                align={"center"}
                height={"1.4em"}
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
          </RoundButton>
          <Notifications
            {...this.props}
            iconProps={{
              size: "2.2em"
            }}
            flexProps={{
              ml: 2
            }}
          />
        </Flex>
      </Flex >
    );
  }
}

export default MenuAccount;