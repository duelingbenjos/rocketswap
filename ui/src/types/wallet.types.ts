export type BalanceType = {
  [key: string]: number
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
  wallets: string[]
  balance?: number
  tokens?: BalanceType
  lp_balances?: object
}

export type WalletType = WalletInitType | WalletErrorType | WalletConnectedType

export type WalletApprovalsType = {
  [key: string]: {
    contractName: string
    trustedApp: boolean
    version: string
  }
}
