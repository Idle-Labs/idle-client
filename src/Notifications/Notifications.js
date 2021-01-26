import ExtLink from '../ExtLink/ExtLink';
import React, { Component } from 'react';
import styles from './Notifications.module.scss';
import { Flex, Icon, Box, Text, Image } from "rimble-ui";
import GovernanceUtil from '../utilities/GovernanceUtil';
import DashboardCard from '../DashboardCard/DashboardCard';

class Notifications extends Component {

  state = {
    tabOpened:false,
    notifications:[],
    mouseOverBell:false,
    unreadNotifications:0,
    lastOpenTimestamp:null,
    mouseOverNotifications:false
  };

  // Utils
  functionsUtil = null;
  governanceUtil = null;

  loadUtils(){
    if (this.governanceUtil){
      this.governanceUtil.setProps(this.props);
    } else {
      this.governanceUtil = new GovernanceUtil(this.props);
    }
    this.functionsUtil = this.governanceUtil.functionsUtil;
  }

  async componentWillMount(){
    this.loadUtils();
    this.loadNotifications();
  }

  async componentDidUpdate(prevProps,prevState){
    this.loadUtils();

    const clickEventChanged = prevProps.clickEvent !== this.props.clickEvent;
    if (clickEventChanged && this.props.clickEvent && !this.state.mouseOverNotifications && !this.state.mouseOverBell && this.state.tabOpened){
      this.setState({
        tabOpened:false
      });
    }

    const tabOpenedChanged = prevState.tabOpened !== this.state.tabOpened;
    if (tabOpenedChanged && this.state.tabOpened){
      this.updateLastOpenTimestamp();
    }

    const notificationsChanged = JSON.stringify(prevState.notifications) !== JSON.stringify(this.state.notifications);
    const lastOpenTimestampChanged = prevState.lastOpenTimestamp !== this.state.lastOpenTimestamp;
    if (lastOpenTimestampChanged || notificationsChanged){
      const unreadNotifications = this.state.lastOpenTimestamp ? this.state.notifications.filter( n => n.timestamp>this.state.lastOpenTimestamp ).length  : this.state.notifications.length;
      this.setState({
        unreadNotifications
      });
    }
  }

  updateLastOpenTimestamp(){
    const lastOpenTimestamp = Date.now();
    
    // Set Notification params in localStorage
    const notificationsParams = this.functionsUtil.getStoredItem('notificationsParams',true,{});
    notificationsParams.lastOpenTimestamp = lastOpenTimestamp;
    this.functionsUtil.setLocalStorage('notificationsParams',notificationsParams,true);

    this.setState({
      lastOpenTimestamp
    });
  }

