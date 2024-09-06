import { Contract, JsonRpcProvider, toBeHex, ZeroHash, solidityPackedKeccak256,
         zeroPadValue, formatUnits, encodeRlp, decodeRlp, BytesLike, hexlify
} from "ethers"

import { GetProofResponse, TokenInfo } from "./types.js";
import { Block, BlockOptions, JsonRpcBlock } from "@ethereumjs/block";
import { Common, CustomChain } from "@ethereumjs/common";

export function randomchoice<T>(array:T[]):T {
  return array[Math.floor(Math.random() * array.length)];
}

interface ChainDefinition {
  name: string;
  chain: string;
  icon?: string;
  nativeCurrency: {name:string; symbol:string; decimals:number;};
  infoURL: string;
  shortName: string;
  chainId: number;
  networkId: number;
  slip44?: number;  // https://github.com/satoshilabs/slips/blob/master/slip-0044.md
  rpcUrls: string[];
  features?: {name:string}[];
  hardfork: string;
  explorers?: {name:string;url:string;standard:string;icon?:string;}[];
  ens?: {registry:string};
  customEIPs?: number[];
  parent?: {type:string; chain:string; bridges:{url:string}[];};
  cannotMakeStorageProofs?:boolean;
}

export const chain_info: Record<number,ChainDefinition> = {
    1: {
        "name": "Ethereum Mainnet",
        "chain": "ETH",
        "icon": "ethereum",
        "rpcUrls": [
          "https://eth-mainnet.g.alchemy.com/v2/asYK8chMrnekMUTAvVwaNG2OHyp4fLCe"
          //"https://mainnet.infura.io/v3/${INFURA_API_KEY}",
          //"wss://mainnet.infura.io/ws/v3/${INFURA_API_KEY}",
          //"https://api.mycryptoapi.com/eth",
          //"https://cloudflare-eth.com",
          //"https://ethereum.publicnode.com",
          //"wss://ethereum.publicnode.com",
          //"https://mainnet.gateway.tenderly.co",
          //"wss://mainnet.gateway.tenderly.co",
          //"https://rpc.blocknative.com/boost",
          //"https://rpc.flashbots.net",
          //"https://rpc.flashbots.net/fast",
          //"https://rpc.mevblocker.io",
          //"https://rpc.mevblocker.io/fast",
          //"https://rpc.mevblocker.io/noreverts",
          //"https://rpc.mevblocker.io/fullprivacy"
        ],
        "features": [{ "name": "EIP155" }, { "name": "EIP1559" }],
        "hardfork": "cancun",
        "nativeCurrency": {
          "name": "Ether",
          "symbol": "ETH",
          "decimals": 18
        },
        "infoURL": "https://ethereum.org",
        "shortName": "eth",
        "chainId": 1,
        "networkId": 1,
        "slip44": 60,
        "ens": {
          "registry": "0x00000000000C2E074eC69A0dFb2997BA6C7d2e1e"
        },
        "explorers": [
          {
            "name": "etherscan",
            "url": "https://etherscan.io",
            "standard": "EIP3091"
          },
          {
            "name": "blockscout",
            "url": "https://eth.blockscout.com",
            "icon": "blockscout",
            "standard": "EIP3091"
          },
          {
            "name": "dexguru",
            "url": "https://ethereum.dex.guru",
            "icon": "dexguru",
            "standard": "EIP3091"
          }
        ]
    },
    56: {
        "name": "BNB Smart Chain Mainnet",
        "chain": "BSC",
        "hardfork": "shanghai",
        // Same as cancun, but without 4788
        "customEIPs": [1153, 4844, 5656, 6780, 7516],
        "rpcUrls": [
          "https://bsc-dataseed1.bnbchain.org",
          "https://bsc-dataseed2.bnbchain.org",
          "https://bsc-dataseed3.bnbchain.org",
          "https://bsc-dataseed4.bnbchain.org",
          "https://bsc-dataseed1.defibit.io",
          "https://bsc-dataseed2.defibit.io",
          "https://bsc-dataseed3.defibit.io",
          "https://bsc-dataseed4.defibit.io",
          "https://bsc-dataseed1.ninicoin.io",
          "https://bsc-dataseed2.ninicoin.io",
          "https://bsc-dataseed3.ninicoin.io",
          "https://bsc-dataseed4.ninicoin.io",
          "https://bsc.publicnode.com",
          //"wss://bsc.publicnode.com",
          //"wss://bsc-ws-node.nariox.org"
        ],
        "nativeCurrency": {
          "name": "BNB Chain Native Token",
          "symbol": "BNB",
          "decimals": 18
        },
        "infoURL": "https://www.bnbchain.org/en",
        "shortName": "bnb",
        "chainId": 56,
        "networkId": 56,
        "slip44": 714,
        "explorers": [
          {
            "name": "bscscan",
            "url": "https://bscscan.com",
            "standard": "EIP3091"
          },
          {
            "name": "dexguru",
            "url": "https://bnb.dex.guru",
            "icon": "dexguru",
            "standard": "EIP3091"
          }
        ]
    },
    42161: {
        "name": "Arbitrum One",
        "chainId": 42161,
        "hardfork": "london",
        "shortName": "arb1",
        "chain": "ETH",
        "networkId": 42161,
        "slip44": 9001,
        "nativeCurrency": {
          "name": "Ether",
          "symbol": "ETH",
          "decimals": 18
        },
        "rpcUrls": [
          //"https://arbitrum-mainnet.infura.io/v3/${INFURA_API_KEY}",
          //"https://arb-mainnet.g.alchemy.com/v2/${ALCHEMY_API_KEY}",
          "https://arb1.arbitrum.io/rpc",
          "https://arbitrum-one.publicnode.com",
          //"wss://arbitrum-one.publicnode.com"
        ],
        "explorers": [
          {
            "name": "Arbiscan",
            "url": "https://arbiscan.io",
            "standard": "EIP3091"
          },
          {
            "name": "Arbitrum Explorer",
            "url": "https://explorer.arbitrum.io",
            "standard": "EIP3091"
          },
          {
            "name": "dexguru",
            "url": "https://arbitrum.dex.guru",
            "icon": "dexguru",
            "standard": "EIP3091"
          }
        ],
        "infoURL": "https://arbitrum.io",
        "parent": {
          "type": "L2",
          "chain": "eip155-1",
          "bridges": [{ "url": "https://bridge.arbitrum.io" }]
        }
    },
    10: {
        "name": "OP Mainnet",
        "hardfork": "cancun",
        "chain": "ETH",
        "rpcUrls": [
          "https://opt-mainnet.g.alchemy.com/v2/LTUd8wMSlbXxWBHpYyFE-WyOh2wud4Hb",
          //"https://mainnet.optimism.io",
          //"https://optimism.publicnode.com",
          //"wss://optimism.publicnode.com",
          //"https://optimism.gateway.tenderly.co",
          //"wss://optimism.gateway.tenderly.co"
        ],
        "nativeCurrency": {
          "name": "Ether",
          "symbol": "ETH",
          "decimals": 18
        },
        "infoURL": "https://optimism.io",
        "shortName": "oeth",
        "chainId": 10,
        "networkId": 10,
        "slip44": 614,
        "explorers": [
          {
            "name": "etherscan",
            "url": "https://optimistic.etherscan.io",
            "standard": "EIP3091",
            "icon": "etherscan"
          },
          {
            "name": "blockscout",
            "url": "https://optimism.blockscout.com",
            "icon": "blockscout",
            "standard": "EIP3091"
          },
          {
            "name": "dexguru",
            "url": "https://optimism.dex.guru",
            "icon": "dexguru",
            "standard": "EIP3091"
          }
        ]
    },
    137: {
        "name": "Polygon Mainnet",
        "hardfork": "london",
        "chain": "Polygon",
        "icon": "polygon",
        "rpcUrls": [
          "https://polygon-mainnet.g.alchemy.com/v2/cwgNHMG7HVg1gg_PiN2tZdr27wbW8h9d"
          //"https://polygon-rpc.com/",
          //"https://rpc-mainnet.matic.network",
          //"https://matic-mainnet.chainstacklabs.com",
          //"https://rpc-mainnet.maticvigil.com",
          //"https://rpc-mainnet.matic.quiknode.pro",
          //"https://matic-mainnet-full-rpc.bwarelabs.com",
          //"https://polygon-bor.publicnode.com",
          //"wss://polygon-bor.publicnode.com",
          //"https://polygon.gateway.tenderly.co",
          //"wss://polygon.gateway.tenderly.co"
        ],
        "nativeCurrency": {
          "name": "MATIC",
          "symbol": "MATIC",
          "decimals": 18
        },
        "infoURL": "https://polygon.technology/",
        "shortName": "matic",
        "chainId": 137,
        "networkId": 137,
        "slip44": 966,
        "explorers": [
          {
            "name": "polygonscan",
            "url": "https://polygonscan.com",
            "standard": "EIP3091"
          },
          {
            "name": "dexguru",
            "url": "https://polygon.dex.guru",
            "icon": "dexguru",
            "standard": "EIP3091"
          }
        ]
    },
    80002: {
      "name": "Polygon Testnet (Amoy)",
      "hardfork": "london",
      "chain": "polygon-testnet",
      "icon": "polygon-testnet-amoy",
      "rpcUrls": [
        "https://rpc-amoy.polygon.technology/"
      ],
      "nativeCurrency": {
        "name": "MATIC",
        "symbol": "MATIC",
        "decimals": 18
      },
      "infoURL": "https://polygon.technology/blog/introducing-the-amoy-testnet-for-polygon-pos",
      "shortName": "polygon-amoy",
      "chainId": 80002,
      "networkId": 80002,
      "explorers": [
        {
          name: "polygonscan-amoy",
          url: "https://amoy.polygonscan.com/",
          standard: "EIP3091"
        }
      ]
    },
    23294: {
      chainId: 0x5afe,
      networkId: 0x5afe,
      hardfork: 'london',
      name: 'Oasis Sapphire',
      chain: 'oasis',
      shortName: 'sapphire',
      cannotMakeStorageProofs: true,
      infoURL: 'https://oasisprotocol.org/sapphire',
      icon: 'https://votee.oasis.io/rose.png',
      nativeCurrency: {
        name: 'ROSE',
        symbol: 'ROSE',
        decimals: 18,
      },
      rpcUrls: [
        'https://sapphire.oasis.io/',
        //'wss://sapphire.oasis.io/ws'
      ],
      explorers: [
        {
          name: 'Oasis Sapphire Mainnet Explorer',
          url: 'https://explorer.oasis.io/mainnet/sapphire',
          standard: 'EIP3091'
        }
      ],
    },
    23295: {
      chainId: 0x5aff,
      networkId: 0x5aff,
      hardfork: 'london',
      name: 'Oasis Sapphire Testnet',
      chain: 'oasis-testnet',
      shortName: 'sapphire-testnet',
      cannotMakeStorageProofs: true,
      infoURL: 'https://docs.oasis.io/node/testnet/',
      icon: 'https://votee.oasis.io/rose.png',
      nativeCurrency: { name: 'TEST', symbol: 'TEST', decimals: 18 },
      rpcUrls: [
        'https://testnet.sapphire.oasis.dev/',
        //'wss://testnet.sapphire.oasis.dev/ws'
      ],
      explorers: [
        {
          url: 'https://explorer.oasis.io/testnet/sapphire',
          name: 'Oasis Sapphire Testnet Explorer',
          standard: 'EIP3091'
        }
      ],
    },
    23293: {
      chainId: 0x5afd,
      networkId: 0x5afd,
      hardfork: 'london',
      chain: 'oasis-localnet',
      infoURL: 'https://github.com/oasisprotocol/oasis-web3-gateway/pkgs/container/sapphire-localnet',
      name: 'Sapphire Localnet',
      shortName: 'sapphire-localnet',
      cannotMakeStorageProofs: true,
      icon: 'https://votee.oasis.io/rose.png',
      nativeCurrency: {
        name: 'ROSE',
        symbol: 'ROSE',
        decimals: 18,
      },
      rpcUrls: [
        'http://localhost:8545/',
        //'ws://localhost:8546'
      ],
    },
} as const;

