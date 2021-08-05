import React, { Component } from 'react';
import styles from './MenuAccount.module.scss';
import RoundButton from '../RoundButton/RoundButton';
import FunctionsUtil from '../utilities/FunctionsUtil';
import ShortHash from "../utilities/components/ShortHash";
import { Flex, Icon, Image, Link, Text } from "rimble-ui";
import DashboardCard from '../DashboardCard/DashboardCard';
import Notifications from '../Notifications/Notifications';
import CardIconButton from '../CardIconButton/CardIconButton';
import AccountModal from "../utilities/components/AccountModal";

class MenuAccount extends Component {

  state = {
    isModalOpen:null,
    idleTokenBalance:null
  };

  // Utils
  idleGovToken = null;
  functionsUtil = null;

  loadUtils(){
    if (this.functionsUtil){
      this.functionsUtil.setProps(this.props);
    } else {
      this.functionsUtil = new FunctionsUtil(this.props);
    }

    this.idleGovToken = this.functionsUtil.getIdleGovToken();
  }

  async componentWillMount(){
    this.loadUtils();
    this.loadIdleTokenBalance();
  }

  async componentDidUpdate(prevProps,prevState){
    this.loadUtils();
    const accountChanged = prevProps.account !== this.props.account;
    if (accountChanged){
      this.setState({
        isModalOpen:null
      },() => {
        this.loadIdleTokenBalance();
      });
    }
  }

  async loadIdleTokenBalance(){
    const idleGovTokenEnabled = this.functionsUtil.getGlobalConfig(['govTokens','IDLE','enabled']);
    if (idleGovTokenEnabled){
      let idleTokenBalance = this.functionsUtil.BNify(0);
      const [
        balance,
        unclaimed
      ] = await Promise.all([
        this.idleGovToken.getBalance(this.props.account),
        this.idleGovToken.getUnclaimedTokens(this.props.account)
      ]);

      if (balance && unclaimed){
        idleTokenBalance = this.functionsUtil.BNify(balance).plus(unclaimed);
      }

      return this.setState({
        idleTokenBalance
      });
    }
    return null;
  }

  toggleModal = (modalName) => {
    this.setState(state => ({...state, isModalOpen: (state.isModalOpen===modalName ? null : modalName) }));
  }