  async loadNotifications(){

    // Get stored lastOpenTimestamp for notifications
    const notificationsParams = this.functionsUtil.getStoredItem('notificationsParams',true,{});
    const lastOpenTimestamp = notificationsParams.lastOpenTimestamp || null;

    // Get active snapshot proposals
    const [
      activeSnapshotProposals,
      governanceProposals,
      batchedDeposits
    ] = await Promise.all([
      this.functionsUtil.getSnapshotProposals(false),
      this.governanceUtil.getProposals(null,'Active'),
      this.functionsUtil.getBatchedDeposits(this.props.account,'executed')
    ]);

    const currTime = Date.now();

    // Add snapshot proposals
    const snapshotProposalBaseUrl = this.functionsUtil.getGlobalConfig(['network','providers','snapshot','urls','proposals']);
    let notifications = this.functionsUtil.getGlobalConfig(['notifications']).filter( n => (n.enabled && n.start<=currTime && n.end>currTime) );

    activeSnapshotProposals.forEach( p => {
        notifications.push({
          text:p.msg.payload.body.replace(/^[#]*/,''),
          image:'/images/snapshot.png',
          title:'Snapshot Proposal',
          timestamp:p.msg.payload.start*1000,
          link:snapshotProposalBaseUrl+p.authorIpfsHash,
          date:this.functionsUtil.strToMoment(p.msg.payload.start*1000).utc().format('MMM DD, YYYY HH:mm UTC'),
        });
    });

    // Add governance proposals
    const governanceProposalUrl = this.functionsUtil.getGlobalConfig(['baseURL'])+'/#'+this.functionsUtil.getGlobalConfig(['governance','baseRoute'])+'/proposals/';
    governanceProposals.forEach( p => {
      notifications.push(
        {
          text:p.title,
          iconProps:{
            color:'#00acff'
          },
          icon:'LightbulbOutline',
          timestamp:p.timestamp*1000,
          link:governanceProposalUrl+p.id,
          title:'Governance Proposal',
          date:this.functionsUtil.strToMoment(p.timestamp*1000).utc().format('MMM DD, YYYY HH:mm UTC'),
        }
      );
    });

    // Add Executed Batch Deposits
    const batchDepositConfig = this.functionsUtil.getGlobalConfig(['tools','batchDeposit']);
    const batchDepositBaseUrl = this.functionsUtil.getGlobalConfig(['baseURL'])+'/#'+this.functionsUtil.getGlobalConfig(['dashboard','baseRoute'])+`/tools/${batchDepositConfig.route}/`;
    Object.keys(batchedDeposits).forEach( batchToken => {
      const batchInfo = batchedDeposits[batchToken];
      const timestamp = batchInfo.lastExecution.timeStamp*1000;
      const text = `You can claim ${batchInfo.batchRedeems.toFixed(4)} ${batchToken}`;
      notifications.push({
        text,
        timestamp,
        icon:'DoneAll',
        title:'Batch Deposit Executed',
        link:batchDepositBaseUrl+batchToken,
        iconProps:{
          color:this.props.theme.colors.transactions.status.completed
        },
        date:this.functionsUtil.strToMoment(timestamp).utc().format('MMM DD, YYYY HH:mm UTC')
      });
    });

    notifications = notifications.sort((a,b) => (a.timestamp < b.timestamp ? 1 : -1));

    this.setState({
      notifications,
      lastOpenTimestamp
    });
  }

  setMouseOverBell(mouseOverBell){
    this.setState({
      mouseOverBell
    });
  }

  setMouseOverNotifications(mouseOverNotifications){
    this.setState({
      mouseOverNotifications
    });
  }

  toggleTab(){
    this.setState((prevState) => ({
      tabOpened:!prevState.tabOpened
    }));
  }

  render() {
    const hasUnreadNotifications = this.state.unreadNotifications>0;
    const iconColor = hasUnreadNotifications ? '#ffdc00' : 'cellText';
    return (
      <Flex
        zIndex={999}
        position={'relative'}
        {...this.props.flexProps}
      >
        <Box
          width={1}
          position={'relative'}
          onMouseOut={(e) => this.setMouseOverBell(false)}
          onMouseOver={(e) => this.setMouseOverBell(true)}
        >
          <Icon
            size={'2.4em'}
            color={iconColor}
            name={'Notifications'}
            onClick={this.toggleTab.bind(this)}
            className={[styles.bell,(hasUnreadNotifications ? styles.ring : null),(this.state.tabOpened || this.state.notifications.length>0 ? styles.active : null)]}
          />
          {
            hasUnreadNotifications && 
              <Box
                className={styles.counter}
              >
                {this.state.notifications.length}
              </Box>
          }
        </Box>
        {
          this.state.tabOpened &&
            <DashboardCard
              cardProps={{
                style:{
                  right:0,
                  maxHeight:'21em',
                  overflow:'scroll',
                  position:'absolute',
                  top:this.props.isMobile ? '2.8em' : '3em',
                },
                minWidth:['91vw','20em'],
                onMouseOut:(e) => this.setMouseOverNotifications(false),
                onMouseOver:(e) => this.setMouseOverNotifications(true),
              }}
            >
              <Flex
                width={1}
                flexDirection={'column'}
              >
              {
                this.state.notifications.length>0 ?
                  this.state.notifications.map( (n,index) => (
                    <ExtLink
                      href={n.link}
                      style={{
                        textDecoration:'none'
                      }}
                      key={`notification_${index}`}
                      onClick={ n.hash ? e => window.location.hash = n.hash : null }
                    >
                      <Flex
                        py={2}
                        px={1}
                        flexDirection={'row'}
                        className={styles.notification}
                        borderBottom={index<this.state.notifications.length-1 ? `1px solid ${this.props.theme.colors.divider}` : null}
                      >
                        <Flex
                          minWidth={'2em'}
                          alignItems={'center'}
                          justifyContent={'center'}
                        >
                          {
                            n.icon ? (
                              <Icon
                                name={n.icon}
                                size={'1.6em'}
                                color={'copyColor'}
                                {...n.iconProps}
                              />
                            ) : n.image && (
                              <Image
                                src={n.image}
                                width={'1.6em'}
                                height={'1.6em'}
                              />
                            )
                          }
                        </Flex>
                        <Flex
                          ml={1}
                          overflow={'hidden'}
                          flexDirection={'column'}
                        >
                          <Text
                            fontSize={1}
                            color={'blue'}
                            lineHeight={1.3}
                          >
                            {n.title}
                          </Text>
                          <Text
                            fontSize={1}
                            lineHeight={1.3}
                            color={'copyColor'}
                            style={{
                              overflow:'hidden',
                              whiteSpace:'nowrap',
                              textOverflow:'ellipsis'
                            }}
                          >
                            {n.text}
                          </Text>
                          <Text
                            fontSize={0}
                            lineHeight={1.3}
                            color={'cellText'}
                          >
                            {n.date}
                          </Text>
                        </Flex>
                      </Flex>
                    </ExtLink>
                  ))
                : (
                  <Text
                    py={2}
                    textAlign={'center'}
                  >
                    There are no notifications.
                  </Text>
                )
              }
              </Flex>
            </DashboardCard>
        }
      </Flex>
    );
  }
}

export default Notifications;
