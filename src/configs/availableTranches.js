import ERC20 from '../contracts/ERC20.json';
import IdleCDO from '../contracts/IdleCDO.json';
import IdleStrategy from '../contracts/IdleStrategy.json';
import IdleCDOTrancheRewards from '../contracts/IdleCDOTrancheRewards.json';
const availableTranches = {
  idle:{
    DAI:{
      token:'DAI',
      decimals:18,
      protocol:'idle',
      blockNumber:12875386,
      address:'0x6b175474e89094c44da98b954eedeac495271d0f',
      CDO:{
        abi:IdleCDO,
        decimals:18,
        name:'IdleCDO_idleDAIYield',
        address:'0x675a1378777cc2d25dbf430a28738cb6b7a3f8c2'
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
          address:'0xa8c7b9c4F18B227Abc4b099bA92d6a1CfEb9649C'
        },
        label:'idleDAI AA',
        blockNumber:12875386,
        name:'IdleCDO_AA_idleDAIYield',
        token:'IdleCDO_AA_idleDAIYield',
        address:'0xe524EE80584b120c4df8c2f130AE571ed6C196DB'
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
          address:'0x0962fB33A7E0172d0E413b0fab003bEe5142E6B6'
        },
        label:'idleDAI BB',
        blockNumber:12875386,
        name:'IdleCDO_BB_idleDAIYield',
        token:'IdleCDO_BB_idleDAIYield',
        address:'0x95a2834AFDC65dd7f28585d2d992367600afb457'
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