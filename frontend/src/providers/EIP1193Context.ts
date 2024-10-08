import { createContext } from 'react'

export interface EIP1193ProviderContext {
  isEIP1193ProviderAvailable: () => Promise<boolean>
  connectWallet: (gantle?: boolean) => Promise<string | undefined>
  switchNetwork: (toChainId: bigint) => void
}

export const EIP1193Context = createContext<EIP1193ProviderContext>({} as EIP1193ProviderContext)
