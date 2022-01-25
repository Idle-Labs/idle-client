import { Flex } from "rimble-ui";
import React, { Component } from 'react';
import AssetField from '../AssetField/AssetField';
import FunctionsUtil from '../utilities/FunctionsUtil';
import GenericSelector from '../GenericSelector/GenericSelector';

class TrancheSelector extends Component {

  state = {
    options:null,
    defaultValue:null,
    CustomOptionValue:null,
    CustomValueContainer:null
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

  async onChange(token){
    let selectedProtocol;
    Object.keys(this.props.availableTranches).map(protocol=> {
        Object.keys(this.props.availableTranches[protocol]).map(t => {
            if(token===t)
            selectedProtocol=protocol;
            return 0;
            });
            return 0;
        });
    await this.props.changeProtocolToken(selectedProtocol,token);
  }
  loadComponents(){
    
    let opt=[];
    Object.keys(this.props.availableTranches).map(protocol => {
        Object.keys(this.props.availableTranches[protocol]).map(t => {
            const tokenConfig=this.props.availableTranches[protocol][t];
            opt.push({
                value:t,
                label:t,
                tokenConfig
                });
            return 0;
            });
            return 0;
          });
    const options=opt;
    const defaultValue = this.props.selectedToken ? options.find(v => (v.value.toUpperCase() === this.props.selectedToken.toUpperCase())) : null;
    const CustomOptionValue = props => {
      const token = props.value;
      const tokenConfig = props.data.tokenConfig;

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
              token={token}
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
              token={token}
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
      const selectProps = options.indexOf(props.selectProps.value) !== -1 ? props.selectProps.value : defaultValue;

      if (!selectProps){
        return null;
      }

      const token = selectProps.value;
      const tokenConfig = selectProps.tokenConfig;
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
              token={token}
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
              token={token}
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
    this.setState({
      options,
      defaultValue,
      CustomOptionValue,
      CustomValueContainer
    });
  }

  async componentWillMount(){
    this.loadUtils();
    this.loadComponents();

    this.setState({
      props:this.props
    });
  }

  async componentDidUpdate(prevProps,prevState){
    this.loadUtils();

    const selectedTokenChanged = prevProps.selectedToken !== this.props.selectedToken;
    const availableTranchesChanged = JSON.stringify(Object.keys(prevProps.availableTranches)) !== JSON.stringify(Object.keys(this.props.availableTranches));
    if (availableTranchesChanged || selectedTokenChanged){
      this.loadComponents();
    }
  }

  render() {
    if (!this.state.options || !this.state.defaultValue || !this.state.CustomOptionValue || !this.state.CustomValueContainer || !this.props.availableTranches || !Object.keys(this.props.availableTranches).length){
      return null;
    }

    return (
      <GenericSelector
        {...this.props}
        name={'assets'}
        options={this.state.options}
        innerProps={this.props.innerProps}
        isSearchable={this.props.isSearchable}
        defaultValue={this.state.defaultValue}
        selectedToken={this.props.selectedToken}
        CustomOptionValue={this.state.CustomOptionValue}
        CustomValueContainer={this.state.CustomValueContainer}
        onChange={this.onChange.bind(this)}
      />
    );
  }
}

export default TrancheSelector;
