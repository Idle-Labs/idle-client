import React, { Component } from 'react';
import { Flex, Box, Text } from "rimble-ui";
import FlexLoader from '../FlexLoader/FlexLoader';
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
      const selectedToken = this.state.selectedCoverage.collaterals[0];
      const tokenConfig = Object.values(this.props.availableStrategies)[0][selectedToken];
      const tokenBalance = await this.functionsUtil.getTokenBalance(selectedToken,this.props.account);
      this.setState({
        tokenConfig,
        tokenBalance,
        selectedToken
      });
    }

    const contractApprovedChanged = prevState.contractApproved !== this.state.contractApproved;
    const swapInfoChanged = JSON.stringify(prevState.swapInfo) !== JSON.stringify(this.state.swapInfo);
    const selectedActionChanged = prevState.selectedAction !== this.state.selectedAction;
    if (selectedActionChanged || swapInfoChanged || contractApprovedChanged){
      const steps = [];
      let infoBox = null;
      let tokenAmount = null;
      let contractInfo = null;
      let collateralAmount = null;
      let approveDescription = null;
      switch (this.state.selectedAction){
        case 'Mint':
          contractInfo = this.props.toolProps.contract;
          approveDescription = `Approve the Cover Protocol contract`;
          infoBox = {
            text:`Stake ${this.state.selectedToken} to mint both Claim and No-Claim tokens in a 1:1 ratio`
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
            completed:false,
            description:`Mint Claim and No-Claim tokens`
          });
        break;
        case 'NoClaim':
          contractInfo = this.state.selectedCoverage.tokens[this.state.selectedAction].balancerPool;
          if (this.state.swapInfo){
            collateralAmount = this.functionsUtil.fixTokenDecimals(this.state.swapInfo.amount,this.state.tokenConfig.decimals);
            tokenAmount = this.functionsUtil.fixTokenDecimals(this.state.swapInfo.tokenAmountOut,contractInfo.decimals);
            infoBox = {
              text:`By providing <strong>${collateralAmount.toFixed(4)} ${this.state.selectedToken}</strong> your No-Claim tokens will pay out <strong>~${tokenAmount.toFixed(4)} ${this.state.selectedToken}</strong> if there is no successful attack on the protocol by the expiry date.<br /><small><a href="https://docs.coverprotocol.com/product/claims-guidelines" target="_blank" rel="nofollow noopener noreferrer">Read more</a> to understand how claims are assessed and paid out by Cover Protocol.</small>`
            };
          } else {
            infoBox = {
              text:`No-Claim tokens will pay out 1 ${this.state.selectedToken} for each token you hold if there is no successful attack on the protocol by the expiry date.<br /><small><a href="https://docs.coverprotocol.com/product/claims-guidelines" target="_blank" rel="nofollow noopener noreferrer">Read more</a> to understand how claims are assessed and paid out by Cover Protocol.</small>`
            };
          }

          // Add Approve Step
          approveDescription = `Approve the Claim Balancer Pool contract`;
          steps.push({
            icon:'LooksOne',
            description:approveDescription,
            completed:this.state.contractApproved
          });
          // Add Mint Step
          steps.push({
            icon:'LooksTwo',
            completed:false,
            description:`Buy No-Claim tokens with your ${this.state.selectedToken}`
          });
        break;
        case 'Claim':
          contractInfo = this.state.selectedCoverage.tokens[this.state.selectedAction].balancerPool;
          if (this.state.swapInfo){
            collateralAmount = this.functionsUtil.fixTokenDecimals(this.state.swapInfo.amount,this.state.tokenConfig.decimals);
            tokenAmount = this.functionsUtil.fixTokenDecimals(this.state.swapInfo.tokenAmountOut,contractInfo.decimals);
            const portfolioCoveredPerc = 32;//this.state.portfolio && this.state.portfolio.totalBalance.gt(0) ? tokenAmount.div(this.state.portfolio.totalBalance).times(100) : null;
            infoBox = {
              text:`By providing <strong>${collateralAmount.toFixed(4)} ${this.state.selectedToken}</strong> your Claim tokens will pay out <strong>~${tokenAmount.toFixed(4)} ${this.state.selectedToken}</strong>${ portfolioCoveredPerc ? ` <strong>(${portfolioCoveredPerc}% of your portfolio)</strong>` : '' } in the event that there is a successful attack on the protocol before the expiry date.<br /><small><a href="https://docs.coverprotocol.com/product/claims-guidelines" target="_blank" rel="nofollow noopener noreferrer">Read more</a> to understand how claims are assessed and paid out by Cover Protocol.</small>`
            };
          } else {
            infoBox = {
              text:`Claim tokens will pay out 1 ${this.state.selectedToken} for each token you hold in the event that there is a successful attack on the protocol before the expiry date.<br /><small><a href="https://docs.coverprotocol.com/product/claims-guidelines" target="_blank" rel="nofollow noopener noreferrer">Read more</a> to understand how claims are assessed and paid out by Cover Protocol.</small>`
            };
          }

          // Add Approve Step
          approveDescription = `Approve the No-Claim Balancer Pool contract`;
          steps.push({
            icon:'LooksOne',
            description:approveDescription,
            completed:this.state.contractApproved
          });
          // Add Mint Step
          steps.push({
            icon:'LooksTwo',
            completed:false,
            description:`Buy Claim tokens with your ${this.state.selectedToken}`
          });
        break;
        default:
        break;
      }
      if (contractInfo){
        const transactionSucceeded = false;
        this.setState({
          steps,
          infoBox,
          contractInfo,
          approveDescription,
          transactionSucceeded
        });
      }
    }

    const contractInfoChanged = JSON.stringify(prevState.contractInfo) !== JSON.stringify(this.state.contractInfo);
    if (contractInfoChanged){
      this.changeInputCallback();
    }
  }

  async getSwapInfo(amount){
    amount = this.functionsUtil.BNify(amount);
    if (!amount.isNaN() && amount.gt(0)){
      const balancerTokenConfig = this.state.selectedCoverage.tokens[this.state.selectedAction];
      let [
        swapFee,
        covTokens,
        tokenPrice,
      ] = await Promise.all([
        this.functionsUtil.genericContractCall(this.state.contractInfo.name,'getSwapFee'),
        this.functionsUtil.genericContractCall(this.state.contractInfo.name,'getBalance',[balancerTokenConfig.address]),
        this.functionsUtil.genericContractCall(this.state.contractInfo.name,'getSpotPrice',[this.state.tokenConfig.address,balancerTokenConfig.address]),
      ]);

      // console.log('getSwapInfo',this.state.contractInfo.name,balancerTokenConfig.address,swapFee,covTokens,tokenPrice);

      if (tokenPrice && swapFee && covTokens){
        swapFee = this.functionsUtil.fixTokenDecimals(swapFee,18);
        tokenPrice = this.functionsUtil.fixTokenDecimals(tokenPrice,this.state.tokenConfig.decimals);
        let tokenAmountOut = amount.div(tokenPrice);
        tokenAmountOut = tokenAmountOut.minus(tokenAmountOut.times(swapFee));
        return {
          amount,
          swapFee,
          covTokens,
          tokenPrice,
          tokenAmountOut
        };
      }
    }

    return null;
  }

  async changeInputCallback(inputValue=null){
    let swapInfo = null;
    let balanceSelectorInfo = null;
    inputValue = inputValue || this.state.inputValue;

    if (inputValue && this.functionsUtil.BNify(inputValue).gt(0)){
      switch (this.state.selectedAction){
        case 'Mint':
          balanceSelectorInfo = {
            color:this.props.theme.colors.transactions.status.completed,
            text:`You will Mint: ${inputValue.toFixed(4)} Claim and No-Claim`
          };
        break;
        case 'Claim':
        case 'NoClaim':
          const amount = this.functionsUtil.normalizeTokenAmount(inputValue,this.state.tokenConfig.decimals);
          swapInfo = await this.getSwapInfo(amount);
          if (swapInfo){
            if (swapInfo.tokenAmountOut.lte(swapInfo.covTokens)){
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
      balanceSelectorInfo,
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
          if (swapInfo.tokenAmountOut.lte(swapInfo.covTokens)){
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
    const fixedAmount = this.functionsUtil.fixTokenDecimals(amount,this.state.tokenConfig.decimals);
    switch (this.state.selectedAction){
      case 'Mint':
        const mintedClaimLog = tx.receipt.logs.find( log => log.address.toLowerCase() === this.state.selectedCoverage.tokens['Claim'].address );
        const mintedNoClaimLog = tx.receipt.logs.find( log => log.address.toLowerCase() === this.state.selectedCoverage.tokens['NoClaim'].address );
        const mintedClaimAmount = mintedClaimLog ? this.functionsUtil.fixTokenDecimals(parseInt(mintedClaimLog.data,16),this.state.contractInfo.decimals) : fixedAmount;
        const mintedNoClaimAmount = mintedNoClaimLog ? this.functionsUtil.fixTokenDecimals(parseInt(mintedNoClaimLog.data,16),this.state.contractInfo.decimals) : fixedAmount;
        infoBox = {
          icon:'DoneAll',
          iconProps:{
            color:this.props.theme.colors.transactions.status.completed
          },
          text:`You have successfully minted <strong>${mintedClaimAmount.toFixed(4)} Claim</strong> and <strong>${mintedNoClaimAmount.toFixed(4)} No-Claim</strong> tokens<br /><small><a href="${this.functionsUtil.getEtherscanTransactionUrl(tx.transactionHash)}" rel="nofollow noopener noreferrer" target="_blank">View in Etherscan</a></small>`
        }
      break;
      case 'Claim':
        const claimTokenConfig = this.state.selectedCoverage.tokens[this.state.selectedAction];
        const claimTokensLog = tx.receipt.logs.find( log => log.address.toLowerCase() === claimTokenConfig.address );
        const receivedClaimAmount = claimTokensLog ? this.functionsUtil.fixTokenDecimals(parseInt(claimTokensLog.data,16),claimTokenConfig.balancerPool.decimals) : this.functionsUtil.fixTokenDecimals(params[3],claimTokenConfig.balancerPool.decimals);
        infoBox = {
          icon:'DoneAll',
          iconProps:{
            color:this.props.theme.colors.transactions.status.completed
          },
          text:`You have successfully bought <strong>${receivedClaimAmount.toFixed(4)} ${this.state.selectedAction}</strong> tokens, you are now covered in the event that there is a successful attack on the protocol<br /><small><a href="${this.functionsUtil.getEtherscanTransactionUrl(tx.transactionHash)}" rel="nofollow noopener noreferrer" target="_blank">View in Etherscan</a></small>`
        }
      break;
      case 'NoClaim':
        const noClaimTokenConfig = this.state.selectedCoverage.tokens[this.state.selectedAction];
        const noClaimTokensLog = tx.receipt.logs.find( log => log.address.toLowerCase() === noClaimTokenConfig.address );
        const receivedNoClaimAmount = noClaimTokensLog ? this.functionsUtil.fixTokenDecimals(parseInt(noClaimTokensLog.data,16),noClaimTokenConfig.balancerPool.decimals) : this.functionsUtil.fixTokenDecimals(params[3],noClaimTokenConfig.balancerPool.decimals);
        infoBox = {
          icon:'DoneAll',
          iconProps:{
            color:this.props.theme.colors.transactions.status.completed
          },
          text:`You have successfully bought <strong>${receivedNoClaimAmount.toFixed(4)} ${this.state.selectedAction}</strong> tokens, you will be rewarded if there is no successful attack on the protocol by the expiry date<br /><small><a href="${this.functionsUtil.getEtherscanTransactionUrl(tx.transactionHash)}" rel="nofollow noopener noreferrer" target="_blank">View in Etherscan</a></small>`
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
    this.setState({
      steps,
      infoBox,
      tokenBalance,
      transactionSucceeded
    });
  }

  async loadData(){
    const currTime = parseInt(new Date().getTime()/1000);
    const activeCoverages = this.props.toolProps.coverages.reduce( (output,c,index) => {
      if (c.expirationTimestamp>currTime){
        const expirationDate = this.functionsUtil.strToMoment(c.expirationTimestamp*1000).format('YYYY-MM-DD HH:mm:ss');
        output.push({
          data:c,
          value:expirationDate,
          label:expirationDate
        });
      }
      return output;
    },[]);

    const defaultCoverage = activeCoverages.length ? activeCoverages[0] : null;
    const portfolio = await this.functionsUtil.getAccountPortfolio();

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
                        defaultValue={this.state.defaultCoverage}
                        onChange={this.selectCoverage.bind(this)}
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
                              caption={'Buy Claim'}
                              imageSrc={'images/claim.svg'}
                              isMobile={this.props.isMobile}
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
                              caption={'Buy No-Claim'}
                              imageSrc={'images/noclaim.svg'}
                              isMobile={this.props.isMobile}
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
