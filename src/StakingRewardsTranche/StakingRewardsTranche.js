import { Button } from "rimble-ui";
import React, { Component } from 'react';
import CustomList from '../CustomList/CustomList';
import FunctionsUtil from '../utilities/FunctionsUtil';
import ExecuteTransaction from '../ExecuteTransaction/ExecuteTransaction';

class StakingRewardsTranche extends Component {

  state = {
    stakingRewards:null,
    stakingRewardsRows:[]
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
    const trancheConfigChanged = JSON.stringify(prevProps.trancheConfig) !== JSON.stringify(this.props.trancheConfig);
    if (accountChanged || trancheConfigChanged){
      this.loadUserRewards();
    }
  }

  async loadUserRewards(){
    if (!this.props.account || !this.props.trancheConfig){
      return false;
    }
    const [
      stakingRewards,
      rewardTokensInfo
    ] = await Promise.all([
      this.functionsUtil.getTrancheStakingRewards(this.props.account,this.props.trancheConfig),
      this.functionsUtil.getTrancheRewardTokensInfo(this.props.tokenConfig,this.props.trancheConfig)
    ]);

    console.log('stakingRewards',stakingRewards,rewardTokensInfo);

    const stakingRewardsRows = Object.keys(stakingRewards).map( rewardToken => {
      const tokenConfig = this.functionsUtil.getGlobalConfig(['stats','tokens',rewardToken]);
      const tokenAmount = this.functionsUtil.BNify(stakingRewards[rewardToken]);
      const rewardTokenInfo = rewardTokensInfo[rewardToken];
      return {
        token:rewardToken,
        reedemable:tokenAmount.toFixed(8),
        tokenIcon:tokenConfig.icon || `images/tokens/${rewardToken}.svg`,
        distributionSpeed:rewardTokenInfo.tokensPerDay.toFixed(8)+` ${rewardToken}/day`
      };
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
        <CustomList
          rows={this.state.stakingRewardsRows}
          cols={[
            {
              title:'TOKEN',
              props:{
                width:[0.33,0.28]
              },
              fields:[
                {
                  type:'image',
                  props:{
                    mr:[1,2],
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
              title:'REDEEMABLE',
              desc:this.functionsUtil.getGlobalConfig(['messages','govTokenRedeemableBalance']),
              props:{
                width:[0.35,0.28],
                justifyContent:['center','flex-start']
              },
              fields:[
                {
                  type:'text',
                  path:['reedemable'],
                  props:{
                    decimals: this.props.isMobile ? 6 : 8
                  }
                },
              ]
            },
            {
              title:'DISTRIBUTION',
              desc:this.functionsUtil.getGlobalConfig(['messages','userDistributionSpeed']),
              props:{
                width:[0.35,0.28],
              },
              fields:[
                {
                  type:'text',
                  path:['distributionSpeed'],
                  props:{
                    decimals: this.props.isMobile ? 6 : 8
                  }
                }
              ]
            },
            {
              title:'',
              mobile:false,
              props:{
                width:0.17,
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
                      size:'medium',
                      value:'Claim',
                      borderRadius:4,
                      mainColor:'redeem'
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
      : this.props.children
    );
  }
}

export default StakingRewardsTranche;
