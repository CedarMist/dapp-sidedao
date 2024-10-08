import detectEthereumProvider from '@metamask/detect-provider'
import { EthereumContext, EthereumState } from './EthereumContext'
import { FC, PropsWithChildren, useEffect, useState } from 'react'
import { BrowserProvider, JsonRpcApiProvider, JsonRpcProvider, JsonRpcSigner, ZeroAddress } from 'ethers'
import { wrapEthersProvider, NETWORKS as SAPPHIRE_NETWORKS, wrapEthersSigner } from '@oasisprotocol/sapphire-ethers-v6'
import { DemoConnectionStatus, DemoNetwork, demoNetworkFromChainId } from '../utils/crypto.demo'
import { DemoEIP1193Provider } from '../utils/eip1193.demo'
import { VITE_WEB3_GATEWAY } from '../constants/config'

const ethereumInitialState: EthereumState = {
  signer: undefined,
  provider: wrapEthersProvider(new JsonRpcProvider(VITE_WEB3_GATEWAY, 'any')),
  network: DemoNetwork.FromConfig,
  address: undefined,
  status: DemoConnectionStatus.Unknown,
  isSapphire: false,
}

export const EthereumContextProvider: FC<PropsWithChildren> = ({ children }) => {
  const [ethProvider, setEthProvider] = useState<DemoEIP1193Provider | null>(null)
  const [userAddress, setUserAddress] = useState<string>(ZeroAddress)

  const [state, setState] = useState<EthereumState>({
    ...ethereumInitialState,
  })

  const _changeAccounts = async (accounts: string[]) => {
    if (accounts.length) {
      setState({
        ...state,
        status: DemoConnectionStatus.Connected,
      })
    } else {
      setState({
        ...state,
        status: DemoConnectionStatus.Disconnected,
        signer: undefined,
        network: DemoNetwork.Unknown,
        address: undefined,
      })
    }
  }

  useEffect(() => {
    detectEthereumProvider<DemoEIP1193Provider>().then(provider => setEthProvider(provider))
  }, [])

  useEffect(() => {
    if (!ethProvider) {
      // console.log('No EIP-1193 provider discovered using detectEthereumProvider');
      return
    }

    // console.log("Reacting to new ethProvider")

    ethProvider.on('accountsChanged', async accounts => {
      console.log('Accounts changed!', accounts)
      await _changeAccounts(accounts)
      // console.log("Getting signer, so that we can have username")
      await getSigner(false, false, undefined, accounts)
    })

    ethProvider.on('chainChanged', async () => {
      // console.log('Chain Changed!', chainId);
      await getSigner()
      // console.log('chainChanged', chainId);
    })

    ethProvider.on('connect', info => {
      setState({
        ...state,
        network: demoNetworkFromChainId(info.chainId),
        status: DemoConnectionStatus.Connected,
      })

      console.log('connect')
      // TODO: request accounts?
    })
    ethProvider.on('disconnect', () => {
      console.log('disconnect')
      void _changeAccounts([])
    })

    void getSigner(false, false)

    ethProvider.request({ method: 'eth_accounts' }).then(data => {
      // console.log("Selecting account from", data)
      void _changeAccounts(data)
    })
  }, [ethProvider])

  async function getSigner(
    in_doConnect?: boolean,
    in_doSwitch?: boolean,
    in_account?: string,
    forAccounts?: string[],
  ) {
    let l_signer: JsonRpcSigner | undefined
    let l_provider: JsonRpcApiProvider | undefined
    if (!state.signer || (in_account && (await state.signer.getAddress()) != in_account)) {
      if (!ethProvider) {
        console.log('getSigner, detectEthereumProvider empty!!')
        return undefined
      }
      l_provider = new BrowserProvider(ethProvider)
    } else {
      l_signer = state.signer
      if (l_signer) {
        l_provider = state.signer.provider
      }
    }

    // With no provider, do nothing
    if (!l_provider) {
      console.log('getSigner, no provider!')
      return
    }

    let l_accounts = forAccounts ?? (await l_provider.send('eth_accounts', []))

    // Check if we are already connecting before requesting accounts again
    if (in_doConnect) {
      if (!l_accounts.length) {
        l_accounts = await l_provider.send('eth_requestAccounts', [])
        await _changeAccounts(l_accounts)
      }
    }

    if (l_accounts.length) {
      l_signer = await l_provider.getSigner(in_account)
    }

    // Check if we're requested to switch networks
    let l_network = demoNetworkFromChainId(await l_provider.send('eth_chainId', []))
    if (in_doSwitch && (l_network != state.network || l_network != DemoNetwork.FromConfig)) {
      try {
        await l_provider.send('wallet_switchEthereumChain', [{ chainId: DemoNetwork.FromConfig }])
        l_network = DemoNetwork.FromConfig
      } catch (e: any) {
        // This error code indicates that the chain has not been added to MetaMask.
        if ((e as any).code !== 4902) throw e
        await addNetwork(l_network)
        throw e
      }
    }

    // Sapphire signers are always wrapped
    const l_isSapphire = l_network in SAPPHIRE_NETWORKS
    if (l_isSapphire && l_signer) {
      l_signer = wrapEthersSigner(l_signer)
    }

    const hasAccount = l_accounts.length

    setState({
      ...state,
      signer: l_signer,
      network: l_network,
      isSapphire: l_isSapphire,
      address: hasAccount ? l_accounts[0] : state.address,
      status: hasAccount ? DemoConnectionStatus.Connected : state.status,
    })

    return l_signer
  }

  useEffect(() => {
    if (state.signer) {
      state.signer.getAddress().then(setUserAddress)
    } else {
      setUserAddress(ZeroAddress)
    }
  }, [state.signer])

  async function addNetwork(network: DemoNetwork = DemoNetwork.FromConfig) {
    if (!ethProvider) {
      throw new Error('addNetwork detectEthereumProvider = null')
    }

    if (network == DemoNetwork.SapphireTestnet) {
      // TODO: this data is also available in config.ts, remove redundancy!
      await ethProvider.request({
        method: 'wallet_addEthereumChain',
        params: [
          {
            chainId: '0x5aff',
            chainName: 'Sapphire Testnet',
            nativeCurrency: { name: 'TEST', symbol: 'TEST', decimals: 18 },
            rpcUrls: ['https://testnet.sapphire.oasis.dev/', 'wss://testnet.sapphire.oasis.dev/ws'],
            blockExplorerUrls: ['https://explorer.stg.oasis.io/testnet/sapphire'],
          },
        ],
      })
    } else if (network === DemoNetwork.SapphireMainnet) {
      // TODO: this data is also available in config.ts, remove redundancy!
      await ethProvider.request({
        method: 'wallet_addEthereumChain',
        params: [
          {
            chainId: '0x5afe',
            chainName: 'Sapphire Mainnet',
            nativeCurrency: {
              name: 'ROSE',
              symbol: 'ROSE',
              decimals: 18,
            },
            rpcUrls: ['https://sapphire.oasis.io/', 'wss://sapphire.oasis.io/ws'],
            blockExplorerUrls: ['https://explorer.oasis.io/mainnet/sapphire'],
          },
        ],
      })
    } else if (network === DemoNetwork.SapphireLocalnet) {
      // TODO: this data is also available in config.ts, remove redundancy!
      await ethProvider.request({
        method: 'wallet_addEthereumChain',
        params: [
          {
            chainId: '0x5afd',
            chainName: 'Sapphire Localnet',
            rpcUrls: ['http://localhost:8545'],
          },
        ],
      })
    }
  }

  // Request that window.ethereum be connected to an account
  // Only sets `signer` value upon successful connection
  async function connect() {
    await getSigner(true, true)
  }

  async function switchNetwork(network: DemoNetwork = DemoNetwork.FromConfig) {
    console.log(`Switching network: ${network}`)
    await getSigner(true, true)
  }

  const isHomeChain = state.network === DemoNetwork.FromConfig

  const providerState: EthereumContext = {
    state: {
      ...state,
    },
    userAddress,
    isHomeChain,
    connect,
    addNetwork,
    switchNetwork,
  }

  return <EthereumContext.Provider value={providerState}>{children}</EthereumContext.Provider>
}
