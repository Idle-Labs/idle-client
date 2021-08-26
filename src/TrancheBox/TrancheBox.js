import React, { Component } from 'react';
import { Flex, Icon, Text, Button } from "rimble-ui";
import FunctionsUtil from '../utilities/FunctionsUtil';
import TrancheField from '../TrancheField/TrancheField';
import DashboardCard from '../DashboardCard/DashboardCard';

class Base extends Component {

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
  }

  async componentDidUpdate(prevProps,prevState){
    this.loadUtils();
  }

  render() {
    const trancheDetails = this.props.trancheDetails;
    const strategyInfo = this.functionsUtil.getGlobalConfig(['strategies','tranches']);
    const tokenConfig = this.props.tokenConfig || this.props.availableTranches[strategyInfo.protocol][strategyInfo.token];
    return (
      <DashboardCard
        cardProps={{
          py:3,
          px:3,
          border:null,
          style:{
            // border:`1px solid ${trancheDetails.color.hex}`
          }
        }}
      >
        <Flex
          pb={2}
          mb={3}
          width={1}
          alignItems={'center'}
          flexDirection={'row'}
          justifyContent={'space-between'}
          borderBottom={`1px solid ${this.props.theme.colors.divider}`}
        >
          <Flex
            alignItems={'center'}
            flexDirection={'row'}
          >
            <Icon
              mr={2}
              size={'2.2em'}
              name={trancheDetails.icon}
              color={trancheDetails.color.hex}
            />
            <Text
              fontWeight={4}
              fontSize={[3,6]}
              color={trancheDetails.color.hex}
            >
              {trancheDetails.name}
            </Text>
          </Flex>
          <Flex
            alignItems={'flex-end'}
            flexDirection={'column'}
          >
            <TrancheField
              fieldInfo={{
                name:`${trancheDetails.baseName}Apy`,
                showTooltip:false,
                props:{
                  decimals:2,
                  fontWeight:4,
                  fontSize:[3,6],
                  textAlign:'center',
                  flexProps:{
                    justifyContent:'center'
                  },
                  color:this.props.trancheDetails.color.hex
                },
              }}
              {...this.props}
              tokenConfig={tokenConfig}
              token={strategyInfo.token}
              tranche={strategyInfo.tranche}
              protocol={strategyInfo.protocol}
            />
            {
              /*
              <TrancheField
                fieldInfo={{
                  showLoader:false,
                  name:'trancheIDLEDistribution',
                  props:{
                    decimals:2,
                    fontWeight:2,
                    fontSize:[0,1],
                    color:'cellText',
                    textAlign:'center',
                    flexProps:{
                      justifyContent:'center'
                    }
                  },
                }}
                {...this.props}
                tokenConfig={tokenConfig}
                token={strategyInfo.token}
                trancheConfig={tokenConfig.AA}
                tranche={strategyInfo.tranche}
                protocol={strategyInfo.protocol}
              />
              */
            }
          </Flex>
        </Flex>
        <Flex
          width={1}
          flexDirection={'column'}
        >
          <Text
            mb={3}
            fontWeight={3}
            color={'copyColor'}
          >
            {trancheDetails.description.long}
          </Text>
          <Flex
            width={1}
            my={3}
            flexDirection={'column'}
          >
            {
              trancheDetails.features.map( (feature,index) => (
                <Flex
                  mb={2}
                  width={1}
                  alignItems={'center'}
                  flexDirection={'row'}
                  key={`feature_${index}`}
                >
                  <Icon
                    mr={2}
                    name={'Done'}
                    color={trancheDetails.color.hex}
                  />
                  <Text
                    fontSize={3}
                    fontWeight={3}
                    color={trancheDetails.color.hex}
                  >
                    {feature}
                  </Text>
                </Flex>
              ))
            }
          </Flex>
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
        </Flex>
      </DashboardCard>
    );
  }
}

export default Base;
