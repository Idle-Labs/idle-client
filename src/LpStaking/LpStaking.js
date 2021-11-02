import ExtLink from '../ExtLink/ExtLink';
import React, { Component } from 'react';
import FlexLoader from '../FlexLoader/FlexLoader';
import { Flex, Box, Text, Icon } from "rimble-ui";
import ImageButton from '../ImageButton/ImageButton';
import FunctionsUtil from '../utilities/FunctionsUtil';
import DashboardCard from '../DashboardCard/DashboardCard';
import SendTxWithBalance from '../SendTxWithBalance/SendTxWithBalance';

class LpStaking extends Component {

  state = {
    stats:[],
    steps:null,
    infoBox:null,
    globalStats:[],
    inputValue:null,
    description:null,
    tokenConfig:null,
    balanceProp:null,
    statsLoaded:false,
    tokenBalance:null,
    contractInfo:null,
    programEnded:false,
    stakedBalance:null,
    selectedToken:null,
    rewardMultiplier:1,
    accountingData:null,
    programEndDate:null,
    selectedAction:null,
    selectedOption:null,
    successMessage:null,
    permitEnabled:false,
    poolTokenPrice:null,
    availableTokens:null,
    approveEnabled:false,
    rewardTokenPrice:null,
    contractApproved:false,
    tokenWrapperProps:null,
    distributionSpeed:null,
    approveDescription:null,
    balanceSelectorInfo:null,
    transactionSucceeded:false,
    showTokenWrapperEnabled:false
  };

  // Utils
  functionsUtil = null;

  loadUtils(){
    if (this.functionsUtil){
      this.functionsUtil.setProps(this.props);
    } else {
      this.functionsUtil = new FunctionsUtil(this.props);
    }
  }

  async componentWillMount(){
    this.loadUtils();
    this.setState({
      selectedAction:'Stake'
    },() => {
      this.updateData();
    });
  }

  async componentDidMount(){
  }

  async componentDidUpdate(prevProps,prevState){
    this.loadUtils();

    const selectedActionChanged = prevState.selectedAction !== this.state.selectedAction;
    const contractApprovedChanged = prevState.contractApproved !== this.state.contractApproved;
    const tokenConfigChanged = JSON.stringify(prevProps.tokenConfig) !== JSON.stringify(this.props.tokenConfig);
    const contractInfoChanged = JSON.stringify(prevProps.contractInfo) !== JSON.stringify(this.props.contractInfo);
    if (selectedActionChanged || contractApprovedChanged || tokenConfigChanged){
      this.setState({
        tokenWrapperProps:null,
        showTokenWrapperEnabled:false
      },() => {
        this.updateData(selectedActionChanged);
      });
    }

    if (contractInfoChanged){
      this.changeInputCallback();
    }
  }

