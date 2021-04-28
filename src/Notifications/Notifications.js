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
    if (tabOpenedChanged && this.state.tabOpened && this.state.notifications.length>0){

      // Send Google Analytics event
      this.functionsUtil.sendGoogleAnalyticsEvent({
        eventCategory: 'Notifications',
        eventAction: 'open_tab',
        eventLabel: ''
      });

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
      latestFeed,
      activeSnapshotProposals,
      governanceProposals,
      batchedDeposits,
    ] = await Promise.all([
      this.functionsUtil.getSubstackLatestFeed(),
      this.functionsUtil.getSnapshotProposals(true),
      this.governanceUtil.getProposals(null,'Active'),
      this.functionsUtil.getBatchedDeposits(this.props.account,'executed')
    ]);

    let notifications = this.functionsUtil.getGlobalConfig(['notifications']).filter( n => (n.enabled && n.start<=currTime && n.end>currTime) );

    // Show latest Substack for 1 week
    if (latestFeed){
      const latestFeedDate = this.functionsUtil.strToMoment(latestFeed.isoDate);
      if (latestFeedDate.isAfter(this.functionsUtil.strToMoment().subtract(7,'d'))){
        notifications.push(
          {
            link:latestFeed.link,
            image:'/images/substack.png',
            timestamp:latestFeedDate._d.getTime(),
            title:this.functionsUtil.htmlDecode(latestFeed.title),
            text:this.functionsUtil.htmlDecode(latestFeed.content),
            date:latestFeedDate.utc().format('MMM DD, YYYY HH:mm UTC'),
          }
        );
      }
    }

    const currTime = Date.now();

    // Add snapshot proposals
    const snapshotProposalBaseUrl = this.functionsUtil.getGlobalConfig(['network','providers','snapshot','urls','proposals']);

    if (activeSnapshotProposals){
      activeSnapshotProposals.forEach( p => {
          const text = this.functionsUtil.htmlDecode(p.msg.payload.body.replace(/^[#]*/,''));
          // const text = p.msg.payload.name.replace(/^[#]*/,'');
          notifications.push({
            text,
            image:'/images/snapshot.png',
            timestamp:p.msg.payload.start*1000,
            link:snapshotProposalBaseUrl+p.authorIpfsHash,
            title:this.functionsUtil.htmlDecode(p.msg.payload.name),
            date:this.functionsUtil.strToMoment(p.msg.payload.start*1000).utc().format('MMM DD, YYYY HH:mm UTC'),
          });
      });
    }

    // Add governance proposals
    if (governanceProposals){
      const governanceProposalUrl = this.functionsUtil.getGlobalConfig(['governance','baseRoute'])+'/proposals/';
      governanceProposals.forEach( p => {
        notifications.push(
          {
            text:p.title,
            iconProps:{
              color:'#00acff'
            },
            icon:'LightbulbOutline',
            timestamp:p.timestamp*1000,
            title:'Governance Proposal',
            hash:governanceProposalUrl+p.id,
            date:this.functionsUtil.strToMoment(p.timestamp*1000).utc().format('MMM DD, YYYY HH:mm UTC'),
          }
        );
      });
    }

    // Add Executed Batch Deposits
    if (batchedDeposits){
      const batchDepositConfig = this.functionsUtil.getGlobalConfig(['tools','batchDeposit']);
      const batchDepositBaseUrl = this.functionsUtil.getGlobalConfig(['dashboard','baseRoute'])+`/tools/${batchDepositConfig.route}/`;
      Object.keys(batchedDeposits).forEach( batchToken => {
        const batchInfo = batchedDeposits[batchToken];
        const timestamp = batchInfo.lastExecution.timeStamp*1000;
        const text = `You can claim ${batchInfo.batchRedeems.toFixed(4)} ${batchToken}`;
        notifications.push({
          text,
          timestamp,
          icon:'DoneAll',
          title:'Batch Deposit Executed',
          hash:batchDepositBaseUrl+batchToken,
          iconProps:{
            color:this.props.theme.colors.transactions.status.completed
          },
          date:this.functionsUtil.strToMoment(timestamp).utc().format('MMM DD, YYYY HH:mm UTC')
        });
      });
    }

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

  openNotification(notification){
    // Send Google Analytics event
    this.functionsUtil.sendGoogleAnalyticsEvent({
      eventCategory: 'Notifications',
      eventAction: 'open_notification',
      eventLabel: notification.link || notification.hash
    });

    if (notification.link){
      return this.functionsUtil.openWindow(notification.link);
    } else if (notification.hash) {
      return window.location.hash = notification.hash;
    }

    return false;
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
                minWidth:['91vw','22em'],
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
                      style={{
                        textDecoration:'none'
                      }}
                      key={`notification_${index}`}
                      onClick={ e => this.openNotification(n) }
                    >
                      <Flex
                        py={2}
                        px={1}
                        flexDirection={'row'}
                        className={[styles.notification,this.props.themeMode === 'dark' ? styles.dark : null]}
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
                            lineHeight={1.3}
                            color={'primary'}
                            style={{
                              overflow:'hidden',
                              whiteSpace:'nowrap',
                              textOverflow:'ellipsis'
                            }}
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
