import React, { Component } from "react";
import FlexLoader from "../FlexLoader/FlexLoader";
import { Flex, Card, Icon, Text } from "rimble-ui";
import GovernanceUtil from "../utilities/GovernanceUtil";
import DashboardMenu from "../DashboardMenu/DashboardMenu";

// Import page components
import Overview from "./Overview";
import Delegate from "./Delegate";
import Proposals from "./Proposals";
import Leaderboard from "./Leaderboard";
import RoundButton from "../RoundButton/RoundButton";
import Swipeable from '../utilities/components/Swipeable';
import DashboardCard from "../DashboardCard/DashboardCard";
import TooltipModal from "../utilities/components/TooltipModal";
import DashboardHeader from "../DashboardHeader/DashboardHeader";

class Dashboard extends Component {
  state = {
    menu:[],
    votes:null,
    balance:null,
    baseRoute:null,
    modalTitle:null,
    clickEvent:null,
    activeModal:null,
    menuOpened:false,
    blockNumber:null,
    currentRoute:null,
    votingPeriod:null,
    modalContent:null,
    pageComponent:null,
    timelockDelay:null,
    currentSection:null,
    selectedSection:null,
    currentDelegate:null,
    proposalThreshold:null,
    governanceEnabled:false,
    selectedSubsection:null,
    proposalMaxOperations:null
  };

  timeoutId = null;

  // Utils
  functionsUtil = null;
  governanceUtil = null;

  loadUtils() {
    if (this.governanceUtil) {
      this.governanceUtil.setProps(this.props);
    } else {
      this.governanceUtil = new GovernanceUtil(this.props);
    }

    window.governanceUtil = this.governanceUtil;
    window.functionsUtil = this.functionsUtil = this.governanceUtil.functionsUtil;
  }

  async loadMenu() {
    const menu = [];
    const baseRoute = this.functionsUtil.getGlobalConfig([
      "governance",
      "baseRoute"
    ]);
    const extraicons = this.functionsUtil.getGlobalConfig(["extraicons"]);

    // Add Proposals
    menu.push({
      submenu: [],
      selected: true,
      route: baseRoute,
      label: "Overview",
      color: "dark-gray",
      component: Overview,
      image: extraicons["overview"].icon,
      bgColor: this.props.theme.colors.primary,
      imageDark: extraicons["overview"].iconDark,
      imageInactive: extraicons["overview"].iconInactive,
      imageInactiveDark: extraicons["overview"].iconInactiveDark
    });

    // Add Proposals
    menu.push({
      submenu: [],
      selected: false,
      label: "Proposals",
      bgColor: "#00acff",
      color: "dark-gray",
      component: Proposals,
      route: `${baseRoute}/proposals`,
      image: extraicons["proposals"].icon,
      imageDark: extraicons["proposals"].iconDark,
      imageInactive: extraicons["proposals"].iconInactive,
      imageInactiveDark: extraicons["proposals"].iconInactiveDark
    });

    // Add Leaderboard
    menu.push({
      submenu: [],
      selected: false,
      bgColor: "#ff0000",
      color: "dark-gray",
      label: "Leaderboard",
      component: Leaderboard,

      route: `${baseRoute}/leaderboard`,
      image: extraicons["leaderboard"].icon,
      imageDark: extraicons["leaderboard"].iconDark,
      imageInactive: extraicons["leaderboard"].iconInactive,
      imageInactiveDark: extraicons["leaderboard"].iconInactiveDark
    });

    // Add tools
    menu.push({
      submenu: [],
      selected: false,
      label: "Delegate",
      color: "dark-gray",
      bgColor: "#ff0000",
      component: Delegate,

      route: `${baseRoute}/delegate`,
      image: extraicons["delegate"].icon,
      imageDark: extraicons["delegate"].iconDark,
      imageInactive: extraicons["delegate"].iconInactive,
      imageInactiveDark: extraicons["delegate"].iconInactiveDark
    });

    // Add Forum
    menu.push({
      submenu: [],

      mobile: false,
      label: "Forum",
      selected: false,
      component: null,
      color: "dark-gray",
      bgColor: "#ff0000",
      isExternalLink: true,
      route: this.functionsUtil.getGlobalConfig(["forumURL"]),
      image: extraicons["forum"].icon,
      imageDark: extraicons["forum"].iconDark,
      imageInactive: extraicons["forum"].iconInactive,
      imageInactiveDark: extraicons["forum"].iconInactiveDark
    });

    await this.setState({
      menu,
      baseRoute
    });
  }

  resetModal = () => {
    this.setState({
      activeModal: null
    });
  };