  async changeInputCallback(inputValue=null){

    let infoBox = null;

    if (inputValue && this.functionsUtil.BNify(inputValue).gt(0)){
      inputValue = this.functionsUtil.BNify(inputValue);
      switch (this.state.selectedAction){
        case 'Stake':
          const userStakedBalance = this.functionsUtil.fixTokenDecimals(this.state.stakedBalance,this.props.tokenConfig.decimals).plus(inputValue);
          const totalStakedBalance = this.functionsUtil.fixTokenDecimals(this.state.totalStakingShares,this.props.contractInfo.decimals).plus(inputValue);
          const userTotalStakingShare = userStakedBalance.div(totalStakedBalance);
          const rewardsPerDay = this.state.distributionSpeed.times(86400).times(userTotalStakingShare);//.times(this.state.distributionSpeedMultiplier);

          const stakedBalanceUSD = userStakedBalance.times(this.state.poolTokenPrice);
          const rewardsPerYearUSD = rewardsPerDay.times(365).times(this.state.rewardTokenPrice);
          const apy = stakedBalanceUSD.gt(0) ? rewardsPerYearUSD.div(stakedBalanceUSD).times(100) : this.functionsUtil.BNify(0);

          // console.log(parseFloat(userStakedBalance),parseFloat(this.state.poolTokenPrice),parseFloat(stakedBalanceUSD),parseFloat(rewardsPerDay),parseFloat(this.state.rewardTokenPrice),parseFloat(rewardsPerYearUSD),parseFloat(apy));
          infoBox = {
            icon:'FileDownload',
            iconProps:{
              color:this.props.theme.colors.transactions.status.completed
            },
            text:`By staking <strong>${inputValue.toFixed(4)} ${this.props.tokenConfig.token}</strong> you will get <strong>${rewardsPerDay.toFixed(4)} ${this.props.contractInfo.rewardToken} / day</strong> with an average APY of <strong>${apy.toFixed(2)}%</strong><br /><small style="color:#ff9900">assuming you have achieved the maximum reward multiplier</small>`
          };
        break;
        case 'Withdraw':
          const normalizedInputValue = this.functionsUtil.normalizeTokenAmount(inputValue,this.props.tokenConfig.decimals);
          let unstakeRewards = await this.functionsUtil.genericContractCall(this.props.contractInfo.name,'unstakeQuery',[normalizedInputValue],{from:this.props.account});
          unstakeRewards = this.functionsUtil.formatMoney(this.functionsUtil.fixTokenDecimals(unstakeRewards,this.props.tokenConfig.decimals));
          infoBox = {
            icon:'FileUpload',
            iconProps:{
              color:this.props.theme.colors.transactions.status.completed
            },
            text:`By unstaking <strong>${inputValue.toFixed(4)} ${this.props.tokenConfig.token}</strong> you will get <strong>${unstakeRewards} ${this.props.contractInfo.rewardToken}</strong>`
          };
        break;
        default:
        break;
      }
    }

    this.setState({
      infoBox
    });
  }

  getTransactionParams(amount){
    let methodName = null;
    let methodParams = [];
    amount = this.functionsUtil.toBN(amount);
    switch (this.state.selectedAction){
      case 'Stake':
        methodName = 'wrapAndStake';
        methodParams = [amount];
      break;
      case 'Withdraw':
        methodName = 'unstakeAndUnwrap';
        methodParams = [amount];
      break;
      default:
      break;
    }
    return {
      methodName,
      methodParams
    };
  }

  getPermitTransactionParams(amount,signedParameters){
    let methodName = null;
    let methodParams = [];
    const { expiry, r, s, v } = signedParameters;
    amount = this.functionsUtil.toBN(amount);
    switch (this.state.selectedAction){
      case 'Stake':
        methodName = 'permitWrapAndStakeUnlimited';
        methodParams = [amount, expiry, v, r, s];
      break;
      case 'Withdraw':
        methodName = 'unstakeAndUnwrap';
        methodParams = [amount];
      break;
      default:
      break;
    }
    return {
      methodName,
      methodParams
    };
  }

