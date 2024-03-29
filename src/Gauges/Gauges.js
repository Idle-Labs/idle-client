import IconBox from '../IconBox/IconBox';
import React, { Component } from 'react';
import ConnectBox from '../ConnectBox/ConnectBox';
import FlexLoader from '../FlexLoader/FlexLoader';
import RoundButton from '../RoundButton/RoundButton';
import FunctionsUtil from '../utilities/FunctionsUtil';
import TranchesList from '../TranchesList/TranchesList';
import AssetSelector from '../AssetSelector/AssetSelector';
import DashboardCard from '../DashboardCard/DashboardCard';
import CardIconButton from '../CardIconButton/CardIconButton';
import { Flex, Box, Text, Icon, Heading, Button } from "rimble-ui";
import SendTxWithBalance from '../SendTxWithBalance/SendTxWithBalance';
import ExecuteTransaction from '../ExecuteTransaction/ExecuteTransaction';

class Gauges extends Component {

  state = {
    canVote:true,
    infoBox:null,
    claimText:null,
    unlockDate:null,
    inputValue:null,
    balanceProp:null,
    tokenConfig:null,
    noFundsText:null,
    gaugeConfig:null,
    contractInfo:null,
    lastUserVote:null,
    selectedToken:null,
    rewardsTokens:null,
    veTokenBalance:null,
    allowZeroValue:null,
    approveEnabled:null,
    claimSucceded:false,
    claimToken:'default',
    buttonDisabled:false,
    availableGauges:null,
    claimableTokens:null,
    votingPowerUsed:null,
    availableTokens:null,
    stakeAction:'deposit',
    selectedAction:'vote',
    gaugeTotalSupply:null,
    distributionRate:null,
    gaugeWorkingSupply:null,
    veTokenTotalSupply:null,
    approveDescription:null,
    balanceSelectorInfo:null,
    trancheTokenBalance:null,
    availableVotingPower:null,
    gaugePeriodTimestamp:null,
    gaugeWorkingBalances:null,
    claimableRewardsTokens:null
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
    this.loadData();
    this.loadEmptyGauges();
  }

  shouldComponentUpdate(nextProps, nextState) {
    const accountChanged = nextProps.account !== this.props.account;
    const stateChanged = JSON.stringify(this.state) !== JSON.stringify(nextState);
    const contractsChanged = this.props.contracts.length !== nextProps.contracts.length || this.props.contracts.map( c => c.name ).filter( contractName => !nextProps.contracts.map( c => c.name ).includes(contractName) ).length>0;
    return stateChanged || accountChanged || contractsChanged;
  }

  async componentDidUpdate(prevProps,prevState){
    this.loadUtils();

    const selectedTokenChanged = prevState.selectedToken !== this.state.selectedToken;
    if (selectedTokenChanged){
      this.setState({
        infoBox:null,
        gaugeConfig:null,
        claimSucceded:false,
        claimToken:'default'
      },() => {
        this.loadGaugeData();
      })
    }

    const stakeActionChanged = prevState.stakeAction !== this.state.stakeAction;
    const selectedActionChanged = prevState.selectedAction !== this.state.selectedAction;
    if (selectedActionChanged || stakeActionChanged){
      this.setState({
        infoBox:null,
        claimSucceded:false
      },() => {
        this.loadTokenData();
      });
    }
  }

  loadData(){
    const availableTokens = Object.keys(this.props.toolProps.availableGauges).reduce((obj, token) => {
      const gaugeConfig = this.props.toolProps.availableGauges[token];
      const baseTokenConfig = this.functionsUtil.getGlobalConfig(['stats','tokens',token.toUpperCase()]);

      const tokenConfig = {};
      tokenConfig.token = token;
      tokenConfig.abi = gaugeConfig.abi;
      tokenConfig.address = gaugeConfig.address;
      tokenConfig.decimals = baseTokenConfig.decimals;
      obj[token] = tokenConfig;
      return obj;
    }, {});

    const tokenUrlParam = this.props.urlParams.param2 || this.props.urlParams.param1;
    const selectedToken = tokenUrlParam && Object.keys(availableTokens).includes(tokenUrlParam) ? tokenUrlParam : Object.keys(availableTokens)[0];

    // console.log(this.props.urlParams,Object.keys(availableTokens).includes(this.props.urlParams.param2),selectedToken);

    this.setState({
      selectedToken,
      availableTokens
    },() => {
      this.loadGaugeData();
    });
  }

  calculateGaugeBoost(stakedBalance=null) {

    if (this.functionsUtil.BNify(stakedBalance).isNaN()){
      stakedBalance = this.functionsUtil.BNify(0);
    }

    stakedBalance = this.functionsUtil.BNify(stakedBalance).plus(this.state.stakedBalance);

    let l = this.functionsUtil.BNify(this.functionsUtil.normalizeTokenAmount(stakedBalance,18));
    let voting_balance = this.functionsUtil.BNify(this.functionsUtil.normalizeTokenAmount(this.state.veTokenBalance,18));
    let voting_total = this.functionsUtil.BNify(this.state.veTokenTotalSupply);
    // let period_timestamp = this.functionsUtil.BNify(this.state.gaugePeriodTimestamp);
    let working_balances = this.functionsUtil.BNify(this.state.gaugeWorkingBalances);
    let working_supply = this.functionsUtil.BNify(this.state.gaugeWorkingSupply);
    let L = this.functionsUtil.BNify(this.state.gaugeTotalSupply).plus(l);
    
    let TOKENLESS_PRODUCTION = this.functionsUtil.BNify(40);
    let lim = l.times(TOKENLESS_PRODUCTION).div(100);
    lim = lim.plus(L.times(voting_balance).div(voting_total).times((this.functionsUtil.BNify(100).minus(TOKENLESS_PRODUCTION)).div(100)));
    lim = this.functionsUtil.BNify(Math.min(l, lim));
    
    let old_bal = working_balances;
    let noboost_lim = TOKENLESS_PRODUCTION.times(l).div(100);
    let noboost_supply = working_supply.plus(noboost_lim).minus(old_bal);
    let _working_supply = working_supply.plus(lim).minus(old_bal);

    let boost = this.functionsUtil.BNify(lim).div(_working_supply).div(noboost_lim.div(noboost_supply));

    if (!boost || boost.isNaN()){
      boost = this.functionsUtil.BNify(1);
    }

    // console.log('calculateGaugeBoost',voting_balance.div(1e18).toFixed(),voting_total.div(1e18).toFixed(),l.div(1e18).toFixed(),L.div(1e18).toFixed(),lim.div(1e18).toFixed(),_working_supply.div(1e18).toFixed(),noboost_lim.div(1e18).toFixed(),noboost_supply.div(1e18).toFixed(),boost.toFixed());

    return boost;
  }

