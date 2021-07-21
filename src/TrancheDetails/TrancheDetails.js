import { Flex, Text } from "rimble-ui";
import React, { Component } from 'react';
import FunctionsUtil from '../utilities/FunctionsUtil';
import BuyModal from '../utilities/components/BuyModal';
import TrancheField from '../TrancheField/TrancheField';
import DashboardCard from '../DashboardCard/DashboardCard';
import SendTxWithBalance from '../SendTxWithBalance/SendTxWithBalance';

class TrancheDetails extends Component {

  state = {
    contractInfo:null,
    tokenBalance:null,
    buttonDisabled:null,
    approveEnabled:null,
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
    this.loadData();
  }

  async componentDidUpdate(prevProps,prevState){
    this.loadUtils();

    const accountChanged = this.props.account !== prevProps.account;
    if (accountChanged){
      this.loadData();
    }
  }

  async loadData(){

    if (!this.props.account){
      return null;
    }

    const [
      tokenBalance
    ] = await Promise.all([
      this.functionsUtil.getTokenBalance(this.props.selectedToken,this.props.account),
      this.props.initContract(this.props.trancheConfig.name,this.props.trancheConfig.address,this.props.trancheConfig.abi)
    ]);

    this.setState({
      tokenBalance
    });
  }

  changeInputCallback(){

  }

  contractApprovedCallback(){

  }

  getTransactionParams(){

  }

  async transactionSucceeded(){

  }

