import CountUp from 'react-countup';
import { Box, Loader } from "rimble-ui";
import React, { Component } from 'react';
import FunctionsUtil from '../utilities/FunctionsUtil';

class TotalEarningsCounter extends Component {

  state = {
    earningsEnd:null,
    earningsStart:null
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
    this.loadTotalEarnings();
  }

  async componentDidUpdate(prevProps,prevState){
    this.loadUtils();
    const contractsInitialized = prevProps.contractsInitialized !== this.props.contractsInitialized;
    const availableStrategiesChanged = !prevProps.availableStrategies && JSON.stringify(prevProps.availableStrategies) !== JSON.stringify(this.props.availableStrategies);
    if (availableStrategiesChanged || contractsInitialized){
      this.loadTotalEarnings();
    }
  }

  async loadTotalEarnings(){

    if (!this.props.availableStrategies || !this.props.contractsInitialized){
      return true;
    }
    const isRisk = this.props.selectedStrategy === 'risk';

    const availableTokens = this.props.availableTokens || {};
    const portfolio = this.props.portfolio || await this.functionsUtil.getAccountPortfolio(availableTokens,this.props.account);
    const depositedTokens = Object.keys(portfolio.tokensBalance).filter(token => ( this.functionsUtil.BNify(portfolio.tokensBalance[token].idleTokenBalance).gt(0) ));

    let avgAPY = this.functionsUtil.BNify(0);
    let totalEarnings = this.functionsUtil.BNify(0);
    let totalAmountLent = this.functionsUtil.BNify(0);

    await this.functionsUtil.asyncForEach(depositedTokens,async (token) => {
      const tokenConfig = availableTokens[token];
      const [
        tokenAprs,
        amountLent,
        tokenEarnings
      ] = await Promise.all([
        this.functionsUtil.getTokenAprs(tokenConfig),
        this.functionsUtil.getAmountLent([token],this.props.account),
        this.functionsUtil.loadAssetField('earnings',token,tokenConfig,this.props.account,false),
      ]);

      const tokenAPY = this.functionsUtil.BNify(tokenAprs.avgApy);
      const tokenWeight = portfolio.tokensBalance[token].tokenBalance.div(portfolio.totalBalance);
      const amountLentToken = await this.functionsUtil.convertTokenBalance(amountLent[token],token,tokenConfig,isRisk);

      if (tokenEarnings){
        totalEarnings = totalEarnings.plus(tokenEarnings);
      }

      if (tokenAPY){
        avgAPY = avgAPY.plus(tokenAPY.times(tokenWeight));
      }

      if (amountLentToken){
        totalAmountLent = totalAmountLent.plus(amountLentToken);
      }
    });

    const earningsStart = totalEarnings;
    const earningsEnd = totalAmountLent.times(avgAPY.div(100));

    this.setState({
      earningsEnd,
      earningsStart
    });
  }

  render() {

    const counterStyle = {
      lineHeight:1,
      color:this.props.theme.colors.copyColor,
      fontFamily:this.props.theme.fonts.counter,
      fontWeight: this.props.isMobile ? 600 : 700,
      fontSize:this.props.isMobile ? '21px' : '1.7em',
    };

    // Replace props
    if (this.props.counterStyle && Object.keys(this.props.counterStyle).length){
      Object.keys(this.props.counterStyle).forEach(p => {
        counterStyle[p] = this.props.counterStyle[p];
      });
    }

    const decimals = this.props.decimals || 8;
    const maxPrecision =  this.props.maxPrecision || 10;
    const minPrecision =  this.props.minPrecision || 8;

    return this.state.earningsStart && this.state.earningsEnd ? (
      <Box
        width={1}
      >
        <CountUp
          delay={0}
          decimal={'.'}
          separator={''}
          useEasing={false}
          decimals={decimals}
          duration={31536000}
          end={parseFloat(this.state.earningsEnd)}
          start={parseFloat(this.state.earningsStart)}
          formattingFn={ n => '$ '+this.functionsUtil.abbreviateNumber(n,decimals,maxPrecision,minPrecision) }
        >
          {({ countUpRef, start }) => (
            <span
              ref={countUpRef}
              style={counterStyle}
            />
          )}
        </CountUp>
      </Box>
    ) : (
      <Loader size={"20px"} />
    );
  }
}

export default TotalEarningsCounter;
