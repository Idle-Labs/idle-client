import React, { Component } from 'react';
import { Flex, Box, Text } from "rimble-ui";
import FlexLoader from '../FlexLoader/FlexLoader';
import AssetField from '../AssetField/AssetField';
import FunctionsUtil from '../utilities/FunctionsUtil';
// import TokenWrapper from '../TokenWrapper/TokenWrapper';
import GenericSelector from '../GenericSelector/GenericSelector';

class Staking extends Component {

  state = {
    tokenConfig:null,
    contractInfo:null,
    selectedToken:null,
    selectedOption:null,
    availableTokens:null,
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

  async componentDidMount(){
    this.loadUtils();
    this.loadData();
  }

  async componentDidUpdate(prevProps,prevState){
    this.loadUtils();

    const selectedTokenChanged = prevState.selectedToken !== this.state.selectedToken;
    if (selectedTokenChanged){
      console.log('selectedToken',this.state.selectedToken);
      const tokenConfig = this.props.toolProps.availableTokens[this.state.selectedToken];
      const contractInfo = tokenConfig.contract;

      // Init contracts
      await Promise.all([
        this.props.initContract(contractInfo.name,contractInfo.address,contractInfo.abi),
        this.props.initContract(this.state.selectedToken,tokenConfig.address,tokenConfig.abi)
      ]);

      this.setState({
        tokenConfig,
        contractInfo
      });
    }
  }

  async loadData(){
    const availableTokens = Object.keys(this.props.toolProps.availableTokens).reduce( (output,token) => {
      const tokenConfig = this.props.toolProps.availableTokens[token];
      if (tokenConfig.enabled){
        output.push({
          value:token,
          ...tokenConfig
        });
      }
      return output;
    },[]);

    const selectedOption = availableTokens[0];
    const selectedToken = selectedOption.value;

    this.setState({
      selectedToken,
      selectedOption,
      availableTokens
    });
  }

  selectToken(selectedToken){
    this.setState({
      selectedToken
    });
  }

  render() {

    const CustomOptionValue = props => {
      const label = props.label;
      const tokenConfig = {
        icon:props.data.icon
      };

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
            <AssetField
              token={label}
              tokenConfig={tokenConfig}
              fieldInfo={{
                name:'icon',
                props:{
                  mr:2,
                  width:'2em',
                  height:'2em'
                }
              }}
            />
            <AssetField
              token={label}
              fieldInfo={{
                name:'tokenName',
                props:{
                  fontSize:[1,2],
                  fontWeight:500,
                  color:'copyColor'
                }
              }}
            />
          </Flex>
        </Flex>
      );
    }

    const CustomValueContainer = props => {

      const options = props.selectProps.options;
      const selectProps = options.indexOf(props.selectProps.value) !== -1 ? props.selectProps.value : null;

      if (!selectProps){
        return null;
      }

      const label = selectProps.label;
      const tokenConfig = {
        icon:selectProps.icon
      };

      return (
        <Flex
          style={{
            flex:'1'
          }}
          justifyContent={'space-between'}
          {...props.innerProps}
        >
          <Flex
            p={0}
            width={1}
            {...props.innerProps}
            alignItems={'center'}
            flexDirection={'row'}
            style={{cursor:'pointer'}}
            justifyContent={'flex-start'}
          >
            <AssetField
              token={label}
              tokenConfig={tokenConfig}
              fieldInfo={{
                name:'icon',
                props:{
                  mr:2,
                  height:'2em'
                }
              }}
            />
            <AssetField
              token={label}
              fieldInfo={{
                name:'tokenName',
                props:{
                  fontSize:[1,2],
                  fontWeight:500,
                  color:'copyColor'
                }
              }}
            />
          </Flex>
        </Flex>
      );
    }

    const SelectedComponent = this.state.tokenConfig ? this.state.tokenConfig.component : null;

    return (
      <Flex
        width={1}
        alignItems={'center'}
        flexDirection={'column'}
        justifyContent={'center'}
      >
        {
          !this.state.availableTokens ? (
            <Flex
              mt={4}
              flexDirection={'column'}
            >
              <FlexLoader
                flexProps={{
                  flexDirection:'row'
                }}
                loaderProps={{
                  size:'30px'
                }}
                textProps={{
                  ml:2
                }}
                text={'Loading tokens...'}
              />
            </Flex>
          ) : (
            <Flex
              width={1}
              alignItems={'center'}
              justifyContent={'center'}
            >
              {
                !this.state.availableTokens.length ? (
                  <Text
                    fontWeight={2}
                    fontSize={[2,3]}
                    color={'dark-gray'}
                    textAlign={'center'}
                  >
                    There are no active tokens.
                  </Text>
                ) : (
                  <Flex
                    width={[1,0.46]}
                    alignItems={'stretch'}
                    flexDirection={'column'}
                    justifyContent={'center'}
                  >
                    <Box
                      width={1}
                    >
                      <Text
                        mb={1}
                      >
                        Select Token:
                      </Text>
                      <GenericSelector
                        {...this.props}
                        name={'tokens'}
                        isSearchable={false}
                        options={this.state.availableTokens}
                        CustomOptionValue={CustomOptionValue}
                        onChange={this.selectToken.bind(this)}
                        defaultValue={this.state.selectedOption}
                        CustomValueContainer={CustomValueContainer}
                      />
                    </Box>
                    {
                      SelectedComponent && (
                        <SelectedComponent
                          {...this.props}
                          tokenConfig={this.state.tokenConfig}
                          contractInfo={this.state.contractInfo}
                          selectedToken={this.state.selectedToken}
                        />
                      )
                    }
                  </Flex>
                )
              }
            </Flex>
          )
        }
      </Flex>
    );
  }
}

export default Staking;