  async loadStats(){
    const stats = [];

    const [
      totalLocked,
      totalUnlocked,
      totalStakingShares,
      unlockScheduleCount,
      accountingData,
      collectedRewards
    ] = await Promise.all([
      this.functionsUtil.genericContractCall(this.props.contractInfo.name,'totalLocked'),
      this.functionsUtil.genericContractCall(this.props.contractInfo.name,'totalUnlocked'),
      this.functionsUtil.genericContractCall(this.props.contractInfo.name,'totalStakingShares'),
      this.functionsUtil.genericContractCall(this.props.contractInfo.name,'unlockScheduleCount'),
      this.functionsUtil.genericContractCall(this.props.contractInfo.name,'updateAccounting',[],{from:this.props.account}),
      this.state.stakedBalance.gt(0) ? this.functionsUtil.genericContractCall(this.props.contractInfo.name,'unstakeQuery',[this.functionsUtil.integerValue(this.state.stakedBalance)],{from:this.props.account}) : this.functionsUtil.BNify(0)
    ]);

    const unlockSchedulesPromises = [];
    for (let i = 0; i < unlockScheduleCount ; i++){
      unlockSchedulesPromises.push(this.functionsUtil.genericContractCall(this.props.contractInfo.name,'unlockSchedules',[i]));
    }

    const unlockSchedules = await Promise.all(unlockSchedulesPromises);

    const totalRewards = this.functionsUtil.fixTokenDecimals(this.functionsUtil.BNify(totalLocked).plus(this.functionsUtil.BNify(totalUnlocked)),this.props.tokenConfig.decimals);
    stats.push({
      title:'Total Rewards',
      value:this.functionsUtil.formatMoney(parseFloat(totalRewards))+' '+this.props.contractInfo.rewardToken
    });

    const totalDeposits = this.functionsUtil.fixTokenDecimals(totalStakingShares,this.props.contractInfo.decimals);
    stats.push({
      title:'Total Deposits',
      value:this.functionsUtil.formatMoney(parseFloat(totalDeposits))+' '+this.props.tokenConfig.token
    });

    const lockedRewards = this.functionsUtil.fixTokenDecimals(totalLocked,this.props.tokenConfig.decimals);
    stats.push({
      title:'Locked Rewards',
      value:this.functionsUtil.formatMoney(parseFloat(lockedRewards))+' '+this.props.contractInfo.rewardToken
    });

    const unlockedRewards = this.functionsUtil.fixTokenDecimals(totalUnlocked,this.props.tokenConfig.decimals);
    stats.push({
      title:'Unlocked Rewards',
      value:this.functionsUtil.formatMoney(parseFloat(unlockedRewards))+' '+this.props.contractInfo.rewardToken
    });

    const programEndTime = unlockSchedules.length>0 ? unlockSchedules.reduce( (endTime,s) => {
      endTime = Math.max(s.endAtSec,endTime);
      return endTime;
    },0) : null;

    const programEndDate = programEndTime ? `${this.functionsUtil.strToMoment(programEndTime*1000).utc().format('DD MMM, YYYY @ HH:mm')} UTC` : 'None';
    stats.push({
      title:'Program End-Date',
      value:programEndDate
    });

    const programEnded = programEndTime*1000<=Date.now();

    const distributionSpeed = unlockSchedules.reduce( (distributionSpeed,s) => {
      if (this.functionsUtil.BNify(s.initialLockedShares).gt(0) && this.functionsUtil.BNify(s.durationSec).gt(0)){
        const tokensPerSecond = this.functionsUtil.fixTokenDecimals(s.initialLockedShares,this.props.contractInfo.decimals).div(s.durationSec);
        if (!tokensPerSecond.isNaN()){
          distributionSpeed = distributionSpeed.plus(tokensPerSecond);
        }
      }
      return distributionSpeed;
    },this.functionsUtil.BNify(0));

    stats.push({
      title:'Reward unlock rate',
      value:this.functionsUtil.formatMoney(distributionSpeed.times(86400))+' '+this.props.contractInfo.rewardToken+' / day'
    });

    const globalStats = [];

    const stakedBalance = this.functionsUtil.fixTokenDecimals(this.state.stakedBalance,this.props.tokenConfig.decimals);
    const stakingShare = stakedBalance.div(totalDeposits); // accountingData && accountingData[2] && this.functionsUtil.BNify(accountingData[3]).gt(0) ? this.functionsUtil.BNify(accountingData[2]).div(this.functionsUtil.BNify(accountingData[3])) : this.functionsUtil.BNify(0);

    const rewardMultiplier = accountingData && this.functionsUtil.BNify(accountingData[4]).gt(0) ? this.functionsUtil.BNify(Math.max(1,parseFloat(this.functionsUtil.BNify(collectedRewards).div(this.functionsUtil.BNify(accountingData[4])).times(this.props.contractInfo.maxMultiplier)))) : this.functionsUtil.BNify(1);

    const distributionSpeedMultiplier = this.functionsUtil.BNify(1).div(this.props.contractInfo.maxMultiplier).times(rewardMultiplier);
    const userDistributionSpeed = distributionSpeed.times(stakingShare).times(distributionSpeedMultiplier);
    const rewardsPerDay = userDistributionSpeed.times(86400);

    // console.log(parseFloat(this.functionsUtil.BNify(collectedRewards)),parseFloat(this.functionsUtil.BNify(accountingData[4])),this.props.contractInfo.maxMultiplier,parseFloat(this.functionsUtil.BNify(collectedRewards).div(this.functionsUtil.BNify(accountingData[4])).times(this.props.contractInfo.maxMultiplier)),parseFloat(rewardMultiplier));

    // globalStats.push({
    //   title:'Distribution rate',
    //   description:'Your daily rewards distribution based on your current multiplier',
    //   value:this.functionsUtil.formatMoney(rewardsPerDay)+' '+this.props.contractInfo.rewardToken+' / day',
    // });

    const stakedBalanceUSD = stakedBalance.times(this.state.poolTokenPrice);
    const rewardsPerYearUSD = rewardsPerDay.times(365).times(this.state.rewardTokenPrice);
    const apy = stakedBalanceUSD.gt(0) ? rewardsPerYearUSD.div(stakedBalanceUSD).times(100) : this.functionsUtil.BNify(0);

    // console.log(parseFloat(this.state.stakedBalance),parseFloat(this.state.poolTokenPrice),parseFloat(stakedBalanceUSD),parseFloat(rewardsPerDay),parseFloat(this.state.rewardTokenPrice),parseFloat(rewardsPerYearUSD),parseFloat(apy));

    globalStats.push({
      title:'APY',
      value:`${apy.toFixed(2)}%`,
      description:'Annualized rewards based on your current multiplier',
    });

    globalStats.push({
      title:'Share',
      value:`${stakingShare.times(100).toFixed(2)}%`,
      description:'Your share of the total deposits',
    });

    globalStats.push({
      title:'Multiplier',
      value:`${rewardMultiplier.toFixed(2)}x`,
      description:`Deposit liquidity tokens for ${this.props.contractInfo.maxBonusDays} days to achieve a ${this.props.contractInfo.maxMultiplier}x reward multiplier`
    });

    const currentRewards = this.functionsUtil.formatMoney(this.functionsUtil.fixTokenDecimals(collectedRewards,this.props.tokenConfig.decimals));
    globalStats.push({
      title:'Rewards',
      value:currentRewards+' '+this.props.contractInfo.rewardToken,
      description:'Your share of the total unlocked reward pool. Larger your deposit and for longer, higher your share'
    });

    // console.log('loadStats',stats,globalStats);

    const statsLoaded = true;

    this.setState({
      stats,
      statsLoaded,
      globalStats,
      stakingShare,
      programEnded,
      totalRewards,
      programEndDate,
      accountingData,
      rewardMultiplier,
      distributionSpeed,
      totalStakingShares,
      userDistributionSpeed,
      distributionSpeedMultiplier
    });
  }