  async loadGaugeData(){
    const veTokenConfig = this.props.toolProps.veToken;
    const gaugeConfig = this.props.toolProps.availableGauges[this.state.selectedToken];

    // Initialize veToken
    const veTokenContract = this.functionsUtil.getContractByName(veTokenConfig.token);
    if (!veTokenContract && veTokenConfig.abi){
      await this.props.initContract(veTokenConfig.token,veTokenConfig.address,veTokenConfig.abi);
    }

    // Initialize tranche token
    const trancheTokenConfig = gaugeConfig.trancheToken;
    const trancheTokenContract = this.functionsUtil.getContractByName(trancheTokenConfig.name);
    if (!trancheTokenContract && trancheTokenConfig.abi){
      await this.props.initContract(trancheTokenConfig.token,trancheTokenConfig.address,trancheTokenConfig.abi);
    }

    // Initialize Liquidity Gauge contract
    const liquidityGaugeConfig = this.functionsUtil.getContractByName(gaugeConfig.name);
    if (!liquidityGaugeConfig && gaugeConfig.abi){
      await this.props.initContract(gaugeConfig.name,gaugeConfig.address,gaugeConfig.abi);
    }

    let [
      blockInfo,
      gaugeTotalSupply,
      veTokenTotalSupply,
      distributionRate,
      stakedBalance,
      rewardsTokens,
      gaugeWorkingSupply,
      veTokenBalance,
      gaugePeriodTimestamp,
      trancheTokenBalance,
      votingPowerUsed,
      gaugeWorkingBalances,
      lastUserVote,
      voteUserSlope,
    ] = await Promise.all([
      this.functionsUtil.getBlockInfo(),
      this.functionsUtil.getTokenTotalSupply(gaugeConfig.name),
      this.functionsUtil.getTokenTotalSupply(veTokenConfig.token),
      this.functionsUtil.genericContractCall('GaugeDistributor','rate'),
      this.functionsUtil.getTokenBalance(gaugeConfig.name,this.props.account),
      this.functionsUtil.getGaugeRewardsTokens(gaugeConfig,this.props.account),
      this.functionsUtil.genericContractCall(gaugeConfig.name,'working_supply'),
      this.functionsUtil.getTokenBalance(veTokenConfig.token,this.props.account),
      this.functionsUtil.genericContractCall(gaugeConfig.name,'period_timestamp',[0]),
      this.functionsUtil.getTokenBalance(trancheTokenConfig.token,this.props.account),
      this.functionsUtil.genericContractCall('GaugeController','vote_user_power',[this.props.account]),
      this.functionsUtil.genericContractCall(gaugeConfig.name,'working_balances',[this.props.account]),
      this.functionsUtil.genericContractCall('GaugeController','last_user_vote',[this.props.account,gaugeConfig.address]),
      this.functionsUtil.genericContractCall('GaugeController','vote_user_slopes',[this.props.account,gaugeConfig.address])
    ]);

    const claimableRewardsTokens = Object.keys(rewardsTokens).filter( token => token !== 'IDLE' ).reduce( (claimableRewards,token) => {
      const tokenConfig = rewardsTokens[token];
      if (tokenConfig.balance.gt(0)){
        claimableRewards[token] = this.functionsUtil.fixTokenDecimals(tokenConfig.balance,tokenConfig.decimals);
      }
      return claimableRewards;
    },{});

    const claimableTokens = this.functionsUtil.fixTokenDecimals(rewardsTokens.IDLE.balance,18);

    if (distributionRate){
      distributionRate = this.functionsUtil.fixTokenDecimals(distributionRate,18).times(86400);
    }

    votingPowerUsed = this.functionsUtil.BNify(votingPowerUsed);
    let oldPowerUsed = this.functionsUtil.BNify(voteUserSlope.power);
    const availableVotingPower = this.functionsUtil.BNify(10000).minus(votingPowerUsed).plus(oldPowerUsed).div(10000);

    votingPowerUsed = votingPowerUsed.div(10000);
    oldPowerUsed = oldPowerUsed.div(10000);

    // console.log('availableVotingPower',votingPowerUsed.toFixed(),oldPowerUsed.toFixed(),availableVotingPower);

    this.setState({
      blockInfo,
      gaugeConfig,
      lastUserVote,
      rewardsTokens,
      stakedBalance,
      veTokenBalance,
      votingPowerUsed,
      claimableTokens,
      gaugeTotalSupply,
      distributionRate,
      gaugeWorkingSupply,
      veTokenTotalSupply,
      trancheTokenBalance,
      availableVotingPower,
      gaugeWorkingBalances,
      gaugePeriodTimestamp,
      claimableRewardsTokens
    },() => {
      this.loadTokenData(true);
    });
  }

