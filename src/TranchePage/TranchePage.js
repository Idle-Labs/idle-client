import Title from '../Title/Title';
import { Box, Flex } from "rimble-ui";
import React, { Component } from 'react';
import Breadcrumb from '../Breadcrumb/Breadcrumb';
import FunctionsUtil from '../utilities/FunctionsUtil';
import TrancheDetails from '../TrancheDetails/TrancheDetails';

class TranchePage extends Component {

  state = {
    
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
  }

  async componentDidUpdate(prevProps,prevState){
    this.loadUtils();
  }

  render() {
    return (
      <Box
        mb={4}
        width={1}
      >
        <Flex
          width={1}
          mb={[2,0]}
          alignItems={'center'}
          flexDirection={'row'}
          justifyContent={'flex-start'}
        >
          <Flex
            width={0.5}
          >
            <Breadcrumb
              {...this.props}
              text={'Tranches'}
              isMobile={this.props.isMobile}
              path={[this.functionsUtil.capitalize(this.props.selectedProtocol),this.props.selectedToken]}
              handleClick={ e => this.props.goToSection(this.props.selectedSection.route) }
            />
          </Flex>
          <Flex
            width={0.5}
            justifyContent={'flex-end'}
          >
            
          </Flex>
        </Flex>
        <Title
          mb={3}
        >
          {this.functionsUtil.capitalize(this.props.selectedProtocol)} - {this.props.selectedToken} - Tranche
        </Title>
        <Flex
          width={1}
          flexDirection={['column','row']}
          justifyContent={'space-between'}
        >
          <Flex
            width={[1,0.47]}
            flexDirection={'column'}
          >
            <TrancheDetails
              {...this.props}
              selectedTranche={'AA'}
              cdoConfig={this.props.tokenConfig.CDO}
              trancheConfig={this.props.tokenConfig['AA']}
            />
          </Flex>
          <Flex
            width={[1,0.47]}
            flexDirection={'column'}
          >
            <TrancheDetails
              {...this.props}
              selectedTranche={'BB'}
              cdoConfig={this.props.tokenConfig.CDO}
              trancheConfig={this.props.tokenConfig['BB']}
            />
          </Flex>
        </Flex>
      </Box>
    );
  }
}

export default TranchePage;