  async contractApproved(contractApproved){
    this.setState({
      contractApproved
    });
  }

  setAction(selectedAction){
    this.setState({
      selectedAction
    });
  }

  async transactionSucceeded(tx,amount,params){
    // console.log('transactionSucceeded',tx);
    let infoBox = null;
    switch (this.state.selectedAction){
      case 'Stake':
        const stakedTokensLog = tx.txReceipt && tx.txReceipt.logs ? tx.txReceipt.logs.find( log => log.address.toLowerCase() === this.props.tokenConfig.address.toLowerCase() && log.topics.find( t => t.toLowerCase().includes(this.props.contractInfo.address.replace('0x','').toLowerCase()) ) && log.topics.find( t => t.toLowerCase().includes(this.props.account.replace('0x','').toLowerCase()) ) && log.data.toLowerCase()!=='0xffffffffffffffffffffffffffffffffffffffffffffffffffffffffffffffff'.toLowerCase() ) : null;
        const stakedTokens = stakedTokensLog ? this.functionsUtil.fixTokenDecimals(parseInt(stakedTokensLog.data,16),this.props.tokenConfig.decimals) : this.functionsUtil.BNify(0);
        infoBox = {
          icon:'DoneAll',
          iconProps:{
            color:this.props.theme.colors.transactions.status.completed
          },
          text:`You have successfully staked <strong>${stakedTokens.toFixed(4)} ${this.props.selectedToken}</strong>`
        }
      break;
      case 'Withdraw':
        const unstakedTokensLog = tx.txReceipt && tx.txReceipt.logs ? tx.txReceipt.logs.find( log => log.address.toLowerCase() === this.props.tokenConfig.address.toLowerCase() ) : null;
        const unstakedTokens = unstakedTokensLog ? this.functionsUtil.fixTokenDecimals(parseInt(unstakedTokensLog.data,16),this.props.tokenConfig.decimals) : this.functionsUtil.BNify(0);
        const rewardTokenConfig = this.functionsUtil.getGlobalConfig(['govTokens',this.props.contractInfo.rewardToken]);
        const receivedRewardsLog = tx.txReceipt && tx.txReceipt.logs ? tx.txReceipt.logs.find( log => (log.address.toLowerCase() === rewardTokenConfig.address.toLowerCase() && log.topics.find( t => t.toLowerCase().includes(this.props.account.replace('0x','').toLowerCase()) )) ) : null;
        const receivedRewards = receivedRewardsLog ? this.functionsUtil.fixTokenDecimals(parseInt(receivedRewardsLog.data,16),this.props.tokenConfig.decimals) : this.functionsUtil.BNify(0);
        infoBox = {
          icon:'DoneAll',
          iconProps:{
            color:this.props.theme.colors.transactions.status.completed
          },
          text:`You have successfully withdrawn <strong>${unstakedTokens.toFixed(4)} ${this.props.selectedToken}</strong> and received <strong>${receivedRewards.toFixed(4)} ${this.props.contractInfo.rewardToken}</strong>`
        }
      break;
      default:
      break;
    }

    const transactionSucceeded = true;

    this.setState({
      infoBox,
      transactionSucceeded
    },() => {
      this.updateData();
    });
  }

