import unittest
from contracting.stdlib.bridge.time import Datetime

from contracting.client import ContractingClient


def calcExpectedYield(emission_per_year, dev_reward_pct, stake_amount, minutes_staked):

    emission_rate_calculated = emission_per_year / 365 / 24 / 60 / 60
    staked_seconds = minutes_staked * 60
    emission_amount_calculated = emission_rate_calculated * \
        stake_amount * staked_seconds

    dev_reward = dev_reward_pct * emission_amount_calculated
    net_token_emission = emission_amount_calculated - dev_reward
    return net_token_emission


class MyTestCase(unittest.TestCase):

    def setUp(self):
        self.c = ContractingClient()
        self.c.flush()

        with open('../currency.s.py') as f:
            code = f.read()
            self.c.submit(code, name='currency',
                          constructor_args={'vk': 'sys'})

        self.currency = self.c.get_contract('currency')

        with open('../con_basic_token.py') as f:
            code = f.read()
            self.c.submit(code, name='con_basic_token')

        self.basic_token = self.c.get_contract('con_basic_token')

        with open('con_staking_simple.py') as f:
            code = f.read()
            self.c.submit(code, name='con_staking')

        self.contract = self.c.get_contract('con_staking')

        self.setupToken()

    def setupToken(self):
        # Approvals
        self.currency.approve(
            signer="bob", amount=999999999999, to="con_staking")
        self.currency.approve(
            signer="lucy", amount=999999999999, to="con_staking")
        self.currency.approve(
            signer="pete", amount=999999999999, to="con_staking")
        self.currency.approve(
            signer="janis", amount=999999999999, to="con_staking")
        self.currency.approve(
            signer="murray", amount=999999999999, to="con_staking")

        self.currency.approve(signer="con_staking",
                              amount=999999999999, to="bob")
        self.currency.approve(signer="con_staking",
                              amount=999999999999, to="lucy")
        self.currency.approve(signer="con_staking",
                              amount=999999999999, to="janis")
        self.currency.approve(signer="con_staking",
                              amount=999999999999, to="murray")
        self.currency.approve(signer="con_staking",
                              amount=999999999999, to="pete")

        self.currency.approve(amount=999999999999, to="bob")
        self.currency.approve(amount=999999999999, to="janis")
        self.currency.approve(amount=999999999999, to="murray")
        self.currency.approve(amount=999999999999, to="pete")
        self.currency.approve(amount=999999999999, to="lucy")

        self.basic_token.approve(amount=99999999999, to="con_staking")
        self.basic_token.approve(signer="con_staking",
                                 amount=99999999999, to="bob")
        self.basic_token.approve(signer="con_staking",
                                 amount=99999999999, to="lucy")
        self.basic_token.approve(signer="con_staking",
                                 amount=99999999999, to="murray")
        self.basic_token.approve(signer="con_staking",
                                 amount=99999999999, to="janis")
        self.basic_token.approve(signer="con_staking",
                                 amount=99999999999, to="pete")

        self.basic_token.transfer(to="con_staking", amount=10000000)
        self.currency.transfer(to="bob", amount=1000)
        self.currency.transfer(to="lucy", amount=1000)
        self.currency.transfer(to="janis", amount=1000)
        self.currency.transfer(to="murray", amount=1000)
        self.currency.transfer(to="pete", amount=1000)

        self.contract.setDevWallet(vk="dev_wallet")

    def tearDown(self):
        self.c.flush()

    def test_01_add_staking_tokens(self):
        start_env = {'now': Datetime(year=2021, month=2, day=1)}
        env_2 = {'now': Datetime(year=2021, month=2, day=1, hour=1)}

        self.contract.addStakingTokens(
            environment=start_env, signer="bob", amount=100)

        bob_currency_balance = self.currency.balances['bob']
        vault_currency_balance = self.currency.balances['con_staking']

        self.assertEqual(vault_currency_balance, 100)

        staked = self.contract.StakedBalance.get()
        self.assertEqual(staked, 100)

        deposit_record = self.contract.Deposits['bob']
        self.assertEqual(len(deposit_record), 1)
        print(deposit_record)
        self.assertEqual(deposit_record[0]['amount'], 100)

        self.contract.addStakingTokens(
            environment=env_2, signer="bob", amount=150)
        staked = self.contract.StakedBalance.get()
        self.assertEqual(staked, 250)

        deposit_record = self.contract.Deposits['bob']
        self.assertEqual(len(deposit_record), 2)

    def test_02_increment_epoch(self):
        current_epoch = self.contract.getCurrentEpochIndex()
        self.assertEqual(current_epoch, 0)

        self.contract.incrementEpoch(emission_rate_per_tau=10)

        current_epoch = self.contract.getCurrentEpochIndex()
        self.assertEqual(current_epoch, 1)

        current_emission_rate = self.contract.EmissionRatePerTauYearly.get()
        self.assertEqual(current_emission_rate, 10)

    def test_03_increment_epoch_should_fail(self):

        with self.assertRaises(AssertionError):
            self.contract.incrementEpoch(emission_rate_per_tau=-1)

    def test_04_add_staking_tokens_should_fail(self):
        start_env = {'now': Datetime(year=2021, month=2, day=1)}

        # Too many tokens
        with self.assertRaises(AssertionError):
            self.contract.addStakingTokens(
                environment=start_env, signer="bob", amount=10000)

        # Minus value
        with self.assertRaises(AssertionError):
            self.contract.addStakingTokens(
                environment=start_env, signer="bob", amount=-100)

    def test_05_withdraw_yield_should_pass(self):
        start_env = {'now': Datetime(year=2021, month=2, day=1)}
        env_2 = {'now': Datetime(year=2021, month=2, day=1, hour=1)}

        bob_stake_amount = 100

        self.contract.addStakingTokens(
            environment=start_env, signer="bob", amount=bob_stake_amount)

        self.contract.withdrawYield(
            environment=env_2, signer="bob", amount=1500)

        emission_per_year = self.contract.EmissionRatePerTauYearly.get()

        emission_rate_calculated = emission_per_year / 365 / 24 / 60 / 60
        one_hour_in_seconds = 60 * 60
        emission_amount_calculated = emission_rate_calculated * \
            bob_stake_amount * one_hour_in_seconds
        dev_reward = self.contract.DevRewardPct.get() * emission_amount_calculated
        net_token_emission = emission_amount_calculated - dev_reward

        self.assertAlmostEqual(
            net_token_emission, self.basic_token.balances['bob'])

    def test_06_withdraw_yield_change_epoch_should_pass(self):
        start_env = {'now': Datetime(year=2021, month=2, day=1)}
        env_2 = {'now': Datetime(year=2021, month=2, day=1, hour=1)}
        env_3 = {'now': Datetime(year=2021, month=2, day=1, hour=2)}

        bob_stake_amount = 100

        self.contract.addStakingTokens(
            environment=start_env, signer="bob", amount=bob_stake_amount)

        self.contract.withdrawYield(
            environment=env_2, signer="bob", amount=1500)

        emission_per_year = self.contract.EmissionRatePerTauYearly.get()

        emission_rate_calculated = emission_per_year / 365 / 24 / 60 / 60
        one_hour_in_seconds = 60 * 60
        emission_amount_calculated = emission_rate_calculated * \
            bob_stake_amount * one_hour_in_seconds
        dev_reward = self.contract.DevRewardPct.get() * emission_amount_calculated
        net_token_emission = emission_amount_calculated - dev_reward

        self.contract.incrementEpoch(
            environment=env_2, emission_rate_per_tau=10)

        epochs_0 = self.contract.Epochs[0]
        epochs_1 = self.contract.Epochs[1]

        self.contract.withdrawYield(
            environment=env_3, signer="bob", amount=1500)

        bob_token_balance = self.basic_token.balances['bob']

        bob_new_token_emission = net_token_emission * 2
        total_token_emission = net_token_emission + bob_new_token_emission
        self.assertAlmostEqual(bob_token_balance, total_token_emission)

        # DEV SHARE

        total_dev_share = dev_reward * 3
        self.assertAlmostEqual(
            self.basic_token.balances['dev_wallet'], total_dev_share)

    def test_07_withdraw_tokens_and_yield_should_pass(self):

        start_env = {'now': Datetime(year=2021, month=2, day=1)}
        env_2 = {'now': Datetime(year=2021, month=2, day=1, hour=1)}
        env_3 = {'now': Datetime(year=2021, month=2, day=1, hour=2)}

        bob_stake_amount = 100

        self.contract.addStakingTokens(
            environment=start_env, signer="bob", amount=bob_stake_amount)

        self.contract.withdrawTokensAndYield(environment=env_2, signer="bob")

        emission_per_year = self.contract.EmissionRatePerTauYearly.get()

        emission_rate_calculated = emission_per_year / 365 / 24 / 60 / 60
        one_hour_in_seconds = 60 * 60
        emission_amount_calculated = emission_rate_calculated * \
            bob_stake_amount * one_hour_in_seconds
        dev_reward = self.contract.DevRewardPct.get() * emission_amount_calculated
        net_token_emission = emission_amount_calculated - dev_reward

        self.assertAlmostEqual(
            net_token_emission, self.basic_token.balances['bob'])
        self.assertEqual(self.currency.balances['bob'], 1000)
        self.assertAlmostEqual(
            self.basic_token.balances['dev_wallet'], dev_reward)

        withdrawals_bob = self.contract.Withdrawals["bob"]
        self.assertEqual(withdrawals_bob, False)

    def test_08_multi_party_stake_and_withdraw_tokens_and_yield(self):
        start_env = {'now': Datetime(year=2021, month=2, day=1,)}
        env_2 = {'now': Datetime(year=2021, month=2, day=1, hour=1)}
        env_3 = {'now': Datetime(year=2021, month=2, day=1, hour=2)}
        env_4 = {'now': Datetime(
            year=2021, month=2, day=1, hour=4, minute=30)}
        env_5 = {'now': Datetime(
            year=2021, month=2, day=1, hour=6, minute=30)}

        self.contract.setDevRewardPct(amount=0)

        self.contract.addStakingTokens(
            environment=start_env, signer="bob", amount=10)

        self.contract.addStakingTokens(
            environment=env_2, signer="janis", amount=5)

        self.contract.addStakingTokens(
            environment=env_3, signer="murray", amount=20)

        self.contract.addStakingTokens(
            environment=env_4, signer="pete", amount=100)

        self.contract.withdrawTokensAndYield(
            environment=env_5, signer="bob")
        self.assertEqual(self.contract.Deposits['bob'], False)

        self.contract.withdrawTokensAndYield(
            environment=env_5, signer="janis")
        self.assertEqual(self.contract.Deposits['janis'], False)

        self.contract.withdrawTokensAndYield(
            environment=env_5, signer="murray")
        self.assertEqual(self.contract.Deposits['murray'], False)

        self.contract.withdrawTokensAndYield(
            environment=env_5, signer="pete")
        self.assertEqual(self.contract.Deposits['pete'], False)

        bob_token_balance = self.basic_token.balances['bob']
        janis_token_balance = self.basic_token.balances['janis']
        murray_token_balance = self.basic_token.balances['murray']
        pete_token_balance = self.basic_token.balances['pete']

        total = bob_token_balance + janis_token_balance + \
            murray_token_balance + pete_token_balance
        vault_balance = self.basic_token.balances['con_staking']

        self.assertAlmostEqual(vault_balance + total, 10000000)

    def test_09_multi_party_stake_and_withdraw_yield(self):
        start_env = {'now': Datetime(year=2021, month=2, day=1,)}
        env_2 = {'now': Datetime(year=2021, month=2, day=1, hour=1)}
        env_3 = {'now': Datetime(year=2021, month=2, day=1, hour=2)}
        env_4 = {'now': Datetime(
            year=2021, month=2, day=1, hour=4, minute=30)}
        env_5 = {'now': Datetime(
            year=2021, month=2, day=1, hour=6, minute=30)}

        self.contract.setDevRewardPct(amount=0)

        self.contract.addStakingTokens(
            environment=start_env, signer="bob", amount=100)
        self.contract.addStakingTokens(
            environment=env_2, signer="janis", amount=80)

        self.contract.withdrawYield(
            environment=env_5, signer="bob", amount=1009299299299)
        self.contract.withdrawYield(
            environment=env_5, signer="janis", amount=100000000)

        emission_per_year = self.contract.EmissionRatePerTauYearly.get()
        dev_reward_pct = self.contract.DevRewardPct.get()

        bob_token_balance = self.basic_token.balances['bob']
        janis_token_balance = self.basic_token.balances['janis']

        bob_expected_1 = calcExpectedYield(
            emission_per_year, dev_reward_pct, 100, 390)
        janis_expected_1 = calcExpectedYield(
            emission_per_year, dev_reward_pct, 80, 330)

        self.assertAlmostEqual(bob_token_balance, bob_expected_1)
        self.assertEqual(janis_token_balance, janis_expected_1)

        bob_withdrawn = self.contract.Withdrawals['bob']
        janis_withdrawn = self.contract.Withdrawals['janis']

        self.assertAlmostEqual(bob_withdrawn, bob_expected_1)
        self.assertAlmostEqual(janis_withdrawn, janis_expected_1)

        total = bob_token_balance + janis_token_balance
        vault_balance = self.basic_token.balances['con_staking']

        self.assertAlmostEqual(vault_balance + total, 10000000)

        current_epoch_index = self.contract.CurrentEpochIndex.get()
        current_epoch = self.contract.Epochs[current_epoch_index]

        self.assertEqual(current_epoch_index, 0)

    def test_10_set_time_methods(self):
        env_1 = {'now': Datetime(year=2021, month=1, day=1, hour=0)}
        env_2 = {'now': Datetime(year=2021, month=1, day=1, hour=2)}

        self.contract.setStartTime(year=2021, month=1, day=1, hour=1)
        self.contract.setEndTime(year=2021, month=1, day=1, hour=1)

        start_time = self.contract.StartTime.get()
        end_time = self.contract.EndTime.get()

        self.assertEqual(Datetime(year=2021, month=1,
                                  day=1, hour=1), start_time)
        self.assertEqual(Datetime(year=2021, month=1, day=1, hour=1), end_time)

    def test_11_start_time(self):
        env_1 = {'now': Datetime(year=2021, month=1, day=1, hour=0)}
        env_2 = {'now': Datetime(year=2021, month=1, day=1, hour=2)}

        self.contract.setStartTime(year=2021, month=1, day=1, hour=1)
        self.contract.setEndTime(year=2023, month=1, day=1, hour=1)

        self.contract.addStakingTokens(
            environment=env_1, signer="bob", amount=10)

        self.contract.withdrawYield(
            environment=env_2, signer="bob", amount=1009299299299)

        emission_per_year = self.contract.EmissionRatePerTauYearly.get()
        dev_reward_pct = self.contract.DevRewardPct.get()

        bob_expected = calcExpectedYield(
            emission_per_year, dev_reward_pct, 10, 60)

        self.contract.withdrawTokensAndYield(environment=env_2, signer="bob")
        self.assertAlmostEqual(self.basic_token.balances['bob'], bob_expected)

    def test_12_end_time(self):
        env_1 = {'now': Datetime(year=2021, month=1, day=1, hour=0)}
        env_2 = {'now': Datetime(year=2021, month=1, day=1, hour=3)}

        self.contract.setStartTime(year=2021, month=1, day=1, hour=1)
        self.contract.setEndTime(year=2021, month=1, day=1, hour=2)

        self.contract.addStakingTokens(
            environment=env_1, signer="bob", amount=10)

        dev_reward_pct = self.contract.DevRewardPct.get()
        emission_per_year = self.contract.EmissionRatePerTauYearly.get()

        bob_expected = calcExpectedYield(
            emission_per_year, dev_reward_pct, 10, 60)

        self.contract.withdrawTokensAndYield(environment=env_2, signer="bob")
        self.assertAlmostEqual(self.basic_token.balances['bob'], bob_expected)

    def test_13_addStakingTokens_check_len_should_pass(self):

        self.contract.addStakingTokens(
            signer="bob", amount=10)
        self.contract.addStakingTokens(
            signer="bob", amount=10)

        deposits = self.contract.Deposits['bob']
        self.assertEqual(len(deposits), 2)

    def test_14_addStakingTokens_check_len_should_fail(self):

        self.contract.addStakingTokens(
            signer="bob", amount=10)
        self.contract.addStakingTokens(
            signer="bob", amount=10)

        deposits = self.contract.Deposits['bob']
        self.contract.addStakingTokens(
            signer="bob", amount=10)

        with self.assertRaises(AssertionError):
            self.assertEqual(len(deposits), 2)

    def test_15_addStakingTokens_withdrawTokensAndYield_check_len_should_pass(self):

        self.contract.addStakingTokens(
            signer="bob", amount=10)
        self.contract.addStakingTokens(
            signer="bob", amount=10)

        self.contract.withdrawTokensAndYield(signer="bob")
        deposits = self.contract.Deposits['bob']
        self.assertEqual(deposits, False)

    def test_16_emergencyReturnStake(self):
        env_1 = {'now': Datetime(year=2021, month=1, day=1, hour=0)}
        env_2 = {'now': Datetime(year=2021, month=1, day=1, hour=3)}

        self.contract.addStakingTokens(
            environment=env_1,
            signer="bob", amount=10)
        self.contract.addStakingTokens(
            environment=env_1,
            signer="bob", amount=10)

        self.contract.withdrawYield(
            environment=env_2, signer="bob", amount=1500)

        self.contract.emergencyReturnStake(signer="bob")
        deposits = self.contract.Deposits['bob']
        self.assertEqual(deposits, False)

        withdrawals = self.contract.Withdrawals['bob']
        self.assertEqual(withdrawals, 0)

        bob_balance = self.currency.balances["bob"]
        self.assertEqual(bob_balance, 1000)

        with self.assertRaises(AssertionError):
            self.assertEqual(bob_balance, 0)


if __name__ == '__main__':
    unittest.main()
