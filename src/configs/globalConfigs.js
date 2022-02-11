import Staking from "../Staking/Staking";
import DAI from '../abis/tokens/DAI.json';
import IDLE from '../contracts/IDLE.json';
import Tranches from '../Tranches/Tranches';
import USDC from '../abis/tokens/USDC.json';
import WETH from '../abis/tokens/WETH.json';
import COMP from '../abis/compound/COMP.json';
import aToken from '../abis/aave/AToken.json';
import ERC20 from '../abis/tokens/ERC20.json';
import TokenSwap from '../TokenSwap/TokenSwap';
import yDAIv3 from '../abis/iearn/yDAIv3.json';
import LpStaking from '../LpStaking/LpStaking';
import stkIDLE from '../contracts/stkIDLE.json';
import yUSDCv3 from '../abis/iearn/yUSDCv3.json';
import yUSDTv3 from '../abis/iearn/yUSDTv3.json';
import ySUSDv3 from '../abis/iearn/ySUSDv3.json';
import yTUSDv3 from '../abis/iearn/yTUSDv3.json';
import Timelock from '../contracts/Timelock.json';
import CurveZap from '../abis/curve/CurveZap.json';
import CovToken from '../abis/cover/CovToken.json';
import B2BVester from '../contracts/B2BVester.json';
import IdleStaking from '../IdleStaking/IdleStaking';
// import CurveSwap from '../abis/curve/CurveSwap.json';
import CurvePool from "../abis/curve/CurvePool.json";
import NexusMutual from "../NexusMutual/NexusMutual";
import CoverMint from "../abis/cover/CoverMint.json";
import LockedIDLE from "../contracts/LockedIDLE.json";
import LpStakingAbi from "../contracts/LpStaking.json";
import FunctionsUtil from "../utilities/FunctionsUtil";
import TokenWrapper from "../TokenWrapper/TokenWrapper";
import PriceOracle from "../contracts/PriceOracle.json";
import FeeTreasury from "../contracts/FeeTreasury.json";
import IdleTokenV2 from "../contracts/IdleTokenV2.json";
import StrategyPage from "../StrategyPage/StrategyPage";
import BuyModal from "../utilities/components/BuyModal";
import IdleTokenV3 from "../contracts/IdleTokenV3.json";
import IdleTokenV4 from "../contracts/IdleTokenV4.json";
import BatchDeposit from "../BatchDeposit/BatchDeposit";
import ChildERC20 from '../abis/polygon/ChildERC20.json';
import EarlyRewards from '../contracts/EarlyRewards.json';
import PolygonBridge from '../PolygonBridge/PolygonBridge';
import CoverProtocol from '../CoverProtocol/CoverProtocol';
import CurveDeposit from '../abis/curve/CurveDeposit.json';
import VesterFactory from '../contracts/VesterFactory.json';
import GovernorAlpha from '../contracts/GovernorAlpha.json';
import GovernorBravo from '../contracts/GovernorBravo.json'
import EcosystemFund from '../contracts/EcosystemFund.json';
import Comptroller from '../abis/compound/Comptroller.json';
import erc20Forwarder from '../contracts/erc20Forwarder.json';
import BalancerPool from '../abis/balancer/BalancerPool.json';
import IdleController from '../contracts/IdleController.json';
import TokenMigration from '../TokenMigration/TokenMigration';
import BatchMigration from '../BatchMigration/BatchMigration';
import IdleBatchedMint from '../contracts/IdleBatchedMint.json';
import { RampInstantSDK } from '@ramp-network/ramp-instant-sdk';
import IdleProxyMinter from '../contracts/IdleProxyMinter.json';
import ERC20Predicate from '../abis/polygon/ERC20Predicate.json';
import EtherPredicate from '../abis/polygon/EtherPredicate.json';
import DepositManager from '../abis/polygon/DepositManager.json';
import IdleRebalancerV3 from '../contracts/IdleRebalancerV3.json';
import LiquidityGaugeV2 from '../abis/curve/LiquidityGaugeV2.json';
import DeployB2BVesting from '../DeployB2BVesting/DeployB2BVesting';
import RootChainManager from '../abis/polygon/RootChainManager.json';
import SushiV2Router02 from "../abis/sushiswap/SushiV2Router02.json";
import IdleBatchConverter from "../contracts/IdleBatchConverter.json";
import UniswapV2Router02 from "../abis/uniswap/UniswapV2Router02.json";
import ChildChainManager from '../abis/polygon/ChildChainManager.json';
import IdleDepositForwarder from "../contracts/IdleDepositForwarder.json";
import ProtocolDataProvider from '../abis/aave/ProtocolDataProvider.json';
import SushiLiquidityPool from "../abis/sushiswap/SushiLiquidityPool.json";
import NexusMutualIncidents from "../abis/nexus/NexusMutualIncidents.json";
import StakingFeeDistributor from "../contracts/StakingFeeDistributor.json";
import NexusMutualDistributor from "../abis/nexus/NexusMutualDistributor.json";
import BalancerExchangeProxy from "../abis/balancer/BalancerExchangeProxy.json";
import IdleConverterPersonalSignV4 from "../contracts/IdleConverterPersonalSignV4.json";
import MinimalInitializableProxyFactory from "../contracts/MinimalInitializableProxyFactory.json";

const env = process.env;

