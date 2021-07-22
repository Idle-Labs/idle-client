import Title from '../Title/Title';
import React, { Component } from 'react';
import { Box, Flex, Heading } from "rimble-ui";
import TranchePage from '../TranchePage/TranchePage';
import FunctionsUtil from '../utilities/FunctionsUtil';
import TranchesList from '../TranchesList/TranchesList';

class Tranches extends Component {

  state = {
    tokenConfig:null,
    selectedToken:null,
    selectedProtocol:null
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
  }

  async componentDidMount(){
    const selectedToken = this.props.urlParams.param2;
    const selectedProtocol = this.props.urlParams.param1;
    const tokenConfig = this.props.availableTranches[selectedProtocol] && this.props.availableTranches[selectedProtocol][selectedToken] ? this.props.availableTranches[selectedProtocol][selectedToken] : null;
    // console.log('componentDidMount',tokenConfig);
    if (tokenConfig){
      this.setState({
        tokenConfig,
        selectedToken,
        selectedProtocol,
      });
    }
  }

  async componentDidUpdate(prevProps,prevState){
    this.loadUtils();
  }

  selectTranche(protocol,token){
    const tokenConfig = this.props.availableTranches[protocol] && this.props.availableTranches[protocol][token] ? this.props.availableTranches[protocol][token] : null;
    if (tokenConfig){
      const route = `${this.props.selectedSection.route}/${protocol}/${token}`;
      // console.log('selectTranche',route);
      this.props.goToSection(route);
    }
  }

  render() {
    return (
      <Box
        width={1}
      >
        {
          this.state.tokenConfig ? (
            <TranchePage
              {...this.props}
              tokenConfig={this.state.tokenConfig}
              selectedToken={this.state.selectedToken}
              selectedProtocol={this.state.selectedProtocol}
              availableTranches={this.props.availableTranches}
            />
          ) : (
            <Box
              width={1}
            >
              <Title
                mb={3}
              >
                Tranches
              </Title>
              <Flex
                width={1}
                mb={[3,4]}
                id={"migrate-assets"}
                flexDirection={'column'}
              >
                <Flex
                  pb={2}
                  width={1}
                  mb={[2,3]}
                  borderColor={'divider'}
                  borderBottom={'1px solid transparent'}
                >
                  <Heading.h4
                    fontSize={[2,4]}
                    fontWeight={[3,4]}
                  >
                    Available Tranches
                  </Heading.h4>
                </Flex>
                <TranchesList
                  enabledProtocols={[]}
                  availableTranches={this.props.availableTranches}
                  handleClick={(props) => this.selectTranche(props.protocol,props.token)}
                  cols={[
                    {
                      title:'PROTOCOL',
                      props:{
                        width:[0.27,0.15]
                      },
                      fields:[
                        {
                          name:'protocolIcon',
                          props:{
                            mr:2,
                            height:['1.4em','2em']
                          }
                        },
                        {
                          name:'protocolName'
                        }
                      ]
                    },
                    {
                      title:'TOKEN',
                      props:{
                        width:[0.21, 0.12],
                      },
                      fields:[
                        {
                          name:'tokenIcon',
                          props:{
                            mr:2,
                            height:['1.4em','2em']
                          }
                        },
                        {
                          name:'tokenName'
                        }
                      ]
                    },
                    {
                      title:'POOL',
                      props:{
                        width:[0.21, 0.12],
                      },
                      fields:[
                        {
                          name:'pool',
                          props:{
                            decimals:2
                          }
                        }
                      ]
                    },
                    {
                      title:'SENIOR APY',
                      props:{
                        width:[0.29,0.15],
                      },
                      parentProps:{
                        flexDirection:'column',
                        alignItems:'flex-start',
                      },
                      fields:[
                        {
                          name:'seniorApy',
                          showTooltip:true
                        },
                      ]
                    },
                    {
                      title:'JUNIOR APY',
                      props:{
                        width:[0.29,0.15],
                      },
                      parentProps:{
                        flexDirection:'column',
                        alignItems:'flex-start',
                      },
                      fields:[
                        {
                          name:'juniorApy',
                          showTooltip:true
                        },
                      ]
                    },
                    {
                      mobile:false,
                      title:'REWARD TOKENS',
                      props:{
                        width:[0.25,0.15],
                      },
                      fields:[
                        {
                          name:'govTokens'
                        }
                      ]
                    },
                    {
                      title:'',
                      mobile:this.props.account === null,
                      props:{
                        width:[ this.props.account === null ? 0.29 : 0 ,0.16],
                      },
                      parentProps:{
                        width:1
                      },
                      fields:[
                        {
                          name:'button',
                          label: 'Deposit',
                          props:{
                            width:1,
                            fontSize:3,
                            fontWeight:3,
                            height:'45px',
                            borderRadius:4,
                            boxShadow:null,
                            mainColor:'deposit',
                            size: this.props.isMobile ? 'small' : 'medium',
                            handleClick:(props) => this.selectTranche(props.protocol,props.token)
                          }
                        }
                      ]
                    }
                  ]}
                  {...this.props}
                />
              </Flex>
            </Box>
          )
        }
      </Box>
    );
  }
}

export default Tranches;