  render() {
    const walletProvider = this.functionsUtil.getStoredItem('walletProvider',false,null);
    const connectorInfo = walletProvider ? this.functionsUtil.getGlobalConfig(['connectors',walletProvider.toLowerCase()]) : null;
    const walletIcon = connectorInfo && connectorInfo.icon ? connectorInfo.icon : walletProvider ? `${walletProvider.toLowerCase()}.svg` : null;

    const governanceRoute = this.functionsUtil.getGlobalConfig(['governance','baseRoute']);
    const governanceEnabled = this.functionsUtil.getGlobalConfig(['governance','enabled']);
    const dashboardRoute = this.functionsUtil.getGlobalConfig(['dashboard','baseRoute'])+'/'+Object.keys(this.props.availableStrategies)[0];

    return (
      this.props.account ? (
        <Flex
          width={1}
          flexDirection={['column','row']}
          alignItems={['flex-start','center']}
        >
          <Flex
            mb={[2,0]}
            flexDirection={'row'}
            alignItems={'center'}
            width={[1,'fit-content']}
            justifyContent={'space-between'}
          >
            {
              this.props.isMobile && (
                <Flex
                  mr={2}
                >
                  <Icon
                    size={'2.4em'}
                    color={'copyColor'}
                    onClick={this.props.toggleMenu}
                    name={ this.props.menuOpened ? 'Close' : 'Menu'}
                  />
                </Flex>
              )
            }
            <DashboardCard
              {...this.props}
              cardProps={{
                py:1,
                px:[1,2],
                mr:[2,0],
                display:'flex',
                width:[1,'auto']
              }}
              isInteractive={true}
              handleClick={e => this.toggleModal('account')}
            >
              <Flex
                p={0}
                width={1}
                alignItems={'center'}
                flexDirection={'row'}
                justifyContent={['center','flex-start']}
              >
                {
                  connectorInfo ? (
                    <Image
                      mr={[1,2]}
                      width={'2em'}
                      height={'2em'}
                      display={'inline-flex'}
                      alt={walletProvider.toLowerCase()}
                      src={`images/connectors/${walletIcon}`}
                    />
                  ) : (
                    <Icon
                      mr={[1,2]}
                      size={'2em'}
                      color={'copyColor'}
                      name={'AccountCircle'}
                    />
                  )
                }
                <ShortHash
                  fontSize={2}
                  fontWeight={3}
                  {...this.props}
                  color={'copyColor'}
                  hash={this.props.account}
                />
              </Flex>
            </DashboardCard>
            {
              this.props.isMobile &&
                <Notifications
                  {...this.props}
                />
            }
          </Flex>
          <Flex
            ml={[0,3]}
            style={{
              flex:'1 1 auto'
            }}
            width={[1,'auto']}
            alignItems={'center'}
            flexDirection={'row'}
            justifyContent={this.state.idleTokenBalance ? 'space-between' : 'flex-end'}
          >
            {
              this.state.idleTokenBalance && 
                <Link
                  style={{
                    textDecoration:'none'
                  }}
                  px={2}
                  className={styles.balanceButton}
                  onClick={ e => this.props.setGovModal(true) }
                >
                  <Flex
                    alignItems={'center'}
                    height={['38px','42px']}
                    justifyContent={'center'}
                  >
                    <Image
                      mr={1}
                      width={'1.7em'}
                      height={'1.7em'}
                      display={'inline-flex'}
                      src={`images/tokens/IDLE.png`}
                    />
                    <Text
                      color={'white'}
                      fontSize={[1,2]}
                      fontWeight={500}
                    >
                      {this.state.idleTokenBalance.toFixed(2)} IDLE
                    </Text>
                  </Flex>
                </Link>
            }
            <Flex
              width={'auto'}
              alignItems={'center'}
              flexDirection={'row'}
              justifyContent={'flex-end'}
            >
              {
                governanceEnabled && this.props.isDashboard ? (
                  <RoundButton
                    buttonProps={{
                      mainColor:'redeem',
                      style:{
                        width:'auto',
                        height:this.props.isMobile ? '38px' : '45px'
                      },
                      size:this.props.isMobile ? 'small' : 'medium'
                    }}
                    handleClick={ (e) => { this.props.goToSection(governanceRoute,false) } }
                  >
                    <Flex
                      alignItems={'center'}
                      flexDirection={'row'}
                    >
                      <Icon
                        mr={[1,2]}
                        size={'1.6em'}
                        color={'white'}
                        name={'ExitToApp'}
                      />
                      <Text
                        fontWeight={3}
                        color={'white'}
                        fontSize={[2,3]}
                      >
                        Governance
                      </Text>
                    </Flex>
                  </RoundButton>
                ) : this.props.isGovernance && (
                  <RoundButton
                    buttonProps={{
                      mainColor:'redeem',
                      style:{
                        width:'auto',
                        height:this.props.isMobile ? '38px' : '45px'
                      },
                      size:this.props.isMobile ? 'small' : 'medium'
                    }}
                    handleClick={ (e) => { this.props.goToSection(dashboardRoute,false) } }
                  >
                    <Flex
                      alignItems={'center'}
                      flexDirection={'row'}
                    >
                      <Icon
                        mr={[1,2]}
                        size={'1.6em'}
                        color={'white'}
                        name={'ExitToApp'}
                      />
                      <Text
                        fontWeight={3}
                        color={'white'}
                        fontSize={[2,3]}
                      >
                        Dashboard
                      </Text>
                    </Flex>
                  </RoundButton>
                )
              }
              {
                !this.props.isMobile &&
                  <Notifications
                    {...this.props}
                    flexProps={{
                      ml:2
                    }}
                  />
              }
            </Flex>
          </Flex>
          <AccountModal
            {...this.props}
            isOpen={this.state.isModalOpen==='account'}
            closeModal={e => this.toggleModal('account') }
          />
        </Flex>
      ) : (
        <Flex
          width={1}
          alignItems={'center'}
          justifyContent={'flex-start'}
        >
          {
            this.props.isMobile && (
              <Flex
                mr={2}
              >
                <Icon
                  size={'2.4em'}
                  color={'copyColor'}
                  onClick={this.props.toggleMenu}
                  name={ this.props.menuOpened ? 'Close' : 'Menu'}
                />
              </Flex>
            )
          }
          <CardIconButton
            icon={'Power'}
            {...this.props}
            text={'Connect'}
            handleClick={this.props.connectAndValidateAccount}
          />
        </Flex>
      )
    );
  }
}

export default MenuAccount;
