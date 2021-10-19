import DAI from '../abis/tokens/DAI.json';
import CHAI from '../abis/chai/CHAI.json';
import cToken from '../abis/compound/cDAI';
import WETH from '../abis/tokens/WETH.json';
import USDC from '../abis/tokens/USDC.json';
import ERC20 from '../abis/tokens/ERC20.js';
import fToken from '../abis/fuse/fToken.json';
import aToken from '../abis/aave/AToken.json';
import yToken from '../abis/dydx/yToken.json';
import iToken from '../abis/fulcrum/iToken.json';
import crToken from '../abis/cream/crToken.json';
import IdleTokenV3 from '../contracts/IdleTokenV3.json';
import IdleTokenV4 from '../contracts/IdleTokenV4.json';
import IdleConverterPersonalSignV4 from '../contracts/IdleConverterPersonalSignV4.json';

const availableTokens = {
  42: {
    best: {
      DAI: {
        abi: DAI,
        token: 'DAI',
        decimals: 18,
        enabled: true,
        govTokensDisabled: false,
        color: 'hsl(40, 95%, 59%)',
        address: '0x4f96fe3b7a6cf9725f59d353f723c1bdb64ca6aa',
        deposit: {
          minAmountForMint: 10000,
        },
        wyre: {
          destCurrency: 'DAI'
        },
        ramp: {
          swapAsset: 'DAI'
        },
        defiPrime: {
          token: 'dai'
        },
        idle: {
          abi: IdleTokenV4,
          token: 'idleDAIYield',
          address: '0x295CA5bC5153698162dDbcE5dF50E436a58BA21e',
        },
        protocols: [
          {
            decimals: 28,
            token: 'cDAI',
            enabled: true,
            abi: cToken.abi,
            name: 'compound',
            address: '0xf0d0eb522cfa50b716b3b1604c4f0fa6f04376ad',
            functions: {
              exchangeRate: {
                name: 'exchangeRateStored',
                params: []
              }
            },
          }
        ]
      },
      USDC: {
        abi: USDC,
        token: 'USDC',
        decimals: 6,
        enabled: true,
        govTokensDisabled: false,
        color: 'hsl(40, 95%, 59%)',
        address: '0xb7a4f3e9097c08da09517b5ab877f7a917224ede',
        deposit: {
          minAmountForMint: 10000,
        },
        wyre: {
          destCurrency: 'USDC'
        },
        ramp: {
          swapAsset: 'USDC'
        },
        defiPrime: {
          token: 'usdc'
        },
        idle: {
          abi: IdleTokenV4,
          token: 'idleUSDCYield',
          address: '0x0de23D3bc385a74E2196cfE827C8a640B8774B9f',
        },
        protocols: [
          {
            decimals: 16,
            enabled: true,
            token: 'cUSDC',
            abi: cToken.abi,
            name: 'compound',
            address: '0x4a92e71227d294f041bd82dd8f78591b75140d63',
            functions: {
              exchangeRate: {
                name: 'exchangeRateStored',
                params: []
              }
            },
          }
        ]
      },
    },
    risk: {

    }
  },
  1337: {
    best: {
      DAI: {
        abi: DAI,
        token: 'DAI',
        decimals: 18,
        enabled: true,
        govTokensDisabled: false,
        color: 'hsl(40, 95%, 59%)',
        address: '0x6b175474e89094c44da98b954eedeac495271d0f',
        deposit: {
          minAmountForMint: 10000,
        },
        wyre: {
          destCurrency: 'DAI'
        },
        ramp: {
          swapAsset: 'DAI'
        },
        defiPrime: {
          token: 'dai'
        },
        idle: {
          abi: IdleTokenV4,
          token: 'idleDAIYield',
          address: '0x3fe7940616e5bc47b0775a0dccf6237893353bb4',
        },
        migration: {
          enabled: true,
          message: 'Idle now supports yield farming and governance tokens distribution. Migrate now your DAI with just one click!',
          oldContract: {
            abi: IdleTokenV3,
            token: 'idleDAI',
            name: 'idleDAIYieldV3',
            address: '0x78751b12da02728f467a44eac40f5cbc16bd7934',
          },
          oldProtocols: [
            {
              name: 'dydx',
              enabled: true,
              abi: yToken,
              address: '0xf424b10e1e9691ae5fb530fe4c3e6b9971013d49',
              token: 'yxDAIOld',
              decimals: 18,
              functions: {
                exchangeRate: {
                  name: 'price',
                  params: []
                }
              }
            }
          ],
          migrationContract: {
            token: 'idleDAI',
            abi: IdleConverterPersonalSignV4,
            name: 'IdleConverterV4',
            address: '0xa55caa40b32a02becfad1d0d29c4f1cf38c4c743',
            oldAddresses: [],
            functions: [
              {
                label: 'Migrate',
                name: 'migrateFromToIdle'
              },
            ]
          }
        },
        protocols: [
          {
            enabled: true,
            abi: cToken.abi,
            name: 'compound',
            address: '0x5d3a536E4D6DbD6114cc1Ead35777bAB948E3643',
            token: 'cDAI',
            decimals: 28,
            functions: {
              exchangeRate: {
                name: 'exchangeRateStored',
                params: []
              }
            },
          },
          {
            abi: iToken,
            enabled: false,
            name: 'fulcrum',
            address: '0x493c57c4763932315a328269e1adad09653b9081',
            token: 'iDAI',
            decimals: 18,
            functions: {
              exchangeRate: {
                name: 'tokenPrice',
                params: []
              }
            },
          },
          {
            abi: aToken,
            name: 'aave',
            enabled: true,
            address: '0xfC1E690f61EFd961294b3e1Ce3313fBD8aa4f85d',
            token: 'aDAI',
            decimals: 18,
            functions: {

            }
          },
          {
            abi: aToken,
            name: 'aavev2',
            enabled: true,
            address: '0x028171bCA77440897B824Ca71D1c56caC55b68A3',
            token: 'aDAIv2',
            decimals: 18,
            functions: {

            }
          },
          {
            abi: CHAI,
            name: 'dsr',
            enabled: true,
            address: '0x06AF07097C9Eeb7fD685c692751D5C66dB49c215',
            token: 'CHAI',
            decimals: 18,
            functions: {

            }
          },
          {
            abi: yToken,
            name: 'dydx',
            enabled: true,
            address: '0xb299BCDF056d17Bd1A46185eCA8bCE458B00DC4a',
            token: 'yxDAI',
            decimals: 18,
            functions: {
              exchangeRate: {
                name: 'price',
                params: []
              }
            }
          }
        ]
      },
      USDC: {
        abi: USDC,
        decimals: 6,
        token: 'USDC',
        enabled: true,
        govTokensDisabled: false,
        color: 'hsl(211, 67%, 47%)',
        address: '0xa0b86991c6218b36c1d19d4a2e9eb0ce3606eb48',
        deposit: {
          minAmountForMint: 10000,
        },
        wyre: {
          destCurrency: 'USDC'
        },
        defiPrime: {
          token: 'usdc'
        },
        idle: {
          abi: IdleTokenV4,
          token: 'idleUSDCYield',
          address: '0x5274891bEC421B39D23760c04A6755eCB444797C',
        },
        migration: {
          enabled: true,
          message: 'Idle now supports yield farming and governance tokens distribution. Migrate now your USDC with just one click!',
          oldContract: {
            abi: IdleTokenV3,
            token: 'idleUSDC',
            name: 'idleUSDCYieldV3',
            address: '0x12B98C621E8754Ae70d0fDbBC73D6208bC3e3cA6'
          },
          oldProtocols: [
            {
              abi: yToken,
              name: 'dydx',
              enabled: true,
              address: '0x0d81b042bb9939b4d32cdf7861774c442a2685ce',
              token: 'yxUSDCOld',
              decimals: 18,
              functions: {
                exchangeRate: {
                  name: 'price',
                  params: []
                }
              }
            }
          ],
          migrationContract: {
            abi: IdleConverterPersonalSignV4,
            token: 'idleUSDC',
            name: 'IdleConverterV4',
            address: '0xa55caa40b32a02becfad1d0d29c4f1cf38c4c743',
            oldAddresses: [],
            functions: [
              {
                label: 'Migrate',
                name: 'migrateFromToIdle'
              },
            ]
          }
        },
        protocols: [
          {
            name: 'compound',
            enabled: true,
            abi: cToken.abi,
            address: '0x39aa39c021dfbae8fac545936693ac917d5e7563',
            token: 'cUSDC',
            decimals: 16,
            functions: {
              exchangeRate: {
                name: 'exchangeRateStored',
                params: []
              }
            },
          },
          {
            name: 'fulcrum',
            enabled: false,
            abi: iToken,
            address: '0xf013406a0b1d544238083df0b93ad0d2cbe0f65f',
            token: 'iUSDC',
            decimals: 18,
            functions: {
              exchangeRate: {
                name: 'tokenPrice',
                params: []
              }
            },
          },
          {
            name: 'aave',
            enabled: true,
            abi: aToken,
            address: '0x9bA00D6856a4eDF4665BcA2C2309936572473B7E',
            token: 'aUSDC',
            decimals: 18,
            functions: {

            }
          },
          {
            abi: aToken,
            decimals: 18,
            enabled: true,
            name: 'aavev2',
            token: 'aUSDCv2',
            address: '0xBcca60bB61934080951369a648Fb03DF4F96263C',
            functions: {

            }
          },
          {
            name: 'dydx',
            enabled: true,
            abi: yToken,
            address: '0xd2F45883627f26EC34825486ca4c25235A0da0C3',
            token: 'yxUSDC',
            decimals: 18,
            functions: {
              exchangeRate: {
                name: 'price',
                params: []
              }
            }
          }
        ]
      },
      USDT: {
        decimals: 6,
        token: 'USDT',
        enabled: true,
        abi: ERC20.abi,
        govTokensDisabled: false,
        color: 'hsl(211, 67%, 47%)',
        address: '0xdac17f958d2ee523a2206206994597c13d831ec7',
        wyre: {
          destCurrency: 'USDT'
        },
        defiPrime: {
          token: 'usdt'
        },
        idle: {
          abi: IdleTokenV4,
          token: 'idleUSDTYield',
          address: '0xF34842d05A1c888Ca02769A633DF37177415C2f8',
        },
        migration: {
          enabled: true,
          message: 'Idle now supports yield farming and governance tokens distribution. Migrate now your USDT with just one click!',
          oldContract: {
            abi: IdleTokenV3,
            token: 'idleUSDT',
            name: 'idleUSDTYieldV3',
            address: '0x63D27B3DA94A9E871222CB0A32232674B02D2f2D'
          },
          migrationContract: {
            abi: IdleConverterPersonalSignV4,
            token: 'idleUSDT',
            name: 'IdleConverterV4',
            address: '0xa55caa40b32a02becfad1d0d29c4f1cf38c4c743',
            oldAddresses: [],
            functions: [
              {
                label: 'Migrate',
                name: 'migrateFromToIdle'
              },
            ]
          }
        },
        protocols: [
          {
            name: 'compound',
            enabled: true,
            abi: cToken.abi,
            address: '0xf650c3d88d12db855b8bf7d11be6c55a4e07dcc9',
            token: 'cUSDT',
            decimals: 16,
            functions: {
              exchangeRate: {
                name: 'exchangeRateStored',
                params: []
              }
            },
          },
          {
            name: 'fulcrum',
            enabled: false,
            abi: iToken,
            address: '0x8326645f3aa6de6420102fdb7da9e3a91855045b',
            token: 'iUSDT',
            decimals: 18,
            functions: {
              exchangeRate: {
                name: 'tokenPrice',
                params: []
              }
            },
          },
          {
            name: 'aave',
            enabled: true,
            abi: aToken,
            address: '0x71fc860F7D3A592A4a98740e39dB31d25db65ae8',
            token: 'aUSDT',
            decimals: 18,
            functions: {

            }
          },
          {
            abi: aToken,
            decimals: 18,
            name: 'aavev2',
            enabled: true,
            token: 'aUSDTv2',
            address: '0x3ed3b47dd13ec9a98b44e6204a523e766b225811',
            functions: {

            }
          }
        ]
      },
      SUSD: {
        decimals: 18,
        token: 'SUSD',
        enabled: true,
        abi: ERC20.abi,
        govTokensDisabled: false,
        skipMintForDeposit: false,
        color: 'hsl(250, 31%, 15%)',
        // icon:'images/tokens/SUSD.svg',
        address: '0x57ab1ec28d129707052df4df418d58a2d46d5f51',
        wyre: {
          destCurrency: 'SUSD'
        },
        defiPrime: {
          token: 'susd'
        },
        idle: {
          abi: IdleTokenV4,
          token: 'idleSUSDYield',
          address: '0xf52cdcd458bf455aed77751743180ec4a595fd3f',
        },
        migration: {
          enabled: true,
          message: 'Idle now supports yield farming and governance tokens distribution. Migrate now your SUSD with just one click!',
          oldContract: {
            abi: IdleTokenV3,
            token: 'idleSUSD',
            name: 'idleSUSDYieldV3',
            address: '0xe79e177d2a5c7085027d7c64c8f271c81430fc9b',
          },
          migrationContract: {
            abi: IdleConverterPersonalSignV4,
            token: 'idleSUSD',
            name: 'IdleConverterV4',
            address: '0xa55caa40b32a02becfad1d0d29c4f1cf38c4c743',
            oldAddresses: [],
            functions: [
              {
                label: 'Migrate',
                name: 'migrateFromToIdle'
              },
            ]
          }
        },
        protocols: [
          {
            name: 'aave',
            enabled: true,
            abi: aToken,
            address: '0x625aE63000f46200499120B906716420bd059240',
            token: 'aSUSD',
            decimals: 18,
            functions: {

            }
          },
          {
            name: 'aavev2',
            enabled: true,
            abi: aToken,
            address: '0x6c5024cd4f8a59110119c56f8933403a539555eb',
            token: 'aSUSDv2',
            decimals: 18,
            functions: {

            }
          }
        ]
      },
      TUSD: {
        decimals: 18,
        token: 'TUSD',
        enabled: true,
        abi: ERC20.abi,
        govTokensDisabled: false,
        skipMintForDeposit: false,
        color: 'hsl(217, 100%, 20%)',
        address: '0x0000000000085d4780b73119b644ae5ecd22b376',
        wyre: {
          destCurrency: 'TUSD'
        },
        defiPrime: {
          token: 'tusd'
        },
        idle: {
          abi: IdleTokenV4,
          token: 'idleTUSDYield',
          address: '0xc278041fDD8249FE4c1Aad1193876857EEa3D68c',
        },
        migration: {
          enabled: true,
          message: 'Idle now supports yield farming and governance tokens distribution. Migrate now your TUSD with just one click!',
          oldContract: {
            abi: IdleTokenV3,
            token: 'idleTUSD',
            name: 'idleTUSDYieldV3',
            address: '0x51C77689A9c2e8cCBEcD4eC9770a1fA5fA83EeF1',
          },
          migrationContract: {
            abi: IdleConverterPersonalSignV4,
            token: 'idleTUSD',
            name: 'IdleConverterV4',
            address: '0xa55caa40b32a02becfad1d0d29c4f1cf38c4c743',
            oldAddresses: [],
            functions: [
              {
                label: 'Migrate',
                name: 'migrateFromToIdle'
              },
            ]
          }
        },
        protocols: [
          {
            name: 'aave',
            enabled: true,
            abi: aToken,
            address: '0x4da9b813057d04baef4e5800e36083717b4a0341',
            token: 'aTUSD',
            decimals: 18,
            functions: {

            }
          },
          {
            abi: aToken,
            enabled: true,
            name: 'aavev2',
            token: 'aTUSDv2',
            address: '0x101cc05f4A51C0319f570d5E146a8C625198e636',
            decimals: 18,
            functions: {

            }
          }
        ]
      },
      WETH: {
        abi: WETH,
        token: 'WETH',
        decimals: 18,
        enabled: true,
        govTokensDisabled: false,
        color: 'hsl(40, 95%, 59%)',
        address: '0xc02aaa39b223fe8d0a0e5c4f27ead9083c756cc2',
        deposit: {
          minAmountForMint: 5000,
        },
        wyre: {
          destCurrency: 'WETH'
        },
        ramp: {
          swapAsset: 'WETH'
        },
        defiPrime: {
          token: 'weth'
        },
        idle: {
          abi: IdleTokenV4,
          token: 'idleWETHYield',
          address: '0xC8E6CA6E96a326dC448307A5fDE90a0b21fd7f80',
        },
        protocols: [
          {
            enabled: true,
            abi: cToken.abi,
            name: 'compound',
            address: '0x4Ddc2D193948926D02f9B1fE9e1daa0718270ED5',
            token: 'cETH',
            decimals: 28,
            functions: {
              exchangeRate: {
                name: 'exchangeRateStored',
                params: []
              }
            },
          },
          {
            abi: aToken,
            name: 'aavev2',
            enabled: true,
            address: '0x030bA81f1c18d280636F32af80b9AAd02Cf0854e',
            token: 'aWETH',
            decimals: 18,
            functions: {

            }
          },
        ]
      },
      WBTC: {
        decimals: 8,
        token: 'WBTC',
        enabled: true,
        abi: ERC20.abi,
        govTokensDisabled: false,
        color: 'hsl(29, 81%, 59%)',
        address: '0x2260fac5e5542a773aa44fbcfedf7c193bc2c599',
        deposit: {
          minAmountForMint: 5000,
        },
        wyre: {
          destCurrency: 'WBTC'
        },
        defiPrime: {
          token: 'wbtc'
        },
        idle: {
          abi: IdleTokenV4,
          token: 'idleWBTCYield',
          address: '0x8C81121B15197fA0eEaEE1DC75533419DcfD3151',
        },
        migration: {
          enabled: true,
          message: 'Idle now supports yield farming and governance tokens distribution. Migrate now your WBTC with just one click!',
          oldContract: {
            abi: IdleTokenV3,
            token: 'idleWBTC',
            name: 'idleWBTCYieldV3',
            address: '0xD6f279B7ccBCD70F8be439d25B9Df93AEb60eC55'
          },
          migrationContract: {
            abi: IdleConverterPersonalSignV4,
            token: 'idleWBTC',
            name: 'IdleConverterV4',
            address: '0xa55caa40b32a02becfad1d0d29c4f1cf38c4c743',
            oldAddresses: [],
            functions: [
              {
                label: 'Migrate',
                name: 'migrateFromToIdle'
              },
            ]
          }
        },
        protocols: [
          {
            enabled: true,
            token: 'cWBTC',
            abi: cToken.abi,
            name: 'compound',
            address: '0xccF4429DB6322D5C611ee964527D42E5d685DD6a',
            decimals: 18,
            functions: {
              exchangeRate: {
                name: 'exchangeRateStored',
                params: []
              }
            },
          },
          {
            abi: iToken,
            decimals: 18,
            token: 'iWBTC',
            enabled: false,
            name: 'fulcrum',
            address: '0xba9262578efef8b3aff7f60cd629d6cc8859c8b5',
            functions: {
              exchangeRate: {
                name: 'tokenPrice',
                params: []
              }
            },
          },
          {
            abi: aToken,
            name: 'aave',
            enabled: true,
            token: 'aWBTC',
            address: '0xfc4b8ed459e00e5400be803a9bb3954234fd50e3',
            decimals: 18,
            functions: {

            }
          },
          {
            abi: aToken,
            enabled: true,
            name: 'aavev2',
            token: 'aWBTCv2',
            address: '0x9ff58f4fFB29fA2266Ab25e75e2A8b3503311656',
            decimals: 18,
            functions: {

            }
          }
        ]
      },
      RAI: {
        deposit: {},
        token: 'RAI',
        decimals: 18,
        enabled: true,
        abi: ERC20.abi,
        enabledEnvs: [],
        govTokensDisabled: false,
        color: 'hsl(169,42%,37%)',
        icon: 'images/tokens/RAI.png',
        address: '0x03ab458634910aad20ef5f1c8ee96f1d6ac54919',
        idle: {
          abi: IdleTokenV4,
          token: 'idleRAIYield',
          address: '0x5C960a3DCC01BE8a0f49c02A8ceBCAcf5D07fABe',
        },
        protocols: [
          {
            abi: crToken,
            decimals: 28,
            enabled: true,
            name: 'cream',
            token: 'crRAI',
            functions: {
              exchangeRate: {
                name: 'exchangeRateStored',
                params: []
              }
            },
            address: '0xf8445c529d363ce114148662387eba5e62016e20',
          },
          {
            abi: fToken,
            decimals: 28,
            name: 'fuse',
            token: 'fRAI',
            enabled: true,
            functions: {
              exchangeRate: {
                name: 'exchangeRateStored',
                params: []
              }
            },
            address: '0x752F119bD4Ee2342CE35E2351648d21962c7CAfE',
          }
        ]
      },
      FEI: {
        deposit: {},
        token: 'FEI',
        decimals: 18,
        enabled: true,
        abi: ERC20.abi,
        enabledEnvs: [],
        govTokensDisabled: false,
        color: 'hsl(158, 64%, 37%)',
        address: '0x956f47f50a910163d8bf957cf5846d573e7f87ca',
        idle: {
          abi: IdleTokenV4,
          token: 'idleFEIYield',
          address: '0xb2d5CB72A621493fe83C6885E4A776279be595bC',
        },
        protocols: [
          {
            abi: crToken,
            decimals: 28,
            enabled: true,
            name: 'cream',
            token: 'crFEI',
            functions: {
              exchangeRate: {
                name: 'exchangeRateStored',
                params: []
              }
            },
            address: '0x8C3B7a4320ba70f8239F83770c4015B5bc4e6F91',
          },
          {
            abi: fToken,
            decimals: 28,
            name: 'fuse',
            token: 'fFEI',
            enabled: true,
            functions: {
              exchangeRate: {
                name: 'exchangeRateStored',
                params: []
              }
            },
            address: '0xd8553552f8868C1Ef160eEdf031cF0BCf9686945',
          }
        ]
      },
    },
    risk: {
      DAI: {
        abi: DAI,
        decimals: 18,
        token: 'DAI',
        enabled: true,
        govTokensDisabled: false,
        color: 'hsl(40, 95%, 59%)',
        address: '0x6b175474e89094c44da98b954eedeac495271d0f',
        wyre: {
          destCurrency: 'DAI'
        },
        ramp: {
          swapAsset: 'DAI'
        },
        defiPrime: {
          token: 'dai'
        },
        idle: {
          abi: IdleTokenV4,
          token: 'idleDAISafe',
          address: '0xa14ea0e11121e6e951e87c66afe460a00bcd6a16'
        },
        migration: {
          enabled: true,
          oldContract: {
            abi: IdleTokenV3,
            token: 'idleDAI',
            name: 'idleDAISafeV3',
            address: '0x1846bdfDB6A0f5c473dEc610144513bd071999fB'
          },
          oldProtocols: [
            {
              name: 'dydx',
              enabled: true,
              abi: yToken,
              address: '0xf424b10e1e9691ae5fb530fe4c3e6b9971013d49',
              token: 'yxDAIOld',
              decimals: 18,
              functions: {
                exchangeRate: {
                  name: 'price',
                  params: []
                }
              }
            }
          ],
          migrationContract: {
            abi: IdleConverterPersonalSignV4,
            token: 'idleDAI',
            name: 'IdleConverterV4',
            address: '0xa55caa40b32a02becfad1d0d29c4f1cf38c4c743',
            oldAddresses: [],
            functions: [
              {
                label: 'Migrate',
                name: 'migrateFromToIdle'
              },
            ]
          }
        },
        protocols: [
          {
            name: 'compound',
            enabled: true,
            abi: cToken.abi,
            address: '0x5d3a536E4D6DbD6114cc1Ead35777bAB948E3643',
            token: 'cDAI',
            decimals: 28,
            functions: {
              exchangeRate: {
                name: 'exchangeRateStored',
                params: []
              }
            },
          },
          {
            name: 'fulcrum',
            enabled: false,
            abi: iToken,
            address: '0x493c57c4763932315a328269e1adad09653b9081',
            token: 'iDAI',
            decimals: 18,
            functions: {
              exchangeRate: {
                name: 'tokenPrice',
                params: []
              }
            },
          },
          {
            name: 'aave',
            enabled: true,
            abi: aToken,
            address: '0xfC1E690f61EFd961294b3e1Ce3313fBD8aa4f85d',
            token: 'aDAI',
            decimals: 18,
            functions: {

            }
          },
          {
            name: 'dsr',
            enabled: true,
            abi: CHAI,
            address: '0x06AF07097C9Eeb7fD685c692751D5C66dB49c215',
            token: 'CHAI',
            decimals: 18,
            functions: {

            }
          },
          {
            name: 'dydx',
            enabled: true,
            abi: yToken,
            address: '0xb299BCDF056d17Bd1A46185eCA8bCE458B00DC4a',
            token: 'yxDAI',
            decimals: 18,
            functions: {
              exchangeRate: {
                name: 'price',
                params: []
              }
            }
          }
        ]
      },
      USDC: {
        decimals: 6,
        token: 'USDC',
        enabled: true,
        abi: ERC20.abi,
        govTokensDisabled: false,
        color: 'hsl(211, 67%, 47%)',
        address: '0xa0b86991c6218b36c1d19d4a2e9eb0ce3606eb48',
        deposit: {
          minAmountForMint: 10000,
        },
        wyre: {
          destCurrency: 'USDC'
        },
        defiPrime: {
          token: 'usdc'
        },
        idle: {
          abi: IdleTokenV4,
          token: 'idleUSDCSafe',
          address: '0x3391bc034f2935ef0e1e41619445f998b2680d35'
        },
        migration: {
          enabled: true,
          oldContract: {
            abi: IdleTokenV3,
            token: 'idleUSDC',
            name: 'idleUSDCSafeV3',
            address: '0xcDdB1Bceb7a1979C6caa0229820707429dd3Ec6C',
          },
          oldProtocols: [
            {
              name: 'dydx',
              enabled: true,
              abi: yToken,
              address: '0x0d81b042bb9939b4d32cdf7861774c442a2685ce',
              token: 'yxUSDCOld',
              decimals: 18,
              functions: {
                exchangeRate: {
                  name: 'price',
                  params: []
                }
              }
            }
          ],
          migrationContract: {
            abi: IdleConverterPersonalSignV4,
            token: 'idleUSDC',
            name: 'IdleConverterV4',
            address: '0xa55caa40b32a02becfad1d0d29c4f1cf38c4c743',
            oldAddresses: [],
            functions: [
              {
                label: 'Migrate',
                name: 'migrateFromToIdle'
              },
            ]
          }
        },
        protocols: [
          {
            name: 'compound',
            enabled: true,
            abi: cToken.abi,
            address: '0x39aa39c021dfbae8fac545936693ac917d5e7563',
            token: 'cUSDC',
            decimals: 16,
            functions: {
              exchangeRate: {
                name: 'exchangeRateStored',
                params: []
              }
            },
          },
          {
            name: 'fulcrum',
            enabled: false,
            abi: iToken,
            address: '0xf013406a0b1d544238083df0b93ad0d2cbe0f65f',
            token: 'iUSDC',
            decimals: 18,
            functions: {
              exchangeRate: {
                name: 'tokenPrice',
                params: []
              }
            },
          },
          {
            name: 'aave',
            enabled: true,
            abi: aToken,
            address: '0x9bA00D6856a4eDF4665BcA2C2309936572473B7E',
            token: 'aUSDC',
            decimals: 18,
            functions: {

            }
          },
          {
            name: 'dydx',
            enabled: true,
            abi: yToken,
            address: '0xd2F45883627f26EC34825486ca4c25235A0da0C3',
            token: 'yxUSDC',
            decimals: 18,
            functions: {
              exchangeRate: {
                name: 'price',
                params: []
              }
            }
          }
        ]
      },
      USDT: {
        decimals: 6,
        token: 'USDT',
        enabled: true,
        abi: ERC20.abi,
        govTokensDisabled: false,
        color: 'hsl(211, 67%, 47%)',
        address: '0xdac17f958d2ee523a2206206994597c13d831ec7',
        wyre: {
          destCurrency: 'USDT'
        },
        defiPrime: {
          token: 'usdt'
        },
        idle: {
          abi: IdleTokenV4,
          token: 'idleUSDTSafe',
          address: '0x28fAc5334C9f7262b3A3Fe707e250E01053e07b5'
        },
        migration: {
          enabled: true,
          oldContract: {
            abi: IdleTokenV3,
            token: 'idleUSDT',
            name: 'idleUSDTSafeV3',
            address: '0x42740698959761baf1b06baa51efbd88cb1d862b'
          },
          migrationContract: {
            abi: IdleConverterPersonalSignV4,
            token: 'idleDAI',
            name: 'IdleConverterV4',
            address: '0xa55caa40b32a02becfad1d0d29c4f1cf38c4c743',
            oldAddresses: [],
            functions: [
              {
                label: 'Migrate',
                name: 'migrateFromToIdle'
              },
            ]
          }
        },
        protocols: [
          {
            name: 'compound',
            enabled: true,
            abi: cToken.abi,
            address: '0xf650c3d88d12db855b8bf7d11be6c55a4e07dcc9',
            token: 'cUSDT',
            decimals: 16,
            functions: {
              exchangeRate: {
                name: 'exchangeRateStored',
                params: []
              }
            },
          },
          {
            name: 'fulcrum',
            enabled: false,
            abi: iToken,
            address: '0x8326645f3aa6de6420102fdb7da9e3a91855045b',
            token: 'iUSDT',
            decimals: 18,
            functions: {
              exchangeRate: {
                name: 'tokenPrice',
                params: []
              }
            },
          },
          {
            name: 'aave',
            enabled: true,
            abi: aToken,
            address: '0x71fc860F7D3A592A4a98740e39dB31d25db65ae8',
            token: 'aUSDT',
            decimals: 18,
            functions: {

            }
          }
        ]
      }
    }
  },
  1: { // Mainnet
    best: {
      DAI: {
        abi: DAI,
        token: 'DAI',
        decimals: 18,
        enabled: true,
        govTokensDisabled: false,
        color: 'hsl(40, 95%, 59%)',
        address: '0x6b175474e89094c44da98b954eedeac495271d0f',
        deposit: {
          minAmountForMint: 10000,
        },
        wyre: {
          destCurrency: 'DAI'
        },
        ramp: {
          swapAsset: 'DAI'
        },
        defiPrime: {
          token: 'dai'
        },
        idle: {
          abi: IdleTokenV4,
          token: 'idleDAIYield',
          address: '0x3fe7940616e5bc47b0775a0dccf6237893353bb4',
        },
        migration: {
          enabled: true,
          message: 'Idle now supports yield farming and governance tokens distribution. Migrate now your DAI with just one click!',
          oldContract: {
            abi: IdleTokenV3,
            token: 'idleDAI',
            name: 'idleDAIYieldV3',
            address: '0x78751b12da02728f467a44eac40f5cbc16bd7934',
          },
          oldProtocols: [
            {
              name: 'dydx',
              enabled: true,
              abi: yToken,
              address: '0xf424b10e1e9691ae5fb530fe4c3e6b9971013d49',
              token: 'yxDAIOld',
              decimals: 18,
              functions: {
                exchangeRate: {
                  name: 'price',
                  params: []
                }
              }
            }
          ],
          migrationContract: {
            token: 'idleDAI',
            abi: IdleConverterPersonalSignV4,
            name: 'IdleConverterV4',
            address: '0xa55caa40b32a02becfad1d0d29c4f1cf38c4c743',
            oldAddresses: [],
            functions: [
              {
                label: 'Migrate',
                name: 'migrateFromToIdle'
              },
            ]
          }
        },
        protocols: [
          {
            defiScore: 7.9,
            enabled: true,
            abi: cToken.abi,
            name: 'compound',
            address: '0x5d3a536E4D6DbD6114cc1Ead35777bAB948E3643',
            token: 'cDAI',
            decimals: 28,
            functions: {
              exchangeRate: {
                name: 'exchangeRateStored',
                params: []
              }
            },
          },
          {
            abi: iToken,
            enabled: false,
            name: 'fulcrum',
            address: '0x493c57c4763932315a328269e1adad09653b9081',
            token: 'iDAI',
            decimals: 18,
            functions: {
              exchangeRate: {
                name: 'tokenPrice',
                params: []
              }
            },
          },
          {
            defiScore: 7.4,
            abi: aToken,
            name: 'aave',
            enabled: true,
            address: '0xfC1E690f61EFd961294b3e1Ce3313fBD8aa4f85d',
            token: 'aDAI',
            decimals: 18,
            functions: {

            }
          },
          {
            defiScore: 7.4,
            abi: aToken,
            name: 'aavev2',
            enabled: true,
            address: '0x028171bCA77440897B824Ca71D1c56caC55b68A3',
            token: 'aDAIv2',
            decimals: 18,
            functions: {

            }
          },
          {
            abi: CHAI,
            name: 'dsr',
            enabled: true,
            address: '0x06AF07097C9Eeb7fD685c692751D5C66dB49c215',
            token: 'CHAI',
            decimals: 18,
            functions: {

            }
          },
          {
            defiScore: 7.7,
            abi: yToken,
            name: 'dydx',
            enabled: true,
            address: '0xb299BCDF056d17Bd1A46185eCA8bCE458B00DC4a',
            token: 'yxDAI',
            decimals: 18,
            functions: {
              exchangeRate: {
                name: 'price',
                params: []
              }
            }
          }
        ]
      },
      USDC: {
        abi: USDC,
        decimals: 6,
        token: 'USDC',
        enabled: true,
        govTokensDisabled: false,
        color: 'hsl(211, 67%, 47%)',
        address: '0xa0b86991c6218b36c1d19d4a2e9eb0ce3606eb48',
        deposit: {
          minAmountForMint: 10000,
        },
        wyre: {
          destCurrency: 'USDC'
        },
        defiPrime: {
          token: 'usdc'
        },
        idle: {
          abi: IdleTokenV4,
          token: 'idleUSDCYield',
          address: '0x5274891bEC421B39D23760c04A6755eCB444797C',
        },
        migration: {
          enabled: true,
          message: 'Idle now supports yield farming and governance tokens distribution. Migrate now your USDC with just one click!',
          oldContract: {
            abi: IdleTokenV3,
            token: 'idleUSDC',
            name: 'idleUSDCYieldV3',
            address: '0x12B98C621E8754Ae70d0fDbBC73D6208bC3e3cA6'
          },
          oldProtocols: [
            {
              abi: yToken,
              name: 'dydx',
              enabled: true,
              address: '0x0d81b042bb9939b4d32cdf7861774c442a2685ce',
              token: 'yxUSDCOld',
              decimals: 18,
              functions: {
                exchangeRate: {
                  name: 'price',
                  params: []
                }
              }
            }
          ],
          migrationContract: {
            abi: IdleConverterPersonalSignV4,
            token: 'idleUSDC',
            name: 'IdleConverterV4',
            address: '0xa55caa40b32a02becfad1d0d29c4f1cf38c4c743',
            oldAddresses: [],
            functions: [
              {
                label: 'Migrate',
                name: 'migrateFromToIdle'
              },
            ]
          }
        },
        protocols: [
          {
            defiScore: 8.0,
            enabled: true,
            abi: cToken.abi,
            name: 'compound',
            address: '0x39aa39c021dfbae8fac545936693ac917d5e7563',
            token: 'cUSDC',
            decimals: 16,
            functions: {
              exchangeRate: {
                name: 'exchangeRateStored',
                params: []
              }
            },
          },
          {
            name: 'fulcrum',
            enabled: false,
            abi: iToken,
            address: '0xf013406a0b1d544238083df0b93ad0d2cbe0f65f',
            token: 'iUSDC',
            decimals: 18,
            functions: {
              exchangeRate: {
                name: 'tokenPrice',
                params: []
              }
            },
          },
          {
            defiScore: 7.4,
            name: 'aave',
            enabled: true,
            abi: aToken,
            address: '0x9bA00D6856a4eDF4665BcA2C2309936572473B7E',
            token: 'aUSDC',
            decimals: 18,
            functions: {

            }
          },
          {
            defiScore: 7.4,
            abi: aToken,
            decimals: 18,
            enabled: true,
            name: 'aavev2',
            token: 'aUSDCv2',
            address: '0xBcca60bB61934080951369a648Fb03DF4F96263C',
            functions: {

            }
          },
          {
            defiScore: 7.8,
            name: 'dydx',
            enabled: true,
            abi: yToken,
            address: '0xd2F45883627f26EC34825486ca4c25235A0da0C3',
            token: 'yxUSDC',
            decimals: 18,
            functions: {
              exchangeRate: {
                name: 'price',
                params: []
              }
            }
          }
        ]
      },
      USDT: {
        decimals: 6,
        token: 'USDT',
        enabled: true,
        abi: ERC20.abi,
        govTokensDisabled: false,
        color: 'hsl(211, 67%, 47%)',
        address: '0xdac17f958d2ee523a2206206994597c13d831ec7',
        wyre: {
          destCurrency: 'USDT'
        },
        defiPrime: {
          token: 'usdt'
        },
        idle: {
          abi: IdleTokenV4,
          token: 'idleUSDTYield',
          address: '0xF34842d05A1c888Ca02769A633DF37177415C2f8',
        },
        migration: {
          enabled: true,
          message: 'Idle now supports yield farming and governance tokens distribution. Migrate now your USDT with just one click!',
          oldContract: {
            abi: IdleTokenV3,
            token: 'idleUSDT',
            name: 'idleUSDTYieldV3',
            address: '0x63D27B3DA94A9E871222CB0A32232674B02D2f2D'
          },
          migrationContract: {
            abi: IdleConverterPersonalSignV4,
            token: 'idleUSDT',
            name: 'IdleConverterV4',
            address: '0xa55caa40b32a02becfad1d0d29c4f1cf38c4c743',
            oldAddresses: [],
            functions: [
              {
                label: 'Migrate',
                name: 'migrateFromToIdle'
              },
            ]
          }
        },
        protocols: [
          {
            defiScore: 7.9,
            name: 'compound',
            enabled: true,
            abi: cToken.abi,
            address: '0xf650c3d88d12db855b8bf7d11be6c55a4e07dcc9',
            token: 'cUSDT',
            decimals: 16,
            functions: {
              exchangeRate: {
                name: 'exchangeRateStored',
                params: []
              }
            },
          },
          {
            name: 'fulcrum',
            enabled: false,
            abi: iToken,
            address: '0x8326645f3aa6de6420102fdb7da9e3a91855045b',
            token: 'iUSDT',
            decimals: 18,
            functions: {
              exchangeRate: {
                name: 'tokenPrice',
                params: []
              }
            },
          },
          {
            defiScore: 7.2,
            name: 'aave',
            enabled: true,
            abi: aToken,
            address: '0x71fc860F7D3A592A4a98740e39dB31d25db65ae8',
            token: 'aUSDT',
            decimals: 18,
            functions: {

            }
          },
          {
            defiScore: 7.2,
            abi: aToken,
            decimals: 18,
            name: 'aavev2',
            enabled: true,
            token: 'aUSDTv2',
            address: '0x3ed3b47dd13ec9a98b44e6204a523e766b225811',
            functions: {

            }
          }
        ]
      },
      SUSD: {
        decimals: 18,
        token: 'SUSD',
        enabled: true,
        abi: ERC20.abi,
        govTokensDisabled: false,
        skipMintForDeposit: false,
        color: 'hsl(250, 31%, 15%)',
        // icon:'images/tokens/SUSD.svg',
        address: '0x57ab1ec28d129707052df4df418d58a2d46d5f51',
        wyre: {
          destCurrency: 'SUSD'
        },
        defiPrime: {
          token: 'susd'
        },
        idle: {
          abi: IdleTokenV4,
          token: 'idleSUSDYield',
          address: '0xf52cdcd458bf455aed77751743180ec4a595fd3f',
        },
        migration: {
          enabled: true,
          message: 'Idle now supports yield farming and governance tokens distribution. Migrate now your SUSD with just one click!',
          oldContract: {
            abi: IdleTokenV3,
            token: 'idleSUSD',
            name: 'idleSUSDYieldV3',
            address: '0xe79e177d2a5c7085027d7c64c8f271c81430fc9b',
          },
          migrationContract: {
            abi: IdleConverterPersonalSignV4,
            token: 'idleSUSD',
            name: 'IdleConverterV4',
            address: '0xa55caa40b32a02becfad1d0d29c4f1cf38c4c743',
            oldAddresses: [],
            functions: [
              {
                label: 'Migrate',
                name: 'migrateFromToIdle'
              },
            ]
          }
        },
        protocols: [
          {
            defiScore: 7.2,
            name: 'aave',
            enabled: true,
            abi: aToken,
            address: '0x625aE63000f46200499120B906716420bd059240',
            token: 'aSUSD',
            decimals: 18,
            functions: {

            }
          },
          {
            defiScore: 7.2,
            name: 'aavev2',
            enabled: true,
            abi: aToken,
            address: '0x6c5024cd4f8a59110119c56f8933403a539555eb',
            token: 'aSUSDv2',
            decimals: 18,
            functions: {

            }
          }
        ]
      },
      TUSD: {
        decimals: 18,
        token: 'TUSD',
        enabled: true,
        abi: ERC20.abi,
        govTokensDisabled: false,
        skipMintForDeposit: false,
        color: 'hsl(217, 100%, 20%)',
        address: '0x0000000000085d4780b73119b644ae5ecd22b376',
        wyre: {
          destCurrency: 'TUSD'
        },
        defiPrime: {
          token: 'tusd'
        },
        idle: {
          abi: IdleTokenV4,
          token: 'idleTUSDYield',
          address: '0xc278041fDD8249FE4c1Aad1193876857EEa3D68c',
        },
        migration: {
          enabled: true,
          message: 'Idle now supports yield farming and governance tokens distribution. Migrate now your TUSD with just one click!',
          oldContract: {
            abi: IdleTokenV3,
            token: 'idleTUSD',
            name: 'idleTUSDYieldV3',
            address: '0x51C77689A9c2e8cCBEcD4eC9770a1fA5fA83EeF1',
          },
          migrationContract: {
            abi: IdleConverterPersonalSignV4,
            token: 'idleTUSD',
            name: 'IdleConverterV4',
            address: '0xa55caa40b32a02becfad1d0d29c4f1cf38c4c743',
            oldAddresses: [],
            functions: [
              {
                label: 'Migrate',
                name: 'migrateFromToIdle'
              },
            ]
          }
        },
        protocols: [
          {
            defiScore: 7.8,
            name: 'aave',
            enabled: true,
            abi: aToken,
            address: '0x4da9b813057d04baef4e5800e36083717b4a0341',
            token: 'aTUSD',
            decimals: 18,
            functions: {

            }
          },
          {
            defiScore: 7.8,
            abi: aToken,
            enabled: true,
            name: 'aavev2',
            token: 'aTUSDv2',
            address: '0x101cc05f4A51C0319f570d5E146a8C625198e636',
            decimals: 18,
            functions: {

            }
          }
        ]
      },
      WETH: {
        abi: WETH,
        token: 'WETH',
        decimals: 18,
        enabled: true,
        govTokensDisabled: false,
        color: 'hsl(40, 95%, 59%)',
        address: '0xc02aaa39b223fe8d0a0e5c4f27ead9083c756cc2',
        deposit: {
          minAmountForMint: 5000,
        },
        wyre: {
          destCurrency: 'WETH'
        },
        ramp: {
          swapAsset: 'WETH'
        },
        defiPrime: {
          token: 'weth'
        },
        idle: {
          abi: IdleTokenV4,
          token: 'idleWETHYield',
          address: '0xC8E6CA6E96a326dC448307A5fDE90a0b21fd7f80',
        },
        protocols: [
          {
            defiScore: 8.8,
            enabled: true,
            abi: cToken.abi,
            name: 'compound',
            address: '0x4Ddc2D193948926D02f9B1fE9e1daa0718270ED5',
            token: 'cETH',
            decimals: 28,
            functions: {
              exchangeRate: {
                name: 'exchangeRateStored',
                params: []
              }
            },
          },
          {
            defiScore: 8.3,
            abi: aToken,
            name: 'aavev2',
            enabled: true,
            address: '0x030bA81f1c18d280636F32af80b9AAd02Cf0854e',
            token: 'aWETH',
            decimals: 18,
            functions: {

            }
          },
        ]
      },
      WBTC: {
        decimals: 8,
        token: 'WBTC',
        enabled: true,
        abi: ERC20.abi,
        govTokensDisabled: false,
        color: 'hsl(29, 81%, 59%)',
        address: '0x2260fac5e5542a773aa44fbcfedf7c193bc2c599',
        deposit: {
          minAmountForMint: 5000,
        },
        wyre: {
          destCurrency: 'WBTC'
        },
        defiPrime: {
          token: 'wbtc'
        },
        idle: {
          abi: IdleTokenV4,
          token: 'idleWBTCYield',
          address: '0x8C81121B15197fA0eEaEE1DC75533419DcfD3151',
        },
        migration: {
          enabled: true,
          message: 'Idle now supports yield farming and governance tokens distribution. Migrate now your WBTC with just one click!',
          oldContract: {
            abi: IdleTokenV3,
            token: 'idleWBTC',
            name: 'idleWBTCYieldV3',
            address: '0xD6f279B7ccBCD70F8be439d25B9Df93AEb60eC55'
          },
          migrationContract: {
            abi: IdleConverterPersonalSignV4,
            token: 'idleWBTC',
            name: 'IdleConverterV4',
            address: '0xa55caa40b32a02becfad1d0d29c4f1cf38c4c743',
            oldAddresses: [],
            functions: [
              {
                label: 'Migrate',
                name: 'migrateFromToIdle'
              },
            ]
          }
        },
        protocols: [
          {
            defiScore: 8.9,
            enabled: true,
            token: 'cWBTC',
            abi: cToken.abi,
            name: 'compound',
            address: '0xccF4429DB6322D5C611ee964527D42E5d685DD6a',
            decimals: 18,
            functions: {
              exchangeRate: {
                name: 'exchangeRateStored',
                params: []
              }
            },
          },
          {
            abi: iToken,
            decimals: 18,
            token: 'iWBTC',
            enabled: false,
            name: 'fulcrum',
            address: '0xba9262578efef8b3aff7f60cd629d6cc8859c8b5',
            functions: {
              exchangeRate: {
                name: 'tokenPrice',
                params: []
              }
            },
          },
          {
            defiScore: 8.3,
            abi: aToken,
            name: 'aave',
            enabled: true,
            token: 'aWBTC',
            address: '0xfc4b8ed459e00e5400be803a9bb3954234fd50e3',
            decimals: 18,
            functions: {

            }
          },
          {
            defiScore: 8.3,
            abi: aToken,
            enabled: true,
            name: 'aavev2',
            token: 'aWBTCv2',
            address: '0x9ff58f4fFB29fA2266Ab25e75e2A8b3503311656',
            decimals: 18,
            functions: {

            }
          }
        ]
      },
      RAI: {
        deposit: {},
        token: 'RAI',
        decimals: 18,
        enabled: true,
        abi: ERC20.abi,
        enabledEnvs: [],
        defiScoreDisabled: true,
        govTokensDisabled: false,
        color: 'hsl(169,42%,37%)',
        icon: 'images/tokens/RAI.png',
        address: '0x03ab458634910aad20ef5f1c8ee96f1d6ac54919',
        idle: {
          abi: IdleTokenV4,
          token: 'idleRAIYield',
          address: '0x5C960a3DCC01BE8a0f49c02A8ceBCAcf5D07fABe',
        },
        protocols: [
          /*
          {
            abi:crToken,
            decimals:28,
            name:'cream',
            token:'crRAI',
            enabled:false,
            functions:{
              exchangeRate:{
                name:'exchangeRateStored',
                params:[]
              }
            },
            address:'0xf8445c529d363ce114148662387eba5e62016e20',
          },
          */
          {
            abi: fToken,
            decimals: 28,
            name: 'fuse',
            token: 'fRAI',
            enabled: true,
            functions: {
              exchangeRate: {
                name: 'exchangeRateStored',
                params: []
              }
            },
            address: '0x752F119bD4Ee2342CE35E2351648d21962c7CAfE',
          },
          {
            abi: aToken,
            decimals: 18,
            token: 'aRAI',
            enabled: true,
            name: 'aavev2',
            functions: {
            },
            address: '0xc9bc48c72154ef3e5425641a3c747242112a46af',
          }
        ]
      },
      FEI: {
        deposit: {},
        token: 'FEI',
        decimals: 18,
        enabled: true,
        abi: ERC20.abi,
        enabledEnvs: [],
        defiScoreDisabled: true,
        govTokensDisabled: false,
        color: 'hsl(158, 64%, 37%)',
        address: '0x956f47f50a910163d8bf957cf5846d573e7f87ca',
        idle: {
          abi: IdleTokenV4,
          token: 'idleFEIYield',
          address: '0xb2d5CB72A621493fe83C6885E4A776279be595bC',
        },
        protocols: [
          {
            abi: crToken,
            decimals: 28,
            enabled: true,
            name: 'cream',
            token: 'crFEI',
            functions: {
              exchangeRate: {
                name: 'exchangeRateStored',
                params: []
              }
            },
            address: '0x8C3B7a4320ba70f8239F83770c4015B5bc4e6F91',
          },
          {
            abi: fToken,
            decimals: 28,
            name: 'fuse',
            token: 'fFEI',
            enabled: true,
            functions: {
              exchangeRate: {
                name: 'exchangeRateStored',
                params: []
              }
            },
            address: '0xd8553552f8868C1Ef160eEdf031cF0BCf9686945',
          },
          {
            abi: aToken,
            decimals: 18,
            token: 'aFEI',
            enabled: true,
            functions: {},
            name: 'aavev2',
            address: '0x683923dB55Fead99A79Fa01A27EeC3cB19679cC3',
          }
        ]
      },
    },
    risk: {
      DAI: {
        abi: DAI,
        decimals: 18,
        token: 'DAI',
        enabled: true,
        govTokensDisabled: false,
        color: 'hsl(40, 95%, 59%)',
        address: '0x6b175474e89094c44da98b954eedeac495271d0f',
        wyre: {
          destCurrency: 'DAI'
        },
        ramp: {
          swapAsset: 'DAI'
        },
        defiPrime: {
          token: 'dai'
        },
        idle: {
          abi: IdleTokenV4,
          token: 'idleDAISafe',
          address: '0xa14ea0e11121e6e951e87c66afe460a00bcd6a16'
        },
        canDeposit: {
          enabled: false,
          disabledMessageRedeemKey: 'riskAdjustedDisabledMessageRedeem',
          disabledMessageDepositKey: 'riskAdjustedDisabledMessageDeposit'
        },
        migration: {
          enabled: true,
          oldContract: {
            abi: IdleTokenV3,
            token: 'idleDAI',
            name: 'idleDAISafeV3',
            address: '0x1846bdfDB6A0f5c473dEc610144513bd071999fB'
          },
          oldProtocols: [
            {
              name: 'dydx',
              enabled: true,
              abi: yToken,
              address: '0xf424b10e1e9691ae5fb530fe4c3e6b9971013d49',
              token: 'yxDAIOld',
              decimals: 18,
              functions: {
                exchangeRate: {
                  name: 'price',
                  params: []
                }
              }
            }
          ],
          migrationContract: {
            abi: IdleConverterPersonalSignV4,
            token: 'idleDAI',
            name: 'IdleConverterV4',
            address: '0xa55caa40b32a02becfad1d0d29c4f1cf38c4c743',
            oldAddresses: [],
            functions: [
              {
                label: 'Migrate',
                name: 'migrateFromToIdle'
              },
            ]
          }
        },
        protocols: [
          {
            defiScore: 7.9,
            enabled: true,
            abi: cToken.abi,
            name: 'compound',
            address: '0x5d3a536E4D6DbD6114cc1Ead35777bAB948E3643',
            token: 'cDAI',
            decimals: 28,
            functions: {
              exchangeRate: {
                name: 'exchangeRateStored',
                params: []
              }
            },
          },
          {
            name: 'fulcrum',
            enabled: false,
            abi: iToken,
            address: '0x493c57c4763932315a328269e1adad09653b9081',
            token: 'iDAI',
            decimals: 18,
            functions: {
              exchangeRate: {
                name: 'tokenPrice',
                params: []
              }
            },
          },
          {
            defiScore: 7.4,
            name: 'aave',
            enabled: true,
            abi: aToken,
            address: '0xfC1E690f61EFd961294b3e1Ce3313fBD8aa4f85d',
            token: 'aDAI',
            decimals: 18,
            functions: {

            }
          },
          {
            name: 'dsr',
            enabled: true,
            abi: CHAI,
            address: '0x06AF07097C9Eeb7fD685c692751D5C66dB49c215',
            token: 'CHAI',
            decimals: 18,
            functions: {

            }
          },
          {
            defiScore: 7.7,
            name: 'dydx',
            enabled: true,
            abi: yToken,
            address: '0xb299BCDF056d17Bd1A46185eCA8bCE458B00DC4a',
            token: 'yxDAI',
            decimals: 18,
            functions: {
              exchangeRate: {
                name: 'price',
                params: []
              }
            }
          }
        ]
      },
      USDC: {
        decimals: 6,
        token: 'USDC',
        enabled: true,
        abi: ERC20.abi,
        govTokensDisabled: false,
        color: 'hsl(211, 67%, 47%)',
        address: '0xa0b86991c6218b36c1d19d4a2e9eb0ce3606eb48',
        deposit: {
          minAmountForMint: 10000,
        },
        wyre: {
          destCurrency: 'USDC'
        },
        defiPrime: {
          token: 'usdc'
        },
        idle: {
          abi: IdleTokenV4,
          token: 'idleUSDCSafe',
          address: '0x3391bc034f2935ef0e1e41619445f998b2680d35'
        },
        canDeposit: {
          enabled: false,
          disabledMessageRedeemKey: 'riskAdjustedDisabledMessageRedeem',
          disabledMessageDepositKey: 'riskAdjustedDisabledMessageDeposit'
        },
        migration: {
          enabled: true,
          oldContract: {
            abi: IdleTokenV3,
            token: 'idleUSDC',
            name: 'idleUSDCSafeV3',
            address: '0xcDdB1Bceb7a1979C6caa0229820707429dd3Ec6C',
          },
          oldProtocols: [
            {
              name: 'dydx',
              enabled: true,
              abi: yToken,
              address: '0x0d81b042bb9939b4d32cdf7861774c442a2685ce',
              token: 'yxUSDCOld',
              decimals: 18,
              functions: {
                exchangeRate: {
                  name: 'price',
                  params: []
                }
              }
            }
          ],
          migrationContract: {
            abi: IdleConverterPersonalSignV4,
            token: 'idleUSDC',
            name: 'IdleConverterV4',
            address: '0xa55caa40b32a02becfad1d0d29c4f1cf38c4c743',
            oldAddresses: [],
            functions: [
              {
                label: 'Migrate',
                name: 'migrateFromToIdle'
              },
            ]
          }
        },
        protocols: [
          {
            defiScore: 8.0,
            name: 'compound',
            enabled: true,
            abi: cToken.abi,
            address: '0x39aa39c021dfbae8fac545936693ac917d5e7563',
            token: 'cUSDC',
            decimals: 16,
            functions: {
              exchangeRate: {
                name: 'exchangeRateStored',
                params: []
              }
            },
          },
          {
            name: 'fulcrum',
            enabled: false,
            abi: iToken,
            address: '0xf013406a0b1d544238083df0b93ad0d2cbe0f65f',
            token: 'iUSDC',
            decimals: 18,
            functions: {
              exchangeRate: {
                name: 'tokenPrice',
                params: []
              }
            },
          },
          {
            defiScore: 7.4,
            name: 'aave',
            enabled: true,
            abi: aToken,
            address: '0x9bA00D6856a4eDF4665BcA2C2309936572473B7E',
            token: 'aUSDC',
            decimals: 18,
            functions: {

            }
          },
          {
            defiScore: 7.8,
            name: 'dydx',
            enabled: true,
            abi: yToken,
            address: '0xd2F45883627f26EC34825486ca4c25235A0da0C3',
            token: 'yxUSDC',
            decimals: 18,
            functions: {
              exchangeRate: {
                name: 'price',
                params: []
              }
            }
          }
        ]
      },
      USDT: {
        decimals: 6,
        token: 'USDT',
        enabled: true,
        abi: ERC20.abi,
        govTokensDisabled: false,
        color: 'hsl(211, 67%, 47%)',
        address: '0xdac17f958d2ee523a2206206994597c13d831ec7',
        wyre: {
          destCurrency: 'USDT'
        },
        defiPrime: {
          token: 'usdt'
        },
        idle: {
          abi: IdleTokenV4,
          token: 'idleUSDTSafe',
          address: '0x28fAc5334C9f7262b3A3Fe707e250E01053e07b5'
        },
        canDeposit: {
          enabled: false,
          disabledMessageRedeemKey: 'riskAdjustedDisabledMessageRedeem',
          disabledMessageDepositKey: 'riskAdjustedDisabledMessageDeposit'
        },
        migration: {
          enabled: true,
          oldContract: {
            abi: IdleTokenV3,
            token: 'idleUSDT',
            name: 'idleUSDTSafeV3',
            address: '0x42740698959761baf1b06baa51efbd88cb1d862b'
          },
          migrationContract: {
            abi: IdleConverterPersonalSignV4,
            token: 'idleDAI',
            name: 'IdleConverterV4',
            address: '0xa55caa40b32a02becfad1d0d29c4f1cf38c4c743',
            oldAddresses: [],
            functions: [
              {
                label: 'Migrate',
                name: 'migrateFromToIdle'
              },
            ]
          }
        },
        protocols: [
          {
            defiScore: 7.9,
            name: 'compound',
            enabled: true,
            abi: cToken.abi,
            address: '0xf650c3d88d12db855b8bf7d11be6c55a4e07dcc9',
            token: 'cUSDT',
            decimals: 16,
            functions: {
              exchangeRate: {
                name: 'exchangeRateStored',
                params: []
              }
            },
          },
          {
            name: 'fulcrum',
            enabled: false,
            abi: iToken,
            address: '0x8326645f3aa6de6420102fdb7da9e3a91855045b',
            token: 'iUSDT',
            decimals: 18,
            functions: {
              exchangeRate: {
                name: 'tokenPrice',
                params: []
              }
            },
          },
          {
            defiScore: 7.2,
            name: 'aave',
            enabled: true,
            abi: aToken,
            address: '0x71fc860F7D3A592A4a98740e39dB31d25db65ae8',
            token: 'aUSDT',
            decimals: 18,
            functions: {

            }
          }
        ]
      }
    }
  }
};

export default availableTokens;