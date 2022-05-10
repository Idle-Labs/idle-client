import IconBox from '../IconBox/IconBox';
import ExtLink from '../ExtLink/ExtLink';
import React, { Component } from 'react';
import FlexLoader from '../FlexLoader/FlexLoader';
import ImageButton from '../ImageButton/ImageButton';
import TooltipText from '../TooltipText/TooltipText';
import RoundButton from '../RoundButton/RoundButton';
import FunctionsUtil from '../utilities/FunctionsUtil';
import BuyModal from '../utilities/components/BuyModal';
import TrancheField from '../TrancheField/TrancheField';
import DashboardCard from '../DashboardCard/DashboardCard';
import ShareModal from '../utilities/components/ShareModal';
// import StatsCardSmall from '../StatsCardSmall/StatsCardSmall';
import CardIconButton from '../CardIconButton/CardIconButton';
import GenericSelector from '../GenericSelector/GenericSelector';
import { Flex, Text, Image, Box, Icon, Button } from "rimble-ui";
import SendTxWithBalance from '../SendTxWithBalance/SendTxWithBalance';
import LimitReachedModal from '../utilities/components/LimitReachedModal';
import ExecuteTransaction from '../ExecuteTransaction/ExecuteTransaction';

class TrancheDetails extends Component {

  state = {
    infoText:null,
    modalApy:null,
    trancheAPY:null,
    canUnstake:null,
    canWithdraw:null,
    activeModal:null,
    actionLabel:null,
    modalAction:null,
    balanceProp:null,
    lastHarvest:null,
    gaugeConfig:null,
    tokenConfig:null,
    contractInfo:null,
    tranchePrice:null,
    tokenBalance:null,
    stakeEnabled:true,
    stakedBalance:null,
    unstakeEnabled:true,
    trancheBaseApy:null,
    trancheBalance:null,
    stakingEnabled:true,
    approveEnabled:null,
    buttonDisabled:false,
    selectedTranche:null,
    availableTranches:null,
    approveDescription:null,
    gaugeStakedBalance:null,
    selectedAction:'deposit',
    selectedTrancheOption:null,
    selectedStakeAction:'stake',
    userHasAvailableFunds:false
  }

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

    const accountChanged = this.props.account !== prevProps.account;
    if (accountChanged){
      this.loadData();
    }