function _getNameAndChainidMap() {
  const res: Record<string,number> = {};
  for( const x in chain_info ) {
    const y = chain_info[x];
    res[y.name] = y.chainId;
  }
  return res;
}

export const xchain_ChainNamesToChainId = _getNameAndChainidMap();

export function xchainRPC(chainId:number)
{
    if( ! (chainId in chain_info) ) {
        throw new Error(`Unknown chain: ${chainId}`);
    }

    const info = chain_info[chainId];
    const rpc_url = randomchoice(info.rpcUrls as string[]);
    console.log('Using RPC URL', rpc_url);
    return new JsonRpcProvider(rpc_url);
}

export async function tokenDetailsFromProvider(addr:string, provider:JsonRpcProvider) : Promise<TokenInfo>
{
  const abi = [
    "function name() public view returns (string)",
    "function symbol() public view returns (string)",
    "function decimals() public view returns (uint8)",
    "function totalSupply() public view returns (uint256)",
  ];
  const c = new Contract(addr, abi, provider);
  const network = await provider.getNetwork();
  return {
    addr: addr,
    chainId: network.chainId,
    name: await c.name(),
    symbol: await c.symbol(),
    decimals: await c.decimals(),
    totalSupply: await c.totalSupply(),
  }
}


export async function getHolderBalance(token:string, holder:string, provider:JsonRpcProvider) : Promise<bigint>
{
  return await new Contract(token, [
    "function balanceOf(address) public view returns (uint256)",
  ], provider).balanceOf(holder);
}