  openTooltipModal = (modalTitle, modalContent) => {
    this.functionsUtil.sendGoogleAnalyticsEvent({
      eventCategory: "UI",
      eventAction: modalTitle,
      eventLabel: "TooltipModal"
    });

    this.setState(
      {
        modalTitle,
        modalContent
      },
      () => {
        this.setActiveModal("tooltip");
      }
    );
  };

  setActiveModal = activeModal => {
    this.setState({
      activeModal
    });
  };

  async loadParams() {

    if (!this.props.networkInitialized){
      return;
    }

    const {
      match: { params }
    } = this.props;

    const baseRoute = this.state.baseRoute;
    const currentRoute = window.location.hash.substr(1);

    let pageComponent = null;
    let currentSection = null;

    const menu = this.state.menu;

    let selectedSection = null;
    let selectedSubsection = null;

    menu.forEach(m => {
      m.selected = false;
      const sectionRoute = baseRoute + "/" + params.section;
      if (
        currentRoute.toLowerCase() === m.route.toLowerCase() ||
        (!m.submenu.length &&
          m.route.toLowerCase() === sectionRoute.toLowerCase())
      ) {
        m.selected = true;
        if (pageComponent === null) {
          pageComponent = m.component;
        }
      } else if (m.submenu.length) {
        m.submenu.forEach(subm => {
          subm.selected = false;
          const submRoute = m.route + "/" + subm.route;
          if (submRoute.toLowerCase() === currentRoute.toLowerCase()) {
            m.selected = true;
            subm.selected = true;

            // Set component, if null use parent
            if (pageComponent === null) {
              if (subm.component) {
                pageComponent = subm.component;
              } else {
                pageComponent = m.component;
              }
            }
          }

          // Set selected subsection
          if (subm.selected) {
            selectedSubsection = subm;
          }
        });
      }

      // Set selected section
      if (m.selected) {
        selectedSection = m;
      }
    });

    // Exit if no strategy or token selected
    if (!pageComponent) {
      return this.goToSection("/", false);
    }

    // Send GA pageview
    this.functionsUtil.sendGoogleAnalyticsPageview(currentRoute);

    await this.setState({
      menu,
      params,
      baseRoute,
      currentRoute,
      pageComponent,
      currentSection,
      selectedSection,
      selectedSubsection
    });
  }

  componentWillUnmount() {
    if (this.timeoutId) {
      window.clearTimeout(this.timeoutId);
    }
  }

  async componentWillMount() {
    this.props.setCurrentSection("governance");
    this.loadUtils();
    this.loadMenu();
  }

  async componentDidMount() {
    this.timeoutId = window.setTimeout(() => {
      if (!this.props.accountInizialized || !this.props.networkInitialized || !this.props.contractsInitialized) {
        this.setState({
          showResetButton: true
        });
      }
    }, 60000);

    if (!this.props.web3){
      return this.props.initWeb3();
    } else if (!this.props.accountInizialized){
      return this.props.initAccount();
    } else if (!this.props.contractsInitialized){
      return this.props.initializeContracts();
    }

    this.loadUtils();
    this.checkEnabled();
  }

  checkEnabled(){
    if (!this.props.networkInitialized){
      return false;
    }

    const currentNetworkId = this.functionsUtil.getRequiredNetworkId();
    const governanceConfig = this.functionsUtil.getGlobalConfig(['governance']);
    const governanceEnabled = governanceConfig.enabled && governanceConfig.availableNetworks.includes(currentNetworkId);

    return this.setState({
      governanceEnabled
    },() => {
      this.loadParams();
      this.loadData();
    });
  }

  async componentDidUpdate(prevProps,prevState) {
    this.loadUtils();

    const prevParams = prevProps.match.params;
    const params = this.props.match.params;

    if (JSON.stringify(prevParams) !== JSON.stringify(params)) {
      await this.setState(
        {
          pageComponent: null
        },
        () => {
          this.loadParams();
        }
      );
    }

    const accountChanged = prevProps.account !== this.props.account;
    const requiredNetworkChanged = JSON.stringify(prevProps.network.required) !== JSON.stringify(this.props.network.required);
    const networkChanged = (!prevProps.networkInitialized && this.props.networkInitialized) || requiredNetworkChanged;
    const accountInizialized = this.props.accountInizialized && prevProps.accountInizialized !== this.props.accountInizialized;
    const contractsInitialized = this.props.contractsInitialized && prevProps.contractsInitialized !== this.props.contractsInitialized;

    // console.log('networkChanged',requiredNetworkChanged,networkChanged,this.props.networkInitialized)

    if (accountChanged || accountInizialized || contractsInitialized || networkChanged) {
      this.componentDidMount();
    }
  }

