import theme from '../theme';
import ExtLink from '../ExtLink/ExtLink';
import React, { Component } from 'react';
import MenuAccount from '../MenuAccount/MenuAccount';
import GovModal from "../utilities/components/GovModal";
import GovernanceUtil from '../utilities/GovernanceUtil';
import { Box, Flex, Text, Icon, Button } from "rimble-ui";
import DashboardCard from '../DashboardCard/DashboardCard';
import DelegateVesting from '../DelegateVesting/DelegateVesting';

class DashboardHeader extends Component {

  state = {
    unclaimed:null,
    vestingAmount:null,
    govModalOpened:false
  }

  // Utils
  idleGovToken = null;
  functionsUtil = null;
  governanceUtil = null;

  loadUtils(){
    if (this.governanceUtil){
      this.governanceUtil.setProps(this.props);
    } else {
      this.governanceUtil = new GovernanceUtil(this.props);
    }

    this.functionsUtil = this.governanceUtil.functionsUtil;
    this.idleGovToken = this.functionsUtil.getIdleGovToken();
  }

  async componentWillMount(){
    this.loadUtils();
    this.loadData();
  }

  async componentDidUpdate(prevProps,prevState){
    this.loadUtils();
  }

  async loadData(){
    const idleGovTokenEnabled = this.functionsUtil.getGlobalConfig(['govTokens','IDLE','enabled']);
    if (idleGovTokenEnabled && this.props.account){
      const unclaimed = await this.idleGovToken.getUnclaimedTokens(this.props.account);
      return this.setState({
        unclaimed
      });
    }
    return null;
  }

  setConnector = async (connectorName) => {
    // Send Google Analytics event
    this.functionsUtil.sendGoogleAnalyticsEvent({
      eventAction: 'logout',
      eventCategory: 'Connect'
    });

    if (typeof this.props.setConnector === 'function'){
      this.props.setConnector(connectorName);
    }

    return await this.props.context.setConnector(connectorName);
  }

  async exit(){
    this.props.goToSection('/',false);
  }

  setGovModal(govModalOpened){
    this.setState({
      govModalOpened
    });
  }

  render() {
    return (
      <Box
        mb={3}
      >
        <Flex
          pb={2}
          width={1}
          flexDirection={'row'}
          justifyContent={'space-between'}
          alignItems={['flex-end','center']}
          borderBottom={`1px solid ${theme.colors.divider}`}
        >
          <MenuAccount
            {...this.props}
            setGovModal={this.setGovModal.bind(this)}
          />
        </Flex>
        {
          this.state.unclaimed && this.state.unclaimed.gt(0) ? (
            <DashboardCard
              cardProps={{
                p:2,
                mt:3,
                width:1,
              }}
              isActive={true}
              isInteractive={false}
            >
              <Flex
                alignItems={'center'}
                justifyContent={'center'}
                flexDirection={['column','row']}
              >
                <Text
                  fontWeight={500}
                  color={'#3f4e9a'}
                  fontSize={'15px'}
                  textAlign={'center'}
                >
                  IDLE Governance Token is now available, 
                  <ExtLink
                    ml={1}
                    fontWeight={500}
                    color={'primary'}
                    fontSize={'15px'}
                    hoverColor={'primary'}
                    href={'https://idlefinance.medium.com/idle-governance-is-live-9b55e8f407d7'}
                  >
                    discover more
                  </ExtLink>! You have {this.state.unclaimed.toFixed(4)} IDLE tokens to claim.
                </Text>
                <Button
                  ml={[0,2]}
                  mt={[2,0]}
                  size={'small'}
                  onClick={ e => this.setGovModal(true) }
                >
                  CLAIM NOW
                </Button>
              </Flex>
            </DashboardCard>
          ) : this.props.isDashboard && (
            <DashboardCard
              cardProps={{
                p:2,
                mt:3,
                width:1,
              }}
              isActive={true}
              isInteractive={false}
            >
              <Flex
                alignItems={'center'}
                justifyContent={'center'}
                flexDirection={['column','row']}
              >
                <Icon
                  mr={1}
                  size={'1.2em'}
                  color={'flashColor'}
                  name={'LightbulbOutline'}
                />
                <Text
                  fontWeight={500}
                  fontSize={'15px'}
                  color={'flashColor'}
                  textAlign={'center'}
                >
                  Do you have any idea to improve the Idle Protocol? Let's discuss it in our
                </Text>
                <ExtLink
                  ml={1}
                  fontWeight={500}
                  color={'primary'}
                  fontSize={'15px'}
                  hoverColor={'primary'}
                  href={this.functionsUtil.getGlobalConfig(['forumURL'])}
                >
                  <Flex
                    alignItems={'center'}
                    flexDirection={'row'}
                    justifyContent={'center'}
                  >
                    Governance Forum
                    <Icon
                      ml={1}
                      size={'0.9em'}
                      color={'primary'}
                      name={'OpenInNew'}
                    />
                    .
                  </Flex>
                </ExtLink>
              </Flex>
            </DashboardCard>
          )
        }
        {
          this.props.isGovernance && 
            <DelegateVesting
              {...this.props}
            />
        }
        <GovModal
          {...this.props}
          isOpen={this.state.govModalOpened}
          claimCallback={this.loadData.bind(this)}
          closeModal={e => this.setGovModal(false) }
        />
      </Box>
    );
  }
}

export default DashboardHeader;
