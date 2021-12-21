import { Pie } from '@nivo/pie';
import React, { Component } from 'react';
import { Flex, Text, Image } from "rimble-ui";
import SmartNumber from '../SmartNumber/SmartNumber';
import FunctionsUtil from '../utilities/FunctionsUtil';
import GenericChart from '../GenericChart/GenericChart';

class GenericPieChart extends Component {
  state = {
    chartProps:null,
    selectedSlice:null,
  };

  // Utils
  functionsUtil = null;
  componentUnmounted = false;

  loadUtils(){
    if (this.functionsUtil){
      this.functionsUtil.setProps(this.props);
    } else {
      this.functionsUtil = new FunctionsUtil(this.props);
    }
  }

  async componentWillMount(){
    this.loadUtils();
  }

  componentWillUnmount(){
    this.componentUnmounted = true;
  }

  async componentDidMount(){
    this.loadData();
  }

  async componentDidUpdate(prevProps,prevState){
    this.loadUtils();

    const mobileChanged = prevProps.isMobile !== this.props.isMobile;
    if (mobileChanged){
      this.setStateSafe({
        chartProps:null,
        selectedSlice:null,
      },() => {
        this.loadData();
      });
    }
  }

  async setStateSafe(newState,callback=null) {
    if (!this.componentUnmounted){
      return this.setState(newState,callback);
    }
    return null;
  }

  async loadData(){

    const chartProps = {
      padAngle:0,
      animate:true,
      borderWidth: 0,
      cornerRadius:0,
      motionDamping:15,
      innerRadius: 0.65,
      motionStiffness:90,
      colors:d => d.color,
      onMouseEnter:(data, e) => {
        this.setStateSafe({
          selectedSlice:data
        });
      },
      onMouseLeave:(data, e) => {
        this.setStateSafe({
          selectedSlice:null
        });
      },
      tooltipFormat: this.props.tooltipFormat ? this.props.tooltipFormat : (v => v),
      sliceLabel: this.props.sliceLabel,// ? this.props.sliceLabel : (d => d.value),
      radialLabel: d => {
        return null;
      },
      theme:{
        tooltip: {
          container: this.props.inline ? {
            background: this.props.theme.colors.cardBg
          } : {
            display: 'none',
          }
        },
        labels:{
          text:{
            fontWeight:600,
            fontSize:this.props.isMobile ? 13 : 15,
            fontFamily: this.props.theme.fonts.sansSerif
          }
        },
        legends:{
          text:{
            fontSize:13,
            fontWeight:500,
            fontFamily: this.props.theme.fonts.sansSerif
          }
        }
      },
      slicesLabelsSkipAngle:5,
      radialLabelsSkipAngle:10,
      enableRadialLabels:false,
      radialLabelsTextXOffset:0,
      slicesLabelsTextColor:'#fff',
      radialLabelsTextColor:'#333',
      radialLabelsLinkStrokeWidth:0,
      radialLabelsLinkDiagonalLength:0,
      radialLabelsLinkHorizontalLength:0,
      enableSlicesLabels: !this.props.inline,
      radialLabelsLinkColor:{ from: 'color' },
      margin: this.props.margin || {top:0,right:0,bottom:0,left:0},
      borderColor:{ from: 'color', modifiers: [ [ 'darker', 0.2 ] ] },
    };

    if (this.props.showLegend){
      chartProps.legends = [
        {
          itemWidth: 60,
          itemHeight: 18,
          translateY: this.props.isMobile ? 25 : 50,
          symbolSize: 10,
          anchor: 'bottom',
          direction: 'row',
          itemTextColor: this.props.theme.colors.legend,
          symbolShape: 'circle',
          effects: [
            {
              on: 'hover',
              style: {
                itemTextColor: '#000'
              }
            }
          ]
        }
      ];
    }

    this.setStateSafe({
      chartProps
    });
  }

  render() {

    return (
      <Flex
        width={1}
        position={'relative'}
        alignItems={'center'}
        justifyContent={'center'}
      >
        {
          this.state.chartProps && !this.props.inline &&
            <Flex
              zIndex={0}
              top={['23%','25%']}
              left={['20%','27%']}
              textAlign={'center'}
              alignItems={'center'}
              position={'absolute'}
              width={['60%','46%']}
              height={['53%','46%']}
              flexDirection={'column'}
              justifyContent={'center'}
            >
              {
                this.state.selectedSlice ? (
                  <Flex
                    width={1}
                    alignItems={'center'}
                    flexDirection={'column'}
                    justifyContent={'center'}
                  >
                    <Image
                      mb={1}
                      width={['1.8em','2em']}
                      height={['1.8em','2em']}
                      src={this.state.selectedSlice.image}
                    />
                    <SmartNumber
                      decimals={3}
                      fontWeight={4}
                      fontSize={[3,4]}
                      maxPrecision={5}
                      number={this.state.selectedSlice.valueHover || this.state.selectedSlice.value}
                      {...this.state.selectedSlice.valueHoverProps}
                    />
                    <Text
                      fontSize={[1,2]}
                      fontWeight={3}
                      color={'cellTitle'}
                    >
                      {this.state.selectedSlice.label}
                    </Text>
                  </Flex>
                ) : (
                  <Flex
                    width={1}
                    alignItems={'center'}
                    flexDirection={'column'}
                    justifyContent={'center'}
                  >
                    <Image
                      mb={1}
                      height={'2.2em'}
                      src={this.props.defaultImage}
                    />
                    <Text
                      fontSize={[3,4]}
                      fontWeight={[3,4]}
                    >
                      {this.props.defaultValue}
                    </Text>
                    <Text
                      fontWeight={3}
                      fontSize={[1,2]}
                      color={'cellTitle'}
                    >
                      {this.props.defaultLabel}
                    </Text>
                  </Flex>
                )
              }
            </Flex>
        }
        <GenericChart
          type={Pie}
          showLoader={true}
          {...this.props}
          {...this.state.chartProps}
          data={this.props.chartData}
        />
      </Flex>
    );
  }
}

export default GenericPieChart;