import unittest

from contracting.client import ContractingClient

class MyTestCase(unittest.TestCase):

    def setUp(self):
        self.c = ContractingClient()
        self.c.flush()

        with open('../currency.s.py') as f:
            code = f.read()
            self.c.submit(code, name='currency', constructor_args={'vk':'sys'})

        self.currency = self.c.get_contract('currency')

        with open('con_vault.py') as f:
            code = f.read()
            self.c.submit(code, name='con_vault')

        self.contract = self.c.get_contract('con_vault')

        with open('../con_basic_token.py') as f:
            code = f.read()
            self.c.submit(code, name='con_basic_token')

        self.basic_token = self.c.get_contract('con_basic_token')

        self.setupToken()

    def setupToken(self):
        self.basic_token.transfer(to="con_vault", amount=10000000)
        self.currency.transfer(to="bob", amount=100)

    def tearDown(self):
        self.c.flush()

    def test_00_addFarmingTokens(self):
        self.contract.addFarmingTokens(signer="bob", amount=100)

if __name__ == '__main__':
    unittest.main()