import unittest

from contracting.client import ContractingClient

class MyTestCase(unittest.TestCase):

    def setUp(self):
        self.c = ContractingClient()
        self.c.flush()

        with open('con_vault.py') as f:
            code = f.read()
            self.c.submit(code, name='con_vault')

        self.contract = self.c.get_contract('con_vault')

    def tearDown(self):
        self.c.flush()

    def test_00_print_seconds(self):
        # self.setUp()
        seconds = self.contract.testTime()
        print(seconds)

    def test_01_print_epoch(self):
        # self.setUp()
        current_epoch = self.contract.getCurrentEpochIndex()
        print(current_epoch)
        # epoch_info = self.contract.getEpochDetails(index=current_epoch)
        # print(epoch_info)
        self.contract.addTokens(amount =10)
        self.contract.testWhile()


if __name__ == '__main__':
    unittest.main()