    const selectedActionChanged = prevState.selectedAction !== this.state.selectedAction;
    const selectedStakeActionChanged = prevState.selectedStakeAction !== this.state.selectedStakeAction;
    if (selectedActionChanged || selectedStakeActionChanged){
      this.loadActionData();
    }
  }

  async loadData(){

    const gaugeConfig = this.functionsUtil.getGlobalConfig(['tools','gauges','props','availableGauges',this.props.selectedToken]);

    const [
      // blockNumber,
      lastHarvest,
      tokenBalance,
      trancheBalance,
      gaugeStakedBalance,
      stakedBalance,
      trancheAPY,
      tranchePrice,
      trancheBaseApy
    ] = await Promise.all([
      // this.functionsUtil.getBlockNumber(),
      this.functionsUtil.getTrancheLastHarvest(this.props.tokenConfig),
      this.functionsUtil.getTokenBalance(this.props.selectedToken,this.props.account),
      this.functionsUtil.getTokenBalance(this.props.trancheConfig.name,this.props.account),
      gaugeConfig ? this.functionsUtil.getTokenBalance(gaugeConfig.name,this.props.account) : null,
      this.functionsUtil.getTrancheStakedBalance(this.props.trancheConfig.CDORewards.name,this.props.account,this.props.trancheConfig.CDORewards.decimals,this.props.trancheConfig.functions.stakedBalance),
      this.functionsUtil.loadTrancheFieldRaw('trancheApy',{},this.props.selectedProtocol,this.props.selectedToken,this.props.selectedTranche,this.props.tokenConfig,this.props.trancheConfig,this.props.account),
      this.functionsUtil.loadTrancheFieldRaw('tranchePrice',{},this.props.selectedProtocol,this.props.selectedToken,this.props.selectedTranche,this.props.tokenConfig,this.props.trancheConfig,this.props.account),
      this.functionsUtil.loadTrancheFieldRaw('trancheBaseApy',{},this.props.selectedProtocol,this.props.selectedToken,this.props.selectedTranche,this.props.tokenConfig,this.props.trancheConfig,this.props.account),
    ]);

    const canUnstake = true; // !stakeCoolingPeriod || this.functionsUtil.BNify(userStakeBlock).plus(stakeCoolingPeriod).lt(blockNumber);
    const canWithdraw = true; // !cdoCoolingPeriod || !latestHarvestBlock || this.functionsUtil.BNify(latestHarvestBlock).plus(cdoCoolingPeriod).lt(blockNumber);
    
    // console.log('loadData',this.props.trancheConfig.tranche,blockNumber,cdoCoolingPeriod,latestHarvestBlock,stakeCoolingPeriod,userStakeBlock,canUnstake,canWithdraw);

    const availableTranches = Object.values(this.functionsUtil.getGlobalConfig(['tranches'])).map( trancheInfo => ({
      value:trancheInfo.type,
      icon:trancheInfo.image,
      label:trancheInfo.name,
      tranche:trancheInfo.type,
      trancheConfig:this.props.tokenConfig[trancheInfo.type]
    }));

    const userHasAvailableFunds = trancheBalance && trancheBalance.gt(0);
    const selectedTrancheOption = availableTranches.find( trancheInfo => trancheInfo.value === this.props.selectedTranche );
    const selectedTranche = selectedTrancheOption.value;

    const stakingRewards = this.props.trancheConfig.CDORewards.stakingRewards.filter( t => t.enabled );
    let stakingEnabled = stakingRewards.length>0;
    const stakeEnabled = stakingEnabled;
    const unstakeEnabled = stakedBalance && this.functionsUtil.BNify(stakedBalance).gt(0);

    // console.log('stakingRewards',stakingRewards,stakingEnabled,unstakeEnabled);

    if (!stakingEnabled && unstakeEnabled){
      stakingEnabled = true;
    }

    let selectedStakeAction = 'stake';
    if (!stakeEnabled && unstakeEnabled){
      selectedStakeAction = 'unstake';
    }

    this.setState({
      trancheAPY,
      canUnstake,
      canWithdraw,
      lastHarvest,
      tokenBalance,
      stakeEnabled,
      tranchePrice,
      stakedBalance,
      trancheBaseApy,
      stakingEnabled,
      trancheBalance,
      unstakeEnabled,
      selectedTranche,
      availableTranches,
      gaugeStakedBalance,
      selectedStakeAction,
      selectedTrancheOption,
      userHasAvailableFunds
    }, () => {
      this.loadActionData();
    });
  }

  loadActionData(){
    let infoBox = null;
    let balanceProp = null;
    let tokenConfig = null;
    let contractInfo = null;
    let approveEnabled = null;
    let buttonDisabled = false;

    let actionLabel = this.state.selectedAction;
    const trancheDetails = this.functionsUtil.getGlobalConfig(['tranches',this.props.selectedTranche]);
    const gaugeConfig = this.functionsUtil.getGlobalConfig(['tools','gauges','props','availableGauges',this.props.selectedToken]);
    let infoText = this.functionsUtil.getArrayPath(['messages',this.state.selectedAction],this.props.tokenConfig) || trancheDetails.description[this.state.selectedAction];

    switch (this.state.selectedAction){
      case 'deposit':
        approveEnabled = true;
        contractInfo = this.props.cdoConfig;
        tokenConfig = this.props.tokenConfig;
        balanceProp = this.state.tokenBalance;
        
        if (gaugeConfig && gaugeConfig.trancheToken.token.toLowerCase() === this.props.tokenConfig[this.props.selectedTranche].token.toLowerCase() && this.state.trancheBalance && this.state.trancheBalance.gt(0)){
          infoText = `Stake your ${gaugeConfig.trancheToken.token} in the Liquidity Gauge and get rewarded!`;
        }
      break;
      case 'stake':
        actionLabel = this.state.selectedStakeAction;
        if (this.state.stakingEnabled){
          infoText = trancheDetails.description[this.state.selectedStakeAction];
        } else {
          infoText = null;
        }
        switch (this.state.selectedStakeAction){
          case 'stake':
            // Disable staking deposit if gaugeConfig is set
            if (gaugeConfig || !this.state.stakeEnabled){
              infoText = null;
            }
            approveEnabled = true;
            tokenConfig = this.props.trancheConfig;
            balanceProp = this.state.trancheBalance;
            contractInfo = this.props.trancheConfig.CDORewards;
          break;
          case 'unstake':
            approveEnabled = false;
            tokenConfig = this.props.trancheConfig;
            contractInfo = this.props.trancheConfig.CDORewards;
            balanceProp = this.state.stakedBalance;
            if (!this.state.canUnstake){
              buttonDisabled = true;
              infoText = trancheDetails.description.cantUnstake;
            }
          break;
          default:
          break;
        }
      break;
      case 'withdraw':
        approveEnabled = false;
        contractInfo = this.props.cdoConfig;
        // tokenConfig = this.props.trancheConfig;
        // balanceProp = this.state.trancheBalance;

        tokenConfig = this.props.tokenConfig;
        balanceProp = this.state.trancheBalance ? this.state.trancheBalance.times(this.state.tranchePrice) : null;

        // console.log('balanceProp',this.state.trancheBalance,this.state.tranchePrice,balanceProp);

        if (!this.state.canWithdraw){
          buttonDisabled = true;
          infoText = trancheDetails.description.cantWithdraw;
          // infoBox = {
          //   text:'You need to wait 1 block from the last ',
          //   icon:'Warning',
          //   iconProps:{
          //     color:'cellText'
          //   },
          // };
        }
      break;
      default:
      break;
    }

    const approveDescription = tokenConfig ? `To ${this.state.selectedAction} your <strong>${tokenConfig.token}</strong> you need to approve the Smart-Contract first.` : null;

    // console.log('loadActionData',approveEnabled);

    this.setState({
      infoBox,
      infoText,
      actionLabel,
      gaugeConfig,
      tokenConfig,
      balanceProp,
      contractInfo,
      buttonDisabled,
      approveEnabled,
      approveDescription
    })
  }

  changeInputCallback(){

  }

  contractApprovedCallback(){

  }

  getTransactionParams(amount,selectedPercentage){
    let methodName = null;
    let methodParams = null;

    if (this.props.trancheConfig.functions[this.state.selectedAction]){
      methodName = this.props.trancheConfig.functions[this.state.selectedAction];

      if (this.state.selectedAction === 'withdraw'){
        let trancheTokenToRedeem = null;
        if (selectedPercentage) {
          trancheTokenToRedeem = this.functionsUtil.BNify(this.state.trancheBalance).times(this.functionsUtil.BNify(selectedPercentage).div(100));
        } else {
          trancheTokenToRedeem = this.functionsUtil.BNify(amount).div(this.functionsUtil.normalizeTokenAmount(this.state.tranchePrice,18));
        }

        // Check if idleTokens to redeem > idleToken balance
        if (trancheTokenToRedeem.gt(this.functionsUtil.BNify(this.state.trancheBalance))) {
          trancheTokenToRedeem = this.functionsUtil.BNify(this.state.trancheBalance);
        }

        // Normalize number
        trancheTokenToRedeem = this.functionsUtil.normalizeTokenAmount(trancheTokenToRedeem, 18);

        methodParams = [trancheTokenToRedeem];
      } else {
        if (this.state.selectedAction === 'stake'){
          methodName = this.props.trancheConfig.functions[this.state.selectedStakeAction];
        }

        methodParams = [amount];
      }
    }

    // console.log('getTransactionParams',this.state.selectedAction,amount,this.functionsUtil.BNify(this.state.trancheBalance).toFixed(),selectedPercentage,methodParams);

    return {
      methodName,
      methodParams
    };
  }

  async checkLimit(amount){
    const trancheLimit = this.functionsUtil.BNify(this.props.tokenConfig.limit);
    if (trancheLimit.gt(0)){
      const poolSize = await this.functionsUtil.loadTrancheFieldRaw(`pool`,{},this.props.selectedProtocol,this.props.selectedToken,this.props.selectedTranche,this.props.tokenConfig,this.props.trancheConfig,this.props.account);
      if (poolSize.plus(amount).gt(trancheLimit)){
        this.setState({
          activeModal:'limit'
        })
        return false;
      }
    }
    return true;
  }

  transactionSucceeded(){
    this.loadData();

    if (typeof this.props.transactionSucceeded === 'function'){
      this.props.transactionSucceeded();
    }

    switch (this.state.selectedAction){
      case 'stake':
      case 'deposit':
        if (this.state.selectedAction === 'deposit' || this.state.selectedStakeAction === 'stake'){
          const modalAction = this.state.selectedAction === 'deposit' ? 'deposited' : 'staked';
          const modalApy = this.state.selectedAction === 'deposit' ? this.state.trancheBaseApy : this.state.trancheAPY;
          this.setState({
            modalApy,
            modalAction,
            activeModal:'share'
          });
        }
      break;
      default:
      break;
    }
  }

  resetModal = () => {
    this.setState({
      activeModal: null
    });
  }

  setSelectedAction(selectedAction){
    this.setState({
      selectedAction
    });
  }

  setStakeAction(selectedStakeAction){
    this.setState({
      selectedStakeAction
    });
  }

  selectTranche(trancheType){
    // console.log('selectTranche',trancheType);
    const trancheDetails = this.functionsUtil.getGlobalConfig(['tranches',trancheType]);
    if (trancheDetails){
      this.props.selectTrancheType(trancheDetails.route);
    }
  }

  render() {

    const isStake = this.state.selectedAction === 'stake';
    const isDeposit = this.state.selectedAction === 'deposit';
    const isWithdraw = this.state.selectedAction === 'withdraw';

    const stakingRewards = this.props.trancheConfig.CDORewards.stakingRewards.filter( t => t.enabled );
    const trancheLimit = this.functionsUtil.formatMoney(this.functionsUtil.BNify(this.props.tokenConfig.limit),0)+' '+this.props.selectedToken;

    const CustomOptionValue = props => {
      const selectedOption = props.options.find( option => option.value === props.value );
      if (!selectedOption){
        return null;
      }

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
            <Image
              mr={2}
              src={selectedOption.icon}
              size={this.props.isMobile ? '1.6em' : '1.8em'}
            />
            <Text
              fontWeight={3}
            >
              {props.label}
            </Text>
          </Flex>
        </Flex>
      );
    }

    const CustomValueContainer = props => {
      const selectProps = props.selectProps.options.find( option => option.value === props.selectProps.value.value );
      // console.log('CustomValueContainer',props.selectProps.options,props.selectProps.value,selectProps);
      if (!selectProps){
        return null;
      }
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
            <Image
              mr={2}
              src={selectProps.icon}
              size={this.props.isMobile ? '1.6em' : '1.8em'}
            />
            <Text
              fontWeight={3}
            >
              {selectProps.label}
            </Text>
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
          !this.state.availableTranches ? (
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
                text={'Loading tranches...'}
              />
            </Flex>
          ) : (
            <Flex
              width={1}
              alignItems={'center'}
              flexDirection={'column'}
              justifyContent={'center'}
              maxWidth={['100%','42em']}
            >
              <Box
                width={1}
              >
                <Text
                  mb={1}
                >
                  Select Tranche:
                </Text>
                <GenericSelector
                  {...this.props}
                  name={'tranches'}
                  isSearchable={false}
                  CustomOptionValue={CustomOptionValue}
                  options={this.state.availableTranches}
                  onChange={this.selectTranche.bind(this)}
                  CustomValueContainer={CustomValueContainer}
                  defaultValue={this.state.selectedTrancheOption}
                />
              </Box>
              <Box
                mt={2}
                width={1}
              >
                <Text
                  mb={1}
                >
                  Tranche details:
                </Text>
                <DashboardCard
                  cardProps={{
                    py:1,
                    px:3,
                    mb:2
                  }}
                  isActive={false}
                >
                  <Flex
                    mt={1}
                    mb={1}
                    width={1}
                    style={{
                      flexBasis:'0',
                      flex:'1 1 0px',
                      flexWrap:'wrap'
                    }}
                    flexDirection={'row'}
                    justifyContent={'space-between'}
                  >
                    <Flex
                      mb={[2,3]}
                      width={['49%','33%']}
                      flexDirection={'column'}
                    >
                      <Text
                        fontSize={[1,2]}
                        color={'cellText'}
                        fontWeight={[2,3]}
                      >
                        Protocol
                      </Text>
                      <Flex
                        mt={1}
                        alignItems={'center'}
                        flexDirection={'row'}
                      >
                        <TrancheField
                          {...this.props}
                          fieldInfo={{
                            name:'protocolIcon',
                            props:{
                              mr:2,
                              height:['1.4em','2em']
                            }
                          }}
                          token={this.props.selectedToken}
                          tokenConfig={this.props.tokenConfig}
                          protocol={this.props.selectedProtocol}
                          trancheConfig={this.props.trancheConfig}
                        />
                        <TrancheField
                          {...this.props}
                          fieldInfo={{
                            name:'protocolName',
                            props:{
                              fontSize:[2,3],
                              color:'copyColor'
                            }
                          }}
                          token={this.props.selectedToken}
                          tokenConfig={this.props.tokenConfig}
                          protocol={this.props.selectedProtocol}
                          trancheConfig={this.props.trancheConfig}
                        />
                      </Flex>
                    </Flex>
                    <Flex
                      mb={[2,3]}
                      width={['49%','33%']}
                      flexDirection={'column'}
                    >
                      <Text
                        fontSize={[1,2]}
                        color={'cellText'}
                        fontWeight={[2,3]}
                      >
                        Token
                      </Text>
                      <Flex
                        mt={1}
                        alignItems={'center'}
                        flexDirection={'row'}
                      >
                        <TrancheField
                          {...this.props}
                          fieldInfo={{
                            name:'tokenIcon',
                            props:{
                              mr:2,
                              height:['1.4em','2em']
                            }
                          }}
                          token={this.props.selectedToken}
                          tokenConfig={this.props.tokenConfig}
                          protocol={this.props.selectedProtocol}
                          trancheConfig={this.props.trancheConfig}
                        />
                        <TrancheField
                          {...this.props}
                          fieldInfo={{
                            name:'tokenName',
                            props:{
                              fontSize:[2,3],
                              color:'copyColor'
                            }
                          }}
                          token={this.props.selectedToken}
                          tokenConfig={this.props.tokenConfig}
                          protocol={this.props.selectedProtocol}
                          trancheConfig={this.props.trancheConfig}
                        />
                      </Flex>
                    </Flex>
                    <Flex
                      mb={[2,3]}
                      width={['49%','33%']}
                      flexDirection={'column'}
                    >
                      <Text
                        fontSize={[1,2]}
                        color={'cellText'}
                        fontWeight={[2,3]}
                      >
                        Pool Size
                      </Text>
                      <Flex
                        mt={1}
                        alignItems={'center'}
                        flexDirection={'row'}
                      >
                        <TrancheField
                          {...this.props}
                          fieldInfo={{
                            name:'tranchePool',
                            props:{
                              decimals:2,
                              fontSize:[2,3],
                              color:'copyColor'
                            }
                          }}
                          token={this.props.selectedToken}
                          tranche={this.props.selectedTranche}
                          tokenConfig={this.props.tokenConfig}
                          protocol={this.props.selectedProtocol}
                          trancheConfig={this.props.trancheConfig}
                        />
                      </Flex>
                    </Flex>
                    <Flex
                      mb={2}
                      width={['49%','33%']}
                      flexDirection={'column'}
                    >
                      <TooltipText
                        textProps={{
                          fontSize:[1,2],
                          fontWeight:[2,3]
                        }}
                        text={'Auto-Compounding'}
                        message={this.functionsUtil.getGlobalConfig(['messages','autoFarming'])}
                      />
                      <Flex
                        mt={1}
                        alignItems={'center'}
                        flexDirection={'row'}
                      >
                        <TrancheField
                          {...this.props}
                          fieldInfo={{
                            name:'autoFarming',
                            props:{
                              decimals:2,
                              fontSize:[2,3],
                              color:'copyColor'
                            }
                          }}
                          token={this.props.selectedToken}
                          tranche={this.props.selectedTranche}
                          tokenConfig={this.props.tokenConfig}
                          protocol={this.props.selectedProtocol}
                          trancheConfig={this.props.trancheConfig}
                        />
                      </Flex>
                    </Flex>
                    <Flex
                      mb={2}
                      width={['49%','33%']}
                      flexDirection={'column'}
                    >
                      <TooltipText
                        textProps={{
                          fontSize:[1,2],
                          fontWeight:[2,3]
                        }}
                        text={'Staking Rewards'}
                        message={this.functionsUtil.getGlobalConfig(['messages','stakingRewards'])}
                      />
                      <Flex
                        mt={1}
                        alignItems={'center'}
                        flexDirection={'row'}
                      >
                        <TrancheField
                          {...this.props}
                          fieldInfo={{
                            name:'stakingRewards',
                            props:{
                              decimals:2,
                              fontSize:[2,3],
                              color:'copyColor'
                            }
                          }}
                          token={this.props.selectedToken}
                          tranche={this.props.selectedTranche}
                          tokenConfig={this.props.tokenConfig}
                          protocol={this.props.selectedProtocol}
                          trancheConfig={this.props.trancheConfig}
                        />
                      </Flex>
                    </Flex>
                    <Flex
                      mb={2}
                      width={['49%','33%']}
                      flexDirection={'column'}
                    >
                      <TooltipText
                        textProps={{
                          fontSize:[1,2],
                          fontWeight:[2,3]
                        }}
                        text={'APY'}
                        message={this.functionsUtil.getGlobalConfig(['messages','apyTranches'])}
                      />
                      <Flex
                        flexDirection={'column'}
                        alignItems={'flex-start'}
                        justifyContent={'flex-start'}
                      >
                        <TrancheField
                          {...this.props}
                          fieldInfo={{
                            name:'trancheApyWithTooltip',
                            props:{
                              decimals:2,
                              fontSize:[2,3],
                              color:'copyColor'
                            }
                          }}
                          token={this.props.selectedToken}
                          tranche={this.props.selectedTranche}
                          tokenConfig={this.props.tokenConfig}
                          protocol={this.props.selectedProtocol}
                          trancheConfig={this.props.trancheConfig}
                        />
                        {
                          stakingRewards.length>0 && (
                            <Flex
                              width={1}
                              flexDirection={'row'}
                              alignItems={'flex-start'}
                            >
                              <TrancheField
                                {...this.props}
                                fieldInfo={{
                                  name:'trancheIDLELastHarvest',
                                  props:{
                                    decimals:4,
                                    fontSize:1,
                                    fontWeight:2,
                                    lineHeight:'1',
                                    color:'cellText'
                                  }
                                }}
                                token={this.props.selectedToken}
                                tranche={this.props.selectedTranche}
                                tokenConfig={this.props.tokenConfig}
                                protocol={this.props.selectedProtocol}
                                trancheConfig={this.props.trancheConfig}
                              />
                            </Flex>
                          )
                        }
                      </Flex>
                    </Flex>
                    <Flex
                      mb={2}
                      width={['49%','33%']}
                      flexDirection={'column'}
                    >
                      <TooltipText
                        textProps={{
                          fontSize:[1,2],
                          fontWeight:[2,3]
                        }}
                        text={'Apr Ratio'}
                        message={this.functionsUtil.getGlobalConfig(['messages','aprRatio'])}
                      />
                      <Flex
                        mt={1}
                        alignItems={'center'}
                        flexDirection={'row'}
                      >
                        <TrancheField
                          {...this.props}
                          fieldInfo={{
                            name:'trancheAPRRatio',
                            props:{
                              fontSize:[2,3],
                              color:'copyColor'
                            }
                          }}
                          token={this.props.selectedToken}
                          tranche={this.props.selectedTranche}
                          tokenConfig={this.props.tokenConfig}
                          protocol={this.props.selectedProtocol}
                          trancheConfig={this.props.trancheConfig}
                        />
                      </Flex>
                    </Flex>
                    <Flex
                      mb={2}
                      width={['49%','33%']}
                      flexDirection={'column'}
                    >
                      <Text
                        fontSize={[1,2]}
                        color={'cellText'}
                        fontWeight={[2,3]}
                      >
                        Status
                      </Text>
                      <Flex
                        mt={1}
                        alignItems={'center'}
                        flexDirection={'row'}
                      >
                        <TrancheField
                          {...this.props}
                          fieldInfo={{
                            name:'statusBadge'
                          }}
                          token={this.props.selectedToken}
                          tranche={this.props.selectedTranche}
                          tokenConfig={this.props.tokenConfig}
                          protocol={this.props.selectedProtocol}
                          trancheConfig={this.props.trancheConfig}
                        />
                      </Flex>
                    </Flex>
                    <Flex
                      mb={2}
                      width={['49%','33%']}
                      flexDirection={'column'}
                    >
                      <Text
                        fontSize={[1,2]}
                        color={'cellText'}
                        fontWeight={[2,3]}
                      >
                        Limit Cap
                      </Text>
                      <Flex
                        mt={1}
                        alignItems={'center'}
                        flexDirection={'row'}
                      >
                        <TrancheField
                          {...this.props}
                          fieldInfo={{
                            name:'trancheLimit',
                            props:{
                              decimals:3,
                              fontSize:[2,3],
                              color:'copyColor'
                            }
                          }}
                          token={this.props.selectedToken}
                          tranche={this.props.selectedTranche}
                          tokenConfig={this.props.tokenConfig}
                          protocol={this.props.selectedProtocol}
                          trancheConfig={this.props.trancheConfig}
                        />
                      </Flex>
                    </Flex>
                  </Flex>
                  {
                    this.props.tokenConfig.description && (
                      <Flex
                        pt={2}
                        mb={2}
                        width={1}
                        flexDirection={'column'}
                        borderTop={`1px solid ${this.props.theme.colors.divider}`}
                      >
                        <Text
                          fontSize={[1,2]}
                          color={'cellText'}
                          fontWeight={[2,3]}
                        >
                          Strategy Description
                        </Text>
                        <Flex
                          mt={1}
                          alignItems={'center'}
                          flexDirection={'row'}
                        >
                          <Text
                            fontWeight={2}
                            fontSize={'15px'}
                            textAlign={'justify'}
                          >
                            {this.props.tokenConfig.description}
                          </Text>
                        </Flex>
                        {
                          this.state.lastHarvest && (
                            <Flex
                              pt={2}
                              mt={2}
                              flexDirection={'column'}
                              alignItems={'flex-start'}
                              borderTop={`1px solid ${this.props.theme.colors.divider}`}
                            >
                              <Flex
                                alignItems={'center'}
                                flexDirection={'row'}
                              >
                                <Text
                                  mr={1}
                                  fontSize={'15px'}
                                  color={'cellText'}
                                  fontWeight={[2,3]}
                                >
                                  Last harvest date:
                                </Text>
                                <ExtLink
                                  href={this.functionsUtil.getEtherscanTransactionUrl(this.state.lastHarvest.transactionHash)}
                                >
                                  <Flex
                                    alignItems={'center'}
                                    flexDirection={'row'}
                                  >
                                    <Text
                                      fontWeight={2}
                                      fontSize={'15px'}
                                    >
                                      {this.functionsUtil.strToMoment(this.state.lastHarvest.timestamp*1000).utc().format("MMM DD YYYY HH:mm")} UTC
                                    </Text>
                                    <Icon
                                      ml={1}
                                      size={'1.1em'}
                                      name={'OpenInNew'}
                                      color={'copyColor'}
                                    />
                                  </Flex>
                                </ExtLink>
                              </Flex>
                              <Flex
                                mt={1}
                                flexDirection={'row'}
                              >
                                <Text
                                  mr={1}
                                  fontSize={'15px'}
                                  color={'cellText'}
                                  fontWeight={[2,3]}
                                >
                                  Last harvest amount:
                                </Text>
                                <Text
                                  fontWeight={2}
                                  fontSize={'15px'}
                                >
                                  {this.functionsUtil.fixTokenDecimals(this.state.lastHarvest.amount,this.props.tokenConfig.decimals).toFixed(8)} {this.props.tokenConfig.token}
                                </Text>
                              </Flex>
                            </Flex>
                          )
                        }
                      </Flex>
                    )
                  }
                </DashboardCard>
              </Box>
              {
                this.props.selectedTranche === 'AA' && this.functionsUtil.BNify(this.state.gaugeStakedBalance).gt(0) ? (
                  <IconBox
                    cardProps={{
                      p:2,
                      mt:2,
                      mb:2,
                      width:1,
                    }}
                    isActive={true}
                    isInteractive={false}
                    iconProps={{
                      size:'1.8em',
                      color:'flashColor'
                    }}
                    icon={'AssignmentLate'}
                    textProps={{
                      fontWeight:500,
                      color:'flashColor',
                      textAlign:'center',
                      fontSize:['13px','15px']
                    }}
                    text={`To withdraw your ${this.props.selectedToken} you need to unstake the tranche tokens from the <a href="${this.functionsUtil.getDashboardSectionUrl(`gauges/${this.props.selectedToken}`)}" class="link">${this.props.selectedToken} Gauge</a> first.`}
                  />
                ) : this.props.selectedToken === 'stETH' && this.props.selectedTranche === 'AA' && (
                  <IconBox
                    cardProps={{
                      p:2,
                      mt:2,
                      mb:2,
                      width:1,
                    }}
                    isActive={true}
                    isInteractive={false}
                    iconProps={{
                      size:'1.8em',
                      color:'flashColor'
                    }}
                    icon={'AssignmentLate'}
                    textProps={{
                      fontWeight:500,
                      color:'flashColor',
                      textAlign:'center',
                      fontSize:['13px','15px']
                    }}
                    text={`With the <a href="https://medium.com/idle-finance/introducing-stkidle-gauges-a-new-stakers-centric-paradigm-for-pyts-and-lps-8c0ef167232e" target="_blank" rel="nofollow noopener noreferrer" class="link">IDLE Gauges release</a>, LDO rewards are going to be distributed via a different staking contract on <strong>Thursday 14 April 2022 16:30:00 GMT</strong>. Please make sure to unstake your stETH from the current staking contract after that date and deposit in the <a href="${this.functionsUtil.getDashboardSectionUrl(`gauges/stETH`)}" class="link">stETH Gauge</a> contract to continue receiving the LDO rewards, alongside the IDLE distribution from Gauges`}
                  />
                )
              }
              <Box
                width={1}
              >
                <Text
                  mb={1}
                >
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
                      border:isDeposit ? 2 : 0
                    }}
                    caption={'Deposit'}
                    width={[1,'32%']}
                    isMobile={this.props.isMobile}
                    imageSrc={'images/deposit.png'}
                    imageProps={{
                      mb:[0,2],
                      height:this.props.isMobile ? '42px' : '52px'
                    }}
                    isActive={isDeposit}
                    handleClick={ e => this.setSelectedAction('deposit') }
                  />
                  <ImageButton
                    buttonProps={{
                      mx:0,
                      border:isStake ? 2 : 0,
                      disabled:!this.state.stakingEnabled
                    }}
                    width={[1,'32%']}
                    caption={'Stake / Unstake'}
                    imageSrc={'images/mint.svg'}
                    isMobile={this.props.isMobile}
                    imageProps={{
                      mb:[0,2],
                      height:this.props.isMobile ? '42px' : '52px'
                    }}
                    isActive={isStake}
                    handleClick={ e => this.setSelectedAction('stake') }
                  />
                  <ImageButton
                    buttonProps={{
                      mx:0,
                      border:isWithdraw ? 2 : 0
                    }}
                    width={[1,'32%']}
                    caption={'Withdraw'}
                    imageSrc={'images/upload.svg'}
                    isMobile={this.props.isMobile}
                    imageProps={{
                      mb:[0,2],
                      height:this.props.isMobile ? '42px' : '52px'
                    }}
                    isActive={isWithdraw}
                    handleClick={ e => this.setSelectedAction('withdraw') }
                  />
                </Flex>
              </Box>
              {
                isStake && this.state.stakingEnabled && (
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
                          width:0.49
                        }}
                        text={'Stake'}
                        icon={'Layers'}
                        iconColor={'deposit'}
                        iconBgColor={'#ced6ff'}
                        handleClick={ e => this.setStakeAction('stake') }
                        isActive={ this.state.selectedStakeAction === 'stake' }
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
                        text={'Unstake'}
                        icon={'LayersClear'}
                        iconColor={'redeem'}
                        iconBgColor={'#ceeff6'}
                        isDisabled={ !this.state.unstakeEnabled }
                        isActive={ this.state.selectedStakeAction === 'unstake' }
                        handleClick={ e => this.state.unstakeEnabled ? this.setStakeAction('unstake') : null }
                      />
                    </Flex>
                  </Box>
                )
              }
              {
                this.state.infoText && this.props.account && (
                  <IconBox
                    cardProps={{
                      p:2,
                      mt:3,
                      mb:2,
                      width:1,
                    }}
                    isActive={true}
                    isInteractive={false}
                    iconProps={{
                      size:'1.2em',
                      color:'flashColor'
                    }}
                    textProps={{
                      fontWeight:500,
                      color:'flashColor',
                      textAlign:'center',
                      fontSize:['13px','15px']
                    }}
                    icon={'LightbulbOutline'}
                    text={this.state.infoText}
                  />
                )
              }
              <Flex
                width={1}
                alignItems={'stretch'}
                flexDirection={'column'}
                justifyContent={'center'}
              >
                {
                  ((isStake && !this.state.stakingEnabled) || (isStake && this.state.selectedStakeAction === 'stake' && !this.state.stakeEnabled)) ? (
                    <DashboardCard
                      cardProps={{
                        p: 2,
                        mt: 2
                      }}
                    >
                      <Flex
                        width={1}
                        alignItems={'center'}
                        flexDirection={'column'}
                        justifyContent={'center'}
                      >
                        <Icon
                          size={'1.8em'}
                          color={'cellText'}
                          name={'DoNotDisturb'}
                        />
                        <Text
                          mt={1}
                          color={'cellText'}
                          textAlign={'center'}
                        >
                          Staking is not enabled for this Tranche.
                        </Text>
                      </Flex>
                    </DashboardCard>
                  ) : isStake && this.state.selectedStakeAction === 'stake' && this.state.gaugeConfig ? (
                    <IconBox
                      cardProps={{
                        mt: 2
                      }}
                      icon={'LightbulbOutline'}
                      text={`To earn additional staking rewards deposit your tranche token in the <a href="${this.functionsUtil.getDashboardSectionUrl(`gauges/${this.props.selectedToken}`)}" class="link">${this.props.selectedToken} Gauge</a>.`}
                    >
                      <RoundButton
                        buttonProps={{
                          mt:2,
                          width:[1,1/2]
                        }}
                        handleClick={e => this.props.goToSection(`gauges/${this.props.selectedToken}`)}
                      >
                        Go to Gauge
                      </RoundButton>
                    </IconBox>
                  ) : isStake && this.state.selectedStakeAction === 'unstake' && !this.props.trancheConfig.CDORewards.unstakeWithBalance ? (
                    <DashboardCard
                      cardProps={{
                        p: 2,
                        pb: 3,
                        mt: 3
                      }}
                    >
                      <Flex
                        alignItems={'center'}
                        flexDirection={'column'}
                      >
                        <Icon
                          size={'1.8em'}
                          color={'cellText'}
                          name={'MonetizationOn'}
                        />
                        <Text
                          mt={1}
                          mb={3}
                          fontSize={[2,3]}
                          color={'cellText'}
                          textAlign={'center'}
                        >
                          You can unstake <strong>{this.state.stakedBalance.toFixed(8)} {this.state.tokenConfig.label}</strong>.
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
                            borderRadius:4,
                            value:'Unstake',
                            mainColor:'redeem',
                          }}
                          action={'Unstake'}
                          contractName={this.state.contractInfo.name}
                          callback={this.transactionSucceeded.bind(this)}
                          methodName={this.props.trancheConfig.functions.unstake}
                        />
                      </Flex>
                    </DashboardCard>
                  ) : (
                    <SendTxWithBalance
                      error={null}
                      {...this.props}
                      buttonProps={{
                        width:[1,0.45]
                      }}
                      permitEnabled={false}
                      tokenConfig={this.state.tokenConfig}
                      tokenBalance={this.state.balanceProp}
                      contractInfo={this.state.contractInfo}
                      checkLimit={this.checkLimit.bind(this)}
                      approveEnabled={this.state.approveEnabled}
                      buttonDisabled={this.state.buttonDisabled}
                      callback={this.transactionSucceeded.bind(this)}
                      approveDescription={this.state.approveDescription}
                      changeInputCallback={this.changeInputCallback.bind(this)}
                      contractApproved={this.contractApprovedCallback.bind(this)}
                      getTransactionParams={this.getTransactionParams.bind(this)}
                      action={this.functionsUtil.capitalize(this.state.actionLabel)}
                    >
                      {
                        isDeposit ? (
                          <Flex
                            width={1}
                            alignItems={'stretch'}
                            flexDirection={'column'}
                            justifyContent={'center'}
                          >
                            <BuyModal
                              {...this.props}
                              showInline={true}
                              availableMethods={[]}
                              buyToken={this.props.selectedToken}
                            >
                              {
                                this.props.tokenConfig.messages && this.props.tokenConfig.messages.buyInstructions ? (
                                  <DashboardCard
                                    cardProps={{
                                      p: 2,
                                      my: 2
                                    }}
                                  >
                                    <Flex
                                      width={1}
                                      alignItems={'center'}
                                      flexDirection={'column'}
                                      justifyContent={'center'}
                                    >
                                      <Icon
                                        size={'1.8em'}
                                        name={'MoneyOff'}
                                        color={'cellText'}
                                      />
                                      <Text
                                        mt={1}
                                        color={'cellText'}
                                        textAlign={'center'}
                                      >
                                        You don't have any <strong>{this.props.selectedToken}</strong> to deposit.
                                      </Text>
                                      <Text
                                        mt={1}
                                        color={'cellText'}
                                        textAlign={'center'}
                                        dangerouslySetInnerHTML={{__html:this.props.tokenConfig.messages.buyInstructions}}>
                                      </Text>
                                    </Flex>
                                  </DashboardCard>
                                ) : null
                              }
                            </BuyModal>
                          </Flex>
                        ) : isStake ? (
                          <DashboardCard
                            cardProps={{
                              p: 2,
                              my: 2
                            }}
                          >
                            <Flex
                              width={1}
                              alignItems={'center'}
                              flexDirection={'column'}
                              justifyContent={'center'}
                            >
                              <Icon
                                size={'1.8em'}
                                name={'MoneyOff'}
                                color={'cellText'}
                              />
                              <Text
                                mt={1}
                                color={'cellText'}
                                textAlign={'center'}
                              >
                                You don't have any <strong>{this.state.tokenConfig.label}</strong> token to {this.state.selectedStakeAction}.
                              </Text>
                            </Flex>
                          </DashboardCard>
                        ) : isWithdraw && (
                          <DashboardCard
                            cardProps={{
                              p: 2,
                              my: 2
                            }}
                          >
                            <Flex
                              width={1}
                              alignItems={'center'}
                              flexDirection={'column'}
                              justifyContent={'center'}
                            >
                              <Icon
                                size={'1.8em'}
                                name={'MoneyOff'}
                                color={'cellText'}
                              />
                              <Text
                                mt={1}
                                color={'cellText'}
                                textAlign={'center'}
                              >
                                You don't have any {this.props.selectedToken} to withdraw.<br />If you have staked your <strong>{this.state.tokenConfig.label}</strong> tokens please unstake them to be able to withdraw your {this.props.selectedToken}.
                            </Text>
                            </Flex>
                          </DashboardCard>
                        )
                      }
                    </SendTxWithBalance>
                  )
                }
              </Flex>
              <LimitReachedModal
                {...this.props}
                limit={trancheLimit}
                closeModal={this.resetModal}
                isOpen={this.state.activeModal === 'limit'}
              />
              <ShareModal
                confettiEnabled={true}
                icon={`images/medal.svg`}
                title={`Congratulations!`}
                account={this.props.account}
                closeModal={this.resetModal}
                tokenName={this.props.selectedToken}
                isOpen={this.state.activeModal === 'share'}
                text={`You have successfully ${this.state.modalAction} in Idle!<br />Enjoy <strong>${this.state.modalApy ? this.state.modalApy.toFixed(2) : '0.00'}% APY</strong> on your <strong>${this.props.selectedToken}</strong>!`}
                tweet={`I'm earning ${this.state.modalApy ? this.state.modalApy.toFixed(2) : '0.00'}% APY on my ${this.props.selectedToken} with @idlefinance tranches! Go to ${this.functionsUtil.getGlobalConfig(['baseURL'])}${this.props.selectedSection.route} and start earning now from your idle tokens!`}
              />
            </Flex>
          )
        }
      </Flex>
    );
  }
}

export default TrancheDetails;
