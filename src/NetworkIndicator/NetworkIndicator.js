import React, { Component } from 'react';
import FunctionsUtil from '../utilities/FunctionsUtil';
import DashboardCard from '../DashboardCard/DashboardCard';
import { Flex, Text, Image, Box, Loader } from "rimble-ui";
import GenericSelector from '../GenericSelector/GenericSelector';

class NetworkIndicator extends Component {

  state = {
    activeNetworks:[],
    defaultNetwork:null
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
    this.loadNetworks();
  }

  loadNetworks(){

    if (!this.props.networkInitialized){
      return false;
    }

    const availableNetworks = this.functionsUtil.getGlobalConfig(['network','availableNetworks']);
    const enabledNetworks = this.functionsUtil.getGlobalConfig(['network','enabledNetworks']);
    const activeNetworks = enabledNetworks.map( networkId => {
      const networkConfig = availableNetworks[networkId];
      return {
        value:networkId,
        config:networkConfig,
        label:networkConfig.name,
      }
    });

    const requiredNetwork = this.functionsUtil.getRequiredNetwork();
    const defaultNetwork = activeNetworks.find( network => network.value === requiredNetwork.id );

    this.setState({
      defaultNetwork,
      activeNetworks
    });
  }

  selectNetwork(networkId){
    this.props.setRequiredNetwork(networkId);
  }

  async componentDidUpdate(prevProps,prevState){
    this.loadUtils();

    const networkInitialized = !prevProps.networkInitialized && this.props.networkInitialized;
    const requiredNetworkChanged = JSON.stringify(prevProps.network.required) !== JSON.stringify(this.props.network.required);
    if (requiredNetworkChanged || networkInitialized){
      this.loadNetworks();
    }
  }

  render() {

    const CustomOptionValue = props => {
      const imageSrc = `images/networks/${props.data.config.provider}.svg`;
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
            <Image
              mr={2}
              src={imageSrc}
              width={'1.3em'}
              height={'1.3em'}
            />
            <Text
              fontSize={[1,2]}
              fontWeight={500}
              color={'copyColor'}
            >
              {props.label}
            </Text>
          </Flex>
        </Flex>
      );
    }

    const CustomValueContainer = props => {
      const selectProps = props.selectProps.value || props.data;
      const label = selectProps.label;
      const imageSrc = `images/networks/${selectProps.config.provider}.svg`;
      return (
        <Flex
          style={{
            flex:'1'
          }}
          justifyContent={'space-between'}
          {...props.innerProps}
          px={0}
        >
          <Flex
            {...props.innerProps}
            p={0}
            width={1}
            alignItems={'center'}
            flexDirection={'row'}
            style={{cursor:'pointer'}}
            justifyContent={'flex-start'}
          >
            <Image
              mr={2}
              src={imageSrc}
              width={'1.3em'}
              height={'1.3em'}
            />
            <Text
              fontSize={[1,2]}
              fontWeight={500}
              color={'copyColor'}
            >
              {label}
            </Text>
            <Box
              ml={2}
              width={'8px'}
              height={'8px'}
              borderRadius={'50%'}
              backgroundColor={this.props.network.isCorrectNetwork ? '#00b84a' : '#fa0000'}
            >
            </Box>
          </Flex>
        </Flex>
      );
    }

    return this.state.defaultNetwork ? (
      <GenericSelector
        {...this.props}
        name={'network'}
        isSearchable={false}
        innerProps={Object.assign({
          px:1,
          py:0,
          height:['38px','42px']
        },this.props.innerProps)}
        customOptionProps={{
          px:0,
          pl:3,
          pr:0
        }}
        options={this.state.activeNetworks}
        CustomOptionValue={CustomOptionValue}
        defaultValue={this.state.defaultNetwork}
        onChange={this.selectNetwork.bind(this)}
        CustomValueContainer={CustomValueContainer}
      />
    ) : (
      <DashboardCard
        {...this.props}
        cardProps={{
          px:[2,3],
          display:'flex',
          width:[1,'auto'],
          alignItems:'center',
          justifyContent:'center',
          height:this.props.innerProps.height || ['38px','42px'],
        }}
        isInteractive={false}
      >
        <Loader size={'20px'} />
      </DashboardCard>
    );
  }
}

export default NetworkIndicator;