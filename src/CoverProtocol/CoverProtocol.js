import React, { Component } from 'react';
import { Flex, Box, Text } from "rimble-ui";
import FlexLoader from '../FlexLoader/FlexLoader';
import AssetField from '../AssetField/AssetField';
import ImageButton from '../ImageButton/ImageButton';
import FunctionsUtil from '../utilities/FunctionsUtil';
import BuyModal from '../utilities/components/BuyModal';
import GenericSelector from '../GenericSelector/GenericSelector';
import SendTxWithBalance from '../SendTxWithBalance/SendTxWithBalance';

class CoverProtocol extends Component {

  state = {
    steps:null,
    infoBox:null,
    swapInfo:null,
    portfolio:null,
    inputValue:null,
    description:null,
    tokenConfig:null,
    tokenBalance:null,
    contractInfo:null,
    selectedToken:null,
    selectedAction:null,
    successMessage:null,
    activeCoverages:null,
    defaultCoverage:null,
    selectedCoverage:null,
    contractApproved:false,
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

  async componentWillMount(){
    this.loadUtils();
    this.loadData();
  }

  async componentDidUpdate(prevProps,prevState){
    this.loadUtils();

    const selectedCoverageChanged = prevState.selectedCoverage !== this.state.selectedCoverage;
    if (selectedCoverageChanged){
      const selectedToken = this.state.selectedCoverage.collateral;
      const tokenConfig = Object.values(this.props.availableStrategies)[0][selectedToken];
      const tokenBalance = await this.functionsUtil.getTokenBalance(selectedToken,this.props.account);
      const selectedAction = !this.state.selectedAction ? (this.props.urlParams.param2 || null) : this.state.selectedAction;
      this.setState({
        tokenConfig,
        tokenBalance,
        selectedToken,
        selectedAction
      });
    }

    const contractApprovedChanged = prevState.contractApproved !== this.state.contractApproved;
    const selectedActionChanged = prevState.selectedAction !== this.state.selectedAction;
    const inputValueChanged = prevState.inputValue !== this.state.inputValue && this.state.inputValue.gt(0);
    const swapInfoChanged = JSON.stringify(prevState.swapInfo) !== JSON.stringify(this.state.swapInfo) && this.state.inputValue && this.state.inputValue.gt(0);
    if (selectedActionChanged || inputValueChanged || swapInfoChanged || contractApprovedChanged){
      this.updateData();
    }

    const contractInfoChanged = JSON.stringify(prevState.contractInfo) !== JSON.stringify(this.state.contractInfo);
    if (contractInfoChanged){
      this.changeInputCallback();
    }
  }

  async getSwapInfo(amount){
    amount = this.functionsUtil.BNify(amount);
    if (!amount.isNaN() && amount.gt(0)){
      // console.log('getSwapInfo',this.state.contractInfo.name,this.state.tokenConfig.address,balancerTokenConfig.address,swapFee,covTokens,tokenPrice);

      if (this.state.tokenPrice && this.state.swapFee && this.state.covTokens){

        const swapFee = this.state.swapFee;
        const covTokens = this.state.covTokens;
        const tokenPrice = this.state.tokenPrice;
        let tokenAmountOut = amount.div(tokenPrice);
        tokenAmountOut = tokenAmountOut.minus(tokenAmountOut.times(swapFee));

        return {
          amount,
          tokenAmountOut
        };
      }
    }

    return null;
  }

  async changeInputCallback(inputValue=null){
    let swapInfo = null;
    let updateData = false;
    let balanceSelectorInfo = null;
    inputValue = inputValue || this.state.inputValue;

    if (inputValue && this.functionsUtil.BNify(inputValue).gt(0)){
      switch (this.state.selectedAction){
        case 'Mint':
          balanceSelectorInfo = {
            color:this.props.theme.colors.transactions.status.completed,
            text:`You will Mint: ${inputValue.toFixed(4)} CLAIM and NOCLAIM`
          };
        break;
        case 'Claim':
        case 'NoClaim':
          const amount = this.functionsUtil.normalizeTokenAmount(inputValue,this.state.tokenConfig.decimals);
          swapInfo = await this.getSwapInfo(amount);
          if (swapInfo){
            if (swapInfo.tokenAmountOut.lte(this.state.covTokens)){
              balanceSelectorInfo = {
                color:this.props.theme.colors.transactions.status.completed,
                text:`You will Buy: ~${this.functionsUtil.fixTokenDecimals(swapInfo.tokenAmountOut,18).toFixed(4)} ${this.state.selectedAction}`
              };
            } else {
              balanceSelectorInfo = {
                text:`Not enough liquidity`,
                color:this.props.theme.colors.transactions.status.failed,
              };
            }
          }
        break;
        default:
        break;
      }
    }

    this.setState({
      swapInfo,
      inputValue,
      balanceSelectorInfo
    });
  }

  async getTransactionParams(amount){
    let methodName = null;
    let methodParams = null;
    amount = this.functionsUtil.BNify(amount);
    const MAX_UINT256 = this.functionsUtil.BNify(2).pow(256).minus(1).toFixed(0);
    switch (this.state.selectedAction){
      case 'Mint':
        methodName = 'addCover';
        methodParams = [this.state.tokenConfig.address,parseInt(this.state.selectedCoverage.expirationTimestamp),this.functionsUtil.integerValue(amount)];
      break;
      case 'Claim':
      case 'NoClaim':
        methodName = 'swapExactAmountOut';
        const balancerTokenConfig = this.state.selectedCoverage.tokens[this.state.selectedAction];
        const swapInfo = await this.getSwapInfo(amount);
        if (swapInfo){
          if (swapInfo.tokenAmountOut.lte(this.state.covTokens)){
            methodParams = [this.state.tokenConfig.address,this.functionsUtil.integerValue(amount),balancerTokenConfig.address, this.functionsUtil.integerValue(swapInfo.tokenAmountOut), MAX_UINT256];
          } else {
            return null;
          }
        }
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
    let infoBox = null;
    const dashboardUrl = `#${this.functionsUtil.getGlobalConfig(['dashboard','baseRoute'])}/best`;
    const fixedAmount = this.functionsUtil.fixTokenDecimals(amount,this.state.tokenConfig.decimals);
    switch (this.state.selectedAction){
      case 'Mint':
        const mintedClaimLog = tx.txReceipt && tx.txReceipt.logs ? tx.txReceipt.logs.find( log => log.address.toLowerCase() === this.state.selectedCoverage.tokens['Claim'].address ) : null;
        const mintedNoClaimLog = tx.txReceipt && tx.txReceipt.logs ? tx.txReceipt.logs.find( log => log.address.toLowerCase() === this.state.selectedCoverage.tokens['NoClaim'].address ) : null;
        const mintedClaimAmount = mintedClaimLog ? this.functionsUtil.fixTokenDecimals(parseInt(mintedClaimLog.data,16),this.state.contractInfo.decimals) : fixedAmount;
        const mintedNoClaimAmount = mintedNoClaimLog ? this.functionsUtil.fixTokenDecimals(parseInt(mintedNoClaimLog.data,16),this.state.contractInfo.decimals) : fixedAmount;
        infoBox = {
          icon:'DoneAll',
          iconProps:{
            color:this.props.theme.colors.transactions.status.completed
          },
          text:`You have successfully minted <strong>${mintedClaimAmount.toFixed(4)} CLAIM</strong> and <strong>${mintedNoClaimAmount.toFixed(4)} NOCLAIM</strong> tokens<br /><a href="${dashboardUrl}" styles="text-align:center;font-size:14px;color:${this.props.theme.colors.primary}">Go to Dashboard</a>`
        }
      break;
      case 'Claim':
        const claimTokenConfig = this.state.selectedCoverage.tokens[this.state.selectedAction];
        const claimTokensLog = tx.txReceipt && tx.txReceipt.logs ? tx.txReceipt.logs.find( log => log.address.toLowerCase() === claimTokenConfig.address ) : null;
        const receivedClaimAmount = claimTokensLog ? this.functionsUtil.fixTokenDecimals(parseInt(claimTokensLog.data,16),claimTokenConfig.balancerPool.decimals) : this.functionsUtil.fixTokenDecimals(params[3],claimTokenConfig.balancerPool.decimals);
        infoBox = {
          icon:'DoneAll',
          iconProps:{
            color:this.props.theme.colors.transactions.status.completed
          },
          text:`You have successfully bought <strong>${receivedClaimAmount.toFixed(4)} ${this.state.selectedAction}</strong> tokens, you are now covered in the event that there is a successful attack on the protocol<br /><a href="${dashboardUrl}" styles="text-align:center;font-size:14px;color:${this.props.theme.colors.primary}">Go to Dashboard</a>`
        }
      break;
      case 'NoClaim':
        debugger;
        const noClaimTokenConfig = this.state.selectedCoverage.tokens[this.state.selectedAction];
        const noClaimTokensLog = tx.txReceipt && tx.txReceipt.logs ? tx.txReceipt.logs.find( log => log.address.toLowerCase() === noClaimTokenConfig.address ) : null;
        const receivedNoClaimAmount = noClaimTokensLog ? this.functionsUtil.fixTokenDecimals(parseInt(noClaimTokensLog.data,16),noClaimTokenConfig.balancerPool.decimals) : this.functionsUtil.fixTokenDecimals(params[3],noClaimTokenConfig.balancerPool.decimals);
        infoBox = {
          icon:'DoneAll',
          iconProps:{
            color:this.props.theme.colors.transactions.status.completed
          },
          text:`You have successfully bought <strong>${receivedNoClaimAmount.toFixed(4)} ${this.state.selectedAction}</strong> tokens, you will be rewarded if there is no successful attack on the protocol by the expiry date<br /><a href="${dashboardUrl}" styles="text-align:center;font-size:14px;color:${this.props.theme.colors.primary}">Go to Dashboard</a>`
        }
      break;
      default:
      break;
    }

    // Set second step completed
    let steps = this.state.steps;
    steps[1].completed = true;

    const transactionSucceeded = true;
    const tokenBalance = await this.functionsUtil.getTokenBalance(this.state.selectedToken,this.props.account);

    // console.log('transactionSucceeded',infoBox);

    this.setState({
      steps,
      infoBox,
      tokenBalance,
      transactionSucceeded
    });
  }

  async updateData(){
    let apy = null;
    const steps = [];
    let infoBox = null;
    let swapFee = null;
    let covTokens = null;
    let tokenPrice = null;
    let tokenAmount = null;
    let contractInfo = null;
    let collateralAmount = null;
    let approveDescription = null;

    const claimTokenConfig = this.state.selectedCoverage.tokens['Claim'];
    const noClaimTokenConfig = this.state.selectedCoverage.tokens['NoClaim'];
    const balancerClaimConfig = claimTokenConfig.balancerPool;
    const balancerNoClaimConfig = noClaimTokenConfig.balancerPool;

    await Promise.all([
      this.props.initContract(claimTokenConfig.name,claimTokenConfig.address,claimTokenConfig.abi),
      this.props.initContract(noClaimTokenConfig.name,noClaimTokenConfig.address,noClaimTokenConfig.abi),
      this.props.initContract(balancerClaimConfig.name,balancerClaimConfig.address,balancerClaimConfig.abi),
      this.props.initContract(balancerNoClaimConfig.name,balancerNoClaimConfig.address,balancerNoClaimConfig.abi)
    ]);

    const [
      claimTokenBalance,
      noClaimTokenBalance,
      balancerPoolClaimBalance,
      balancerPoolNoClaimBalance
    ] = await Promise.all([
      // Get Claim token balance
      this.functionsUtil.getTokenBalance(claimTokenConfig.name,this.props.account),
      // Get NOCLAIM token balance
      this.functionsUtil.getTokenBalance(noClaimTokenConfig.name,this.props.account),
      // Get Balancer Claim token Pool balance
      this.functionsUtil.getTokenBalance(balancerClaimConfig.name,this.props.account),
      // Get Balancer NOCLAIM token Pool balance
      this.functionsUtil.getTokenBalance(balancerNoClaimConfig.name,this.props.account)
    ]);

    // Check if user has both Claim and NOCLAIM tokens
    const hasMintedTokens = claimTokenBalance && noClaimTokenBalance && claimTokenBalance.gt(0) && noClaimTokenBalance.gt(0);

    // Set Contract Info
    switch (this.state.selectedAction){
      case 'Mint':
        contractInfo = this.props.toolProps.contract;
      break;
      case 'NoClaim':
        contractInfo = noClaimTokenConfig.balancerPool;
      break;
      case 'Claim':
        contractInfo = claimTokenConfig.balancerPool;
      break;
      default:
      break;
    }

    const balancerTokenConfig = this.state.selectedCoverage.tokens[this.state.selectedAction];

    if (contractInfo){
      if (balancerTokenConfig){
        [
          swapFee,
          covTokens,
          tokenPrice
        ] = await Promise.all([
          this.functionsUtil.genericContractCall(contractInfo.name,'getSwapFee'),
          this.functionsUtil.genericContractCall(contractInfo.name,'getBalance',[balancerTokenConfig.address]),
          this.functionsUtil.genericContractCall(contractInfo.name,'getSpotPrice',[this.state.tokenConfig.address,balancerTokenConfig.address])
        ]);

        // Calculate yearly returns
        if (tokenPrice){
          const isClaim = this.state.selectedAction === 'Claim';
          const expirationTimestamp = this.state.selectedCoverage.expirationTimestamp;
          const days =  (expirationTimestamp*1000 - Date.now())/(60 * 60 * 24 * 1000);
          tokenPrice = this.functionsUtil.fixTokenDecimals(tokenPrice,this.state.tokenConfig.decimals);
          const apyPrice = isClaim ? tokenPrice : this.functionsUtil.BNify(1).minus(tokenPrice).div(tokenPrice);
          apy = this.functionsUtil.BNify(100).times(apyPrice).times(365).div(days);
        }

        // Fix swap Fees
        if (swapFee){
          swapFee = this.functionsUtil.fixTokenDecimals(swapFee,18);
        }
      }

      switch (this.state.selectedAction){
        case 'Mint':
          approveDescription = `Approve the Cover Protocol contract`;
          infoBox = {
            icon:'MonetizationOn',
            text:`Stake ${this.state.selectedToken} to mint both CLAIM and NOCLAIM tokens in a 1:1 ratio then add them to the respective Balancer Pool to earn trading fees.<br /><small>Prior to expiry or an accepted claim, users can redeem back their collateral with both their CLAIM and NOCLAIM tokens. <a href="https://docs.coverprotocol.com/user-guide/redemption" target="_blank" rel="nofollow noopener noreferrer" style="color:${this.props.theme.colors.blue}">Read more</a></small>`
          };
          // Add Approve Step
          steps.push({
            icon:'LooksOne',
            description:approveDescription,
            completed:this.state.contractApproved
          });
          // Add Mint Step
          steps.push({
            icon:'LooksTwo',
            completed:hasMintedTokens,
            description:`Mint CLAIM and NOCLAIM tokens`
          });
          // Add Liquidity to Balancer Step
          steps.push({
            icon:'Looks3',
            description:`Add your CLAIM tokens to the Balancer Pool`,
            completed:balancerPoolClaimBalance && balancerPoolClaimBalance.gt(0),
            link:`https://pools.balancer.exchange/#/pool/${this.state.selectedCoverage.tokens['Claim'].balancerPool.address}/`,
          });
          // Add Liquidity to Balancer Step
          steps.push({
            icon:'Looks4',
            description:`Add your NOCLAIM tokens to the Balancer Pool`,
            completed:balancerPoolNoClaimBalance && balancerPoolNoClaimBalance.gt(0),
            link:`https://pools.balancer.exchange/#/pool/${this.state.selectedCoverage.tokens['NoClaim'].balancerPool.address}/`,
          });
        break;
        case 'NoClaim':
          if (this.state.swapInfo){
            collateralAmount = this.functionsUtil.fixTokenDecimals(this.state.swapInfo.amount,this.state.tokenConfig.decimals);
            tokenAmount = this.functionsUtil.fixTokenDecimals(this.state.swapInfo.tokenAmountOut,contractInfo.decimals);
            infoBox = {
              icon:'VerifiedUser',
              text:`By providing <strong>${collateralAmount.toFixed(4)} ${this.state.selectedToken}</strong> your NOCLAIM tokens will pay out <strong>~${tokenAmount.toFixed(4)} ${this.state.selectedToken}</strong> if there is no successful attack on the protocol by the expiry date.`
            };
          } else {
            infoBox = {
              icon:'VerifiedUser',
              text:`NOCLAIM tokens will pay out 1 ${this.state.selectedToken} for each token you hold if there is no successful attack on the protocol by the expiry date.`
            };
          }

          // Add Yearly cost and read more
          infoBox.text+=`${apy ? `<br /><span style="color:${this.props.theme.colors.blue}">The yearly return of buying and holding NOCLAIM until expiration is <strong>${apy.toFixed(2)}%</strong>` : null}</span><br /><small><a href="https://docs.coverprotocol.com/product/claims-guidelines" target="_blank" rel="nofollow noopener noreferrer" style="color:${this.props.theme.colors.blue}">Read more</a> to understand how claims are assessed and paid out by Cover Protocol.</small>`;

          // Add Approve Step
          approveDescription = `Approve the NOCLAIM Balancer Pool contract`;
          steps.push({
            icon:'LooksOne',
            description:approveDescription,
            completed:this.state.contractApproved
          });
          // Add Mint Step
          steps.push({
            icon:'LooksTwo',
            completed:noClaimTokenBalance && noClaimTokenBalance.gt(0),
            description:`Buy NOCLAIM tokens with your ${this.state.selectedToken}`
          });
        break;
        case 'Claim':
          if (this.state.swapInfo){
            collateralAmount = this.functionsUtil.fixTokenDecimals(this.state.swapInfo.amount,this.state.tokenConfig.decimals);
            tokenAmount = this.functionsUtil.fixTokenDecimals(this.state.swapInfo.tokenAmountOut,contractInfo.decimals);
            const portfolioCoveredPerc = 32;//this.state.portfolio && this.state.portfolio.totalBalance.gt(0) ? tokenAmount.div(this.state.portfolio.totalBalance).times(100) : null;
            infoBox = {
              icon:'BeachAccess',
              text:`By providing <strong>${collateralAmount.toFixed(4)} ${this.state.selectedToken}</strong> your CLAIM tokens will pay out <strong>~${tokenAmount.toFixed(4)} ${this.state.selectedToken}</strong>${ portfolioCoveredPerc ? ` <strong>(${portfolioCoveredPerc}% of your portfolio)</strong>` : '' } in the event that there is a successful attack on the protocol before the expiry date.`
            };
          } else {
            infoBox = {
              icon:'BeachAccess',
              text:`CLAIM tokens will pay out 1 ${this.state.selectedToken} for each token you hold in the event that there is a successful attack on the protocol before the expiry date.`
            };
          }

          infoBox.text+=`${apy ? `<br /><span style="color:${this.props.theme.colors.blue}">The yearly cost of buying and holding CLAIM until expiration is <strong>${apy.toFixed(2)}%` : null}</strong></span><br /><small><a href="https://docs.coverprotocol.com/product/claims-guidelines" target="_blank" rel="nofollow noopener noreferrer" style="color:${this.props.theme.colors.blue}">Read more</a> to understand how claims are assessed and paid out by Cover Protocol.</small>`;

          // Add Approve Step
          approveDescription = `Approve the CLAIM Balancer Pool contract`;
          steps.push({
            icon:'LooksOne',
            description:approveDescription,
            completed:this.state.contractApproved
          });
          // Add Mint Step
          steps.push({
            icon:'LooksTwo',
            completed:claimTokenBalance && claimTokenBalance.gt(0),
            description:`Buy CLAIM tokens with your ${this.state.selectedToken}`
          });
        break;
        default:
        break;
      }

      const transactionSucceeded = false;
      this.setState({
        apy,
        steps,
        infoBox,
        swapFee,
        covTokens,
        tokenPrice,
        contractInfo,
        approveDescription,
        transactionSucceeded
      });
    }
  }

  async loadData(){
    const currTime = parseInt(Date.now()/1000);
    const activeCoverages = this.props.toolProps.coverages.reduce( (output,c,index) => {
      if (c.expirationTimestamp>currTime){
        const expirationDate = this.functionsUtil.strToMoment(c.expirationTimestamp*1000).utc().format('YYYY-MM-DD HH:mm:ss')+' UTC';
        const icon = `images/tokens/${c.collateral}.svg`;
        const label = `Collateral: ${c.collateral} - Expiration: ${expirationDate}`;
        output.push({
          icon,
          label,
          data:c,
          value:expirationDate,
        });
      }
      return output;
    },[]);

    const portfolio = await this.functionsUtil.getAccountPortfolio();
    const defaultCoverage = activeCoverages.length ? activeCoverages[0] : null;

    this.setState({
      portfolio,
      defaultCoverage,
      activeCoverages
    },() => {
      if (defaultCoverage){
        this.selectCoverage(defaultCoverage);
      }
    });
  }

  async selectCoverage(coverage){
    const selectedCoverage = coverage.data;
    this.setState({
      selectedCoverage
    });
  }

  setAction(selectedAction){
    this.setState({
      selectedAction
    });
  }

  render() {

    const isMint = this.state.selectedAction === 'Mint';
    const isBuyClaim = this.state.selectedAction === 'Claim';
    const isBuyNoClaim = this.state.selectedAction === 'NoClaim';
    const txAction = isMint ? this.state.selectedAction : `Buy ${this.state.selectedAction}`;

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
          !this.state.activeCoverages ? (
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
                text={'Loading active coverages...'}
              />
            </Flex>
          ) : (
            <Flex
              width={1}
              alignItems={'center'}
              justifyContent={'center'}
            >
              {
                !this.state.activeCoverages.length ? (
                  <Text
                    fontWeight={2}
                    fontSize={[2,3]}
                    color={'dark-gray'}
                    textAlign={'center'}
                  >
                    There are no active coverages.
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
                      <Text mb={1}>
                        Select Coverage:
                      </Text>
                      <GenericSelector
                        {...this.props}
                        name={'strategy'}
                        isSearchable={false}
                        options={this.state.activeCoverages}
                        CustomOptionValue={CustomOptionValue}
                        defaultValue={this.state.defaultCoverage}
                        onChange={this.selectCoverage.bind(this)}
                        CustomValueContainer={CustomValueContainer}
                      />
                    </Box>
                    {
                      this.state.selectedCoverage && (
                        <Box
                          mt={3}
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
                                mx:0
                              }}
                              width={[1,'32%']}
                              caption={'Add Liquidity'}
                              imageSrc={'images/mint.svg'}
                              isMobile={this.props.isMobile}
                              subcaption={'mint CLAIM and NOCLAIM\nand stake in Balancer Pool'}
                              imageProps={{
                                mb:2,
                                height:this.props.isMobile ? '42px' : '52px'
                              }}
                              isActive={isMint}
                              handleClick={ e => this.setAction('Mint') }
                              buttonStyle={{
                                boxShadow:isMint ? '0px 0px 0px 1px rgba(0,54,255,0.3)' : null
                              }}
                            />
                            <ImageButton
                              buttonProps={{
                                mx:0
                              }}
                              width={[1,'32%']}
                              caption={'Buy CLAIM'}
                              imageSrc={'images/claim.svg'}
                              isMobile={this.props.isMobile}
                              subcaption={'protect in case of attacks\nagainst the Idle protocol'}
                              imageProps={{
                                mb:2,
                                height:this.props.isMobile ? '42px' : '52px'
                              }}
                              isActive={isBuyClaim}
                              handleClick={ e => this.setAction('Claim') }
                              buttonStyle={{
                                boxShadow:isBuyClaim ? '0px 0px 0px 1px rgba(0,54,255,0.3)' : null
                              }}
                            />
                            <ImageButton
                              buttonProps={{
                                mx:0
                              }}
                              width={[1,'32%']}
                              caption={'Buy NOCLAIM'}
                              isMobile={this.props.isMobile}
                              imageSrc={'images/noclaim.svg'}
                              subcaption={'get rewarded if no attack\noccurs on the Idle protocol'}
                              imageProps={{
                                mb:2,
                                height:this.props.isMobile ? '42px' : '52px'
                              }}
                              isActive={isBuyNoClaim}
                              handleClick={ e => this.setAction('NoClaim') }
                              buttonStyle={{
                                boxShadow:isBuyNoClaim ? '0px 0px 0px 1px rgba(0,54,255,0.3)' : null
                              }}
                            />
                          </Flex>
                          {
                            this.state.tokenConfig && this.state.tokenBalance && this.state.contractInfo &&
                              <Box
                                mt={2}
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
                                  tokenBalance={this.state.tokenBalance}
                                  contractInfo={this.state.contractInfo}
                                  callback={this.transactionSucceeded.bind(this)}
                                  contractApproved={this.contractApproved.bind(this)}
                                  approveDescription={this.state.approveDescription}
                                  balanceSelectorInfo={this.state.balanceSelectorInfo}
                                  changeInputCallback={this.changeInputCallback.bind(this)}
                                  getTransactionParams={this.getTransactionParams.bind(this)}
                                >
                                  <BuyModal
                                    {...this.props}
                                    showInline={true}
                                    availableMethods={[]}
                                    buyToken={this.state.selectedToken}
                                  />
                                </SendTxWithBalance>
                              </Box>
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

export default CoverProtocol;
