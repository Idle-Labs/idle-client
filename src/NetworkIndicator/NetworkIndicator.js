import React, { Component } from 'react';
import FunctionsUtil from '../utilities/FunctionsUtil';
import DashboardCard from '../DashboardCard/DashboardCard';
import { Flex, Text, Image, Box, Loader } from "rimble-ui";
import GenericSelector from '../GenericSelector/GenericSelector';

class NetworkIndicator extends Component {

  state = {
    activeNetworks: [],
    defaultNetwork: null
  };

  // Utils
  functionsUtil = null;

  loadUtils() {
    if (this.functionsUtil) {
      this.functionsUtil.setProps(this.props);
    } else {
      this.functionsUtil = new FunctionsUtil(this.props);
    }
  }

  async componentWillMount() {
    this.loadUtils();
    this.loadNetworks();
  }

  loadNetworks() {

    if (!this.props.networkInitialized) {
      return false;
    }

    const availableNetworks = this.functionsUtil.getGlobalConfig(['network', 'availableNetworks']);
    const enabledNetworks = this.functionsUtil.getGlobalConfig(['network', 'enabledNetworks']);
    const activeNetworks = enabledNetworks.map(networkId => {
      const networkConfig = availableNetworks[networkId];
      return {
        value: networkId,
        config: networkConfig,
        label: networkConfig.name,
        network: networkConfig.name.toLowerCase(),
      }
    });

    const requiredNetwork = this.functionsUtil.getRequiredNetwork();
    const defaultNetwork = activeNetworks.find(network => network.value === requiredNetwork.id);

    this.setState({
      defaultNetwork,
      activeNetworks
    });
  }

  selectNetwork(networkId) {
    this.props.setRequiredNetwork(networkId);
  }

  async componentDidUpdate(prevProps, prevState) {
    this.loadUtils();

    const networkInitialized = !prevProps.networkInitialized && this.props.networkInitialized;
    const requiredNetworkChanged = JSON.stringify(prevProps.network.required) !== JSON.stringify(this.props.network.required);
    if (requiredNetworkChanged || networkInitialized) {
      this.setState({
        defaultNetwork: null
      }, () => {
        this.loadNetworks();
      });
    }
  }

  render() {

    const CustomOptionValue = props => {
      const imageSrc = `images/networks/${props.data.network}.svg`;
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
            <Flex
              mr={2}
              width={'30px'}
              height={'30px'}
              borderRadius={'50%'}
              alignItems={'center'}
              justifyContent={'center'}
              backgroundColor={'primary'}
            >
              <Image
                src={imageSrc}
                width={['1.2em','1.3em']}
                height={['1.2em','1.3em']}
              />
            </Flex>
            <Text
              fontWeight={3}
              fontSize={[1,2]}
              color={'primary'}
              fontFamily={'ctas'}
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
      const imageSrc = `images/networks/${selectProps.network}.svg`;
      return (
        <Flex
          {...props.innerProps}
          px={0}
          style={{
            flex: '1'
          }}
          backgroundColor={'transparent'}
          justifyContent={'space-between'}
        >
          <Flex
            {...props.innerxProps}
            p={0}
            width={1}
            alignItems={'center'}
            flexDirection={'row'}
            style={{ cursor: 'pointer' }}
            justifyContent={'flex-start'}
          >
            <Image
              mr={2}
              src={imageSrc}
              width={['1.2em','1.3em']}
              height={['1.2em','1.3em']}
            />
            <Text
              fontWeight={3}
              fontSize={[1,2]}
              color={'primary'}
              fontFamily={'ctas'}
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
        innerProps={Object.assign({
          px: 1,
          py: 0,
          border: 0,
          boxShadow: 0,
          height: '42px',
          borderRadius: 0,
          backgroundColor: 'transparent'
        }, this.props.innerProps)}
        customOptionProps={{
          px: 0,
          pl: 3,
          pr: 0
        }}
        noShadow={"true"}
        isDashboard={false}
        isSearchable={false}
        notInteractive={"true"}
        options={this.state.activeNetworks}
        CustomOptionValue={CustomOptionValue}
        onChange={this.selectNetwork.bind(this)}
        defaultValue={this.state.defaultNetwork}
        CustomValueContainer={CustomValueContainer}
      />
    ) : (
        <DashboardCard
          {...this.props}
          isActive={false}
          isInteractive={false}
          cardProps={{
            border: 0,
            px: [2, 3],
            boxShadow: 0,
            display:'flex',
            borderRadius: 0,
            width: [1, 'auto'],
            alignItems: 'center',
            justifyContent: 'center',
            backgroundColor: 'transparent',
            height: (this.props.innerProps && this.props.innerProps.height) || '42px',
          }}
        >
          <Loader size={'20px'} />
        </DashboardCard>
      );
  }
}

export default NetworkIndicator;