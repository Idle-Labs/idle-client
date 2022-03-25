import React, { Component } from 'react';
import { Text, Flex, Button, Icon } from "rimble-ui";
import FunctionsUtil from '../utilities/FunctionsUtil';
import ExecuteTransaction from '../ExecuteTransaction/ExecuteTransaction';

class IdleStakingDisapprove extends Component {

  state = {
    disapproveAllowance:false,
    transactionSucceeded:false
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

  async componentDidMount(){
    this.loadData();
  }

  async componentDidUpdate(prevProps,prevState){
    this.loadUtils();

    const accountChanged = prevProps.account !== this.props.account;
    const requiredNetworkChanged = JSON.stringify(prevProps.network.required) !== JSON.stringify(this.props.network.required);
    const accountInizialized = this.props.accountInizialized && prevProps.accountInizialized !== this.props.accountInizialized;
    const contractsInitialized = this.props.contractsInitialized && prevProps.contractsInitialized !== this.props.contractsInitialized;
    if (requiredNetworkChanged || accountChanged || accountInizialized || contractsInitialized){
      this.loadData();
    }
  }

  async loadData(){

    if (!this.props.account || !this.props.contractsInitialized) {
      return false;
    }

    const governanceTokenName = this.functionsUtil.getGlobalConfig(['governance','props','tokenName']);
    const stkIdleConfig = this.functionsUtil.getGlobalConfig(['tools','stake','props','availableTokens','IDLE','contract']);

    await Promise.all([
      this.props.initContract(stkIdleConfig.name,stkIdleConfig.address,stkIdleConfig.abi)
    ]);

    let [
      stkIdleBalance,
      idleBalance,
      idleAllowance
    ] = await Promise.all([
      this.functionsUtil.getTokenBalance(stkIdleConfig.name,this.props.account),
      this.functionsUtil.getTokenBalance(governanceTokenName,this.props.account),
      this.functionsUtil.getAllowance(governanceTokenName,stkIdleConfig.address,this.props.account),
    ]);

    idleBalance = this.functionsUtil.BNify(idleBalance);
    stkIdleBalance = this.functionsUtil.BNify(stkIdleBalance);
    const disapproveAllowance = idleBalance.gt(0) && this.functionsUtil.BNify(idleAllowance).gt(idleBalance) && stkIdleBalance.gt(0);

    return this.setState({
      disapproveAllowance
    });
  }

  async transactionSucceeded(tx){
    this.setState({
      transactionSucceeded:true
    });
  }

  render() {
    const stkIdleConfig = this.functionsUtil.getGlobalConfig(['tools','stake','props','availableTokens','IDLE','contract']);
    return (this.state.disapproveAllowance || this.state.transactionSucceeded) ? (
      <Flex
        p={2}
        my={2}
        width={1}
        border={2}
        borderRadius={1}
        alignItems={'center'}
        flexDirection={'column'}
        justifyContent={'center'}
        backgroundColor={'cardBgHover'}
      >
        <Flex
          width={1}
          alignItems={'center'}
          flexDirection={'column'}
          justifyContent={'center'}
        >
          {
            this.state.transactionSucceeded ? (
              <Icon
                size={'1.8em'}
                name={'DoneAll'}
                color={this.props.theme.colors.transactions.status.completed}
              />
            ) : (
              <Icon
                size={'1.8em'}
                name={'Warning'}
                color={'#f6851a'}
              />
            )
          }
          <Text
            mb={1}
            fontWeight={500}
            fontSize={'15px'}
            color={'flashColor'}
            textAlign={'center'}
          >
            {
              this.state.transactionSucceeded ?
                'You have succesfully reduced the allowance for the staking contract.'
              :
                'You approved the staking contract to spend an amount of IDLE greater then your IDLE balance. It\'s advised to reduce the allowance for security reasons.'
            }
          </Text>
          {
            !this.state.transactionSucceeded && (
              <ExecuteTransaction
                {...this.props}
                Component={Button}
                parentProps={{
                  width:1,
                  alignItems:'center',
                  justifyContent:'center'
                }}
                componentProps={{
                  fontWeight:3,
                  size:'small',
                  width:'auto',
                  style:{
                    fontSize:'14px',
                  },
                  mainColor:'blue',
                  value:'Reduce allowance',
                }}
                contractName={'IDLE'}
                methodName={'approve'}
                action={'Reduce allowance'}
                callback={this.transactionSucceeded.bind(this)}
                params={[stkIdleConfig.address,this.props.web3.utils.toTwosComplement('0')]}
              />
            )
          }
        </Flex>
      </Flex>
    ) : null;
  }
}

export default IdleStakingDisapprove;
