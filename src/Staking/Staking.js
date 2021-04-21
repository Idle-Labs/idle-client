import React, { Component } from 'react';
import { Flex, Box, Text, Icon } from "rimble-ui";
import FlexLoader from '../FlexLoader/FlexLoader';
import AssetField from '../AssetField/AssetField';
import ImageButton from '../ImageButton/ImageButton';
import FunctionsUtil from '../utilities/FunctionsUtil';
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
    tokenBalance:null,
    contractInfo:null,
    stakedBalance:null,
    selectedToken:null,
    accountingData:null,
    selectedAction:null,
    selectedOption:null,
    successMessage:null,
    availableTokens:null,
    approveEnabled:false,
    contractApproved:false,
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
    }

    const selectedActionChanged = prevState.selectedAction !== this.state.selectedAction;
    const contractApprovedChanged = prevState.contractApproved !== this.state.contractApproved;
    if (selectedActionChanged || contractApprovedChanged){
      this.updateData(selectedActionChanged);
    }

    const contractInfoChanged = JSON.stringify(prevState.contractInfo) !== JSON.stringify(this.state.contractInfo);
    if (contractInfoChanged){
      this.changeInputCallback();
    }
  }

  async changeInputCallback(inputValue=null){

    let infoBox = null;

    console.log('changeInputCallback',inputValue);

    if (inputValue && this.functionsUtil.BNify(inputValue).gt(0)){
      switch (this.state.selectedAction){
        case 'Stake':
          const rewards = this.functionsUtil.formatMoney(Math.min(parseFloat(this.state.totalRewards),parseFloat(this.state.distributionSpeed.times(inputValue).div(this.functionsUtil.fixTokenDecimals(this.state.totalStakingShares,this.state.contractInfo.decimals).plus(inputValue)).times(86400))));
          infoBox = {
            icon:'FileDownload',
            iconProps:{
              color:this.props.theme.colors.transactions.status.completed
            },
            text:`By staking <strong>${inputValue} ${this.state.tokenConfig.token}</strong> you will get <strong>${rewards} ${this.state.contractInfo.rewardToken} / day</strong>`
          };
        break;
        case 'Withdraw':
          const normalizedInputValue = this.functionsUtil.normalizeTokenAmount(inputValue,this.state.tokenConfig.decimals);
          let unstakeRewards = await this.functionsUtil.genericContractCall(this.state.contractInfo.name,'unstakeQuery',[normalizedInputValue.toString()],{from:this.props.account});
          unstakeRewards = this.functionsUtil.formatMoney(this.functionsUtil.fixTokenDecimals(unstakeRewards,this.state.tokenConfig.decimals));
          infoBox = {
            icon:'FileUpload',
            iconProps:{
              color:this.props.theme.colors.transactions.status.completed
            },
            text:`By unstaking <strong>${inputValue} ${this.state.tokenConfig.token}</strong> you will get <strong>${unstakeRewards} ${this.state.contractInfo.rewardToken}</strong>`
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

  async getTransactionParams(amount){
    let methodName = null;
    let methodParams = [];
    amount = this.functionsUtil.BNify(amount);
    switch (this.state.selectedAction){
      case 'Stake':
        methodName = 'stake';
        methodParams = [amount,'0x'];
      break;
      case 'Withdraw':
        methodName = 'unstake';
        methodParams = [amount,'0x'];
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
    console.log('transactionSucceeded',tx);
    let infoBox = null;
    switch (this.state.selectedAction){
      case 'Stake':
        const stakedTokensLog = tx.txReceipt && tx.txReceipt.logs ? tx.txReceipt.logs.find( log => log.address.toLowerCase() === this.state.tokenConfig.address.toLowerCase() ) : null;
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

    newState.tokenBalance = this.functionsUtil.BNify(await this.functionsUtil.getTokenBalance(this.state.selectedToken,this.props.account));
    newState.stakedBalance = this.functionsUtil.BNify(await this.functionsUtil.genericContractCall(this.state.contractInfo.name,'totalStakedFor',[this.props.account]));

    switch (this.state.selectedAction){
      case 'Stake':
        newState.approveEnabled = true;
        newState.balanceProp = newState.tokenBalance;
        newState.approveDescription = 'Approve the Staking contract to stake your LP tokens';
      break;
      case 'Withdraw':
        newState.approveEnabled = false;
        newState.approveDescription = '';
        newState.balanceProp = this.functionsUtil.fixTokenDecimals(newState.stakedBalance,this.state.tokenConfig.decimals);
      break;
      default:
      break;
    }

    if (selectedActionChanged){
      newState.infoBox = null;
      newState.transactionSucceeded = false;
    }

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
      this.functionsUtil.genericContractCall(this.state.contractInfo.name,'unstakeQuery',[this.state.stakedBalance.toString()],{from:this.props.account})
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

    const programEndTime = unlockSchedules.reduce( (endTime,s) => {
      endTime = Math.max(s.endAtSec,endTime);
      return endTime;
    },parseInt(Date.now()/1000));

    const programDuration = `${this.functionsUtil.strToMoment(programEndTime*1000).utc().format('DD MMM, YYYY @ HH:mm')} UTC`;
    stats.push({
      title:'Program duration',
      value:programDuration
    });

    const distributionSpeed = unlockSchedules.reduce( (distributionSpeed,s) => {
      const tokensPerSecond = this.functionsUtil.fixTokenDecimals(s.initialLockedShares,this.state.contractInfo.decimals).div(s.durationSec);
      distributionSpeed = distributionSpeed.plus(tokensPerSecond);
      return distributionSpeed;
    },this.functionsUtil.BNify(0));

    stats.push({
      title:'Reward unlock rate',
      value:this.functionsUtil.formatMoney(distributionSpeed.times(86400))+' '+this.state.contractInfo.rewardToken+' / day'
    });

    const globalStats = [];
    globalStats.push({
      title:'APY',
      value:'???'
    });

    globalStats.push({
      title:'Reward Multiplier',
      value:'1.0x'
    });

    const currentRewards = this.functionsUtil.formatMoney(this.functionsUtil.fixTokenDecimals(collectedRewards,this.state.tokenConfig.decimals));
    globalStats.push({
      title:'Current Rewards',
      value:currentRewards+' '+this.state.contractInfo.rewardToken
    });

    // debugger;

    this.setState({
      stats,
      globalStats,
      totalRewards,
      accountingData,
      distributionSpeed,
      totalStakingShares
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
        >
          <Text
            mt={1}
            fontSize={[2,3]}
            color={'statValue'}
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
                      this.state.globalStats.length>0 && (
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
                              this.state.globalStats.map( statInfo =>
                                <StatsCard
                                  cardProps={{
                                    mb:[2,0],
                                    width:[1,'32%']
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
                              subcaption={'stake LP Tokens'}
                              imageProps={{
                                mb:2,
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
                              subcaption={'withdraw LP tokens'}
                              imageProps={{
                                mb:2,
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
                              subcaption={'view some stats'}
                              isMobile={this.props.isMobile}
                              imageProps={{
                                mb:2,
                                height:this.props.isMobile ? '42px' : '52px'
                              }}
                              isActive={isStats}
                              handleClick={ e => this.setAction('Stats') }
                            />
                          </Flex>
                          {
                            this.state.tokenConfig && this.state.balanceProp && this.state.contractInfo && (isStake || isUnstake) ? (
                              <Box
                                mt={1}
                                mb={3}
                                width={1}
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
                                  approveEnabled={this.state.approveEnabled}
                                  callback={this.transactionSucceeded.bind(this)}
                                  approveDescription={this.state.approveDescription}
                                  contractApproved={this.contractApproved.bind(this)}
                                  balanceSelectorInfo={this.state.balanceSelectorInfo}
                                  changeInputCallback={this.changeInputCallback.bind(this)}
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
                                  this.state.stats.map( statInfo =>
                                    <StatsCard
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