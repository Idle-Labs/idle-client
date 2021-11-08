import ERC20 from '../contracts/ERC20.json';
import IdleCDO from '../contracts/IdleCDO.json';
import IdleStrategy from '../contracts/IdleStrategy.json';
import IdleCDOTrancheRewards from '../contracts/IdleCDOTrancheRewards.json';
const availableTranches = {
  idle:{
    DAI:{
      token:'DAI',
      decimals:18,
      limit:500000,
      protocol:'idle',
      blockNumber:13054628,
      address:'0x6b175474e89094c44da98b954eedeac495271d0f',
      CDO:{
        abi:IdleCDO,
        decimals:18,
        name:'IdleCDO_idleDAIYield',
        address:'0xd0DbcD556cA22d3f3c142e9a3220053FD7a247BC'
      },
      Strategy:{
        abi:IdleStrategy,
        name:'IdleStrategy_idleDAIYield'
      },
      AA:{
        abi:ERC20,
        decimals:18,
        tranche:'AA',
        functions:{
          stake:'stake',
          unstake:'unstake',
          deposit:'depositAA',
          withdraw:'withdrawAA'
        },
        CDORewards:{
          decimals:18,
          abi:IdleCDOTrancheRewards,
          name:'IdleCDOTrancheRewards_idleDAIYield_AA',
          address:'0x9c3bC87693c65E740d8B2d5F0820E04A61D8375B',
          stakingRewards:[
            {
              token:'IDLE',
              enabled:true,
              address:'0x875773784Af8135eA0ef43b5a374AaD105c5D39e'
            }
          ]
        },
        label:'idleDAI AA',
        blockNumber:13054628,
        name:'AA_idleDAIYield',
        token:'AA_idleDAIYield',
        address:'0xE9ada97bDB86d827ecbaACCa63eBcD8201D8b12E'
      },
      BB:{
        abi:ERC20,
        decimals:18,
        tranche:'BB',
        functions:{
          stake:'stake',
          unstake:'unstake',
          deposit:'depositBB',
          withdraw:'withdrawBB'
        },
        CDORewards:{
          decimals:18,
          abi:IdleCDOTrancheRewards,
          name:'IdleCDOTrancheRewards_idleDAIYield_BB',
          address:'0x4473bc90118b18be890af42d793b5252c4dc382d',
          stakingRewards:[
            {
              token:'IDLE',
              enabled:false,
              address:'0x875773784Af8135eA0ef43b5a374AaD105c5D39e'
            }
          ]
        },
        label:'idleDAI BB',
        blockNumber:13054628,
        name:'BB_idleDAIYield',
        token:'BB_idleDAIYield',
        address:'0x730348a54bA58F64295154F0662A08Cbde1225c2'
      }
    },
    FEI:{
      token:'FEI',
      decimals:18,
      limit:500000,
      protocol:'idle',
      blockNumber:13575397,
      address:'0x956f47f50a910163d8bf957cf5846d573e7f87ca',
      CDO:{
        abi:IdleCDO,
        decimals:18,
        name:'IdleCDO_idleFEIYield',
        address:'0x77648a2661687ef3b05214d824503f6717311596'
      },
      Strategy:{
        abi:IdleStrategy,
        name:'IdleStrategy_idleFEIYield'
      },
      AA:{
        abi:ERC20,
        decimals:18,
        tranche:'AA',
        functions:{
          stake:'stake',
          unstake:'unstake',
          deposit:'depositAA',
          withdraw:'withdrawAA'
        },
        CDORewards:{
          decimals:18,
          abi:IdleCDOTrancheRewards,
          name:'IdleCDOTrancheRewards_idleFEIYield_AA',
          address:'0x8fcD21253AaA7E228531291cC6f644d13B3cF0Ba',
          stakingRewards:[
            {
              token:'IDLE',
              enabled:true,
              address:'0x875773784Af8135eA0ef43b5a374AaD105c5D39e'
            }
          ]
        },
        label:'idleFEI AA',
        blockNumber:13575397,
        name:'AA_idleFEIYield',
        token:'AA_idleFEIYield',
        address:'0x9cE3a740Df498646939BcBb213A66BBFa1440af6'
      },
      BB:{
        abi:ERC20,
        decimals:18,
        tranche:'BB',
        functions:{
          stake:'stake',
          unstake:'unstake',
          deposit:'depositBB',
          withdraw:'withdrawBB'
        },
        CDORewards:{
          decimals:18,
          abi:IdleCDOTrancheRewards,
          name:'IdleCDOTrancheRewards_idleFEIYield_BB',
          address:'0x0000000000000000000000000000000000000000',
          stakingRewards:[
            {
              token:'IDLE',
              enabled:false,
              address:'0x875773784Af8135eA0ef43b5a374AaD105c5D39e'
            }
          ]
        },
        label:'idleFEI BB',
        blockNumber:13575397,
        name:'BB_idleFEIYield',
        token:'BB_idleFEIYield',
        address:'0x2490D810BF6429264397Ba721A488b0C439aA745'
      }
    }
  }
  /*
  yearn:{
  	DAI:{
  	  junior:{
  	    address:'0x000000000000000000000000000000000000'
  	  },
  	  senior:{
  	    address:'0x000000000000000000000000000000000000'
  	  }
  	}
  }
  */
};
export default availableTranches;