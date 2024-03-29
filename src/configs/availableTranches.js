import ERC20 from '../contracts/ERC20.json';
import IdleCDO from '../contracts/IdleCDO.json';
import IdleStrategy from '../contracts/IdleStrategy.json';
import IdleCDOPolygon from '../contracts/IdleCDOPolygon.json';
import IdleCDOTrancheRewards from '../contracts/IdleCDOTrancheRewards.json';
import TrancheStakingRewards from '../contracts/TrancheStakingRewards.json';
import QuickswapLiquidityPool from "../abis/quickswap/QuickswapLiquidityPool.json";
const availableTranches = {
  137:{
    quickswap:{
      CXETHWETH:{
        decimals:18,
        token:'CXETHWETH',
        protocol:'quickswap',
        blockNumber:28501471,
        referralEnabled:true,
        autoFarming:['WMATIC'],
        abi:QuickswapLiquidityPool,
        address:'0xda7cd765DF426fCA6FB5E1438c78581E4e66bFe7',
        CDO:{
          decimals:18,
          abi:IdleCDOPolygon,
          name:'IdleCDO_quickswap_CXETHWETH',
          address:'0xB144eE58679e15f1b25A5F6EfcEBDd0AB8c8BEF5'
        },
        Strategy:{
          abi:IdleStrategy,
          name:'IdleStrategy_quickswap_CXETHWETH'
        },
        messages:{
          buyInstructions:'To get CXETHWETH token your have to supply liquidity into the <a class="link" rel="nofollow noopener noreferrer" target="_blank" href="https://quickswap.exchange/#/add/0xfe4546feFe124F30788c4Cc1BB9AA6907A7987F9/0x7ceB23fD6bC0adD59E62ac25578270cFf1b9f619">Quickswap cxETH-ETH pool</a>.',
        },
        AA:{
          abi:ERC20,
          decimals:18,
          tranche:'AA',
          functions:{
            stake:'stake',
            unstake:'exit',
            rewards:'earned',
            rewardsRate:null,
            claim:'getReward',
            deposit:'depositAA',
            withdraw:'withdrawAA',
            stakedBalance:'balanceOf',
            periodFinish:'periodFinish',
          },
          CDORewards:{
            decimals:18,
            stakingRewards:[
              {
                enabled:true,
                token:'DQUICK',
                address:'0xf28164A485B0B2C90639E47b0f377b4a438a16B1'
              }
            ],
            unstakeWithBalance:false,
            abi:TrancheStakingRewards,
            name:'TrancheStakingRewards_quickswap_CXETHWETH_AA',
            address:'0x466cFDfF869666941CdB89daa412c3CddC55D6c1'
          },
          blockNumber:28501471,
          label:'AA-CXETHWETH-LP',
          name:'AA_quickswap_CXETHWETH',
          token:'AA_quickswap_CXETHWETH',
          address:'0x967b2fdEc06c0178709F1BFf56E0aA9367c3225c'
        },
        BB:{
          abi:ERC20,
          decimals:18,
          tranche:'BB',
          functions:{
            stake:'stake',
            unstake:'exit',
            rewards:'earned',
            rewardsRate:null,
            claim:'getReward',
            deposit:'depositBB',
            withdraw:'withdrawBB',
            stakedBalance:'balanceOf',
            periodFinish:'periodFinish'
          },
          CDORewards:{
            decimals:18,
            stakingRewards:[
              {
                enabled:true,
                token:'DQUICK',
                address:'0xf28164A485B0B2C90639E47b0f377b4a438a16B1'
              }
            ],
            unstakeWithBalance:false,
            abi:TrancheStakingRewards,
            name:'TrancheStakingRewards_quickswap_CXETHWETH_BB',
            address:'0x727d9c331e9481167Dc61A9289C948da25bE825e'
          },
          blockNumber:28501471,
          label:'BB-CXETHWETH-LP',
          name:'BB_quickswap_CXETHWETH',
          token:'BB_quickswap_CXETHWETH',
          address:'0x1aFf460F388E3822756F5697f05A7E2AEB8Db7ef'
        }
      }
    }
  },
  1:{
    idle:{
      DAI:{
        token:'DAI',
        decimals:18,
        protocol:'idle',
        blockNumber:13054628,
        address:'0x6b175474e89094c44da98b954eedeac495271d0f',
        CDO:{
          decimals:18,
          abi:IdleCDO,
          name:'IdleCDO_idleDAIYield',
          address:'0xd0DbcD556cA22d3f3c142e9a3220053FD7a247BC'
        },
        Strategy:{
          abi:IdleStrategy,
          name:'IdleStrategy_idleDAIYield'
        },
        description:'This strategy accrue additional interest after an harvest is done. The returns from an harvest are linearly released in 24 hours, so you should wait 24 hours after an harvest to see all the interests you are eligible for.',
        messages:{
          withdraw:'The returns from an harvest are linearly released in 24 hours, so you should wait 24 hours after an harvest to see all the interests you are eligible for.',
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
          harvestEnabled:false,
          name:'IdleStrategy_lido_stETH'
        },
        messages:{
          buyInstructions:'To get stETH token your have to deposit first into <a class="link" rel="nofollow noopener noreferrer" target="_blank" href="https://stake.lido.fi">Lido ETH staking</a>.',
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
            stakedBalance:'balanceOf',
            periodFinish:'periodFinish'
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
    /*
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
    */
    convex:{
      FRAX3CRV:{
        abi:ERC20,
        decimals:18,
        token:'FRAX3CRV',
        protocol:'convex',
        blockNumber:13812864,
        autoFarming:['CVX','CRV'],
        curveApyPath:['apy','day','frax'],
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
        description:'This strategy accrue interest only after an harvest is done. The returns from an harvest are linearly released in 24 hours, so you should wait 24 hours after an harvest to see all the interests you are eligible for.',
        messages:{
          withdraw:'The returns from an harvest are linearly released in 24 hours, so you should wait 24 hours after an harvest to see all the interests you are eligible for.',
          buyInstructions:'To get FRAX3CRV token your have to deposit first into <a class="link" rel="nofollow noopener noreferrer" target="_blank" href="https://curve.fi/frax/deposit">FRAX Curve Pool</a>.',
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
        curveApyPath:['apy','day','mim'],
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
        description:'This strategy accrue interest only after an harvest is done. The returns from an harvest are linearly released in 24 hours, so you should wait 24 hours after an harvest to see all the interests you are eligible for.',
        messages:{
          withdraw:'The returns from an harvest are linearly released in 24 hours, so you should wait 24 hours after an harvest to see all the interests you are eligible for.',
          buyInstructions:'To get MIM3CRV token your have to deposit first into <a class="link" rel="nofollow noopener noreferrer" target="_blank" href="https://curve.fi/mim/deposit">MIM Curve Pool</a>.',
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
      steCRV:{
        abi:ERC20,
        decimals:18,
        token:'steCRV',
        protocol:'convex',
        blockNumber:14182975,
        autoFarming:['CVX','CRV','LDO'],
        curveApyPath:['apy','day','steth'],
        address:'0x06325440D014e39736583c165C2963BA99fAf14E',
        CDO:{
          abi:IdleCDO,
          decimals:18,
          name:'IdleCDO_convex_steCRV',
          address:'0x7ecfc031758190eb1cb303d8238d553b1d4bc8ef'
        },
        Strategy:{
          abi:IdleStrategy,
          name:'IdleStrategy_convex_steCRV'
        },
        description:'This strategy accrue interest only after an harvest is done. The returns from an harvest are linearly released in 24 hours, so you should wait 24 hours after an harvest to see all the interests you are eligible for.',
        messages:{
          withdraw:'The returns from an harvest are linearly released in 24 hours, so you should wait 24 hours after an harvest to see all the interests you are eligible for.',
          buyInstructions:'To get steCRV token your have to deposit first into <a class="link" rel="nofollow noopener noreferrer" target="_blank" href="https://curve.fi/steth/deposit">stETH Curve Pool</a>.',
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
            stakingRewards:[],
            unstakeWithBalance:true,
            abi:IdleCDOTrancheRewards,
            name:'IdleCDOTrancheRewards_convex_steCRV',
            address:'0x0000000000000000000000000000000000000000'
          },
          blockNumber:14182975,
          name:'AA_convex_steCRV',
          token:'AA_convex_steCRV',
          label:'convex steCRV AA',
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
            name:'IdleCDOTrancheRewards_convex_steCRV',
            address:'0x0000000000000000000000000000000000000000'
          },
          blockNumber:14182975,
          name:'BB_convex_steCRV',
          token:'BB_convex_steCRV',
          label:'convex steCRV BB',
          address:'0xd83246d2bCBC00e85E248A6e9AA35D0A1548968E'
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
        description:'This strategy accrue interest only after an harvest is done. The returns from an harvest are linearly released in 24 hours, so you should wait 24 hours after an harvest to see all the interests you are eligible for.',
        messages:{
          withdraw:'The returns from an harvest are linearly released in 24 hours, so you should wait 24 hours after an harvest to see all the interests you are eligible for.',
          buyInstructions:'To get ALUSD3CRV token your have to deposit first into <a class="link" rel="nofollow noopener noreferrer" target="_blank" href="https://curve.fi/alusd/deposit">ALUSD Curve Pool</a>.',
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
        description:'This strategy accrue interest only after an harvest is done. The returns from an harvest are linearly released in 24 hours, so you should wait 24 hours after an harvest to see all the interests you are eligible for.',
        messages:{
          withdraw:'The returns from an harvest are linearly released in 24 hours, so you should wait 24 hours after an harvest to see all the interests you are eligible for.',
          buyInstructions:'To get 3EUR token your have to deposit first into <a class="link" rel="nofollow noopener noreferrer" target="_blank" href="https://curve.fi/factory/66/deposit">3EUR Curve Pool</a>.',
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
        description:'This strategy accrue interest only after an harvest is done. The returns from an harvest are linearly released in 24 hours, so you should wait 24 hours after an harvest to see all the interests you are eligible for.',
        messages:{
          withdraw:'The returns from an harvest are linearly released in 24 hours, so you should wait 24 hours after an harvest to see all the interests you are eligible for.',
          buyInstructions:'To get MUSD3CRV token your have to deposit first into <a class="link" rel="nofollow noopener noreferrer" target="_blank" href="https://curve.fi/musd/deposit">MUSD Curve Pool</a>.',
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
      PBTCCRV:{
        abi:ERC20,
        decimals:18,
        token:'PBTCCRV',
        protocol:'convex',
        blockNumber:14570195,
        multiCallDisabled:true,
        autoFarming:['CVX','CRV','PNT'],
        address:'0xC9467E453620f16b57a34a770C6bceBECe002587',
        CDO:{
          abi:IdleCDO,
          decimals:18,
          name:'IdleCDO_convex_pbtccrv',
          address:'0xf324Dca1Dc621FCF118690a9c6baE40fbD8f09b7'
        },
        Strategy:{
          abi:IdleStrategy,
          name:'IdleStrategy_convex_pbtccrv'
        },
        description:'This strategy accrue interest only after an harvest is done. The returns from an harvest are linearly released in 24 hours, so you should wait 24 hours after an harvest to see all the interests you are eligible for.',
        messages:{
          withdraw:'The returns from an harvest are linearly released in 24 hours, so you should wait 24 hours after an harvest to see all the interests you are eligible for.',
          buyInstructions:'To get PBTCCRV token your have to deposit first into <a class="link" rel="nofollow noopener noreferrer" target="_blank" href="https://curve.fi/factory/99/deposit">PBTC Curve Pool</a>.',
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
            stakingRewards:[],
            unstakeWithBalance:true,
            abi:IdleCDOTrancheRewards,
            name:'IdleCDOTrancheRewards_convex_pbtccrv_AA',
            address:'0x0000000000000000000000000000000000000000'
          },
          blockNumber:14570195,
          name:'AA_convex_pbtccrv',
          token:'AA_convex_pbtccrv',
          label:'convex pbtccrv AA',
          address:'0x4657B96D587c4d46666C244B40216BEeEA437D0d'
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
            name:'IdleCDOTrancheRewards_convex_pbtccrv_BB',
            address:'0x0000000000000000000000000000000000000000'
          },
          blockNumber:14570195,
          name:'BB_convex_pbtccrv',
          token:'BB_convex_pbtccrv',
          label:'convex pbtccrv BB',
          address:'0x3872418402d1e967889aC609731fc9E11f438De5'
        }
      }
    },
    euler:{
      USDC:{
        abi:ERC20,
        decimals:6,
        token:'USDC',
        autoFarming:[],
        protocol:'euler',
        blockNumber:14785127,
        enabledEnvs: ['beta'],
        multiCallDisabled:true,
        address:'0xa0b86991c6218b36c1d19d4a2e9eb0ce3606eb48',
        CDO:{
          abi:IdleCDO,
          decimals:18,
          name:'IdleCDO_euler_USDC',
          address:'0xf5a3d259bfe7288284bd41823ec5c8327a314054'
        },
        Strategy:{
          abi:IdleStrategy,
          name:'IdleStrategy_euler_USDC'
        },
        AA:{
          abi:ERC20,
          decimals:6,
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
            name:'TrancheStakingRewards_euler_USDC_AA',
            address:'0x0000000000000000000000000000000000000000'
          },
          name:'AA_euler_USDC',
          blockNumber:14785127,
          token:'AA_euler_USDC',
          label:'euler USDC AA',
          address:'0x1e095cbF663491f15cC1bDb5919E701b27dDE90C'
        },
        BB:{
          abi:ERC20,
          decimals:6,
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
            name:'IdleCDOTrancheRewards_euler_USDC_BB',
            address:'0x0000000000000000000000000000000000000000'
          },
          blockNumber:14785127,
          name:'BB_euler_USDC',
          token:'BB_euler_USDC',
          label:'euler USDC BB',
          address:'0xe11679CDb4587FeE907d69e9eC4a7d3F0c2bcf3B'
        }
      }
    }
  }
};

export default availableTranches;