  async loadTokenData(loadGauges=false){

    if (!this.state.gaugeConfig){
      this.loadGaugeData();
    }

    const veTokenConfig = this.props.toolProps.veToken;
    const gaugeConfig = this.props.toolProps.availableGauges[this.state.selectedToken];
    const trancheTokenConfig = gaugeConfig.trancheToken;

    let canVote = true;
    let unlockDate = null;
    let balanceProp = null;
    let tokenConfig = null;
    let noFundsText = null;
    let contractInfo = null;
    let approveEnabled = true;
    let approveDescription = null;
    let balanceSelectorInfo = null;

    switch (this.state.selectedAction){
      case 'vote':
        approveEnabled = false;
        tokenConfig = veTokenConfig;
        // const veTokenBalanceUsed = this.functionsUtil.BNify(this.state.veTokenBalance).times(this.state.votingPowerUsed);
        balanceProp = this.functionsUtil.BNify(this.state.veTokenBalance).times(this.state.availableVotingPower);
        balanceSelectorInfo = {
          color:`copyColor`,
          text:`Allocated power: ${this.functionsUtil.BNify(this.state.votingPowerUsed).times(100).toFixed(2)}%`
        };
        contractInfo = this.functionsUtil.getGlobalConfig(['contracts',1,'GaugeController']);
        noFundsText = `Stake your ${this.functionsUtil.getGlobalConfig(['governance','props','tokenName'])} tokens to allocate your voting power to this Gauge and boost the daily rewards you receive.`;

        const nextUnlockTime = this.state.lastUserVote ? parseInt(this.state.lastUserVote)+this.props.toolProps.WEIGHT_VOTE_DELAY : null;
        canVote = !nextUnlockTime || this.state.blockInfo.timestamp>=nextUnlockTime;

        unlockDate = nextUnlockTime ? this.functionsUtil.strToMoment(nextUnlockTime*1000).utc().format('YYYY-MM-DD HH:mm') : null;

        // Unlock total voting balance if nextUnlockTime reached
        // if (canVote && this.state.votingPowerUsed.gte(1)){
        //   balanceProp = this.state.veTokenBalance.times(this.state.availableVotingPower);
        // }
      break;
      case 'stake':
        switch (this.state.stakeAction){
          case 'deposit':
            approveEnabled = true;
            contractInfo = gaugeConfig;
            tokenConfig = trancheTokenConfig;
            balanceProp = this.state.trancheTokenBalance;
            noFundsText = `You don't have any <strong>${tokenConfig.token}</strong> in your wallet to deposit.`;
            approveDescription = `Approve the Gauge contract to deposit your <strong>${trancheTokenConfig.token}</strong> tokens`;

            const boost = this.calculateGaugeBoost(0);
            balanceSelectorInfo = {
              color:`copyColor`,
              tooltip:this.functionsUtil.getGlobalConfig(['messages','gaugeBoost']),
              text:`Boost: <span style="color:${this.props.theme.colors.transactions.status.completed}">${boost.toFixed(2)}x</span>`,
            };
          break;
          case 'claim':
            approveEnabled = false;
            contractInfo = this.functionsUtil.getGlobalConfig(['contracts',1,'GaugeDistributor']);
          break;
          case 'withdraw':
            approveEnabled = false;
            contractInfo = gaugeConfig;
            tokenConfig = trancheTokenConfig;
            balanceProp = this.state.stakedBalance;
            noFundsText = `You don't have any <strong>${tokenConfig.token}</strong> in the Gauge contract to withdraw.`;
          break;
          default:
          break;
        }
      break;
      default:
      break;
    }

    this.setState({
      canVote,
      unlockDate,
      noFundsText,
      tokenConfig,
      gaugeConfig,
      balanceProp,
      contractInfo,
      approveEnabled,
      approveDescription,
      balanceSelectorInfo
    },() => {
      if (loadGauges || !this.state.availableGauges){
        this.loadGauges();
      }
    });
  }

  async loadEmptyGauges(){
    const availableGauges = {};
    Object.keys(this.props.toolProps.availableGauges).forEach( gaugeToken => {
      const gaugeConfig = this.props.toolProps.availableGauges[gaugeToken];
      const trancheConfig = this.props.availableTranches[gaugeConfig.protocol] ? this.props.availableTranches[gaugeConfig.protocol][gaugeToken] : null;

      if (!trancheConfig){
        return;
      }

      if (!availableGauges[gaugeConfig.protocol]){
        availableGauges[gaugeConfig.protocol] = {};
      }

      availableGauges[gaugeConfig.protocol][gaugeToken] = trancheConfig;
      availableGauges[gaugeConfig.protocol][gaugeToken].weight = null;
      availableGauges[gaugeConfig.protocol][gaugeToken].nextWeight = null;
      availableGauges[gaugeConfig.protocol][gaugeToken].totalSupply = null;
      availableGauges[gaugeConfig.protocol][gaugeToken].rewardsTokens = null;
      availableGauges[gaugeConfig.protocol][gaugeToken].stakedBalance = null;
      availableGauges[gaugeConfig.protocol][gaugeToken].claimableTokens = null;
      availableGauges[gaugeConfig.protocol][gaugeToken].distributionRate = null;
    });

    this.setState({
      availableGauges
    });
  }

