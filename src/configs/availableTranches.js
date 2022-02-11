import ERC20 from '../contracts/ERC20.json';
import IdleCDO from '../contracts/IdleCDO.json';
import IdleStrategy from '../contracts/IdleStrategy.json';
import IdleCDOTrancheRewards from '../contracts/IdleCDOTrancheRewards.json';
import TrancheStakingRewards from '../contracts/TrancheStakingRewards.json';
const availableTranches = {
  idle:{
    DAI:{
      token:'DAI',
      decimals:18,
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
          claim:'claim',
          unstake:'unstake',
          deposit:'depositAA',
          withdraw:'withdrawAA',
          stakedBalance:'usersStakes',
          rewards:'expectedUserReward'
        },
        CDORewards:{
          decimals:18,
          unstakeWithBalance:true,
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
          claim:'claim',
          unstake:'unstake',
          deposit:'depositBB',
          withdraw:'withdrawBB',
          stakedBalance:'usersStakes'
        },
        CDORewards:{
          decimals:18,
          unstakeWithBalance:true,
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
          claim:'claim',
          unstake:'unstake',
          deposit:'depositAA',
          withdraw:'withdrawAA',
          stakedBalance:'usersStakes',
          rewards:'expectedUserReward'
        },
        CDORewards:{
          decimals:18,
          unstakeWithBalance:true,
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
          claim:'claim',
          unstake:'unstake',
          deposit:'depositBB',
          withdraw:'withdrawBB',
          stakedBalance:'usersStakes'
        },
        CDORewards:{
          decimals:18,
          stakingRewards:[],
          unstakeWithBalance:true,
          abi:IdleCDOTrancheRewards,
          name:'IdleCDOTrancheRewards_idleFEIYield_BB',
          address:'0x0000000000000000000000000000000000000000'
        },
        label:'idleFEI BB',
        blockNumber:13575397,
        name:'BB_idleFEIYield',
        token:'BB_idleFEIYield',
        address:'0x2490D810BF6429264397Ba721A488b0C439aA745'
      }
    }
  },
  lido:{
    stETH:{
      abi:ERC20,
      decimals:18,
      token:'stETH',
      protocol:'lido',
      blockNumber:13776954,
      address:'0xae7ab96520de3a18e5e111b5eaab095312d7fe84',
      CDO:{
        abi:IdleCDO,
        decimals:18,
        name:'IdleCDO_lido_stETH',
        address:'0x34dcd573c5de4672c8248cd12a99f875ca112ad8'
      },
      Strategy:{
        abi:IdleStrategy,
        name:'IdleStrategy_lido_stETH'
      },
      buyInstructions:'To get stETH token your have to deposit first into <a class="link" rel="nofollow noopener noreferrer" target="_blank" href="https://stake.lido.fi">Lido ETH staking</a>.',
      AA:{
        abi:ERC20,
        decimals:18,
        tranche:'AA',
        functions:{
          stake:'stake',
          unstake:'exit',
          rewards:'earned',
          claim:'getReward',
          deposit:'depositAA',
          withdraw:'withdrawAA',
          rewardsRate:'rewardRate',
          stakedBalance:'balanceOf'
        },
        CDORewards:{
          decimals:18,
          unstakeWithBalance:false,
          stakingRewards:[
            {
              token:'LDO',
              enabled:true,
              address:'0x5a98fcbea516cf06857215779fd812ca3bef1b32'
            }
          ],
          abi:TrancheStakingRewards,
          name:'TrancheStakingRewards_lido_stETH_AA',
          address:'0xd7c1b48877a7dfa7d51cf1144c89c0a3f134f935'
        },
        blockNumber:13776954,
        name:'AA_lido_stETH',
        token:'AA_lido_stETH',
        label:'lido stETH AA',
        address:'0x2688fc68c4eac90d9e5e1b94776cf14eade8d877'
      },
      BB:{
        abi:ERC20,
        decimals:18,
        tranche:'BB',
        functions:{
          stake:'stake',
          claim:'claim',
          unstake:'unstake',
          deposit:'depositBB',
          withdraw:'withdrawBB',
          stakedBalance:'usersStakes'
        },
        CDORewards:{
          decimals:18,
          stakingRewards:[],
          unstakeWithBalance:true,
          abi:IdleCDOTrancheRewards,
          name:'IdleCDOTrancheRewards_lido_stETH_BB',
          address:'0x0000000000000000000000000000000000000000'
        },
        blockNumber:13776954,
        name:'BB_lido_stETH',
        token:'BB_lido_stETH',
        label:'lido stETH BB',
        address:'0x3a52fa30c33caf05faee0f9c5dfe5fd5fe8b3978'
      }
    }
  },
  mstable:{
    mUSD:{
      abi:ERC20,
      decimals:18,
      token:'mUSD',
      protocol:'mstable',
      autoFarming:['MTA'],
      blockNumber:14184007,
      address:'0xe2f2a5c287993345a840db3b0845fbc70f5935a5',
      CDO:{
        abi:IdleCDO,
        decimals:18,
        name:'IdleCDO_mstable_mUSD',
        address:'0x70320A388c6755Fc826bE0EF9f98bcb6bCCc6FeA'
      },
      Strategy:{
        abi:IdleStrategy,
        name:'IdleStrategy_mstable_mUSD'
      },
      AA:{
        abi:ERC20,
        decimals:18,
        tranche:'AA',
        functions:{
          stake:'stake',
          unstake:'exit',
          rewards:'earned',
          claim:'getReward',
          deposit:'depositAA',
          withdraw:'withdrawAA',
          rewardsRate:'rewardRate',
          stakedBalance:'balanceOf'
        },
        CDORewards:{
          decimals:18,
          stakingRewards:[],
          unstakeWithBalance:false,
          abi:TrancheStakingRewards,
          name:'TrancheStakingRewards_mstable_mUSD_AA',
          address:'0x0000000000000000000000000000000000000000'
        },
        blockNumber:14184007,
        name:'AA_mstable_mUSD',
        token:'AA_mstable_mUSD',
        label:'mstable mUSD AA',
        address:'0xfC558914b53BE1DfAd084fA5Da7f281F798227E7'
      },
      BB:{
        abi:ERC20,
        decimals:18,
        tranche:'BB',
        functions:{
          stake:'stake',
          claim:'claim',
          unstake:'unstake',
          deposit:'depositBB',
          withdraw:'withdrawBB',
          stakedBalance:'usersStakes'
        },
        CDORewards:{
          decimals:18,
          stakingRewards:[],
          unstakeWithBalance:true,
          abi:IdleCDOTrancheRewards,
          name:'IdleCDOTrancheRewards_mstable_mUSD_BB',
          address:'0x0000000000000000000000000000000000000000'
        },
        blockNumber:14184007,
        name:'BB_mstable_mUSD',
        token:'BB_mstable_mUSD',
        label:'mstable mUSD BB',
        address:'0x91fb938FEa02DFd5303ACeF5a8A2c0CaB62b94C7'
      }
    }
  },
  convex:{
    FRAX3CRV:{
      abi:ERC20,
      decimals:18,
      token:'FRAX3CRV',
      protocol:'convex',
      blockNumber:13812864,
      autoFarming:['CVX','CRV'],
      address:'0xd632f22692FaC7611d2AA1C0D552930D43CAEd3B',
      CDO:{
        abi:IdleCDO,
        decimals:18,
        name:'IdleCDO_convex_frax3crv',
        address:'0x4ccaf1392a17203edab55a1f2af3079a8ac513e7'
      },
      Strategy:{
        abi:IdleStrategy,
        name:'IdleStrategy_convex_frax3crv'
      },
      buyInstructions:'To get FRAX3CRV token your have to deposit first into <a class="link" rel="nofollow noopener noreferrer" target="_blank" href="https://curve.fi/frax/deposit">FRAX Curve Pool</a>.',
      AA:{
        abi:ERC20,
        decimals:18,
        tranche:'AA',
        functions:{
          stake:'stake',
          claim:'claim',
          unstake:'unstake',
          deposit:'depositAA',
          withdraw:'withdrawAA',
          stakedBalance:'usersStakes',
          rewards:'expectedUserReward'
        },
        CDORewards:{
          decimals:18,
          stakingRewards:[],
          unstakeWithBalance:true,
          abi:IdleCDOTrancheRewards,
          name:'IdleCDOTrancheRewards_convex_frax3crv_AA',
          address:'0x0000000000000000000000000000000000000000'
        },
        blockNumber:13812864,
        name:'AA_convex_frax3crv',
        token:'AA_convex_frax3crv',
        label:'convex frax3crv AA',
        address:'0x15794da4dcf34e674c18bbfaf4a67ff6189690f5'
      },
      BB:{
        abi:ERC20,
        decimals:18,
        tranche:'BB',
        functions:{
          stake:'stake',
          claim:'claim',
          unstake:'unstake',
          deposit:'depositBB',
          withdraw:'withdrawBB',
          stakedBalance:'usersStakes'
        },
        CDORewards:{
          decimals:18,
          stakingRewards:[],
          unstakeWithBalance:true,
          abi:IdleCDOTrancheRewards,
          name:'IdleCDOTrancheRewards_convex_frax3crv_BB',
          address:'0x0000000000000000000000000000000000000000'
        },
        blockNumber:13812864,
        name:'BB_convex_frax3crv',
        token:'BB_convex_frax3crv',
        label:'convex frax3crv BB',
        address:'0x18cf59480d8c16856701f66028444546b7041307'
      }
    },
    MIM3CRV:{
      abi:ERC20,
      decimals:18,
      token:'MIM3CRV',
      protocol:'convex',
      blockNumber:13848124,
      autoFarming:['CVX','CRV','SPELL'],
      address:'0x5a6A4D54456819380173272A5E8E9B9904BdF41B',
      CDO:{
        abi:IdleCDO,
        decimals:18,
        name:'IdleCDO_convex_mim3crv',
        address:'0x151e89e117728ac6c93aae94c621358b0ebd1866'
      },
      Strategy:{
        abi:IdleStrategy,
        name:'IdleStrategy_convex_mim3crv'
      },
      buyInstructions:'To get MIM3CRV token your have to deposit first into <a class="link" rel="nofollow noopener noreferrer" target="_blank" href="https://curve.fi/mim/deposit">MIM Curve Pool</a>.',
      AA:{
        abi:ERC20,
        decimals:18,
        tranche:'AA',
        functions:{
          stake:'stake',
          claim:'claim',
          unstake:'unstake',
          deposit:'depositAA',
          withdraw:'withdrawAA',
          stakedBalance:'usersStakes',
          rewards:'expectedUserReward'
        },
        CDORewards:{
          decimals:18,
          stakingRewards:[],
          unstakeWithBalance:true,
          abi:IdleCDOTrancheRewards,
          name:'IdleCDOTrancheRewards_convex_mim3crv_AA',
          address:'0x0000000000000000000000000000000000000000'
        },
        blockNumber:13848124,
        name:'AA_convex_mim3crv',
        token:'AA_convex_mim3crv',
        label:'convex mim3crv AA',
        address:'0xFC96989b3Df087C96C806318436B16e44c697102'
      },
      BB:{
        abi:ERC20,
        decimals:18,
        tranche:'BB',
        functions:{
          stake:'stake',
          claim:'claim',
          unstake:'unstake',
          deposit:'depositBB',
          withdraw:'withdrawBB',
          stakedBalance:'usersStakes'
        },
        CDORewards:{
          decimals:18,
          stakingRewards:[],
          unstakeWithBalance:true,
          abi:IdleCDOTrancheRewards,
          name:'IdleCDOTrancheRewards_convex_mim3crv_BB',
          address:'0x0000000000000000000000000000000000000000'
        },
        blockNumber:13848124,
        name:'BB_convex_mim3crv',
        token:'BB_convex_mim3crv',
        label:'convex mim3crv BB',
        address:'0x5346217536852CD30A5266647ccBB6f73449Cbd1'
      }
    },
    ALUSD3CRV:{
      abi:ERC20,
      decimals:18,
      protocol:'convex',
      token:'ALUSD3CRV',
      blockNumber:14177732,
      autoFarming:['CVX','CRV'],
      address:'0x43b4FdFD4Ff969587185cDB6f0BD875c5Fc83f8c',
      CDO:{
        abi:IdleCDO,
        decimals:18,
        name:'IdleCDO_convex_alusd3crv',
        address:'0x008c589c471fd0a13ac2b9338b69f5f7a1a843e1'
      },
      Strategy:{
        abi:IdleStrategy,
        name:'IdleStrategy_convex_alusd3crv'
      },
      buyInstructions:'To get ALUSD3CRV token your have to deposit first into <a class="link" rel="nofollow noopener noreferrer" target="_blank" href="https://curve.fi/alusd/deposit">ALUSD Curve Pool</a>.',
      AA:{
        abi:ERC20,
        decimals:18,
        tranche:'AA',
        functions:{
          stake:'stake',
          claim:'claim',
          unstake:'unstake',
          deposit:'depositAA',
          withdraw:'withdrawAA',
          stakedBalance:'usersStakes',
          rewards:'expectedUserReward'
        },
        CDORewards:{
          decimals:18,
          stakingRewards:[],
          unstakeWithBalance:true,
          abi:IdleCDOTrancheRewards,
          name:'IdleCDOTrancheRewards_convex_alusd3crv_AA',
          address:'0x0000000000000000000000000000000000000000'
        },
        blockNumber:14177732,
        name:'AA_convex_alusd3crv',
        token:'AA_convex_alusd3crv',
        label:'convex alusd3crv AA',
        address:'0x790E38D85a364DD03F682f5EcdC88f8FF7299908'
      },
      BB:{
        abi:ERC20,
        decimals:18,
        tranche:'BB',
        functions:{
          stake:'stake',
          claim:'claim',
          unstake:'unstake',
          deposit:'depositBB',
          withdraw:'withdrawBB',
          stakedBalance:'usersStakes'
        },
        CDORewards:{
          decimals:18,
          stakingRewards:[],
          unstakeWithBalance:true,
          abi:IdleCDOTrancheRewards,
          name:'IdleCDOTrancheRewards_convex_alusd3crv_BB',
          address:'0x0000000000000000000000000000000000000000'
        },
        blockNumber:14177732,
        name:'BB_convex_alusd3crv',
        token:'BB_convex_alusd3crv',
        label:'convex alusd3crv BB',
        address:'0xa0E8C9088afb3Fa0F40eCDf8B551071C34AA1aa4'
      }
    },
    MUSD3CRV:{
      abi:ERC20,
      decimals:18,
      token:'MUSD3CRV',
      protocol:'convex',
      blockNumber:14177794,
      autoFarming:['CVX','CRV'],
      address:'0x1AEf73d49Dedc4b1778d0706583995958Dc862e6',
      CDO:{
        abi:IdleCDO,
        decimals:18,
        name:'IdleCDO_convex_musd3crv',
        address:'0x16d88C635e1B439D8678e7BAc689ac60376fBfA6'
      },
      Strategy:{
        abi:IdleStrategy,
        name:'IdleStrategy_convex_musd3crv'
      },
      buyInstructions:'To get MUSD3CRV token your have to deposit first into <a class="link" rel="nofollow noopener noreferrer" target="_blank" href="https://curve.fi/musd/deposit">MUSD Curve Pool</a>.',
      AA:{
        abi:ERC20,
        decimals:18,
        tranche:'AA',
        functions:{
          stake:'stake',
          claim:'claim',
          unstake:'unstake',
          deposit:'depositAA',
          withdraw:'withdrawAA',
          stakedBalance:'usersStakes',
          rewards:'expectedUserReward'
        },
        CDORewards:{
          decimals:18,
          stakingRewards:[],
          unstakeWithBalance:true,
          abi:IdleCDOTrancheRewards,
          name:'IdleCDOTrancheRewards_convex_musd3crv_AA',
          address:'0x0000000000000000000000000000000000000000'
        },
        blockNumber:14177794,
        name:'AA_convex_musd3crv',
        token:'AA_convex_musd3crv',
        label:'convex musd3crv AA',
        address:'0x4585F56B06D098D4EDBFc5e438b8897105991c6A'
      },
      BB:{
        abi:ERC20,
        decimals:18,
        tranche:'BB',
        functions:{
          stake:'stake',
          claim:'claim',
          unstake:'unstake',
          deposit:'depositBB',
          withdraw:'withdrawBB',
          stakedBalance:'usersStakes'
        },
        CDORewards:{
          decimals:18,
          stakingRewards:[],
          unstakeWithBalance:true,
          abi:IdleCDOTrancheRewards,
          name:'IdleCDOTrancheRewards_convex_musd3crv_BB',
          address:'0x0000000000000000000000000000000000000000'
        },
        blockNumber:14177794,
        name:'BB_convex_musd3crv',
        token:'BB_convex_musd3crv',
        label:'convex musd3crv BB',
        address:'0xFb08404617B6afab0b19f6cEb2Ef9E07058D043C'
      }
    },
    steCRV:{
      abi:ERC20,
      decimals:18,
      token:'steCRV',
      protocol:'convex',
      blockNumber:14182975,
      autoFarming:['CVX','CRV','LDO'],
      address:'0x06325440D014e39736583c165C2963BA99fAf14E',
      CDO:{
        abi:IdleCDO,
        decimals:18,
        name:'IdleCDO_convex_stETH',
        address:'0x7ecfc031758190eb1cb303d8238d553b1d4bc8ef'
      },
      Strategy:{
        abi:IdleStrategy,
        name:'IdleStrategy_convex_stETH'
      },
      buyInstructions:'To get steCRV token your have to deposit first into <a class="link" rel="nofollow noopener noreferrer" target="_blank" href="https://curve.fi/steth/deposit">stETH Curve Pool</a>.',
      AA:{
        abi:ERC20,
        decimals:18,
        tranche:'AA',
        functions:{
          stake:'stake',
          claim:'claim',
          unstake:'unstake',
          deposit:'depositAA',
          withdraw:'withdrawAA',
          stakedBalance:'usersStakes',
          rewards:'expectedUserReward'
        },
        CDORewards:{
          decimals:18,
          stakingRewards:[],
          unstakeWithBalance:true,
          abi:IdleCDOTrancheRewards,
          name:'IdleCDOTrancheRewards_convex_stETH_AA',
          address:'0x0000000000000000000000000000000000000000'
        },
        blockNumber:14182975,
        name:'AA_convex_stETH',
        token:'AA_convex_stETH',
        label:'convex stETH AA',
        address:'0x060a53BCfdc0452F35eBd2196c6914e0152379A6'
      },
      BB:{
        abi:ERC20,
        decimals:18,
        tranche:'BB',
        functions:{
          stake:'stake',
          claim:'claim',
          unstake:'unstake',
          deposit:'depositBB',
          withdraw:'withdrawBB',
          stakedBalance:'usersStakes'
        },
        CDORewards:{
          decimals:18,
          stakingRewards:[],
          unstakeWithBalance:true,
          abi:IdleCDOTrancheRewards,
          name:'IdleCDOTrancheRewards_convex_stETH_BB',
          address:'0x0000000000000000000000000000000000000000'
        },
        blockNumber:14182975,
        name:'BB_convex_stETH',
        token:'BB_convex_stETH',
        label:'convex stETH BB',
        address:'0xd83246d2bCBC00e85E248A6e9AA35D0A1548968E'
      }
    },
    "3EUR":{
      abi:ERC20,
      decimals:18,
      token:'3EUR',
      protocol:'convex',
      blockNumber:14177892,
      autoFarming:['CVX','CRV','ANGLE'],
      address:'0xb9446c4Ef5EBE66268dA6700D26f96273DE3d571',
      CDO:{
        abi:IdleCDO,
        decimals:18,
        name:'IdleCDO_convex_3eur',
        address:'0x858F5A3a5C767F8965cF7b77C51FD178C4A92F05'
      },
      Strategy:{
        abi:IdleStrategy,
        name:'IdleStrategy_convex_3eur'
      },
      buyInstructions:'To get 3EUR token your have to deposit first into <a class="link" rel="nofollow noopener noreferrer" target="_blank" href="https://curve.fi/factory/66/deposit">3EUR Curve Pool</a>.',
      AA:{
        abi:ERC20,
        decimals:18,
        tranche:'AA',
        functions:{
          stake:'stake',
          claim:'claim',
          unstake:'unstake',
          deposit:'depositAA',
          withdraw:'withdrawAA',
          stakedBalance:'usersStakes',
          rewards:'expectedUserReward'
        },
        CDORewards:{
          decimals:18,
          stakingRewards:[],
          unstakeWithBalance:true,
          abi:IdleCDOTrancheRewards,
          name:'IdleCDOTrancheRewards_convex_3eur_AA',
          address:'0x0000000000000000000000000000000000000000'
        },
        blockNumber:14177892,
        name:'AA_convex_3eur',
        token:'AA_convex_3eur',
        label:'convex 3eur AA',
        address:'0x158e04225777BBEa34D2762b5Df9eBD695C158D2'
      },
      BB:{
        abi:ERC20,
        decimals:18,
        tranche:'BB',
        functions:{
          stake:'stake',
          claim:'claim',
          unstake:'unstake',
          deposit:'depositBB',
          withdraw:'withdrawBB',
          stakedBalance:'usersStakes'
        },
        CDORewards:{
          decimals:18,
          stakingRewards:[],
          unstakeWithBalance:true,
          abi:IdleCDOTrancheRewards,
          name:'IdleCDOTrancheRewards_convex_3eur_BB',
          address:'0x0000000000000000000000000000000000000000'
        },
        blockNumber:14177892,
        name:'BB_convex_3eur',
        token:'BB_convex_3eur',
        label:'convex 3eur BB',
        address:'0x3061C652b49Ae901BBeCF622624cc9f633d01bbd'
      }
    }
  }
};
export default availableTranches;