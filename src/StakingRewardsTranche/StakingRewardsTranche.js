import Title from '../Title/Title';
import { Button, Flex } from "rimble-ui";
import React, { Component } from 'react';
import CustomList from '../CustomList/CustomList';
import FunctionsUtil from '../utilities/FunctionsUtil';
import ExecuteTransaction from '../ExecuteTransaction/ExecuteTransaction';

class StakingRewardsTranche extends Component {

  state = {
    stakingRewards:null,
    stakingRewardsRows:null
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
    this.loadUserRewards();
  }

  async componentDidUpdate(prevProps,prevState){
    this.loadUtils();

    const accountChanged = prevProps.account !== this.props.account;
    const portfolioChanged = JSON.stringify(prevProps.portfolio) !== JSON.stringify(this.props.portfolio);
    const trancheConfigChanged = JSON.stringify(prevProps.trancheConfig) !== JSON.stringify(this.props.trancheConfig);
    const transactionsChanged = prevProps.transactions && this.props.transactions && Object.values(prevProps.transactions).filter(tx => (tx.status==='success')).length !== Object.values(this.props.transactions).filter(tx => (tx.status==='success')).length;

    if (accountChanged || trancheConfigChanged || portfolioChanged || transactionsChanged){
      this.loadUserRewards();
    }
  }

  async loadUserRewards(){
    if (!this.props.account || !this.props.trancheConfig || !this.props.portfolio){
      return false;
    }
    const [
      stakingRewards,
      rewardTokensInfo
    ] = await Promise.all([
      this.functionsUtil.getTrancheStakingRewards(this.props.account,this.props.trancheConfig),
      this.functionsUtil.getTrancheRewardTokensInfo(this.props.tokenConfig,this.props.trancheConfig)
    ]);

    const trancheBalanceInfo = this.props.portfolio.tranchesBalance.find( p => p.token === this.props.token && p.protocol === this.props.protocol && p.tranche === this.props.tranche );
    
    // console.log('stakingRewards',stakingRewards,rewardTokensInfo,trancheBalanceInfo);

    const stakingRewardsRows = [];
    await this.functionsUtil.asyncForEach(Object.keys(stakingRewards), async (rewardToken) => {
      const tokenConfig = this.functionsUtil.getGlobalConfig(['stats','tokens',rewardToken]);
      const tokenAmount = this.functionsUtil.BNify(stakingRewards[rewardToken]);
      const rewardTokenInfo = rewardTokensInfo[rewardToken];
      const tokenBalance = await this.functionsUtil.getTokenBalance(rewardToken,this.props.account);
      let distributionSpeed = rewardTokenInfo ? rewardTokenInfo.tokensPerDay : null;
      if (trancheBalanceInfo){
        distributionSpeed = distributionSpeed.times(trancheBalanceInfo.poolShare);
      }
      stakingRewardsRows.push({
        token:rewardToken,
        balance:tokenBalance.toFixed(8),
        reedemable:tokenAmount.toFixed(8),
        tokenIcon:tokenConfig.icon || `images/tokens/${rewardToken}.svg`,
        distributionSpeed:distributionSpeed ? distributionSpeed.toFixed(8)+` ${rewardToken}/day` : '-'
      });
    });

    this.setState({
      stakingRewardsRows
    });
  }

  claimCallback(tx){
    this.loadUserRewards();
  }

  render() {
    return (
      this.state.stakingRewardsRows ?
        <Flex
          mb={[0,4]}
          width={1}
          flexDirection={'column'}
          id={'funds-overview-container'}
        >
          <Title my={[3,4]}>Staking Rewards</Title>
          <CustomList
            rows={this.state.stakingRewardsRows}
            cols={[
              {
                title:'TOKEN',
                props:{
                  width:[0.18,0.16]
                },
                fields:[
                  {
                    type:'image',
                    props:{
                      mr:2,
                      size:this.props.isMobile ? '1.2em' : '1.8em'
                    },
                    path:['tokenIcon']
                  },
                  {
                    type:'text',
                    path:['token'],
                  }
                ]
              },
              {
                mobile:false,
                title:'BALANCE',
                props:{
                  width:[0.27,0.24],
                  justifyContent:['center','flex-start']
                },
                fields:[
                  {
                    type:'text',
                    path:['balance'],
                    props:{
                      decimals: this.props.isMobile ? 4 : 8
                    }
                  },
                ]
              },
              {
                title:'REDEEMABLE',
                desc:this.functionsUtil.getGlobalConfig(['messages','govTokenRedeemableBalance']),
                props:{
                  width:[0.29,0.24],
                  justifyContent:['center','flex-start']
                },
                fields:[
                  {
                    type:'text',
                    path:['reedemable'],
                    props:{
                      decimals: this.props.isMobile ? 4 : 8
                    }
                  },
                ]
              },
              {
                title:'DISTRIBUTION',
                desc:this.functionsUtil.getGlobalConfig(['messages','userDistributionSpeed']),
                props:{
                  width:[0.29,0.24],
                },
                fields:[
                  {
                    type:'text',
                    path:['distributionSpeed'],
                    props:{
                      decimals: this.props.isMobile ? 4 : 8
                    }
                  }
                ]
              },
              {
                title:'',
                props:{
                  width:[0.26,0.16],
                },
                parentProps:{
                  width:1
                },
                fields:[
                  {
                    funcProps:{
                      disabled:(props) => (this.functionsUtil.BNify(props.row.reedemable).lte(0))
                    },
                    fieldComponent:ExecuteTransaction,
                    props:{
                      params:[],
                      parentProps:{
                        width:1
                      },
                      Component:Button,
                      componentProps:{
                        style:{
                          width:'100%'
                        },
                        value:'Claim',
                        borderRadius:4,
                        mainColor:'redeem',
                        size:this.props.isMobile ? 'small' : 'medium'
                      },
                      action:'Claim',
                      methodName:'claim',
                      callback:this.claimCallback.bind(this),
                      contractName:this.props.trancheConfig.CDORewards.name
                    }
                  }
                ]
              }
            ]}
            {...this.props}
          />
        </Flex>
      : this.props.children || null
    );
  }
}

export default StakingRewardsTranche;
