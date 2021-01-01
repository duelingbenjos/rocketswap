export type BalanceType = {
  [key: string]: string
}

export type WalletInitType = { init: true }

export type WalletErrorType = {
  errors: string[]
}

export type WalletConnectedType = {
  approvals: WalletApprovalsType
  installed: boolean
  locked: boolean
  setup: boolean
  walletVersion: string
  wallets?: string[]
  balance?: string
  tokens?: BalanceType
}

export type WalletType = WalletInitType | WalletErrorType | WalletConnectedType

export type WalletApprovalsType = {
  [key: string]: {
    contractName: string
    trustedApp: boolean
    version: string
  }
}