  async loadGauges(){

    const gaugesOrderKeys = {};
    const availableGauges = {};
    const veTokenConfig = this.props.toolProps.veToken;
    const internal_view = this.functionsUtil.getQueryStringParameterByName('internal_view');

    await this.functionsUtil.asyncForEach(Object.keys(this.props.toolProps.availableGauges), async (gaugeToken) => {
      const gaugeConfig = this.props.toolProps.availableGauges[gaugeToken];
      if (!availableGauges[gaugeConfig.protocol]){
        availableGauges[gaugeConfig.protocol] = {};
      }

      const trancheConfig = this.props.availableTranches[gaugeConfig.protocol] ? this.props.availableTranches[gaugeConfig.protocol][gaugeToken] : null;

      if (trancheConfig){

        const liquidityGaugeContract = this.functionsUtil.getContractByName(gaugeConfig.name);
        if (!liquidityGaugeContract && gaugeConfig.abi){
          await this.props.initContract(gaugeConfig.name,gaugeConfig.address,gaugeConfig.abi);
        }

        let [
          gaugeWeight,
          gaugeNextWeight,
          gaugeTotalSupply,
          stakedBalance,
          rewardsTokens,
          gaugeWorkingSupply,
          userWorkingBalance,
          trancheTokenPrice
        ] = await Promise.all([
          this.functionsUtil.getGaugeWeight(gaugeConfig),
          this.functionsUtil.getGaugeNextWeight(gaugeConfig),
          this.functionsUtil.getTokenTotalSupply(gaugeConfig.name),
          this.functionsUtil.getTokenBalance(gaugeConfig.name,this.props.account),
          this.functionsUtil.getGaugeRewardsTokens(gaugeConfig,this.props.account),
          this.functionsUtil.genericContractCall(gaugeConfig.name,'working_supply'),
          this.functionsUtil.genericContractCall(gaugeConfig.name,'working_balances',[this.props.account]),
          this.functionsUtil.genericContractCall(trancheConfig.CDO.name, 'virtualPrice', [trancheConfig.AA.address])
        ]);

        const claimableRewardsTokens = Object.keys(rewardsTokens).reduce( (claimableRewards,token) => {
          const tokenConfig = rewardsTokens[token];
          if (tokenConfig.balance.gt(0)){
            claimableRewards[token] = this.functionsUtil.fixTokenDecimals(tokenConfig.balance,tokenConfig.decimals);
          }
          return claimableRewards;
        },{});

        let gaugeUserShare = null;
        let userBoostedDistribution = null;
        gaugeWeight = this.functionsUtil.fixTokenDecimals(gaugeWeight,18);
        gaugeNextWeight = this.functionsUtil.fixTokenDecimals(gaugeNextWeight,18);
        gaugeTotalSupply = this.functionsUtil.fixTokenDecimals(gaugeTotalSupply,18);
        trancheTokenPrice = this.functionsUtil.fixTokenDecimals(trancheTokenPrice,18);
        const gaugeDistributionRate = this.state.distributionRate.times(gaugeWeight);

        // Calculate IDLE apr for internal view
        const gaugeDistributionRatePerSecond = gaugeDistributionRate.div(this.functionsUtil.getGlobalConfig(['network','secondsPerDay']));
        const gaugeUnderlyingTokenConfig = this.functionsUtil.getTokenConfig(gaugeToken);
        const gaugeTotalSupplyUnderlying = gaugeTotalSupply.times(trancheTokenPrice);
        const idleApr = internal_view ? await this.functionsUtil.getGovTokenApr(veTokenConfig.rewardToken,gaugeUnderlyingTokenConfig,gaugeTotalSupplyUnderlying,gaugeDistributionRatePerSecond) : null;

        if (this.props.account){
          gaugeUserShare = this.functionsUtil.BNify(stakedBalance).div(gaugeTotalSupply);

          const userBoostedShare = this.functionsUtil.BNify(userWorkingBalance).div(gaugeWorkingSupply);
          userBoostedDistribution = gaugeDistributionRate.times(userBoostedShare);
          if (userBoostedDistribution.gt(gaugeDistributionRate)){
            userBoostedDistribution = gaugeDistributionRate;
          }
        } else {
          stakedBalance = '-';
        }

        const claimableTokens = Object.keys(claimableRewardsTokens).length ? Object.keys(claimableRewardsTokens).map( token => {
          const tokenBalance = claimableRewardsTokens[token];
          let text = `${tokenBalance.toFixed(3)} ${token}`;
          if (this.props.account){
            if (!this.functionsUtil.BNify(userBoostedDistribution).isNaN() && token.toLowerCase() === veTokenConfig.rewardToken.toLowerCase()){
              text += ` (${userBoostedDistribution.toFixed(3)}/day)`;
            } else if (rewardsTokens[token].rate){
              let userDistributionRate = rewardsTokens[token].rate.times(gaugeUserShare);
              if (userDistributionRate.gt(rewardsTokens[token].rate)){
                userDistributionRate = rewardsTokens[token].rate;
              }
              text += ` (${userDistributionRate.toFixed(3)}/day)`;
            }
          }
          return text;
        }).join('<br />') : '-';

        const distributionRate = Object.keys(rewardsTokens).length ? Object.keys(rewardsTokens).map( token => {
          if (token.toLowerCase() === veTokenConfig.rewardToken.toLowerCase()){
            let text = `${gaugeDistributionRate.toFixed(3)} ${token}/day`;
            if (idleApr){
              let idleApy = idleApr.apy.toFixed(2);
              if (parseFloat(idleApy)>9999){
                idleApy = '>9999';
              }
              text += ` (${idleApy}% APY)`;
            }
            return text;
          } else {
            const tokenApy = rewardsTokens[token].apy;
            const tokenDistributionRate = rewardsTokens[token].rate;
            return `${tokenDistributionRate.toFixed(3)} ${token}/day (${tokenApy.toFixed(2)}% APY)`;
          }
        }).join('<br />') : '-';

        availableGauges[gaugeConfig.protocol][gaugeToken] = trancheConfig;
        availableGauges[gaugeConfig.protocol][gaugeToken].rewardsTokens = rewardsTokens;
        availableGauges[gaugeConfig.protocol][gaugeToken].stakedBalance = stakedBalance;
        availableGauges[gaugeConfig.protocol][gaugeToken].totalSupply = gaugeTotalSupply;
        availableGauges[gaugeConfig.protocol][gaugeToken].claimableTokens = claimableTokens;
        availableGauges[gaugeConfig.protocol][gaugeToken].distributionRate = distributionRate;
        availableGauges[gaugeConfig.protocol][gaugeToken].weight = gaugeWeight.times(100).toFixed(2)+'%';
        availableGauges[gaugeConfig.protocol][gaugeToken].nextWeight = gaugeNextWeight.times(100).toFixed(2)+'%';

        gaugesOrderKeys[`${gaugeWeight.times(100).toFixed(2)}_${gaugeConfig.protocol}_${gaugeToken}`] = {
          gaugeToken,
          gaugeConfig
        };
      }
    });

    const gaugesOrderedKeys = Object.keys(gaugesOrderKeys).sort().reverse().reduce(
      (obj, key) => { 
        obj[key] = gaugesOrderKeys[key]; 
        return obj;
      }, 
      {}
    );


    const availableGaugesSorted = {};
    Object.values(gaugesOrderedKeys).forEach( g => {
      if (!availableGaugesSorted[g.gaugeConfig.protocol]){
        availableGaugesSorted[g.gaugeConfig.protocol] = {};
      }
      availableGaugesSorted[g.gaugeConfig.protocol][g.gaugeToken] = availableGauges[g.gaugeConfig.protocol][g.gaugeToken];
    });

    // console.log('availableGauges',availableGaugesSorted,gaugesOrderedKeys);
    this.setState({
      availableGauges:availableGaugesSorted
    });
  }

