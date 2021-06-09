import React, { Component } from 'react';
import { Flex, Text, Image } from "rimble-ui";
import FunctionsUtil from '../utilities/FunctionsUtil';
import DashboardCard from '../DashboardCard/DashboardCard';

class NetworkIndicator extends Component {

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

    const networkConfig = this.functionsUtil.getCurrentNetwork();

    return (
      <DashboardCard
        {...this.props}
        isActive={true}
        cardProps={{
          px:[1,2],
          display:'flex',
          width:[1,'auto']
        }}
        isInteractive={false}
      >
        <Flex
          py={0}
          px={1}
          width={1}
          alignItems={'center'}
          flexDirection={'row'}
          height={['38px','42px']}
          justifyContent={['center','flex-start']}
        >
          {
            /*
            <Box
              mr={2}
              width={'9px'}
              height={'9px'}
              borderRadius={'50%'}
              backgroundColor={this.props.network.isCorrectNetwork ? '#00b84a' : '#fa0000'}
            >
            </Box>
            */
          }
          <Image
            mr={2}
            width={'1.2em'}
            height={'1.2em'}
            display={'inline-flex'}
            alt={networkConfig.provider}
            src={`images/networks/${networkConfig.provider}.svg`}
          />
          <Text
            fontWeight={3}
            fontSize={[0,1]}
            color={'copyColor'}
          >
            {this.functionsUtil.capitalize(this.props.network.current.name)}
          </Text>
        </Flex>
      </DashboardCard>
    );
  }
}

export default NetworkIndicator;