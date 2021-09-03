import Title from '../Title/Title';
import React, { Component } from 'react';
import { Box, Flex, Text } from "rimble-ui";
import TrancheBox from '../TrancheBox/TrancheBox';
import FunctionsUtil from '../utilities/FunctionsUtil';

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
    const tranchesDetails = this.functionsUtil.getGlobalConfig(['tranches']);
    return (
      <Box
        mb={3}
        width={1}
      >
        {
          !this.props.tokenConfig ? (
            <Flex
              width={1}
              flexDirection={'column'}
            >
              <Title
                mb={3}
              >
                Perpetual Yield Tranches
              </Title>
              <Flex
                width={1}
                mb={[3,4]}
                mx={'auto'}
                aligItems={'center'}
                justifyContent={'center'}
              >
                <Text
                  fontWeight={2}
                  fontSize={[1,2]}
                  textAlign={'center'}
                >
                  {
                    this.props.isMobile ?
                      this.functionsUtil.getGlobalConfig(['strategies','tranches','descShort'])
                    :
                      this.functionsUtil.getGlobalConfig(['strategies','tranches','descLong'])
                  }
                </Text>
              </Flex>
            </Flex>
          ) : (
            <Title
              mb={3}
              fontWeight={2}
              fontSize={[3,4]}
              color={'copyColor'}
              textAlign={'center'}
            >
              Select your preferred Tranche
            </Title>
          )
        }
        <Flex
          width={1}
          flexDirection={['column','row']}
          justifyContent={'space-between'}
        >
          {
            Object.keys(tranchesDetails).map( trancheType => (
              <Flex
                mb={[3,0]}
                flexDirection={'column'}
                key={`tranche_${trancheType}`}
                width={[1,(1/Object.keys(tranchesDetails).length)-0.04]}
              >
                <Flex
                  width={1}
                  height={'100%'}
                  alignItems={'center'}
                  flexDirection={'column'}
                  justifyContent={'center'}
                >
                  <TrancheBox
                    {...this.props}
                    tokenConfig={this.props.tokenConfig}
                    trancheDetails={tranchesDetails[trancheType]}
                  />
                </Flex>
              </Flex>
            ))
          }
        </Flex>
      </Box>
    );
  }
}

export default Base;
