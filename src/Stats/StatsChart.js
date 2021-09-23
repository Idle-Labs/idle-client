import moment from 'moment';
import { Bar } from '@nivo/bar';
import { Line } from '@nivo/line';
import React, { Component } from 'react';
import globalConfigs from '../configs/globalConfigs';
import FunctionsUtil from '../utilities/FunctionsUtil';
import GenericChart from '../GenericChart/GenericChart';
import DashboardCard from '../DashboardCard/DashboardCard';
import CustomTooltip from '../CustomTooltip/CustomTooltip';
import CustomTooltipRow from '../CustomTooltip/CustomTooltipRow';

class StatsChart extends Component {
  state = {
    chartProps:{},
    chartType:null,
    chartData:null,
    chartWidth:null
  };

  async componentDidMount() {
    this.setState({
      chartData:null,
      chartType:null,
      chartProps:null,
    });
    this.loadUtils();
    this.loadApiData();
  }

  async componentDidUpdate(prevProps) {
    const showAdvancedChanged = prevProps.showAdvanced !== this.props.showAdvanced;
    const apiResultsChanged = prevProps.apiResults !== this.props.apiResults;
    const tokenChanged = prevProps.selectedToken !== this.props.selectedToken || JSON.stringify(prevProps.tokenConfig) !== JSON.stringify(this.props.tokenConfig);
    if (apiResultsChanged || showAdvancedChanged || tokenChanged){
      this.componentDidMount();
    }
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

  parseAum = value => {
    return (parseInt(value)>=1000 ? parseFloat(value/1000).toFixed(1)+'K' : parseFloat(value) )+' '+this.props.selectedToken
  }

  loadApiData = async () => {

    if (!this.props.tokenConfig || !this.props.selectedToken || !this.props.chartMode || !this.props.apiResults){
      return false;
    }

    const maxGridLines = 4;
    const apiResults = this.props.apiResults;
    const apiResults_unfiltered = this.props.apiResults_unfiltered;
    const totalItems = apiResults.length;
    const protocols = Object.assign([],this.props.tokenConfig.protocols);
    // const compoundProtocol = this.props.tokenConfig.protocols.find( p => (p.name === 'compound'));

    const versionInfo = globalConfigs.stats.versions[this.props.idleVersion];

    let keys = {};
    let tempData = {};
    let gridYStep = 0;
    let itemIndex = 0;
    let daysCount = 0;
    let chartData = [];
    let chartProps = {};
    let chartType = Line;
    let gridYValues = [];
    let maxChartValue = 0;
    let axisBottomIndex = 0;
    let daysFrequency = null;
    let idleChartData = null;
    let firstIdleBlock = null;
    let axisBottomMaxValues = 12;

    switch (this.props.chartMode){
      case 'VOL':
        let divergingData = {};

        const startTimestamp = parseInt(apiResults_unfiltered[0].timestamp);
        const endTimestamp = parseInt(moment()._d.getTime()/1000);

        for (let timestamp=startTimestamp;timestamp<=endTimestamp;timestamp+=86400){
          const date = moment(timestamp*1000).format("YYYY/MM/DD");
          if (!divergingData[date]){
            divergingData[date] = {
              date,
              timestamp,
              deposits: 0,
              redeems: 0
            };
          }
        }

        let lastRow = null;
        apiResults_unfiltered.forEach(row => {
          const date = moment(row.timestamp*1000).format("YYYY/MM/DD");
          const idleTokens = this.functionsUtil.fixTokenDecimals(row.idleSupply,18);

          if (!divergingData[date]){
            divergingData[date] = {
              date,
              timestamp:row.timestamp,
              deposits: 0,
              redeems: 0
            };
          }

          if (lastRow){
            const idleTokensPrev = this.functionsUtil.fixTokenDecimals(lastRow.idleSupply,18);
            const idleTokensDiff = !idleTokens.eq(idleTokensPrev);
            if (idleTokensDiff){
              const diff = idleTokens.minus(idleTokensPrev);
              // Deposits
              if (diff.gte(0)){
                divergingData[date].deposits+=parseFloat(diff);
                maxChartValue = Math.max(maxChartValue,divergingData[date].deposits);
              } else {
                divergingData[date].redeems+=parseFloat(diff);
                maxChartValue = Math.max(maxChartValue,Math.abs(divergingData[date].deposits));
              }
            }

          } else {
            divergingData[date].deposits+=parseFloat(idleTokens);
          }

          lastRow = row;
        });

        chartData = Object.values(divergingData).filter(v => {
          return (!this.props.startTimestamp || v.timestamp>=this.props.startTimestamp) && (!this.props.endTimestamp || v.timestamp<=this.props.endTimestamp);
        }).sort((a,b) => (a.timestamp < b.timestamp ? -1 : 1));

        let maxRange = 0;
        chartData.forEach(v => {
          maxRange = Math.max(maxRange,Math.abs(v.deposits),Math.abs(v.redeems));
        });

        chartType = Bar;

        gridYStep = parseFloat(maxChartValue/maxGridLines);
        gridYValues = [0];
        for (let i=1;i<=5;i++){
          gridYValues.push(i*gridYStep);
        }

        axisBottomIndex = 0;
        axisBottomMaxValues = 6;
        daysCount = moment(chartData[chartData.length-1].date,"YYYY/MM/DD").diff(moment(chartData[0].date,"YYYY/MM/DD"),'days');
        daysFrequency = Math.max(1,Math.ceil(daysCount/axisBottomMaxValues));

        chartProps = {
          indexBy: 'date',
          enableLabel: false,
          minValue:-maxRange,
          maxValue:maxRange,
          label: d => {
            return Math.abs(d.value);
          },
          axisBottom: this.props.isMobile ? null : {
            tickSize: 0,
            legend: '',
            tickPadding: 15,
            orient: 'bottom',
            legendOffset: 0,
            tickValues: 'every day',
            format: (value) => {
              if (axisBottomIndex++ % daysFrequency === 0){
                return moment(value,'YYYY/MM/DD').format('MMM DD')
              }
            },
            legendPosition: 'middle',
          },
          axisLeft: null,
          axisRight: {
            legend: '',
            tickSize: 0,
            orient: 'left',
            tickPadding: 10,
            tickRotation: 0,
            legendOffset: -70,
            tickValues:8,
            legendPosition: 'middle',
            format: v => this.functionsUtil.abbreviateNumber(Math.abs(v),0)
          },
          markers: [
            {
              axis: 'y',
              value: 0,
              lineStyle: { strokeOpacity: 0 },
              textStyle: { fill: this.props.theme.colors.transactions.action.deposit },
              legend: 'deposits',
              legendPosition: 'top-left',
              legendOrientation: 'vertical',
              // legendOffsetY: 120,
              legendOffsetX: -20
            },
            {
              axis: 'y',
              value: 0,
              lineStyle: { stroke: this.props.theme.colors['dark-gray'], strokeDasharray: '5 3' },
              textStyle: { fill: this.props.theme.colors.transactions.action.redeem },
              legend: 'redeems',
              legendPosition: 'bottom-left',
              legendOrientation: 'vertical',
              // legendOffsetY: 120,
              legendOffsetX: -20
            },
          ],
          keys:['deposits','redeems'],
          padding:0.4,
          colors:[this.props.theme.colors.transactions.action.deposit, this.props.theme.colors.transactions.action.redeem],
          labelTextColor: 'inherit:darker(1.4)',
          labelSkipWidth: 16,
          labelSkipHeight: 16,
          pointSize:0,
          useMesh:true,
          animate:false,
          pointLabel:"y",
          curve:'linear',
          enableArea:false,
          enableSlices:'x',
          enableGridX:false,
          enableGridY:true,
          pointBorderWidth:1,
          pointLabelYOffset:-12,
          legends:[
            {
              dataFrom:'keys',
              itemWidth: this.props.isMobile ? 80 : 100,
              itemHeight: 18,
              translateX: 0,
              translateY: this.props.isMobile ? 40 : 65,
              symbolSize: 10,
              itemsSpacing: 0,
              direction: 'row',
              anchor: 'bottom-left',
              symbolShape: 'circle',
              itemTextColor: this.props.theme.colors.legend,
              effects: [
                {
                  on: 'hover',
                  style: {
                    itemTextColor: this.props.themeMode === 'light' ? '#000' : '#fff'
                  }
                }
              ]
            }
          ],
          theme:{
            axis: {
              ticks: {
                text: {
                  fontSize: this.props.isMobile ? 12: 14,
                  fontWeight:600,
                  fill:this.props.theme.colors.legend,
                  fontFamily: this.props.theme.fonts.sansSerif
                }
              }
            },
            grid: {
              line: {
                stroke: this.props.theme.colors.lineChartStroke, strokeDasharray: '10 6'
              }
            },
            legends:{
              text:{
                fontWeight:500,
                fill:this.props.theme.colors.legend,
                textTransform:'capitalize',
                fontFamily: this.props.theme.fonts.sansSerif,
                fontSize: this.props.isMobile ? 12: 14
              }
            },
            tooltip:{
              container:{
                boxShadow:null,
                background:null
              }
            }
          },
          pointColor:{ from: 'color', modifiers: []},
          margin: this.props.isMobile ? { top: 20, right: 50, bottom: 45, left: 50 } : { top: 20, right: 70, bottom: 70, left: 50 },
          tooltip:(data) => {
            const xFormatted = this.functionsUtil.strToMoment(data.data.timestamp*1000).format('MMM DD HH:ss');
            const point = {
              id:data.id,
              data:{
                xFormatted
              }
            };
            const depositFormatted = this.functionsUtil.abbreviateNumber(data.data.deposits,2)+' '+this.props.selectedToken;
            const redeemFormatted = this.functionsUtil.abbreviateNumber(data.data.redeems,2)+' '+this.props.selectedToken;
            return (
              <CustomTooltip
                point={point}
              >
                <CustomTooltipRow
                  label={'Deposits'}
                  color={this.props.theme.colors.deposit}
                  value={depositFormatted}
                />
                <CustomTooltipRow
                  label={'Redeem'}
                  color={this.props.theme.colors.redeem}
                  value={redeemFormatted}
                />
              </CustomTooltip>
            );
          }
        };
      break;
      /*
      case 'AUM_ALL':
        await this.functionsUtil.asyncForEach(Object.keys(availableTokens[globalConfigs.network.requiredNetwork]),async (tokenName,i) => {
          const tokenConfig = availableTokens[globalConfigs.network.requiredNetwork][tokenName];
          const tokenDataApi = await this.props.getTokenData(tokenConfig.address);
          chartData.push({
            id:tokenName,
            color: tokenConfig.color,
            data: tokenDataApi.map((d,i) => {
              const idleTokens = this.functionsUtil.fixTokenDecimals(d.idleSupply,18);
              const idlePrice = this.functionsUtil.fixTokenDecimals(d.idlePrice,tokenConfig.decimals);
              const aum = idleTokens.times(idlePrice);
              return {
                x: moment(d.timestamp*1000).format("YYYY/MM/DD HH:mm"),
                y: parseInt(aum.toString())
              };
            })
          });
        });

        // Set chart type
        chartType = Line;

        chartProps = {
          xScale:{
            type: 'time',
            format: '%Y/%m/%d %H:%M',
            // precision: 'hour',
          },
          xFormat:'time:%b %d %H:%M',
          yFormat:value => (parseInt(value)>=1000 ? parseFloat(value/1000).toFixed(1)+'K' : parseFloat(value) )+' '+this.props.selectedToken,
          yScale:{
            type: 'linear',
            stacked: false
          },
          axisLeft:{
            format: v => this.functionsUtil.abbreviateNumber(v),
            orient: 'left',
            tickSize: 5,
            tickPadding: 5,
            tickRotation: 0,
            legend: '',
            legendOffset: -65,
            legendPosition: 'middle'
          },
          axisBottom: this.props.isMobile ? null : {
            format: '%b %d',
            tickValues: this.props.isMobile ? 'every 4 days' : 'every 3 days',
            orient: 'bottom',
            legend: '',
            legendOffset: 36,
            legendPosition: 'middle'
          },
          enableArea:false,
          curve:"linear",
          enableSlices:'x',
          enableGridX:true,
          enableGridY:false,
          colors:d => d.color,
          pointSize:0,
          pointColor:{ from: 'color', modifiers: []},
          pointBorderWidth:1,
          pointLabel:"y",
          pointLabelYOffset:-12,
          useMesh:true,
          animate:false,
          margin: this.props.isMobile ? { top: 20, right: 20, bottom: 40, left: 50 } : { top: 20, right: 60, bottom: 40, left: 60 },
        };
      break;
      */
      case 'AUM':

        maxChartValue = 0;

        chartData.push({
          id:'AUM',
          color: 'hsl('+globalConfigs.stats.tokens[this.props.selectedToken].color.hsl.join(',')+')',
          data: apiResults.map((d,i) => {
            const idleTokens = this.functionsUtil.fixTokenDecimals(d.idleSupply,18);
            const idlePrice = this.functionsUtil.fixTokenDecimals(d.idlePrice,this.props.tokenConfig.decimals);
            const aum = idleTokens.times(idlePrice);
            const x = moment(d.timestamp*1000).format("YYYY/MM/DD HH:mm");
            const y = parseFloat(aum.toString());

            maxChartValue = Math.max(maxChartValue,y);

            return { x,y };
          })
        });

        // Add allocation
        this.props.tokenConfig.protocols.forEach((p,j) => {
          apiResults.map((d,i) => {
            return d.protocolsData.filter((protocolAllocation,x) => {
                return protocolAllocation.protocolAddr.toLowerCase() === p.address.toLowerCase()
            })
            .map((protocolAllocation,z) => {
              const protocolPaused = this.functionsUtil.BNify(protocolAllocation.rate).eq(0);
              if (!protocolPaused){
                const x = moment(d.timestamp*1000).format("YYYY/MM/DD HH:mm");
                let y = parseFloat(this.functionsUtil.fixTokenDecimals(protocolAllocation.allocation,this.props.tokenConfig.decimals));

                maxChartValue = Math.max(maxChartValue,y);

                let foundItem = chartData[0].data.filter(item => { return item.x === x });
                if (foundItem){
                  foundItem = foundItem[0];
                  const pos = chartData[0].data.indexOf(foundItem);
                  if (!foundItem.allocations){
                    foundItem.allocations = {};
                  }
                  foundItem.allocations[p.name] = y;
                  chartData[0].data[pos] = foundItem;
                }
              }
              return undefined;
            })[0]
          }).filter((v) => { return v !== undefined; } )
        });

        // Set chart type
        chartType = Line;

        gridYStep = parseFloat(maxChartValue/maxGridLines);
        gridYValues = [0];
        for (let i=1;i<=5;i++){
          gridYValues.push(i*gridYStep);
        }

        axisBottomIndex = 0;
        axisBottomMaxValues = 6;
        daysCount = moment(chartData[0].data[chartData[0].data.length-1].x,"YYYY/MM/DD HH:mm").diff(moment(chartData[0].data[0].x,"YYYY/MM/DD HH:mm"),'days');
        daysFrequency = Math.max(1,Math.ceil(daysCount/axisBottomMaxValues));

        chartProps = {
          xScale:{
            type: 'time',
            format: '%Y/%m/%d %H:%M',
            // precision: 'hour',
          },
          xFormat:'time:%b %d %H:%M',
          yFormat:v => this.functionsUtil.formatMoney(v,v<1 ? 3 :0),
          yScale:{
            type: 'linear',
            stacked: false
          },
          axisLeft:{
            legend: '',
            tickSize: 0,
            orient: 'left',
            tickPadding: 10,
            tickRotation: 0,
            legendOffset: -70,
            tickValues:gridYValues,
            legendPosition: 'middle',
            format: v => this.functionsUtil.abbreviateNumber(v,v<1 ? 3 :0),
          },
          axisBottom: this.props.isMobile ? null : {
            legend: '',
            tickSize: 0,
            format: (value) => {
              if (axisBottomIndex++ % daysFrequency === 0){
                return moment(value,'YYYY/MM/DD HH:mm').format('MMM DD')
              }
            },
            tickPadding: 15,
            orient: 'bottom',
            legendOffset: 0,
            tickValues: 'every day',
            legendPosition: 'middle'
          },
          gridYValues,
          pointSize:0,
          useMesh:true,
          animate:false,
          pointLabel:"y",
          curve:'linear',
          enableArea:true,
          enableSlices:'x',
          enableGridX:false,
          enableGridY:true,
          pointBorderWidth:1,
          colors:d => d.color,
          pointLabelYOffset:-12,
          legends:[
            {
              itemWidth: this.props.isMobile ? 70 : 80,
              itemHeight: 18,
              translateX: this.props.isMobile ? -35 : 0,
              translateY: this.props.isMobile ? 40 : 65,
              symbolSize: 10,
              itemsSpacing: 5,
              direction: 'row',
              anchor: 'bottom-left',
              symbolShape: 'circle',
              itemTextColor: this.props.theme.colors.legend,
              effects: [
                {
                  on: 'hover',
                  style: {
                    itemTextColor: this.props.themeMode === 'light' ? '#000' : '#fff'
                  }
                }
              ]
            }
          ],
          theme:{
            axis: {
              ticks: {
                text: {
                  fontSize: this.props.isMobile ? 12: 14,
                  fontWeight:600,
                  fill:this.props.theme.colors.legend,
                  fontFamily: this.props.theme.fonts.sansSerif
                }
              }
            },
            grid: {
              line: {
                stroke: this.props.theme.colors.lineChartStroke, strokeDasharray: '10 6'
              }
            },
            legends:{
              text:{
                fontSize: this.props.isMobile ? 12: 14,
                fill:this.props.theme.colors.legend,
                fontWeight:500,
                fontFamily: this.props.theme.fonts.sansSerif
              }
            }
          },
          pointColor:{ from: 'color', modifiers: []},
          margin: this.props.isMobile ? { top: 20, right: 20, bottom: 40, left: 65 } : { top: 20, right: 40, bottom: 70, left: 70 },
          sliceTooltip:(slideData) => {
            const { slice } = slideData;
            const point = slice.points[0];
            if (typeof point === 'object' && typeof point.data === 'object'){
              return (
                <CustomTooltip
                  point={point}
                >
                  <CustomTooltipRow
                    label={point.serieId}
                    color={point.serieColor}
                    value={point.data.yFormatted}
                  />
                  {
                    point.data.allocations && typeof point.data.allocations === 'object' &&
                      Object.keys(point.data.allocations).map(protocolName => {
                        const protocolInfo = globalConfigs.stats.protocols[protocolName];
                        const protocolColor = 'hsl('+protocolInfo.color.hsl.join(',')+')';
                        const protocolAllocation = point.data.allocations[protocolName];
                        const protocolAllocationFormatted = this.functionsUtil.formatMoney(protocolAllocation,protocolAllocation<1 ? 3 : 0);
                        const protocolAllocationPerc = this.functionsUtil.BNify(point.data.allocations[protocolName]).div(this.functionsUtil.BNify(point.data.y)).times(100).toFixed(0)+'%';
                        return (
                          <CustomTooltipRow
                            color={protocolColor}
                            label={protocolInfo.label}
                            key={`${point.id}_${protocolName}`}
                            value={`${protocolAllocationFormatted} (${protocolAllocationPerc})`}
                          />
                        );
                      })
                  }
                </CustomTooltip>
              );
              /*
              return (
                <div
                    key={point.id}
                    style={{
                      background: 'white',
                      color: 'inherit',
                      fontSize: 'inherit',
                      borderRadius: '2px',
                      boxShadow: 'rgba(0, 0, 0, 0.25) 0px 1px 2px',
                      padding: '5px 9px'
                    }}
                >
                  <div>
                    <table style={{width:'100%',borderCollapse:'collapse'}}>
                      <tbody>
                        <tr>
                          <td style={{padding:'3px 5px'}}>
                            <span style={{display:'block', width: '12px', height: '12px', background: point.serieColor}}></span>
                          </td>
                          <td style={{padding:'3px 5px'}}>{point.serieId}</td>
                          <td style={{padding:'3px 5px'}}><strong>{point.data.yFormatted}</strong></td>
                        </tr>
                        {
                          point.data.allocations && typeof point.data.allocations === 'object' &&
                            Object.keys(point.data.allocations).map(protocolName => {
                              const protocolColor = 'hsl('+globalConfigs.stats.protocols[protocolName].color.hsl.join(',')+')';
                              const protocolAllocation = this.functionsUtil.formatMoney(point.data.allocations[protocolName],0);
                              const protocolAllocationPerc = this.functionsUtil.BNify(point.data.allocations[protocolName]).div(this.functionsUtil.BNify(point.data.y)).times(100).toFixed(0)+'%';
                              return (
                                <tr key={`${point.id}_${protocolName}`}>
                                  <td style={{padding:'3px 5px'}}>
                                    <span style={{display:'block', width: '12px', height: '12px', background: protocolColor}}></span>
                                  </td>
                                  <td style={{padding:'3px 5px',textTransform:'capitalize'}}>{protocolName}</td>
                                  <td style={{padding:'3px 5px'}}><strong>{protocolAllocation}</strong> ({protocolAllocationPerc})</td>
                                </tr>
                              );
                            })
                        }
                      </tbody>
                    </table>
                  </div>
                </div>
              );
              */
            }

            return null;
          }
        };
      break;
      case 'ALL':
        keys = {};
        tempData = {};

        apiResults.forEach((d,i) => {
          const date = moment(d.timestamp*1000).format("YYYY/MM/DD");

          let row = {
            date
          };

          d.protocolsData.forEach((protocolData) => {
            const protocolPaused = this.functionsUtil.BNify(protocolData.rate).eq(0);
            const foundProtocol = this.props.tokenConfig.protocols.find((p) => { return p.address.toLowerCase() === protocolData.protocolAddr.toLowerCase() });
            if (foundProtocol){
              const protocolInfo = globalConfigs.stats.protocols[foundProtocol.name];
              if (!protocolPaused){
                let allocation = parseFloat(this.functionsUtil.fixTokenDecimals(protocolData.allocation,this.props.tokenConfig.decimals));
                keys[protocolInfo.label] = 1;
                row[protocolInfo.label] = allocation;
                row[`${protocolInfo.label}Color`] = 'hsl('+protocolInfo.color.hsl.join(',')+')';
                // console.log(protocolInfo.label,this.functionsUtil.BNify(protocolData.allocation).toString(),this.props.tokenConfig.decimals,allocation);
                maxChartValue = Math.max(maxChartValue,allocation);
              } else {
                row[protocolInfo.label] = 0;
              }
            }
          });


          tempData[date] = row;
        });

        const dates = Object.keys(tempData);
        chartData = Object.values(tempData);

        // Set chart type
        chartType = Bar;

        gridYStep = parseFloat(maxChartValue/maxGridLines);
        gridYValues = [0];
        for (let i=1;i<=5;i++){
          gridYValues.push(i*gridYStep);
        }

        axisBottomIndex = 0;
        axisBottomMaxValues = 12;
        daysCount = moment(dates[dates.length-1],"YYYY/MM/DD").diff(moment(dates[0],"YYYY/MM/DD"),'days');
        daysFrequency = Math.max(1,Math.ceil(daysCount/axisBottomMaxValues));

        chartProps = {
          padding: 0.2,
          animate: false,
          indexBy: 'date',
          enableLabel: false,
          labelSkipWidth: 16,
          labelSkipHeight: 16,
          keys: Object.keys(keys),
          labelTextColor: 'inherit:darker(1.4)',
          colors: ({ id, data }) => data[`${id}Color`],
          axisLeft:{
            format: v => this.functionsUtil.abbreviateNumber(v,v<1 ? 3 :0),
            orient: 'left',
            tickSize: 0,
            tickPadding: 10,
            tickRotation: 0,
            legend: '',
            legendOffset: -65,
            tickValues:gridYValues,
            legendPosition: 'middle'
          },
          gridYValues,
          axisBottom: this.props.isMobile ? null : {
            legend: '',
            format: (value) => {
              if (axisBottomIndex++ % daysFrequency === 0){
                return moment(value,'YYYY/MM/DD HH:mm').format('MMM DD')
              }
            },
            tickSize: 0,
            tickPadding: 10,
            legendOffset: 36,
            orient: 'bottom-left',
            tickValues: 'every day',
            legendPosition: 'middle'
          },
          legends:[
            {
              dataFrom:'keys',
              itemWidth: this.props.isMobile ? 70 : 80,
              itemHeight: 18,
              translateX: this.props.isMobile ? -35 : 0,
              translateY: this.props.isMobile ? 40 : 65,
              symbolSize: 10,
              itemsSpacing: 5,
              direction: 'row',
              anchor: 'bottom-left',
              symbolShape: 'circle',
              itemTextColor: this.props.theme.colors.legend,
              effects: [
                {
                  on: 'hover',
                  style: {
                    itemTextColor: this.props.themeMode === 'light' ? '#000' : '#fff'
                  }
                }
              ]
            }
          ],
          theme:{
            tooltip: {
              container:{
                padding:'0',
                boxShadow:'none',
                background:'transparent',
              },
              tableCell:{
                padding:'0'
              }
            },
            axis: {
              ticks: {
                text: {
                  fontSize:this.props.isMobile ? 12 : 14,
                  fontWeight:600,
                  fill:this.props.theme.colors.legend,
                  fontFamily: this.props.theme.fonts.sansSerif
                }
              }
            },
            grid: {
              line: {
                stroke: this.props.theme.colors.lineChartStroke, strokeDasharray: '10 6'
              }
            },
            legends:{
              text:{
                fontSize:this.props.isMobile ? 12 : 14,
                fill:this.props.theme.colors.legend,
                fontWeight:500,
                fontFamily: this.props.theme.fonts.sansSerif
              }
            }
          },
          pointColor:{ from: 'color', modifiers: []},
          margin: this.props.isMobile ? { top: 20, right: 20, bottom: 40, left: 65 } : { top: 20, right: 40, bottom: 70, left: 60 },
          tooltip:({ id, value, color }) => {
            const allocation = this.functionsUtil.formatMoney(value,0);
            return (
              <DashboardCard
                cardProps={{
                  py:1,
                  px:2,
                  width:1,
                }}
              >
                <table
                  style={{width:'100%',borderCollapse:'collapse'}}
                >
                  <tbody>
                    <tr>
                      <td style={{padding:'3px 5px'}}>
                        <span style={{display:'block', width: '12px', height: '12px', background: color}}></span>
                      </td>
                      <td style={{padding:'3px 5px',textTransform:'capitalize'}}>{id}</td>
                      <td style={{padding:'3px 5px'}}><strong>{allocation} {this.props.selectedToken}</strong></td>
                    </tr>
                  </tbody>
                </table>
              </DashboardCard>
            )
          }
        }
      break;
      case 'ALL_PERC':
        keys = {};
        tempData = {};

        apiResults.forEach((d,i) => {
          const date = moment(d.timestamp*1000).format("YYYY/MM/DD")
          let row = {
            date:moment(d.timestamp*1000).format("YYYY/MM/DD HH:mm")
          };
          if (tempData[date]){
            row = tempData[date];
          }

          const totalAllocation = d.protocolsData.reduce((accumulator,protocolAllocation) => {
            const allocation = this.functionsUtil.fixTokenDecimals(protocolAllocation.allocation,this.props.tokenConfig.decimals);
            return this.functionsUtil.BNify(accumulator).plus(allocation);
          },0);

          d.protocolsData.forEach((protocolData) => {
            const protocolPaused = this.functionsUtil.BNify(protocolData.rate).eq(0);
            const protocolName = this.props.tokenConfig.protocols.filter((p) => { return p.address.toLowerCase() === protocolData.protocolAddr.toLowerCase() })[0].name;
            if (!protocolPaused){
              const allocation = this.functionsUtil.fixTokenDecimals(protocolData.allocation,this.props.tokenConfig.decimals);
              const allocationPerc = parseFloat(allocation.div(totalAllocation).times(100));
              keys[protocolName] = 1;
              row[protocolName] = allocationPerc;
              row[`${protocolName}Color`] = 'hsl('+globalConfigs.stats.protocols[protocolName].color.hsl.join(',')+')';
            } else if (typeof row[protocolName] !== undefined) {
              row[protocolName] = 0;
            } 
          });
          
          tempData[date] = row;
        });

        chartData = Object.values(tempData);

        // Set chart type
        chartType = Bar;

        axisBottomIndex = 0;

        chartProps = {
          padding: 0.2,
          animate: false,
          indexBy: 'date',
          data: chartData,
          enableLabel: false,
          labelSkipWidth: 16,
          labelSkipHeight: 16,
          keys: Object.keys(keys),
          labelTextColor: 'inherit:darker(1.4)',
          margin: this.props.isMobile ? { top: 20, right: 20, bottom: 40, left: 50 } : { top: 20, right: 40, bottom: 40, left: 60 },
          colors: ({ id, data }) => data[`${id}Color`],
          axisLeft:{
            format: v => parseInt(v)+'%'
          },
          axisBottom: this.props.isMobile ? null : {
            legend: '',
            format: (value) => {
              if (axisBottomIndex++ % 3 === 0){
                return moment(value,'YYYY/MM/DD HH:mm').format('MMM DD')
              }
            },
            orient: 'bottom',
            legendOffset: 36,
            legendPosition: 'middle',
            tickValues: 'every 3 days'
          },
          tooltip:({ id, value, color }) => {
            const allocation = parseInt(value)===100 ? this.functionsUtil.formatMoney(value,0) : this.functionsUtil.formatMoney(value,2);
            return (
              <table style={{width:'100%',borderCollapse:'collapse'}}>
                <tbody>
                  <tr>
                    <td style={{padding:'3px 5px'}}>
                      <span style={{display:'block', width: '12px', height: '12px', background: color}}></span>
                    </td>
                    <td style={{padding:'3px 5px',textTransform:'capitalize'}}>{id}</td>
                    <td style={{padding:'3px 5px'}}><strong>{allocation}%</strong></td>
                  </tr>
                </tbody>
              </table>
            )
          }
        }
      break;
      case 'APR':

        maxChartValue = 0;

        // Add Additional protocols
        if (versionInfo.additionalProtocols && versionInfo.additionalProtocols.length>0){
          versionInfo.additionalProtocols.forEach( additionalProtocol => {
            const protocolInfo = this.props.tokenConfig.protocols.find( p => (p.name === additionalProtocol.protocol));
            if (protocolInfo && additionalProtocol.enabledTokens.includes(this.props.selectedToken)){
              additionalProtocol.enabled = true;
              additionalProtocol.address = protocolInfo.address;
              protocols.unshift(additionalProtocol);
            }
          });
        }

        protocols.forEach((p,j) => {
          const protocolInfo = {...globalConfigs.stats.protocols[p.name]};
          if (!protocolInfo.enabled){
            return;
          }
          if (chartData.filter(d => { return d.name === p.name; }).length){
            return;
          }

          const rateField = protocolInfo.rateField ? protocolInfo.rateField : 'rate';
          
          chartData.push({
            id:protocolInfo.label,
            color:'hsl('+globalConfigs.stats.protocols[p.name].color.hsl.join(',')+')',
            data:apiResults.map((d,i) => {
              return d.protocolsData.filter((protocolAllocation,x) => {
                  return protocolAllocation.protocolAddr.toLowerCase() === p.address.toLowerCase()
              })
              .map((protocolAllocation,z) => {
                // let protocolRate = this.functionsUtil.BNify(protocolAllocation.rate);

                let protocolRate = typeof rateField === 'object' && rateField.length ? rateField.reduce((acc,field) => {
                  if (protocolAllocation[field]){
                    return this.functionsUtil.BNify(acc).plus(this.functionsUtil.BNify(protocolAllocation[field]));
                  }
                  return this.functionsUtil.BNify(acc);
                },0) : this.functionsUtil.BNify(protocolAllocation[rateField]);

                const protocolPaused = protocolRate.eq(0);
                if (!protocolPaused){

                  // Aave V1 wrong rate FIX
                  if (protocolRate.lt(0) && protocolAllocation.aaveAdditionalAPR && this.functionsUtil.BNify(protocolAllocation.aaveAdditionalAPR).gt(0)){
                    protocolRate = protocolRate.plus(this.functionsUtil.BNify(protocolAllocation.aaveAdditionalAPR));
                  }

                  protocolRate = this.functionsUtil.fixTokenDecimals(protocolRate,18);

                  const x = moment(d.timestamp*1000).format("YYYY/MM/DD HH:mm");
                  const y = parseFloat(protocolRate);

                  maxChartValue = Math.max(maxChartValue,y);

                  return { x, y };
                }
                return undefined;
              })[0]
            }).filter((v) => { return v !== undefined; } )
          })
        });

        chartData.push({
          id:'Idle',
          color:'hsl('+globalConfigs.stats.protocols.idle.color.hsl.join(',')+')',
          data:apiResults.map((d,i) => {
            const x = moment(d.timestamp*1000).format("YYYY/MM/DD HH:mm");
            const y = parseFloat(this.functionsUtil.fixTokenDecimals(d.idleRate,18));
            maxChartValue = Math.max(maxChartValue,y);
            return { x, y };
          })
        });

        /*
        const csv = {};
        chartData.forEach( protocolData => {
          protocolData.data.forEach( d => {
            if (!csv[d.x]){
              csv[d.x] = {};
            }
            csv[d.x][protocolData.id] = d.y;
          });
        });

        const csv_ordered = Object.keys(csv).sort().reduce(
          (obj, key) => { 
            obj[key] = csv[key]; 
            return obj;
          }, 
          {}
        );

        const csv_array = [];
        const csv_header = [];
        csv_header.push('Date');
        chartData.forEach( pData => csv_header.push(pData.id) );
        csv_array.push(csv_header.join(','));

        Object.keys(csv_ordered).forEach( date => {
          const csv_row = [date];
          chartData.forEach( cData => {
            if (csv_ordered[date][cData.id]){
              csv_row.push(parseFloat(csv_ordered[date][cData.id]).toFixed(4));
            } else {
              csv_row.push('0.0000');
            }
          });
          csv_array.push(csv_row.join(','));
        });

        console.log('-------DEBUG-------');
        console.log(csv_ordered);
        console.log('-------START-------');
        console.log(csv_array.join('\n'));
        console.log('-------END-------');
        */

        // Set chart type
        chartType = Line;

        gridYStep = parseFloat(maxChartValue/maxGridLines);
        gridYValues = [0];
        for (let i=1;i<=5;i++){
          gridYValues.push(i*gridYStep);
        }

        axisBottomIndex = 0;
        axisBottomMaxValues = 6;
        const chartValues = chartData[chartData.length-1].data.sort((a,b) => (moment(a.x,"YYYY/MM/DD HH:mm").isBefore(moment(b.x,"YYYY/MM/DD HH:mm")) ? -1 : 1));
        daysCount = moment(chartValues[chartValues.length-1].x,"YYYY/MM/DD HH:mm").diff(moment(chartValues[0].x,"YYYY/MM/DD HH:mm"),'days');
        daysFrequency = Math.max(1,Math.ceil(daysCount/axisBottomMaxValues));

        // console.log('APR',chartValues,chartValues[0].x,chartValues[chartValues.length-1].x,daysCount,daysFrequency);

        chartProps = {
          xScale:{
            type: 'time',
            format: '%Y/%m/%d %H:%M',
            // precision: 'hour',
          },
          xFormat:'time:%b %d %H:%M',
          yFormat:value => parseFloat(value).toFixed(2)+'%',
          yScale:{
            type: 'linear',
            stacked: false
          },
          axisLeft:{
            legend: '',
            tickSize: 0,
            orient: 'left',
            tickPadding: 10,
            tickRotation: 0,
            legendOffset: -70,
            tickValues:gridYValues,
            legendPosition: 'middle',
            format:value => parseFloat(value).toFixed(1)+'%',
          },
          axisBottom: this.props.isMobile ? null : {
            legend: '',
            tickSize: 0,
            tickPadding: 15,
            legendOffset: 0,
            orient: 'bottom',
            format: (value) => {
              if (axisBottomIndex++ % daysFrequency === 0){
                return moment(value,'YYYY/MM/DD HH:mm').format('MMM DD')
              }
            },
            tickValues: 'every day',
            legendPosition: 'middle'
          },
          gridYValues,
          pointSize:0,
          useMesh:true,
          animate:false,
          pointLabel:"y",
          curve:'linear',
          enableArea:false,
          enableSlices:'x',
          enableGridX:false,
          enableGridY:true,
          pointBorderWidth:1,
          colors:d => d.color,
          pointLabelYOffset:-12,
          legends:[
            {
              itemWidth: this.props.isMobile ? 70 : 80,
              itemHeight: 18,
              translateX: this.props.isMobile ? -35 : 0,
              translateY: this.props.isMobile ? 40 : 65,
              symbolSize: 10,
              itemsSpacing: 0,
              direction: 'row',
              anchor: 'bottom-left',
              symbolShape: 'circle',
              itemTextColor: this.props.theme.colors.legend,
              effects: [
                {
                  on: 'hover',
                  style: {
                    itemTextColor: this.props.themeMode === 'light' ? '#000' : '#fff'
                  }
                }
              ]
            }
          ],
          theme:{
            axis: {
              ticks: {
                text: {
                  fontSize: this.props.isMobile ? 12: 14,
                  fontWeight:600,
                  fill:this.props.theme.colors.legend,
                  fontFamily: this.props.theme.fonts.sansSerif
                }
              }
            },
            grid: {
              line: {
                stroke: this.props.theme.colors.lineChartStroke, strokeDasharray: '10 6'
              }
            },
            legends:{
              text:{
                fontWeight:500,
                fill:this.props.theme.colors.legend,
                textTransform:'capitalize',
                fontFamily: this.props.theme.fonts.sansSerif,
                fontSize: this.props.isMobile ? 12: 14
              }
            }
          },
          pointColor:{ from: 'color', modifiers: []},
          margin: this.props.isMobile ? { top: 20, right: 20, bottom: 40, left: 65 } : { top: 20, right: 40, bottom: 70, left: 70 },
          sliceTooltip:(slideData) => {
            const { slice } = slideData;
            const point = slice.points[0];
            return (
              <CustomTooltip
                point={point}
              >
                {
                typeof slice.points === 'object' && slice.points.length &&
                  slice.points.map(point => {
                    const protocolName = point.serieId;
                    const protocolEarning = point.data.yFormatted;
                    // const protocolApy = point.data.apy;
                    return (
                      <CustomTooltipRow
                        key={point.id}
                        color={point.color}
                        label={protocolName}
                        value={protocolEarning}
                      />
                    );
                  })
                }
              </CustomTooltip>
            );
          }
        };
      break;
      case 'SCORE':

        let prevValue = 0;
        maxChartValue = 0;

        this.props.tokenConfig.protocols.forEach((p,j) => {
          const protocolInfo = globalConfigs.stats.protocols[p.name];
          if (!protocolInfo.enabled){
            return;
          }
          if (chartData.filter(d => { return d.name === p.name; }).length){
            return;
          }
          chartData.push({
            id:protocolInfo.label,
            color:'hsl('+globalConfigs.stats.protocols[p.name].color.hsl.join(',')+')',
            data:apiResults.map((d,i) => {
              return d.protocolsData.filter((protocolAllocation,x) => {
                  return protocolAllocation.protocolAddr.toLowerCase() === p.address.toLowerCase()
              })
              .map((protocolAllocation,z) => {
                const x = moment(d.timestamp*1000).format("YYYY/MM/DD HH:mm");
                let y = parseFloat(protocolAllocation.defiScore);

                y = isNaN(y) || !y ? prevValue : y;
                prevValue = y;
                maxChartValue = Math.max(maxChartValue,y);

                return { x, y };
              })[0]
            }).filter((v) => { return v !== undefined; } )
          })
        });

        chartData.push({
          id:'Idle',
          color: 'hsl('+globalConfigs.stats.protocols.idle.color.hsl.join(',')+')',
          data: apiResults.map((d,i) => {
            const x = moment(d.timestamp*1000).format("YYYY/MM/DD HH:mm");
            let y = parseFloat(d.idleScore);
            y = isNaN(y) || !y ? prevValue : y;
            prevValue = y;
            maxChartValue = Math.max(maxChartValue,y);

            return { x, y };
          })
        });

        // debugger;

        // Set chart type
        chartType = Line;

        gridYStep = parseFloat(maxChartValue/maxGridLines);
        gridYValues = [0];
        for (let i=1;i<=5;i++){
          gridYValues.push(i*gridYStep);
        }

        axisBottomIndex = 0;
        axisBottomMaxValues = 6;
        daysCount = moment(chartData[0].data[chartData[0].data.length-1].x,"YYYY/MM/DD").diff(moment(chartData[0].data[0].x,"YYYY/MM/DD"),'days');
        daysFrequency = Math.max(1,Math.ceil(daysCount/axisBottomMaxValues));

        chartProps = {
          xScale:{
            type: 'time',
            format: '%Y/%m/%d %H:%M',
            // precision: 'hour',
          },
          xFormat:'time:%b %d %H:%M',
          yFormat:value => parseFloat(value).toFixed(1),
          yScale:{
            type: 'linear',
            stacked: false
          },
          axisLeft:{
            legend: '',
            tickSize: 0,
            orient: 'left',
            tickPadding: 10,
            tickRotation: 0,
            legendOffset: -70,
            tickValues:gridYValues,
            legendPosition: 'middle',
            format:value => parseFloat(value).toFixed(1),
          },
          axisBottom: this.props.isMobile ? null : {
            legend: '',
            tickSize: 0,
            tickPadding: 15,
            orient: 'bottom',
            legendOffset: 0,
            tickValues: 'every day',
            format: (value) => {
              if (axisBottomIndex++ % daysFrequency === 0){
                return moment(value,'YYYY/MM/DD HH:mm').format('MMM DD')
              }
            },
            legendPosition: 'middle'
          },
          gridYValues,
          pointSize:0,
          useMesh:true,
          animate:false,
          pointLabel:"y",
          curve:'linear',
          enableArea:false,
          enableSlices:'x',
          enableGridX:false,
          enableGridY:true,
          pointBorderWidth:1,
          colors:d => d.color,
          pointLabelYOffset:-12,
          legends:[
            {
              itemWidth: this.props.isMobile ? 70 : 80,
              itemHeight: 18,
              translateX: this.props.isMobile ? -35 : 0,
              translateY: this.props.isMobile ? 40 : 65,
              symbolSize: 10,
              itemsSpacing: 0,
              direction: 'row',
              anchor: 'bottom-left',
              symbolShape: 'circle',
              itemTextColor: this.props.theme.colors.legend,
              effects: [
                {
                  on: 'hover',
                  style: {
                    itemTextColor: this.props.themeMode === 'light' ? '#000' : '#fff'
                  }
                }
              ]
            }
          ],
          theme:{
            axis: {
              ticks: {
                text: {
                  fontSize: this.props.isMobile ? 12: 14,
                  fontWeight:600,
                  fill:this.props.theme.colors.legend,
                  fontFamily: this.props.theme.fonts.sansSerif
                }
              }
            },
            grid: {
              line: {
                stroke: this.props.theme.colors.lineChartStroke, strokeDasharray: '10 6'
              }
            },
            legends:{
              text:{
                fontWeight:500,
                fill:this.props.theme.colors.legend,
                textTransform:'capitalize',
                fontFamily: this.props.theme.fonts.sansSerif,
                fontSize: this.props.isMobile ? 12: 14
              }
            }
          },
          pointColor:{ from: 'color', modifiers: []},
          margin: this.props.isMobile ? { top: 20, right: 20, bottom: 40, left: 65 } : { top: 20, right: 40, bottom: 70, left: 70 },
          sliceTooltip:(slideData) => {
            const { slice } = slideData;
            const point = slice.points[0];
            return (
              <CustomTooltip
                point={point}
              >
                {
                typeof slice.points === 'object' && slice.points.length &&
                  slice.points.map(point => {
                    const protocolName = point.serieId;
                    const protocolEarning = point.data.yFormatted;
                    return (
                      <CustomTooltipRow
                        key={point.id}
                        color={point.color}
                        label={protocolName}
                        value={protocolEarning}
                      />
                    );
                  })
                }
              </CustomTooltip>
            );
          }
        };
      break;
      case 'PRICE_V4':

        itemIndex = 0;
        maxChartValue = 0;
        // let prevApy = null;
        let prevApr = null;
        let prevData = null;
        let avgApy = this.functionsUtil.BNify(0);
        let startBalance = this.functionsUtil.BNify(1);
        let currentBalance = this.functionsUtil.BNify(1);

        idleChartData = [];
        const aaveProtocolInfo = protocols.find( p => p.name === 'aavev2' );

        apiResults.forEach((d,i) => {

          let idleRate = this.functionsUtil.BNify(d.idleRate);
          let y = 0;
          let apy = 0;
          const x = moment(d.timestamp*1000).format("YYYY/MM/DD HH:mm");

          // Aave V1 wrong rate FIX
          if (this.props.selectedToken === 'WETH' && moment(x).isSameOrBefore(moment('2021-05-19 12:20','YYYY-MM-DD HH:mm'))){
            const aaveProtocolData = aaveProtocolInfo ? d.protocolsData.find((pData,x) => {
              return pData.protocolAddr.toLowerCase() === aaveProtocolInfo.address.toLowerCase()
            }) : null;
            if (aaveProtocolData.aaveAdditionalAPR && this.functionsUtil.BNify(aaveProtocolData.aaveAdditionalAPR).gt(0)){
              idleRate = idleRate.plus(this.functionsUtil.BNify(aaveProtocolData.aaveAdditionalAPR));
            }
          }

          const apr = this.functionsUtil.fixTokenDecimals(idleRate,18).div(100);
          // const apy = this.functionsUtil.apr2apy(apr);
          
          avgApy = avgApy.plus(apr.times(100));

          if (prevApr){
            const days = (d.timestamp-prevData.timestamp)/86400;
            // const totDays = (d.timestamp-apiResults[0].timestamp)/86400;

            const earnings = currentBalance.times(prevApr.times(days).div(365));
            currentBalance = currentBalance.plus(earnings);

            const earning = currentBalance.div(startBalance).minus(1).times(100);
            y = parseFloat(earning);

            // apy = earning.times(365).div(totDays).toFixed(2);
            const daysSinceBeginning = idleChartData.length>0 ? moment(d.timestamp*1000).diff(moment(idleChartData[0].x,"YYYY/MM/DD HH:mm"),'days') : 1;
            apy = parseFloat(y*365/daysSinceBeginning).toFixed(2);
          }

          prevData = d;
          // prevApy = apy;
          prevApr = apr;

          if (firstIdleBlock === null){
            firstIdleBlock = parseInt(d.blocknumber);
          }

          maxChartValue = Math.max(maxChartValue,y);

          const itemPos = Math.floor(itemIndex/totalItems*100);
          const blocknumber = d.blocknumber;

          itemIndex++;

          if (apy>0){
            idleChartData.push({ x, y, apy, blocknumber, itemPos });
          }
        });

        // Add Additional protocols
        if (versionInfo.additionalProtocols && versionInfo.additionalProtocols.length>0){
          versionInfo.additionalProtocols.forEach( additionalProtocol => {
            const protocolInfo = this.props.tokenConfig.protocols.find( p => (p.name === additionalProtocol.protocol));
            if (protocolInfo && additionalProtocol.enabledTokens.includes(this.props.selectedToken)){
              additionalProtocol.enabled = true;
              additionalProtocol.address = protocolInfo.address;
              protocols.unshift(additionalProtocol);
            }
          });
        }

        protocols.forEach( p => {

          const protocolInfo = {...globalConfigs.stats.protocols[p.name]};

          // Add custom protocol info
          if (protocolInfo.tokensProps && protocolInfo.tokensProps[this.props.selectedToken]){
            const tokenProps = protocolInfo.tokensProps[this.props.selectedToken];
            Object.keys(tokenProps).forEach(p => {
              protocolInfo[p] = tokenProps[p];
            });
          }

          if (!protocolInfo.enabled || (protocolInfo.startTimestamp && this.functionsUtil.strToMoment(protocolInfo.startTimestamp).isAfter(Date.now()))){
            return;
          }

          const rateField = protocolInfo.rateField ? protocolInfo.rateField : 'rate';

          const chartRow = {
            id:protocolInfo.label,
            color: 'hsl('+protocolInfo.color.hsl.join(',')+')',
            data: []
          };

          itemIndex = 0;
          // prevApy = null;
          prevApr = null;
          prevData = null;
          let baseProfit = 0;
          let firstProtocolData = null;
          let firstProtocolBlock = null;
          avgApy = this.functionsUtil.BNify(0);
          startBalance = this.functionsUtil.BNify(1);
          currentBalance = this.functionsUtil.BNify(1);
          const apiResults_filtered = apiResults.filter( d => (!protocolInfo.startTimestamp || moment(protocolInfo.startTimestamp).isSameOrBefore(moment(d.timestamp*1000))) );

          apiResults_filtered.forEach( (d,i) => {

            const protocolData = d.protocolsData.find((pData,x) => {
              return pData.protocolAddr.toLowerCase() === p.address.toLowerCase()
            });

            if (protocolData){

              if (!firstProtocolData){
                firstProtocolData = protocolData;
              }

              let protocolRate = typeof rateField === 'object' && rateField.length ? rateField.reduce((acc,field) => {
                if (protocolData[field]){
                  return this.functionsUtil.BNify(acc).plus(this.functionsUtil.BNify(protocolData[field]));
                }
                return this.functionsUtil.BNify(acc);
              },0) : this.functionsUtil.BNify(protocolData[rateField]);

              // Aave V1 wrong rate FIX
              if (protocolRate.lt(0) && protocolData.aaveAdditionalAPR && this.functionsUtil.BNify(protocolData.aaveAdditionalAPR).gt(0)){
                protocolRate = protocolRate.plus(this.functionsUtil.BNify(protocolData.aaveAdditionalAPR));
              }

              const protocolPaused = protocolRate.eq(0);
              if (!protocolPaused){

                let rowData = {};

                let y = 0;
                let apy = 0;
                const x = moment(d.timestamp*1000).format("YYYY/MM/DD HH:mm");
                const apr = this.functionsUtil.fixTokenDecimals(protocolRate,18).div(100);

                avgApy = avgApy.plus(apr.times(100));
                // const apy = this.functionsUtil.apr2apy(apr);

                // Start new protocols from Idle performances
                if (firstProtocolBlock === null) {
                  firstProtocolBlock = parseInt(d.blocknumber);
                  if (firstProtocolBlock>firstIdleBlock){
                    const idlePerformance = idleChartData.find(d1 => (d1.blocknumber>=firstProtocolBlock) );
                    if (idlePerformance){
                      baseProfit = idlePerformance.y;
                      y = baseProfit;
                      apy = avgApy.toFixed(2);
                    }
                  }
                }

                itemIndex++;

                if (prevData) {
                  const days = (d.timestamp-prevData.timestamp)/86400;
                  // const totDays = (d.timestamp-apiResults[0].timestamp)/86400;

                  const earnings = currentBalance.times(prevApr.times(days).div(365));
                  currentBalance = currentBalance.plus(earnings);

                  const earning = currentBalance.div(startBalance).minus(1).times(100);
                  y = parseFloat(earning)+baseProfit;

                  const daysSinceBeginning = Math.max(1,moment(d.timestamp*1000).diff(moment(idleChartData[0].x,"YYYY/MM/DD HH:mm"),'days'));
                  apy = parseFloat(y*365/daysSinceBeginning).toFixed(2);
                  // debugger;

                  // apy = avgApy.div(itemIndex+1).toFixed(2);
                  const itemPos = Math.floor(itemIndex/totalItems*100);
                  rowData = {
                    x,
                    y,
                    apy,
                    itemPos
                  };

                  itemIndex++;
                  chartRow.data.push(rowData);
                }

                prevData = d;
                prevApr = apr;

                if (firstIdleBlock === null){
                  firstIdleBlock = parseInt(d.blocknumber);
                }

                maxChartValue = Math.max(maxChartValue,y);

                // const blocknumber = d.blocknumber;

              }
            }
          });

          chartData.push(chartRow);
        });

        gridYStep = parseFloat(maxChartValue/maxGridLines);
        gridYValues = [0];
        for (let i=1;i<=5;i++){
          gridYValues.push(i*gridYStep);
        }

        chartData.push({
          id:'Idle',
          data: idleChartData,
          color: 'hsl('+globalConfigs.stats.protocols.idle.color.hsl.join(',')+')'
        });

        // Set chart type
        chartType = Line;

        axisBottomIndex = 0;
        axisBottomMaxValues = 12;
        daysCount = moment(idleChartData[idleChartData.length-1].x,"YYYY/MM/DD HH:mm").diff(moment(idleChartData[0].x,"YYYY/MM/DD HH:mm"),'days');
        daysFrequency = Math.max(1,Math.ceil(daysCount/axisBottomMaxValues));

        chartProps = {
          xScale:{
            type: 'time',
            format: '%Y/%m/%d %H:%M',
            // precision: 'day',
          },
          xFormat:'time:%b %d %H:%M',
          yFormat:value => parseFloat(value).toFixed(3)+'%',
          yScale:{
            type: 'linear',
            stacked: false,
            // min: 1
          },
          axisLeft:{
            legend: '',
            tickSize: 0,
            orient: 'left',
            tickPadding: 10,
            tickRotation: 0,
            legendOffset: -70,
            tickValues:gridYValues,
            legendPosition: 'middle',
            format: value => parseFloat(value).toFixed(2)+'%',
          },
          axisBottom: this.props.isMobile ? null : {
            legend: '',
            tickSize: 0,
            format: (value) => {
              if (axisBottomIndex++ % daysFrequency === 0){
                return moment(value,'YYYY/MM/DD HH:mm').format('MMM DD')
              }
            },
            tickPadding: 10,
            legendOffset: 0,
            orient: 'bottom',
            tickValues:`every day`,
            legendPosition: 'middle',
          },
          gridYValues,
          pointSize:0,
          useMesh:true,
          animate:false,
          pointLabel:"y",
          curve:'monotoneX',
          enableArea:false,
          enableSlices:'x',
          enableGridX:false,
          enableGridY:true,
          pointBorderWidth:1,
          colors:d => d.color,
          pointLabelYOffset:-12,
          legends:[
            {
              itemHeight: 18,
              symbolSize: 10,
              itemsSpacing: 5,
              direction: 'row',
              anchor: 'bottom-left',
              symbolShape: 'circle',
              itemTextColor: this.props.theme.colors.legend,
              itemWidth: this.props.isMobile ? 70 : 160,
              translateX: this.props.isMobile ? -35 : 0,
              translateY: this.props.isMobile ? 40 : 65,
              effects: [
                {
                  on: 'hover',
                  style: {
                    itemTextColor: this.props.themeMode === 'light' ? '#000' : '#fff'
                  }
                }
              ]
            }
          ],
          theme:{
            axis: {
              ticks: {
                text: {
                  fontSize: this.props.isMobile ? 12: 14,
                  fontWeight:600,
                  fill:this.props.theme.colors.legend,
                  fontFamily: this.props.theme.fonts.sansSerif
                }
              }
            },
            grid: {
              line: {
                stroke: this.props.theme.colors.lineChartStroke, strokeDasharray: '10 6'
              }
            },
            legends:{
              text:{
                fontSize: this.props.isMobile ? 12: 14,
                fill:this.props.theme.colors.legend,
                fontWeight:500,
                fontFamily: this.props.theme.fonts.sansSerif
              }
            }
          },
          pointColor:{ from: 'color', modifiers: []},
          margin: this.props.isMobile ? { top: 20, right: 20, bottom: 40, left: 65 } : { top: 20, right: 40, bottom: 80, left: 80 },
          sliceTooltip:(slideData) => {
            const { slice } = slideData;
            const point = slice.points[0];
            return (
              <CustomTooltip
                point={point}
              >
                {
                typeof slice.points === 'object' && slice.points.length &&
                  slice.points.map(point => {
                    const protocolName = point.serieId;
                    const protocolEarning = point.data.yFormatted;
                    const protocolApy = point.data.apy;
                    return (
                      <CustomTooltipRow
                        key={point.id}
                        label={protocolName}
                        color={point.color}
                        value={`${protocolEarning} <small>(${protocolApy}% APY)</small>`}
                      />
                    );
                  })
                }
              </CustomTooltip>
            );
          }
        };
      break;
      case 'PRICE':
        // let prevTokenPrice = null;
        maxChartValue = 0;
        let firstTokenPrice = null;

        idleChartData = apiResults.map((d,i) => {

          let y = 0;
          let apy = 0;
          let days = 0;
          const x = moment(d.timestamp*1000).format("YYYY/MM/DD HH:mm");
          const tokenPrice = this.functionsUtil.fixTokenDecimals(d.idlePrice,this.props.tokenConfig.decimals);

          if (!firstTokenPrice){
            firstTokenPrice = tokenPrice;
          } else {
            y = parseFloat(tokenPrice.div(firstTokenPrice).minus(1).times(100));

            days = (d.timestamp-apiResults[0].timestamp)/86400;
            const earning = tokenPrice.div(firstTokenPrice).minus(1).times(100);
            apy = earning.times(365).div(days).toFixed(2);

            // console.log(firstTokenPrice.toString(),tokenPrice.toString(),earning.toString(),days,y,apy);
          }

          if (firstIdleBlock === null){
            firstIdleBlock = parseInt(d.blocknumber);
          }

          maxChartValue = Math.max(maxChartValue,y);

          const itemPos = Math.floor(itemIndex/totalItems*100);
          const blocknumber = d.blocknumber;

          itemIndex++;

          return { x, y, apy, blocknumber, itemPos };
        });

        // Add Additional protocols
        if (versionInfo.additionalProtocols && versionInfo.additionalProtocols.length>0){
          versionInfo.additionalProtocols.forEach( additionalProtocol => {
            const protocolInfo = this.props.tokenConfig.protocols.find( p => (p.name === additionalProtocol.protocol));
            if (protocolInfo && additionalProtocol.enabledTokens.includes(this.props.selectedToken)){
              additionalProtocol.enabled = true;
              additionalProtocol.address = protocolInfo.address;
              protocols.unshift(additionalProtocol);
            }
          });
        }

        await this.functionsUtil.asyncForEach(protocols,async (p) => {

          const protocolInfo = globalConfigs.stats.protocols[p.name];

          if (!protocolInfo.enabled){
            return;
          }

          const rateField = protocolInfo.rateField ? protocolInfo.rateField : 'rate';

          const chartRow = {
            id:protocolInfo.label,
            color: 'hsl('+protocolInfo.color.hsl.join(',')+')',
            data: []
          };

          itemIndex = 0;
          let baseProfit = 0;
          firstTokenPrice = null;
          let lastRowData = null;
          let lastTokenPrice = null;
          let firstProtocolData = null;
          let firstProtocolBlock = null;

          await this.functionsUtil.asyncForEach(apiResults,async (d) => {

            const protocolData = d.protocolsData.find((pData,x) => {
              return pData.protocolAddr.toLowerCase() === p.address.toLowerCase()
            });

            if (protocolData && protocolData[rateField]){

              if (!firstProtocolData){
                firstProtocolData = protocolData;
              }

              const protocolPaused = this.functionsUtil.BNify(protocolData[rateField]).eq(0);
              if (!protocolPaused){

                // Start new protocols from Idle performances
                if (firstProtocolBlock === null){
                  firstProtocolBlock = parseInt(d.blocknumber);
                  if (firstProtocolBlock>firstIdleBlock){
                    const idlePerformance = idleChartData.find(d1 => {
                      return d1.blocknumber>=firstProtocolBlock;
                    });
                    if (idlePerformance){
                      baseProfit = idlePerformance.y;
                    }
                  }
                }

                let rowData = {};
                let tokenExchangeRate = protocolData.price;
                let tokenPriceFixed = this.functionsUtil.fixTokenDecimals(tokenExchangeRate,p.decimals);
                const x = moment(d.timestamp*1000).format("YYYY/MM/DD HH:mm");

                // Take data from
                if (protocolInfo && protocolInfo.data && protocolInfo.data[p.address.toLowerCase()] && protocolInfo.data[p.address.toLowerCase()][d.blocknumber]){
                  tokenExchangeRate = this.functionsUtil.BNify(globalConfigs.stats.protocols[p.name].data[p.address.toLowerCase()][d.blocknumber]);
                  tokenPriceFixed = this.functionsUtil.fixTokenDecimals(tokenExchangeRate,p.decimals);
                }/* else if (p.name === 'aave'){
                  // Token holders (aDAI = 0xc025c03e10f656d3ee76685d53d236824d8ef3da , aUSDC = 0xd2c734fbd8f5d1c809185e014016dd4097e94711)
                  let aaveTokenBalance = await this.functionsUtil.genericContractCall(p.token,'balanceOf',['0xd2c734fbd8f5d1c809185e014016dd4097e94711'],{},d.blocknumber);
                  if (aaveTokenBalance){
                    if (!Object.values(aave_data).length){
                      tokenExchangeRate = this.functionsUtil.normalizeTokenAmount(1,p.decimals);
                      aave_data[d.blocknumber] = aaveTokenBalance.toString();
                    } else {
                      const firstBalance = Object.values(aave_data)[0];
                      tokenExchangeRate = this.functionsUtil.normalizeTokenAmount(this.functionsUtil.BNify(aaveTokenBalance).div(this.functionsUtil.BNify(firstBalance)).toFixed(p.decimals),p.decimals);
                      aave_data[d.blocknumber] = tokenExchangeRate.toString();
                    }
                  }
                }
                */

                let y = baseProfit;
                let apy = 0;

                if (!firstTokenPrice){
                  firstTokenPrice = tokenPriceFixed;
                } else {
                  if (tokenPriceFixed.lt(lastTokenPrice)){
                    firstTokenPrice = tokenPriceFixed;
                    const lastYDiff = chartRow.data[chartRow.data.length-1].y-chartRow.data[chartRow.data.length-2].y;
                    y = lastRowData.y+lastYDiff;
                    baseProfit = y;
                  } else {
                    y += parseFloat(tokenPriceFixed.div(firstTokenPrice).minus(1).times(100));
                  }

                  const days = (d.timestamp-apiResults[0].timestamp)/86400;
                  const earning = tokenPriceFixed.div(firstTokenPrice).minus(1).times(100);
                  apy = earning.times(365).div(days).toFixed(2);
                }

                y = Math.max(0,y);
                maxChartValue = Math.max(maxChartValue,y);

                const itemPos = Math.floor(itemIndex/totalItems*100);

                rowData = {
                  x,
                  y,
                  apy,
                  itemPos
                };

                itemIndex++;
                lastRowData = rowData;
                chartRow.data.push(rowData);
                lastTokenPrice = tokenPriceFixed;
              }
            }
          });

          chartData.push(chartRow);
        });

        gridYStep = parseFloat(maxChartValue/maxGridLines);
        gridYValues = [0];
        for (let i=1;i<=5;i++){
          gridYValues.push(i*gridYStep);
        }

        chartData.push({
          id:'Idle',
          color: 'hsl('+globalConfigs.stats.protocols.idle.color.hsl.join(',')+')',
          data: idleChartData
        });

        // Set chart type
        chartType = Line;

        chartProps = {
          xScale:{
            type: 'time',
            format: '%Y/%m/%d %H:%M',
            // precision: 'day',
          },
          xFormat:'time:%b %d %H:%M',
          yFormat:value => parseFloat(value).toFixed(3)+'%',
          yScale:{
            type: 'linear',
            stacked: false,
            // min: 1
          },
          axisLeft:{
            legend: '',
            tickSize: 0,
            orient: 'left',
            tickPadding: 10,
            tickRotation: 0,
            legendOffset: -70,
            tickValues:gridYValues,
            legendPosition: 'middle',
            format: value => parseFloat(value).toFixed(2)+'%',
          },
          axisBottom: this.props.isMobile ? null : {
            legend: '',
            tickSize: 0,
            format: '%b %d',
            tickPadding: 10,
            legendOffset: 0,
            orient: 'bottom',
            legendPosition: 'middle',
            tickValues: this.props.isMobile ? 'every 4 days' : ( this.props.showAdvanced ? 'every 3 days' : 'every 2 days'),
          },
          gridYValues,
          pointSize:0,
          useMesh:true,
          animate:false,
          pointLabel:"y",
          curve:'monotoneX',
          enableArea:false,
          enableSlices:'x',
          enableGridX:false,
          enableGridY:true,
          pointBorderWidth:1,
          colors:d => d.color,
          pointLabelYOffset:-12,
          legends:[
            {
              itemHeight: 18,
              itemWidth: this.props.isMobile ? 70 : 100,
              translateX: this.props.isMobile ? -35 : 0,
              translateY: this.props.isMobile ? 40 : 65,
              symbolSize: 10,
              itemsSpacing: 5,
              direction: 'row',
              anchor: 'bottom-left',
              symbolShape: 'circle',
              itemTextColor: this.props.theme.colors.legend,
              effects: [
                {
                  on: 'hover',
                  style: {
                    itemTextColor: this.props.themeMode === 'light' ? '#000' : '#fff'
                  }
                }
              ]
            }
          ],
          theme:{
            axis: {
              ticks: {
                text: {
                  fontSize: this.props.isMobile ? 12: 14,
                  fontWeight:600,
                  fill:this.props.theme.colors.legend,
                  fontFamily: this.props.theme.fonts.sansSerif
                }
              }
            },
            grid: {
              line: {
                stroke: this.props.theme.colors.lineChartStroke, strokeDasharray: '10 6'
              }
            },
            legends:{
              text:{
                fontWeight:500,
                fill:this.props.theme.colors.legend,
                textTransform:'capitalize',
                fontFamily: this.props.theme.fonts.sansSerif,
                fontSize: this.props.isMobile ? 12: 14
              }
            }
          },
          pointColor:{ from: 'color', modifiers: []},
          margin: this.props.isMobile ? { top: 20, right: 20, bottom: 40, left: 65 } : { top: 20, right: 40, bottom: 80, left: 80 },
          sliceTooltip:(slideData) => {
            const { slice } = slideData;
            const point = slice.points[0];
            return (
              <CustomTooltip
                point={point}
              >
                {
                typeof slice.points === 'object' && slice.points.length &&
                  slice.points.map(point => {
                    const protocolName = point.serieId;
                    const protocolEarning = point.data.yFormatted;
                    const protocolApy = point.data.apy;
                    return (
                      <CustomTooltipRow
                        key={point.id}
                        label={protocolName}
                        color={point.color}
                        value={`${protocolEarning} <small>(${protocolApy}% APY)</small>`}
                      />
                    );
                  })
                }
              </CustomTooltip>
            );
          }
        };
      break;
      default:
      break;
    }

    this.setState({
      chartType,
      chartProps,
      chartData
    });
  }

  render() {
    return(
      <GenericChart
        showLoader={true}
        {...this.state.chartProps}
        height={this.props.height}
        type={this.state.chartType}
        data={this.state.chartData}
        width={this.state.chartWidth}
        isMobile={this.props.isMobile}
        parentId={this.props.parentId}
        parentIdHeight={this.props.parentIdHeight}
      />
    );
  }
}

export default StatsChart;