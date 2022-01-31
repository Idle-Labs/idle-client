import React, { Component } from 'react';
import FlexLoader from '../FlexLoader/FlexLoader';
import TooltipText from '../TooltipText/TooltipText';
import { Flex, Text, Image, Button } from "rimble-ui";
import FunctionsUtil from '../utilities/FunctionsUtil';
import TrancheField from '../TrancheField/TrancheField';
import DashboardCard from '../DashboardCard/DashboardCard';
import ShareModal from '../utilities/components/ShareModal';
import LimitReachedModal from '../utilities/components/LimitReachedModal';

class TrancheDetails extends Component {

  state = {
    infoText:null,
    canUnstake:null,
    canWithdraw:null,
    activeModal:null,
    balanceProp:null,
    tokenConfig:null,
    contractInfo:null,
    tranchePrice:null,
    tokenBalance:null,
    stakedBalance:null,
    trancheBalance:null,
    approveEnabled:null,
    buttonDisabled:false,
    approveDescription:null,
    selectedAction:'deposit',
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

    const selectedActionChange = prevState.selectedAction !== this.state.selectedAction;
    if (selectedActionChange){
      this.loadActionData();
    }
  }

  async loadData(){

    if (!this.props.account){
      return null;
    }

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
      this.functionsUtil.getTrancheStakedBalance(this.props.trancheConfig.CDORewards.name,this.props.account,this.props.trancheConfig.CDORewards.decimals,this.props.trancheConfig.functions.stakedBalance),
      this.functionsUtil.loadTrancheFieldRaw('trancheApy',{},this.props.selectedProtocol,this.props.selectedToken,this.props.selectedTranche,this.props.tokenConfig,this.props.trancheConfig,this.props.account),
      this.functionsUtil.loadTrancheFieldRaw('lastTranchePrice',{},this.props.selectedProtocol,this.props.selectedToken,this.props.selectedTranche,this.props.tokenConfig,this.props.trancheConfig,this.props.account)
    ]);

    const userHasAvailableFunds = trancheBalance && trancheBalance.gt(0);
    const canUnstake = true; // !stakeCoolingPeriod || this.functionsUtil.BNify(userStakeBlock).plus(stakeCoolingPeriod).lt(blockNumber);
    const canWithdraw = true; // !cdoCoolingPeriod || !latestHarvestBlock || this.functionsUtil.BNify(latestHarvestBlock).plus(cdoCoolingPeriod).lt(blockNumber);
    
    // console.log('loadData',this.props.trancheConfig.tranche,blockNumber,cdoCoolingPeriod,latestHarvestBlock,stakeCoolingPeriod,userStakeBlock,canUnstake,canWithdraw);

    this.setState({
      trancheAPY,
      canUnstake,
      canWithdraw,
      tokenBalance,
      tranchePrice,
      stakedBalance,
      trancheBalance,
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

    const approveDescription = `To ${this.state.selectedAction} your <strong>${tokenConfig.token}</strong> you need to approve the Smart-Contract first.`;

    // console.log('loadActionData',approveEnabled);

    this.setState({
      infoBox,
      infoText,
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

      // if (this.state.selectedAction === 'withdraw'){

      // }

      methodParams = [amount];
    }

    console.log('getTransactionParams',methodName,methodParams);

    return {
      methodName,
      methodParams
    };
  }

  async checkLimit(amount){
    const trancheLimit = this.functionsUtil.BNify(this.props.tokenConfig.limit);
    const poolSize = await this.functionsUtil.loadTrancheFieldRaw(`pool`,{},this.props.selectedProtocol,this.props.selectedToken,this.props.selectedTranche,this.props.tokenConfig,this.props.trancheConfig,this.props.account);
    if (poolSize.plus(amount).gt(trancheLimit)){
      this.setState({
        activeModal:'limit'
      })
      return false;
    }
    return true;
  }

  transactionSucceeded(){
    this.loadData();
    switch (this.state.selectedAction){
      case 'stake':
      case 'deposit':
        this.setState({
          activeModal:'share'
        })
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

  render() {
    const trancheDetails = this.functionsUtil.getGlobalConfig(['tranches',this.props.selectedTranche]);
    const otherTrancheType = this.props.selectedTranche === 'AA' ? 'BB' : 'AA';
    const otherTrancheDetails = this.functionsUtil.getGlobalConfig(['tranches',otherTrancheType]);
    const trancheLimit = this.functionsUtil.formatMoney(this.functionsUtil.BNify(this.props.tokenConfig.limit),0)+' '+this.props.selectedToken;
    const stakingRewards = this.props.trancheConfig.CDORewards.stakingRewards.filter( t => t.enabled );
    return (
      <Flex
        width={1}
        alignItems={'center'}
        flexDirection={'column'}
        justifyContent={'center'}
        maxWidth={['100%','45em']}
      >
        {
          !this.props.showSelectButton && (
            <Flex
              width={1}
              alignItems={'center'}
              justifyContent={'flex-end'}
            >
              <Button
                mb={2}
                size={'small'}
                width={'auto'}
                contrastColor={'cardBg'}
                icon={otherTrancheDetails.icon}
                mainColor={otherTrancheDetails.color.hex}
                onClick={e => this.props.selectTrancheType(otherTrancheDetails.route)}
              >
                Switch to {otherTrancheDetails.name}
              </Button>
            </Flex>
          )
        }
        <DashboardCard
          cardProps={{
            py:3,
            px:3,
            border:null,
            // style:{
            //   border:`1px solid ${trancheDetails.color.hex}`
            // }
          }}
        >
          <Flex
            pb={2}
            mb={2}
            alignItems={'center'}
            flexDirection={'row'}
            borderBottom={`1px solid ${trancheDetails.color.hex}`}
          > 
            <Image
              mr={2}
              src={trancheDetails.image}
              size={this.props.isMobile ? '1.6em' : '1.8em'}
            />
            <Text
              fontWeight={4}
              fontSize={[3,4]}
              color={'copyColor'}
            >
              {trancheDetails.name}
            </Text>
          </Flex>
          <Flex
            style={{
              flexBasis:'0',
              flex:'1 1 0px',
              flexWrap:'wrap',
              borderBottom:`1px solid ${this.props.theme.colors.divider}`
            }}
            alignItems={'flex-start'}
            justifyContent={'flex-start'}
          >
            <Flex
              mb={3}
              width={[0.5,0.33]}
              flexDirection={'column'}
            >
              <Text
                mb={1}
                fontWeight={3}
                fontSize={[1,2]}
                color={'cellText'}
              >
                Protocol
              </Text>
              <Flex
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
              mb={3}
              width={[0.5,0.33]}
              flexDirection={'column'}
            >
              <Text
                mb={1}
                fontWeight={3}
                fontSize={[1,2]}
                color={'cellText'}
              >
                Token
              </Text>
              <Flex
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
              mb={3}
              width={[0.5,0.33]}
              flexDirection={'column'}
            >
              <Text
                fontWeight={3}
                fontSize={[1,2]}
                color={'cellText'}
              >
                Pool Size
              </Text>
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
            <Flex
              mb={3}
              width={[0.5,0.33]}
              flexDirection={'column'}
              alignItems={'flex-start'}
            >
              <TooltipText
                flexProps={{
                  mb:1
                }}
                text={'Auto-Compounding'}
                tooltipProps={{
                  message:this.functionsUtil.getGlobalConfig(['messages','autoFarming'])
                }}
              />
              <TrancheField
                {...this.props}
                fieldInfo={{
                  name:'autoFarming',
                  parentProps:{
                    justifyContent:'flex-start'
                  }
                }}
                token={this.props.selectedToken}
                tokenConfig={this.props.tokenConfig}
                protocol={this.props.selectedProtocol}
                trancheConfig={this.props.trancheConfig}
              />
            </Flex>
            <Flex
              mb={3}
              width={[0.5,0.33]}
              flexDirection={'column'}
            >
              <TooltipText
                flexProps={{
                  mb:1
                }}
                text={'Staking Rewards'}
                tooltipProps={{
                  message:this.functionsUtil.getGlobalConfig(['messages','stakingRewards'])
                }}
              />
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
            <Flex
              mb={3}
              width={[0.5,0.33]}
              flexDirection={'column'}
            >
              <TooltipText
                text={'APY'}
                tooltipProps={{
                  message:this.functionsUtil.getGlobalConfig(['messages','apyTranches'])
                }}
              />
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
                    alignItems={'center'}
                    flexDirection={'row'}
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
            <Flex
              mb={3}
              width={[0.5,0.33]}
              flexDirection={'column'}
              alignItems={'flex-start'}
            >
              <TooltipText
                text={'Apr Ratio'}
                tooltipProps={{
                  message:this.functionsUtil.getGlobalConfig(['messages','aprRatio'])
                }}
              />
              <TrancheField
                {...this.props}
                fieldInfo={{
                  name:'trancheAPRRatio',
                  props:{
                    fontWeight:3,
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
            <Flex
              mb={3}
              width={[0.5,0.33]}
              flexDirection={'column'}
              alignItems={'flex-start'}
            >
              <Text
                fontWeight={3}
                fontSize={[1,2]}
                color={'cellText'}
              >
                Status
              </Text>
              <TrancheField
                {...this.props}
                fieldInfo={{
                  name:'statusBadge',
                  props:{
                    fontWeight:3,
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
            {
              (this.props.tokenConfig.experimental || !this.props.isMobile) && (
                <Flex
                  mb={3}
                  width={[0.5,0.33]}
                  flexDirection={'column'}
                  alignItems={'flex-start'}
                >
                  <Text
                    fontWeight={3}
                    fontSize={[1,2]}
                    color={'cellText'}
                  >
                    Limit Cap
                  </Text>
                  <TrancheField
                    {...this.props}
                    fieldInfo={{
                      name:'trancheLimit',
                      props:{
                        decimals:3,
                        fontWeight:3,
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
              )
            }
          </Flex>
          {
            this.props.showSelectButton ? (
                <Button
                  mt={3}
                  width={1}
                  contrastColor={'cardBg'}
                  icon={trancheDetails.icon}
                  mainColor={trancheDetails.color.hex}
                  onClick={e => this.props.selectTrancheType(trancheDetails.route)}
                >
                  {
                    this.props.tokenConfig ? `Go to ${trancheDetails.name}` : `Start with ${trancheDetails.name}`
                  }
                </Button>
            ) : (
              <FlexLoader
                flexProps={{
                  mt:3,
                  flexDirection:'row'
                }}
                loaderProps={{
                  size:'30px'
                }}
                textProps={{
                  ml:2
                }}
                text={'Loading Tranche Data...'}
              />
            )
          }
        </DashboardCard>
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
    );
  }
}

export default TrancheDetails;