const globalConfigs = {
  appName: "Idle",
  version: "v6.1",
  baseToken: "ETH",
  baseURL: "https://idle.finance",
  forumURL: "https://gov.idle.finance",
  telegramURL: "https://t.me/idlefinance",
  discordURL: "https://discord.gg/mpySAJp",
  twitterURL: "https://twitter.com/idlefinance",
  theme: {
    darkModeEnabled: true
  },
  environments: {
    live: {
      requiredNetwork: 1,
      url: "https://idle.finance"
    },
    beta: {
      requiredNetwork: 1,
      url: "https://beta.idle.finance"
    },
    polygon: {
      requiredNetwork: 137,
      url: "https://polygon.idle.finance"
    }
  },
  betaURL: "https://beta.idle.finance",
  countries: {
    USA: "United States of America",
    GBR: "United Kingdom",
    AUS: "Australia",
    BRA: "Brazil",
    CHN: "China",
    CAN: "Canada",
    EUR: "Europe",
    HKG: "Hong Kong",
    IND: "India",
    MEX: "Mexico",
    RUS: "Russia",
    ZAF: "South Africa",
    KOR: "South Korea"
  },
  logs: {
    // Enable logs levels
    errorsEnabled: false,
    messagesEnabled: false
  },
  connectors: {
    // Connectors props
    metamask: {
      enabled: true,
      subcaption: "Browser extension"
    },
    opera: {
      enabled: true,
      subcaption: "Opera injected wallet"
    },
    dapper: {
      enabled: true,
      icon: "dapper.png",
      subcaption: "Browser extension"
    },
    coinbase: {
      enabled: true,
      icon: "coinbase.png",
      subcaption: "Connect with Coinbase wallet"
    },
    trustwallet: {
      enabled: true,
      subcaption: "Connect with Trust Wallet"
    },
    walletconnect: {
      enabled: true,
      iconModal: "walletconnect.png",
      subcaption: "Connect with QR code"
    },
    walletlink: {
      enabled: true,
      icon: "coinbase.png",
      name: "Coinbase Wallet",
      subcaption: "Connect with QR code"
    },
    gnosis: {
      enabled: true,
      // icon:'coinbase.png',
      name: "Gnosis Safe App",
      subcaption: "Connect with Gnosis Safe App"
    },
    fortmatic: {
      enabled: true,
      subcaption: "Login with phone-number"
    },
    portis: {
      enabled: true,
      subcaption: "Login with e-mail"
    },
    authereum: {
      enabled: true,
      subcaption: "Cross-device wallet"
    },
    torus: {
      enabled: true,
      icon: "torus.png",
      subcaption: "One-Click login for Web 3.0"
    },
    trezor: {
      enabled: true,
      subcaption: "Hardware wallet"
    },
    ledger: {
      enabled: true,
      subcaption: "Hardware wallet"
    },
    ledgerlive: {
      enabled: true,
      subcaption: "Ledger Live Browser"
    },
    custom: {
      enabled: true,
      subcaption: "Custom address"
    }
  },
  newsletterSubscription: {
    endpoint: "https://dev.lapisgroup.it/idle/newsletter.php"
  },
  messages: {
    scoreShort: "Protocol Risk Score",
    apyShort: "Annual Percentage Yield",
    totalProfitPerc: "Total percentage profit generated on your balance",
    tokenPrice: "The token price is calculated using Uniswap spot prices.",
    cheapRedeem: "Amount of unlent funds available for low gas fees redeem",
    aprRatio:"The % share of the underlying yield this tranche is currently receiving",
    curveBonusSlippage: "Slippage or bonus depending on if the coin is low or high in the Curve Pool",
    distributionSpeed: "The distribution indicates the amount of tokens distributed for the entire pool.",
    directMint: "Pay an additional gas fee to rebalance the pool and help all users gain an additional APR",
    autoFarming:"Tokens earned and re-invested for more underlying token which is deposited back into the strategy",
    performanceFee: "This fee is charged on positive returns generated by Idle including accrued gov tokens except IDLE",
    userDistributionSpeed: "The distribution indicates the amount of tokens distributed for your account based on your current pool share.",
    govTokenApr: "Governance Token APR is calculated using the spot price from Uniswap and the current distribution speed for the specific pool.",
    apyTranches: "The annualized rate of return earned on an investment, taking into account the effect of auto-compounding interest and harvests",
    stakingRewards:"Current staking rewards received by this tranche. This requires users to deposit the tranche tokens using the staking function",
    govTokenRedeemableBalance: "The redeemable balance is re-calculated on every interaction with the smart-contract so, the shown balance may be lower than the real one.",
    riskScoreShort: "It's a single, consistently, comparable value for measuring protocol risk, based on factors including smart contract risk, collateralization and liquidity.",
    redeemSkipGov: "This feature allows you to save some gas by skipping the redeem of all or some of your accrued governance tokens, the skipped governance tokens will be given away to the entire pool",
    batchDepositExecutionSchedule: "Batches are executed twice a week, usually on Sunday and Wednesday, and only when the pool size reaches at least 20,000$. The time of each execution will vary depending on the gas price of the Ethereum network.",
    riskAdjustedDisabledMessageDeposit: `The Risk Adjusted strategy is no longer available.<br />Please consider to deposit in the <a target="_blank" rel="nofollow noopener noreferrer" href="https://beta.idle.finance/#/dashboard/tranches/senior/idle" class="link">Senior Tranche</a> to have a similar risk profile.`,
    apyLong: "APY is based on (I) the current yield advertised by the underlying protocol, (II) the current distribution rate of governance tokens provided by underlying lending protocols (III) the current estimated price of governance tokens from Uniswap spot prices. (IV) IDLE token distribution is referred to the entire pool.",
    riskScore: `It's a single, consistently, comparable value for measuring protocol risk, based on factors including smart contract risk, collateralization and liquidity.<br /><br />The model outputs a 0-10 score, where <strong>0 is the most risky and 10 is the most safe.</strong> Visit <a target="_blank" rel="nofollow noopener noreferrer" href="https://defiscore.io/overview">https://defiscore.io/overview</a> for further information.`,
    curveInstructions: `<strong>Depositing into the pool:</strong><br />By depositing your funds into the Curve Pool you may incur in slippage or bonus depending on if the coin is low or high in the pool.<br /><br /><strong>Withdrawing share from the pool:</strong><br />When you redeem your tokens previously deposited in the Curve Pool you get back an uneven amounts of tokens, that can give slippage or bonus depending on if the coin is low or high in the pool.`,
    yieldFarming: 'Strategies in Idle now will be able to support and distribute a vast range of yield opportunities across multiple protocols. Users will be able to receive their equivalent share of governance token that the protocol is receiving while allocating liquidity to yield farming opportunities. <a target="_blank" rel="nofollow noopener noreferrer" href="https://idlefinance.medium.com/idle-yield-farming-upgrade-18e4bc483c8f" class="link">Read more here</a>.',
    riskAdjustedDisabledMessageRedeem: `The Risk Adjusted strategy is no longer available, please redeem your funds from this strategy. You can deposit in the <a target="_blank" rel="nofollow noopener noreferrer" href="https://beta.idle.finance/#/dashboard/tranches/senior/idle" class="link">Senior Tranche</a> to maintain a similar risk profile and receive an incentive. <a target="_blank" rel="nofollow noopener noreferrer" href="https://gov.idle.finance/t/risk-adjusted-removal-for-tranches-migration/673" class="link">Read more here</a>.`,
  },
  analytics: {
    google: {
      events: {
        enabled: true, // Enable Google Analytics events
        debugEnabled: false, // Enable sending for test environments
        addPostfixForTestnet: true // Append testnet to eventCategory
      },
      pageView: {
        enabled: true
      }
    }
  },
  modals: {
    // Enable modals
    first_deposit_referral: false, // Referral share modal
    first_deposit_share: true, // First deposit share modal
    migrate: {
      enabled: true,
      availableNetworks: [1]
    },
    welcome: {
      // Welcome modal
      enabled: true,
      frequency: 604800 // One week
    }
  },
  dashboard: {
    baseRoute: "/dashboard",
    theme: {
      mode: "light",
      darkModeEnabled: true
    }
  },
  governance: {
    test: false,
    enabled: true,
    startBlock: 11333729,
    availableNetworks: [1],
    baseRoute: '/governance',
    props: {
      tokenName: 'IDLE',
      availableContracts: {
        IDLE,
        FeeTreasury,
        PriceOracle,
        GovernorAlpha,
        GovernorBravo,
        EcosystemFund,
        IdleController
      }
    },
    proposals: {
      18: {
        description: `This IIP includes Governor bravo update, M1-2022 Leagues budget transfer, Idle Smart Treasury migration, and Enzyme Bug Bounty. For more information, check: <a class="link" rel="nofollow noopener noreferrer" target="_blank" href="https://gov.idle.finance/t/iip-18-governor-bravo-update-m1-2022-leagues-budget-transfer-idle-smart-treasury-migration-and-enzyme-bug-bounty/895">https://gov.idle.finance/t/iip-18-governor-bravo-update-m1-2022-leagues-budget-transfer-idle-smart-treasury-migration-and-enzyme-bug-bounty/895</a>.`,
      },
      12: {
        description: 'Details in the gov forum post: <a class="link" rel="nofollow noopener noreferrer" target="_blank" href="https://gov.idle.finance/t/iip-12-enable-idle-lm-on-idlerai-and-fund-leagues-mandate/620">https://gov.idle.finance/t/iip-12-enable-idle-lm-on-idlerai-and-fund-leagues-mandate/620</a>.'
      },
      7: {
        description: `Upgrade of IdleTokenGovernance contract to include the following changes:<br />
        <ul>
          <li>support for EIP 3165 flashLoans (fee is set to 0.08% of the flash loaned amount redistributed to LP)</li>
          <li>support for stkAAVE distribution</li>
          <li>support for new cWBCT distribution</li>
          <li>other minor updates for gas and redeems</li>
        </ul>
        See more in the gov forum post: <a class="link" href="https://gov.idle.finance/t/iip-7-idletoken-upgrade-stkaave-distribution/466">https://gov.idle.finance/t/iip-7-idletoken-upgrade-stkaave-distribution/466</a>.`
      }
    },
    contracts: {
      delegates: "IDLE",
      governance: {
        v1:{
          name:"GovernorAlpha",
          toBlock:"14057088"
        },
        v2:{
          name:"GovernorBravo",
          toBlock:"latest"
        }
      }
    }
  },
  curve: {
    enabled: false,
    params: {
      n_coins: 3,
      label: "Curve",
      route: "/dashboard/curve",
      image: "images/protocols/curve.svg",
      imageInactive: "images/protocols/curve-off.svg"
    },
    rates: {
      path: ["apy", "day", "idle"],
      endpoint: "https://www.curve.fi/raw-stats/apys.json"
    },

    poolContract: {
      decimals: 18,
      abi: CurvePool,
      name: "idleDAI+idleUSDC+idleUSDT",
      token: "idleDAI+idleUSDC+idleUSDT",
      address: "0x09f4b84a87fc81fc84220fd7287b613b8a9d4c05"
    },
    depositContract: {
      abi: CurveDeposit,
      name: "idleCurveDeposit",
      address: "0x83f252f036761a1e3d10daca8e16d7b21e3744d7"
    },
    gaugeContract: {
      abi: LiquidityGaugeV2,
      name: "LiquidityGaugeV2",
      address: "0xd69ac8d9D25e99446171B5D0B3E4234dAd294890"
    },
    zapContract: {
      abi: CurveZap,
      name: "idleCurveZap",
      address: "0x456974df1042ba7a46fd49512a8778ac3b840a21"
    },
    migrationContract: {
      abi: CurveDeposit,
      name: "idleCurveDeposit",
      address: "0x83f252f036761a1e3d10daca8e16d7b21e3744d7",
      functions: [
        {
          label: "Deposit",
          name: "add_liquidity"
        }
      ]
    },
    availableTokens: {
      idleDAIYield: {
        decimals: 18,
        enabled: true,
        baseToken: "DAI",
        token: "idleDAIYield",
        address: "0x3fe7940616e5bc47b0775a0dccf6237893353bb4",
        migrationParams: {
          n_coins: 3,
          coinIndex: 0
        }
      },
      idleUSDCYield: {
        decimals: 18,
        enabled: true,
        baseToken: "USDC",
        token: "idleUSDCYield",
        address: "0x5274891bEC421B39D23760c04A6755eCB444797C",
        migrationParams: {
          n_coins: 3,
          coinIndex: 1
        }
      },
      idleUSDTYield: {
        decimals: 18,
        enabled: true,
        baseToken: "USDT",
        token: "idleUSDTYield",
        address: "0xF34842d05A1c888Ca02769A633DF37177415C2f8",
        migrationParams: {
          n_coins: 3,
          coinIndex: 2
        }
      }
    }
  },
  permit: {
    DAI: {
      version: 1,
      EIPVersion: null,
      nonceMethod: "nonces",
      name: "Dai Stablecoin",
      type: [
        { name: "holder", type: "address" },
        { name: "spender", type: "address" },
        { name: "nonce", type: "uint256" },
        { name: "expiry", type: "uint256" },
        { name: "allowed", type: "bool" }
      ]
    },
    USDC: {
      version: 2,
      name: "USD Coin",
      EIPVersion: 2612,
      nonceMethod: "nonces",
      type: [
        { name: "owner", type: "address" },
        { name: "spender", type: "address" },
        { name: "value", type: "uint256" },
        { name: "nonce", type: "uint256" },
        { name: "deadline", type: "uint256" }
      ]
    },
    SLP: {
      version: 1,
      EIPVersion: 2612,
      nonceMethod: "nonces",
      name: "SushiSwap LP Token",
      type: [
        { name: "owner", type: "address" },
        { name: "spender", type: "address" },
        { name: "value", type: "uint256" },
        { name: "nonce", type: "uint256" },
        { name: "deadline", type: "uint256" }
      ]
    }
  },
  govTokens: {
    IDLE: {
      abi: IDLE,
      decimals: 18,
      token: "IDLE",
      enabled: true,
      showAUM: false, // Include IDLE balance in AUM
      showAPR: false, // Include IDLE Apr
      protocol: "idle",
      showPrice: false, // Show price in Yield Farming section
      showBalance: false, // Include IDLE balance in Portfolio Donut
      aprTooltipMode: false,
      distributionMode: "block",
      availableNetworks: [1, 137],
      distributionFrequency: "day", // Multiply distribution per block
      color: "hsl(162, 100%, 41%)",
      icon: "images/tokens/IDLE.svg",
      addresses: {
        1: "0x875773784Af8135eA0ef43b5a374AaD105c5D39e",
        137: "0xc25351811983818c9fe6d8c580531819c8ade90f"
      },
      address: "0x875773784Af8135eA0ef43b5a374AaD105c5D39e", // MAIN
      disabledTokens: {
        1: ["idleDAISafe", "idleUSDCSafe", "idleUSDTSafe"],
        137: ["idleDAIYield", "idleUSDCYield", "idleWETHYield"],
      }
    },
    COMP: {
      abi: COMP,
      decimals: 18,
      token: "COMP",
      enabled: true,
      showAUM: true, // Include IDLE balance in AUM
      showAPR: true, // Include COMP Apr
      showPrice: true,
      showBalance: true, // Include COMP balance in Portfolio Donut
      disabledTokens: [],
      protocol: "compound",
      aprTooltipMode: false,
      availableNetworks: [1],
      distributionMode: "block",
      distributionFrequency: "day",
      color: "hsl(162, 100%, 41%)",
      address: "0xc00e94cb662c3520282e6f5717214004a7f26888" // MAIN
      // address:'0x61460874a7196d6a22d1ee4922473664b3e95270' // KOVAN
    },
    stkAAVE: {
      abi: aToken,
      decimals: 18,
      showAUM: true, // Include stkAAVE balance in AUM
      showAPR: true, // Include stkAAVE Apr
      enabled: true,
      showPrice: true,
      token: 'stkAAVE',
      showBalance: true, // Include stkAAVE balance in Portfolio Donut
      protocol: 'aavev2',
      aprTooltipMode: false,
      availableNetworks: [1],
      distributionMode: 'second',
      color: 'hsl(314, 41%, 51%)',
      distributionFrequency: 'day',
      address: '0x4da27a545c0c5b758a6ba100e3a049001de870f5', // MAIN
      addressForPrice: '0x7Fc66500c84A76Ad7e9c93437bFc5Ac33E2DDaE9', // MAIN
      disabledTokens: {
        1: ["idleTUSDYield", "idleSUSDYield", "idleFEIYield"]
      }
    },
    WMATIC: {
      abi: ERC20,
      decimals: 18,
      showAUM: true, // Include stkAAVE balance in AUM
      showAPR: true, // Include stkAAVE Apr
      enabled: true,
      token: 'WMATIC',
      showPrice: true,
      showBalance: true, // Include stkAAVE balance in Portfolio Donut
      protocol: 'aavev2',
      disabledTokens: [],
      aprTooltipMode: false,
      distributionMode: 'second',
      color: 'hsl(314, 41%, 51%)',
      distributionFrequency: 'day',
      availableNetworks: [137, 80001],
      // address:'0x9c3C9283D3e44854697Cd22D3Faa240Cfb032889', // Mumbai
      address: '0x0d500B1d8E8eF31E21C99d1Db9A6444d3ADf1270', // Polygon
      addressForPrice: '0x7D1AfA7B718fb893dB30A3aBc0Cfc608AaCfeBB0' // Mainnet
    }
  },
  contracts: {
    137: {
      ProtocolDataProvider: {
        abi: ProtocolDataProvider,
        address: '0x7551b5D2763519d4e37e8B81929D336De671d46d'
      },
      ChildChainManager: {
        abi: ChildChainManager,
        // address:'0x2e5e27d50EFa501D90Ad3638ff8441a0C0C0d75e' // Mumbai
        address: '0xA6FA4fB5f76172d178d61B04b0ecd319C5d1C0aa' // Matic
      },
      UniswapRouter: {
        networkId: 1,
        abi: UniswapV2Router02,
        address: '0x7a250d5630B4cF539739dF2C5dAcb4c659F2488D'
      },
      SushiswapRouter: {
        abi: SushiV2Router02,
        address: '0x1b02dA8Cb0d097eB8D57A175b88c7D8b47997506'
      },
    },
    1: {
      DepositManager: {
        abi: DepositManager,
        address: '0x401f6c983ea34274ec46f84d70b31c151321188b'
      },
      RootChainManager: {
        abi: RootChainManager,
        // address:'0xBbD7cBFA79faee899Eaf900F13C9065bF03B1A74' // Goerli
        address: '0xA0c68C638235ee32657e8f720a23ceC1bFc77C77' // Mainnet
      },
      ProxyFactory: {
        abi: MinimalInitializableProxyFactory,
        address: "0x91baced76e3e327ba7850ef82a7a8251f6e43fb8"
      },
      LockedIDLE: {
        abi: LockedIDLE,
        address: '0xF241a0151841AE2E6ea750D50C5794b5EDC31D99'
      },
      FeeTreasury: {
        abi: FeeTreasury,
        address: '0x69a62c24f16d4914a48919613e8ee330641bcb94' // MAIN
      },
      PriceOracle: {
        abi: PriceOracle,
        address: '0x972A64d108e250dF98dbeac8170678501f5EF181' // MAIN
        // address:'0xCab5760688db837Bb453FE1DFBC5eDeE6fa8F0FF' // KOVAN
      },
      Timelock: {
        abi: Timelock,
        address: '0xD6dABBc2b275114a2366555d6C481EF08FDC2556' // MAIN
        // address:'0xfD88D7E737a06Aa9c62B950C1cB5eE63DA379AFd' // KOVAN
      },
      EcosystemFund: {
        abi: EcosystemFund,
        address: '0xb0aA1f98523Ec15932dd5fAAC5d86e57115571C7' // MAIN
        // address:'0x125d3D6A8e546BD13802c309429CBB4db5737d57' // KOVAN
      },
      VesterFactory: {
        abi: VesterFactory,
        address: '0xbF875f2C6e4Cc1688dfe4ECf79583193B6089972' // MAIN
        // address:'0x9b52f91578c8AfA8e2DF07d4D7726bB6b73Ec1FE' // KOVAN
      },
      IdleController: {
        abi: IdleController,
        address: '0x275DA8e61ea8E02d51EDd8d0DC5c0E62b4CDB0BE' // MAIN
        // address:'0x8Ad5F0644b17208c81bA5BDBe689c9bcc7143d87' // KOVAN
      },
      EarlyRewards: {
        abi: EarlyRewards,
        address: '0xa1F71ED24ABA6c8Da8ca8C046bBc9804625d88Fc' // MAIN
        // address:'0x07A94A60B54c6b2Da19e23D6E9123180Bf92ED40' // KOVAN
      },
      GovernorAlpha: {
        abi: GovernorAlpha,
        address: '0x2256b25CFC8E35c3135664FD03E77595042fe31B' // MAIN
        // address:'0x782cB1dbd0bD4df95c2497819be3984EeA5c2c25' // KOVAN
      },
      GovernorBravo: {
        abi: GovernorBravo,
        address: '0x3D5Fc645320be0A085A32885F078F7121e5E5375'
      },
      Comptroller: {
        abi: Comptroller,
        address: '0x3d9819210a31b4961b30ef54be2aed79b9c9cd3b', // Main
        // address:'0x5eae89dc1c671724a672ff0630122ee834098657' // Kovan
      },
      SushiswapRouter: {
        abi: SushiV2Router02,
        address: '0xd9e1cE17f2641f24aE83637ab66a2cca9C378B9F'
      },
      UniswapRouter: {
        abi: UniswapV2Router02,
        address: '0x7a250d5630B4cF539739dF2C5dAcb4c659F2488D'
      },
      BalancerExchangeProxy: {
        abi: BalancerExchangeProxy,
        address: '0x3E66B66Fd1d0b02fDa6C811Da9E0547970DB2f21'
      }
    }
  },
  tokens: {
    DAI: {
      zeroExInstant: {
        orderSource: "https://api.0x.org/sra/",
        assetData:
          "0xf47261b00000000000000000000000006b175474e89094c44da98b954eedeac495271d0f",
        affiliateInfo: {
          feeRecipient: "0x4215606a720477178AdFCd5A59775C63138711e8",
          feePercentage: 0.0025
        }
      }
    },
    USDC: {
      zeroExInstant: {
        orderSource: "https://api.0x.org/sra/",
        assetData:
          "0xf47261b0000000000000000000000000a0b86991c6218b36c1d19d4a2e9eb0ce3606eb48",
        affiliateInfo: {
          feeRecipient: "0x4215606a720477178AdFCd5A59775C63138711e8",
          feePercentage: 0.0025
        }
      }
    }
  },
  tranchflash: {
    name: "perpetual yield tranches",
    subtitle: "Make yield your own.",
    desc: "Choose the benefits of high-yield or low-risk, while enjoying the flexibility of Tranches. This comes with auto-compounding for accrued governance tokens and no locking period.",
    arrows: "images/idlearrows.svg",
    juniorinfo:
      "<b>Junior Tranches</b><br>Higher risk, leveraged for variable rate rewards",
    seniorinfo:
      "<b>Senior Tranches</b><br>Lower risk, built-in coverage for variable rate rewards",
    helpcircle: "images/help-circle.svg",
    questions: [
      {
        desc: "How it Works?",
        msg: "This product aggregates user deposits into underlying markets and allocates the accrued yield on the sum between two different risk profile subsets. You get to choose the strategy according to your risk tolerance. Users are able to deposit funds into either the Junior or Senior Tranches in exchange for a token indicating their claim on their principal and whatever yield is allocated for them. These aggregated holdings are then deposited into the specified originating lending market, in this current version Idle Best-Yield strategy."
      },
      {
        desc: "What happens in a case of a default?",
        msg: "In case of hack, an emergency shutdown can be triggered (by both the guardian, which would be a multi-sig wallet, and the owner which will be the Idle governance) in order to pause both deposits and redeems.<br />The redistribution of remaining funds can happens selectively, by allowing only Senior tranche holders to withdraw first directly in the main contract, or through a separate contract for more complex cases and resolutions (managed by the Idle governance)."
      }
    ]
  },
  tranches: {
    AA: {
      color: {
        hex: "#337de5",
        rgb: [51, 125, 229],
        hsl: ["215", "77%", "55%"]
      },
      type: "AA",
      route: "senior",
      icon: "Security",
      image: "images/SeniorTranche.svg",
      bubble: "images/SeniorBubble.svg",
      baseName: "senior",
      name: "Senior Tranche",
      features: [
        "Covered by Junior tranches funds",
        "Minimized risk exposure",
        "No locking period or epochs",
        "Auto-Reinvest accrued tokens",
        "Stake to receive $IDLE tokens"
      ],
      description: {
        withdraw: "You can withdraw your funds at any time from the tranche.",
        stake: "Stake your tranche tokens to earn additional rewards and boost the APY.",
        unstake: "By unstaking your tranche tokens you will no more get additional rewards.",
        cantUnstake: "To unstake your funds you just need to wait 10 blocks after your last stake transaction.",
        cantWithdraw: "To withdraw your funds you just need to wait at least 1 block from the latest harvest transaction.",
        long: "Senior Tranches provide a shielded access to optimized DeFi yields, thanks to an integrated funds' coverage given by Junior Tranches",
        deposit: "By depositing in the Senior Tranche in case of Smart-Contract breach your funds are covered by the funds deposited in the Junior Tranche.",
        apy:"APY is based on (I) the current yield advertised by the underlying protocol, (II) the current distribution rate of governance tokens provided by underlying lending protocols (III) additional APY derived from staking",
      }
    },
    BB: {
      color: {
        hex: "#FAB325",
        rgb: [250, 179, 37],
        hsl: ["40", "95%", "56%"]
      },
      type: "BB",
      route: "junior",
      icon: "TrendingUp",
      image: "images/JuniorTranche.svg",
      bubble: "images/JuniorBubble.svg",
      baseName: "junior",
      name: "Junior Tranche",
      features: [
        "Leverage yield using Senior tranches funds",
        "Higher risk exposure by protecting senior tranches",
        "No locking period or epochs",
        "Auto-Reinvest accrued tokens",
      ],
      description: {
        withdraw: "You can withdraw your funds at any time from the tranche.",
        stake: "Stake your tranche tokens to earn additional rewards and boost the APY.",
        unstake: "By unstaking your tranche tokens you will no more get additional rewards.",
        cantUnstake: "To unstake your funds you just need to wait 10 blocks after your last stake transaction.",
        cantWithdraw: "To withdraw your funds you just need to wait at least 1 block from the latest harvest transaction.",
        long: "The Junior Tranches provide amplified optimized DeFi yields by carrying a higher grade of risks and protecting Senior Tranches",
        deposit: "By depositing in the Junior Tranche in case of Smart-Contract breach your funds will be used to cover eventual losses on the Senior Tranche.",
        apy:"APY is based on (I) the current yield advertised by the underlying protocol, (II) the current distribution rate of governance tokens provided by underlying lending protocols (III) additional APY derived from staking",
      }
    }
  },
  extraicons: {
    best: {
      icon: "images/sidebar/best-on.svg",
      iconDark: "images/sidebar/best-on-dark.svg",
      iconInactive: "images/sidebar/best-off.svg",
      iconInactiveDark: "images/sidebar/best-off-dark.svg",
    },
    tranches: {
      icon: "images/sidebar/tranches-on.svg",
      iconDark: "images/sidebar/tranches-on-dark.svg",
      iconInactive: "images/strategies/tranches-off.svg",
      iconInactiveDark: "images/strategies/tranches-off-dark.svg"
    },
    risk: {
      icon: "images/sidebar/risk-on.svg",
      iconDark: "images/sidebar/risk-on-dark.svg",
      iconInactive: "images/sidebar/risk-off.svg",
      iconInactiveDark: "images/sidebar/risk-off-dark.svg"
    },
    stats: {
      icon: "images/sidebar/stats-on.svg",
      iconDark: "images/sidebar/stats-on-dark.svg",
      iconInactive: "images/sidebar/stats-off.svg",
      iconInactiveDark: "images/sidebar/stats-off-dark.svg"
    },
    tools: {
      icon: "images/sidebar/tools-on.svg",
      iconDark: "images/sidebar/tools-on-dark.svg",
      iconInactive: "images/sidebar/tools-off.svg",
      iconInactiveDark: "images/sidebar/tools-off-dark.svg"
    },
    forum: {
      icon: "images/sidebar/forum-on.svg",
      iconDark: "images/sidebar/forum-on-dark.svg",
      iconInactive: "images/sidebar/forum-off.svg",
      iconInactiveDark: "images/sidebar/forum-off-dark.svg"
    },
    stake: {
      icon: "images/sidebar/stake-on.svg",
      iconDark: "images/sidebar/stake-on-dark.svg",
      iconInactive: "images/sidebar/stake-off.svg",
      iconInactiveDark: "images/sidebar/stake-off-dark.svg"
    },
    leaderboard: {
      icon: "images/sidebar/leaderboard-on.svg",
      iconDark: "images/sidebar/leaderboard-on-dark.svg",
      iconInactive: "images/sidebar/leaderboard-off.svg",
      iconInactiveDark: "images/sidebar/leaderboard-off-dark.svg"
    }, overview: {
      icon: "images/sidebar/overview-on.svg",
      iconDark: "images/sidebar/overview-on-dark.svg",
      iconInactive: "images/sidebar/overview-off.svg",
      iconInactiveDark: "images/sidebar/overview-off-dark.svg"
    }, proposals: {
      icon: "images/sidebar/proposals-on.svg",
      iconDark: "images/sidebar/proposals-on-dark.svg",
      iconInactive: "images/sidebar/proposals-off.svg",
      iconInactiveDark: "images/sidebar/proposals-off-dark.svg"
    }, delegate: {
      icon: "images/sidebar/delegate-on.svg",
      iconDark: "images/sidebar/delegate-on-dark.svg",
      iconInactive: "images/sidebar/delegate-off.svg",
      iconInactiveDark: "images/sidebar/delegate-off-dark.svg"
    },
  },
  landingStrategies: {
    tranches: {
      networkId: 1,
      visible: true,
      token: "stETH",
      type: "tranche",
      enabledEnvs: [],
      protocol: "lido",
      color: "#f32121",
      comingSoon: false,
      addGovTokens: true,
      titlePostfix: null,
      strategy: 'tranches',
      component: Tranches,
      iconName: "Whatshot",
      availableNetworks: [1],
      govTokensEnabled: true,
      title: "Perpetual Tranches",
      chartColor: "hsl(40,95%,59%)",
      icon: "images/strategies/tranches-on.png",
      iconInactive: "images/strategies/tranches-off.png",
      iconInactiveDark: "images/strategies/tranches-white.png",
      desc: "Diversify your risk profile with dynamic tranched yield derivatives",
      descShort: "Tranches deposit assets (eg DAI) into yield sources (eg Idle Finance) and split the accrued interest between 2 classes of products with different risk profiles.",
      descLong: "Choose the benefits of high-yield or low-risk, while enjoying the flexibility of Tranches. This comes with auto-compounding for accrued governance tokens and no locking period."
    },
    best: {
      networkId: 1,
      token: "DAI",
      visible: true,
      strategy: 'best',
      enabledEnvs: [],
      color: "#f32121",
      type: "strategy",
      comingSoon: false,
      addGovTokens: true,
      titlePostfix: null,
      title: "Best-Yield",
      iconName: "Whatshot",
      availableNetworks: [],
      govTokensEnabled: true,
      component: StrategyPage,
      chartColor: "hsl(40,95%,59%)",
      icon: "images/strategies/best-on.svg",
      iconInactive: "images/strategies/best-off.svg",
      iconInactiveDark: "images/strategies/best-white.svg",
      desc: "Maximize your returns across DeFi protocols",
      descLong: "The Best-Yield allocation strategy allows to maximize the interest rate returns by detecting the interest rate changes on different lending protocols. Idle’s monitoring system automatically triggers a rebalance if it spots a better-performing allocation: this includes taking account of the total liquidity within the pool, incorporating underlying protocol rate functions and levels of supply and demand. As a user, you will end up with an higher return without constantly checking rates and burning gas on every transfer. Unlock your funds from a single protocol performance with this strategy.",
      descShort: "The Best-Yield allocation strategy allows to maximize the interest rate returns by detecting the interest rate changes on different lending protocols."
    },
    polygon: {
      token: "DAI",
      visible: true,
      networkId: 137,
      enabledEnvs: [],
      strategy: 'best',
      color: "#f32121",
      type: "strategy",
      comingSoon: false,
      addGovTokens: true,
      titlePostfix: null,
      title: "Best-Yield",
      iconName: "Whatshot",
      availableNetworks: [],
      govTokensEnabled: true,
      component: StrategyPage,
      chartColor: "hsl(40,95%,59%)",
      icon: "images/strategies/best-on.svg",
      iconInactive: "images/strategies/best-on.svg",
      iconInactiveDark: "images/strategies/best-on.svg",
      desc: "Maximize your returns on Polygon across DeFi protocols",
      descLong: "The Best-Yield allocation strategy allows to maximize the interest rate returns by detecting the interest rate changes on different lending protocols. Idle’s monitoring system automatically triggers a rebalance if it spots a better-performing allocation: this includes taking account of the total liquidity within the pool, incorporating underlying protocol rate functions and levels of supply and demand. As a user, you will end up with an higher return without constantly checking rates and burning gas on every transfer. Unlock your funds from a single protocol performance with this strategy.",
      descShort: "The Best-Yield allocation strategy allows to maximize the interest rate returns by detecting the interest rate changes on different lending protocols."
    }
  },
  strategies: {
    tranches: {
      token: "FEI",
      visible: true,
      type: "tranche",
      enabledEnvs: [],
      protocol: "idle",
      color: "#f32121",
      comingSoon: false,
      title: "Tranches",
      addGovTokens: true,
      titlePostfix: null,
      component: Tranches,
      iconName: "Whatshot",
      availableNetworks: [1],
      govTokensEnabled: true,
      chartColor: "hsl(40,95%,59%)",
      icon: "images/strategies/tranches-on.png",
      iconInactive: "images/strategies/tranches-off.png",
      iconInactiveDark: "images/strategies/tranches-white.png",
      desc: "Diversify your risk profile with dynamic tranched yield derivatives",
      descShort: "Tranches deposit assets (eg DAI) into yield sources (eg Idle Finance) and split the accrued interest between 2 classes of products with different risk profiles.",
      descLong: "Choose the benefits of high-yield or low-risk, while enjoying the flexibility of Tranches. This comes with auto-compounding for accrued governance tokens and no locking period."
    },
    best: {
      token: "DAI",
      visible: true,
      enabledEnvs: [],
      color: "#f32121",
      type: "strategy",
      comingSoon: false,
      addGovTokens: true,
      titlePostfix: null,
      title: "Best-Yield",
      iconName: "Whatshot",
      govTokensEnabled: true,
      component: StrategyPage,
      availableNetworks: [1, 137],
      chartColor: "hsl(40,95%,59%)",
      icon: "images/strategies/best-on.svg",
      iconInactive: "images/strategies/best-off.svg",
      iconInactiveDark: "images/strategies/best-white.svg",
      desc: "Maximize your returns across DeFi protocols",
      descLong: "The Best-Yield allocation strategy allows to maximize the interest rate returns by detecting the interest rate changes on different lending protocols. Idle’s monitoring system automatically triggers a rebalance if it spots a better-performing allocation: this includes taking account of the total liquidity within the pool, incorporating underlying protocol rate functions and levels of supply and demand. As a user, you will end up with an higher return without constantly checking rates and burning gas on every transfer. Unlock your funds from a single protocol performance with this strategy.",
      descShort: "The Best-Yield allocation strategy allows to maximize the interest rate returns by detecting the interest rate changes on different lending protocols."
    },
    risk: {
      token: "DAI",
      visible: true,
      enabledEnvs: [],
      color: "#2196F3",
      type: "strategy",
      comingSoon: false,
      titlePostfix: null,
      addGovTokens: true,
      iconName: "Security",
      availableNetworks: [1],
      title: "Risk-Adjusted",
      govTokensEnabled: true,
      component: StrategyPage,
      chartColor: "hsl(211,67%,47%)",
      icon: "images/strategies/risk-on.svg",
      iconInactive: "images/strategies/risk-off.svg",
      iconInactiveDark: "images/strategies/risk-white.svg",
      desc: "Optimize your risk exposure across DeFi protocols",
      descLong: "The Risk-Adjusted allocation strategy provides a way to earn the best rate at the lowest risk-level. The risk-management algorithm takes account of the total assets within a pool, incorporates underlying protocol rate functions and levels of supply and demand, skimming protocols with a bad score/rate mix, and finally determining an allocation that achieves the highest risk-return score possible after the rebalance happens.",
      descShort: "The Risk-Adjusted allocation strategy provides a way to earn the best rate at the lowest risk-level."
    }
    /*
    new:{
      token:'DAI',
      color:'#2196F3',
      comingSoon:true,
      addGovTokens:true,
      iconName:'Adjust',
      title:'Coming Soon',
      chartColor:'hsl(211,67%,47%)',
      icon:'images/strategies/solr-on.svg',
      desc:'More strategies are coming soon!',
      iconInactive:'images/strategies/solr-off.svg',
      descLong:'The Risk-Adjusted allocation strategy provides a way to earn the best rate at the lowest risk-level. The risk-management algorithm takes account of the total assets within a pool, incorporates underlying protocol rate functions and levels of supply and demand, skimming protocols with a bad score/rate mix, and finally determining an allocation that achieves the highest risk-return score possible after the rebalance happens.',
      descShort:'The Risk-Adjusted allocation strategy provides a way to earn the best rate at the lowest risk-level.'
    }
    */
  },
  stats: {
    enabled: true, // Enable endpoint
    availableNetworks: [1, 137],
    rates: {
      TTL: 300, // 5 minutes
      endpoint: {
        1: "https://api.idle.finance/rates/",
        137: "https://api-polygon.idle.finance/rates/"
      }
    },
    tvls: {
      TTL: 120,
      endpoint: {
        1: "https://api.idle.finance/tvls/",
        137: "https://api-polygon.idle.finance/tvls/"
      }
    },
    aprs: {
      TTL: 120,
      endpoint: {
        1: "https://api.idle.finance/aprs/",
        137: "https://api-polygon.idle.finance/aprs/"
      }
    },
    substack: {
      TTL: 1800,
      endpoint: {
        1: "https://api.idle.finance/substack/",
        137: "https://api-polygon.idle.finance/substack/"
      }
    },
    scores: {
      TTL: 300, // 5 minutes
      endpoint: {
        1: "https://api.idle.finance/scores/"
      }
    },
    config: {
      headers: env.REACT_APP_IDLE_KEY ? { Authorization: `Bearer ${env.REACT_APP_IDLE_KEY}` } : {}
    },
    versions: {
      /*
      v2:{
        label:'Idle V2',
        startTimestamp:null,
        additionalProtocols:[],
        endTimestamp:1589752999,
        enabledStrategies:['best'],
        showPerformanceTooltip:false,
        enabledTokens:['DAI','USDC'],
      },
      */
      v3: {
        label: "Idle V3",
        additionalProtocols: [],
        endTimestamp: 1597237542,
        startTimestamp: 1589801874,
        showPerformanceTooltip: false,
        strategiesParams: {
          risk: {
            endTimestamp: 1597233922
          }
        },
        enabledStrategies: ["best", "risk"],
        enabledTokens: ["DAI", "USDC", "USDT", "TUSD", "SUSD", "WBTC"]
      },
      v4: {
        label: "Idle V4",
        endTimestamp: null,
        startTimestamp: 1597442400, // 1598220000
        enabledStrategies: ["best", "risk"],
        showPerformanceTooltip: true,
        strategiesParams: {
          risk: {
            startTimestamp: 1599183170
          }
        },
        enabledTokens: ['DAI', 'USDC', 'USDT', 'TUSD', 'SUSD', 'WBTC', 'WETH', 'RAI', 'FEI'],
        additionalProtocols: [
          {
            decimals: 16,
            protocol: "compound",
            name: "compoundWithCOMP",
            enabledTokens: ["DAI", "USDC", "USDT", "TUSD", "SUSD", "WBTC", "WETH"]
          },
          {
            decimals: 18,
            protocol: "aavev2",
            name: "aavev2WithStkAAVE",
            enabledTokens: ["DAI", "USDC", "USDT", "TUSD", "SUSD", "WBTC", "WETH", "RAI"]
          }
        ]
      }
    },
    tokens: {
      DAI: {
        decimals: 18,
        enabled: true,
        color: {
          rgb: [250, 184, 51],
          hex: '#F7B24A',
          hsl: ['40', '95%', '59%']
        },
        chart: {
          labelTextColorModifiers: ['darker', 2]
        },
        startTimestamp: '2020-02-11',
        address: '0x6b175474e89094c44da98b954eedeac495271d0f',
        performanceTooltip: 'APR is calculated proportionally to historical allocations of each lending protocol in the selected time period. This pool has 1% unlent reserve to help reduce gas costs.',
      },
      ETH: {
        decimals: 18,
        enabled: true,
        color: {
          hex: '#333',
          rgb: [51, 51, 51],
          hsl: ['0, 0%, 20%']
        },
        address: '0x7D1AfA7B718fb893dB30A3aBc0Cfc608AaCfeBB0'
      },
      STETH: {
        decimals: 18,
        enabled: true,
        label: 'stETH',
        color: {
          hex: '#00a3ff',
          rgb: [0, 163, 255],
          hsl: ['202', '100%', '50%']
        },
        conversionRateField: "stETHDAIPrice",
        address: '0xae7ab96520de3a18e5e111b5eaab095312d7fe84'
      },
      CVX: {
        decimals: 18,
        enabled: true,
        label: 'CVX',
        color: {
          hex: '#3a3a3a',
          rgb: [58, 58, 58],
          hsl: ['0', '0%', '23%']
        },
        address: '0x4e3fbd56cd56c3e72c1403e103b45db9da5b9d2b'
      },
      LDO: {
        label: 'LDO',
        decimals: 18,
        enabled: true,
        color: {
          hex: '#3a3a3a',
          rgb: [58, 58, 58],
          hsl: ['0', '0%', '23%']
        },
        address: '0x5a98fcbea516cf06857215779fd812ca3bef1b32'
      },
      MTA: {
        label: 'MTA',
        decimals: 18,
        enabled: true,
        color: {
          hex: '#000',
          rgb: [0, 0, 0],
          hsl: ['0', '0%', '0%']
        },
        address: '0xa3BeD4E1c75D00fa6f4E5E6922DB7261B5E9AcD2'
      },
      CRV: {
        decimals: 18,
        enabled: true,
        label: 'CRV',
        color: {
          hex: '#3466a3',
          rgb: [52, 102, 163],
          hsl: ['213', '52%', '42%']
        },
        address: '0xD533a949740bb3306d119CC777fa900bA034cd52'
      },
      FRAX3CRV: {
        decimals: 18,
        enabled: true,
        label: 'FRAX3CRV',
        icon: "images/tokens/FRAX3CRV.png",
        color: {
          hex: '#333',
          rgb: [51, 51, 51],
          hsl: ['0, 0%, 20%']
        },
        address: '0xd632f22692FaC7611d2AA1C0D552930D43CAEd3B'
      },
      MIM3CRV: {
        decimals: 18,
        enabled: true,
        label: 'MIM3CRV',
        color: {
          hex: '#9695f7',
          rgb: [150, 149, 247],
          hsl: ['241', '86%', '78%']
        },
        address: '0x5a6A4D54456819380173272A5E8E9B9904BdF41B'
      },
      ALUSD3CRV: {
        decimals: 18,
        enabled: true,
        label: 'ALUSD3CRV',
        icon: "images/tokens/ALUSD3CRV.png",
        color: {
          hex: '#333',
          rgb: [51, 51, 51],
          hsl: ['0, 0%, 20%']
        },
        address: '0x43b4FdFD4Ff969587185cDB6f0BD875c5Fc83f8c'
      },
      MUSD3CRV: {
        decimals: 18,
        enabled: true,
        label: 'MUSD3CRV',
        icon: "images/tokens/MUSD3CRV.png",
        color: {
          hex: '#333',
          rgb: [51, 51, 51],
          hsl: ['0, 0%, 20%']
        },
        address: '0x1AEf73d49Dedc4b1778d0706583995958Dc862e6'
      },
      MUSD: {
        decimals: 18,
        enabled: true,
        label: 'mUSD',
        color: {
          hex: '#333',
          rgb: [51, 51, 51],
          hsl: ['0, 0%, 20%']
        },
        address: '0xe2f2a5c287993345a840db3b0845fbc70f5935a5'
      },
      ANGLE: {
        decimals: 18,
        enabled: true,
        label: 'ANGLE',
        color: {
          hex: '#333',
          rgb: [51, 51, 51],
          hsl: ['0, 0%, 20%']
        },
        address: '0x31429d1856ad1377a8a0079410b297e1a9e214c2'
      },
      "3EUR": {
        decimals: 18,
        enabled: true,
        label: '3EUR',
        color: {
          hex: '#333',
          rgb: [51, 51, 51],
          hsl: ['0, 0%, 20%']
        },
        conversionRateField: "eurDAIPrice",
        address: '0xb9446c4Ef5EBE66268dA6700D26f96273DE3d571',
        addressForPrice: '0x1a7e4e63778b4f12a199c062f3efdd288afcbce8',
        addressForPriceFrom: '0x956f47f50a910163d8bf957cf5846d573e7f87ca'
      },
      STECRV: {
        decimals: 18,
        enabled: true,
        label: 'steCRV',
        color: {
          hex: '#00a3ff',
          rgb: [0, 163, 255],
          hsl: ['202', '100%', '50%']
        },
        conversionRateField: "stETHDAIPrice",
        address: '0x06325440D014e39736583c165C2963BA99fAf14E',
        addressForPrice: '0xae7ab96520de3a18e5e111b5eaab095312d7fe84'
      },
      SPELL: {
        decimals: 18,
        enabled: true,
        label: 'SPELL',
        icon: "images/tokens/SPELL.png",
        color: {
          hex: '#9695f7',
          rgb: [150, 149, 247],
          hsl: ['241', '86%', '78%']
        },
        address: '0x090185f2135308bad17527004364ebcc2d37e5f6'
      },
      MATIC: {
        decimals: 18,
        enabled: true,
        color: {
          hex: '#8247E5',
          rgb: [130, 71, 229],
          hsl: ['262, 75%, 59%']
        },
        address: '0x7D1AfA7B718fb893dB30A3aBc0Cfc608AaCfeBB0'
      },
      USD: {
        enabled: true,
        color: {
          hex: "#85bb65",
          rgb: [133, 187, 101],
          hsl: ["98", "39%", "56%"]
        },
        chart: {
          labelTextColorModifiers: ["brighter", 2]
        },
        address: null,
        startTimestamp: "2020-02-04"
      },
      USDC: {
        decimals: 6,
        enabled: true,
        color: {
          hex: "#2875C8",
          rgb: [40, 117, 200],
          hsl: ["211", "67%", "47%"]
        },
        chart: {
          labelTextColorModifiers: ["brighter", 2]
        },
        startTimestamp: "2020-02-04",
        address: "0xa0b86991c6218b36c1d19d4a2e9eb0ce3606eb48",
        performanceTooltip:
          "APR is calculated proportionally to historical allocations of each lending protocol in the selected time period. This pool has 1% unlent reserve to help reduce gas costs."
      },
      USDT: {
        decimals: 6,
        enabled: true,
        color: {
          hex: "#22a079",
          rgb: [34, 160, 121],
          hsl: ["161", "65%", "38%"]
        },
        chart: {
          labelTextColorModifiers: ["darker", 4]
        },
        startTimestamp: "2020-02-04",
        address: "0xdac17f958d2ee523a2206206994597c13d831ec7",
        performanceTooltip:
          "APR is calculated proportionally to historical allocations of each lending protocol in the selected time period. This pool has 1% unlent reserve to help reduce gas costs."
      },
      TUSD: {
        decimals: 18,
        enabled: true,
        color: {
          hex: "0340a1",
          rgb: [3, 64, 161],
          hsl: ["217", "96%", "32%"]
        },
        chart: {
          labelTextColorModifiers: ["brighter", 5]
        },
        startTimestamp: "2020-06-22",
        address: "0x0000000000085d4780b73119b644ae5ecd22b376"
      },
      SUSD: {
        decimals: 18,
        enabled: true,
        color: {
          hex: "#1e1a31",
          rgb: [30, 26, 49],
          hsl: ["250", "31%", "15%"]
        },
        chart: {
          labelTextColorModifiers: ["brighter", 5]
        },
        startTimestamp: "2020-06-22",
        address: "0x57ab1ec28d129707052df4df418d58a2d46d5f51"
      },
      WBTC: {
        decimals: 8,
        enabled: true,
        color: {
          hex: "#eb9444",
          rgb: [235, 148, 68],
          hsl: ["29", "81%", "59%"]
        },
        startTimestamp: "2020-06-15",
        conversionRateField: "wbtcDAIPrice",
        chart: {
          labelTextColorModifiers: ["darker", 4]
        },
        address: "0x2260fac5e5542a773aa44fbcfedf7c193bc2c599",
        performanceTooltip:
          "APR is calculated proportionally to historical allocations of each lending protocol in the selected time period. This pool has 1% unlent reserve to help reduce gas costs."
      },
      WETH: {
        decimals: 18,
        enabled: true,
        color: {
          hex: "#ee1f79",
          rgb: [238, 31, 121],
          hsl: ["334", "86%", "53%"]
        },
        startTimestamp: "2021-02-16",
        conversionRateField: "wethDAIPrice",
        chart: {
          labelTextColorModifiers: ["darker", 4]
        },
        address: "0xc02aaa39b223fe8d0a0e5c4f27ead9083c756cc2",
        performanceTooltip:
          "APR is calculated proportionally to historical allocations of each lending protocol in the selected time period. This pool has 1% unlent reserve to help reduce gas costs."
      },
      COMP: {
        decimals: 18,
        enabled: true,
        color: {
          hex: "#00d395",
          rgb: [0, 211, 149],
          hsl: ["162", "100%", "41%"]
        },
        startTimestamp: "2020-06-15",
        conversionRateField: "compDAIPrice",
        chart: {
          labelTextColorModifiers: ["darker", 4]
        },
        address: "0xc00e94cb662c3520282e6f5717214004a7f26888"
      },
      stkAAVE: {
        decimals: 18,
        enabled: true,
        color: {
          hex: "#B6509E",
          rgb: [182, 80, 158],
          hsl: ["314", "41%", "51%"]
        },
        startTimestamp: "2021-04-30",
        conversionRateField: "aaveDAIPrice",
        chart: {
          labelTextColorModifiers: ["darker", 4]
        },
        address: "0x4da27a545c0c5b758a6ba100e3a049001de870f5"
      },
      IDLE: {
        decimals: 18,
        enabled: true,
        color: {
          hex: "#0d55bb",
          rgb: [13, 85, 187],
          hsl: ["215", "87%", "39%"]
        },
        startTimestamp: "2020-11-10",
        conversionRateField: "idleDAIPrice",
        chart: {
          labelTextColorModifiers: ["darker", 4]
        },
        address: "0x875773784Af8135eA0ef43b5a374AaD105c5D39e"
      },
      RAI: {
        decimals: 18,
        enabled: true,
        color: {
          hex: "#378879",
          rgb: [55, 136, 121],
          hsl: ["169", "42%", "37%"]
        },
        disabledCharts: ["score"],
        startTimestamp: "2021-11-16",
        icon: "images/tokens/RAI.png",
        conversionRateField: "raiDAIPrice",
        chart: {
          labelTextColorModifiers: ["darker", 4]
        },
        address: "0x03ab458634910aad20ef5f1c8ee96f1d6ac54919"
      },
      FEI: {
        decimals: 18,
        enabled: true,
        color: {
          hex: '#229b6e',
          rgb: [34, 155, 110],
          hsl: ['158', '64%', '37%']
        },
        disabledCharts: ['score'],
        startTimestamp: '2021-09-24',
        conversionRateField: 'feiDAIPrice',
        chart: {
          labelTextColorModifiers: ['darker', 4]
        },
        address: '0x956f47f50a910163d8bf957cf5846d573e7f87ca',
      },
      WMATIC: {
        decimals: 18,
        enabled: true,
        color: {
          hex: '#2891f8',
          rgb: [40, 145, 248],
          hsl: ['210', '94%', '56%']
        },
        startTimestamp: '2021-05-25',
        chart: {
          labelTextColorModifiers: ['darker', 4]
        },
        address: '0x7D1AfA7B718fb893dB30A3aBc0Cfc608AaCfeBB0',
      },
      'idleDAI+idleUSDC+idleUSDT': {
        decimals: 18,
        enabled: false,
        name: 'Curve.fi',
        color: {
          hex: '#ff0000',
          rgb: [255, 0, 0],
          hsl: ['0', '100%', '50%']
        },
        startTimestamp: "2020-06-15"
      }
    },
    protocols: {
      compound: {
        legend: true,
        enabled: true,
        label: "Compound",
        color: {
          rgb: [0, 209, 146],
          hsl: ["162", "100%", "41%"]
        }
      },
      aavev2WithStkAAVE: {
        enabled: true,
        label: "Aave V2 + stkAAVE",
        startTimestamp: "2021-05-08 14:30:00",
        // tokensProps:{
        //   WETH:{
        //     startTimestamp:'2021-05-19 12:20:00',
        //   }
        // },
        color: {
          hex: "#B6509E",
          rgb: [182, 80, 158],
          hsl: ["314", "41%", "51%"]
        },
        rateField: ["rate", "aaveAdditionalAPR"]
      },
      compoundWithCOMP: {
        enabled: true,
        label: "Compound + COMP",
        color: {
          rgb: [0, 153, 107],
          hsl: ["162", "100%", "30%"]
        },
        rateField: ["rate", "compoundAdditionalAPR"]
      },
      fulcrum: {
        legend: false,
        enabled: false,
        label: "Fulcrum",
        color: {
          rgb: [2, 138, 192],
          hsl: ["197", "98%", "38%"]
        }
      },
      dsr: {
        label: "DSR",
        enabled: false,
        icon: "CHAI.png",
        color: {
          rgb: [222, 52, 67],
          hsl: ["355", "72%", "54%"]
        }
      },
      dydx: {
        legend: true,
        label: "DyDx",
        enabled: true,
        color: {
          rgb: [87, 87, 90],
          hsl: ["240", "2%", "35%"]
        }
      },
      iearn: {
        label: "Yearn",
        enabled: true
      },
      aave: {
        label: "Aave V1",
        legend: false,
        enabled: false,
        color: {
          rgb: [230, 131, 206],
          hsl: ["315", "66%", "71%"]
        }
      },
      aavev2: {
        legend: true,
        enabled: true,
        icon: "aave.svg",
        label: "Aave V2",
        color: {
          rgb: [151, 79, 141],
          hsl: ["308", "31%", "45%"]
        }
      },
      cream: {
        legend: false,
        enabled: true,
        label: "Cream",
        icon: "cream.svg",
        color: {
          rgb: [105, 226, 220],
          hsl: ["177", "68%", "65%"]
        }
      },
      lido: {
        legend: false,
        enabled: true,
        label: "Lido",
        icon: "lido.png",
        color: {
          rgb: [0, 163, 255],
          hsl: ['202', '100%', '50%']
        }
      },
      convex: {
        legend: false,
        enabled: true,
        label: "Convex",
        color: {
          rgb: [58, 58, 58],
          hsl: ['0', '0%', '23%']
        }
      },
      mstable: {
        legend: false,
        enabled: true,
        label: "mStable",
        color: {
          rgb: [0, 0, 0],
          hsl: ['0', '0%', '0%']
        }
      },
      fuse: {
        legend: true,
        enabled: true,
        label: "Fuse",
        icon: "fuse.png",
        color: {
          rgb: [0, 0, 0],
          hsl: ["0", "0%", "0%"]
        }
      },
      curve: {
        label: "",
        enabled: true,
        color: {
          rgb: [0, 55, 255],
          hsl: ["227", "100%", "50%"]
        }
      },
      idle: {
        label: "Idle",
        enabled: true,
        color: {
          rgb: [0, 55, 255],
          hsl: ["227", "100%", "50%"]
        }
      }
    }
  },
  contract: {
    methods: {
      refreshIdleSpeed: {
        enabled: true,
        availableNetworks: [1]
      },
      redeem: {
        skipRebalance: true,
        metaTransactionsEnabled: false
      },
      deposit: {
        skipMint: true,
        minAmountForMint: 100000,
        erc20ForwarderEnabled: true,
        skipMintCheckboxEnabled: true,
        metaTransactionsEnabled: false,
        // Proxy contract for Meta Tx or ERC20 Forwarder
        erc20ForwarderProxyContract: {
          forwarder: {
            enabled: true,
            abi: erc20Forwarder,
            name: "erc20Forwarder",
            function: "emitMessage",
            address: "0xfaadbe5f0a19f0ebf92aeb73534cbc96b96e2bda" // Main
            // address:'0xCB3F801C91DEcaaE9b08b1eDb915F9677D8fdB4A' // Kovan
          },
          tokens: {
            DAI: {
              enabled: true,
              permitType: "DAI_Permit",
              abi: IdleDepositForwarder,
              function: "permitAndDeposit", // foo
              name: "IdleDepositForwarderDAI",
              address: "0xDe3c769cCD1878372864375e9f89956806B86daA" // Main
              // address:'0x1E32F1E96B9735E5D31a23e12fe8e6D9845a9072', // Kovan
            },
            USDC: {
              enabled: true,
              abi: IdleDepositForwarder,
              permitType: "EIP2612_Permit",
              name: "IdleDepositForwarderUSDC",
              function: "permitEIP2612AndDeposit", // 'foo'
              address: "0x43bD6a78b37b50E3f52CAcec53F1202dbDe6a761" // Main
              // address:'0x8f9048CFAa27b1A1b77c32a0b87D2DcF5D016cb5', // Kovan
            }
          }
        },
        proxyContract: {
          enabled: false,
          abi: IdleProxyMinter,
          name: "IdleProxyMinter",
          function: "mintIdleTokensProxy",
          address: "0x7C4414aA6B0c6CB1Bc7e5BFb7433138426AC637a"
        }
      },
      migrate: {
        skipRebalance: true,
        minAmountForRebalance: 10000,
        minAmountForRebalanceMetaTx: 10000
      },
      redeemGovTokens: {
        enabled: true
      },
      redeemSkipGov: {
        enabled: true,
        disabledTokens: ["idleDAISafe", "idleUSDCSafe", "idleUSDTSafe"]
      },
      rebalance: {
        enabled: true,
        abi: IdleRebalancerV3
      }
    }
  },
  network: { // Network configurations
    availableNetworks: {
      1: {
        version: 'v1',
        name: 'Ethereum',
        baseToken: 'ETH',
        color: '#4474f1',
        provider: 'infura',
        network: 'mainnet',
        explorer: 'etherscan',
        chainName: 'Ethereum Mainnet',
      },
      42: {
        name: 'Kovan',
        color: '#9064ff',
        baseToken: 'ETH',
        provider: 'infura',
        explorer: 'etherscan',
        chainName: 'Ethereum Testnet Kovan',
      },
      3: {
        name: 'Ropsten',
        color: '#ff4a8d',
        baseToken: 'ETH',
        provider: 'infura',
        explorer: 'etherscan',
        chainName: 'Ethereum Testnet Ropsten',
      },
      4: {
        name: 'Rinkeby',
        color: '#f6c343',
        baseToken: 'ETH',
        provider: 'infura',
        explorer: 'etherscan',
        chainName: 'Ethereum Testnet Rinkeby',
      },
      137: {
        version: 'v1',
        name: 'Polygon',
        color: '#8247E5',
        network: 'mainnet',
        baseToken: 'MATIC',
        explorer: 'polygon',
        provider: 'polygon',
        chainName: 'Matic(Polygon) Mainnet',
      },
      5: {
        name: 'Görli',
        color: '#3099f2',
        baseToken: 'ETH',
        version: 'mumbai',
        network: 'testnet',
        provider: 'infura',
        explorer: 'etherscan',
        chainName: 'Ethereum Testnet Görli',
      },
      1337: {
        name: 'Hardhat',
        baseToken: 'ETH',
        color: '#4474f1',
        provider: 'infura',
        explorer: 'etherscan',
        chainName: 'Ethereum Mainnet',
      },
      80001: {
        name: 'Mumbai',
        color: '#4474f1',
        version: 'mumbai',
        network: 'testnet',
        baseToken: 'MATIC',
        explorer: 'polygon',
        provider: 'polygon',
        chainName: 'Matic Testnet Mumbai',
      }
    },
    isForked: false, // If TRUE the tx confirmation callback is fired on the receipt
    requiredNetwork: 1, // { 1: Mainnet, 3: Ropsten, 42: Kovan }
    blocksPerYear: 2371428,
    secondsPerYear: 31536000,
    requiredConfirmations: 1,
    enabledNetworks: [1, 137],
    firstBlockNumber: 8119247,
    accountBalanceMinimum: 0, // in ETH for gas fees
    providers: {
      infura: {
        key: env.REACT_APP_INFURA_KEY,
        rpc: {
          5: 'https://goerli.infura.io/v3/',
          42: 'https://kovan.infura.io/v3/',
          1: 'https://mainnet.infura.io/v3/',
          1337: 'https://mainnet.infura.io/v3/',
          137: 'https://mainnet.infura.io/v3/',
          80001: 'https://goerli.infura.io/v3/'
        }
      },
      polygon: {
        enabled: true,
        // key:env.REACT_APP_POLYGON_KEY,
        key: env.REACT_APP_INFURA_KEY,
        baseUrl: {
          137: 'https://polygonscan.com',
          80001: 'https://explorer-mumbai.maticvigil.com'
        },
        networkPairs: {
          1: 137,
          137: 1,
          5: 80001,
          80001: 5
        },
        publicRpc: {
          137: 'https://polygon-rpc.com'
        },
        rpc: {
          // 1:'https://rpc-mainnet.maticvigil.com/v1/',
          // 5:'https://rpc-mumbai.maticvigil.com/v1/',
          // 137:'https://rpc-mainnet.maticvigil.com/v1/',
          // 80001:'https://rpc-mumbai.maticvigil.com/v1/'

          1: 'https://polygon-mainnet.infura.io/v3/',
          5: 'https://polygon-mainnet.infura.io/v3/',
          137: 'https://polygon-mainnet.infura.io/v3/',
          80001: 'https://polygon-mainnet.infura.io/v3/'

          // 1:'https://matic-mainnet.chainstacklabs.com/',
          // 137:'https://matic-mainnet.chainstacklabs.com/',
          // 5:'https://matic-mumbai.chainstacklabs.com/',
          // 80001:'https://matic-mumbai.chainstacklabs.com/' 
        }
      },
      nexus: {
        endpoints: {
          1: "https://api.nexusmutual.io/v1/",
          42: "https://api.staging.nexusmutual.io/v1/"
        }
      },
      ens: {
        enabled: true,
        supportedNetworks: [1]
      },
      covalent: {
        enabled: true,
        key: env.REACT_APP_COVALENT_KEY,
        endpoints: {
          137: 'https://api.covalenthq.com/v1/137/',
          80001: 'https://api.covalenthq.com/v1/80001/'
        }
      },
      etherscan: {
        enabled: true, // False for empty txs list (try new wallet)
        keys: [
          env.REACT_APP_ETHERSCAN_KEY,
          env.REACT_APP_ETHERSCAN_KEY2,
          env.REACT_APP_ETHERSCAN_KEY3,
          env.REACT_APP_ETHERSCAN_KEY4
        ],
        endpoints: {
          1: 'https://api.etherscan.io/api',
          1337: 'https://api.etherscan.io/api',
          5: 'https://api-goerli.etherscan.io/api',
          42: 'https://api-kovan.etherscan.io/api'
        },
        baseUrl: {
          1: 'https://etherscan.io',
          1337: 'https://etherscan.io',
          5: 'https://goerli.etherscan.io',
          42: 'https://kovan.etherscan.io',
        }
      },
      subgraph: {
        tranches:{
          enabled:true,
          endpoint:"https://api.thegraph.com/subgraphs/name/samster91/idle-tranches",
          entities:{
            trancheInfos:[
              'id',
              'apr',
              'timeStamp',
              'blockNumber',
              'totalSupply',
              'virtualPrice',
              'contractValue',
            ]
          }
        }
      },
      snapshot: {
        whitelist: [
          "0x9993ADB62085AcB05Fc493f7A1D10C11227A78fa",
          "0xf12ce5807e3d3128B876aa1Cec0632D63547E22E"
        ],
        endpoints: {
          proposals: "https://hub.snapshot.org/graphql"
        },
        urls: {
          proposals: "https://signal.idle.finance/#/idlefinance.eth/proposal/"
        },
        queries: {
          proposals: `query Proposals {
            proposals (
            first: 20,
            skip: 0,
            where: {
            space_in: ["idlefinance.eth"]
            },
            orderBy: "created",
            orderDirection: desc
            ) {
            id
            ipfs
            strategies{
              params
            }
            title
            body
            choices
            start
            end
            snapshot
            state
            author
            space {
            id
            name
            }
            }
            }`,
          proposalsActive: `query Proposals {
              proposals (
              first: 20,
              skip: 0,
              where: {
              space_in: ["idlefinance.eth"],
              state:"active"
              },
              orderBy: "created",
              orderDirection: desc
              ) {
              id
              ipfs
              strategies{
                params
              }
              title
              body
              choices
              start
              end
              snapshot
              state
              author
              space {
              id
              name
              }
              }
              }`
        }
      },
      biconomy: {
        enabled: true,
        enableLogin: false,
        supportedNetworks: [1, 42],
        disabledWallets: ["authereum","gnosis"],
        endpoints: {
          limits: "https://api.biconomy.io/api/v1/dapp/checkLimits"
        },
        params: {
          debug: false,
          apiKey: env.REACT_APP_BICONOMY_KEY, // Mainnet
          dappId: env.REACT_APP_BICONOMY_APPID,
          apiId: "36572ec9-ae5c-4c4a-9530-f3ae7c7ac829"
          // apiKey: env.REACT_APP_BICONOMY_KEY_KOVAN, // Kovan
        }
      },
      simpleID: {
        enabled: false,
        supportedNetworks: [1],
        getNetwork: (networkId, availableNetworks) => {
          let networkName = null;
          switch (networkId) {
            case 1:
              networkName = "mainnet";
              break;
            default:
              networkName = availableNetworks[networkId]
                ? availableNetworks[networkId].toLowerCase()
                : "mainnet";
              break;
          }
          return networkName;
        },
        params: {
          appOrigin: window.location.origin,
          appName: "Idle",
          appId: "eb4d1754-a76e-4c58-8422-54b5ca2395e7",
          renderNotifications: false,
          network: "mainnet"
        }
      }
    }
  },
  events: {
    DAI: {
      fields: {
        to: "dst",
        from: "src",
        value: "wad"
      }
    },
    FEI: {
      fields: {
        to: "dst",
        from: "src",
        value: "wad"
      }
    }
  },
  notifications: [
    {
      enabled: false,
      end: 1612282726374,
      start: 1611677841027,
      date: "Jan 26, 2021 16:18 UTC",
      title: "Cover Protocol Available",
      hash: "/dashboard/tools/cover-protocol",
      image: "/images/protocols/cover-logo.svg",
      text: "Protect your portfolio with Cover Protocol"
    }
  ],
  tools: {
    stake: {
      enabled: true,
      icon: "Layers",
      label: "Staking",
      route: "staking",
      subComponent: Staking,
      availableNetworks: [1],
      desc: "Stake your IDLE / Sushi Swap LP tokens and earn $IDLE rewards",
      props: {
        availableTokens: {
          IDLE: {
            component: IdleStaking,
            contract: {
              abi: stkIDLE,
              decimals: 18,
              name: "stkIDLE",
              fromBlock: 12561464,
              rewardToken: "IDLE",
              address: "0xaac13a116ea7016689993193fce4badc8038136f" // Mainnet
            },
            feeDistributor: {
              fromBlock: 12649361,
              abi: StakingFeeDistributor,
              name: "StakingFeeDistributor",
              address: "0xbabb82456c013fd7e3f25857e0729de8207f80e2" // Mainnet
            },
            abi: IDLE,
            name: "IDLE",
            token: "IDLE",
            decimals: 18,
            enabled: true,
            label: "IDLE",
            icon: "images/tokens/IDLE.svg",
            address: "0x875773784Af8135eA0ef43b5a374AaD105c5D39e", // Mainnet
            poolLink:
              "https://etherscan.com/address/0x875773784Af8135eA0ef43b5a374AaD105c5D39e"
          },
          SLP: {
            component: LpStaking,
            contract: {
              decimals: 24,
              name: "LpStaking",
              maxMultiplier: 3,
              abi: LpStakingAbi,
              maxBonusDays: 120,
              rewardToken: "IDLE",
              address: "0xcc0b9f7ed0e6bc7c2e69dbd247e8420f29aeb48d" // Mainnet
            },
            name: "SLP",
            token: "SLP",
            decimals: 18,
            enabled: true,
            abi: SushiLiquidityPool,
            label: "SushiSwap IDLE/ETH LP Token",
            icon: "images/protocols/sushiswap.png",
            address: "0xa7f11e026a0af768d285360a855f2bded3047530", // Mainnet
            poolLink:
              "https://analytics.sushi.com/pairs/0xa7f11e026a0af768d285360a855f2bded3047530"
          }
        }
      }
    },
    stakePolygon: {
      enabled: true,
      icon: "Layers",
      label: "Staking",
      subComponent: Staking,
      availableNetworks: [137],
      route: "staking-polygon",
      desc: "Stake your Sushi Swap LP tokens and earn $IDLE rewards",
      props: {
        availableTokens: {
          SLP: {
            component: LpStaking,
            contract: {
              decimals: 24,
              name: "LpStaking",
              maxMultiplier: 3,
              abi: LpStakingAbi,
              maxBonusDays: 60,
              rewardToken: "IDLE",
              address: "0x59CDF902b6A964CD5dB04d28f12b774bFB876Be9" // Polygon
            },
            name: "SLP",
            token: "SLP",
            decimals: 18,
            enabled: true,
            abi: SushiLiquidityPool,
            label: "SushiSwap IDLE/WETH LP Token",
            icon: "images/protocols/sushiswap.png",
            address: "0x5518a3af961eee8771657050c5cb23d2b3e2f6ee", // Polygon
            poolLink: "https://analytics-polygon.sushi.com/pairs/0x5518a3af961eee8771657050c5cb23d2b3e2f6ee"
          }
        }
      }
    },
    nexusMutual: {
      enabled: true,
      icon: "Security",
      route: "coverage",
      label: "Coverage",
      availableNetworks: [1],
      desc: "Buy Nexus Mutual coverage without KYC for your deposits",
      subComponent: NexusMutual,
      props: {
        availableTokens: {
          idleDAIYield: {
            decimals: 18,
            abi: IdleTokenV4,
            name: "idleDAIYield",
            token: "idleDAIYield", // Mainnet
            // token:'idleDAIYieldMock', // Kovan
            address: "0x0000000000000000000000000000000000000011",
            realAddress: "0x3fe7940616e5bc47b0775a0dccf6237893353bb4", // Mainnet
            // realAddress:'0xbd0b0205408509544815d377214d8f2cbe3e5381', // Kovan
            underlying: {
              DAI: {
                abi: ERC20,
                name: "DAI", // Mainnet
                token: "DAI",
                decimals: 18,
                // name:'DAIMock', // Kovan
                address: "0x6b175474e89094c44da98b954eedeac495271d0f" // Mainnet
                // address:'0x5C422252C6a47CdacF667521566Bf7bD5b0d769B' // Kovan
              }
            }
          },
          idleUSDTYield: {
            decimals: 18,
            abi: IdleTokenV4,
            name: "idleUSDTYield",
            token: "idleUSDTYield", // Mainnet
            // token:'idleUSDTYieldMock', // Kovan
            address: "0x0000000000000000000000000000000000000012",
            realAddress: "0xF34842d05A1c888Ca02769A633DF37177415C2f8",
            underlying: {
              DAI: {
                abi: ERC20,
                name: "DAI", // Mainnet
                token: "DAI",
                decimals: 18,
                // name:'DAIMock', // Kovan
                address: "0x6b175474e89094c44da98b954eedeac495271d0f" // Mainnet
                // address:'0x5C422252C6a47CdacF667521566Bf7bD5b0d769B' // Kovan
              }
            }
          }
        }
      },
      directProps: {
        // startBlock:25858186, // Kovan
        startBlock: 12783137, // Mainnet
        // Yield token covers have a 14 days grace period
        yieldTokenCoverGracePeriod: 14 * 24 * 60 * 60 * 1000,
        contractInfo: {
          abi: NexusMutualDistributor,
          name: "NexusMutualDistributor",
          // address:'0xe2d569dc064b3b91f514e775c6026e04d2c887a9' // Kovan
          address: "0xf2b36f823eae36e53a5408d8bd452748b24fbf76" // Mainnet
        },
        incidentsInfo: {
          abi: NexusMutualIncidents,
          name: "NexusMutualIncidents",
          // address:'0x322f9a880189E3FFFf59b74644e13e5763C5AdB9' // Kovan
          address: "0x8ceba69a8e96a4ce71aa65859dbdb180b489a719" // Mainnet
        }
      }
    },
    b2bVesting: {
      enabled: true,
      visible: true,
      icon: "CloudUpload",
      label: "B2B Vesting",
      availableNetworks: [1],
      route: "b2b-vesting-contract",
      subComponent: DeployB2BVesting,
      desc: 'Deploy/Deposit/Claim for B2B Vesting Contracts<br /><small style="color:#ff9900">(only for partners that joined the B2B Affiliate program)</small>',
      props: {
        contracts: {
          vesterImplementation: {
            abi: B2BVester,
            address: "0x3024656ae91d7bf724f613c314bc56030ba2344c"
          }
        }
      }
    },
    polygonBridge: {
      enabled: true,
      route: 'polygon-bridge',
      availableNetworks: [1, 137],
      subComponent: PolygonBridge,
      image: 'images/protocols/polygon.svg',
      label: 'Ethereum ⇔ Polygon Bridge',
      desc: 'Transfer your tokens from Ethereum to Polygon and vice versa with Plasma and PoS Bridge.',
      props: {
        contracts: {
          ERC20Predicate: {
            abi: ERC20Predicate,
            name: 'ERC20Predicate',
            // address:'0xdD6596F2029e6233DEFfaCa316e6A95217d4Dc34', // Goerli
            address: '0x40ec5B33f54e0E8A33A975908C5BA1c14e5BbbDf' // Mainnet
          },
          EtherPredicate: {
            abi: EtherPredicate,
            name: 'EtherPredicate',
            // address:'0xdD6596F2029e6233DEFfaCa316e6A95217d4Dc34', // Goerli
            address: '0x8484Ef722627bf18ca5Ae6BcF031c23E6e922B30' // Mainnet
          },
          DepositManager: {
            abi: DepositManager,
            name: 'DepositManager',
            address: '0x401f6c983ea34274ec46f84d70b31c151321188b'
          },
          RootChainManager: {
            name: 'RootChainManager',
            address: '0xA0c68C638235ee32657e8f720a23ceC1bFc77C77' // Mainnet
          },
          StateSender: {
            name: 'StateSender',
            address: '0x28e4F3a7f651294B9564800b2D01f35189A5bFbE'
          }
        },
        availableTokens: {
          /*
          DERC20:{
            decimals:18,
            enabled:true,
            name:'DERC20',
            token:'DERC20',
            rootToken:{
              name:'DERC20',
              abi:DummyERC20,
              address:'0x655F2166b0709cd575202630952D71E2bB0d61Af' // Goerli
            },
            childToken:{
              abi:ChildERC20,
              name:'DummyERC20',
              address:'0xfe4F5145f6e09952a5ba9e956ED0C25e3Fa4c7F1' // Mumbai
            }
          },
          */
          MATIC: {
            name: 'MATIC',
            token: 'MATIC',
            decimals: 18,
            enabled: true,
            sendValue: true,
            bridgeType: 'plasma',
            rootToken: {
              abi: ERC20,
              name: 'MATIC',
              address: '0x7D1AfA7B718fb893dB30A3aBc0Cfc608AaCfeBB0', // Mainnet
            },
            childToken: {
              abi: ChildERC20,
              name: 'childMATIC',
              address: '0x0000000000000000000000000000000000001010' // Matic
            }
          },
          WETH: {
            name: 'WETH',
            token: 'ETH',
            decimals: 18,
            enabled: true,
            bridgeType: 'pos',
            childToken: {
              abi: ChildERC20,
              name: 'maticWETH',
              address: '0x7ceB23fD6bC0adD59E62ac25578270cFf1b9f619' // Matic
            }
          },
          /*
          WETH:{
            name:'WETH',
            token:'WETH',
            decimals:18,
            enabled:true,
            sendValue:false,
            bridgeType:'pos',
            rootToken:{
              abi:ERC20,
              name:'WETH',
              address:'0xc02aaa39b223fe8d0a0e5c4f27ead9083c756cc2', // Mainnet
            },
            childToken:{
              abi:ChildERC20,
              name:'childWETH',
              address:'0x7ceB23fD6bC0adD59E62ac25578270cFf1b9f619' // Matic
            }
          },
          */
          DAI: {
            name: 'DAI',
            token: 'DAI',
            decimals: 18,
            enabled: true,
            sendValue: false,
            bridgeType: 'pos',
            rootToken: {
              abi: DAI,
              name: 'DAI',
              // address:'0x6311344B50D2077BF9804d376EA4C2cEDcB75C1f', // Goerli
              address: '0x6b175474e89094c44da98b954eedeac495271d0f', // Mainnet
            },
            childToken: {
              abi: ChildERC20,
              name: 'childDAI',
              // address:'0x001B3B4d0F3714Ca98ba10F6042DaEbF0B1B7b6F', // Mumbai
              address: '0x8f3Cf7ad23Cd3CaDbD9735AFf958023239c6A063' // Matic
            }
          },
          USDC: {
            decimals: 6,
            name: 'USDC',
            token: 'USDC',
            enabled: true,
            bridgeType: 'pos',
            rootToken: {
              abi: USDC,
              name: 'USDC',
              // address:'0x98339D8C260052B7ad81c28c16C0b98420f2B46a' // Goerli
              address: '0xA0b86991c6218b36c1d19D4a2e9Eb0cE3606eB48', // Mainnet
            },
            childToken: {
              abi: ChildERC20,
              name: 'childUSDC',
              // address:'0x6D4dd09982853F08d9966aC3cA4Eb5885F16f2b2' // Mubai
              address: '0x2791Bca1f2de4661ED88A30C99A7a9449Aa84174' // Matic
            }
          },
          IDLE: {
            decimals: 18,
            name: 'IDLE',
            token: 'IDLE',
            enabled: true,
            bridgeType: 'pos',
            rootToken: {
              abi: IDLE,
              name: 'IDLE',
              address: '0x875773784Af8135eA0ef43b5a374AaD105c5D39e', // Mainnet
            },
            childToken: {
              abi: ChildERC20,
              name: 'childUSDC',
              address: '0xc25351811983818c9fe6d8c580531819c8ade90f' // Matic
            }
          },
          /*
          AAVE:{
            decimals:18,
            name:'AAVE',
            token:'AAVE',
            enabled:true,
            bridgeType:'pos',
            rootToken:{
              abi:ERC20,
              name:'AAVE',
              address:'0x7fc66500c84a76ad7e9c93437bfc5ac33e2ddae9', // Mainnet
            },
            childToken:{
              abi:ChildERC20,
              name:'childAAVE',
              address:'0xD6DF932A45C0f255f85145f286eA0b292B21C90B' // Matic
            }
          }
          */
        }
      }
    },
    ethWrapper: {
      enabled: true,
      label: 'ETH Wrapper',
      route: 'eth-wrapper',
      availableNetworks: [1, 42],
      subComponent: TokenWrapper,
      image: 'images/tokens/WETH.svg',
      desc: 'Wrap your ETH and get WETH. Unwrap your WETH and get back ETH.',
      props: {
        startContract: {
          name: 'ETH',
          token: 'ETH',
          decimals: 18,
          wrapMethod: 'deposit',
        },
        destContract: {
          abi: WETH,
          name: 'WETH',
          decimals: 18,
          token: 'WETH',
          unwrapMethod: 'withdraw',
          address: '0xc02aaa39b223fe8d0a0e5c4f27ead9083c756cc2'
        },
      }
    },
    coverProtocol: {
      enabled: false,
      availableNetworks: [1],
      label: 'Cover Protocol',
      route: 'cover-protocol',
      subComponent: CoverProtocol,
      image: 'images/protocols/cover-logo.svg',
      desc: 'Get your Idle Portfolio covered against Smart Contract risk',
      fileClaimUrl: 'https://app.coverprotocol.com/app/claims/new?protocol=IDLE',
      props: {
        contract: {
          decimals: 18,
          abi: CoverMint,
          name: 'CoverMint',
          address: '0x46f2f34742c1d9b9b220aabf0ff26bf59ec9f8a0'
        },
        coverages: [
          {
            collateral: "DAI",
            expirationTimestamp: 1714470400,
            tokens: {
              Claim: {
                abi: CovToken,
                name: "COVER_IDLE_2021_02_28_DAI_0_CLAIM",
                address: "0xa7dac6774e5e40f56a0bf06af6cf9b1f3d037bcc",
                balancerPool: {
                  decimals: 18,
                  abi: BalancerPool,
                  name: "BAL_COVER_IDLE_2021_02_28_DAI_0_CLAIM",
                  address: "0xeb2b9959c7943eb3c0bdb69ede25247bab4d1c6c"
                }
              },
              NoClaim: {
                abi: CovToken,
                name: "COVER_IDLE_2021_02_28_DAI_0_NOCLAIM",
                address: "0x53df0bfa014b7522299c129c5a7b318f02adb469",
                balancerPool: {
                  decimals: 18,
                  abi: BalancerPool,
                  name: "BAL_COVER_IDLE_2021_02_28_DAI_0_NOCLAIM",
                  address: "0xce0e9e7a1163badb7ee79cfe96b5148e178cab73"
                }
              }
            }
          }
        ]
      }
    },
    batchDeposit: {
      enabled: true,
      icon: "Storage",
      claimEnabled: true,
      depositEnabled: true,
      availableNetworks: [1],
      route: "batch-deposit",
      label: "Batch Deposit",
      subComponent: BatchDeposit,
      desc: "Deposit your tokens in the batch and wait until its execution to claim your Idle Tokens V4",
      props: {
        availableTokens: {
          idleDAIYield: {
            decimals: 18,
            strategy: "best",
            baseToken: "DAI",
            minPoolSize: 20000,
            migrationContract: {
              abi: IdleBatchedMint,
              name: "IdleBatchedMintDAI",
              address: "0x633fb4d38B24dC890b11Db2AE2B248D13F996A79", // Main
              // address:'0x1B7bA0361A15CCF62521cF7d2Cbb2Ba90b1521a7', // Kovan
              functions: [
                {
                  name: "deposit",
                  usePermit: true,
                  label: "Deposit",
                  permitName: "permitAndDeposit"
                }
              ]
            }
          },
          idleUSDCYield: {
            decimals: 6,
            strategy: "best",
            baseToken: "USDC",
            minPoolSize: 20000,
            migrationContract: {
              abi: IdleBatchedMint,
              name: "IdleBatchedMintUSDC",
              address: "0x562C4fd96F0652F5Fcfa96b0a33088B5a6eAeE9B", // Main
              // address:'0x3F35eB839f91b614195a47A593dB46b14cd7EaF8', // Kovan
              functions: [
                {
                  name: "deposit",
                  label: "Deposit",
                  usePermit: true,
                  permitName: "permitEIP2612AndDepositUnlimited"
                }
              ]
            }
          }
        }
      }
    },
    batchMigration: {
      enabled: true,
      claimEnabled: true,
      icon: "FileDownload",
      depositEnabled: false,
      availableNetworks: [1],
      route: "batch-migration",
      label: "Batch Migration",
      subComponent: BatchMigration,
      desc: "Deposit your Idle Tokens V3 into a batch and wait until its conversion to the Idle Token V4",
      props: {
        availableTokens: {
          idleDAIYield: {
            decimals: 18,
            abi: IdleTokenV3,
            strategy: "best",
            baseToken: "DAI",
            name: "idleDAIYieldV3",
            token: "idleDAIYieldV3",
            address: "0x78751b12da02728f467a44eac40f5cbc16bd7934",
            migrationContract: {
              abi: IdleBatchConverter,
              name: "IdleBatchConverterDAI",
              address: "0xe0BfD08dA4DAf8f8BA11d1c3802009E75f963497",
              functions: [
                {
                  label: "Deposit",
                  name: "deposit"
                }
              ]
            }
          },
          idleUSDCYield: {
            decimals: 18,
            abi: IdleTokenV3,
            strategy: "best",
            baseToken: "USDC",
            name: "idleUSDCYieldV3",
            token: "idleUSDCYieldV3",
            address: "0x12B98C621E8754Ae70d0fDbBC73D6208bC3e3cA6",
            migrationContract: {
              abi: IdleBatchConverter,
              name: "IdleBatchConverterUSDC",
              address: "0x86c8b56d124c2a8e7ea8a9e6a7f8ed99dde5cca8",
              functions: [
                {
                  label: "Deposit",
                  name: "deposit"
                }
              ]
            }
          },
          idleUSDTYield: {
            decimals: 18,
            abi: IdleTokenV3,
            strategy: "best",
            baseToken: "USDT",
            name: "idleUSDTYieldV3",
            token: "idleUSDTYieldV3",
            address: "0x63D27B3DA94A9E871222CB0A32232674B02D2f2D",
            migrationContract: {
              abi: IdleBatchConverter,
              name: "IdleBatchConverterUSDT",
              address: "0xee5c50c7c49dec47dde2f9b0233b9e14a8f00cf2",
              functions: [
                {
                  label: "Deposit",
                  name: "deposit"
                }
              ]
            }
          },
          idleSUSDYield: {
            decimals: 18,
            abi: IdleTokenV3,
            strategy: "best",
            baseToken: "SUSD",
            name: "idleSUSDYieldV3",
            token: "idleSUSDYieldV3",
            address: "0xe79e177d2a5c7085027d7c64c8f271c81430fc9b",
            migrationContract: {
              abi: IdleBatchConverter,
              name: "IdleBatchConverterSUSD",
              address: "0xE2eE519399a49f1A2004a25DA61e82867A69b9b1",
              functions: [
                {
                  label: "Deposit",
                  name: "deposit"
                }
              ]
            }
          },
          idleTUSDYield: {
            decimals: 18,
            abi: IdleTokenV3,
            strategy: "best",
            baseToken: "TUSD",
            name: "idleTUSDYieldV3",
            token: "idleTUSDYieldV3",
            address: "0x51C77689A9c2e8cCBEcD4eC9770a1fA5fA83EeF1",
            migrationContract: {
              abi: IdleBatchConverter,
              name: "IdleBatchConverterTUSD",
              address: "0x174a273f0ea28e55b6dd13259aa43d262b863a86",
              functions: [
                {
                  label: "Deposit",
                  name: "deposit"
                }
              ]
            }
          },
          idleWBTCYield: {
            decimals: 18,
            abi: IdleTokenV3,
            strategy: "best",
            baseToken: "WBTC",
            name: "idleWBTCYieldV3",
            token: "idleWBTCYieldV3",
            address: "0xD6f279B7ccBCD70F8be439d25B9Df93AEb60eC55",
            migrationContract: {
              abi: IdleBatchConverter,
              name: "IdleBatchConverterWBTC",
              address: "0xbfDC7d97559173B52EF2A2f1bC9BeCf97B0D401D",
              functions: [
                {
                  label: "Deposit",
                  name: "deposit"
                }
              ]
            }
          },
          idleDAISafe: {
            decimals: 18,
            abi: IdleTokenV3,
            strategy: "risk",
            baseToken: "DAI",
            name: "idleDAISafeV3",
            token: "idleDAISafeV3",
            address: "0x1846bdfDB6A0f5c473dEc610144513bd071999fB",
            migrationContract: {
              abi: IdleBatchConverter,
              name: "IdleBatchConverterDAISafe",
              address: "0x08db226d63cE724A6091Ba82D28dFc76ceCa23d8",
              functions: [
                {
                  label: "Deposit",
                  name: "deposit"
                }
              ]
            }
          },
          idleUSDCSafe: {
            decimals: 18,
            abi: IdleTokenV3,
            strategy: "risk",
            baseToken: "USDC",
            name: "idleUSDCSafeV3",
            token: "idleUSDCSafeV3",
            address: "0xcDdB1Bceb7a1979C6caa0229820707429dd3Ec6C",
            migrationContract: {
              abi: IdleBatchConverter,
              name: "IdleBatchConverterUSDCSafe",
              address: "0xA6C89A31D59f9C68D9Cba28d690C5E52058fb472",
              functions: [
                {
                  label: "Deposit",
                  name: "deposit"
                }
              ]
            }
          },
          idleUSDTSafe: {
            decimals: 18,
            abi: IdleTokenV3,
            strategy: "risk",
            baseToken: "USDT",
            name: "idleUSDTSafeV3",
            token: "idleUSDTSafeV3",
            address: "0x42740698959761baf1b06baa51efbd88cb1d862b",
            migrationContract: {
              abi: IdleBatchConverter,
              name: "IdleBatchConverterUSDTSafe",
              address: "0xd47B96Fb33b79a4Dd81a2bfa676eBB669166f619",
              functions: [
                {
                  label: "Deposit",
                  name: "deposit"
                }
              ]
            }
          }
        }
      }
    },
    tokenMigration: {
      enabled: true,
      icon: "SwapHoriz",
      route: "convert",
      availableNetworks: [1],
      label: "Token Migration",
      desc: "Easily convert your Compound, Fulcrum, Aave and iEarn tokens into Idle",
      subComponent: TokenMigration,
      props: {
        migrationContract: {
          name: "IdleConverterV4",
          abi: IdleConverterPersonalSignV4,
          address: "0xa55caa40b32a02becfad1d0d29c4f1cf38c4c743",
          oldAddresses: [],
          functions: [
            {
              label: "Migrate",
              name: "migrateFromToIdle"
            }
          ]
        },
        availableStrategies: ["best", "risk"],
        availableTokens: {
          idleDAIv2: {
            decimals: 18,
            enabled: true,
            protocol: "idle",
            baseToken: "DAI",
            abi: IdleTokenV2,
            token: "idleDAIOld",
            icon: "images/tokens/idleDAI.svg",
            migrateFunction: "migrateFromToIdle",
            address: "0x10eC0D497824e342bCB0EDcE00959142aAa766dD"
          },
          cDAI: {
            decimals: 8,
            enabled: true,
            token: "cDAI",
            baseToken: "DAI",
            protocol: "compound",
            migrateFunction: "migrateFromCompoundToIdle",
            address: "0x5d3a536E4D6DbD6114cc1Ead35777bAB948E3643"
          },
          iDAI: {
            decimals: 18,
            enabled: false,
            token: "iDAI",
            baseToken: "DAI",
            protocol: "fulcrum",
            migrateFunction: "migrateFromFulcrumToIdle",
            address: "0x493c57c4763932315a328269e1adad09653b9081"
          },
          aDAI: {
            decimals: 18,
            enabled: true,
            token: "aDAI",
            protocol: "aave",
            baseToken: "DAI",
            migrateFunction: "migrateFromAaveToIdle",
            address: "0xfC1E690f61EFd961294b3e1Ce3313fBD8aa4f85d"
          },
          yDAIv3: {
            decimals: 18,
            enabled: true,
            token: "yDAIv3",
            abi: yDAIv3.abi,
            baseToken: "DAI",
            protocol: "iearn",
            icon: "images/tokens/yDAI.png",
            migrateFunction: "migrateFromIearnToIdle",
            address: "0xC2cB1040220768554cf699b0d863A3cd4324ce32"
          },
          yDAIv2: {
            decimals: 18,
            enabled: true,
            token: "yDAIv2",
            baseToken: "DAI",
            abi: yDAIv3.abi,
            protocol: "iearn",
            icon: "images/tokens/yDAI.png",
            migrateFunction: "migrateFromIearnToIdle",
            address: "0x16de59092dAE5CcF4A1E6439D611fd0653f0Bd01"
          },
          idleUSDCv2: {
            decimals: 18,
            enabled: true,
            protocol: "idle",
            abi: IdleTokenV2,
            baseToken: "USDC",
            token: "idleUSDCOld",
            icon: "images/tokens/idleUSDC.svg",
            migrateFunction: "migrateFromToIdle",
            address: "0xeB66ACc3d011056B00ea521F8203580C2E5d3991"
          },
          cUSDC: {
            decimals: 8,
            enabled: true,
            token: "cUSDC",
            baseToken: "USDC",
            protocol: "compound",
            migrateFunction: "migrateFromCompoundToIdle",
            address: "0x39aa39c021dfbae8fac545936693ac917d5e7563"
          },
          iUSDC: {
            decimals: 6,
            enabled: false,
            token: "iUSDC",
            baseToken: "USDC",
            protocol: "fulcrum",
            migrateFunction: "migrateFromFulcrumToIdle",
            address: "0xf013406a0b1d544238083df0b93ad0d2cbe0f65f"
          },
          aUSDC: {
            decimals: 6,
            enabled: true,
            token: "aUSDC",
            protocol: "aave",
            baseToken: "USDC",
            migrateFunction: "migrateFromAaveToIdle",
            address: "0x9bA00D6856a4eDF4665BcA2C2309936572473B7E"
          },
          yUSDCv3: {
            decimals: 6,
            enabled: true,
            token: "yUSDCv3",
            protocol: "iearn",
            abi: yUSDCv3.abi,
            baseToken: "USDC",
            icon: "images/tokens/yUSDC.png",
            migrateFunction: "migrateFromIearnToIdle",
            address: "0x26EA744E5B887E5205727f55dFBE8685e3b21951"
          },
          yUSDCv2: {
            decimals: 6,
            enabled: true,
            token: "yUSDCv2",
            protocol: "iearn",
            abi: yUSDCv3.abi,
            baseToken: "USDC",
            icon: "images/tokens/yUSDC.png",
            migrateFunction: "migrateFromIearnToIdle",
            address: "0xd6aD7a6750A7593E092a9B218d66C0A814a3436e"
          },
          cUSDT: {
            decimals: 8,
            enabled: true,
            token: "cUSDT",
            baseToken: "USDT",
            protocol: "compound",
            migrateFunction: "migrateFromCompoundToIdle",
            address: "0xf650c3d88d12db855b8bf7d11be6c55a4e07dcc9"
          },
          iUSDT: {
            decimals: 6,
            enabled: false,
            token: "iUSDT",
            baseToken: "USDT",
            protocol: "fulcrum",
            migrateFunction: "migrateFromFulcrumToIdle",
            address: "0x8326645f3aa6de6420102fdb7da9e3a91855045b"
          },
          aUSDT: {
            decimals: 6,
            enabled: true,
            token: "aUSDT",
            protocol: "aave",
            baseToken: "USDT",
            migrateFunction: "migrateFromAaveToIdle",
            address: "0x71fc860F7D3A592A4a98740e39dB31d25db65ae8"
          },
          yUSDTv3: {
            decimals: 6,
            enabled: true,
            token: "yUSDTv3",
            abi: yUSDTv3.abi,
            protocol: "iearn",
            baseToken: "USDT",
            icon: "images/tokens/yUSDT.png",
            migrateFunction: "migrateFromIearnToIdle",
            address: "0xE6354ed5bC4b393a5Aad09f21c46E101e692d447"
          },
          yUSDTv2: {
            decimals: 6,
            enabled: true,
            token: "yUSDTv2",
            abi: yUSDTv3.abi,
            protocol: "iearn",
            baseToken: "USDT",
            icon: "images/tokens/yUSDT.png",
            migrateFunction: "migrateFromIearnToIdle",
            address: "0x83f798e925BcD4017Eb265844FDDAbb448f1707D"
          },
          idleSUSDv2: {
            decimals: 18,
            enabled: true,
            abi: IdleTokenV2,
            protocol: "idle",
            baseToken: "SUSD",
            token: "idleSUSDYieldOld",
            availableStrategies: ["best"],
            migrateFunction: "migrateFromToIdle",
            icon: "images/tokens/idleSUSDYield.svg",
            address: "0xb39ca0261a1b2986a6a9Fe38d344B56374963dE5"
          },
          aSUSD: {
            decimals: 6,
            enabled: true,
            token: "aSUSD",
            protocol: "aave",
            baseToken: "SUSD",
            migrateFunction: "migrateFromAaveToIdle",
            address: "0x625aE63000f46200499120B906716420bd059240"
          },
          ySUSDv3: {
            decimals: 18,
            enabled: true,
            token: "ySUSDv3",
            abi: ySUSDv3,
            baseToken: "SUSD",
            protocol: "iearn",
            availableStrategies: ["best"],
            icon: "images/tokens/ySUSDv3.png",
            migrateFunction: "migrateFromIearnToIdle",
            address: "0xf61718057901f84c4eec4339ef8f0d86d2b45600"
          },
          idleTUSDv2: {
            decimals: 18,
            enabled: true,
            abi: IdleTokenV2,
            protocol: "idle",
            baseToken: "TUSD",
            token: "idleTUSDYieldOld",
            availableStrategies: ["best"],
            migrateFunction: "migrateFromToIdle",
            icon: "images/tokens/idleTUSDYield.svg",
            address: "0x7DB7A4a50b26602E56536189Aa94678C80F8E5b6"
          },
          aTUSD: {
            decimals: 6,
            enabled: true,
            token: "aTUSD",
            protocol: "aave",
            baseToken: "TUSD",
            migrateFunction: "migrateFromAaveToIdle",
            address: "0x4DA9b813057D04BAef4e5800E36083717b4a0341"
          },
          yTUSDv3: {
            decimals: 18,
            enabled: true,
            abi: yTUSDv3,
            token: "yTUSDv3",
            baseToken: "TUSD",
            protocol: "iearn",
            icon: "images/tokens/yTUSDv3.png",
            migrateFunction: "migrateFromIearnToIdle",
            address: "0x73a052500105205d34daf004eab301916da8190f"
          },
          cWBTC: {
            decimals: 8,
            enabled: true,
            token: "cWBTC",
            baseToken: "WBTC",
            protocol: "compound",
            migrateFunction: "migrateFromCompoundToIdle",
            address: "0xc11b1268c1a384e55c48c2391d8d480264a3a7f4"
          },
          iWBTC: {
            decimals: 8,
            enabled: false,
            token: "iWBTC",
            baseToken: "WBTC",
            protocol: "fulcrum",
            migrateFunction: "migrateFromFulcrumToIdle",
            address: "0xba9262578efef8b3aff7f60cd629d6cc8859c8b5"
          },
          aWBTC: {
            decimals: 8,
            enabled: true,
            token: "aWBTC",
            protocol: "aave",
            baseToken: "WBTC",
            migrateFunction: "migrateFromAaveToIdle",
            address: "0xfc4b8ed459e00e5400be803a9bb3954234fd50e3"
          }
        }
      }
    },
    addFunds: {
      enabled: true,
      route: 'add-funds',
      label: 'Add Funds',
      availableNetworks: [1],
      icon: 'AddCircleOutline',
      desc: 'Buy tokens with your Bank account, Credit card or Ethereum Wallet',
      subComponent: BuyModal,
      directProps: {
        showInline: true,
        showAllTokens: true
      }
    },
    tokenSwap: {
      enabled: true,
      icon: "Sync",
      route: "token-swap",
      label: "Token Swap",
      availableNetworks: [1],
      desc: "Easily swap your tokens using Kyber Swap widget",
      subComponent: TokenSwap,
      props: {
        availableTokens: {
          ETH: { token: "ETH" },
          DAI: { token: "DAI" },
          SUSD: { token: "SUSD" },
          TUSD: { token: "TUSD" },
          USDC: { token: "USDC" },
          USDS: { token: "USDS" },
          USDT: { token: "USDT" },
          WBTC: { token: "WBTC" },
          WETH: { token: "WETH" },
          BUSD: { token: "BUSD" },
          EURS: { token: "EURS" },
          "2KEY": { token: "2KEY" },
          ABT: { token: "ABT" },
          ABYSS: { token: "ABYSS" },
          AMPL: { token: "AMPL" },
          ANT: { token: "ANT" },
          BAM: { token: "BAM" },
          BAND: { token: "BAND" },
          BAT: { token: "BAT" },
          BLZ: { token: "BLZ" },
          BNT: { token: "BNT" },
          BQX: { token: "BQX" },
          BTU: { token: "BTU" },
          CDT: { token: "CDT" },
          CVC: { token: "CVC" },
          DAT: { token: "DAT" },
          DGX: { token: "DGX" },
          EKG: { token: "EKG" },
          ELF: { token: "ELF" },
          ENJ: { token: "ENJ" },
          EQUAD: { token: "EQUAD" },
          FXC: { token: "FXC" },
          GDC: { token: "GDC" },
          GEN: { token: "GEN" },
          GHT: { token: "GHT" },
          GNO: { token: "GNO" },
          IOST: { token: "IOST" },
          KEY: { token: "KEY" },
          KNC: { token: "KNC" },
          LEND: { token: "LEND" },
          LINK: { token: "LINK" },
          LOOM: { token: "LOOM" },
          LRC: { token: "LRC" },
          MANA: { token: "MANA" },
          MCO: { token: "MCO" },
          MET: { token: "MET" },
          MFG: { token: "MFG" },
          MKR: { token: "MKR" },
          MLN: { token: "MLN" },
          MTL: { token: "MTL" },
          MYB: { token: "MYB" },
          NEXXO: { token: "NEXXO" },
          NPXS: { token: "NPXS" },
          OGN: { token: "OGN" },
          OMG: { token: "OMG" },
          OST: { token: "OST" },
          PAX: { token: "PAX" },
          PBTC: { token: "PBTC" },
          PLR: { token: "PLR" },
          PNK: { token: "PNK" },
          POLY: { token: "POLY" },
          POWR: { token: "POWR" },
          PT: { token: "PT" },
          QKC: { token: "QKC" },
          QNT: { token: "QNT" },
          RAE: { token: "RAE" },
          REN: { token: "REN" },
          REP: { token: "REP" },
          REQ: { token: "REQ" },
          RLC: { token: "RLC" },
          RSR: { token: "RSR" },
          RSV: { token: "RSV" },
          SAN: { token: "SAN" },
          SNT: { token: "SNT" },
          SNX: { token: "SNX" },
          SPIKE: { token: "SPIKE" },
          SPN: { token: "SPN" },
          TKN: { token: "TKN" },
          TKX: { token: "TKX" },
          TRYB: { token: "TRYB" },
          UBT: { token: "UBT" },
          UPP: { token: "UPP" },
          ZRX: { token: "ZRX" }
        }
      },
      directProps: {}
    }
  },
  insurance: {
    nexusMutual: {
      label: "Nexus Mutual",
      image: "images/protocols/nexus-mutual.png",
      imageDark: "images/protocols/nexus-mutual-white.png"
    },
    coverProtocol: {
      label: "Cover Protocol",
      image: "images/protocols/cover-logo.svg",
      imageDark: "images/protocols/cover-logo.svg"
    }
  },
  payments: {
    // Payment methods & providers
    methods: {
      bank: {
        defaultProvider: null,
        showDefaultOnly: false,
        props: {
          imageSrc: "images/bank.png",
          caption: "Bank Account"
        }
      },
      card: {
        defaultProvider: null,
        showDefaultOnly: false,
        props: {
          imageSrc: "images/debit-card.png",
          caption: "Credit Card"
        }
      },
      wallet: {
        defaultProvider: "zeroExInstant",
        showDefaultOnly: false,
        props: {
          imageSrc: "images/ethereum-wallet.svg",
          caption: "Ethereum Wallet",
          imageProps: {
            padding: ["0", "5px"]
          }
        }
      }
    },
    providers: {
      wyre: {
        enabled: true,
        imageSrc: "images/payments/wyre.svg",
        imageProps: {
          width: ["100%", "auto"],
          height: ["auto", "35px"],
          my: "8px"
        },
        caption: "Buy with",
        captionPos: "top",
        subcaption: "~ 0.75% fee ~",
        supportedMethods: ["card"],
        supportedCountries: ["USA", "GBR", "AUS", "BRA", "CHN", "MEX", "EUR"],
        supportedTokens: ["USDC", "DAI", "ETH"],
        remoteResources: {},
        env: "prod",
        envParams: {
          test: {
            accountId: "AC_Q2Y4AARC3TP"
          },
          prod: {
            accountId: "AC_PQQBX33XVEQ"
          }
        },
        getInfo: props => {
          const info = {};
          if (props.selectedMethod && props.selectedMethod) {
            switch (props.selectedMethod) {
              case "bank":
                info.subcaption = `~ 0.75% fee ~\nKYC REQUIRED`;
                break;
              case "card":
                info.subcaption = `~ 3.2% fee ~\n$250.00/day`;
                break;
              default:
                break;
            }
          }
          return info;
        },
        getInitParams: (props, globalConfigs, buyParams) => {
          const env = globalConfigs.payments.providers.wyre.env;
          const envParams = globalConfigs.payments.providers.wyre.envParams[env];
          const referrerAccountId = envParams.accountId;
          const url = "https://pay.sendwyre.com/purchase";

          const params = {
            dest: `ethereum:${props.account}`,
            destCurrency: buyParams.selectedToken ? buyParams.selectedToken : props.tokenConfig.wyre && props.tokenConfig.wyre.destCurrency ? props.tokenConfig.wyre.destCurrency : props.selectedToken,
            referrerAccountId,
            redirectUrl: globalConfigs.baseURL
            // failureRedirectUrl:globalConfigs.baseURL
          };

          return (
            `${url}?` +
            Object.keys(params)
              .map(
                k => encodeURIComponent(k) + "=" + encodeURIComponent(params[k])
              )
              .join("&")
          );
        },
        render: (initParams, amount, props, globalConfigs) => {
          const wyreWidget = document.getElementById("wyre-widget");
          if (!wyreWidget) {
            const iframeBox = document.createElement("div");
            iframeBox.innerHTML = `
              <div id="wyre-widget" class="wyre-widget iframe-container" style="position:fixed;display:flex;justify-content:center;align-items:center;top:0;left:0;width:100%;height:100%;z-index:999">
                <div id="wyre-widget-overlay" style="position:fixed;top:0;left:0;width:100%;height:100%;background:rgba(0,0,0,0.7);z-index:1"></div>
                <a class="wyre-close-button" href="javascript:void(0);" onclick="document.getElementById('wyre-widget').remove();" style="position:absolute;width:30px;height:30px;top:10px;right:10px;font-size:22px;line-height:30px;text-align:center;color:#fff;font-weight:bold;z-index:10;text-decoration:none">✕</a>
                <div id="wyre-widget-container" style="position:relative;z-index:2;width:400px;height:650px">
                  <iframe
                    style="position:relative;z-index:2;"
                    frameborder="0"
                    height="100%"
                    src="${initParams}"
                    width="100%"
                  >
                    <p>Your browser does not support iframes.</p>
                  </iframe>
                  <div id="wyre-widget-loading-placeholder" style="position:absolute;background:#fff;width:100%;height:100%;z-index:1;top:0;display:flex;justify-content:center;align-items:center;">
                    <div style="display:flex;flex-direction:row;align-items:center">
                      <img src="${globalConfigs.payments.providers.wyre.imageSrc}" style="height:50px;" />
                      <h3 style="font-weight:600;font-style:italic;color:#000;padding-left:10px">is loading...</h3>
                    </div>
                  </div>
                </div>
              </div>
            `;
            document.body.appendChild(iframeBox);

            // Add wyre Widget style (mobile)
            if (!document.getElementById("wyreWidget_style")) {
              const wyreStyle = document.createElement("style");
              wyreStyle.id = "wyreWidget_style";
              wyreStyle.innerHTML = `
              @media (max-width: 40em){
                #wyre-widget {
                  align-items: flex-start !important;
                }
                #wyre-widget-overlay{
                  background:#fff !important;
                }
                #wyre-widget-container{
                  width:100vw;
                  min-height: calc( 100vh - 60px ) !important;
                }
              }`;
              document.body.appendChild(wyreStyle);
            }
          }
        }
      },
      ramp: {
        enabled: true,
        imageSrc: "images/payments/ramp.png",
        imageProps: {
          width: ["100%", "auto"],
          height: ["auto", "35px"],
          my: "8px"
        },
        caption: "Buy with",
        captionPos: "top",
        subcaption: `~ 2.5% fee ~\nEUR / GBP`,
        supportedMethods: ["bank", "card"],
        badge: {
          text: "NO ID REQUIRED",
          color: "#fff",
          bgColor: "#0cade4"
        },
        supportedTokens: ["ETH", "DAI", "USDC"],
        supportedCountries: [
          "USA",
          "GBR",
          "AUS",
          "BRA",
          "CAN",
          "EUR",
          "HKG",
          "IND",
          "MEX",
          "RUS",
          "ZAF",
          "KOR"
        ],
        getInfo: props => {
          const info = {};
          switch (props.selectedMethod) {
            case "bank":
              info.supportedCountries = ["GBR", "EUR"];
              info.subcaption = `~ 1.49-1.99% fee ~`;
              break;
            case "card":
              info.supportedCountries = [
                "USA",
                "GBR",
                "AUS",
                "BRA",
                "CAN",
                "EUR",
                "HKG",
                "IND",
                "MEX",
                "RUS",
                "ZAF",
                "KOR"
              ];
              info.subcaption = `~ 2.90% fee ~`;
              break;
            default:
              break;
          }
          return info;
        },
        getInitParams: (props, globalConfigs, buyParams) => {
          return {
            hostAppName: "Idle",
            userAddress: props.account,
            hostApiKey: env.REACT_APP_RAMP_KEY,
            variant: props.isMobile ? "mobile" : "desktop",
            hostLogoUrl: `${globalConfigs.baseURL}/images/idle-round.png`,
            swapAsset: buyParams.selectedToken
              ? buyParams.selectedToken
              : props.tokenConfig.ramp && props.tokenConfig.ramp.swapAsset
                ? props.tokenConfig.ramp.swapAsset
                : props.selectedToken
          };
        },
        render: (initParams, amount, props, globalConfigs) => {
          new RampInstantSDK(initParams)
            .on("*", async event => {
              const functionsUtil = new FunctionsUtil(props);
              let tokenDecimals = null;
              let tokenAmount = null;

              switch (event.type) {
                case "PURCHASE_SUCCESSFUL":
                  // Update balance
                  props.getAccountBalance();

                  tokenDecimals = await props.getTokenDecimals();

                  tokenAmount = event.payload.purchase.tokenAmount;
                  tokenAmount = functionsUtil
                    .BNify(tokenAmount.toString())
                    .div(
                      functionsUtil.BNify(
                        Math.pow(10, parseInt(tokenDecimals)).toString()
                      )
                    )
                    .toString();

                  // Toast message
                  window.toastProvider.addMessage(`Payment completed`, {
                    secondaryMessage: `${tokenAmount} ${props.selectedToken} are now in your wallet`,
                    colorTheme: "light",
                    actionHref: "",
                    actionText: "",
                    variant: "success"
                  });

                  break;
                default:
                  break;
              }
            })
            .show();
        }
      },
      transak: {
        enabled: true,
        imageSrc: "images/payments/transak.png",
        imageProps: {
          width: ["100%", "auto"],
          height: ["auto", "35px"],
          my: "8px"
        },
        caption: "Buy with",
        captionPos: "top",
        subcaption: `~ 1.5% fee ~\nALL CURRENCIES`,
        supportedMethods: ["bank", "card"],
        supportedCountries: [
          "USA",
          "GBR",
          "AUS",
          "BRA",
          "CHN",
          "MEX",
          "EUR",
          "IND"
        ],
        supportedTokens: ["ETH", "DAI", "USDC", "USDT", "TUSD", "SUSD", "WBTC"],
        remoteResources: { "https://global.transak.com/v1/widget.js": {} },
        env: "prod",
        badge: {
          text: "INSTANT",
          bgColor: "#0069ee"
        },
        envParams: {
          test: {
            apiKey: env.REACT_APP_TRANSAK_KEY_TEST,
            url: "https://global.transak.com"
          },
          prod: {
            apiKey: env.REACT_APP_TRANSAK_KEY_PROD,
            url: "https://global.transak.com"
          }
        },
        getInfo: props => {
          const info = {};

          const selectedMethod = props.selectedMethod && props.selectedMethod;
          let fee = selectedMethod === "bank" ? "1.5%" : "4.5%";

          if (props.selectedCountry && props.selectedCountry.value) {
            switch (props.selectedCountry.value.toUpperCase()) {
              case "GBR":
                info.badge = {
                  text: "INSTANT",
                  bgColor: "#0069ee"
                };
                info.subcaption = `~ ${fee} fee ~\nGBP ONLY`;
                break;
              case "IND":
                fee = "1.0%";
                info.badge = {
                  text: "INSTANT",
                  bgColor: "#0069ee"
                };
                info.subcaption = `~ ${fee} fee ~\nINR ONLY`;
                break;
              case "EUR":
                if (selectedMethod === "bank") {
                  info.badge = {
                    text: "SEPA",
                    color: "#f7cb05 ",
                    bgColor: "#10288a"
                  };
                } else {
                  info.badge = {
                    text: "INSTANT",
                    bgColor: "#0069ee"
                  };
                }
                info.subcaption = `~ ${fee} fee ~\nEUR ONLY`;
                break;
              default:
                break;
            }
          }
          return info;
        },
        getInitParams: (props, globalConfigs, buyParams) => {
          const env = globalConfigs.payments.providers.transak.env;
          const envParams =
            globalConfigs.payments.providers.transak.envParams[env];

          let fiatCurrency = null;

          if (buyParams.selectedCountry && buyParams.selectedCountry.value) {
            switch (buyParams.selectedCountry.value.toUpperCase()) {
              case "IND":
                fiatCurrency = "INR";
                break;
              case "GBR":
                fiatCurrency = "GBP";
                break;
              case "EUR":
                fiatCurrency = "EUR";
                break;
              case "USA":
                fiatCurrency = "USD";
                break;
              default:
                fiatCurrency = "GBP";
                break;
            }
          }

          let cryptoCurrencyCode = buyParams.selectedToken
            ? buyParams.selectedToken.toLowerCase()
            : props.tokenConfig.transak &&
              props.tokenConfig.transak.currencyCode
              ? props.tokenConfig.transak.currencyCode
              : props.selectedToken;
          cryptoCurrencyCode = cryptoCurrencyCode.toUpperCase();

          const apiKey = envParams.apiKey;
          const walletAddress = props.account;
          const partnerCustomerId = props.account;
          const disableWalletAddressForm = false;

          return {
            apiKey,
            cryptoCurrencyCode,
            walletAddress,
            fiatCurrency,
            partnerCustomerId,
            disableWalletAddressForm,
            width: "100%",
            height: "100%"
            // email,
          };
        },
        render: (initParams, amount, props, globalConfigs) => {
          if (window.transakGlobal) {
            const transakWidget = document.getElementById("transak-widget");
            if (!transakWidget) {
              const iframeBox = document.createElement("div");
              iframeBox.innerHTML = `
                <div id="transak-widget" class="transak-widget iframe-container" style="position:fixed;display:flex;justify-content:center;align-items:center;top:0;left:0;width:100%;height:100%;z-index:999">
                  <div id="transak-widget-overlay" style="position:fixed;top:0;left:0;width:100%;height:100%;background:rgba(0,0,0,0.7);z-index:1" onclick="document.getElementById('transak-widget').remove();"></div>
                  <a class="transak-close-button" href="javascript:void(0);" onclick="document.getElementById('transak-widget').remove();" style="position:absolute;width:30px;height:30px;top:10px;right:10px;font-size:22px;line-height:30px;text-align:center;color:#fff;font-weight:bold;z-index:10;text-decoration:none">✕</a>
                  <div class="transak-widget-container" style="position:relative;z-index:2;width:500px;height:550px">
                    <div id="transak-widget-container" style="position:relative;z-index:2;width:500px;height:550px"></div>
                    <div id="transak-widget-loading-placeholder" style="position:absolute;background:#fff;width:100%;height:100%;z-index:1;top:0;display:flex;justify-content:center;align-items:center;">
                      <div style="display:flex;flex-direction:row;align-items:center">
                        <img src="${globalConfigs.payments.providers.transak.imageSrc}" style="height:50px;" />
                        <h3 style="font-weight:600;font-style:italic;color:#0040ca">is loading...</h3>
                      </div>
                    </div>
                  </div>
                </div>
              `;
              document.body.appendChild(iframeBox);

              // Add transak Widget style (mobile)
              if (!document.getElementById("transakWidget_style")) {
                const transakStyle = document.createElement("style");
                transakStyle.id = "transakWidget_style";
                transakStyle.innerHTML = `
                @media (max-width: 40em){
                  #transak-widget {
                    align-items: flex-start !important;
                  }
                  #transak-widget-overlay{
                    background:#fff !important;
                  }
                  #transak-widget-container{
                    width:100vw;
                    min-height: calc( 100vh - 60px ) !important;
                  }
                }`;
                document.body.appendChild(transakStyle);
              }
            }

            window.transakGlobal.render(initParams, "transak-widget-container");
          }
        }
      },
      moonpay: {
        enabled: true,
        imageSrc: "images/payments/moonpay.svg",
        imageProps: {
          width: ["100%", "auto"],
          height: ["auto", "35px"],
          my: "8px"
        },
        caption: "Buy with",
        captionPos: "top",
        subcaption: "~ 4.5% fee ~",
        supportedMethods: ["card", "bank"],
        supportedCountries: [
          "GBR",
          "EUR",
          "AUS",
          "BRA",
          "CHN",
          "MEX",
          "CAN",
          "HKG",
          "RUS",
          "ZAF",
          "KOR"
        ],
        supportedTokens: ["USDC", "DAI", "ETH"],
        env: "prod",
        envParams: {
          test: {
            url: "https://buy-staging.moonpay.io",
            apiKey: env.REACT_APP_MOONPAY_KEY_TEST
          },
          prod: {
            url: "https://buy.moonpay.io",
            apiKey: env.REACT_APP_MOONPAY_KEY_PROD
          }
        },
        getInfo: props => {
          const info = {};
          if (props.selectedMethod && props.selectedMethod) {
            switch (props.selectedMethod) {
              case "bank":
                if (props.selectedCountry && props.selectedCountry.value) {
                  switch (props.selectedCountry.value.toUpperCase()) {
                    case "EUR":
                      info.badge = {
                        text: "SEPA",
                        color: "#f7cb05 ",
                        bgColor: "#10288a"
                      };
                      info.subcaption = `~ 1.5% fee ~\nEUR ONLY`;
                      break;
                    case "GBR":
                      info.badge = {
                        text: "GBP"
                      };
                      info.subcaption = `~ 1.5% fee ~\nGBP ONLY`;
                      break;
                    default:
                      info.badge = null;
                      info.subcaption = `~ 1.5% fee ~\nEUR/GBP ONLY`;
                      break;
                  }
                }
                break;
              case "card":
                info.badge = null;
                info.subcaption = `~ 5% fee ~`;
                break;
              default:
                break;
            }
          }
          return info;
        },
        getInitParams: (props, globalConfigs, buyParams) => {
          const env = globalConfigs.payments.providers.moonpay.env;
          const envParams =
            globalConfigs.payments.providers.moonpay.envParams[env];
          const apiKey = envParams.apiKey;
          const params = {
            apiKey,
            currencyCode: buyParams.selectedToken
              ? buyParams.selectedToken.toLowerCase()
              : props.tokenConfig.moonpay &&
                props.tokenConfig.moonpay.currencyCode
                ? props.tokenConfig.moonpay.currencyCode
                : props.selectedToken.toLowerCase(),
            walletAddress: props.account,
            baseCurrencyCode: "USD",
            showWalletAddressForm: true
          };

          const methods = {
            bank: {
              GBR: "gbp_bank_transfer",
              EUR: "sepa_bank_transfer"
            },
            card: "credit_debit_card"
          };

          const selectedCountry =
            buyParams.selectedCountry && buyParams.selectedCountry.value
              ? buyParams.selectedCountry.value.toUpperCase()
              : null;

          // Set payment method
          if (buyParams.selectedMethod) {
            switch (buyParams.selectedMethod) {
              case "bank":
                params.enabledPaymentMethods =
                  methods[buyParams.selectedMethod]["EUR"];
                switch (selectedCountry) {
                  case "GBR":
                  case "EUR":
                    params.enabledPaymentMethods =
                      methods[buyParams.selectedMethod][selectedCountry];
                    break;
                  default:
                    params.enabledPaymentMethods = Object.values(
                      methods[buyParams.selectedMethod]
                    ).join(",");
                    break;
                }
                break;
              case "card":
              default:
                params.enabledPaymentMethods =
                  methods[buyParams.selectedMethod];
                break;
            }
          }

          // Set baseCurrencyCode
          switch (selectedCountry) {
            case "GBR":
              params.baseCurrencyCode = "GBP";
              break;
            case "EUR":
              params.baseCurrencyCode = "EUR";
              break;
            default:
              params.baseCurrencyCode = "USD";
              break;
          }

          let url = envParams.url;

          // Safari Fix
          var isSafari = navigator.userAgent.indexOf("Safari") > -1;
          if (isSafari) {
            if (
              !document.cookie.match(
                /^(.*;)?\s*moonpay-fixed\s*=\s*[^;]+(.*)?$/
              )
            ) {
              document.cookie =
                "moonpay-fixed=fixed; expires=Tue, 19 Jan 2038 03:14:07 UTC; path=/";
              url += "/safari_fix";
            }
          }

          return (
            `${url}?` +
            Object.keys(params)
              .map(
                k => encodeURIComponent(k) + "=" + encodeURIComponent(params[k])
              )
              .join("&")
          );
        },
        render: (initParams, amount, props, globalConfigs) => {
          const moonpayWidget = document.getElementById("moonpay-widget");
          if (!moonpayWidget) {
            const iframeBox = document.createElement("div");
            iframeBox.innerHTML = `
              <div id="moonpay-widget" class="moonpay-widget iframe-container" style="position:fixed;display:flex;justify-content:center;align-items:center;top:0;left:0;width:100%;height:100%;z-index:999">
                <div id="moonpay-widget-overlay" style="position:fixed;top:0;left:0;width:100%;height:100%;background:rgba(0,0,0,0.7);z-index:1"></div>
                  <div id="moonpay-widget-container" style="position:relative;z-index:2;width:500px;height:490px">
                    <iframe
                      style="position:relative;z-index:2;"
                      frameborder="0"
                      height="100%"
                      src="${initParams}"
                      width="100%"
                    >
                      <p>Your browser does not support iframes.</p>
                    </iframe>
                    <div id="moonpay-widget-loading-placeholder" style="position:absolute;background:#fff;width:100%;height:100%;z-index:1;top:0;display:flex;justify-content:center;align-items:center;">
                      <div style="display:flex;flex-direction:row;align-items:end">
                        <img src="${globalConfigs.payments.providers.moonpay.imageSrc}" style="height:50px;" />
                        <h3 style="padding-left:5px;font-weight:600;font-style:italic;">is loading...</h3>
                      </div>
                    </div>
                    <div id="moonpay-widget-footer" style="position:relative;display:flex;justify-content:center;align-items:center;padding:8px 16px;width:100%;background:#fff;top:-20px;z-index:3">
                      <button style="background:#000;color:#fff;text-align:center;border-radius:5px;width:100%;height:51px;line-height:51px;font-weight:500;border:0;cursor:pointer" onclick="document.getElementById('moonpay-widget').remove();">Close</button>
                    </div>
                  </div>
                </div>
              </div>
            `;
            document.body.appendChild(iframeBox);

            // Add Moonpay Widget style (mobile)
            if (!document.getElementById("moonpayWidget_style")) {
              const moonpayStyle = document.createElement("style");
              moonpayStyle.id = "moonpayWidget_style";
              moonpayStyle.innerHTML = `
              @media (max-width: 40em){
                #moonpay-widget {
                  align-items: flex-start !important;
                }
                #moonpay-widget-overlay{
                  background:#fff !important;
                }
                #moonpay-widget-container{
                  width:100vw;
                  min-height: calc( 100vh - 60px ) !important;
                }
              }`;
              document.body.appendChild(moonpayStyle);
            }
          }
        }
      },
      zeroExInstant: {
        enabled: true,
        imageSrc: "images/payments/zeroexinstant.svg",
        imageProps: {
          width: ["100%", "auto"],
          height: ["auto", "35px"],
          my: "8px"
        },
        caption: "Buy with",
        captionPos: "top",
        subcaption: "~ 0.25% fee ~",
        supportedMethods: ["wallet"],
        supportedTokens: ["USDC", "DAI"],
        remoteResources: { "https://instant.0x.org/v3/instant.js": {} },
        getInitParams: (
          props,
          globalConfigs,
          buyParams,
          onSuccess,
          onClose
        ) => {
          const tokenParams = globalConfigs.tokens[buyParams.selectedToken];
          const connectorName = window.RimbleWeb3_context
            ? window.RimbleWeb3_context.connectorName
            : null;

          if (!tokenParams.zeroExInstant) {
            return null;
          }

          return {
            networkId: globalConfigs.network.requiredNetwork,
            chainId: globalConfigs.network.requiredNetwork,
            provider:
              connectorName &&
                connectorName !== "Injected" &&
                window.RimbleWeb3_context.connector[connectorName.toLowerCase()]
                ? window.RimbleWeb3_context.connector[
                  window.RimbleWeb3_context.connectorName.toLowerCase()
                ].provider
                : window.ethereum,
            orderSource: tokenParams.zeroExInstant.orderSource,
            affiliateInfo: tokenParams.zeroExInstant.affiliateInfo,
            defaultSelectedAssetData: tokenParams.zeroExInstant.assetData,
            availableAssetDatas: [tokenParams.zeroExInstant.assetData],
            shouldDisableAnalyticsTracking: true,
            onSuccess: onSuccess ? onSuccess : () => { },
            onClose: onClose ? onClose : () => { }
          };
        },
        render: (initParams, amount) => {
          if (window.zeroExInstant && initParams) {
            if (amount) {
              initParams.defaultAssetBuyAmount = parseFloat(amount);
            }
            window.zeroExInstant.render(initParams, "body");
          }
        }
      },
      kyberSwap: {
        enabled: true,
        imageSrc: "images/payments/kyber.svg",
        imageProps: {
          width: ["100%", "auto"],
          height: ["auto", "35px"],
          my: "8px"
        },
        caption: "Swap with",
        captionPos: "top",
        subcaption: "~ 0.25% fee ~",
        supportedMethods: ["wallet"],
        supportedTokens: [
          "WETH",
          "USDC",
          "DAI",
          "USDT",
          "TUSD",
          "SUSD",
          "WBTC",
          "RAI",
          "FEI"
        ],
        web3Subscription: {
          // Data for web3 subscription
          enabled: true,
          contractAddress: "0x818e6fecd516ecc3849daf6845e3ec868087b755",
          decodeLogsData: [
            {
              internalType: "address",
              name: "_startAddress",
              type: "address"
            },
            {
              internalType: "address",
              name: "_tokenAddress",
              type: "address"
            },
            {
              internalType: "uint256",
              name: "_startAmount",
              type: "uint256"
            },
            {
              internalType: "uint256",
              name: "_tokenAmount",
              type: "uint256"
            }
          ]
        },
        remoteResources: {
          "https://widget.kyber.network/v0.7.5/widget.css": {},
          "https://widget.kyber.network/v0.7.5/widget.js": {
            parentElement: document.body,
            precall: (props, globalConfigs, providerInfo) => {
              // Remove previous elements
              const buttons = document.querySelectorAll(".kyber-widget-button");
              for (let i = 0; i < buttons.length; i++) {
                buttons[i].remove();
              }

              // const kyberWidgetScript = document.getElementById('kyber-widget-script');
              // if (kyberWidgetScript){
              //   kyberWidgetScript.remove();
              // }

              const scripts = document.querySelectorAll(".script_kyberSwap");
              for (let i = 0; i < scripts.length; i++) {
                scripts[i].remove();
              }

              const buttonId = props.buttonId
                ? props.buttonId
                : `kyber-swapper-${props.selectedToken}`;
              if (!document.getElementById(buttonId)) {
                const a = document.createElement("a");
                a.id = buttonId;
                a.href = providerInfo.getInitParams(props, globalConfigs);
                a.target = "_blank";
                a.rel = "nofollow noopener noreferrer";
                a.className = "kyber-widget-button theme-ocean theme-supported";
                a.title = "Swap with Kyber";
                a.style = "display:none;";
                document.body.appendChild(a);
              }
            }
          }
        },
        getInitParams: (props, globalConfigs, buyParams = null) => {
          const baseToken = props.baseToken ? props.baseToken : "ETH";
          const params = {
            lang: "en",
            type: "swap",
            mode: "iframe",
            theme: "theme-ocean",
            paramForwarding: true,
            // callback:globalConfigs.baseURL,
            pinnedTokens: `${baseToken}_${props.selectedToken}`,
            title: `Swap ${baseToken} for ${props.selectedToken}`,
            defaultPair: `${baseToken}_${props.selectedToken}`,
            commissionId: "0x4215606a720477178AdFCd5A59775C63138711e8",
            network:
              globalConfigs.network.requiredNetwork === 1 ? "mainnet" : "test"
          };

          const url = "https://widget.kyber.network/v0.7.5/";

          return (
            `${url}?` +
            Object.keys(params)
              .map(
                k => encodeURIComponent(k) + "=" + encodeURIComponent(params[k])
              )
              .join("&")
          );
        },
        render: (initParams, amount, props) => {
          const buttonId = props.buttonId
            ? props.buttonId
            : `kyber-swapper-${props.selectedToken}`;
          const a = document.getElementById(buttonId);
          if (a) {
            a.click();

            // Observe for pending transaction
            /*
            if (window.MutationObserver){
              setTimeout(() => {

                const observer = new window.MutationObserver(function(mutations) {
                  mutations.forEach((m,i) => {
                    if (m.addedNodes.length && m.target.className === 'kyber_widget-broadcast'){

                      // Show persistent toast message
                      window.showToastMessage({
                        variant:'processing',
                        message:'Pending deposit',
                        secondaryMessage:'kyberSwap is processing your request'
                      });

                      observer.disconnect();
                    } else if (m.target.id === 'kyber-widget' && m.removedNodes.length && m.removedNodes[0].firstChild.className.includes('kyber_widget-widget-container')) {
                      observer.disconnect();
                    }
                  });
                });
                const target = document.querySelector('#kyber-widget');
                observer.observe(target, { childList: true, subtree: true });
              },1000);
            }
            */
          }
        }
      },
      airSwap: {
        enabled: false,
        imageSrc: "images/payments/airswap.svg",
        imageProps: {
          width: ["100%", "auto"],
          height: ["auto", "35px"],
          my: "8px"
        },
        caption: "Buy with",
        captionPos: "top",
        subcaption: "~ 0% fee ~",
        supportedMethods: ["wallet"],
        supportedTokens: ["USDC", "DAI"],
        env: "production",
        remoteResources: {
          "https://cdn.airswap.io/airswap-instant-widget.js": {}
        },
        getInitParams: (
          props,
          globalConfigs,
          buyParams,
          onComplete,
          onClose
        ) => {
          return {
            env: "production",
            mode: "buy",
            token: props.tokenConfig.address,
            baseToken: "ETH",
            onComplete: onComplete ? onComplete : () => { },
            onClose: onClose ? onClose : () => { }
          };
        },
        render: (initParams, amount, props) => {
          if (window.AirSwapInstant) {
            if (amount) {
              initParams.amount = amount.toString();
            }
            window.AirSwapInstant.render(initParams, "body");
          }
        }
      },
      totle: {
        enabled: false,
        imageSrc: "images/payments/totle.svg",
        imageProps: {
          width: ["100%", "auto"],
          height: ["auto", "35px"],
          my: "8px"
        },
        caption: "Buy with",
        captionPos: "top",
        subcaption: "~ 0% fee ~",
        supportedMethods: ["wallet"],
        supportedTokens: ["USDC", "DAI"],
        env: "production",
        remoteResources: { "https://widget.totle.com/latest/dist.js": {} },
        getInitParams: (
          props,
          globalConfigs,
          buyParams,
          onComplete,
          onClose
        ) => {
          return {
            sourceAssetAddress: null,
            sourceAmountDecimal: null,
            destinationAssetAddress: null,
            destinationAmountDecimal: null,
            apiKey: null,
            partnerContractAddress: null
          };
        },
        render: (initParams, amount, props) => {
          if (window.TotleWidget) {
            const nodeId = "totle-widget";
            if (!document.getElementById(nodeId)) {
              const totleWidgetContainer = document.createElement("div");
              totleWidgetContainer.id = nodeId;
              document.body.appendChild(totleWidgetContainer);
            }

            window.TotleWidget.default.run(
              initParams,
              document.getElementById(nodeId)
            );
          }
        }
      }
    }
  }
};

export default globalConfigs;