export function getMapSlot(holderAddress: string, mappingPosition: number): string {
  return solidityPackedKeccak256(
    ["bytes", "uint256"],
    [zeroPadValue(holderAddress, 32), mappingPosition]
  );
}

export async function isERCTokenContract(provider: JsonRpcProvider, address: string): Promise<boolean> {
  try {
    await tokenDetailsFromProvider(address, provider);
  } catch (e) {
    return false
  }

  return true;
}

export async function guessStorageSlot(provider: JsonRpcProvider, account: string, holder: string, blockHash = 'latest'): Promise<{index:number,balance:bigint,balanceDecimal:string} | null> {
  const tokenDetails = await tokenDetailsFromProvider(account, provider);
  const abi = ["function balanceOf(address account) view returns (uint256)"];
  const c = new Contract(account, abi, provider);
  const balance = await c.balanceOf(holder) as bigint;
  console.log('Balance is', typeof balance, balance);
  const balanceInHex = toBeHex(balance, 32);

  // shortlist most frequently used slots, then do brute force
  let shortlist = [
    0x65, // Aragon Test Xi (Mumbai) 0xb707dfe506ce7e10374c14de6891da3059d989b2
    0x1,  // Tally Compound (Ethereum) 0xc00e94Cb662C3520282E6f5717214004A7f26888
    0x33  // DAO Haus Test Xi (Polygon) 0x4d0a8159B88139341c1d1078C8A97ff6001dda91
  ];

  let restOfList = [...Array(256).keys()].filter(i => !shortlist.includes(i));

  // Query most likely range of slots
  for( const i of shortlist.concat(restOfList) ) {
    const result = await provider.send('eth_getStorageAt', [
      account,
      getMapSlot(holder, i),
      blockHash,
    ]);

    if (result == balanceInHex && result != ZeroHash) {
      return {
        index: i,
        balance,
        balanceDecimal: formatUnits(balance, tokenDetails.decimals)
      };
    }
  }

  return null;
}