  async updateData(selectedActionChanged=false){
    const newState = {};

    const DAITokenConfig = this.functionsUtil.getGlobalConfig(['stats','tokens','DAI']);
    const rewardTokenConfig = this.functionsUtil.getGlobalConfig(['stats','tokens',this.props.contractInfo.rewardToken]);

    const [
      poolTokenPrice,
      rewardTokenPrice,
      tokenBalance,
      stakedBalance,
    ] = await Promise.all([
      this.functionsUtil.getSushiswapPoolTokenPrice(this.props.selectedToken),
      this.functionsUtil.getSushiswapConversionRate(DAITokenConfig,rewardTokenConfig),
      this.functionsUtil.getTokenBalance(this.props.selectedToken,this.props.account),
      this.functionsUtil.genericContractCall(this.props.contractInfo.name,'totalStakedFor',[this.props.account]),
    ]);

    newState.balanceProp = this.functionsUtil.BNify(0);
    newState.tokenBalance = !this.functionsUtil.BNify(tokenBalance).isNaN() ? this.functionsUtil.BNify(tokenBalance) : this.functionsUtil.BNify(0);
    newState.stakedBalance = !this.functionsUtil.BNify(stakedBalance).isNaN() ? this.functionsUtil.BNify(stakedBalance) : this.functionsUtil.BNify(0);
    newState.poolTokenPrice = !this.functionsUtil.BNify(poolTokenPrice).isNaN() ? this.functionsUtil.BNify(poolTokenPrice) : this.functionsUtil.BNify(0);
    newState.rewardTokenPrice = !this.functionsUtil.BNify(rewardTokenPrice).isNaN() ? this.functionsUtil.BNify(rewardTokenPrice) : this.functionsUtil.BNify(0);

    switch (this.state.selectedAction){
      case 'Stake':
        newState.permitEnabled = true;
        newState.approveEnabled = true;
        newState.balanceProp = newState.tokenBalance;
        newState.approveDescription = 'Approve the Staking contract to stake your LP tokens';
        newState.tokenWrapperProps = {
          startContract:{
            name:'ETH',
            token:'ETH',
            decimals:18,
            wrapMethod:'deposit',
          },
          destContract:{
            unwrapMethod:'withdraw',
            ...this.props.tokenConfig
          },
        };
      break;
      case 'Withdraw':
        newState.permitEnabled = false;
        newState.approveEnabled = false;
        newState.approveDescription = '';
        newState.balanceProp = this.functionsUtil.fixTokenDecimals(newState.stakedBalance,this.props.tokenConfig.decimals);
        newState.tokenWrapperProps = {
          startContract:{
            name:'ETH',
            token:'ETH',
            decimals:18,
            wrapMethod:'deposit',
          },
          destContract:{
            unwrapMethod:'withdraw',
            ...this.props.tokenConfig
          },
        };
      break;
      default:
      break;
    }

    if (newState.balanceProp.lte(0)){
      newState.showTokenWrapperEnabled = true;
    }

    if (selectedActionChanged){
      newState.infoBox = null;
      newState.transactionSucceeded = false;
    }

    // console.log('updateData',this.state.selectedAction,newState);

    this.setState(newState,() => {
      this.loadStats();
    });
  }

