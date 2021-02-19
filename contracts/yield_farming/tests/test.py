import unittest
from contracting.stdlib.bridge.time import Datetime

from contracting.client import ContractingClient

class MyTestCase(unittest.TestCase):

    def setUp(self):
        self.c = ContractingClient()
        self.c.flush()

        with open('../currency.s.py') as f:
            code = f.read()
            self.c.submit(code, name='currency', constructor_args={'vk':'sys'})

        self.currency = self.c.get_contract('currency')

        with open('../con_basic_token.py') as f:
            code = f.read()
            self.c.submit(code, name='con_basic_token')

        self.basic_token = self.c.get_contract('con_basic_token') 

        with open('con_vault.py') as f:
            code = f.read()
            self.c.submit(code, name='con_vault')

        self.contract = self.c.get_contract('con_vault')

        self.setupToken()

    def setupToken(self):
        # Approvals
        self.currency.approve(signer="bob", amount=999999999999, to="con_vault")
        self.currency.approve(signer="lucy", amount=999999999999, to="con_vault")
        self.currency.approve(signer="pete", amount=999999999999, to="con_vault")
        self.currency.approve(signer="janis", amount=999999999999, to="con_vault")
        self.currency.approve(signer="murray", amount=999999999999, to="con_vault")

        self.currency.approve(signer="con_vault", amount=999999999999, to="bob")
        self.currency.approve(signer="con_vault", amount=999999999999, to="lucy")
        self.currency.approve(signer="con_vault", amount=999999999999, to="janis")
        self.currency.approve(signer="con_vault", amount=999999999999, to="murray")
        self.currency.approve(signer="con_vault", amount=999999999999, to="pete")

        self.currency.approve(amount=999999999999, to="bob")
        self.currency.approve(amount=999999999999, to="janis")
        self.currency.approve(amount=999999999999, to="murray")
        self.currency.approve(amount=999999999999, to="pete")
        self.currency.approve(amount=999999999999, to="lucy")

        self.basic_token.approve(amount=99999999999, to="con_vault")
        self.basic_token.approve(signer="con_vault", amount=99999999999, to="bob")
        self.basic_token.approve(signer="con_vault", amount=99999999999, to="lucy")
        self.basic_token.approve(signer="con_vault", amount=99999999999, to="murray")
        self.basic_token.approve(signer="con_vault", amount=99999999999, to="janis")
        self.basic_token.approve(signer="con_vault", amount=99999999999, to="pete")

        self.basic_token.transfer(to="con_vault", amount=10000000)
        self.currency.transfer(to="bob", amount=1000)
        self.currency.transfer(to="lucy", amount=1000)
        self.currency.transfer(to="janis", amount=1000)
        self.currency.transfer(to="murray", amount=1000)
        self.currency.transfer(to="pete", amount=1000)

        self.contract.setDevWallet(vk="dev_wallet")


    def tearDown(self):
        self.c.flush()

    def test_00_addStakingTokens(self):
        start_env = {'now': Datetime(year=2021,month=2,day=1)}
        env_2 = {'now': Datetime(year=2021,month=2,day=1, hour=1)}

        self.contract.addStakingTokens(environment=start_env, signer="bob", amount=100)

        bob_currency_balance = self.currency.balances['bob']
        vault_currency_balance = self.currency.balances['con_vault']

        self.assertEqual(vault_currency_balance, 100)

        staked = self.contract.StakedBalance.get()
        self.assertEqual(staked, 100)
        
        current_epoch = self.contract.CurrentEpochIndex.get()
        self.assertEqual(current_epoch, 1)

        deposit_record = self.contract.Deposits['bob']
        self.assertEqual(len(deposit_record), 1)

        self.contract.addStakingTokens(environment=env_2, signer="bob", amount=150)
        staked = self.contract.StakedBalance.get()
        self.assertEqual(staked, 250)

        current_epoch = self.contract.CurrentEpochIndex.get()
        self.assertEqual(current_epoch, 2)

        deposit_record = self.contract.Deposits['bob']
        self.assertEqual(len(deposit_record), 2)
    
    def test_01_withdraw(self):
        start_env = {'now': Datetime(year=2021,month=2,day=1)}
        env_2 = {'now': Datetime(year=2021,month=2,day=1, hour=1)}

        self.contract.addStakingTokens(environment=start_env, signer="bob", amount=100)

        self.contract.withdrawYield(environment=env_2, signer="bob", amount=1500)

        bob_token_balance = self.basic_token.balances['bob']
        self.assertEqual(bob_token_balance, 1350)

        dev_share = self.basic_token.balances['dev_wallet']
        self.assertEqual(dev_share, 150)

        self.contract.withdrawYield(environment=env_2, signer="bob", amount=1500)

        bob_token_balance = self.basic_token.balances['bob']
        self.assertEqual(bob_token_balance, 2700)

        dev_share = self.basic_token.balances['dev_wallet']
        self.assertEqual(dev_share, 300)

        with self.assertRaises(AssertionError):
            self.contract.withdrawYield(environment=env_2, signer="bob", amount=1500)

        bob_token_balance = self.basic_token.balances['bob']
        self.assertEqual(bob_token_balance, 2700)

        dev_share = self.basic_token.balances['dev_wallet']
        self.assertEqual(dev_share, 300)

        withdrawals_bob = self.contract.Withdrawals["bob"]
        self.assertEqual(withdrawals_bob, 3000)

        self.contract.withdrawTokensAndYield(environment=env_2, signer="bob")

        bob_token_balance = self.basic_token.balances['bob']
        self.assertEqual(bob_token_balance, 2700)

        dev_share = self.basic_token.balances['dev_wallet']
        self.assertEqual(dev_share, 300)

        withdrawals_bob = self.contract.Withdrawals["bob"]
        self.assertEqual(withdrawals_bob, False)

    def test_02_multi_party_test(self):
        start_env = {'now': Datetime(year=2021,month=2,day=1,)}
        env_2 = {'now': Datetime(year=2021,month=2,day=1, hour=1)}
        env_3 = {'now': Datetime(year=2021,month=2,day=1, hour=2)}
        env_4 = {'now': Datetime(year=2021,month=2,day=1, hour=4, minute=30)}
        env_5 = {'now': Datetime(year=2021,month=2,day=1, hour=6, minute=30)}

        self.contract.setEmissionRatePerHour(amount = 100)
        self.contract.setDevRewardPct(amount = 0)

        self.contract.addStakingTokens(environment=start_env, signer="bob", amount=10)
        self.contract.addStakingTokens(environment=env_2, signer="janis", amount=5)
        self.contract.addStakingTokens(environment=env_3, signer="murray", amount=20)
        self.contract.addStakingTokens(environment=env_4, signer="pete", amount=100)

        emission_rate = self.contract.getEmissionRatePerSecond()
        print(emission_rate)

        deposits = self.contract.Deposits['bob']
        epoch = self.contract.CurrentEpochIndex.get()
        print(deposits)
        print(epoch)
        self.contract.withdrawTokensAndYield(environment=env_5, signer="bob")
        self.contract.withdrawTokensAndYield(environment=env_5, signer="janis")
        self.contract.withdrawTokensAndYield(environment=env_5, signer="murray")
        self.contract.withdrawTokensAndYield(environment=env_5, signer="pete")

        bob_token_balance = self.basic_token.balances['bob']
        janis_token_balance = self.basic_token.balances['janis']
        murray_token_balance = self.basic_token.balances['murray']
        pete_token_balance = self.basic_token.balances['pete']

        print(bob_token_balance)
        print(janis_token_balance)
        print(murray_token_balance)
        print(pete_token_balance)

        total = bob_token_balance + janis_token_balance + murray_token_balance + pete_token_balance
        print(total)
        vault_balance = balance = self.basic_token.balances['con_vault']
        print(vault_balance)

        current_epoch_index = self.contract.CurrentEpochIndex.get()
        current_epoch = self.contract.Epochs[current_epoch_index]
        print(current_epoch)
    # def test_01a_withdrawYield(self):
    #     start_env = {'now': Datetime(year=2021,month=2,day=1)}
    #     env_1 = {'now': Datetime(year=2021,month=2,day=1, hour=1)}
    #     env_2 = {'now': Datetime(year=2021,month=2,day=1, hour=1)}
    #     print(start_env)
    #     print(end_env)

    #     self.contract.addStakingTokens(environment=start_env, signer="bob", amount=100)
    #     self.contract.addStakingTokens(environment=start_env, signer="lucy", amount=100)

    #     bob_currency_balance = self.currency.balances['bob']
    #     lucy_currency_balance = self.currency.balances['lucy']
    #     vault_currency_balance = self.currency.balances['con_vault']
    #     print(bob_currency_balance)
    #     print(lucy_currency_balance)
    #     print(vault_currency_balance)

    #     staked_balance = self.contract.StakedBalance.get()
    #     print(staked_balance)
        
    #     current_epoch = self.contract.CurrentEpochIndex.get()
    #     print(current_epoch)

    #     deposit_record = self.contract.Deposits['bob']
    #     deposit_record = self.contract.Deposits['lucy']
    #     print(deposit_record)

    #     self.contract.withdrawTokensAndYield(environment=end_env, signer="bob")  
    #     bob_new_currency_balance = self.currency.balances['bob']
    #     bob_new_token_balance = self.basic_token.balances['bob']
    #     print(bob_new_currency_balance)
    #     print(bob_new_token_balance)

    #     dev_wallet_balance = self.basic_token.balances['dev_wallet']
    #     print(dev_wallet_balance)


    # def test_01_withdrawTokensAndYield(self):
    #     start_env = {'now': Datetime(year=2021,month=2,day=1)}
    #     end_env = {'now': Datetime(year=2021,month=2,day=1, hour=1)}
    #     print(start_env)
    #     print(end_env)

    #     self.contract.addStakingTokens(environment=start_env, signer="bob", amount=100)

    #     bob_currency_balance = self.currency.balances['bob']
    #     vault_currency_balance = self.currency.balances['con_vault']
    #     print(bob_currency_balance)
    #     print(vault_currency_balance)

    #     staked_balance = self.contract.StakedBalance.get()
    #     print(staked_balance)
        
    #     current_epoch = self.contract.CurrentEpochIndex.get()
    #     print(current_epoch)

    #     deposit_record = self.contract.Deposits['bob']
    #     print(deposit_record)

    #     self.contract.withdrawTokensAndYield(environment=end_env, signer="bob")  
    #     bob_new_currency_balance = self.currency.balances['bob']
    #     bob_new_token_balance = self.basic_token.balances['bob']
    #     print(bob_new_currency_balance)
    #     print(bob_new_token_balance)

    #     dev_wallet_balance = self.basic_token.balances['dev_wallet']
    #     print(dev_wallet_balance)

    # def test_01a_withdrawTokensAndYield(self):
    #     start_env = {'now': Datetime(year=2021,month=2,day=1)}
    #     end_env = {'now': Datetime(year=2021,month=2,day=1, hour=1)}
    #     print(start_env)
    #     print(end_env)

    #     self.contract.addStakingTokens(environment=start_env, signer="bob", amount=100)
    #     self.contract.addStakingTokens(environment=start_env, signer="lucy", amount=100)

    #     bob_currency_balance = self.currency.balances['bob']
    #     lucy_currency_balance = self.currency.balances['lucy']
    #     vault_currency_balance = self.currency.balances['con_vault']
    #     print(bob_currency_balance)
    #     print(lucy_currency_balance)
    #     print(vault_currency_balance)

    #     staked_balance = self.contract.StakedBalance.get()
    #     print(staked_balance)
        
    #     current_epoch = self.contract.CurrentEpochIndex.get()
    #     print(current_epoch)

    #     deposit_record = self.contract.Deposits['bob']
    #     deposit_record = self.contract.Deposits['lucy']
    #     print(deposit_record)

    #     self.contract.withdrawTokensAndYield(environment=end_env, signer="bob")  
    #     bob_new_currency_balance = self.currency.balances['bob']
    #     bob_new_token_balance = self.basic_token.balances['bob']
    #     print(bob_new_currency_balance)
    #     print(bob_new_token_balance)

    #     dev_wallet_balance = self.basic_token.balances['dev_wallet']
    #     print(dev_wallet_balance)


if __name__ == '__main__':
    unittest.main()