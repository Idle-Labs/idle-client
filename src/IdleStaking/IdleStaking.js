import ExtLink from '../ExtLink/ExtLink';
import IconBox from '../IconBox/IconBox';
import React, { Component } from 'react';
import FlexLoader from '../FlexLoader/FlexLoader';
import ConnectBox from '../ConnectBox/ConnectBox';
import ImageButton from '../ImageButton/ImageButton';
import FunctionsUtil from '../utilities/FunctionsUtil';
import DashboardCard from '../DashboardCard/DashboardCard';
import StatsCardSmall from '../StatsCardSmall/StatsCardSmall';
import CardIconButton from '../CardIconButton/CardIconButton';
import { Flex, Box, Text, Icon, Input, Button } from "rimble-ui";
import SendTxWithBalance from '../SendTxWithBalance/SendTxWithBalance';
import ExecuteTransaction from '../ExecuteTransaction/ExecuteTransaction';
import IdleStakingDisapprove from "../IdleStakingDisapprove/IdleStakingDisapprove";

class IdleStaking extends Component {

  state = {
    stats:[],
    steps:null,
    maxApr:null,
    infoBox:null,
    globalStats:[],
    lockPeriods:[
      {
        value:14,
        type:'day',
        label:'2 weeks'
      },
      {
        value:1,
        type:'month',
        label:'1 month'
      },
      {
        value:1,
        type:'year',
        label:'1 year'
      },
      {
        value:4,
        type:'year',
        label:'4 years'
      },
    ],
    lockedEnd:null,
    inputValue:null,
    description:null,
    tokenConfig:null,
    balanceProp:null,
    maxTime:126144000,// 4 * 365 * 86400  # 4 years
    lockExpired:false,
    statsLoaded:false,
    tokenBalance:null,
    contractInfo:null,
    stakedBalance:null,
    selectedToken:null,
    rewardMultiplier:1,
    claimedRewards:null,
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
    distributedRewards:null,
    selectedLockPeriod:null,
    approveDescription:null,
    approveMaxAllowance:null,
    balanceSelectorInfo:null,
    lockPeriodTimestamp:null,
    transactionSucceeded:false,
    showTokenWrapperEnabled:false,
    lockEndDateIsMaxEndDate:false
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

    const accountChanged = prevProps.account !== this.props.account;
    const selectedActionChanged = prevState.selectedAction !== this.state.selectedAction;
    const contractApprovedChanged = prevState.contractApproved !== this.state.contractApproved;
    const tokenConfigChanged = JSON.stringify(prevProps.tokenConfig) !== JSON.stringify(this.props.tokenConfig);
    const contractInfoChanged = JSON.stringify(prevProps.contractInfo) !== JSON.stringify(this.props.contractInfo);
    if (selectedActionChanged || accountChanged || contractApprovedChanged || tokenConfigChanged){
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
      } else if (lockPeriodChanged){
        this.calculateStkIDLEAmount();
      }
      this.checkButtonDisabled();
    }
  }

  checkButtonDisabled(){
    let buttonDisabled = false;
    const minLockPeriod = this.state.lockPeriods[0];
    const maxLockPeriod = Object.assign([],this.state.lockPeriods).pop();

    let minDate = this.state.lockedEnd ? this.functionsUtil.strToMoment(this.state.lockedEnd*1000).add(minLockPeriod.value,minLockPeriod.type) : this.functionsUtil.strToMoment().add(minLockPeriod.value,minLockPeriod.type);
    minDate = this.functionsUtil.strToMoment(minDate.format('YYYY-MM-DD'),'YYYY-MM-DD');

    const mDate = this.functionsUtil.strToMoment(this.state.lockPeriodInput+' '+this.functionsUtil.strToMoment().format('HH:mm:ss'),'YYYY-MM-DD HH:mm:ss');
    const maxDate = this.functionsUtil.strToMoment().add(maxLockPeriod.value,maxLockPeriod.type);
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

    this.setState({
      buttonDisabled
    });
  }

  async changeInputCallback(inputValue=null){
    inputValue = this.functionsUtil.BNify(inputValue);
    this.setState({
      inputValue
    },() => {
      this.calculateStkIDLEAmount();
    });
  }

  async getMaxStakeTimestamp(){
    const blockInfo = await this.functionsUtil.getBlockInfo();
    let timestamp = parseInt(Date.now()/1000);
    if (blockInfo){
      timestamp = blockInfo.timestamp;
    }
    timestamp += this.state.maxTime;
    return timestamp;
  }

  async calculateStkIDLEAmount(){
    let internalInfoBox = null;
    if (this.state.inputValue && this.functionsUtil.BNify(this.state.inputValue).gt(0) && this.state.lockPeriodTimestamp !== null){
      switch (this.state.selectedAction){
        case 'Lock':
          const currTime = parseInt(Date.now()/1000);
          const maxStakeTimestamp = await this.getMaxStakeTimestamp();
          const maxDate = this.functionsUtil.strToMoment(maxStakeTimestamp*1000);
          let endDate = this.functionsUtil.strToMoment(this.state.lockPeriodTimestamp*1000);
          if (endDate.isAfter(maxDate)){
            endDate = maxDate;
          }
          const endDateTime = parseInt(endDate._d.getTime()/1000)-currTime;
          const maxDateTime = parseInt(maxDate._d.getTime()/1000)-currTime;
          const stkIDLEAmount = this.state.inputValue.times(endDateTime).div(maxDateTime);

          const percentage = stkIDLEAmount.div(this.state.inputValue).times(100);

          // console.log(this.state.inputValue.toString(),endDate.format('YYYY-MM-DD HH:mm:ss'),maxDate.format('YYYY-MM-DD HH:mm:ss'),endDateTime,maxDateTime,stkIDLEAmount.toFixed());

          let text = `By staking <strong>${this.state.inputValue.toFixed(4)} ${this.props.selectedToken}</strong> until <strong>${endDate.utc().format('YYYY-MM-DD HH:mm')} UTC</strong> you will get back <strong>${stkIDLEAmount.toFixed(4)} ${this.props.tokenConfig.contract.name}</strong> (${Math.ceil(percentage)}% of staking power).`;
          if (Math.ceil(percentage)<100){
            text += `<br />Stake your tokens for <strong>4 years</strong> to reach the maximum staking power.`;
          }
          text += `<br /><span style="color:${this.props.theme.colors.alert};font-size:14px">Keep in mind that once you lock ${this.props.selectedToken} you cannot reverse the operation until the lock end date has been reached.</span>`;
          internalInfoBox = {
            text,
            icon:'LockOutline',
            iconProps:{
              color:'cellText'
            },
          };
        break;
        default:
        break;
      }
    }
    this.setState({
      internalInfoBox
    });
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
    let _unlock_time = parseInt(this.state.lockPeriodTimestamp);
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
      etherscanRewardsTxs,
      totalSupply,
      tokenTotalSupply,
      claimableRewards,
      lockedInfo,
      tokenUserBalance,
      claimable,
      claimEvents,
      // checkpointEvents,
      depositEvents
    ] = await Promise.all([
      this.functionsUtil.getIdleStakingRewardsTxs(),
      this.functionsUtil.genericContractCallCached(this.props.contractInfo.name,'supply'),
      this.functionsUtil.genericContractCallCached(this.props.contractInfo.name, 'totalSupply'),
      this.functionsUtil.getTokenBalance(this.props.contractInfo.rewardToken,this.props.tokenConfig.feeDistributor.address),
      this.props.account ? this.functionsUtil.genericContractCall(this.props.contractInfo.name,'locked',[this.props.account]) : null,
      this.props.account ? this.functionsUtil.getContractBalance(this.props.contractInfo.name,this.props.account) : this.functionsUtil.BNify(0),
      this.props.account ? this.functionsUtil.genericContractCall(this.props.tokenConfig.feeDistributor.name,'claim',[this.props.account]) : this.functionsUtil.BNify(0),
      this.functionsUtil.getContractEvents(this.props.tokenConfig.feeDistributor.name,'Claimed',this.props.tokenConfig.feeDistributor.fromBlock,'latest'),
      // this.functionsUtil.getContractEvents(this.props.tokenConfig.feeDistributor.name,'CheckpointToken',{fromBlock: this.props.tokenConfig.feeDistributor.fromBlock, toBlock:'latest'}),
      this.props.account ? this.functionsUtil.getContractEvents(this.props.contractInfo.name,'Deposit',this.props.contractInfo.fromBlock,'latest',{filter:{provider:this.props.account}}) : []
    ]);

    const rewardTokenConfig = this.functionsUtil.getGlobalConfig(['govTokens',this.props.contractInfo.rewardToken]);

    let distributedRewards = [];
    let totalRewards = this.functionsUtil.BNify(0);
    let totalRewardsDays = this.functionsUtil.BNify(0);

    if (etherscanRewardsTxs && etherscanRewardsTxs.length){
      totalRewardsDays = Math.abs(etherscanRewardsTxs[0].timeStamp-etherscanRewardsTxs[etherscanRewardsTxs.length-1].timeStamp)/86400;
      distributedRewards = etherscanRewardsTxs.map( tx => {
        const amount = this.functionsUtil.fixTokenDecimals(tx.value,rewardTokenConfig.decimals);
        totalRewards = totalRewards.plus(amount);
        return {
          amount,
          hash:tx.hash,
          timeStamp:tx.timeStamp,
          tokenName:tx.tokenSymbol,
          date:this.functionsUtil.strToMoment(parseInt(tx.timeStamp)*1000).utc().format('YYYY-MM-DD HH:mm')+' UTC'
        };
      });
    }

    const claimedRewards = [];
    let totalClaimedUser = this.functionsUtil.BNify(0);
    if (claimEvents){
      await this.functionsUtil.asyncForEach(claimEvents, async (e) => {
        if (this.props.account && e.returnValues && e.returnValues.recipient && e.returnValues.recipient.toLowerCase() === this.props.account.toLowerCase()){
          const blockInfo = await this.functionsUtil.getBlockInfo(e.blockNumber);
          if (blockInfo){
            const claimedAmount = this.functionsUtil.fixTokenDecimals(e.returnValues.amount,rewardTokenConfig.decimals);
            totalClaimedUser = totalClaimedUser.plus(claimedAmount);
            claimedRewards.push({
              amount:claimedAmount,
              hash:e.transactionHash,
              tokenName:this.props.contractInfo.rewardToken,
              date:this.functionsUtil.strToMoment(parseInt(blockInfo.timestamp)*1000).utc().format('YYYY-MM-DD HH:mm')+' UTC'
            });
          }
        }
      });
    }

    tokenUserBalance = this.functionsUtil.fixTokenDecimals(tokenUserBalance,this.props.contractInfo.decimals);

    const totalDeposited = totalSupply ? this.functionsUtil.fixTokenDecimals(totalSupply,this.props.tokenConfig.decimals) : this.functionsUtil.BNify(0);
    const totalLockedFunds = totalSupply ? this.functionsUtil.formatMoney(totalDeposited,4)+' '+this.props.selectedToken : (this.state.stats.length ? this.state.stats[0].value : this.functionsUtil.formatMoney(totalDeposited,4)+' '+this.props.selectedToken);
    stats.push({
      title:'Total Locked Funds',
      value:totalLockedFunds
    });

    tokenTotalSupply = tokenTotalSupply ? this.functionsUtil.fixTokenDecimals(tokenTotalSupply,this.props.tokenConfig.decimals) : this.functionsUtil.BNify(0);
    const stkTokenTotalSupply = tokenTotalSupply ? this.functionsUtil.formatMoney(tokenTotalSupply,4)+' '+this.props.contractInfo.name : (this.state.stats.length ? this.state.stats[1].value : this.functionsUtil.formatMoney(tokenTotalSupply,4)+' '+this.props.contractInfo.name);
    stats.push({
      title:`${this.props.contractInfo.name} Total Supply`,
      value:stkTokenTotalSupply
    });

    const claimableRewardsFormatted = claimableRewards ? this.functionsUtil.formatMoney(claimableRewards,4)+' '+this.props.contractInfo.rewardToken : (this.state.stats.length ? this.state.stats[2].value : this.functionsUtil.formatMoney(claimableRewards,4)+' '+this.props.contractInfo.rewardToken);
    stats.push({
      title:'Claimable Rewards',
      value:claimableRewardsFormatted
    });

    // const totalClaimed = claimEvents.reduce( (totalClaimed,event) => {
    //   const claimedAmount = this.functionsUtil.fixTokenDecimals(event.returnValues.amount,rewardTokenConfig.decimals);
    //   totalClaimed = totalClaimed.plus(claimedAmount);
    //   return totalClaimed;
    // },this.functionsUtil.BNify(0));

    const totalRewardsFormatted = this.functionsUtil.formatMoney(totalRewards,4)+' '+this.props.contractInfo.rewardToken;
    stats.push({
      title:'Total Rewards',
      value:totalRewardsFormatted
    });

    const maxApr = totalRewards.div(tokenTotalSupply).times(365.2425).div(totalRewardsDays);

    stats.push({
      title:'APR (1 year staking)',
      value:maxApr.div(4).times(100).toFixed(2)+'%'
    });
    stats.push({
      title:'APR (4 years staking)',
      value:maxApr.times(100).toFixed(2)+'%'
    });

    const stakedBalance = lockedInfo && lockedInfo.amount ? this.functionsUtil.fixTokenDecimals(lockedInfo.amount,this.props.tokenConfig.decimals) : this.functionsUtil.BNify(0);
    const userDeposited = this.functionsUtil.formatMoney(stakedBalance,4);
    globalStats.push({
      title:'Total Deposited',
      description:'Your total deposited amount',
      value:userDeposited+' '+this.props.contractInfo.rewardToken,
    });

    const stakingShare = tokenUserBalance.div(tokenTotalSupply);
    globalStats.push({
      title:'Share',
      value:`${stakingShare.times(100).toFixed(2)}%`,
      description:'Your share of the total deposits',
    });

    globalStats.push({
      title:`${this.props.contractInfo.name} balance`,
      value:`${this.functionsUtil.formatMoney(tokenUserBalance,4)} ${this.props.contractInfo.name}`,
    });
    
    claimable = claimable ? this.functionsUtil.fixTokenDecimals(claimable,this.props.tokenConfig.decimals) : this.functionsUtil.BNify(0);
    const currentRewards = this.functionsUtil.formatMoney(claimable,4);
    globalStats.push({
      title:'Claimable Rewards',
      value:`${currentRewards} ${this.props.contractInfo.rewardToken}`,
      // description:'Your claimable rewards'
    });

    const totalCollectedRewards = claimable.plus(totalClaimedUser);

    let stakeStartTime = depositEvents ? depositEvents.reduce( (stakedTime,event) => {
      const depositTimestamp = this.functionsUtil.BNify(event.returnValues.ts);
      const depositValue = this.functionsUtil.fixTokenDecimals(event.returnValues.value,this.props.tokenConfig.decimals);
      if (depositValue.gt(0)){
        stakedTime = stakedTime.plus(depositValue.times(depositTimestamp));
        // console.log(depositTimestamp.toString(),depositValue.toFixed(),stakedTime.toString());
      }
      return stakedTime;
    },this.functionsUtil.BNify(0)) : this.functionsUtil.BNify(0);

    // console.log('stakeStartTime',stakeStartTime,stakedBalance.toFixed());

    stakeStartTime = stakedBalance.gt(0) ? Math.ceil(stakeStartTime.div(stakedBalance)) : 0;
    // const latestCheckpoint = checkpointEvents.length ? checkpointEvents[checkpointEvents.length-1] : null;
    // const latestDistribution = etherscanRewardsTxs[0];
    // const latestDistributionTime = latestDistribution ? this.functionsUtil.BNify(latestDistribution.timeStamp) : this.functionsUtil.BNify(parseInt(Date.now()/1000));
    // const latestDistributionTime = latestCheckpoint ? this.functionsUtil.BNify(latestCheckpoint.returnValues.time) : this.functionsUtil.BNify(parseInt(Date.now()/1000));
    const currTime = parseInt(Date.now()/1000);
    const stakePeriod = this.functionsUtil.BNify(currTime).minus(stakeStartTime);
    const currentProfit = stakedBalance.gt(0) ? totalCollectedRewards.div(stakedBalance) : this.functionsUtil.BNify(0);
    const weeksPerYear = 52.14;
    const secondsPerWeek = 604800;
    const stakePeriodWeeks = Math.max(1,Math.floor(stakePeriod.div(secondsPerWeek)));
    const apr = stakePeriod.gt(0) ? currentProfit.times(weeksPerYear).div(stakePeriodWeeks).times(100) : this.functionsUtil.BNify(0);
    
    // console.log('APR',currTime,stakeStartTime,apr.toFixed(),currentProfit.toFixed(),stakePeriod.toFixed(),stakePeriodWeeks,totalCollectedRewards.toFixed(),stakedBalance.toFixed());

    globalStats.push({
      title:'APR',
      value:`${apr.toFixed(2)}%`,
      description:'APR is based on your Claimable Rewards and Total Deposited'
    });

    const lockEndDate = this.state.lockedEnd ? this.functionsUtil.strToMoment(this.state.lockedEnd*1000).utc().format('YYYY/MM/DD HH:mm') : '';
    globalStats.push({
      value:lockEndDate,
      title:'Lock End Date (UTC)',
      description:'Ending date of your Lock'
    });

    this.setState({
      stats,
      maxApr,
      claimable,
      globalStats,
      statsLoaded,
      stakedBalance,
      claimedRewards,
      distributedRewards
    });
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

  async changeLockPeriodInput(e){
    const selectedLockPeriod = null;
    const lockPeriodInput = e.target.value;
    const currDate = this.functionsUtil.strToMoment();
    const mDate = this.functionsUtil.strToMoment(lockPeriodInput+' '+currDate.format('HH:mm:ss'),'YYYY-MM-DD HH:mm:ss').add(1,'second');
    if (mDate.isValid()){
      let lockPeriodTimestamp = parseInt(mDate._d.getTime()/1000);
      // Check if lockPeriodTimestamp > maxStakeTimestamp
      const maxStakeTimestamp = await this.getMaxStakeTimestamp();
      if (lockPeriodTimestamp>maxStakeTimestamp){
        lockPeriodTimestamp = maxStakeTimestamp;
      }

      this.setState({
        lockPeriodInput,
        selectedLockPeriod,
        lockPeriodTimestamp
      },() => {
        this.checkButtonDisabled()
      });
    }
  }

  async selectLockPeriod(selectedLockPeriod){
    const minDate = this.state.lockedEnd ? this.functionsUtil.strToMoment(this.state.lockedEnd*1000) : this.functionsUtil.strToMoment();
    const mDate = minDate.add(selectedLockPeriod.value,selectedLockPeriod.type).add(1,'second');

    const lockPeriodInput = mDate.format('YYYY-MM-DD');
    let lockPeriodTimestamp = parseInt(mDate._d.getTime()/1000);

    // Check if lockPeriodTimestamp > maxStakeTimestamp
    const maxStakeTimestamp = await this.getMaxStakeTimestamp();
    if (lockPeriodTimestamp>maxStakeTimestamp){
      lockPeriodTimestamp = maxStakeTimestamp;
    }

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
        internalInfoBox = {
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
            internalInfoBox = {
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

    const statsLoaded = false;
    const transactionSucceeded = true;

    this.setState({
      infoBox,
      statsLoaded,
      internalInfoBox,
      transactionSucceeded
    },() => {
      this.updateData();
    });
  }

  async updateData(selectedActionChanged=false){
    const newState = {};
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
        newState.approveDescription = `Approve the Staking contract to stake your ${this.props.selectedToken} tokens`;
        newState.approveMaxAllowance = this.functionsUtil.normalizeTokenAmount(newState.tokenBalance,this.props.tokenConfig.decimals);
      break;
      case 'Increase Lock':
        newState.permitEnabled = false;
        newState.approveDescription = '';
        newState.balanceProp = newState.tokenBalance;
        newState.approveEnabled = this.state.increaseAction === 'amount';
        newState.lockPeriodInput = this.functionsUtil.strToMoment(newState.lockedEnd*1000).format('YYYY-MM-DD');
        newState.approveDescription = `Approve the Staking contract to stake your ${this.props.selectedToken} tokens`;
        newState.approveMaxAllowance = this.functionsUtil.normalizeTokenAmount(newState.tokenBalance,this.props.tokenConfig.decimals);
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

    const maxDateTimestamp = await this.getMaxStakeTimestamp();
    const maxDate = this.functionsUtil.strToMoment(maxDateTimestamp*1000).format('YYYY-MM-DD');
    newState.lockEndDateIsMaxEndDate = newState.lockedEnd ? this.functionsUtil.strToMoment(newState.lockedEnd*1000).format('YYYY-MM-DD')===maxDate : false;

    // console.log('lockEndDateIsMaxEndDate',newState.lockEndDateIsMaxEndDate,maxDate,this.functionsUtil.strToMoment(newState.lockedEnd*1000).format('YYYY-MM-DD'));

    this.setState(newState,() => {
      this.loadStats();
    });
  }

  render() {

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
        this.props.isDashboard && (
          <IdleStakingDisapprove
            {...this.props}
          />
        )
      }
      {
        this.props.tokenConfig && this.props.tokenConfig.poolLink && (
          <Box
            mt={2}
            width={1}
          >
            <Text
              mb={1}
            >
              Token link:
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
              mb={1}
              width={1}
              style={{
                flexBasis:'0',
                flex:'1 1 0px',
                flexWrap:'wrap'
              }}
              justifyContent={'space-between'}
            >
              {
                this.state.globalStats.map( (statInfo,index) =>
                  <StatsCardSmall
                    key={`globalStats_${index}`}
                    cardProps={{
                      mb:2,
                      width:['49%','33%'],
                      // mr:[0,index<this.state.globalStats.length-1 ? 1 : 0]
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
                      <StatsCardSmall
                        key={`stats_${index}`}
                        cardProps={{
                          width:[1,'49%']
                        }}
                        {...statInfo}
                      />
                    )
                  }
                  <Text
                    mb={1}
                  >
                    Distributed Rewards:
                  </Text>
                  <Flex
                    mb={3}
                    width={1}
                    justifyContent={'center'}
                  >
                    <DashboardCard
                      cardProps={{
                        pt:2,
                        pb:3,
                        px:3,
                        width:1,
                        display:'flex',
                        justifyContent:'center'
                      }}
                      isActive={false}
                      isInteractive={false}
                    >
                      {
                        this.state.distributedRewards && this.state.distributedRewards.length ? (
                          <Box
                            width={1}
                            flexDirection={'column'}
                          >
                            <Flex
                              pt={0}
                              pb={1}
                              width={1}
                              flexDirection={'row'}
                              borderBottom={`1px solid ${this.props.theme.colors.divider}`}
                            >
                              <Text
                                fontSize={1}
                                fontWeight={3}
                                width={this.props.isMobile ? 0.45 : 0.4}
                              >
                                Date
                              </Text>
                              <Text
                                fontSize={1}
                                fontWeight={3}
                                width={this.props.isMobile ? 0.4 : 0.3}
                                textAlign={this.props.isMobile ? 'right' : 'left'}
                              >
                                Amount
                              </Text>
                              <Text
                                fontSize={1}
                                fontWeight={3}
                                width={this.props.isMobile ? 0.15 : 0.3}
                              >
                                { this.props.isMobile ? '' : 'Hash' }
                              </Text>
                            </Flex>
                            <Box
                              flexDirection={'column'}
                              alignItems={'flex-start'}
                              overflow={['visible','scroll']}
                              maxHeight={['initial','500px']}
                            >
                              {
                                this.state.distributedRewards.map( (reward,index) => (
                                  <Flex
                                    width={1}
                                    py={[2,1]}
                                    flexDirection={'row'}
                                    key={`rewards_${index}`}
                                    borderBottom={`1px solid ${this.props.theme.colors.divider}`}
                                  >
                                    <Text
                                      fontWeight={2}
                                      color={'statValue'}
                                      fontSize={this.props.isMobile ? 1 : 2}
                                      width={this.props.isMobile ? 0.45 : 0.4}
                                    >
                                      {reward.date}
                                    </Text>
                                    <Text
                                      fontWeight={2}
                                      color={'statValue'}
                                      fontSize={this.props.isMobile ? 1 : 2}
                                      width={this.props.isMobile ? 0.4 : 0.3}
                                      textAlign={this.props.isMobile ? 'right' : 'left'}
                                    >
                                      {reward.amount.toFixed(4)} {reward.tokenName}
                                    </Text>
                                    <Flex
                                      width={this.props.isMobile ? 0.15 : 0.13}
                                      justifyContent={this.props.isMobile ? 'flex-end' : 'flex-start'}
                                    >
                                      <ExtLink
                                        color={'link'}
                                        hoverColor={'link'}
                                        href={this.functionsUtil.getEtherscanTransactionUrl(reward.hash)}
                                      >
                                        <Flex
                                          alignItems={'center'}
                                          flexDirection={'row'}
                                        >
                                          {
                                            !this.props.isMobile && (
                                              <Text
                                                fontSize={2}
                                                fontWeight={2}
                                                color={'link'}
                                              >
                                                {this.functionsUtil.shortenHash(reward.hash)}
                                              </Text>
                                            )
                                          }
                                          <Icon
                                            ml={1}
                                            color={'link'}
                                            name={'OpenInNew'}
                                            size={this.props.isMobile ? '1.4em' : '1.2em'}
                                          />
                                        </Flex>
                                      </ExtLink>
                                    </Flex>
                                  </Flex>
                                ))
                              }
                            </Box>
                          </Box>
                        ) : (
                          <Text
                            fontSize={2}
                            color={'statValue'}
                          >
                            No reward distributed yet.
                          </Text>
                        )
                      }
                    </DashboardCard>
                  </Flex>
                </Flex>
              ) : (this.props.account && this.props.tokenConfig && this.state.balanceProp && this.state.statsLoaded && this.props.contractInfo) ? (
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
                            iconBgColor={'#ced6ff'}
                            isActive={ this.state.increaseAction === 'time' }
                            handleClick={ e => this.setIncreaseAction('time') }
                            text={this.props.isMobile ? 'Time' : 'Increase Time'}
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
                            isActive={ this.state.increaseAction === 'amount' }
                            handleClick={ e => this.setIncreaseAction('amount') }
                            text={this.props.isMobile ? 'Amount' : 'Increase Amount'}
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
                              {
                                !this.state.lockEndDateIsMaxEndDate ? (
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
                                      onChange={this.changeLockPeriodInput.bind(this)}
                                      border={`1px solid ${this.props.theme.colors.divider}`}
                                    />
                                    <Flex
                                      mb={3}
                                      width={1}
                                      alignItems={'center'}
                                      flexDirection={'row'}
                                      justifyContent={'space-between'}
                                    >
                                      {
                                        this.state.lockPeriods.map( (p,index) => {
                                          const isActive = this.state.selectedLockPeriod ? this.state.selectedLockPeriod.value===p.value && this.state.selectedLockPeriod.type === p.type : false;
                                          return (
                                            <DashboardCard
                                              cardProps={{
                                                p:2,
                                                width:0.24,
                                              }}
                                              isActive={isActive}
                                              isInteractive={true}
                                              key={`lockPeriod_${index}`}
                                              handleClick={e => this.selectLockPeriod(p)}
                                            >
                                              <Text 
                                                fontWeight={3}
                                                fontSize={[1,2]}
                                                textAlign={'center'}
                                                color={isActive ? 'copyColor' : 'cellText'}
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
                                ) : (
                                  <IconBox
                                    cardProps={{
                                      mt:1,
                                      mb:3
                                    }}
                                    icon={'Warning'}
                                    iconProps={{
                                      color:'cellText'
                                    }}
                                    text={`Your tokens are locked for the maxumum allowed period.`}
                                  />
                                )
                              }
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
                        approveMaxAllowance={this.state.approveMaxAllowance}
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
                      <Flex
                        width={1}
                        flexDirection={'column'}
                      >
                        <DashboardCard
                          cardProps={{
                            p:3,
                            mb:1
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
                                  fontSize={[2,3]}
                                  color={'cellText'}
                                  textAlign={'center'}
                                >
                                  You can claim <strong>{this.state.claimable.toFixed(8)} {this.props.contractInfo.rewardToken}</strong>.
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
                        <Text
                          mb={1}
                        >
                          Claimed Rewards:
                        </Text>
                        <Flex
                          mb={3}
                          width={1}
                          alignItems={'center'}
                          justifyContent={'center'}
                        >
                          <DashboardCard
                            cardProps={{
                              pt:2,
                              pb:3,
                              px:3,
                              width:1,
                              display:'flex',
                              alignItems:'center',
                              justifyContent:'center'
                            }}
                            isActive={false}
                            isInteractive={false}
                          >
                            {
                              this.state.claimedRewards && this.state.claimedRewards.length ? (
                                <Flex
                                  width={1}
                                  flexDirection={'column'}
                                >
                                  <Flex
                                    pt={0}
                                    pb={1}
                                    width={1}
                                    flexDirection={'row'}
                                    borderBottom={`1px solid ${this.props.theme.colors.divider}`}
                                  >
                                    <Text
                                      fontSize={1}
                                      fontWeight={3}
                                      width={this.props.isMobile ? 0.5 : 0.4}
                                    >
                                      Date
                                    </Text>
                                    <Text
                                      fontSize={1}
                                      fontWeight={3}
                                      width={this.props.isMobile ? 0.5 : 0.3}
                                      textAlign={this.props.isMobile ? 'right' : 'left'}
                                    >
                                      Amount
                                    </Text>
                                    {
                                      !this.props.isMobile && (
                                        <Text
                                          width={0.3}
                                          fontSize={1}
                                          fontWeight={3}
                                        >
                                          Hash
                                        </Text>
                                      )
                                    }
                                  </Flex>
                                  {
                                    this.state.claimedRewards.map( (claim,index) => (
                                      <Flex
                                        py={1}
                                        width={1}
                                        flexDirection={'row'}
                                        key={`claim_${index}`}
                                        borderBottom={`1px solid ${this.props.theme.colors.divider}`}
                                      >
                                        <Text
                                          fontWeight={2}
                                          color={'statValue'}
                                          fontSize={this.props.isMobile ? 1 : 2}
                                          width={this.props.isMobile ? 0.5 : 0.4}
                                        >
                                          {claim.date}
                                        </Text>
                                        <Text
                                          fontWeight={2}
                                          color={'statValue'}
                                          fontSize={this.props.isMobile ? 1 : 2}
                                          width={this.props.isMobile ? 0.5 : 0.3}
                                          textAlign={this.props.isMobile ? 'right' : 'left'}
                                        >
                                          {claim.amount.toFixed(4)} {claim.tokenName}
                                        </Text>
                                        {
                                          !this.props.isMobile && (
                                            <ExtLink
                                              width={0.3}
                                              color={'link'}
                                              hoverColor={'link'}
                                              href={this.functionsUtil.getEtherscanTransactionUrl(claim.hash)}
                                            >
                                              <Flex
                                                alignItems={'center'}
                                                flexDirection={'row'}
                                              >
                                                <Text
                                                  fontSize={2}
                                                  fontWeight={2}
                                                  color={'link'}
                                                >
                                                  {this.functionsUtil.shortenHash(claim.hash)}
                                                </Text>
                                                <Icon
                                                  ml={1}
                                                  size={'1.2em'}
                                                  color={'link'}
                                                  name={'OpenInNew'}
                                                />
                                              </Flex>
                                            </ExtLink>
                                          )
                                        }
                                      </Flex>
                                    ))
                                  }
                                </Flex>
                              ) : (
                                <Text
                                  fontSize={2}
                                  color={'statValue'}
                                >
                                  No reward claimed yet.
                                </Text>
                              )
                            }
                          </DashboardCard>
                        </Flex>
                      </Flex>
                    )
                  }
                </Box>
              ) : !this.props.account ? (
                <ConnectBox
                  cardProps={{
                    mt:2
                  }}
                  {...this.props}
                />
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