  selectToken(selectedToken){
    this.setState({
      selectedToken
    });
  }

  setClaimToken(claimToken){
    if (claimToken !== this.state.claimToken){
      this.setState({
        claimToken,
        claimSucceded:null
      });
    }
  }

  setSelectedAction(selectedAction){
    if (selectedAction !== this.state.selectedAction){
      const infoBox = null;
      const inputValue = null;
      this.setState({
        infoBox,
        inputValue,
        selectedAction
      });
    }
  }

  setStakeAction(stakeAction){
    if (stakeAction !== this.state.stakeAction){
      this.setState({
        stakeAction
      });
    }
  }

  async transactionSucceeded(tx,amount,params){

    let infoBox = null;
    let claimText = null;
    let claimSucceded = false;

    switch (this.state.selectedAction){
      case 'vote':
        const votingWeight = this.functionsUtil.BNify(params.methodParams[1]).div(100).toFixed(2);
        infoBox = {
          icon:'DoneAll',
          iconProps:{
            color:this.props.theme.colors.transactions.status.completed
          },
          text:`You have successfully allocated <strong>${votingWeight}%</strong> of your voting power to this Gauge`
        };
      break;
      case 'stake':
        switch (this.state.stakeAction){
          case 'deposit':
            const depositedAmount = this.functionsUtil.fixTokenDecimals(params.methodParams[0],18);
            infoBox = {
              icon:'DoneAll',
              iconProps:{
                color:this.props.theme.colors.transactions.status.completed
              },
              text:`You have successfully deposited <strong>${depositedAmount.toFixed(4)} ${this.state.tokenConfig.token}</strong> in the Gauge.`
            };
          break;
          case 'claim':
            claimSucceded = true;
            switch (this.state.claimToken){
              case 'additional':
                claimText = `You have successfully claimed your additional rewards.`;
              break;
              default:
              case 'default':
                claimText = `You have successfully claimed <strong>${this.state.claimableTokens.toFixed(8)} IDLE</strong>.`;
              break;
            }
          break;
          case 'withdraw':
            const withdrawnAmount = this.functionsUtil.fixTokenDecimals(params.methodParams[0],18);
            infoBox = {
              icon:'DoneAll',
              iconProps:{
                color:this.props.theme.colors.transactions.status.completed
              },
              text:`You have successfully withdrawn <strong>${withdrawnAmount.toFixed(4)} ${this.state.tokenConfig.token}</strong> from the Gauge.`
            };
          break;
          default:
          break;
        }
      break;
      default:
      break;
    }

    this.setState({
      infoBox,
      claimText,
      claimSucceded
    },() => {
      this.loadGaugeData();
    });
  }

  async changeInputCallback(inputValue=null){
    let infoBox = null;
    let votingWeight = null;
    let allowZeroValue = false;
    let balanceSelectorInfo = {...this.state.balanceSelectorInfo};

    inputValue = this.functionsUtil.BNify(inputValue);
    switch (this.state.selectedAction){
      case 'vote':
        allowZeroValue = true;
        if (inputValue.gt(0)){
          const votingPowerPercentage = this.state.veTokenBalance.gt(0) ? inputValue.div(this.state.veTokenBalance).times(100).toFixed(2) : this.functionsUtil.BNify(0);
          votingWeight = this.state.veTokenBalance.gt(0) ? this.functionsUtil.integerValue(inputValue.div(this.state.veTokenBalance).times(10000)) : this.functionsUtil.BNify(0);
          infoBox = {
            icon:'Info',
            text:`You are allocating <strong>${votingPowerPercentage}%</strong> of your voting power to this Gauge`
          };
        } else {
          infoBox = {
            icon:'Info',
            text:`You are about to reset your voting power for this Gauge`
          };
        }
      break;
      case 'stake':
        switch (this.state.stakeAction){
          case 'deposit':
            const boost = this.calculateGaugeBoost(inputValue);
            balanceSelectorInfo = {
              color:`copyColor`,
              tooltip:this.functionsUtil.getGlobalConfig(['messages','gaugeBoost']),
              text:`Boost: <span style="color:${this.props.theme.colors.transactions.status.completed}">${boost.toFixed(2)}x</span>`,
            };
          break;
          default:
          break;
        }
      break;
      default:
      break;
    }

    this.setState({
      infoBox,
      inputValue,
      votingWeight,
      allowZeroValue,
      balanceSelectorInfo
    });
  }

