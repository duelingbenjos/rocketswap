import unittest

from contracting.db.driver import ContractDriver, Driver
from contracting.client import ContractingClient

class MyTestCase(unittest.TestCase):

    def setUp(self):
        self.c = ContractingClient()
        self.c.flush()

        with open('con_ipseity.py') as f:
            code = f.read()
            self.c.submit(code, name='con_ipseity')

        self.contract = self.c.get_contract('con_ipseity')

    def tearDown(self):
        self.c.flush()

    def test_01a_setName(self):
        name = "janet"
        self.contract.setName(signer="janet_key", name=name)
        self.assertEqual(self.contract.quick_read('name_to_key','janet'), "janet_key")

    def test_01b_setName(self):
        name = "janet"
        self.contract.setName(signer="janet_key", name=name)
        with self.assertRaises(AssertionError):
            self.contract.setName(signer="yerp_key", name=name)  

    def test_01c_setName(self):
        name = "janet"
        self.contract.setName(signer="janet_key", name=name)
        with self.assertRaises(AssertionError):
            self.contract.setName(signer="janet_key", name=name)   

    def test_01d_setName(self):
        name = "janet"
        new_name = "brian"
        self.contract.setName(signer="janet_key", name=name)
        key_res = self.contract.quick_read('name_to_key', name)
        name_res = self.contract.quick_read('key_to_name', 'janet_key')
        self.contract.setName(signer="janet_key", name=new_name)
        self.assertIsNot(self.contract.quick_read('name_to_key','janet'), "janet_key") 
        self.assertEqual(self.contract.quick_read('name_to_key',new_name), "janet_key")

    def test_02a_auth(self):
        secret = "abc123"
        self.contract.auth(secret=secret)
        self.assertEqual(self.contract.auth_codes[secret], 1)


if __name__ == '__main__':
    unittest.main()