  goToSection(section, isGovernance = true) {
    // Remove dashboard route
    if (isGovernance) {
      section = section.replace(this.state.baseRoute + "/", "");
    }

    const newRoute = (isGovernance
      ? this.state.baseRoute + (section.length > 0 ? "/" + section : "")
      : section
    ).replace(/[/]+$/, "");
    window.location.hash = newRoute;

    // Send GA event
    this.functionsUtil.sendGoogleAnalyticsEvent({
      eventCategory: "UI",
      eventLabel: newRoute,
      eventAction: "goToSection"
    });

    window.scrollTo(0, 0);
  }

  async loadData() {
    if (!this.props.web3 || !this.props.contractsInitialized || !this.props.networkInitialized || !this.state.governanceEnabled) {
      return false;
    }

    const newState = {};
    const [
      blockNumber,
      votingPeriod,
      timelockDelay,
      { proposalThreshold, proposalMaxOperations }
    ] = await Promise.all([
      this.functionsUtil.getBlockNumber(),
      this.governanceUtil.getVotingPeriod(),
      this.governanceUtil.getTimelockDelay(),
      this.governanceUtil.getProposalParams()
    ]);

    newState.blockNumber = blockNumber;
    newState.votingPeriod = votingPeriod;
    newState.timelockDelay = timelockDelay;
    newState.proposalThreshold = proposalThreshold;
    newState.proposalMaxOperations = proposalMaxOperations;

    if (this.props.account) {
      const [
        votes,
        balance,
        currentDelegate
      ] = await Promise.all([
        this.governanceUtil.getCurrentVotes(this.props.account),
        this.governanceUtil.getTokensBalance(this.props.account),
        this.governanceUtil.getCurrentDelegate(this.props.account)
      ]);

      newState.votes = votes;
      newState.balance = balance;
      newState.currentDelegate = currentDelegate;
    }

    this.setState(newState);
  }

  logout = async () => {
    this.props.setConnector("Infura", "Infura");
    await this.props.initWeb3("Infura");
  };

  setMenu(menuOpened){
    this.setState({
      menuOpened
    });
  }

  toggleMenu(){
    const menuOpened = !this.state.menuOpened;
    this.setMenu(menuOpened);
  }

  swipeCallback(eventData){
    // console.log('swipeCallback',eventData);
    if (eventData.dir === 'Right'){
      this.setMenu(true);
    } else if (eventData.dir === 'Left'){
      this.setMenu(false);
    }
  }