  render() {

    const StatsCard = props => {
      const cardProps = {
        p:3,
        mb:2,
        width:'49%',
        ...props.cardProps
      };
      return (
        <DashboardCard
          title={props.title}
          cardProps={cardProps}
          titleProps={{
            fontSize:1,
            fontWeight:3,
          }}
          titleParentProps={{
            mt:0,
            ml:0
          }}
          description={props.description}
        >
          <Text
            mt={1}
            fontSize={[2,3]}
            color={'statValue'}
            {...props.textProps}
          >
            {props.value}
          </Text>
        </DashboardCard>
      );
    };

    const isStake = this.state.selectedAction === 'Stake';
    const isUnstake = this.state.selectedAction === 'Withdraw';
    const isStats = this.state.selectedAction === 'Stats';
    const txAction = this.state.selectedAction;

    return (
      <Box
        width={1}
      >
      {
        this.props.tokenConfig && this.props.tokenConfig.poolLink && (
          <Box
            mt={2}
            width={1}
          >
            <Text
              mb={1}
            >
              Pool link:
            </Text>
            <ExtLink
              mt={1}
              color={'link'}
              hoverColor={'link'}
              href={this.props.tokenConfig.poolLink}
            >
              <Text
                color={'link'}
                style={{
                  maxWidth:'100%',
                  overflow:'hidden',
                  whiteSpace:'nowrap',
                  textOverflow:'ellipsis'
                }}
              >
                {this.props.tokenConfig.poolLink}
              </Text>
            </ExtLink>
          </Box>
        )
      }
      {
        this.state.stakedBalance && this.functionsUtil.BNify(this.state.stakedBalance).gt(0) && this.state.globalStats.length>0 && (
          <Box
            mt={2}
            width={1}
          >
            <Text
              mb={1}
            >
              Your Stats:
            </Text>
            <Flex
              mt={1}
              width={1}
              flexDirection={['column','row']}
              justifyContent={'space-between'}
            >
              {
                this.state.globalStats.map( (statInfo,index) =>
                  <StatsCard
                    key={`globalStats_${index}`}
                    cardProps={{
                      mb:[2,0],
                      mr:[0,index<this.state.globalStats.length-1 ? 1 : 0],
                      width:[1,'100%']
                    }}
                    textProps={{
                      fontSize:[1,2]
                    }}
                    {...statInfo}
                  />
                )
              }
            </Flex>
          </Box>
        )
      }
      {
        this.props.selectedToken && (
          <Box
            mt={2}
            width={1}
          >
            <Text mb={1}>
              Select Action:
            </Text>
            <Flex
              alignItems={'center'}
              flexDirection={['column','row']}
              justifyContent={'space-between'}
            >
              <ImageButton
                buttonProps={{
                  mx:0,
                  border:isStake ? 2 : 0
                }}
                width={[1,'32%']}
                caption={'Stake'}
                imageSrc={'images/mint.svg'}
                isMobile={this.props.isMobile}
                // subcaption={'stake LP Tokens'}
                imageProps={{
                  mb:[0,2],
                  height:this.props.isMobile ? '42px' : '52px'
                }}
                isActive={isStake}
                handleClick={ e => this.setAction('Stake') }
              />
              <ImageButton
                buttonProps={{
                  mx:0,
                  border:isUnstake ? 2 : 0
                }}
                width={[1,'32%']}
                caption={'Withdraw'}
                imageSrc={'images/upload.svg'}
                isMobile={this.props.isMobile}
                // subcaption={'withdraw LP tokens'}
                imageProps={{
                  mb:[0,2],
                  height:this.props.isMobile ? '42px' : '52px'
                }}
                isActive={isUnstake}
                handleClick={ e => this.setAction('Withdraw') }
              />
              <ImageButton
                buttonProps={{
                  mx:0,
                  border:isStats ? 2 : 0
                }}
                width={[1,'32%']}
                caption={'Stats'}
                imageSrc={'images/stats.svg'}
                // subcaption={'view some stats'}
                isMobile={this.props.isMobile}
                imageProps={{
                  mb:[0,2],
                  height:this.props.isMobile ? '42px' : '52px'
                }}
                isActive={isStats}
                handleClick={ e => this.setAction('Stats') }
              />
            </Flex>
            {
              (isStake || isUnstake) ?
                isStake && this.state.programEnded ? (
                  <DashboardCard
                    cardProps={{
                      p:3,
                      mt:1
                    }}
                  >
                    <Flex
                      alignItems={'center'}
                      flexDirection={'column'}
                    >
                      <Icon
                        name={'Warning'}
                        color={'cellText'}
                        size={this.props.isMobile ? '1.8em' : '2.3em'}
                      />
                      <Text
                        mt={1}
                        fontSize={2}
                        color={'cellText'}
                        textAlign={'center'}
                      >
                        The {this.props.selectedToken} staking program ended on {this.state.programEndDate}.
                      </Text>
                    </Flex>
                  </DashboardCard>
                ) : (this.props.tokenConfig && this.state.balanceProp && this.state.statsLoaded && this.props.contractInfo ? (
                  <Box
                    mt={1}
                    width={1}
                    mb={[4,3]}
                  >
                    <SendTxWithBalance
                      error={null}
                      {...this.props}
                      action={txAction}
                      steps={this.state.steps}
                      infoBox={this.state.infoBox}
                      tokenConfig={this.props.tokenConfig}
                      tokenBalance={this.state.balanceProp}
                      contractInfo={this.props.contractInfo}
                      permitEnabled={this.state.permitEnabled}
                      approveEnabled={this.state.approveEnabled}
                      callback={this.transactionSucceeded.bind(this)}
                      approveDescription={this.state.approveDescription}
                      contractApproved={this.contractApproved.bind(this)}
                      balanceSelectorInfo={this.state.balanceSelectorInfo}
                      changeInputCallback={this.changeInputCallback.bind(this)}
                      getTransactionParams={this.getTransactionParams.bind(this)}
                      getPermitTransactionParams={this.getPermitTransactionParams.bind(this)}
                    >
                      <DashboardCard
                        cardProps={{
                          p:3
                        }}
                      >
                        <Flex
                          alignItems={'center'}
                          flexDirection={'column'}
                        >
                          <Icon
                            name={'MoneyOff'}
                            color={'cellText'}
                            size={this.props.isMobile ? '1.8em' : '2.3em'}
                          />
                          <Text
                            mt={1}
                            fontSize={2}
                            color={'cellText'}
                            textAlign={'center'}
                          >
                            {
                              isStake ? (
                                `You don't have any ${this.props.selectedToken} in your wallet.`
                              ) : isUnstake && (
                                `You don't have any staked ${this.props.selectedToken} to withdraw.`
                              )
                            }
                          </Text>
                        </Flex>
                      </DashboardCard>
                    </SendTxWithBalance>
                  </Box>
                ) : (
                  <Flex
                    mt={3}
                    mb={3}
                    width={1}
                  >
                    <FlexLoader
                      flexProps={{
                        flexDirection:'row'
                      }}
                      loaderProps={{
                        size:'30px'
                      }}
                      textProps={{
                        ml:2
                      }}
                      text={'Loading info...'}
                    />
                  </Flex>
                )
              ) : isStats && (
                <Flex
                  mt={1}
                  mb={3}
                  width={1}
                  style={{
                    flexWrap:'wrap'
                  }}
                  justifyContent={'space-between'}
                >
                  {
                    (!this.state.stats || !this.state.stats.length) ? (
                      <Flex
                        mt={3}
                        mb={3}
                        width={1}
                      >
                        <FlexLoader
                          flexProps={{
                            flexDirection:'row'
                          }}
                          loaderProps={{
                            size:'30px'
                          }}
                          textProps={{
                            ml:2
                          }}
                          text={'Loading stats...'}
                        />
                      </Flex>
                    ) : this.state.stats.map( (statInfo,index) =>
                      <StatsCard
                        key={`stats_${index}`}
                        cardProps={{
                          width:[1,'49%']
                        }}
                        {...statInfo}
                      />
                    )
                  }
                </Flex>
              )
            }
          </Box>
        )
      }
      </Box>
    );
  }
}

export default LpStaking;