  getTransactionParams(amount){
    let methodName = null;
    let methodParams = [];
    const gaugeAddress = this.props.toolProps.availableGauges[this.state.selectedToken].address;
    switch (this.state.selectedAction){
      case 'vote':
        methodName = 'vote_for_gauge_weights';
        methodParams = [gaugeAddress,this.state.votingWeight];
      break;
      case 'stake':
        const amount = this.functionsUtil.normalizeTokenAmount(this.state.inputValue,18);
        switch (this.state.stakeAction){
          case 'deposit':
            methodName = 'deposit';
            methodParams = [amount];
          break;
          case 'withdraw':
            methodName = 'withdraw';
            methodParams = [amount];
          break;
          default:
          break;
        }
      break;
      default:
      break;
    }

    // console.log('getTransactionParams',methodName,methodParams);

    return {
      methodName,
      methodParams
    };
  }

  render() {

    return (
      <Flex
        width={1}
        alignItems={'center'}
        flexDirection={'column'}
        justifyContent={'center'}
      >
        <Flex
          width={[1, '35em']}
          alignItems={'stretch'}
          flexDirection={'column'}
          justifyContent={'center'}
        >
          <Box
            width={1}
          >
            <Text mb={1}>
              Select Gauge:
            </Text>
            <AssetSelector
              {...this.props}
              onChange={this.selectToken.bind(this)}
              selectedToken={this.state.selectedToken}
              availableTokens={this.state.availableTokens}
            />
          </Box>
          {
            !this.state.gaugeConfig ? (
              <FlexLoader
                flexProps={{
                  mt:3,
                  flexDirection: 'row'
                }}
                loaderProps={{
                  size: '30px'
                }}
                textProps={{
                  ml: 2
                }}
                text={'Loading Gauge info...'}
              />
            ) : (
              <Box
                width={1}
              >
                <Box
                  mt={1}
                  mb={2}
                  width={1}
                >
                  <Text
                    mb={1}
                  >
                    Choose action:
                  </Text>
                  <Flex
                    alignItems={'center'}
                    flexDirection={'row'}
                    justifyContent={'space-between'}
                  >
                    <CardIconButton
                      {...this.props}
                      cardProps={{
                        px:3,
                        py:2,
                        width:0.49
                      }}
                      textProps={{
                        fontSize:[1,2]
                      }}
                      text={'Vote'}
                      iconColor={'redeem'}
                      iconBgColor={'#3f5fff'}
                      image={'images/vote.svg'}
                      isActive={ this.state.selectedAction === 'vote' }
                      handleClick={ e => this.setSelectedAction('vote') }
                    />
                    <CardIconButton
                      {...this.props}
                      cardProps={{
                        px:3,
                        py:2,
                        width:0.49
                      }}
                      textProps={{
                        fontSize:[1,2]
                      }}
                      text={'Stake'}
                      icon={'Layers'}
                      iconColor={'deposit'}
                      iconBgColor={'#ced6ff'}
                      isActive={ this.state.selectedAction === 'stake' }
                      handleClick={ e => this.setSelectedAction('stake') }
                    />
                  </Flex>
                </Box>
                {
                  this.state.selectedAction === 'stake' && (
                    <Box
                      mb={2}
                      width={1}
                    >
                      <Text mb={1}>
                        Choose stake action:
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
                            width:0.32
                          }}
                          text={'Deposit'}
                          iconColor={'deposit'}
                          icon={'ArrowDownward'}
                          iconBgColor={'#ced6ff'}
                          isActive={ this.state.stakeAction === 'deposit' }
                          handleClick={ e => this.setStakeAction('deposit') }
                        />
                        <CardIconButton
                          {...this.props}
                          textProps={{
                            fontSize:[1,2]
                          }}
                          cardProps={{
                            px:3,
                            py:2,
                            width:0.32
                          }}
                          text={'Claim'}
                          iconColor={'#dd0000'}
                          icon={'CardGiftcard'}
                          iconBgColor={'#ffd979'}
                          isActive={ this.state.stakeAction === 'claim' }
                          handleClick={ e => this.setStakeAction('claim') }
                        />
                        <CardIconButton
                          {...this.props}
                          textProps={{
                            fontSize:[1,2]
                          }}
                          cardProps={{
                            px:3,
                            py:2,
                            width:0.32
                          }}
                          text={'Withdraw'}
                          icon={'ArrowUpward'}
                          iconColor={'redeem'}
                          iconBgColor={'#ceeff6'}
                          isActive={ this.state.stakeAction === 'withdraw' }
                          handleClick={ e => this.setStakeAction('withdraw') }
                        />
                      </Flex>
                    </Box>
                  )
                }
                {
                  this.state.selectedAction === 'stake' && this.state.stakeAction === 'claim' && this.state.rewardsTokens && Object.keys(this.state.rewardsTokens).length>1 && (
                    <Box
                      width={1}
                    >
                      <Text mb={1}>
                        Choose claim method:
                      </Text>
                      <Flex
                        alignItems={'center'}
                        flexDirection={'row'}
                        justifyContent={'space-between'}
                      >
                        <CardIconButton
                          {...this.props}
                          textProps={{
                            fontSize:[1,2],
                            fontWeight:500
                          }}
                          cardProps={{
                            px:3,
                            py:2,
                            width:0.49
                          }}
                          imageProps={{
                            mr:2,
                            width:'1.8em',
                            height:'1.8em'
                          }}
                          text={'Claim IDLE'}
                          image={'images/tokens/IDLE.svg'}
                          isActive={ this.state.claimToken === 'default' }
                          handleClick={ e => this.setClaimToken('default') }
                        />
                        <CardIconButton
                          {...this.props}
                          textProps={{
                            fontSize:[1,2],
                            fontWeight:500
                          }}
                          cardProps={{
                            px:3,
                            py:2,
                            width:0.49
                          }}
                          imageProps={{
                            mr:2,
                            width:'1.8em',
                            height:'1.8em'
                          }}
                          handleClick={ e => this.setClaimToken('additional') }
                          isActive={ this.state.claimToken === 'additional' }
                          text={`Claim ${Object.keys(this.state.rewardsTokens).splice(1).join(', ')}`}
                          image={this.functionsUtil.getTokenIcon(Object.keys(this.state.rewardsTokens)[1])}
                        />
                      </Flex>
                    </Box>
                  )
                }
                {
                  this.state.selectedAction === 'vote' && !this.state.canVote ? (
                    <IconBox
                      cardProps={{
                        mt:1
                      }}
                      icon={'DoneAll'}
                      iconProps={{
                        color:'tick'
                      }}
                      text={`Your vote has been succesfully broadcasted and will remain registered until you change it.<br />Wait until <strong>${this.state.unlockDate} UTC</strong> to update your vote for this gauge.`}
                    />
                  ) : this.state.selectedAction === 'vote' && this.functionsUtil.BNify(this.state.availableVotingPower).lte(0) ? (
                    <IconBox
                      cardProps={{
                        mt:1
                      }}
                      icon={'Info'}
                      iconProps={{
                        color:'cellText'
                      }}
                      text={`You already allocated 100% of your voting power, reduce the allocation from one of the gagues you voted for or stake more ${this.functionsUtil.getGlobalConfig(['governance','props','tokenName'])}.`}
                    >
                      <RoundButton
                        buttonProps={{
                          mt:3,
                          width:[1,1/2]
                        }}
                        handleClick={e => this.props.goToSection(`stake`)}
                      >
                        Stake {this.functionsUtil.getGlobalConfig(['governance','props','tokenName'])}
                      </RoundButton>
                    </IconBox>
                  ) : (this.state.selectedAction === 'vote' || this.state.stakeAction !== 'claim') && this.state.tokenConfig ? (
                    <SendTxWithBalance
                      error={null}
                      {...this.props}
                      permitEnabled={false}
                      infoBox={this.state.infoBox}
                      tokenConfig={this.state.tokenConfig}
                      tokenBalance={this.state.balanceProp}
                      contractInfo={this.state.contractInfo}
                      allowZeroValue={this.state.allowZeroValue}
                      approveEnabled={this.state.approveEnabled}
                      buttonDisabled={this.state.buttonDisabled}
                      callback={this.transactionSucceeded.bind(this)}
                      approveDescription={this.state.approveDescription}
                      balanceSelectorInfo={this.state.balanceSelectorInfo}
                      changeInputCallback={this.changeInputCallback.bind(this)}
                      getTransactionParams={this.getTransactionParams.bind(this)}
                      action={this.state.selectedAction === 'vote' ? 'Vote' : this.functionsUtil.capitalize(this.state.stakeAction)}
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
                            size={this.props.isMobile ? '1.8em' : '2.1em'}
                          />
                          <Text
                            mt={1}
                            fontSize={2}
                            color={'cellText'}
                            textAlign={'center'}
                            dangerouslySetInnerHTML={{
                              __html:this.state.noFundsText
                            }}
                          />
                          {
                            this.state.selectedAction === 'vote' && (
                              <RoundButton
                                buttonProps={{
                                  mt:3,
                                  width:[1,1/2]
                                }}
                                handleClick={e => this.props.goToSection(`stake`)}
                              >
                                Stake {this.functionsUtil.getGlobalConfig(['governance','props','tokenName'])}
                              </RoundButton>
                            )
                          }
                        </Flex>
                      </DashboardCard>
                    </SendTxWithBalance>
                  ) : this.state.stakeAction === 'claim' &&
                    this.state.claimSucceded ? (
                      <IconBox
                        cardProps={{
                          mt:2
                        }}
                        icon={'DoneAll'}
                        text={this.state.claimText}
                        iconProps={{
                          size:this.props.isMobile ? '1.8em' : '2.1em',
                          color:this.props.theme.colors.transactions.status.completed
                        }}
                      />
                    ) : this.state.claimToken === 'default' ?
                      !this.props.account ? (
                        <ConnectBox
                          {...this.props}
                        />
                      ) : (this.state.claimableTokens && this.state.claimableTokens.gt(0)) ? (
                        <Flex
                          mt={2}
                          width={1}
                          flexDirection={'column'}
                        >
                          <DashboardCard
                            cardProps={{
                              p:3,
                              mb:1
                            }}
                          >
                            <Flex
                              alignItems={'center'}
                              flexDirection={'column'}
                            >
                              <Icon
                                color={'cellText'}
                                name={'MonetizationOn'}
                                size={this.props.isMobile ? '1.8em' : '2.1em'}
                              />
                              <Text
                                mt={1}
                                mb={3}
                                fontSize={[2,3]}
                                color={'cellText'}
                                textAlign={'center'}
                              >
                                You can claim <strong>{this.state.claimableTokens.toFixed(8)} IDLE</strong>.
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
                                methodName={'distribute'}
                                contractName={'GaugeDistributorProxy'}
                                callback={this.transactionSucceeded.bind(this)}
                                getTransactionParams={ e => [this.props.toolProps.availableGauges[this.state.selectedToken].address] }
                              />
                            </Flex>
                          </DashboardCard>
                        </Flex>
                      ) : (
                        <IconBox
                          cardProps={{
                            mt:2
                          }}
                          icon={'MoneyOff'}
                          iconProps={{
                            size:this.props.isMobile ? '1.8em' : '2.1em'
                          }}
                          text={`You don't have any IDLE to claim for this Gauge.`}
                        />
                      )
                    : this.state.claimToken === 'additional' &&
                      !this.props.account ? (
                        <ConnectBox
                          {...this.props}
                        />
                      ) : (this.state.claimableRewardsTokens && Object.keys(this.state.claimableRewardsTokens).length>0) ? (
                        <Flex
                          mt={2}
                          width={1}
                          flexDirection={'column'}
                        >
                          <DashboardCard
                            cardProps={{
                              p:3,
                              mb:1
                            }}
                          >
                            <Flex
                              alignItems={'center'}
                              flexDirection={'column'}
                            >
                              <Icon
                                color={'cellText'}
                                name={'MonetizationOn'}
                                size={this.props.isMobile ? '1.8em' : '2.1em'}
                              />
                              <Text
                                mt={1}
                                mb={3}
                                fontSize={[2,3]}
                                color={'cellText'}
                                textAlign={'center'}
                              >
                                You can claim {Object.keys(this.state.claimableRewardsTokens).map( (token,index) => (<strong key={`reward_${index}`}>{this.state.claimableRewardsTokens[token].toFixed(8)} {token}</strong>) )}.
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
                                methodName={'claim_rewards'}
                                contractName={this.state.gaugeConfig.name}
                                callback={this.transactionSucceeded.bind(this)}
                              />
                            </Flex>
                          </DashboardCard>
                        </Flex>
                      ) : (
                        <IconBox
                          cardProps={{
                            mt:2
                          }}
                          icon={'MoneyOff'}
                          iconProps={{
                            size:this.props.isMobile ? '1.8em' : '2.1em'
                          }}
                          text={`You don't have any additional reward to claim for this Gauge.`}
                        />
                      )
                }
              </Box>
            )
          }
        </Flex>
        {
          this.state.availableGauges && (
            <Flex
              mt={3}
              width={1}
              mb={[3,4]}
              flexDirection={'column'}
            >
              <Flex
                pb={2}
                width={1}
                mb={[2,3]}
                borderColor={'divider'}
                borderBottom={'1px solid transparent'}
              >
                <Heading.h4
                  fontSize={[2,4]}
                  fontWeight={[3,4]}
                >
                  Available Gauges
                </Heading.h4>
              </Flex>
              <TranchesList
                handleClick={null}
                enabledProtocols={[]}
                colsProps={{
                  fontSize:['10px','14px'],
                }}
                cols={[
                  {
                    title:'PROTOCOL', 
                    props:{
                      width:[0.35, 0.11]
                    },
                    fields:[
                      {
                        name:'protocolIcon',
                        props:{
                          mr:2,
                          height:['1.4em','2em']
                        }
                      },
                      {
                        name:'protocolName'
                      },
                      {
                        mobile:false,
                        name:'experimentalBadge',
                        props:{
                          ml:1,
                          height:'1.5em'
                        }
                      }
                    ]
                  },
                  {
                    title:'TOKEN',
                    props:{
                      width:[0.16, 0.13],
                    },
                    fields:[
                      {
                        name:'tokenIcon',
                        props:{
                          mr:2,
                          height:['1.4em','2em']
                        }
                      },
                      {
                        mobile:false,
                        name:'tokenName'
                      }
                    ]
                  },
                  {
                    mobile:false,
                    title:'WEIGHT',
                    props:{
                      width:[0.25,0.07],
                    },
                    fields:[
                      {
                        type:'text',
                        name:'custom',
                        showLoader:true,
                        path:['tokenConfig','weight']
                      }
                    ]
                  },
                  {
                    mobile:false,
                    title:'NEXT WEIGHT',
                    props:{
                      width:[0.25,0.09],
                    },
                    fields:[
                      {
                        type:'text',
                        name:'custom',
                        showLoader:true,
                        path:['tokenConfig','nextWeight']
                      }
                    ]
                  },
                  {
                    title:'TOTAL SUPPLY',
                    props:{
                      width:[0.26, 0.1],
                    },
                    fields:[
                      {
                        type:'number',
                        name:'custom',
                        showLoader:true,
                        path:['tokenConfig','totalSupply'],
                        props:{
                          minPrecision:1,
                          flexProps:{
                            justifyContent:'flex-start'
                          },
                          decimals:this.props.isMobile ? 2 : 4
                        }
                      }
                    ]
                  },
                  /*
                  {
                    title:'SENIOR APY',
                    desc:this.functionsUtil.getGlobalConfig(['messages','apyTranches']),
                    props:{
                      width:[0.27,0.14],
                    },
                    parentProps:{
                      flexDirection:'column',
                      alignItems:'flex-start',
                    },
                    fields:[
                      {
                        name:'seniorApy',
                        showTooltip:true
                      },
                    ],
                  },
                  */
                  {
                    mobile:false,
                    title:'DEPOSITED',
                    props:{
                      width:[0.27,0.08],
                    },
                    fields:[
                      {
                        type:'number',
                        name:'custom',
                        showLoader:true,
                        path:['tokenConfig','stakedBalance'],
                        props:{
                          minPrecision:1,
                          flexProps:{
                            justifyContent:'flex-start'
                          },
                          decimals:this.props.isMobile ? 2 : 4
                        }
                      },
                    ],
                  },
                  {
                    title:'REWARDS',
                    props:{
                      width:[0.23, 0.07],
                    },
                    fields:[
                      {
                        name:'custom',
                        showLoader:true,
                        type:'tokensList',
                        path:['tokenConfig','rewardsTokens'],
                        props:{
                          
                        }
                      }
                    ]
                  },
                  {
                    mobile:false,
                    title:'DISTRIBUTION RATE',
                    props:{
                      width:[0.15, 0.19],
                    },
                    fields:[
                      {
                        type:'html',
                        name:'custom',
                        showLoader:true,
                        props:{
                          fontSize:1,
                          lineHeight:1.3,
                        },
                        path:['tokenConfig','distributionRate'],
                      }
                    ]
                  },
                  {
                    mobile:false,
                    title:'CLAIMABLE REWARDS',
                    props:{
                      width:[0.25,0.16],
                    },
                    fields:[
                      {
                        type:'html',
                        showLoader:true,
                        props:{
                          fontSize:1,
                          lineHeight:1.3,
                        },
                        name:'custom',
                        path:['tokenConfig','claimableTokens']
                      }
                    ]
                  },
                ]}
                {...this.props}
                availableTranches={this.state.availableGauges}
              />
            </Flex>
          )
        }
      </Flex>
    );
  }
}

export default Gauges;
