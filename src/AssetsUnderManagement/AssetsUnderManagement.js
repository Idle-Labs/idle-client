import Title from '../Title/Title';
import CountUp from 'react-countup';
import React, { Component } from 'react';
import { Box, Flex, Text, Loader } from "rimble-ui";
import FunctionsUtil from '../utilities/FunctionsUtil';

class AssetsUnderManagement extends Component {

  state = {
    totalAUM:null,
    totalAUMEndOfYear:null
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
    this.loadTotalAUM();
  }

  async componentDidUpdate(prevProps,prevState){
    this.loadUtils();
    const contractsInitialized = prevProps.contractsInitialized !== this.props.contractsInitialized;
    const availableStrategiesChanged = !prevProps.availableStrategies && JSON.stringify(prevProps.availableStrategies) !== JSON.stringify(this.props.availableStrategies);
    if (availableStrategiesChanged || contractsInitialized){
      this.loadTotalAUM();
    }
  }

  async loadTotalAUM(){

    const allNetworks = this.props.allNetworks || false;

    if (!this.props.availableStrategies || !this.props.contractsInitialized || (allNetworks && this.state.totalAUM)){
      return true;
    }

    if (this.props.totalAUM && this.props.totalAUMEndOfYear){
      return this.setState({
        totalAUM:this.props.totalAUM,
        totalAUMEndOfYear:this.props.totalAUMEndOfYear
      });
    }

    const aggregatedStatsMethodParams = this.props.aggregatedStatsMethodParams || [true,allNetworks];

    const {
      avgAPY,
      totalAUM
    } = typeof this.props.aggregatedStatsMethod === 'function' ? await this.props.aggregatedStatsMethod(...aggregatedStatsMethodParams) : await this.functionsUtil.getAggregatedStats(...aggregatedStatsMethodParams);

    let totalAUMEndOfYear = this.functionsUtil.BNify(0);
    if (!this.functionsUtil.BNify(totalAUM).isNaN() && !this.functionsUtil.BNify(avgAPY).isNaN()){
      totalAUMEndOfYear = totalAUM.plus(totalAUM.times(avgAPY.div(100)));
    }

    return this.setState({
      totalAUM,
      totalAUMEndOfYear
    });
  }

  render() {
    return this.state.totalAUM ? (
      <Box
        width={1}
        {...this.props.flexProps}
      >
        <CountUp
          delay={0}
          decimals={4}
          decimal={'.'}
          separator={''}
          useEasing={false}
          duration={31536000}
          start={parseFloat(this.state.totalAUM)}
          end={parseFloat(this.state.totalAUMEndOfYear)}
          formattingFn={ n => '$ '+this.functionsUtil.formatMoney(n,4) }
        >
          {({ countUpRef, start }) => (
            <span
              style={ this.props.counterStyle ? this.props.counterStyle : {
                display:'block',
                color:'dark-gray',
                whiteSpace:'nowrap',
                fontFamily:this.props.theme.fonts.counter,
                fontWeight:this.props.theme.fontWeights[5],
                textAlign: this.props.isMobile ? 'center' : 'right',
                fontSize: this.props.isMobile ? '1.6em' : this.props.theme.fontSizes[6]
              }}
              ref={countUpRef}
            />
          )}
        </CountUp>
        {
          (typeof this.props.subtitle === 'undefined' || this.props.subtitle) && (
            <Title
              fontWeight={3}
              fontSize={[2,2]}
              color={'cellTitle'}
              textAlign={['center','right']}
              {...this.props.subtitleProps}
            >
              <Text.span fontWeight={'inherit'} color={'inherit'} fontSize={'inherit'}>{this.props.subtitle || 'Assets Under Management'}</Text.span>
            </Title>
          )
        }
      </Box>
    ) : (
      <Flex
        width={1}
        alignItems={'center'}
        justifyContent={this.props.loaderAlign || 'center'}
      >
        <Loader
          size={"30px"}
        />
      </Flex>
    );
  }
}

export default AssetsUnderManagement;
