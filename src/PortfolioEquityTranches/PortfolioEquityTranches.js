import { Line } from '@nivo/line';
import React, { Component } from 'react';
// import { linearGradientDef } from '@nivo/core'
import FunctionsUtil from '../utilities/FunctionsUtil';
import GenericChart from '../GenericChart/GenericChart';
import ChartCustomTooltip from '../ChartCustomTooltip/ChartCustomTooltip';
import ChartCustomTooltipRow from '../ChartCustomTooltipRow/ChartCustomTooltipRow';

class PortfolioEquityTranches extends Component {
  state = {
    startDate:null,
    chartData:null,
    chartProps:null,
    chartwidth:null,
    chartHeight:null
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
    this.loadChartData();
  }

  async componentDidUpdate(prevProps, prevState) {
    this.loadUtils();

    const quickDateSelectionChanged = prevProps.quickDateSelection !== this.props.quickDateSelection;
    const tokenChanged = JSON.stringify(prevProps.enabledTokens) !== JSON.stringify(this.props.enabledTokens);
    if (tokenChanged || quickDateSelectionChanged){
      this.setState({
        chartData:null
      },() => {
        this.componentDidMount();
      });
    }

    const mobileChanged = prevProps.isMobile !== this.props.isMobile;
    const themeModeChanged = prevProps.themeMode !== this.props.themeMode;
    if (mobileChanged || themeModeChanged){
      this.loadChartData();
    }
  }

