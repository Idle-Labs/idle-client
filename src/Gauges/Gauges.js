import IconBox from '../IconBox/IconBox';
import React, { Component } from 'react';
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
    unlockDate:null,
    inputValue:null,
    balanceProp:null,
    tokenConfig:null,
    noFundsText:null,
    contractInfo:null,
    lastUserVote:null,
    selectedToken:null,
    claimedTokens:null,
    rewardsTokens:null,
    veTokenBalance:null,
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
    distributionRate:null,
    approveDescription:null,
    balanceSelectorInfo:null,
    trancheTokenBalance:null,
    availableVotingPower:null
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
  }

  async componentDidUpdate(prevProps,prevState){
    this.loadUtils();

    const stakeActionChanged = prevState.stakeAction !== this.state.stakeAction;
    const selectedTokenChanged = prevState.selectedToken !== this.state.selectedToken;
    const selectedActionChanged = prevState.selectedAction !== this.state.selectedAction;
    if (selectedTokenChanged || selectedActionChanged || stakeActionChanged){
      this.setState({
        infoBox:null,
        claimSucceded:false
      },() => {
        this.loadTokenData();
      })
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

    const selectedToken = Object.keys(availableTokens)[0];

    this.setState({
      selectedToken,
      availableTokens
    },() => {
      this.loadTokenData(true);
    });
  }

  async loadTokenData(loadGauges=false){
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
      rewardsTokens,
      distributionRate,
      stakedBalance,
      veTokenBalance,
      trancheTokenBalance,
      claimableTokens,
      votingPowerUsed,
      lastUserVote
    ] = await Promise.all([
      this.functionsUtil.getBlockInfo(),
      this.functionsUtil.getGaugeRewardsTokens(gaugeConfig),
      this.functionsUtil.genericContractCall('GaugeDistributor','rate'),
      this.functionsUtil.getTokenBalance(gaugeConfig.name,this.props.account),
      this.functionsUtil.getTokenBalance(veTokenConfig.token,this.props.account),
      this.functionsUtil.getTokenBalance(trancheTokenConfig.token,this.props.account),
      this.functionsUtil.genericContractCall(gaugeConfig.name,'claimable_tokens',[this.props.account]),
      this.functionsUtil.genericContractCall('GaugeController','vote_user_power',[this.props.account]),
      this.functionsUtil.genericContractCall('GaugeController','last_user_vote',[this.props.account,gaugeConfig.address])
    ]);

    console.log('rewardsTokens',rewardsTokens);

    if (claimableTokens){
      claimableTokens = this.functionsUtil.fixTokenDecimals(claimableTokens,18);
    }

    if (distributionRate){
      distributionRate = this.functionsUtil.fixTokenDecimals(distributionRate,18).times(86400);
    }

    let canVote = true;
    let unlockDate = null;
    let balanceProp = null;
    let tokenConfig = null;
    let noFundsText = null;
    let contractInfo = null;
    let approveEnabled = true;
    let approveDescription = null;
    let balanceSelectorInfo = null;
    votingPowerUsed = this.functionsUtil.BNify(votingPowerUsed).div(10000);

    switch (this.state.selectedAction){
      case 'vote':
        approveEnabled = false;
        tokenConfig = veTokenConfig;
        const veTokenBalanceUsed = veTokenBalance.times(votingPowerUsed);
        balanceProp = veTokenBalance.minus(veTokenBalanceUsed);
        balanceSelectorInfo = {
          color:`copyColor`,
          text:`Allocated power: ${votingPowerUsed.times(100).toFixed(2)}%`
        };
        contractInfo = this.functionsUtil.getGlobalConfig(['contracts',1,'GaugeController']);
        noFundsText = `Stake your ${this.functionsUtil.getGlobalConfig(['governance','props','tokenName'])} tokens to allocate your voting power to a Gauge.`;

        const nextUnlockTime = lastUserVote ? parseInt(lastUserVote)+this.props.toolProps.WEIGHT_VOTE_DELAY : null;
        canVote = !nextUnlockTime || blockInfo.timestamp>=nextUnlockTime;

        unlockDate = nextUnlockTime ? this.functionsUtil.strToMoment(nextUnlockTime*1000).utc().format('YYYY-MM-DD HH:mm') : null;
      break;
      case 'stake':
        switch (this.state.stakeAction){
          case 'deposit':
            approveEnabled = true;
            contractInfo = gaugeConfig;
            tokenConfig = trancheTokenConfig;
            balanceProp = trancheTokenBalance;
            noFundsText = `You don't have any <strong>${tokenConfig.token}</strong> in your wallet to deposit.`;
            approveDescription = `Approve the Gauge contract to deposit your <strong>${trancheTokenConfig.token}</strong> tokens`;
          break;
          case 'claim':
            approveEnabled = false;
            contractInfo = this.functionsUtil.getGlobalConfig(['contracts',1,'GaugeDistributor']);
          break;
          case 'withdraw':
            approveEnabled = false;
            contractInfo = gaugeConfig;
            balanceProp = stakedBalance;
            tokenConfig = trancheTokenConfig;
            noFundsText = `You don't have any <strong>${tokenConfig.token}</strong> in the Gauge contract to withdraw.`;
          break;
          default:
          break;
        }
      break;
      default:
      break;
    }

    // console.log('loadTokenData',this.state.selectedAction,this.state.selectedToken,claimableTokens.toString(),approveEnabled);

    this.setState({
      canVote,
      unlockDate,
      noFundsText,
      tokenConfig,
      balanceProp,
      contractInfo,
      lastUserVote,
      rewardsTokens,
      stakedBalance,
      approveEnabled,
      veTokenBalance,
      votingPowerUsed,
      claimableTokens,
      distributionRate,
      approveDescription,
      balanceSelectorInfo,
      trancheTokenBalance
    },() => {
      if (loadGauges || !this.state.availableGauges){
        this.loadGauges();
      }
    });
  }

  async loadGauges(){
    const availableGauges = {};
    await this.functionsUtil.asyncForEach(Object.keys(this.props.toolProps.availableGauges), async (gaugeToken) => {
      const gaugeConfig = this.props.toolProps.availableGauges[gaugeToken];
      if (!availableGauges[gaugeConfig.protocol]){
        availableGauges[gaugeConfig.protocol] = {};
      }

      const liquidityGaugeContract = this.functionsUtil.getContractByName(gaugeConfig.name);
      if (!liquidityGaugeContract && gaugeConfig.abi){
        await this.props.initContract(gaugeConfig.name,gaugeConfig.address,gaugeConfig.abi);
      }

      let [
        rewardsTokens,
        gaugeTotalSupply,
        stakedBalance,
        gaugeWeight
      ] = await Promise.all([
        this.functionsUtil.getGaugeRewardsTokens(gaugeConfig),
        this.functionsUtil.getTokenTotalSupply(gaugeConfig.name),
        this.functionsUtil.getTokenBalance(gaugeConfig.name,this.props.account),
        this.functionsUtil.genericContractCall('GaugeController','gauge_relative_weight',[gaugeConfig.address])
      ]);

      const trancheConfig = this.props.availableTranches[gaugeConfig.protocol][gaugeToken];

      if (trancheConfig){
        gaugeWeight = this.functionsUtil.fixTokenDecimals(gaugeWeight,18);
        gaugeTotalSupply = this.functionsUtil.fixTokenDecimals(gaugeTotalSupply,18);
        const gaugeDistributionRate = this.state.distributionRate.times(gaugeWeight);

        availableGauges[gaugeConfig.protocol][gaugeToken] = trancheConfig;
        availableGauges[gaugeConfig.protocol][gaugeToken].rewardsTokens = rewardsTokens;
        availableGauges[gaugeConfig.protocol][gaugeToken].stakedBalance = stakedBalance;
        availableGauges[gaugeConfig.protocol][gaugeToken].totalSupply = gaugeTotalSupply;
        availableGauges[gaugeConfig.protocol][gaugeToken].weight = gaugeWeight.times(100).toFixed(2)+'%';
        availableGauges[gaugeConfig.protocol][gaugeToken].distributionRate = `${gaugeDistributionRate.toFixed(4)} IDLE/day`;
        // console.log('Gauge Weight',gaugeConfig.protocol,gaugeToken,gaugeWeight,gaugeTotalSupply.toString(),stakedBalance.toString(),rewardsTokens);
      }
    });

    this.setState({
      availableGauges
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
        claimToken
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

    // console.log('transactionSucceeded',tx,amount,params);

    let infoBox = null;
    let claimedTokens = null;
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
            claimedTokens = this.state.claimableTokens;
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

    this.loadTokenData(true);

    this.setState({
      infoBox,
      claimedTokens,
      claimSucceded
    });
  }

  async changeInputCallback(inputValue=null){
    let infoBox = null;
    let votingWeight = null;
    inputValue = this.functionsUtil.BNify(inputValue);
    switch (this.state.selectedAction){
      case 'vote':
        if (inputValue.gt(0)){
          const votingPowerPercentage = this.state.veTokenBalance.gt(0) ? inputValue.div(this.state.veTokenBalance).times(100).toFixed(2) : this.functionsUtil.BNify(0);
          votingWeight = this.state.veTokenBalance.gt(0) ? this.functionsUtil.integerValue(inputValue.div(this.state.veTokenBalance).times(10000)) : this.functionsUtil.BNify(0);
          infoBox = {
            icon:'Info',
            text:`You are allocating ${votingPowerPercentage}% of your voting power to this Gauge`
          };
        }
      break;
      case 'stake':

      break;
      default:
      break;
    }

    this.setState({
      infoBox,
      inputValue,
      votingWeight
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
            this.state.stakeAction === 'claim' && Object.keys(this.state.rewardsTokens).length>1 && (
              <Box
                mb={2}
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
                    text={'Claim Rewards'}
                    handleClick={ e => this.setClaimToken('additional') }
                    isActive={ this.state.claimToken === 'additional' }
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
                icon={'AccessTime'}
                text={`Please wait until <strong>${this.state.unlockDate} UTC</strong> to allocate your voting power to this Gauge.`}
              />
            ) : (this.state.selectedAction === 'vote' || this.state.stakeAction !== 'claim') && this.state.tokenConfig ? (
              <SendTxWithBalance
                error={null}
                {...this.props}
                permitEnabled={false}
                infoBox={this.state.infoBox}
                tokenConfig={this.state.tokenConfig}
                tokenBalance={this.state.balanceProp}
                contractInfo={this.state.contractInfo}
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
                      size={this.props.isMobile ? '1.8em' : '2.3em'}
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
                          handleClick={e => this.props.goToSection(`tools/${this.functionsUtil.getGlobalConfig(['tools','stake','route'])}`)}
                        >
                          Stake
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
                    mt:1
                  }}
                  icon={'DoneAll'}
                  iconProps={{
                    size:this.props.isMobile ? '1.8em' : '2.3em',
                    color:this.props.theme.colors.transactions.status.completed
                  }}
                  text={`You have successfully claimed <strong>${this.state.claimedTokens.toFixed(8)} IDLE</strong>.`}
                />
              ) : (this.state.claimableTokens && this.state.claimableTokens.gt(0)) ? (
                <Flex
                  width={1}
                  flexDirection={'column'}
                >
                  <DashboardCard
                    cardProps={{
                      p:3,
                      mt:1,
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
                        size={this.props.isMobile ? '1.8em' : '2.3em'}
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
                  icon={'MoneyOff'}
                  iconProps={{
                    size:this.props.isMobile ? '1.8em' : '2.3em'
                  }}
                  text={`You don't have any IDLE to claim for this Gauge.`}
                />
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
                  Gauges Weights
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
                      width:[0.34, 0.16]
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
                      width:[0.15, 0.16],
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
                    title:'REWARDS TOKENS',
                    props:{
                      width:[0.25, 0.14],
                    },
                    fields:[
                      {
                        name:'custom',
                        type:'tokensList',
                        path:['tokenConfig','rewardsTokens'],
                        props:{
                          
                        }
                      }
                    ]
                  },
                  {
                    title:'TOTAL SUPPLY',
                    props:{
                      width:[0.25, 0.11],
                    },
                    fields:[
                      {
                        type:'number',
                        name:'custom',
                        path:['tokenConfig','totalSupply'],
                        props:{
                          flexProps:{
                            justifyContent:'flex-start'
                          },
                          minPrecision:1,
                          decimals:this.props.isMobile ? 0 : 2,
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
                    title:'DEPOSITED',
                    props:{
                      width:[0.27,0.10],
                    },
                    fields:[
                      {
                        type:'number',
                        name:'custom',
                        path:['tokenConfig','stakedBalance'],
                        props:{
                          flexProps:{
                            justifyContent:'flex-start'
                          },
                          minPrecision:1,
                          decimals:this.props.isMobile ? 0 : 2,
                        }
                      },
                    ],
                  },
                  {
                    mobile:false,
                    title:'DISTRIBUTION RATE',
                    props:{
                      width:[0.15, 0.16],
                    },
                    fields:[
                      {
                        type:'text',
                        name:'custom',
                        path:['tokenConfig','distributionRate'],
                        props:{
                          
                        }
                      }
                    ]
                  },
                  {
                    mobile:false,
                    title:'ALLOCATED WEIGHT',
                    props:{
                      width:[0.25,0.17],
                    },
                    fields:[
                      {
                        type:'text',
                        name:'custom',
                        path:['tokenConfig','weight']
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