  render() {
    const PageComponent = this.state.pageComponent ? this.state.pageComponent : null;
    const availableNetworks = this.functionsUtil.getGlobalConfig(['governance','availableNetworks']);

    // console.log('governanceEnabled',this.state.governanceEnabled,PageComponent);
    if (!this.props.availableStrategies){
      return (
        <Flex
          width={1}
          minHeight={'100vh'}
          alignItems={'center'}
          flexDirection={'column'}
          justifyContent={'center'}
          backgroundColor={'selectBg'}
        >
          <FlexLoader
            textProps={{
              textSize: 4,
              fontWeight: 2
            }}
            loaderProps={{
              mb: 3,
              size: '80px',
              color: 'primary'
            }}
            flexProps={{
              my: 3,
              flexDirection: 'column'
            }}
            text={''}
          />
        </Flex>
      );
    }

    return (
      <Swipeable
        callback={this.swipeCallback.bind(this)}
      >
        <Flex
          height={'100vh'}
          position={'fixed'}
          flexDirection={'row'}
          className={this.props.themeMode}
          backgroundColor={['dashboardBg','white']}
          width={this.props.isMobile && this.state.menuOpened ? '180vw' : '100vw'}
          /*onClick={ e => this.propagateClickEvent(e) }*/
        >
          {
            (!this.props.isMobile || this.state.menuOpened) && (
              <Flex
                bottom={0}
                zIndex={99999}
                width={['80vw',1/6]}
                position={'relative'}
                flexDirection={'column'}
              >
                <Card
                  p={3}
                  border={0}
                  width={'auto'}
                  height={'100vh'}
                  backgroundColor={'menuBg'}
                  borderColor={this.props.theme.colors.menuRightBorder}
                  borderRight={`1px solid ${this.props.theme.colors.menuRightBorder}`}
                  >
                  <DashboardMenu
                    {...this.props}
                    menu={this.state.menu}
                    closeMenu={e => this.setMenu(false)}
                  />
                </Card>
              </Flex>
            )
          }
          <Flex
            py={3}
            mb={0}
            px={[3,5]}
            style={{
              overflowY:'scroll',
              overflowX:'hidden'
            }}
            width={['100vw',5/6]}
            flexDirection={'column'}
            height={['100vh','auto']}
            backgroundColor={'dashboardBg'}
          >
            <DashboardHeader
              menuOpened={this.state.menuOpened}
              clickEvent={this.state.clickEvent}
              toggleMenu={this.toggleMenu.bind(this)}
              goToSection={this.goToSection.bind(this)}
              governanceEnabled={this.state.governanceEnabled}
              {...this.props}
            />
            {
              !this.props.accountInizialized || !this.props.contractsInitialized || !this.state.governanceEnabled || !PageComponent ? (
                <Flex
                  width={1}
                  minHeight={"55vh"}
                  alignItems={"center"}
                  flexDirection={"column"}
                  justifyContent={"center"}
                >
                  {
                    !this.props.network.isCorrectNetwork ? (
                      <DashboardCard
                        cardProps={{
                          p: 3,
                          mt: 3,
                          width: [1, 0.35]
                        }}
                      >
                        <Flex alignItems={"center"} flexDirection={"column"}>
                          <Icon size={"2.3em"} name={"Warning"} color={"cellText"} />
                          <Text
                            mt={2}
                            fontSize={2}
                            color={"cellText"}
                            textAlign={"center"}
                          >
                            The{" "}
                            <strong>
                              {this.functionsUtil.capitalize(
                                this.props.network.current.name
                              )}{" "}
                              Network
                          </strong>{" "}
                            is not supported, please switch to the correct network.
                        </Text>
                        </Flex>
                      </DashboardCard>
                    ) : !this.state.governanceEnabled ? (
                      <DashboardCard
                        cardProps={{
                          p: 3,
                          mt: 3,
                          width: [1, 0.35]
                        }}
                      >
                        <Flex alignItems={"center"} flexDirection={"column"}>
                          <Icon size={"2.3em"} name={"Warning"} color={"cellText"} />
                          <Text
                            mt={2}
                            fontSize={2}
                            color={"cellText"}
                            textAlign={"center"}
                          >
                            Governance is not enabled for <strong>{this.functionsUtil.capitalize(this.props.network.current.name)} Network</strong>, please switch to <strong>{this.functionsUtil.getGlobalConfig(['network','availableNetworks',availableNetworks[0],'name'])} Network</strong>.
                          </Text>
                          <RoundButton
                            buttonProps={{
                              mt:3,
                              width:[1,1/2]
                            }}
                            handleClick={e => this.props.setRequiredNetwork(availableNetworks[0])}
                          >
                            Switch Network
                          </RoundButton>
                        </Flex>
                      </DashboardCard>
                    ) : !this.state.showResetButton ? (
                      <FlexLoader
                        textProps={{
                          textSize: 4,
                          fontWeight: 2
                        }}
                        loaderProps={{
                          mb: 3,
                          size: "40px"
                        }}
                        flexProps={{
                          my: 3,
                          flexDirection: "column"
                        }}
                        text={!this.props.accountInizialized ? "Loading account..." : !this.props.contractsInitialized ? "Loading contracts..." : "Loading governance..."}
                      />
                    ) : (
                      <DashboardCard
                        cardProps={{
                          p: 3,
                          mt: 3,
                          width: [1, 0.35]
                        }}
                      >
                        <Flex alignItems={"center"} flexDirection={"column"}>
                          <Icon size={"2.3em"} name={"Warning"} color={"cellText"} />
                          <Text
                            mt={2}
                            fontSize={2}
                            color={"cellText"}
                            textAlign={"center"}
                          >
                            Idle can't connect to your wallet!<br />
                            Make sure that your wallet is unlocked and try again.
                          </Text>
                          <RoundButton
                            buttonProps={{
                              mt: 3,
                              width: [1, 1 / 2]
                            }}
                            handleClick={this.logout.bind(this)}
                          >
                            Logout
                          </RoundButton>
                        </Flex>
                      </DashboardCard>
                    )
                  }
                </Flex>
              ) : PageComponent && (
                <PageComponent
                  {...this.props}
                  votes={this.state.votes}
                  balance={this.state.balance}
                  urlParams={this.state.params}
                  blockNumber={this.state.blockNumber}
                  votingPeriod={this.state.votingPeriod}
                  loadUserData={this.loadData.bind(this)}
                  timelockDelay={this.state.timelockDelay}
                  goToSection={this.goToSection.bind(this)}
                  currentDelegate={this.state.currentDelegate}
                  selectedSection={this.state.selectedSection}
                  proposalThreshold={this.state.proposalThreshold}
                  selectedSubsection={this.state.selectedSubsection}
                  openTooltipModal={this.openTooltipModal.bind(this)}
                  proposalMaxOperations={this.state.proposalMaxOperations}
                />
              )
            }
          </Flex>
          <TooltipModal
            closeModal={this.resetModal}
            title={this.state.modalTitle}
            content={this.state.modalContent}
            isOpen={this.state.activeModal === 'tooltip'}
          >
          </TooltipModal>
        </Flex>
      </Swipeable>
    );
  }
}

export default Dashboard;