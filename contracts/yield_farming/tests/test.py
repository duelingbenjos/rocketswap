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
        self.currency.approve(signer="con_vault", amount=999999999999, to="bob")
        self.currency.approve(signer="con_vault", amount=999999999999, to="lucy")
        self.currency.approve(amount=999999999999, to="bob")
        self.currency.approve(amount=999999999999, to="lucy")
        self.basic_token.approve(amount=99999999999, to="con_vault")
        self.basic_token.approve(signer="con_vault", amount=99999999999, to="bob")
        self.basic_token.approve(signer="con_vault", amount=99999999999, to="lucy")

        self.basic_token.transfer(to="con_vault", amount=10000000)
        self.currency.transfer(to="bob", amount=1000)
        self.currency.transfer(to="lucy", amount=1000)


    def tearDown(self):
        self.c.flush()

    def test_00_addFarmingTokens(self):
        start_env = {'now': Datetime(year=2021,month=2,day=1)}
        end_env = {'now': Datetime(year=2021,month=2,day=1, hour=1)}
        print(start_env)
        print(end_env)

        self.contract.addFarmingTokens(environment=start_env, signer="bob", amount=100)

        bob_currency_balance = self.currency.balances['bob']
        vault_currency_balance = self.currency.balances['con_vault']
        print(bob_currency_balance)
        print(vault_currency_balance)

        staked = self.contract.StakedBalance.get()
        print(staked)
        
        current_epoch = self.contract.CurrentEpochIndex.get()
        print(current_epoch)

        deposit_record = self.contract.Deposits['bob']
        print(deposit_record)


    def test_01_withdrawTokensAndYield(self):
        start_env = {'now': Datetime(year=2021,month=2,day=1)}
        end_env = {'now': Datetime(year=2021,month=2,day=1, hour=1)}
        print(start_env)
        print(end_env)

        self.contract.addFarmingTokens(environment=start_env, signer="bob", amount=100)

        bob_currency_balance = self.currency.balances['bob']
        vault_currency_balance = self.currency.balances['con_vault']
        print(bob_currency_balance)
        print(vault_currency_balance)

        staked_balance = self.contract.StakedBalance.get()
        print(staked_balance)
        
        current_epoch = self.contract.CurrentEpochIndex.get()
        print(current_epoch)

        deposit_record = self.contract.Deposits['bob']
        print(deposit_record)

        self.contract.withdrawTokensAndYield(environment=end_env, signer="bob")  
        bob_new_currency_balance = self.currency.balances['bob']
        bob_new_token_balance = self.basic_token.balances['bob']
        print(bob_new_currency_balance)
        print(bob_new_token_balance)

        dev_wallet_balance = self.basic_token.balances['dev_wallet']
        print(dev_wallet_balance)

    def test_01a_withdrawTokensAndYield(self):
        start_env = {'now': Datetime(year=2021,month=2,day=1)}
        end_env = {'now': Datetime(year=2021,month=2,day=1, hour=1)}
        print(start_env)
        print(end_env)

        self.contract.addFarmingTokens(environment=start_env, signer="bob", amount=100)
        self.contract.addFarmingTokens(environment=start_env, signer="lucy", amount=100)

        bob_currency_balance = self.currency.balances['bob']
        lucy_currency_balance = self.currency.balances['lucy']
        vault_currency_balance = self.currency.balances['con_vault']
        print(bob_currency_balance)
        print(lucy_currency_balance)
        print(vault_currency_balance)

        staked_balance = self.contract.StakedBalance.get()
        print(staked_balance)
        
        current_epoch = self.contract.CurrentEpochIndex.get()
        print(current_epoch)

        deposit_record = self.contract.Deposits['bob']
        deposit_record = self.contract.Deposits['lucy']
        print(deposit_record)

        self.contract.withdrawTokensAndYield(environment=end_env, signer="bob")  
        bob_new_currency_balance = self.currency.balances['bob']
        bob_new_token_balance = self.basic_token.balances['bob']
        print(bob_new_currency_balance)
        print(bob_new_token_balance)

        dev_wallet_balance = self.basic_token.balances['dev_wallet']
        print(dev_wallet_balance)


    def test_00_addFarmingTokens(self):
        self.contract.addFarmingTokens(signer="bob", amount=100)

if __name__ == '__main__':
    unittest.main()