  async loadChartData() {
    let enabledTokens = this.props.enabledTokens;

    if (!enabledTokens || !enabledTokens.length){
      enabledTokens = Object.keys(this.props.availableTranches).reduce( (enabledTokens,protocol) => {
        const tokens = Object.keys(this.props.availableTranches[protocol]);
        tokens.forEach( token => {
          if (!enabledTokens.includes(token)){
            enabledTokens.push(token);
          }
        });
        return enabledTokens;
      },[]);
    }

    const transactions = this.props.transactionsList;

    const chartData = [];
    const tokensData = {};
    let tokensBalance = {};
    let lastTxTimestamp = null;
    let firstTxTimestamp = null;

    await this.functionsUtil.asyncForEach(enabledTokens,async (selectedToken) => {

      tokensBalance[selectedToken] = [];

      const filteredTxs = Object.values(transactions).filter(tx => (tx.token === selectedToken));
      if (filteredTxs && filteredTxs.length){

        let amountLent = this.functionsUtil.BNify(0);

        await this.functionsUtil.asyncForEach(filteredTxs,async (tx,index) => {

          // Skip transactions with no hash or pending
          if (!tx.hash || (tx.status && tx.status === 'Pending')){
            return false;
          }

          firstTxTimestamp = firstTxTimestamp ? Math.min(firstTxTimestamp,parseInt(tx.timeStamp)) : parseInt(tx.timeStamp);

          const timeStamp = parseInt(tx.timeStamp);
          const tokenAmount = this.functionsUtil.BNify(tx.tokenAmount);

          switch (tx.action){
            case 'Deposit':
              amountLent = amountLent.plus(tokenAmount);
            break;
            case 'Withdraw':
              amountLent = amountLent.minus(tokenAmount);
            break;
            default:
            break;
          }

          // Reset amountLent if below zero
          if (amountLent.lt(0)){
            amountLent = this.functionsUtil.BNify(0);
          }

          const action = tx.action;
          const balance = amountLent;
          const tranche = tx.tranche;
          const protocol = tx.protocol;
          const tranchePrice = this.functionsUtil.BNify(tx.tranchePrice);
          const trancheTokens = this.functionsUtil.BNify(tx.trancheTokens);
          if (!tranchePrice.isNaN() && !trancheTokens.isNaN()){
            tokensBalance[selectedToken].push({
              action,
              balance,
              tranche,
              protocol,
              timeStamp,
              tokenAmount,
              tranchePrice,
              trancheTokens
            });
          }

          // Get updated tranches prices
          await this.functionsUtil.asyncForEach(Object.keys(tokensBalance),async (token) => {
            if (tokensBalance[token].length){
              const tokenBalanceConfig = tokensBalance[token][0];
              const tokenConfig = this.props.availableTranches[tokenBalanceConfig.protocol.toLowerCase()][token];
              const conversionRateField = this.functionsUtil.getTokenConversionRateField(token);
              const [
                tokenConversionRate,
                tranchePriceAA,
                tranchePriceBB
              ] = await Promise.all([
                conversionRateField ? this.functionsUtil.getTokenConversionRateUniswap(tokenConfig, tx.blockNumber) : null,
                this.functionsUtil.genericContractCallCached(tokenConfig.CDO.name, 'virtualPrice', [tokenConfig.AA.address], {}, tx.blockNumber),
                this.functionsUtil.genericContractCallCached(tokenConfig.CDO.name, 'virtualPrice', [tokenConfig.BB.address], {}, tx.blockNumber)
              ]);
              if (!tokensData[token]){
                tokensData[token] = [];
              }

              const tokenDataAA = {
                timeStamp,
                tranche:'AA',
                tranchePrice:this.functionsUtil.BNify(tranchePriceAA)
              };
              const tokenDataBB = {
                timeStamp,
                tranche:'BB',
                tranchePrice:this.functionsUtil.BNify(tranchePriceBB)
              };
              if (conversionRateField){
                tokenDataAA[conversionRateField] = tokenConversionRate;
                tokenDataBB[conversionRateField] = tokenConversionRate;
              }

              if (timeStamp>lastTxTimestamp){
                lastTxTimestamp = timeStamp;
              }
              // console.log(token,tokenConfig.CDO.name,tokenBalanceConfig.protocol,tokenBalanceConfig.tranche,tx.blockNumber,tranchePrice,tokenDataAA);

              tokensData[token].push(tokenDataAA);
              tokensData[token].push(tokenDataBB);

              tokensData[token] = tokensData[token].sort((a, b) => (parseInt(a.timeStamp) > parseInt(b.timeStamp) ? 1 : -1));
            }
          });
        });
      }
    });

    // Calculate Start Date
    let startDate = null;
    const currentDate = this.functionsUtil.strToMoment(new Date());

    switch (this.props.quickDateSelection){
      case 'week':
        startDate = currentDate.clone().subtract(1,'week');
      break;
      case 'month':
        startDate = currentDate.clone().subtract(1,'month');
      break;
      case 'month3':
        startDate = currentDate.clone().subtract(3,'month');
      break;
      case 'month6':
        startDate = currentDate.clone().subtract(6,'month');
      break;
      default:
        startDate = null;
      break;
    }

    const days = {};
    let prevBalances = {};
    let prevTimestamp = null;
    let minChartValue = null;
    let maxChartValue = null;
    let aggregatedBalance = null;
    const aggregatedBalancesKeys = {};
    const tokensBalancesPerDate = {};
    const currTimestamp = parseInt(this.functionsUtil.strToMoment(this.functionsUtil.strToMoment().format('YYYY-MM-DD')+' 23:59:59','YYYY-MM-DD HH:mm:ss')._d.getTime()/1000);

    const trancheTokenBalance = {};

    if (!firstTxTimestamp){
      firstTxTimestamp = currTimestamp;
    }

    let lastTimestamp = parseInt(this.functionsUtil.strToMoment(this.functionsUtil.strToMoment().format('YYYY-MM-DD')+' 00:00:00','YYYY-MM-DD HH:mm:ss')._d.getTime()/1000);

    // Collect tranche prices and conversion rates for the current timestamp
    await this.functionsUtil.asyncForEach(Object.keys(tokensBalance),async (token) => {
      if (tokensBalance[token].length){
        const tokenBalanceConfig = tokensBalance[token][0];
        const tokenConfig = this.props.availableTranches[tokenBalanceConfig.protocol.toLowerCase()][token];
        const conversionRateField = this.functionsUtil.getTokenConversionRateField(token);
        const [
          tokenConversionRate,
          tranchePriceAA,
          tranchePriceBB
        ] = await Promise.all([
          conversionRateField ? this.functionsUtil.getTokenConversionRateUniswap(tokenConfig) : null,
          this.functionsUtil.genericContractCallCached(tokenConfig.CDO.name, 'virtualPrice', [tokenConfig.AA.address]),
          this.functionsUtil.genericContractCallCached(tokenConfig.CDO.name, 'virtualPrice', [tokenConfig.BB.address])
        ]);
        if (!tokensData[token]){
          tokensData[token] = [];
        }

        const tokenDataAA = {
          tranche:'AA',
          timeStamp:lastTimestamp,
          tranchePrice:this.functionsUtil.BNify(tranchePriceAA)
        };
        const tokenDataBB = {
          tranche:'BB',
          timeStamp:lastTimestamp,
          tranchePrice:this.functionsUtil.BNify(tranchePriceBB)
        };
        if (conversionRateField){
          tokenDataAA[conversionRateField] = tokenConversionRate;
          tokenDataBB[conversionRateField] = tokenConversionRate;
        }

        tokensData[token].push(tokenDataAA);
        tokensData[token].push(tokenDataBB);

        tokensData[token] = tokensData[token].sort((a, b) => (parseInt(a.timeStamp) > parseInt(b.timeStamp) ? 1 : -1));
      }
    });

    // console.log('tokensData',tokensData);
    // console.log('transactions',transactions);
    // console.log('tokensBalance',tokensBalance);

    const tranches = this.functionsUtil.getGlobalConfig(['tranches']);

    for (let timeStamp=firstTxTimestamp;timeStamp<=currTimestamp;timeStamp+=this.props.frequencySeconds) {

      const foundBalances = {};
      const tokensBalances = {};

      // Shift timestamp to end of the day
      if (timeStamp > currTimestamp){
        timeStamp = currTimestamp;
      }
      timeStamp = parseInt(this.functionsUtil.strToMoment(this.functionsUtil.strToMoment(timeStamp*1000).format('YYYY-MM-DD')+' 23:59:59','YYYY-MM-DD HH:mm:ss')._d.getTime()/1000);
      
      // timeStamp = Math.min(currTimestamp,timeStamp);
      aggregatedBalance = this.functionsUtil.BNify(0);

      // await this.functionsUtil.asyncForEach(Object.keys(tokensBalance),async (token) => {
      // eslint-disable-next-line
      Object.keys(tokensBalance).forEach( token => {

        if (!prevBalances[token]){
          prevBalances[token] = {};
        }
        if (!foundBalances[token]){
          foundBalances[token] = {};
        }
        if (!tokensBalances[token]){
          tokensBalances[token] = this.functionsUtil.BNify(0);
        }
        if (!trancheTokenBalance[token]){
          trancheTokenBalance[token] = {};
        }

        Object.keys(tranches).forEach( tranche => {

          // Skip tranche if no balance
          const filteredTrancheBalances = tokensBalance[token].filter(tx => (tx.tranche===tranche));
          if (!filteredTrancheBalances || !filteredTrancheBalances.length) {
            return;
          }

          let lastTokenData = null;
          const lastTokenDataUnfiltered = tokensData[token] ? Object.values(tokensData[token].filter( tx => tx.tranche===tranche )).pop() : null;
          let filteredTokenData = tokensData[token] ? tokensData[token].filter(tx => (tx.tranche===tranche && tx.timeStamp>=prevTimestamp && tx.timeStamp<=timeStamp)) : null;
          if (filteredTokenData && filteredTokenData.length){
            lastTokenData = filteredTokenData.pop();
          } else {
            lastTokenData = lastTokenDataUnfiltered;
            if (lastTokenData && lastTokenData.timeStamp>timeStamp){
              lastTokenData = null;
            }
          }

          if (!trancheTokenBalance[token][tranche]){
            trancheTokenBalance[token][tranche] = this.functionsUtil.BNify(0);
          }

          if (!prevBalances[token][tranche]){
            prevBalances[token][tranche] = null;
          }

          if (!foundBalances[token][tranche]){
            foundBalances[token][tranche] = null;
          }

          const tokenDecimals = this.functionsUtil.getGlobalConfig(['stats','tokens',token.toUpperCase(),'decimals']);
          let filteredBalances = tokensBalance[token].filter(tx => (tx.tranche===tranche && tx.timeStamp<=timeStamp && (!prevTimestamp || tx.timeStamp>prevTimestamp)));
          
          if (!filteredBalances.length){
            if (prevBalances && prevBalances[token] && prevBalances[token][tranche]){
              filteredBalances = prevBalances[token][tranche];
              const lastFilteredTx = Object.values(filteredBalances).pop();
              const currentBalance = parseFloat(lastFilteredTx.balance);

              // Take tranchePrice from API and calculate new balance
              if (currentBalance>0 && timeStamp>firstTxTimestamp && lastTokenData){
                const trancheTokens = trancheTokenBalance[token][tranche];
                const tranchePrice = this.functionsUtil.fixTokenDecimals(lastTokenData.tranchePrice,tokenDecimals);
                let newBalance = trancheTokens.times(tranchePrice);

                // Set new balance and tranchePrice
                lastFilteredTx.balance = newBalance;
                lastFilteredTx.tranchePrice = tranchePrice;
                filteredBalances = [lastFilteredTx];

                // console.log(this.functionsUtil.strToMoment(timeStamp*1000).format('DD/MM/YYYY HH:mm:ss'),token,trancheTokens.toFixed(5),tranchePrice.toFixed(5),newBalance.toFixed(5),filteredBalances);
              }
            } else {
              filteredBalances = [{
                balance:this.functionsUtil.BNify(0),
                tranchePrice:this.functionsUtil.BNify(0)
              }];
            }
          } else {
            // console.log(this.functionsUtil.strToMoment(timeStamp*1000).format('DD/MM/YYYY HH:mm:ss'),timeStamp,token,tranche,lastTokenData,(lastTokenData ? this.functionsUtil.strToMoment(lastTokenData.timeStamp*1000).format('DD/MM/YYYY HH:mm:ss') : null),(lastTokenData ? lastTokenData.tranchePrice.toFixed(5) : null ));
            filteredBalances.forEach(tx => {
              switch (tx.action){
                case 'Deposit':
                  trancheTokenBalance[token][tranche] = trancheTokenBalance[token][tranche].plus(tx.trancheTokens);
                break;
                default:
                  trancheTokenBalance[token][tranche] = trancheTokenBalance[token][tranche].minus(tx.trancheTokens);
                  if (trancheTokenBalance[token][tranche].lt(0)){
                    trancheTokenBalance[token][tranche] = this.functionsUtil.BNify(0);
                  }
                break;
              }
            });
          }

          const lastTx = Object.values(filteredBalances).pop();
          let lastTxBalance = trancheTokenBalance[token][tranche].times(lastTx.tranchePrice);
          if (lastTxBalance.gt(0)){
            // Convert token balance to USD
            const conversionRateField = this.functionsUtil.getTokenConversionRateField(token);
            if (!this.props.chartToken && conversionRateField){
              const tokenUsdConversionRate = lastTokenData && lastTokenData[conversionRateField] ? lastTokenData[conversionRateField] : (lastTokenDataUnfiltered && lastTokenDataUnfiltered[conversionRateField] ? lastTokenDataUnfiltered[conversionRateField] : null);
              if (tokenUsdConversionRate && this.functionsUtil.BNify(tokenUsdConversionRate).gt(0)){
                lastTxBalance = lastTxBalance.times(tokenUsdConversionRate);
              }
            }
              
            aggregatedBalance = aggregatedBalance.plus(lastTxBalance);
            tokensBalances[token] = tokensBalances[token].plus(lastTxBalance);

            // console.log(this.functionsUtil.strToMoment(timeStamp*1000).format('DD/MM/YYYY HH:mm:ss'),token,tranche,trancheTokenBalance[token][tranche].toFixed(5),lastTx.tranchePrice.toFixed(5),lastTxBalance.toFixed(5));
          }

          foundBalances[token][tranche] = filteredBalances;
        });
      });

      let momentDate = this.functionsUtil.strToMoment(timeStamp*1000);

      if (startDate === null || (momentDate.isSameOrAfter(startDate) && momentDate.isSameOrBefore(new Date(),'day'))){
        
        // if (momentDate.isAfter(new Date(),'day')){
        //   momentDate = this.functionsUtil.strToMoment(new Date());
        // }

        // Force date to midnight
        const formattedDate = momentDate.format('YYYY/MM/DD 00:00');

        // Save days for axisBottom format
        days[momentDate.format('YYYY/MM/DD')] = 1;

        aggregatedBalance = parseFloat(parseFloat(aggregatedBalance.toFixed(6)));

        tokensBalancesPerDate[formattedDate] = tokensBalances;
        aggregatedBalancesKeys[formattedDate] = aggregatedBalance;

        // console.log(timeStamp,formattedDate,tokensBalances);

        minChartValue = minChartValue === null ? aggregatedBalance : Math.min(minChartValue,aggregatedBalance);
        maxChartValue = maxChartValue === null ? aggregatedBalance : Math.max(maxChartValue,aggregatedBalance);
      }

      prevTimestamp = timeStamp;
      prevBalances = foundBalances;
    }

    const aggregatedBalances = Object.keys(aggregatedBalancesKeys).map(date => ({
      x:date,
      y:aggregatedBalancesKeys[date],
      balances:tokensBalancesPerDate[date]
    }));

    let itemIndex = 0;
    aggregatedBalances.forEach( (item,index) => {
      const itemPos = Math.floor(itemIndex/aggregatedBalances.length*100);
      aggregatedBalances[index].itemPos = itemPos;
      itemIndex++;
    });

    /*
    aggregatedBalances.push({
      x:momentDate.format('YYYY/MM/DD HH:mm'),
      y:aggregatedBalance
    });
    */

    // Add day before to start with zero balance
    /*
    const firstTxMomentDate = this.functionsUtil.strToMoment(firstTxTimestamp*1000);
    if ((startDate === null || startDate.isSameOrBefore(firstTxMomentDate)) && aggregatedBalances.length){
      const firstItem = aggregatedBalances[0];
      const firstDate = this.functionsUtil.strToMoment(firstItem.x,'YYYY/MM/DD HH:mm');
      firstDate.subtract(1,'day');
      aggregatedBalances.unshift({
        x:firstDate.format('YYYY/MM/DD HH:mm'),
        y:0
      });
    }
    */

    const chartToken = this.props.chartToken ? this.props.chartToken.toUpperCase() : 'USD';

    // Add token Data
    chartData.push({
      id:chartToken,
      color: 'hsl('+ this.functionsUtil.getGlobalConfig(['stats','tokens',chartToken.toUpperCase(),'color','hsl']).join(',')+')',
      data:aggregatedBalances
    });

    // console.log('PortfolioEquityTranches',chartData);

    let yFormatDecimals = 2;
    if (maxChartValue-minChartValue<1){
      yFormatDecimals = 4;
    }

    if (maxChartValue === minChartValue){
      minChartValue = Math.max(0,maxChartValue-1);
    }

    const maxGridLines = 5;
    const gridYStep = (maxChartValue-minChartValue)/maxGridLines;
    const gridYValues = [];
    for (let i=0;i<=maxGridLines;i++){
      const gridYValue = parseFloat(parseFloat(minChartValue+(i*gridYStep)).toFixed(6));
      gridYValues.push(gridYValue);
    }
    
    const axisBottomMaxValues = 10;
    const daysCount = Object.values(days).length;    
    const daysFrequency = Math.max(1,Math.ceil(daysCount/axisBottomMaxValues));

    const chartProps = {
      xScale:{
        type: 'time',
        format: '%Y/%m/%d %H:%M',
      },
      yScale:{
        type: 'linear',
        stacked: false,
        min: minChartValue,
        max: maxChartValue
      },
      xFormat:'time:%b %d %Y',
      yFormat:value => this.functionsUtil.formatMoney(value,yFormatDecimals),
      axisBottom: this.props.isMobile ? null : {
        legend: '',
        tickSize:0,
        format: '%b %d',
        tickPadding: 15,
        orient: 'bottom',
        legendOffset: 36,
        legendPosition: 'middle',
        tickValues:'every '+daysFrequency+' days'
      },
      gridYValues,
      pointSize:0,
      useMesh:true,
      axisLeft: this.props.isMobile ? null : {
        legend: '',
        tickSize: 0,
        orient: 'left',
        tickPadding: 10,
        tickRotation: 0,
        legendOffset: -70,
        tickValues:gridYValues,
        legendPosition: 'middle',
        format: v => this.functionsUtil.abbreviateNumber(v,2),
      },
      animate:true,
      pointLabel:'y',
      enableArea:true,
      enableSlices:'x',
      enableGridY:true,
      curve:'monotoneX',
      enableGridX:false,
      pointBorderWidth:1,
      colors:d => d.color,
      pointLabelYOffset:-12,
      areaBaselineValue:minChartValue,
      pointColor:{ from: 'color', modifiers: []},
      areaOpacity:this.props.themeMode === 'light' ? 0.1 : 0.5,
      theme:{
        axis: {
          ticks: {
            text: {
              fontSize:12,
              fontWeight:600,
              fill:this.props.theme.colors.legend,
              fontFamily:this.props.theme.fonts.sansSerif
            }
          }
        },
        grid: {
          line: {
            stroke: this.props.theme.colors.lineChartStroke, strokeDasharray: '8 4'
          }
        },
      },
      /*
      defs:[
        linearGradientDef('gradientA', [
          { offset: 0, color: 'inherit' },
          { offset: 100, color: 'inherit', opacity: 0 },
        ]),
      ],
      fill:[{ match: '*', id: 'gradientA' }],
      */
      margin: this.props.isMobile ? { top: 20, right: 25, bottom: 25, left: 20 } : { top: 30, right: 50, bottom: 45, left: 60 },
      sliceTooltip:(slideData) => {
        const { slice } = slideData;
        const point = slice.points[0];
        return (
          <ChartCustomTooltip
            point={point}
          >
            <ChartCustomTooltipRow
              color={point.color}
              label={point.serieId}
              value={`$ ${point.data.yFormatted}`}
            />
            {
            (typeof point.data.balances === 'object' && Object.keys(point.data.balances).length>0) &&
              Object.keys(point.data.balances).map(token => {
                if (token === point.serieId){
                  return null;
                }
                const color = this.functionsUtil.getGlobalConfig(['stats','tokens',token.toUpperCase(),'color','hex']);
                const balance = point.data.balances[token];
                let formattedBalance = this.functionsUtil.formatMoney(balance,2);
                if (parseFloat(balance)>=0.01){
                  return (
                    <ChartCustomTooltipRow
                      label={token}
                      color={color}
                      key={`row_${token}`}
                      value={`$ ${formattedBalance}`}
                    />
                  );
                }
                return null;
              })
            }
          </ChartCustomTooltip>
        );
      }
    };

    this.setState({
      chartData,
      chartProps
    });
  }

  render() {
    return (
      <GenericChart
        type={Line}
        showLoader={true}
        {...this.state.chartProps}
        data={this.state.chartData}
        parentId={this.props.parentId}
        height={this.props.chartHeight}
        parentIdHeight={this.props.parentIdHeight}
      />
    );
  }
}

export default PortfolioEquityTranches;