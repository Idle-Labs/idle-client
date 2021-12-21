import IconBox from '../IconBox/IconBox';
import React, { Component } from 'react';
import FlexLoader from '../FlexLoader/FlexLoader';
import ImageButton from '../ImageButton/ImageButton';
import FunctionsUtil from '../utilities/FunctionsUtil';
import BuyModal from '../utilities/components/BuyModal';
import TrancheField from '../TrancheField/TrancheField';
import { Flex, Text, Image, Box, Icon } from "rimble-ui";
import DashboardCard from '../DashboardCard/DashboardCard';
import ShareModal from '../utilities/components/ShareModal';
// import StatsCardSmall from '../StatsCardSmall/StatsCardSmall';
import CardIconButton from '../CardIconButton/CardIconButton';
import GenericSelector from '../GenericSelector/GenericSelector';
import SendTxWithBalance from '../SendTxWithBalance/SendTxWithBalance';
import LimitReachedModal from '../utilities/components/LimitReachedModal';

class TrancheDetails extends Component {

  state = {
    infoText:null,
    canUnstake:null,
    canWithdraw:null,
    activeModal:null,
    actionLabel:null,
    balanceProp:null,
    tokenConfig:null,
    contractInfo:null,
    tranchePrice:null,
    tokenBalance:null,
    stakeEnabled:true,
    stakedBalance:null,
    unstakeEnabled:true,
    trancheBalance:null,
    stakingEnabled:true,
    approveEnabled:null,
    buttonDisabled:false,
    selectedTranche:null,
    availableTranches:null,
    approveDescription:null,
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

    const [
      // blockNumber,
      tokenBalance,
      trancheBalance,
      // cdoCoolingPeriod,
      // latestHarvestBlock,
      // stakeCoolingPeriod,
      // rewardsTokensInfo,
      // userStakeBlock,
      stakedBalance,
      trancheAPY,
      tranchePrice
    ] = await Promise.all([
      // this.functionsUtil.getBlockNumber(),
      this.functionsUtil.getTokenBalance(this.props.selectedToken,this.props.account),
      this.functionsUtil.getTokenBalance(this.props.trancheConfig.name,this.props.account),
      // this.functionsUtil.genericContractCall(this.props.tokenConfig.CDO.name,'coolingPeriod'),
      // this.functionsUtil.genericContractCall(this.props.tokenConfig.CDO.name,'latestHarvestBlock'),
      // this.functionsUtil.genericContractCall(this.props.trancheConfig.CDORewards.name,'coolingPeriod'),
      // this.functionsUtil.getTrancheRewardTokensInfo(this.props.tokenConfig,this.props.trancheConfig),
      // this.functionsUtil.genericContractCall(this.props.trancheConfig.CDORewards.name,'usersStakeBlock',[this.props.account]),
      this.functionsUtil.getTrancheStakedBalance(this.props.trancheConfig.CDORewards.name,this.props.account,this.props.trancheConfig.CDORewards.decimals),
      this.functionsUtil.loadTrancheFieldRaw('trancheApy',{},this.props.selectedProtocol,this.props.selectedToken,this.props.selectedTranche,this.props.tokenConfig,this.props.trancheConfig,this.props.account),
      this.functionsUtil.loadTrancheFieldRaw('lastTranchePrice',{},this.props.selectedProtocol,this.props.selectedToken,this.props.selectedTranche,this.props.tokenConfig,this.props.trancheConfig,this.props.account)
    ]);

    const userHasAvailableFunds = trancheBalance && trancheBalance.gt(0);


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

    const selectedTrancheOption = availableTranches.find( trancheInfo => trancheInfo.value === this.props.selectedTranche );
    const selectedTranche = selectedTrancheOption.value;

    const stakingRewards = this.props.trancheConfig.CDORewards.stakingRewards.filter( t => t.enabled );
    let stakingEnabled = stakingRewards.length>0;
    const stakeEnabled = stakingEnabled && userHasAvailableFunds;
    const unstakeEnabled = stakedBalance && this.functionsUtil.BNify(stakedBalance).gt(0);

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
      tokenBalance,
      stakeEnabled,
      tranchePrice,
      stakedBalance,
      stakingEnabled,
      trancheBalance,
      unstakeEnabled,
      selectedTranche,
      availableTranches,
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
    let infoText = trancheDetails.description[this.state.selectedAction];

    switch (this.state.selectedAction){
      case 'deposit':
        approveEnabled = true;
        contractInfo = this.props.cdoConfig;
        tokenConfig = this.props.tokenConfig;
        balanceProp = this.state.tokenBalance;
      break;
      case 'stake':
        actionLabel = this.state.selectedStakeAction;
        switch (this.state.selectedStakeAction){
          case 'stake':
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
        if (this.state.stakingEnabled){
          infoText = trancheDetails.description[this.state.selectedStakeAction];
        } else {
          infoText = null;
        }
      break;
      case 'withdraw':
        approveEnabled = false;
        contractInfo = this.props.cdoConfig;
        // tokenConfig = this.props.tokenConfig;
        tokenConfig = this.props.trancheConfig;
        balanceProp = this.state.trancheBalance;
        // balanceProp = this.state.trancheBalance.times(this.state.tranchePrice);
        // console.log('balanceProp',this.state.trancheBalance.toFixed(),this.state.tranchePrice.toFixed(),balanceProp.toFixed());
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

  getTransactionParams(amount){
    let methodName = null;
    let methodParams = null;

    if (this.props.trancheConfig.functions[this.state.selectedAction]){
      methodName = this.props.trancheConfig.functions[this.state.selectedAction];

      if (this.state.selectedAction === 'stake'){
        methodName = this.props.trancheConfig.functions[this.state.selectedStakeAction];
      }

      methodParams = [amount];
    }

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
    switch (this.state.selectedAction){
      case 'stake':
      case 'deposit':
        if (this.state.selectedAction === 'deposit' || this.state.selectedStakeAction === 'stake'){
          this.setState({
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
                      <Text
                        fontSize={[1,2]}
                        fontWeight={[2,3]}
                      >
                        Auto-Farming
                      </Text>
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
                      <Text
                        fontSize={[1,2]}
                        fontWeight={[2,3]}
                      >
                        Staking Rewards
                      </Text>
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
                      <Text
                        fontSize={[1,2]}
                        fontWeight={[2,3]}
                      >
                        APY
                      </Text>
                      <Flex
                        flexDirection={'column'}
                        alignItems={'flex-start'}
                        justifyContent={'flex-start'}
                      >
                        <TrancheField
                          {...this.props}
                          fieldInfo={{
                            name:'trancheApy',
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
                              <Text
                                fontSize={1}
                                fontWeight={2}
                                lineHeight={'1'}
                                color={'cellText'}
                              >
                                +
                              </Text>
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
                      <Text
                        fontSize={[1,2]}
                        fontWeight={[2,3]}
                      >
                        Apr Ratio
                      </Text>
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
                </DashboardCard>
              </Box>
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
                    imageSrc={'images/deposit.png'}
                    isMobile={this.props.isMobile}
                    // subcaption={'stake LP Tokens'}
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
                    // subcaption={'withdraw LP tokens'}
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
                  isStake && !this.state.stakingEnabled ? (
                    <DashboardCard
                      cardProps={{
                        p: 2,
                        mt: 3
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
                            />
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
                text={`You have successfully deposited in Idle!<br />Enjoy <strong>${this.state.trancheAPY ? this.state.trancheAPY.toFixed(2) : '0.00'}% APY</strong> on your <strong>${this.props.selectedToken}</strong>!`}
                tweet={`I'm earning ${this.state.trancheAPY ? this.state.trancheAPY.toFixed(2) : '0.00'}% APY on my ${this.props.selectedToken} with @idlefinance tranches! Go to ${this.functionsUtil.getGlobalConfig(['baseURL'])}${this.props.selectedSection.route} and start earning now from your idle tokens!`}
              />
            </Flex>
          )
        }
      </Flex>
    );
  }
}

export default TrancheDetails;
