import unittest
from contracting.stdlib.bridge.time import Datetime

from contracting.client import ContractingClient


class MyTestCase(unittest.TestCase):
    def setUp(self):
        self.c = ContractingClient()
        self.c.flush()

        with open("../currency.s.py") as f:
            code = f.read()
            self.c.submit(code, name="currency", constructor_args={"vk": "sys"})

        self.currency = self.c.get_contract("currency")

        with open("../con_basic_token.py") as f:
            code = f.read()
            self.c.submit(code, name="con_basic_token")

        self.basic_token = self.c.get_contract("con_basic_token")

        with open("con_staking_smart_epoch.py") as f:
            code = f.read()
            self.c.submit(code, name="con_staking_smart_epoch")

        self.contract = self.c.get_contract("con_staking_smart_epoch")

        self.setupToken()

    def setupToken(self):
        # Approvals
        self.currency.approve(signer="bob", amount=999999999999, to="con_staking_smart_epoch")
        self.currency.approve(signer="lucy", amount=999999999999, to="con_staking_smart_epoch")
        self.currency.approve(signer="pete", amount=999999999999, to="con_staking_smart_epoch")
        self.currency.approve(signer="janis", amount=999999999999, to="con_staking_smart_epoch")
        self.currency.approve(signer="murray", amount=999999999999, to="con_staking_smart_epoch")

        self.currency.approve(signer="con_staking_smart_epoch", amount=999999999999, to="bob")
        self.currency.approve(signer="con_staking_smart_epoch", amount=999999999999, to="lucy")
        self.currency.approve(signer="con_staking_smart_epoch", amount=999999999999, to="janis")
        self.currency.approve(signer="con_staking_smart_epoch", amount=999999999999, to="murray")
        self.currency.approve(signer="con_staking_smart_epoch", amount=999999999999, to="pete")

        self.currency.approve(amount=999999999999, to="bob")
        self.currency.approve(amount=999999999999, to="janis")
        self.currency.approve(amount=999999999999, to="murray")
        self.currency.approve(amount=999999999999, to="pete")
        self.currency.approve(amount=999999999999, to="lucy")

        self.basic_token.approve(amount=99999999999, to="con_staking_smart_epoch")
        self.basic_token.approve(signer="con_staking_smart_epoch", amount=99999999999, to="bob")
        self.basic_token.approve(signer="con_staking_smart_epoch", amount=99999999999, to="lucy")
        self.basic_token.approve(signer="con_staking_smart_epoch", amount=99999999999, to="murray")
        self.basic_token.approve(signer="con_staking_smart_epoch", amount=99999999999, to="janis")
        self.basic_token.approve(signer="con_staking_smart_epoch", amount=99999999999, to="pete")

        self.basic_token.transfer(to="con_staking_smart_epoch", amount=10000000)
        self.currency.transfer(to="bob", amount=1000)
        self.currency.transfer(to="lucy", amount=1000)
        self.currency.transfer(to="janis", amount=1000)
        self.currency.transfer(to="murray", amount=1000)
        self.currency.transfer(to="pete", amount=1000)

        self.contract.setDevWallet(vk="dev_wallet")

    def tearDown(self):
        self.c.flush()

    def test_01_add_staking_tokens(self):
        start_env = {"now": Datetime(year=2021, month=2, day=1)}
        env_2 = {"now": Datetime(year=2021, month=2, day=1, hour=1)}

        self.contract.addStakingTokens(environment=start_env, signer="bob", amount=100)

        bob_currency_balance = self.currency.balances["bob"]
        vault_currency_balance = self.currency.balances["con_staking_smart_epoch"]

        self.assertEqual(vault_currency_balance, 100)

        staked = self.contract.StakedBalance.get()
        self.assertEqual(staked, 100)

        current_epoch = self.contract.CurrentEpochIndex.get()
        self.assertEqual(current_epoch, 1)

        deposit_record = self.contract.Deposits["bob"]
        self.assertEqual(len(deposit_record), 1)
        print(deposit_record)
        self.assertEqual(deposit_record[0]["amount"], 100)

        self.contract.addStakingTokens(environment=env_2, signer="bob", amount=150)
        staked = self.contract.StakedBalance.get()
        self.assertEqual(staked, 250)

        current_epoch = self.contract.CurrentEpochIndex.get()
        self.assertEqual(current_epoch, 2)

        deposit_record = self.contract.Deposits["bob"]
        self.assertEqual(len(deposit_record), 2)

    def test_02_add_staking_tokens(self):
        start_env = {"now": Datetime(year=2021, month=2, day=1)}

        with self.assertRaises(AssertionError):
            self.contract.addStakingTokens(
                environment=start_env, signer="bob", amount=10000
            )

        with self.assertRaises(AssertionError):
            self.contract.addStakingTokens(
                environment=start_env, signer="bob", amount=-100
            )

    def test_03_withdraw_yield(self):
        start_env = {"now": Datetime(year=2021, month=2, day=1)}
        env_2 = {"now": Datetime(year=2021, month=2, day=1, hour=1)}

        self.contract.addStakingTokens(environment=start_env, signer="bob", amount=100)
        self.contract.withdrawYield(environment=env_2, signer="bob", amount=1500)

        bob_token_balance = self.basic_token.balances["bob"]
        self.assertEqual(bob_token_balance, 1350)

        dev_share = self.basic_token.balances["dev_wallet"]
        self.assertEqual(dev_share, 150)

        self.contract.withdrawYield(environment=env_2, signer="bob", amount=1500)

        bob_token_balance = self.basic_token.balances["bob"]
        self.assertEqual(bob_token_balance, 2700)

        dev_share = self.basic_token.balances["dev_wallet"]
        self.assertEqual(dev_share, 300)

        with self.assertRaises(AssertionError):
            self.contract.withdrawYield(environment=env_2, signer="bob", amount=1500)

        bob_token_balance = self.basic_token.balances["bob"]
        self.assertEqual(bob_token_balance, 2700)

        dev_share = self.basic_token.balances["dev_wallet"]
        self.assertEqual(dev_share, 300)

        withdrawals_bob = self.contract.Withdrawals["bob"]
        self.assertEqual(withdrawals_bob, 3000)

        self.contract.withdrawTokensAndYield(environment=env_2, signer="bob")

        bob_token_balance = self.basic_token.balances["bob"]
        self.assertEqual(bob_token_balance, 2700)

        dev_share = self.basic_token.balances["dev_wallet"]
        self.assertEqual(dev_share, 300)

        withdrawals_bob = self.contract.Withdrawals["bob"]
        self.assertEqual(withdrawals_bob, False)

    def test_04_withdraw_yield(self):

        with self.assertRaises(AssertionError):
            self.contract.withdrawYield(signer="bob", amount=1500)

        with self.assertRaises(AssertionError):
            self.contract.withdrawYield(signer="bob", amount=-1500)

    def test_05_withdraw_yield_and_stake(self):
        start_env = {"now": Datetime(year=2021, month=2, day=1)}
        env_2 = {"now": Datetime(year=2021, month=2, day=1, hour=1)}
        env_3 = {"now": Datetime(year=2021, month=2, day=1, hour=2)}

        self.contract.addStakingTokens(environment=start_env, signer="bob", amount=100)
        self.contract.withdrawTokensAndYield(environment=env_2, signer="bob")

        with self.assertRaises(AssertionError):
            self.contract.withdrawYield(environment=env_3, signer="bob", amount=1500)

        bob_token_balance = self.basic_token.balances["bob"]
        self.assertEqual(bob_token_balance, 2700)

        dev_share = self.basic_token.balances["dev_wallet"]
        self.assertEqual(dev_share, 300)

        withdrawals_bob = self.contract.Withdrawals["bob"]
        self.assertEqual(withdrawals_bob, False)

    def test_06_multi_party_stake_and_withdraw_tokens_and_yield(self):
        start_env = {
            "now": Datetime(
                year=2021,
                month=2,
                day=1,
            )
        }
        env_2 = {"now": Datetime(year=2021, month=2, day=1, hour=1)}
        env_3 = {"now": Datetime(year=2021, month=2, day=1, hour=2)}
        env_4 = {"now": Datetime(year=2021, month=2, day=1, hour=4, minute=30)}
        env_5 = {"now": Datetime(year=2021, month=2, day=1, hour=6, minute=30)}

        self.contract.changeAmountPerHour(amount_per_hour=100)

        self.contract.setDevRewardPct(amount=0)

        self.contract.addStakingTokens(environment=start_env, signer="bob", amount=10)
        current_epoch_index = self.contract.CurrentEpochIndex.get()
        current_epoch = self.contract.Epochs[current_epoch_index]
        self.assertEquals(current_epoch["staked"], 10)

        self.contract.addStakingTokens(environment=env_2, signer="janis", amount=5)
        current_epoch_index = self.contract.CurrentEpochIndex.get()
        current_epoch = self.contract.Epochs[current_epoch_index]
        self.assertEquals(current_epoch["staked"], 15)

        self.contract.addStakingTokens(environment=env_3, signer="murray", amount=20)
        current_epoch_index = self.contract.CurrentEpochIndex.get()
        current_epoch = self.contract.Epochs[current_epoch_index]
        self.assertEquals(current_epoch["staked"], 35)

        self.contract.addStakingTokens(environment=env_4, signer="pete", amount=100)
        current_epoch_index = self.contract.CurrentEpochIndex.get()
        current_epoch = self.contract.Epochs[current_epoch_index]
        self.assertEquals(current_epoch["staked"], 135)

        self.contract.withdrawTokensAndYield(environment=env_5, signer="bob")
        current_epoch_index = self.contract.CurrentEpochIndex.get()
        current_epoch = self.contract.Epochs[current_epoch_index]
        self.assertEquals(current_epoch["staked"], 125)
        self.assertEqual(self.contract.Deposits["bob"], False)

        self.contract.withdrawTokensAndYield(environment=env_5, signer="janis")
        current_epoch_index = self.contract.CurrentEpochIndex.get()
        current_epoch = self.contract.Epochs[current_epoch_index]
        self.assertEquals(current_epoch["staked"], 120)
        self.assertEqual(self.contract.Deposits["janis"], False)

        self.contract.withdrawTokensAndYield(environment=env_5, signer="murray")
        current_epoch_index = self.contract.CurrentEpochIndex.get()
        current_epoch = self.contract.Epochs[current_epoch_index]
        self.assertEqual(self.contract.Deposits["murray"], False)
        self.assertEquals(current_epoch["staked"], 100)

        self.contract.withdrawTokensAndYield(environment=env_5, signer="pete")
        current_epoch_index = self.contract.CurrentEpochIndex.get()
        current_epoch = self.contract.Epochs[current_epoch_index]
        self.assertEquals(current_epoch["staked"], 0)
        self.assertEqual(self.contract.Deposits["pete"], False)

        bob_token_balance = self.basic_token.balances["bob"]
        janis_token_balance = self.basic_token.balances["janis"]
        murray_token_balance = self.basic_token.balances["murray"]
        pete_token_balance = self.basic_token.balances["pete"]

        self.assertAlmostEqual(bob_token_balance, 252.9100529)
        self.assertAlmostEqual(janis_token_balance, 76.4550264)
        self.assertAlmostEqual(murray_token_balance, 172.4867724)
        self.assertAlmostEqual(pete_token_balance, 148.1481481)

        total = (
            bob_token_balance
            + janis_token_balance
            + murray_token_balance
            + pete_token_balance
        )
        vault_balance = self.basic_token.balances["con_staking_smart_epoch"]

        self.assertEqual(vault_balance + total, 10000000)

        current_epoch_index = self.contract.CurrentEpochIndex.get()
        current_epoch = self.contract.Epochs[current_epoch_index]

        self.assertEqual(current_epoch["staked"], 0)
        self.assertEqual(current_epoch_index, 9)

    def test_07_multi_party_stake_and_withdraw_yield(self):
        start_env = {
            "now": Datetime(
                year=2021,
                month=2,
                day=1,
            )
        }
        env_2 = {"now": Datetime(year=2021, month=2, day=1, hour=1)}
        env_3 = {"now": Datetime(year=2021, month=2, day=1, hour=2)}
        env_4 = {"now": Datetime(year=2021, month=2, day=1, hour=4, minute=30)}
        env_5 = {"now": Datetime(year=2021, month=2, day=1, hour=6, minute=30)}

        self.contract.changeAmountPerHour(amount_per_hour=100)

        self.contract.setDevRewardPct(amount=0)

        # self.contract.setEmissionRatePerHour(amount=100)
        # self.contract.setDevRewardPct(amount=0)

        self.contract.addStakingTokens(environment=start_env, signer="bob", amount=10)
        self.contract.addStakingTokens(environment=env_2, signer="janis", amount=5)
        self.contract.addStakingTokens(environment=env_3, signer="murray", amount=20)
        self.contract.addStakingTokens(environment=env_4, signer="pete", amount=100)

        self.contract.withdrawYield(
            environment=env_5, signer="bob", amount=1009299299299
        )
        self.contract.withdrawYield(environment=env_5, signer="janis", amount=100000000)
        self.contract.withdrawYield(
            environment=env_5, signer="murray", amount=100000000
        )
        self.contract.withdrawYield(environment=env_5, signer="pete", amount=100000000)

        bob_token_balance = self.basic_token.balances["bob"]
        janis_token_balance = self.basic_token.balances["janis"]
        murray_token_balance = self.basic_token.balances["murray"]
        pete_token_balance = self.basic_token.balances["pete"]

        bob_expected_amount = 252.9100529
        janis_expected_amount = 76.4550264
        murray_expected_amount = 172.4867724
        pete_expected_amount = 148.1481481

        self.assertAlmostEqual(bob_token_balance, bob_expected_amount)
        self.assertAlmostEqual(janis_token_balance, janis_expected_amount)
        self.assertAlmostEqual(murray_token_balance, murray_expected_amount)
        self.assertAlmostEqual(pete_token_balance, pete_expected_amount)

        bob_withdrawn = self.contract.Withdrawals["bob"]
        janis_withdrawn = self.contract.Withdrawals["janis"]
        murray_withdrawn = self.contract.Withdrawals["murray"]
        pete_withdrawn = self.contract.Withdrawals["pete"]

        self.assertAlmostEqual(bob_withdrawn, bob_expected_amount)
        self.assertAlmostEqual(janis_withdrawn, janis_expected_amount)
        self.assertAlmostEqual(murray_withdrawn, murray_expected_amount)
        self.assertAlmostEqual(pete_withdrawn, pete_expected_amount)

        total = (
            bob_token_balance
            + janis_token_balance
            + murray_token_balance
            + pete_token_balance
        )
        vault_balance = self.basic_token.balances["con_staking_smart_epoch"]

        self.assertEqual(vault_balance + total, 10000000)

        current_epoch_index = self.contract.CurrentEpochIndex.get()
        current_epoch = self.contract.Epochs[current_epoch_index]

        self.assertEqual(current_epoch_index, 5)
        self.assertEqual(current_epoch["staked"], 135)

    def test_08_multi_party_stake_and_withdraw_yield_then_withdraw_tokens_and_yield(
        self,
    ):
        start_env = {
            "now": Datetime(
                year=2021,
                month=2,
                day=1,
            )
        }
        env_2 = {"now": Datetime(year=2021, month=2, day=1, hour=1)}
        env_3 = {"now": Datetime(year=2021, month=2, day=1, hour=2)}
        env_4 = {"now": Datetime(year=2021, month=2, day=1, hour=4, minute=30)}
        env_5 = {"now": Datetime(year=2021, month=2, day=1, hour=6, minute=30)}

        self.contract.changeAmountPerHour(amount_per_hour=100)
        self.contract.setDevRewardPct(amount=0)

        self.contract.addStakingTokens(environment=start_env, signer="bob", amount=10)
        self.contract.addStakingTokens(environment=env_2, signer="janis", amount=5)
        self.contract.addStakingTokens(environment=env_3, signer="murray", amount=20)
        self.contract.addStakingTokens(environment=env_4, signer="pete", amount=100)

        self.contract.withdrawYield(
            environment=env_5, signer="bob", amount=1009299299299
        )
        self.contract.withdrawYield(environment=env_5, signer="janis", amount=100000000)
        self.contract.withdrawYield(
            environment=env_5, signer="murray", amount=100000000
        )
        self.contract.withdrawYield(environment=env_5, signer="pete", amount=100000000)

        current_epoch_index = self.contract.CurrentEpochIndex.get()
        current_epoch = self.contract.Epochs[current_epoch_index]
        # print(current_epoch['staked'])
        self.assertEqual(current_epoch_index, 5)
        self.assertEqual(current_epoch["staked"], 135)

        self.contract.withdrawTokensAndYield(environment=env_5, signer="bob")
        self.contract.withdrawTokensAndYield(environment=env_5, signer="janis")
        self.contract.withdrawTokensAndYield(environment=env_5, signer="murray")
        self.contract.withdrawTokensAndYield(environment=env_5, signer="pete")

        current_epoch_index = self.contract.CurrentEpochIndex.get()
        self.assertEqual(current_epoch_index, 9)

        bob_token_balance = self.basic_token.balances["bob"]
        janis_token_balance = self.basic_token.balances["janis"]
        murray_token_balance = self.basic_token.balances["murray"]
        pete_token_balance = self.basic_token.balances["pete"]

        bob_expected_amount = 252.9100529
        janis_expected_amount = 76.4550264
        murray_expected_amount = 172.4867724
        pete_expected_amount = 148.1481481

        self.assertAlmostEqual(bob_token_balance, bob_expected_amount)
        self.assertAlmostEqual(janis_token_balance, janis_expected_amount)
        self.assertAlmostEqual(murray_token_balance, murray_expected_amount)
        self.assertAlmostEqual(pete_token_balance, pete_expected_amount)

        total = (
            bob_token_balance
            + janis_token_balance
            + murray_token_balance
            + pete_token_balance
        )
        vault_balance = self.basic_token.balances["con_staking_smart_epoch"]

        self.assertEqual(vault_balance + total, 10000000)

        current_epoch = self.contract.Epochs[current_epoch_index]
        self.assertEqual(current_epoch["staked"], 0)

        bob_deposits = self.contract.Deposits["bob"]
        janis_deposits = self.contract.Deposits["janis"]
        murray_deposits = self.contract.Deposits["murray"]
        pete_deposits = self.contract.Deposits["pete"]

        self.assertEqual(bob_deposits, False)
        self.assertEqual(janis_deposits, False)
        self.assertEqual(murray_deposits, False)
        self.assertEqual(pete_deposits, False)

    def test_09_recover_yield_token(self):
        self.assertEqual(self.basic_token.balances["con_staking_smart_epoch"], 10000000)
        self.contract.recoverYieldToken(amount=10000000)
        self.assertEqual(self.basic_token.balances["con_staking_smart_epoch"], 0)

    def test_10_start_time(self):
        env_1 = {"now": Datetime(year=2020, month=2, day=1)}
        env_2 = {"now": Datetime(year=2021, month=2, day=1)}

        self.contract.setStartTime(year=2022, month=1, day=1, hour=0)

        self.contract.addStakingTokens(environment=env_1, signer="bob", amount=10)

        with self.assertRaises(AssertionError):
            self.contract.withdrawYield(environment=env_2, signer="bob", amount=1500)

    def test_11_set_time_methods(self):
        env_1 = {"now": Datetime(year=2021, month=1, day=1, hour=0)}
        env_2 = {"now": Datetime(year=2021, month=1, day=1, hour=2)}

        self.contract.setStartTime(year=2021, month=1, day=1, hour=1)
        self.contract.setEndTime(year=2021, month=1, day=1, hour=1)

        start_time = self.contract.StartTime.get()
        end_time = self.contract.EndTime.get()

        self.assertEqual(Datetime(year=2021, month=1, day=1, hour=1), start_time)
        self.assertEqual(Datetime(year=2021, month=1, day=1, hour=1), end_time)

    def test_12_start_time(self):
        env_1 = {"now": Datetime(year=2021, month=1, day=1, hour=0)}
        env_2 = {"now": Datetime(year=2021, month=1, day=1, hour=1)}

        # self.contract.setStartTime(year=2021, month=1, day=1, hour=1)
        # self.contract.setEndTime(year=2023, month=1, day=1, hour=1)

        self.contract.changeAmountPerHour(amount_per_hour=100)
        self.contract.setDevRewardPct(amount=0)

        self.contract.addStakingTokens(environment=env_1, signer="bob", amount=10)
        self.contract.addStakingTokens(environment=env_1, signer="janis", amount=10)
        self.contract.addStakingTokens(environment=env_1, signer="murray", amount=10)
        self.contract.addStakingTokens(environment=env_1, signer="pete", amount=10)

        self.contract.withdrawYield(
            environment=env_2, signer="bob", amount=1009299299299
        )

        self.assertEqual(self.basic_token.balances["bob"], 25)
        self.contract.withdrawTokensAndYield(signer="bob")

    def test_13_end_time(self):
        env_1 = {"now": Datetime(year=2021, month=1, day=1, hour=0)}
        env_2 = {"now": Datetime(year=2021, month=1, day=1, hour=3)}

        self.contract.setStartTime(year=2021, month=1, day=1, hour=1)
        self.contract.setEndTime(year=2021, month=1, day=1, hour=2)

        self.contract.changeAmountPerHour(amount_per_hour=100)
        self.contract.setDevRewardPct(amount=0)

        self.contract.addStakingTokens(environment=env_1, signer="bob", amount=10)
        self.contract.addStakingTokens(environment=env_1, signer="janis", amount=10)
        self.contract.addStakingTokens(environment=env_1, signer="murray", amount=10)
        self.contract.addStakingTokens(environment=env_1, signer="pete", amount=10)

        self.contract.withdrawYield(
            environment=env_2, signer="bob", amount=1009299299299
        )
        self.contract.withdrawYield(environment=env_2, signer="janis", amount=100000000)
        self.contract.withdrawYield(
            environment=env_2, signer="murray", amount=100000000
        )
        self.contract.withdrawYield(environment=env_2, signer="pete", amount=100000000)

        self.contract.withdrawTokensAndYield(environment=env_2, signer="bob")
        self.contract.withdrawTokensAndYield(environment=env_2, signer="janis")
        self.contract.withdrawTokensAndYield(environment=env_2, signer="murray")
        self.contract.withdrawTokensAndYield(environment=env_2, signer="pete")

        self.assertEqual(self.basic_token.balances["bob"], 25)
        self.assertEqual(self.basic_token.balances["janis"], 25)
        self.assertEqual(self.basic_token.balances["murray"], 25)
        self.assertEqual(self.basic_token.balances["pete"], 25)

    def test_14_addStakingTokens_check_len_should_pass(self):

        self.contract.addStakingTokens(signer="bob", amount=10)
        self.contract.addStakingTokens(signer="bob", amount=10)

        deposits = self.contract.Deposits["bob"]
        self.assertEqual(len(deposits), 2)

    def test_15_addStakingTokens_check_len_should_fail(self):

        self.contract.addStakingTokens(signer="bob", amount=10)
        self.contract.addStakingTokens(signer="bob", amount=10)

        deposits = self.contract.Deposits["bob"]
        self.contract.addStakingTokens(signer="bob", amount=10)

        with self.assertRaises(AssertionError):
            self.assertEqual(len(deposits), 2)

    def test_16_addStakingTokens_withdrawTokensAndYield_check_len_should_pass(self):

        self.contract.addStakingTokens(signer="bob", amount=10)
        self.contract.addStakingTokens(signer="bob", amount=10)

        self.contract.withdrawTokensAndYield(signer="bob")
        deposits = self.contract.Deposits["bob"]
        self.assertEqual(deposits, False)

    def test_17_emergencyReturnStake(self):
        env_1 = {"now": Datetime(year=2021, month=1, day=1, hour=0)}
        env_2 = {"now": Datetime(year=2021, month=1, day=1, hour=3)}

        self.contract.addStakingTokens(environment=env_1, signer="bob", amount=10)
        self.contract.addStakingTokens(environment=env_1, signer="bob", amount=10)

        self.contract.withdrawYield(environment=env_2, signer="bob", amount=1500)

        self.contract.emergencyReturnStake(environment=env_2, signer="bob")
        deposits = self.contract.Deposits["bob"]
        self.assertEqual(deposits, False)

        withdrawals = self.contract.Withdrawals["bob"]
        self.assertEqual(withdrawals, 0)

        bob_balance = self.currency.balances["bob"]
        self.assertEqual(bob_balance, 1000)

        with self.assertRaises(AssertionError):
            self.assertEqual(bob_balance, 0)

    def test_18_epoch_incrementing_over_time(self):
        # Testing that the Epoch will not increment unless the decided time has elapsed.
        env_1 = {"now": Datetime(year=2021, month=1, day=1, hour=0)}
        env_2 = {"now": Datetime(year=2021, month=1, day=1, hour=0, minute=15)}
        env_3 = {"now": Datetime(year=2021, month=1, day=1, hour=0, minute=30)}
        env_4 = {"now": Datetime(year=2021, month=1, day=1, hour=1)}

        self.contract.changeAmountPerHour(amount_per_hour=100)
        self.contract.setDevRewardPct(amount=0)

        current_epoch_idx = self.contract.CurrentEpochIndex.get()
        self.assertEqual(current_epoch_idx, 1)

        self.contract.addStakingTokens(environment=env_1, signer="bob", amount=10)
        self.contract.addStakingTokens(environment=env_1, signer="janis", amount=10)
        self.contract.addStakingTokens(environment=env_1, signer="murray", amount=10)
        self.contract.addStakingTokens(environment=env_1, signer="pete", amount=10)

        current_epoch_idx = self.contract.CurrentEpochIndex.get()
        self.assertEqual(current_epoch_idx, 5)

        min_seconds = 60 * 60
        self.contract.setEpochMinTime(environment=env_2, min_seconds=min_seconds)

        # This one gets skipped / doesn't increment the epoch.
        self.contract.addStakingTokens(environment=env_3, signer="pete", amount=10)

        current_epoch_idx = self.contract.CurrentEpochIndex.get()
        self.assertEqual(current_epoch_idx, 5)

        self.contract.addStakingTokens(environment=env_4, signer="pete", amount=10)

        current_epoch_idx = self.contract.CurrentEpochIndex.get()
        self.assertEqual(current_epoch_idx, 6)

        staked_balance = self.contract.StakedBalance.get()
        self.assertEqual(staked_balance, 60)
        
        current_epoch = self.contract.Epochs[current_epoch_idx]
        current_epoch_staked_balance = current_epoch['staked']
        self.assertEqual(current_epoch_staked_balance, 60)

    def test_19_epoch_incrementing_when_max_ratio_exceeded_addStakingTokens(self):
        # all of the below test occurs within the min epoch time
        # will only increment when the maxRatioIncrease is exceeded.
        self.contract.setEpochMinTime(min_seconds=60*60)

        # increments
        self.contract.addStakingTokens(signer="bob", amount=10)
        # increments
        self.contract.addStakingTokens(signer="bob", amount=10)
        
        current_epoch_index = self.contract.CurrentEpochIndex.get()
        self.assertEqual(current_epoch_index, 2)

        # increments
        self.contract.addStakingTokens(signer="bob", amount=10)
        current_epoch_index = self.contract.CurrentEpochIndex.get()
        self.assertEqual(current_epoch_index, 3)

        # skips
        self.contract.addStakingTokens(signer="bob", amount=10)
        current_epoch_index = self.contract.CurrentEpochIndex.get()
        self.assertEqual(current_epoch_index, 3)

        # increments
        self.contract.addStakingTokens(signer="bob", amount=20)
        current_epoch_index = self.contract.CurrentEpochIndex.get()
        self.assertEqual(current_epoch_index, 4)

        # skips
        self.contract.addStakingTokens(signer="bob", amount=20)
        current_epoch_index = self.contract.CurrentEpochIndex.get()
        self.assertEqual(current_epoch_index, 4)

    def test_20_epoch_incrementing_when_max_ratio_exceeded_withdrawTokensAndYield(self):
        # all of the below test occurs within the min epoch time
        # will only increment when the maxRatioIncrease is exceeded.
        self.contract.setEpochMinTime(min_seconds=60*60)

        # increments
        self.contract.addStakingTokens(signer="bob", amount=10)
        # increments
        self.contract.addStakingTokens(signer="bob", amount=10)
        
        current_epoch_index = self.contract.CurrentEpochIndex.get()
        self.assertEqual(current_epoch_index, 2)

        # increments
        self.contract.addStakingTokens(signer="bob", amount=10)
        current_epoch_index = self.contract.CurrentEpochIndex.get()
        self.assertEqual(current_epoch_index, 3)

        # skips
        self.contract.addStakingTokens(signer="bob", amount=10)
        current_epoch_index = self.contract.CurrentEpochIndex.get()
        self.assertEqual(current_epoch_index, 3)

        # increments
        self.contract.addStakingTokens(signer="bob", amount=20)
        current_epoch_index = self.contract.CurrentEpochIndex.get()
        self.assertEqual(current_epoch_index, 4)

        # skips
        self.contract.addStakingTokens(signer="bob", amount=20)
        current_epoch_index = self.contract.CurrentEpochIndex.get()
        self.assertEqual(current_epoch_index, 4)

        ## 80 Staked so far

        # increments
        self.contract.addStakingTokens(signer="janis", amount=80)
        current_epoch_index = self.contract.CurrentEpochIndex.get()
        self.assertEqual(current_epoch_index, 5)

        # increments
        self.contract.withdrawTokensAndYield(signer="janis")
        current_epoch_index = self.contract.CurrentEpochIndex.get()
        self.assertEqual(current_epoch_index, 6)             

        # increments
        self.contract.addStakingTokens(signer="janis", amount=40)
        current_epoch_index = self.contract.CurrentEpochIndex.get()
        self.assertEqual(current_epoch_index, 7)

        # increments
        self.contract.withdrawTokensAndYield(signer="janis")
        current_epoch_index = self.contract.CurrentEpochIndex.get()
        self.assertEqual(current_epoch_index, 8)     

        # skip
        self.contract.addStakingTokens(signer="janis", amount=30)
        current_epoch_index = self.contract.CurrentEpochIndex.get()
        self.assertEqual(current_epoch_index, 8)

        # skip
        self.contract.withdrawTokensAndYield(signer="janis")
        current_epoch_index = self.contract.CurrentEpochIndex.get()
        self.assertEqual(current_epoch_index, 8)                


if __name__ == "__main__":
    unittest.main()
