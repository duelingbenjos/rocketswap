import unittest

from contracting.db.driver import ContractDriver, Driver
from contracting.client import ContractingClient

class MyTestCase(unittest.TestCase):

    def setUp(self):
        self.c = ContractingClient()
        self.c.flush()

        with open('../currency.s.py') as f:
            code = f.read()
            self.c.submit(code, name='currency', constructor_args={'vk':'sys'})

        self.currency_contract = self.c.get_contract('currency')

        with open('con_ipseity.py') as f:
            code = f.read()
            self.c.submit(code, name='con_ipseity')

        self.contract = self.c.get_contract('con_ipseity')


    def tearDown(self):
        self.c.flush()

    def setupBalances(self):
        self.currency_contract.transfer(amount=10000, to='janet_key')
        self.currency_contract.approve(signer='janet_key', amount=10000, to='con_ipseity')
        self.currency_contract.approve(signer='yerp_key', amount=10000, to='con_ipseity')

    def test_01a_setName(self):
        self.setupBalances()
        name = "janet"
        self.contract.setName(signer="janet_key", name=name)
        self.assertEqual(self.contract.quick_read('name_to_key','janet'), "janet_key")

    def test_01b_setName(self):
        self.setupBalances()
        name = "janet"
        self.contract.setName(signer="janet_key", name=name)
        with self.assertRaises(AssertionError):
            self.contract.setName(signer="yerp_key", name=name)  

    def test_01c_setName(self):
        self.setupBalances()
        name = "janet"
        self.contract.setName(signer="janet_key", name=name)
        with self.assertRaises(AssertionError):
            self.contract.setName(signer="janet_key", name=name)   

    def test_01d_setName(self):
        self.setupBalances()
        name = "janet"
        new_name = "brian"
        self.contract.setName(signer="janet_key", name=name)
        key_res = self.contract.quick_read('name_to_key', name)
        name_res = self.contract.quick_read('key_to_name', 'janet_key')
        self.contract.setName(signer="janet_key", name=new_name)
        self.assertIsNot(self.contract.quick_read('name_to_key','janet'), "janet_key") 
        self.assertEqual(self.contract.quick_read('name_to_key',new_name), "janet_key")

    def test_02a_auth(self):
        self.setupBalances()
        secret = "abc123"
        self.contract.auth(secret=secret)
        self.assertEqual(self.contract.auth_codes[secret], 'sys')


if __name__ == '__main__':
    unittest.main()