export async function fetchStorageProof(provider: JsonRpcProvider, blockHash: string, address: string, slot: number, holder: string): Promise<BytesLike> {
  // TODO Probably unpack and verify
  const response = await provider.send('eth_getProof', [
    address,
    [getMapSlot(holder, slot)],
    blockHash,
  ]) as GetProofResponse;
  return encodeRlp(response.storageProof[0].proof.map(decodeRlp));
}

export async function fetchAccountProof(provider: JsonRpcProvider, blockHash: string, address: string): Promise<BytesLike> {
  const response = await provider.send('eth_getProof', [
    address,
    [],
    blockHash,
  ]) as GetProofResponse;
  return encodeRlp(response.accountProof.map(decodeRlp));
}

export const ETHEREUMJS_POLYGON_BLOCK_OPTIONS = {
  common: Common.custom(CustomChain.PolygonMainnet, {hardfork: 'london'}),
  skipConsensusFormatValidation: true
} as BlockOptions;

/// Retrieve RLP encoded block header
export async function getBlockHeaderRLP(
  provider: JsonRpcProvider,
  blockHash: string
) {
  // Detect which chain RPC provider is, construct custom chain config with hardfork
  const net = await provider.getNetwork();
  const chainId = Number(net.chainId);
  if( ! chainId ) {
    throw new Error("Unable to determine chain ID!");
  }
  if( ! (chainId in chain_info) ) {
    throw new Error("Unsupported chain ID");
  }
  const chain = chain_info[chainId];
  if( ! chain.hardfork ) {
    throw new Error("Unknown hardfork for chain!");
  }

  const opts = {
    common: Common.custom(CustomChain.PolygonMainnet, {
      hardfork: chain.hardfork,
    }),
    skipConsensusFormatValidation: true
  } as BlockOptions;

  // Some chains need specific EIPs enabled
  if( chain.customEIPs ) {
    const customEIPs: number[] = chain.customEIPs;
    opts.common!.setEIPs(customEIPs);
  }

  const result = await provider.send('eth_getBlockByHash', [blockHash, false]) as JsonRpcBlock;

  const b = Block.fromRPC(result, [], opts);
  return hexlify(b.header.serialize());
}
