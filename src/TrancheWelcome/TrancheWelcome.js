import Title from '../Title/Title';
import { Box, Flex } from "rimble-ui";
import React, { Component } from 'react';
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
          !this.props.tokenConfig && (
            <Title
              mb={3}
            >
              Welcome to Tranches
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
                width={[1,(1/Object.keys(tranchesDetails).length)-0.02]}
              >
                <Flex
                  width={1}
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