  render() {
    return (
      <DashboardCard
        cardProps={{
          py:3,
          px:3
        }}
        titleProps={{
          pb:2,
          fontSize:[3,4]
        }}
        titleParentProps={{
          ml:0,
          mt:0,
          mb:3,
          style:{
            borderBottom:`1px solid ${this.props.theme.colors.divider}`
          }
        }}
        title={`${this.functionsUtil.capitalize(this.props.selectedTranche)} Tranche`}
      >
        <Flex
          style={{
            flexBasis:'0',
            flex:'1 1 0px',
            flexWrap:'wrap',
            borderBottom:`1px solid ${this.props.theme.colors.divider}`
          }}
          alignItems={'flex-start'}
          justifyContent={'flex-start'}
        >
          <Flex
            mb={3}
            width={0.5}
            flexDirection={'column'}
          >
            <Text
              mb={1}
              fontWeight={3}
              fontSize={[1,2]}
              color={'cellText'}
            >
              Protocol
            </Text>
            <Flex
              flexDirection={'row'}
            >
              <TrancheField
                {...this.props}
                fieldInfo={{
                  name:'protocolIcon',
                  props:{
                    mr:2,
                    height:['1.4em','2em']
                  }
                }}
                token={this.props.selectedToken}
                tokenConfig={this.props.tokenConfig}
                protocol={this.props.selectedProtocol}
              />
              <TrancheField
                {...this.props}
                fieldInfo={{
                  name:'protocolName',
                  props:{
                    fontSize:[2,3],
                    color:'copyColor'
                  }
                }}
                token={this.props.selectedToken}
                tokenConfig={this.props.tokenConfig}
                protocol={this.props.selectedProtocol}
              />
            </Flex>
          </Flex>
          <Flex
            mb={3}
            width={0.5}
            flexDirection={'column'}
          >
            <Text
              mb={1}
              fontWeight={3}
              fontSize={[1,2]}
              color={'cellText'}
            >
              Token
            </Text>
            <Flex
              flexDirection={'row'}
            >
              <TrancheField
                {...this.props}
                fieldInfo={{
                  name:'tokenIcon',
                  props:{
                    mr:2,
                    height:['1.4em','2em']
                  }
                }}
                token={this.props.selectedToken}
                tokenConfig={this.props.tokenConfig}
                protocol={this.props.selectedProtocol}
              />
              <TrancheField
                {...this.props}
                fieldInfo={{
                  name:'tokenName',
                  props:{
                    fontSize:[2,3],
                    color:'copyColor'
                  }
                }}
                token={this.props.selectedToken}
                tokenConfig={this.props.tokenConfig}
                protocol={this.props.selectedProtocol}
              />
            </Flex>
          </Flex>
          <Flex
            mb={3}
            width={0.5}
            flexDirection={'column'}
          >
            <Text
              fontWeight={3}
              fontSize={[1,2]}
              color={'cellText'}
            >
              Pool Size
            </Text>
            <TrancheField
              {...this.props}
              fieldInfo={{
                name:'tranchePool',
                props:{
                  decimals:2,
                  fontSize:[2,3],
                  color:'copyColor'
                }
              }}
              token={this.props.selectedToken}
              tranche={this.props.selectedTranche}
              tokenConfig={this.props.tokenConfig}
              protocol={this.props.selectedProtocol}
            />
          </Flex>
          <Flex
            mb={3}
            width={0.5}
            flexDirection={'column'}
            alignItems={'flex-start'}
          >
            <Text
              mb={1}
              fontWeight={3}
              fontSize={[1,2]}
              color={'cellText'}
            >
              Auto-Farming
            </Text>
            <TrancheField
              {...this.props}
              fieldInfo={{
                name:'govTokens',
                parentProps:{
                  justifyContent:'flex-start'
                }
              }}
              token={this.props.selectedToken}
              tokenConfig={this.props.tokenConfig}
              protocol={this.props.selectedProtocol}
            />
          </Flex>
          <Flex
            mb={3}
            width={0.5}
            flexDirection={'column'}
          >
            <Text
              fontWeight={3}
              fontSize={[1,2]}
              color={'cellText'}
            >
              APY
            </Text>
            <TrancheField
              {...this.props}
              fieldInfo={{
                name:'trancheApy',
                props:{
                  decimals:2,
                  fontSize:[2,3],
                  color:'copyColor'
                }
              }}
              token={this.props.selectedToken}
              tranche={this.props.selectedTranche}
              tokenConfig={this.props.tokenConfig}
              protocol={this.props.selectedProtocol}
            />
          </Flex>
          <Flex
            mb={3}
            width={0.5}
            flexDirection={'column'}
          >
            <Text
              fontWeight={3}
              fontSize={[1,2]}
              color={'cellText'}
            >
              IDLE distribution
            </Text>
            <TrancheField
              {...this.props}
              fieldInfo={{
                name:'trancheIDLEDistribution',
                props:{
                  decimals:2,
                  fontSize:[2,3],
                  color:'copyColor'
                }
              }}
              token={this.props.selectedToken}
              tranche={this.props.selectedTranche}
              tokenConfig={this.props.tokenConfig}
              protocol={this.props.selectedProtocol}
            />
          </Flex>
        </Flex>
        <Flex
          py={2}
          style={{
            borderBottom:`1px solid ${this.props.theme.colors.divider}`
          }}
        >
          <Text
            color={'cellText'}
          >
            {this.functionsUtil.getGlobalConfig(['tranches',this.props.selectedTranche,'description'])}
          </Text>
        </Flex>
        <Flex
          mt={3}
        >
          <SendTxWithBalance
            error={null}
            {...this.props}
            action={'Deposit'}
            permitEnabled={false}
            approveEnabled={false}
            tokenConfig={this.props.tokenConfig}
            tokenBalance={this.state.tokenBalance}
            contractInfo={this.props.trancheConfig}
            buttonDisabled={this.state.buttonDisabled}
            callback={this.transactionSucceeded.bind(this)}
            changeInputCallback={this.changeInputCallback.bind(this)}
            contractApproved={this.contractApprovedCallback.bind(this)}
            getTransactionParams={this.getTransactionParams.bind(this)}
            approveDescription={`To deposit your ${this.props.selectedToken} you need to approve the Smart-Contract first.`}
          >
            <Flex
              width={1}
              alignItems={'stretch'}
              flexDirection={'column'}
              justifyContent={'center'}
            >
              <BuyModal
                {...this.props}
                showInline={true}
                availableMethods={[]}
                buyToken={this.props.selectedToken}
              />
            </Flex>
          </SendTxWithBalance>
        </Flex>
      </DashboardCard>
    );
  }
}

export default TrancheDetails;
