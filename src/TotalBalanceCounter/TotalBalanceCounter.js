import CountUp from 'react-countup';
import { Box, Loader } from "rimble-ui";
import React, { Component } from 'react';
import FunctionsUtil from '../utilities/FunctionsUtil';

class TotalBalanceCounter extends Component {

  state = {
    counterEnd:null,
    counterStart:null
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

    const mobileChanged = prevProps.isMobile !== this.props.isMobile;
    const themeModeChanged = prevProps.themeMode !== this.props.themeMode;
    const styleChanged = JSON.stringify(prevProps.counterStyle) !== JSON.stringify(this.props.counterStyle);
    if (styleChanged || themeModeChanged || mobileChanged){
      const oldState = Object.assign({},this.state);
      this.setState({
        counterEnd:null,
        counterStart:null
      },() => {
        this.setState(oldState);
      });
    }
  }

  async loadTotalEarnings(){

    if (!this.props.availableStrategies || !this.props.contractsInitialized){
      return true;
    }
    const isRisk = this.props.selectedStrategy === 'risk';

    const availableTokens = this.props.availableTokens || {};
    const portfolio = this.props.portfolio || await this.functionsUtil.getAccountPortfolio(availableTokens,this.props.account);

    const counterStart = portfolio.totalAmountLent.plus(portfolio.totalEarnings);
    const counterEnd = counterStart.plus(counterStart.times(portfolio.avgAPY.div(100)));

    this.setState({
      counterEnd,
      counterStart
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
    const maxPrecision = this.props.maxPrecision || 10;
    const minPrecision = this.props.minPrecision || 8;

    return this.state.counterStart && this.state.counterEnd ? (
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
          end={parseFloat(this.state.counterEnd)}
          start={parseFloat(this.state.counterStart)}
          formattingFn={ n => '$ '+this.functionsUtil.formatMoney(n,decimals) }
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

export default TotalBalanceCounter;
