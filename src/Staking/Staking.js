import ExtLink from '../ExtLink/ExtLink';
import React, { Component } from 'react';
import FlexLoader from '../FlexLoader/FlexLoader';
import AssetField from '../AssetField/AssetField';
import { Flex, Box, Text, Icon } from "rimble-ui";
import ImageButton from '../ImageButton/ImageButton';
import FunctionsUtil from '../utilities/FunctionsUtil';
// import TokenWrapper from '../TokenWrapper/TokenWrapper';
import DashboardCard from '../DashboardCard/DashboardCard';
import GenericSelector from '../GenericSelector/GenericSelector';
import SendTxWithBalance from '../SendTxWithBalance/SendTxWithBalance';

class Staking extends Component {

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
    stakedBalance:null,
    selectedToken:null,
    rewardMultiplier:1,
    accountingData:null,
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
    transactionSucceeded:false
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

  async componentDidMount(){
    this.loadUtils();
    this.loadData();
  }

  async componentDidUpdate(prevProps,prevState){
    this.loadUtils();

    const selectedTokenChanged = prevState.selectedToken !== this.state.selectedToken;
    if (selectedTokenChanged){
      const tokenConfig = this.props.toolProps.availableTokens[this.state.selectedToken];
      const contractInfo = tokenConfig.contract;

      // Init contracts
      await Promise.all([
        this.props.initContract(contractInfo.name,contractInfo.address,contractInfo.abi),
        this.props.initContract(this.state.selectedToken,tokenConfig.address,tokenConfig.abi)
      ]);

      this.setState({
        tokenConfig,
        contractInfo
      },() => {
        this.updateData();
      });
    } else {
      const selectedActionChanged = prevState.selectedAction !== this.state.selectedAction;
      const contractApprovedChanged = prevState.contractApproved !== this.state.contractApproved;
      if (selectedActionChanged || contractApprovedChanged){
        this.setState({
          tokenWrapperProps:null,
          showTokenWrapperEnabled:false
        },() => {
          this.updateData(selectedActionChanged);
        });
      }
    }


    const contractInfoChanged = JSON.stringify(prevState.contractInfo) !== JSON.stringify(this.state.contractInfo);
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
          const userStakedBalance = this.functionsUtil.fixTokenDecimals(this.state.stakedBalance,this.state.tokenConfig.decimals).plus(inputValue);
          const totalStakedBalance = this.functionsUtil.fixTokenDecimals(this.state.totalStakingShares,this.state.contractInfo.decimals).plus(inputValue);
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
            text:`By staking <strong>${inputValue.toFixed(4)} ${this.state.tokenConfig.token}</strong> you will get <strong>${rewardsPerDay.toFixed(4)} ${this.state.contractInfo.rewardToken} / day</strong> with an average APY of <strong>${apy.toFixed(2)}%</strong><br /><small style="color:#ff9900">assuming you have achieved the maximum reward multiplier</small>`
          };
        break;
        case 'Withdraw':
          const normalizedInputValue = this.functionsUtil.normalizeTokenAmount(inputValue,this.state.tokenConfig.decimals);
          let unstakeRewards = await this.functionsUtil.genericContractCall(this.state.contractInfo.name,'unstakeQuery',[normalizedInputValue],{from:this.props.account});
          unstakeRewards = this.functionsUtil.formatMoney(this.functionsUtil.fixTokenDecimals(unstakeRewards,this.state.tokenConfig.decimals));
          infoBox = {
            icon:'FileUpload',
            iconProps:{
              color:this.props.theme.colors.transactions.status.completed
            },
            text:`By unstaking <strong>${inputValue.toFixed(4)} ${this.state.tokenConfig.token}</strong> you will get <strong>${unstakeRewards} ${this.state.contractInfo.rewardToken}</strong>`
          };
        break;
        default:
        break;
      }
    }

    this.setState({
      infoBox
    });
    /*
    let balanceSelectorInfo = null;
    inputValue = inputValue || this.state.inputValue;

    if (inputValue && this.functionsUtil.BNify(inputValue).gt(0)){
      switch (this.state.selectedAction){
        case 'Stake':
        break;
        case 'Withdraw':
        break;
        default:
        break;
      }
    }

    this.setState({
      inputValue,
      balanceSelectorInfo
    });
    */
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

  async contractApproved(contractApproved){
    this.setState({
      contractApproved
    });
  }

  async transactionSucceeded(tx,amount,params){
    // console.log('transactionSucceeded',tx);
    let infoBox = null;
    switch (this.state.selectedAction){
      case 'Stake':
        const stakedTokensLog = tx.txReceipt && tx.txReceipt.logs ? tx.txReceipt.logs.find( log => log.address.toLowerCase() === this.state.tokenConfig.address.toLowerCase() && log.topics.find( t => t.toLowerCase().includes(this.state.contractInfo.address.replace('0x','').toLowerCase()) ) && log.topics.find( t => t.toLowerCase().includes(this.props.account.replace('0x','').toLowerCase()) ) && log.data.toLowerCase()!=='0xffffffffffffffffffffffffffffffffffffffffffffffffffffffffffffffff'.toLowerCase() ) : null;
        const stakedTokens = stakedTokensLog ? this.functionsUtil.fixTokenDecimals(parseInt(stakedTokensLog.data,16),this.state.tokenConfig.decimals) : this.functionsUtil.BNify(0);
        infoBox = {
          icon:'DoneAll',
          iconProps:{
            color:this.props.theme.colors.transactions.status.completed
          },
          text:`You have successfully staked <strong>${stakedTokens.toFixed(4)} ${this.state.selectedToken}</strong>`
        }
      break;
      case 'Withdraw':
        const unstakedTokensLog = tx.txReceipt && tx.txReceipt.logs ? tx.txReceipt.logs.find( log => log.address.toLowerCase() === this.state.tokenConfig.address.toLowerCase() ) : null;
        const unstakedTokens = unstakedTokensLog ? this.functionsUtil.fixTokenDecimals(parseInt(unstakedTokensLog.data,16),this.state.tokenConfig.decimals) : this.functionsUtil.BNify(0);
        const rewardTokenConfig = this.functionsUtil.getGlobalConfig(['govTokens',this.state.contractInfo.rewardToken]);
        const receivedRewardsLog = tx.txReceipt && tx.txReceipt.logs ? tx.txReceipt.logs.find( log => (log.address.toLowerCase() === rewardTokenConfig.address.toLowerCase() && log.topics.find( t => t.toLowerCase().includes(this.props.account.replace('0x','').toLowerCase()) )) ) : null;
        const receivedRewards = receivedRewardsLog ? this.functionsUtil.fixTokenDecimals(parseInt(receivedRewardsLog.data,16),this.state.tokenConfig.decimals) : this.functionsUtil.BNify(0);
        infoBox = {
          icon:'DoneAll',
          iconProps:{
            color:this.props.theme.colors.transactions.status.completed
          },
          text:`You have successfully withdrawn <strong>${unstakedTokens.toFixed(4)} ${this.state.selectedToken}</strong> and received <strong>${receivedRewards.toFixed(4)} ${this.state.contractInfo.rewardToken}</strong>`
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
    const rewardTokenConfig = this.functionsUtil.getGlobalConfig(['stats','tokens',this.state.contractInfo.rewardToken]);

    const [
      poolTokenPrice,
      rewardTokenPrice,
      tokenBalance,
      stakedBalance,
    ] = await Promise.all([
      this.functionsUtil.getSushiswapPoolTokenPrice(this.state.selectedToken),
      this.functionsUtil.getSushiswapConversionRate(DAITokenConfig,rewardTokenConfig),
      this.functionsUtil.getTokenBalance(this.state.selectedToken,this.props.account),
      this.functionsUtil.genericContractCall(this.state.contractInfo.name,'totalStakedFor',[this.props.account]),
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
            ...this.state.tokenConfig
          },
        };
      break;
      case 'Withdraw':
        newState.permitEnabled = false;
        newState.approveEnabled = false;
        newState.approveDescription = '';
        newState.balanceProp = this.functionsUtil.fixTokenDecimals(newState.stakedBalance,this.state.tokenConfig.decimals);
        newState.tokenWrapperProps = {
          startContract:{
            name:'ETH',
            token:'ETH',
            decimals:18,
            wrapMethod:'deposit',
          },
          destContract:{
            unwrapMethod:'withdraw',
            ...this.state.tokenConfig
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

  async loadData(){
    const availableTokens = Object.keys(this.props.toolProps.availableTokens).reduce( (output,token) => {
      const tokenConfig = this.props.toolProps.availableTokens[token];
      if (tokenConfig.enabled){
        output.push({
          value:token,
          ...tokenConfig
        });
      }
      return output;
    },[]);

    const selectedAction = 'Stake';
    const selectedOption = availableTokens[0];
    const selectedToken = selectedOption.value;

    this.setState({
      selectedToken,
      selectedOption,
      selectedAction,
      availableTokens
    });
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
      this.functionsUtil.genericContractCall(this.state.contractInfo.name,'totalLocked'),
      this.functionsUtil.genericContractCall(this.state.contractInfo.name,'totalUnlocked'),
      this.functionsUtil.genericContractCall(this.state.contractInfo.name,'totalStakingShares'),
      this.functionsUtil.genericContractCall(this.state.contractInfo.name,'unlockScheduleCount'),
      this.functionsUtil.genericContractCall(this.state.contractInfo.name,'updateAccounting',[],{from:this.props.account}),
      this.state.stakedBalance.gt(0) ? this.functionsUtil.genericContractCall(this.state.contractInfo.name,'unstakeQuery',[this.functionsUtil.integerValue(this.state.stakedBalance)],{from:this.props.account}) : this.functionsUtil.BNify(0)
    ]);

    const unlockSchedulesPromises = [];
    for (let i = 0; i < unlockScheduleCount ; i++){
      unlockSchedulesPromises.push(this.functionsUtil.genericContractCall(this.state.contractInfo.name,'unlockSchedules',[i]));
    }

    const unlockSchedules = await Promise.all(unlockSchedulesPromises);

    const totalRewards = this.functionsUtil.fixTokenDecimals(this.functionsUtil.BNify(totalLocked).plus(this.functionsUtil.BNify(totalUnlocked)),this.state.tokenConfig.decimals);
    stats.push({
      title:'Total Rewards',
      value:this.functionsUtil.formatMoney(parseFloat(totalRewards))+' '+this.state.contractInfo.rewardToken
    });

    const totalDeposits = this.functionsUtil.fixTokenDecimals(totalStakingShares,this.state.contractInfo.decimals);
    stats.push({
      title:'Total Deposits',
      value:this.functionsUtil.formatMoney(parseFloat(totalDeposits))+' '+this.state.tokenConfig.token
    });

    const lockedRewards = this.functionsUtil.fixTokenDecimals(totalLocked,this.state.tokenConfig.decimals);
    stats.push({
      title:'Locked Rewards',
      value:this.functionsUtil.formatMoney(parseFloat(lockedRewards))+' '+this.state.contractInfo.rewardToken
    });

    const unlockedRewards = this.functionsUtil.fixTokenDecimals(totalUnlocked,this.state.tokenConfig.decimals);
    stats.push({
      title:'Unlocked Rewards',
      value:this.functionsUtil.formatMoney(parseFloat(unlockedRewards))+' '+this.state.contractInfo.rewardToken
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
        const tokensPerSecond = this.functionsUtil.fixTokenDecimals(s.initialLockedShares,this.state.contractInfo.decimals).div(s.durationSec);
        if (!tokensPerSecond.isNaN()){
          distributionSpeed = distributionSpeed.plus(tokensPerSecond);
        }
      }
      return distributionSpeed;
    },this.functionsUtil.BNify(0));

    stats.push({
      title:'Reward unlock rate',
      value:this.functionsUtil.formatMoney(distributionSpeed.times(86400))+' '+this.state.contractInfo.rewardToken+' / day'
    });

    const globalStats = [];

    const stakedBalance = this.functionsUtil.fixTokenDecimals(this.state.stakedBalance,this.state.tokenConfig.decimals);
    const stakingShare = stakedBalance.div(totalDeposits); // accountingData && accountingData[2] && this.functionsUtil.BNify(accountingData[3]).gt(0) ? this.functionsUtil.BNify(accountingData[2]).div(this.functionsUtil.BNify(accountingData[3])) : this.functionsUtil.BNify(0);

    const rewardMultiplier = accountingData && this.functionsUtil.BNify(accountingData[4]).gt(0) ? this.functionsUtil.BNify(Math.max(1,parseFloat(this.functionsUtil.BNify(collectedRewards).div(this.functionsUtil.BNify(accountingData[4])).times(this.state.contractInfo.maxMultiplier)))) : this.functionsUtil.BNify(1);

    const distributionSpeedMultiplier = this.functionsUtil.BNify(1).div(this.state.contractInfo.maxMultiplier).times(rewardMultiplier);
    const userDistributionSpeed = distributionSpeed.times(stakingShare).times(distributionSpeedMultiplier);
    const rewardsPerDay = userDistributionSpeed.times(86400);

    // console.log(parseFloat(this.functionsUtil.BNify(collectedRewards)),parseFloat(this.functionsUtil.BNify(accountingData[4])),this.state.contractInfo.maxMultiplier,parseFloat(this.functionsUtil.BNify(collectedRewards).div(this.functionsUtil.BNify(accountingData[4])).times(this.state.contractInfo.maxMultiplier)),parseFloat(rewardMultiplier));

    // globalStats.push({
    //   title:'Distribution rate',
    //   description:'Your daily rewards distribution based on your current multiplier',
    //   value:this.functionsUtil.formatMoney(rewardsPerDay)+' '+this.state.contractInfo.rewardToken+' / day',
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
      value:`${rewardMultiplier}x`,
      description:`Deposit liquidity tokens for ${this.state.contractInfo.maxBonusDays} days to achieve a ${this.state.contractInfo.maxMultiplier}x reward multiplier`
    });

    const currentRewards = this.functionsUtil.formatMoney(this.functionsUtil.fixTokenDecimals(collectedRewards,this.state.tokenConfig.decimals));
    globalStats.push({
      title:'Rewards',
      value:currentRewards+' '+this.state.contractInfo.rewardToken,
      description:'Your share of the total unlocked reward pool. Larger your deposit and for longer, higher your share'
    });

    // console.log('loadStats',stats,globalStats);
    const statsLoaded = true;

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
  }

  toggleShowTokenWrapper = showTokenWrapperEnabled => {
    this.setState({
      showTokenWrapperEnabled
    });
  }

  selectToken(selectedOption){
    const selectedToken = selectedOption.value;
    this.setState({
      selectedToken,
      selectedOption
    });
  }

  setAction(selectedAction){
    this.setState({
      selectedAction
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

    const CustomOptionValue = props => {
      const label = props.label;
      const tokenConfig = {
        icon:props.data.icon
      };

      return (
        <Flex
          width={1}
          alignItems={'center'}
          flexDirection={'row'}
          justifyContent={'space-between'}
        >
          <Flex
            alignItems={'center'}
          >
            <AssetField
              token={label}
              tokenConfig={tokenConfig}
              fieldInfo={{
                name:'icon',
                props:{
                  mr:2,
                  width:'2em',
                  height:'2em'
                }
              }}
            />
            <AssetField
              token={label}
              fieldInfo={{
                name:'tokenName',
                props:{
                  fontSize:[1,2],
                  fontWeight:500,
                  color:'copyColor'
                }
              }}
            />
          </Flex>
        </Flex>
      );
    }

    const CustomValueContainer = props => {

      const options = props.selectProps.options;
      const selectProps = options.indexOf(props.selectProps.value) !== -1 ? props.selectProps.value : null;

      if (!selectProps){
        return null;
      }

      const label = selectProps.label;
      const tokenConfig = {
        icon:selectProps.icon
      };

      return (
        <Flex
          style={{
            flex:'1'
          }}
          justifyContent={'space-between'}
          {...props.innerProps}
        >
          <Flex
            p={0}
            width={1}
            {...props.innerProps}
            alignItems={'center'}
            flexDirection={'row'}
            style={{cursor:'pointer'}}
            justifyContent={'flex-start'}
          >
            <AssetField
              token={label}
              tokenConfig={tokenConfig}
              fieldInfo={{
                name:'icon',
                props:{
                  mr:2,
                  height:'2em'
                }
              }}
            />
            <AssetField
              token={label}
              fieldInfo={{
                name:'tokenName',
                props:{
                  fontSize:[1,2],
                  fontWeight:500,
                  color:'copyColor'
                }
              }}
            />
          </Flex>
        </Flex>
      );
    }

    return (
      <Flex
        width={1}
        alignItems={'center'}
        flexDirection={'column'}
        justifyContent={'center'}
      >
        {
          !this.state.availableTokens ? (
            <Flex
              mt={4}
              flexDirection={'column'}
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
                text={'Loading tokens...'}
              />
            </Flex>
          ) : (
            <Flex
              width={1}
              alignItems={'center'}
              justifyContent={'center'}
            >
              {
                !this.state.availableTokens.length ? (
                  <Text
                    fontWeight={2}
                    fontSize={[2,3]}
                    color={'dark-gray'}
                    textAlign={'center'}
                  >
                    There are no active tokens.
                  </Text>
                ) : (
                  <Flex
                    width={[1,0.46]}
                    alignItems={'stretch'}
                    flexDirection={'column'}
                    justifyContent={'center'}
                  >
                    <Box
                      width={1}
                    >
                      <Text
                        mb={1}
                      >
                        Select Token:
                      </Text>
                      <GenericSelector
                        {...this.props}
                        name={'tokens'}
                        isSearchable={false}
                        options={this.state.availableTokens}
                        CustomOptionValue={CustomOptionValue}
                        onChange={this.selectToken.bind(this)}
                        defaultValue={this.state.selectedOption}
                        CustomValueContainer={CustomValueContainer}
                      />
                    </Box>
                    {
                      this.state.tokenConfig && this.state.tokenConfig.poolLink && (
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
                            href={this.state.tokenConfig.poolLink}
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
                              {this.state.tokenConfig.poolLink}
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
                      this.state.selectedToken && (
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
                            /*
                            this.state.tokenWrapperProps && (
                              <Flex
                                mt={1}
                                width={1}
                                alignItems={'center'}
                                flexDirection={'column'}
                                justifyContent={'center'}
                                mb={this.state.showTokenWrapperEnabled ? 0 : 3}
                              >
                                <DashboardCard
                                  cardProps={{
                                    py:3,
                                    px:2,
                                    pb:2,
                                    display:'flex',
                                    alignItems:'center',
                                    flexDirection:'column',
                                    justifyContent:'center',
                                  }}
                                >
                                  <Flex
                                    alignItems={'center'}
                                    justifyContent={'row'}
                                  >
                                    <Checkbox
                                      required={false}
                                      checked={this.state.showTokenWrapperEnabled}
                                      onChange={ e => this.toggleShowTokenWrapper(e.target.checked) }
                                      label={ isStake ? `Convert your ${this.state.tokenWrapperProps.startContract.token} to ${this.state.tokenWrapperProps.destContract.token}` : `Convert your ${this.state.tokenWrapperProps.destContract.token} to ${this.state.tokenWrapperProps.startContract.token}`}
                                    />
                                  </Flex>
                                </DashboardCard>
                              </Flex>
                            )
                            */
                          }
                          {
                            (isStake || isUnstake) ?
                              /*
                              this.state.showTokenWrapperEnabled && this.state.tokenWrapperProps ? (
                                <TokenWrapper
                                  {...this.props}
                                  fullWidth={true}
                                  action={ isStake ? 'wrap' : 'unwrap' }
                                  toolProps={this.state.tokenWrapperProps}
                                />
                              ) :
                              */
                              (this.state.tokenConfig && this.state.balanceProp && this.state.statsLoaded && this.state.contractInfo ? (
                                <Box
                                  mt={1}
                                  width={1}
                                  mb={[4,3]}
                                >
                                  <SendTxWithBalance
                                    {...this.props}
                                    action={txAction}
                                    error={this.state.error}
                                    steps={this.state.steps}
                                    infoBox={this.state.infoBox}
                                    tokenConfig={this.state.tokenConfig}
                                    tokenBalance={this.state.balanceProp}
                                    contractInfo={this.state.contractInfo}
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
                                              `You don't have any ${this.state.selectedToken} in your wallet.`
                                            ) : isUnstake && (
                                              `You don't have any staked ${this.state.selectedToken} to withdraw.`
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
                  </Flex>
                )
              }
            </Flex>
          )
        }
      </Flex>
    );
  }
}

export default Staking;