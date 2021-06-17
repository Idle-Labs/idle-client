import ExtLink from '../ExtLink/ExtLink';
import IconBox from '../IconBox/IconBox';
import React, { Component } from 'react';
import FlexLoader from '../FlexLoader/FlexLoader';
import ImageButton from '../ImageButton/ImageButton';
import FunctionsUtil from '../utilities/FunctionsUtil';
import DashboardCard from '../DashboardCard/DashboardCard';
import CardIconButton from '../CardIconButton/CardIconButton';
import { Flex, Box, Text, Icon, Input, Button } from "rimble-ui";
import SendTxWithBalance from '../SendTxWithBalance/SendTxWithBalance';
import ExecuteTransaction from '../ExecuteTransaction/ExecuteTransaction';

class IdleStaking extends Component {

  state = {
    stats:[],
    steps:null,
    infoBox:null,
    globalStats:[],
    lockPeriods:[
      {
        value:7,
        label:'1 week'
      },
      {
        value:30,
        label:'1 month'
      },
      {
        value:365,
        label:'1 year'
      },
      {
        value:1460,
        label:'4 years'
      },
    ],
    lockedEnd:null,
    inputValue:null,
    description:null,
    tokenConfig:null,
    balanceProp:null,
    lockExpired:false,
    statsLoaded:false,
    tokenBalance:null,
    contractInfo:null,
    stakedBalance:null,
    selectedToken:null,
    rewardMultiplier:1,
    accountingData:null,
    increaseAction:null,
    selectedAction:null,
    selectedOption:null,
    successMessage:null,
    permitEnabled:false,
    poolTokenPrice:null,
    lockPeriodInput:null,
    buttonDisabled:false,
    internalInfoBox:null,
    availableTokens:null,
    approveEnabled:false,
    rewardTokenPrice:null,
    contractApproved:false,
    tokenWrapperProps:null,
    distributionSpeed:null,
    selectedLockPeriod:null,
    approveDescription:null,
    balanceSelectorInfo:null,
    lockPeriodTimestamp:null,
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
      selectedAction:'Lock'
    },() => {
      this.updateData();
    });
  }

  async componentDidMount(){
    const feeDistributorConfig = this.props.tokenConfig.feeDistributor;
    await this.props.initContract(feeDistributorConfig.name,feeDistributorConfig.address,feeDistributorConfig.abi);
  }

  async componentDidUpdate(prevProps,prevState){
    this.loadUtils();

    const selectedActionChanged = prevState.selectedAction !== this.state.selectedAction;
    const contractApprovedChanged = prevState.contractApproved !== this.state.contractApproved;
    const tokenConfigChanged = JSON.stringify(prevProps.tokenConfig) !== JSON.stringify(this.props.tokenConfig);
    const contractInfoChanged = JSON.stringify(prevProps.contractInfo) !== JSON.stringify(this.props.contractInfo);
    if (selectedActionChanged || contractApprovedChanged || tokenConfigChanged){
      const increaseAction = selectedActionChanged ? null : this.state.increaseAction;
      this.setState({
        increaseAction,
        tokenWrapperProps:null,
        showTokenWrapperEnabled:false,
      },() => {
        this.updateData(selectedActionChanged);
      });
    }

    if (contractInfoChanged){
      this.changeInputCallback();
    }

    const lockPeriodChanged = prevState.lockPeriodTimestamp !== this.state.lockPeriodTimestamp;
    const increaseActionChanged = prevState.increaseAction !== this.state.increaseAction;
    if (lockPeriodChanged || increaseActionChanged || selectedActionChanged){
      if (increaseActionChanged){
        this.setState({
          internalInfoBox:null
        });
      }
      this.checkButtonDisabled();
    }
  }

  checkButtonDisabled(){
    let buttonDisabled = false;
    const minDate = this.state.lockedEnd ? this.functionsUtil.strToMoment(this.state.lockedEnd*1000).add(7,'day') : this.functionsUtil.strToMoment().add(7,'day');
    const mDate = this.functionsUtil.strToMoment(this.state.lockPeriodTimestamp*1000);
    const maxDate = this.functionsUtil.strToMoment(minDate).add(4,'year');
    switch (this.state.selectedAction){
      default:
      case 'Lock':
        buttonDisabled = mDate.isAfter(maxDate) || mDate.isSameOrBefore(minDate);
      break;
      case 'Increase Lock':
        if (this.state.increaseAction === 'time'){
          buttonDisabled = mDate.isAfter(maxDate) || mDate.isSameOrBefore(minDate);
        }
      break;
    }

    // console.log('checkButtonDisabled',this.state.selectedAction,this.state.increaseAction,buttonDisabled);

    this.setState({
      buttonDisabled
    });
  }

  async changeInputCallback(inputValue=null){

    /*
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
    */
  }

  getIncreaseTimeParams(){
    const _unlock_time = parseInt(this.state.lockPeriodTimestamp);
    // console.log('getIncreaseTimeParams',_unlock_time);
    return [_unlock_time];
  }

  getTransactionParams(amount){
    let methodName = null;
    let methodParams = [];
    const _value = this.functionsUtil.toBN(amount);
    const _unlock_time = parseInt(this.state.lockPeriodTimestamp);
    switch (this.state.selectedAction){
      case 'Lock':
        methodName = 'create_lock';
        methodParams = [_value,_unlock_time];
      break;
      case 'Increase Lock':
        methodName = 'increase_amount';
        methodParams = [_value];
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
    const globalStats = [];
    const statsLoaded = true;

    let [
      totalSupply,
      lockedInfo,
      claimable,
      totalRewards,
    ] = await Promise.all([
      this.functionsUtil.genericContractCall(this.props.contractInfo.name,'supply'),
      this.functionsUtil.genericContractCall(this.props.contractInfo.name,'locked',[this.props.account]),
      this.functionsUtil.genericContractCall(this.props.tokenConfig.feeDistributor.name,'claim',[this.props.account]),
      this.functionsUtil.getTokenBalance(this.props.contractInfo.rewardToken,this.props.tokenConfig.feeDistributor.address)
    ]);

    const totalDeposits = this.functionsUtil.fixTokenDecimals(totalSupply,this.props.tokenConfig.decimals);
    stats.push({
      title:'Total Deposits',
      value:this.functionsUtil.formatMoney(parseFloat(totalDeposits))+' '+this.props.selectedToken
    });

    stats.push({
      title:'Total Rewards',
      value:this.functionsUtil.formatMoney(parseFloat(totalRewards))+' '+this.props.selectedToken
    });

    const stakedBalance = lockedInfo && lockedInfo.amount ? this.functionsUtil.fixTokenDecimals(lockedInfo.amount,this.props.tokenConfig.decimals) : this.functionsUtil.BNify(0);
    const userDeposited = this.functionsUtil.formatMoney(stakedBalance);
    globalStats.push({
      title:'Deposited',
      description:'Your total deposited amount',
      value:userDeposited+' '+this.props.contractInfo.rewardToken,
    });


    const stakingShare = stakedBalance.div(totalDeposits);
    globalStats.push({
      title:'Share',
      value:`${stakingShare.times(100).toFixed(2)}%`,
      description:'Your share of the total deposits',
    });

    claimable = this.functionsUtil.BNify(claimable);
    const currentRewards = this.functionsUtil.formatMoney(this.functionsUtil.fixTokenDecimals(claimable,this.props.tokenConfig.decimals));
    globalStats.push({
      title:'Rewards',
      value:currentRewards+' '+this.props.contractInfo.rewardToken,
      description:'Your claimable rewards'
    });

    this.setState({
      stats,
      claimable,
      globalStats,
      statsLoaded,
      stakedBalance
    });
    /*
    const [
      totalLocked,
      totalUnlocked,
      totalStakingShares,
      unlockScheduleCount,
      accountingData,
      collectedRewards
    ] = await Promise.all([
      this.functionsUtil.genericContractCall(this.props.contractInfo.name,'supply'),
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
    },parseInt(Date.now()/1000)) : null;

    const programDuration = programEndTime ? `${this.functionsUtil.strToMoment(programEndTime*1000).utc().format('DD MMM, YYYY @ HH:mm')} UTC` : 'None';
    stats.push({
      title:'Program End-Date',
      value:programDuration
    });

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

    const currentRewards = this.functionsUtil.formatMoney(this.functionsUtil.fixTokenDecimals(collectedRewards,this.props.tokenConfig.decimals));
    globalStats.push({
      title:'Rewards',
      value:currentRewards+' '+this.props.contractInfo.rewardToken,
      description:'Your share of the total unlocked reward pool. Larger your deposit and for longer, higher your share'
    });

    console.log('loadStats',stats,globalStats);

    this.setState({
      stats,
      statsLoaded,
      globalStats,
      stakingShare,
      totalRewards,
      accountingData,
      rewardMultiplier,
      distributionSpeed,
      totalStakingShares,
      userDistributionSpeed,
      distributionSpeedMultiplier
    });
    */
  }

  async contractApprovedCallback(contractApproved){
    this.setState({
      contractApproved
    });
  }

  setAction(selectedAction){
    this.setState({
      selectedAction
    });
  }

  setIncreaseAction(increaseAction){
    this.setState({
      increaseAction
    });
  }

  changelockPeriodInput(e){
    const selectedLockPeriod = null;
    const lockPeriodInput = e.target.value;
    const currDate = this.functionsUtil.strToMoment();
    const mDate = this.functionsUtil.strToMoment(lockPeriodInput+' '+currDate.format('HH:mm:ss'),'YYYY-MM-DD HH:mm:ss').add(1,'second');
    const lockPeriodTimestamp = parseInt(mDate._d.getTime()/1000);
    // console.log('changelockPeriodInput',lockPeriodTimestamp);
    this.setState({
      lockPeriodInput,
      selectedLockPeriod,
      lockPeriodTimestamp
    });
  }

  selectLockPeriod(selectedLockPeriod){
    const minDate = this.state.lockedEnd ? this.functionsUtil.strToMoment(this.state.lockedEnd*1000) : this.functionsUtil.strToMoment();
    const mDate = minDate.add(selectedLockPeriod,'day').add(1,'second');
    const lockPeriodInput = mDate.format('YYYY-MM-DD');
    const lockPeriodTimestamp = parseInt(mDate._d.getTime()/1000);
    // console.log('selectLockPeriod',lockPeriodTimestamp);
    this.setState({
      lockPeriodInput,
      selectedLockPeriod,
      lockPeriodTimestamp
    });
  }

  async transactionSucceeded(tx,amount,params){
    // console.log('transactionSucceeded',tx);
    let infoBox = null;
    let internalInfoBox = null;
    switch (this.state.selectedAction){
      case 'Lock':
        const lockedTokensLog = tx.txReceipt && tx.txReceipt.logs ? tx.txReceipt.logs.find( log => log.address.toLowerCase() === this.props.tokenConfig.address.toLowerCase() && log.topics.find( t => t.toLowerCase().includes(this.props.contractInfo.address.replace('0x','').toLowerCase()) ) && log.topics.find( t => t.toLowerCase().includes(this.props.account.replace('0x','').toLowerCase()) ) && log.data.toLowerCase()!=='0xffffffffffffffffffffffffffffffffffffffffffffffffffffffffffffffff'.toLowerCase() ) : null;
        const lockedTokens = lockedTokensLog ? this.functionsUtil.fixTokenDecimals(parseInt(lockedTokensLog.data,16),this.props.tokenConfig.decimals) : this.functionsUtil.BNify(0);
        infoBox = {
          icon:'DoneAll',
          iconProps:{
            color:this.props.theme.colors.transactions.status.completed
          },
          text:`You have successfully locked <strong>${lockedTokens.toFixed(4)} ${this.props.selectedToken}</strong>`
        }
      break;
      case 'Increase Lock':
        switch (this.state.increaseAction){
          case 'time':
            internalInfoBox = {
              icon:'DoneAll',
              iconProps:{
                color:this.props.theme.colors.transactions.status.completed
              },
              text:`You have successfully increased the lock until <strong>${this.functionsUtil.strToMoment(this.state.lockPeriodTimestamp*1000).utc().format('YYYY/MM/DD HH:mm')} UTC</strong>`
            }
          break;
          case 'amount':
            const increaseAmountTokensLog = tx.txReceipt && tx.txReceipt.logs ? tx.txReceipt.logs.find( log => log.address.toLowerCase() === this.props.tokenConfig.address.toLowerCase() && log.topics.find( t => t.toLowerCase().includes(this.props.contractInfo.address.replace('0x','').toLowerCase()) ) && log.topics.find( t => t.toLowerCase().includes(this.props.account.replace('0x','').toLowerCase()) ) && log.data.toLowerCase()!=='0xffffffffffffffffffffffffffffffffffffffffffffffffffffffffffffffff'.toLowerCase() ) : null;
            const increaseTokens = increaseAmountTokensLog ? this.functionsUtil.fixTokenDecimals(parseInt(increaseAmountTokensLog.data,16),this.props.tokenConfig.decimals) : this.functionsUtil.BNify(0);
            infoBox = {
              icon:'DoneAll',
              iconProps:{
                color:this.props.theme.colors.transactions.status.completed
              },
              text:`You have successfully increased the lock by <strong>${increaseTokens.toFixed(4)} ${this.props.selectedToken}</strong>`
            }
          break;
          default:
          break;
        }
      break;
      case 'Withdraw':
        const unstakedTokensLog = tx.txReceipt && tx.txReceipt.logs ? tx.txReceipt.logs.find( log => log.address.toLowerCase() === this.props.tokenConfig.address.toLowerCase() ) : null;
        const unstakedTokens = unstakedTokensLog ? this.functionsUtil.fixTokenDecimals(parseInt(unstakedTokensLog.data,16),this.props.tokenConfig.decimals) : this.functionsUtil.BNify(0);
        internalInfoBox = {
          icon:'DoneAll',
          iconProps:{
            color:this.props.theme.colors.transactions.status.completed
          },
          text:`You have successfully withdrawn <strong>${unstakedTokens.toFixed(4)} ${this.props.selectedToken}</strong>`
        }
      break;
      case 'Claim':
        const rewardTokenConfig = this.functionsUtil.getGlobalConfig(['govTokens',this.props.contractInfo.rewardToken]);
        const receivedRewardsLog = tx.txReceipt && tx.txReceipt.logs ? tx.txReceipt.logs.find( log => (log.address.toLowerCase() === rewardTokenConfig.address.toLowerCase() && log.topics.find( t => t.toLowerCase().includes(this.props.account.replace('0x','').toLowerCase()) )) ) : null;
        const receivedRewards = receivedRewardsLog ? this.functionsUtil.fixTokenDecimals(parseInt(receivedRewardsLog.data,16),rewardTokenConfig.decimals) : this.functionsUtil.BNify(0);
        internalInfoBox = {
          icon:'DoneAll',
          iconProps:{
            color:this.props.theme.colors.transactions.status.completed
          },
          text:`You have successfully claimed <strong>${receivedRewards.toFixed(4)} ${this.props.contractInfo.rewardToken}</strong>`
        }
      break;
      default:
      break;
    }

    const transactionSucceeded = true;

    this.setState({
      infoBox,
      internalInfoBox,
      transactionSucceeded
    },() => {
      this.updateData();
    });
  }

  async updateData(selectedActionChanged=false){
    const newState = {};

    // const rewardTokenConfig = this.functionsUtil.getGlobalConfig(['stats','tokens',this.props.contractInfo.rewardToken]);

    const [
      tokenBalance,
      lockedEnd,
    ] = await Promise.all([
      this.functionsUtil.getTokenBalance(this.props.selectedToken,this.props.account),
      this.functionsUtil.genericContractCall(this.props.contractInfo.name,'locked__end',[this.props.account])
    ]);

    newState.lockedEnd = lockedEnd && parseInt(lockedEnd)>0 ? parseInt(lockedEnd) : null;
    newState.lockExpired = newState.lockedEnd && newState.lockedEnd<=parseInt(Date.now()/1000);
    newState.tokenBalance = !this.functionsUtil.BNify(tokenBalance).isNaN() ? this.functionsUtil.BNify(tokenBalance) : this.functionsUtil.BNify(0);

    let selectedAction = this.state.selectedAction;

    if (selectedAction==='Withdraw' && !newState.lockExpired){
      selectedAction = 'Lock';
      newState.selectedAction = selectedAction;
    }

    // Select Increase if already created a lock
    if (newState.lockedEnd && selectedAction==='Lock'){
      selectedAction = 'Increase Lock';
      newState.increaseAction = 'time';
      newState.selectedAction = selectedAction;
    } else if (selectedAction==='Increase Lock' && !newState.increaseAction && !this.state.increaseAction){
      newState.increaseAction = 'time';
    }

    // Select Withdraw if the lock has expired
    if (selectedAction==='Increase Lock' && newState.lockExpired){
      selectedAction = 'Withdraw';
      newState.selectedAction = selectedAction;
    }

    switch (selectedAction){
      case 'Lock':
        newState.permitEnabled = false;
        newState.approveEnabled = true;
        newState.balanceProp = newState.tokenBalance;
        newState.approveDescription = 'Approve the Staking contract to stake your LP tokens';
      break;
      case 'Increase Lock':
        newState.permitEnabled = false;
        newState.approveEnabled = false;
        newState.approveDescription = '';
        newState.balanceProp = newState.tokenBalance;
        newState.lockPeriodInput = this.functionsUtil.strToMoment(newState.lockedEnd*1000).format('YYYY-MM-DD');
      break;
      case 'Withdraw':
        newState.permitEnabled = false;
        newState.approveEnabled = false;
        newState.approveDescription = '';
        newState.balanceProp = this.functionsUtil.fixTokenDecimals(newState.stakedBalance,this.props.tokenConfig.decimals);
      break;
      default:
      break;
    }

    if (selectedActionChanged){
      newState.infoBox = null;
      newState.internalInfoBox = null;
      newState.transactionSucceeded = false;
    }

    // console.log('updateData',selectedAction,newState);

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

    const isLock = this.state.selectedAction === 'Lock';
    const isStats = this.state.selectedAction === 'Stats';
    const isClaim = this.state.selectedAction === 'Claim';
    const isUnstake = this.state.selectedAction === 'Withdraw';
    const isIncrease = this.state.selectedAction === 'Increase Lock';
    const txAction = this.state.selectedAction;
    const canIncrease = !this.state.lockExpired;

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
              {
                this.state.lockedEnd === null ? (
                  <ImageButton
                    buttonProps={{
                      mx:0,
                      border:isLock ? 2 : 0
                    }}
                    caption={'Lock'}
                    width={[1,'32%']}
                    imageSrc={'images/lock.svg'}
                    isMobile={this.props.isMobile}
                    // subcaption={'stake LP Tokens'}
                    imageProps={{
                      mb:[0,2],
                      height:this.props.isMobile ? '42px' : '52px'
                    }}
                    isActive={isLock}
                    handleClick={ e => this.setAction('Lock') }
                  />
                ) : !this.state.lockExpired ? (
                  <ImageButton
                    buttonProps={{
                      mx:0,
                      border:isIncrease ? 2 : 0
                    }}
                    width={[1,'32%']}
                    isActive={isIncrease}
                    caption={'Increase Lock'}
                    imageSrc={'images/lock.svg'}
                    isMobile={this.props.isMobile}
                    imageProps={{
                      mb:[0,2],
                      height:this.props.isMobile ? '42px' : '54px'
                    }}
                    handleClick={ e => this.setAction('Increase Lock') }
                  />
                ) : (
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
                )
              }
              <ImageButton
                buttonProps={{
                  mx:0,
                  border:isClaim ? 2 : 0
                }}
                width={[1,'32%']}
                caption={'Claim'}
                imageSrc={'images/reward.png'}
                isMobile={this.props.isMobile}
                // subcaption={'withdraw LP tokens'}
                imageProps={{
                  mb:[0,2],
                  height:this.props.isMobile ? '42px' : '52px'
                }}
                isActive={isClaim}
                handleClick={ e => this.setAction('Claim') }
              />
              <ImageButton
                buttonProps={{
                  mx:0,
                  border:isStats ? 2 : 0
                }}
                width={[1,'32%']}
                caption={'Stats'}
                imageSrc={'images/stats.svg'}
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
              this.state.internalInfoBox && (
                <IconBox
                  cardProps={{
                    mt:1,
                    mb:3
                  }}
                  {...this.state.internalInfoBox}
                />
              )
            }
            {
              isStats ? (
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
              ) : (this.props.tokenConfig && this.state.balanceProp && this.state.statsLoaded && this.props.contractInfo) ? (
                  <Box
                    mt={1}
                    width={1}
                    mb={[4,3]}
                  >
                    {
                      (isIncrease && canIncrease) && (
                        <Box
                          mb={2}
                          width={1}
                        >
                          <Text mb={1}>
                            Choose increase value:
                          </Text>
                          <Flex
                            alignItems={'center'}
                            flexDirection={'row'}
                            justifyContent={'space-between'}
                          >
                            <CardIconButton
                              {...this.props}
                              textProps={{
                                fontSize:[1,2]
                              }}
                              cardProps={{
                                px:3,
                                py:2,
                                width:0.49
                              }}
                              icon={'AccessTime'}
                              iconColor={'deposit'}
                              text={'Increase Time'}
                              iconBgColor={'#ced6ff'}
                              isActive={ this.state.increaseAction === 'time' }
                              handleClick={ e => this.setIncreaseAction('time') }
                            />
                            <CardIconButton
                              {...this.props}
                              textProps={{
                                fontSize:[1,2]
                              }}
                              cardProps={{
                                px:3,
                                py:2,
                                width:0.49
                              }}
                              icon={'AttachMoney'}
                              iconColor={'redeem'}
                              iconBgColor={'#ceeff6'}
                              text={'Increase Amount'}
                              isActive={ this.state.increaseAction === 'amount' }
                              handleClick={ e => this.setIncreaseAction('amount') }
                            />
                          </Flex>
                        </Box>
                      )
                    }
                    {
                      ((isLock && this.state.balanceProp && this.state.contractApproved && this.state.balanceProp.gt(0)) || (isIncrease && canIncrease)) && (
                        <Box
                          width={1}
                        > 
                          {
                            (isLock || this.state.increaseAction === 'time') && (
                              <Box
                                width={1}
                              >
                                <Text mb={1}>
                                  Choose lock period:
                                </Text>
                                <Flex
                                  width={1}
                                  alignItems={'center'}
                                  justifyContent={'center'}
                                  flexDirection={'column'}
                                >
                                  <Input
                                    mb={2}
                                    width={1}
                                    type={"date"}
                                    required={true}
                                    height={'3.4em'}
                                    borderRadius={2}
                                    fontWeight={500}
                                    borderColor={'cardBorder'}
                                    backgroundColor={'cardBg'}
                                    boxShadow={'none !important'}
                                    value={this.state.lockPeriodInput || ''}
                                    onChange={this.changelockPeriodInput.bind(this)}
                                    border={`1px solid ${this.props.theme.colors.divider}`}
                                  />
                                  <Flex
                                    mb={3}
                                    width={1}
                                    alignItems={'center'}
                                    flexDirection={['column','row']}
                                    justifyContent={'space-between'}
                                  >
                                    {
                                      this.state.lockPeriods.map( p => {
                                        const isActive = this.state.selectedLockPeriod===p.value;
                                        return (
                                          <DashboardCard
                                            cardProps={{
                                              p:2,
                                              width:0.23,
                                            }}
                                            isActive={isActive}
                                            isInteractive={true}
                                            key={`lockPeriod_${p.value}`}
                                            handleClick={e => this.selectLockPeriod(p.value)}
                                          >
                                            <Text 
                                              fontSize={2}
                                              fontWeight={3}
                                              textAlign={'center'}
                                              color={this.props.isActive ? 'copyColor' : 'legend'}
                                            >
                                              {p.label}
                                            </Text>
                                          </DashboardCard>
                                        );
                                      })
                                    }
                                  </Flex>
                                  {
                                    isIncrease && (
                                      <ExecuteTransaction
                                        params={[]}
                                        {...this.props}
                                        parentProps={{
                                          width:1,
                                          alignItems:'center',
                                          justifyContent:'center'
                                        }}
                                        Component={Button}
                                        componentProps={{
                                          fontSize:3,
                                          fontWeight:3,
                                          size:'medium',
                                          width:[1,1/2],
                                          borderRadius:4,
                                          mainColor:'deposit',
                                          value:'Increase Time',
                                          disabled:this.state.buttonDisabled
                                        }}
                                        action={'Increase Time'}
                                        methodName={'increase_unlock_time'}
                                        contractName={this.props.contractInfo.name}
                                        callback={this.transactionSucceeded.bind(this)}
                                        getTransactionParams={this.getIncreaseTimeParams.bind(this)}
                                      />
                                    )
                                  }
                                </Flex>
                              </Box>
                            )
                          }
                        </Box>
                      )
                    }
                    {
                      (isLock || this.state.increaseAction==='amount') ? (
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
                          buttonDisabled={this.state.buttonDisabled}
                          approveEnabled={this.state.approveEnabled}
                          callback={this.transactionSucceeded.bind(this)}
                          approveDescription={this.state.approveDescription}
                          balanceSelectorInfo={this.state.balanceSelectorInfo}
                          changeInputCallback={this.changeInputCallback.bind(this)}
                          contractApproved={this.contractApprovedCallback.bind(this)}
                          getTransactionParams={this.getTransactionParams.bind(this)}
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
                                  (isLock || isIncrease) ? (
                                    `You don't have any ${this.props.selectedToken} in your wallet.`
                                  ) : isUnstake && (
                                    `You don't have any staked ${this.props.selectedToken} to withdraw.`
                                  )
                                }
                              </Text>
                            </Flex>
                          </DashboardCard>
                        </SendTxWithBalance>
                      ) : (isIncrease && !canIncrease) ? (
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
                              name={'LockOpen'}
                              color={'cellText'}
                              size={this.props.isMobile ? '1.8em' : '2.3em'}
                            />
                            <Text
                              mt={1}
                              fontSize={2}
                              color={'cellText'}
                              textAlign={'center'}
                            >
                              You cannot increase an expired lock, please Withdraw.
                            </Text>
                          </Flex>
                        </DashboardCard>
                      ) : isUnstake ? (
                        <DashboardCard
                          cardProps={{
                            p:3
                          }}
                        >
                          {
                            this.state.lockExpired ? (
                              <Flex
                                alignItems={'center'}
                                flexDirection={'column'}
                              >
                                <Icon
                                  name={'LockOpen'}
                                  color={'cellText'}
                                  size={this.props.isMobile ? '1.8em' : '2.3em'}
                                />
                                <Text
                                  mt={1}
                                  mb={3}
                                  fontSize={2}
                                  color={'cellText'}
                                  textAlign={'center'}
                                >
                                  The lock has expired, you can withdraw your {this.props.selectedToken}.
                                </Text>
                                <ExecuteTransaction
                                  params={[]}
                                  {...this.props}
                                  Component={Button}
                                  parentProps={{
                                    width:1,
                                    alignItems:'center',
                                    justifyContent:'center'
                                  }}
                                  componentProps={{
                                    fontSize:3,
                                    fontWeight:3,
                                    size:'medium',
                                    width:[1,1/2],
                                    borderRadius:4,
                                    mainColor:'redeem',
                                    value:'Withdraw',
                                  }}
                                  action={'Withdraw'}
                                  methodName={'withdraw'}
                                  contractName={this.props.contractInfo.name}
                                  callback={this.transactionSucceeded.bind(this)}
                                />
                              </Flex>
                            ) : (
                              <Flex
                                alignItems={'center'}
                                flexDirection={'column'}
                              >
                                <Icon
                                  name={'LockOpen'}
                                  color={'cellText'}
                                  size={this.props.isMobile ? '1.8em' : '2.3em'}
                                />
                                <Text
                                  mt={1}
                                  fontSize={2}
                                  color={'cellText'}
                                  textAlign={'center'}
                                >
                                  The lock is not expired yet, please wait until {this.functionsUtil.strToMoment(this.state.lockedEnd*1000).utc().format('YYYY/MM/DD HH:mm')} UTC to withdraw your {this.props.selectedToken}.
                                </Text>
                              </Flex>
                            )
                          }
                        </DashboardCard>
                      ) : isClaim && (
                        <DashboardCard
                          cardProps={{
                            p:3
                          }}
                        >
                          {
                            (this.state.claimable && this.state.claimable.gt(0)) ? (
                              <Flex
                                alignItems={'center'}
                                flexDirection={'column'}
                              >
                                <Icon
                                  color={'cellText'}
                                  name={'MonetizationOn'}
                                  size={this.props.isMobile ? '1.8em' : '2.3em'}
                                />
                                <Text
                                  mt={1}
                                  mb={3}
                                  fontSize={2}
                                  color={'cellText'}
                                  textAlign={'center'}
                                >
                                  You can claim {this.functionsUtil.fixTokenDecimals(this.state.claimable,this.props.tokenConfig.decimals).toFixed(8)} {this.props.contractInfo.rewardToken}.
                                </Text>
                                <ExecuteTransaction
                                  params={[]}
                                  {...this.props}
                                  Component={Button}
                                  parentProps={{
                                    width:1,
                                    alignItems:'center',
                                    justifyContent:'center'
                                  }}
                                  componentProps={{
                                    fontSize:3,
                                    fontWeight:3,
                                    size:'medium',
                                    width:[1,1/3],
                                    value:'Claim',
                                    borderRadius:4,
                                    mainColor:'redeem',
                                  }}
                                  action={'Claim'}
                                  methodName={'claim'}
                                  callback={this.transactionSucceeded.bind(this)}
                                  contractName={this.props.tokenConfig.feeDistributor.name}
                                />
                              </Flex>
                            ) : (
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
                                  You don't have rewards to Claim yet.
                                </Text>
                              </Flex>
                            )
                          }
                        </DashboardCard>
                      )
                    }
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
            }
          </Box>
        )
      }
      </Box>
    );
  }
}

export default IdleStaking;