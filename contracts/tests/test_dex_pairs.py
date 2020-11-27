from unittest import TestCase
from contracting.client import ContractingClient
from contracting.stdlib.bridge.decimal import ContractingDecimal

MINIMUM_LIQUIDITY = pow(10,3)
TOKEN_DECIMALS = 18
STARTING_BALANCE = 10000

# TODO - A2 - Complete UniswapV2: K exceptions
# TODO - A4 - Token Supply Validations.
# All test values for tests, taken from UniswapV2Pair.specs.ts
class DexPairsSpecs(TestCase):

    # returns ContractingDecimal
    def expand_to_token_decimals(self, amount):
        return ContractingDecimal(amount / pow(10,TOKEN_DECIMALS))

    # before each test, setup the conditions
    def setUp(self):
        self.client = ContractingClient()
        self.client.flush()

        self.fee_to_address = 'fee_to_address'
        self.fee_to_setter_address = 'fee_to_setter_address'
        self.wallet_address = 'wallet_address'

        # token0
        with open('../currency.py') as f:
            code = f.read()
            self.client.submit(code, 'tau', constructor_args={
                's_name': 'tau',
                's_symbol': 'TAU',
                'vk': self.wallet_address,
                'vk_amount': 10000
            })

        # token1
        with open('../basetoken.py') as f:
            code = f.read()
            self.client.submit(code, name='eth', constructor_args={
                's_name': 'eth',
                's_symbol': 'ETH',
                'vk': self.wallet_address,
                'vk_amount': 10000
        })

        # Dex
        with open('../dex.py') as f:
            code = f.read()
            self.client.submit(code, 'dex', constructor_args={
                'fee_to_setter_address': self.fee_to_setter_address
            })

        # Dex Pairs
        # Initialize ownership to dex
        with open('../dex_pairs.py') as f:
            code = f.read()
            self.client.submit(code, 'dex_pairs', constructor_args={
                'owner_address': 'dex'
            })

        # Change tx signer to actor1
        self.change_signer(self.wallet_address)

        # Create pair on Dex
        self.dex.create_pair(
            dex_pairs='dex_pairs',
            tau_contract='tau',
            token_contract='eth'
        )

    def change_signer(self, name):
        self.client.signer = name

        self.tau = self.client.get_contract('tau')
        self.eth = self.client.get_contract('eth')
        self.dex = self.client.get_contract('dex')
        self.dex_pairs = self.client.get_contract('dex_pairs')

    def zero_address(self):
        return '0'

    def test_1_mint(self):
        self.change_signer(self.wallet_address)

        tau_amount = 1.0
        eth_amount = 4.0

        self.tau.transfer(amount=tau_amount, to=self.dex_pairs.name)
        self.eth.transfer(amount=eth_amount, to=self.dex_pairs.name)

        expected_liquidity = 2.0
        token_mint_address, tau_amount, token_amount = self.dex_pairs.mint_liquidity(
            dex_contract=self.dex.name,
            tau_contract=self.tau.name,
            token_contract=self.eth.name,
            to_address=self.wallet_address
        )

        # TODO - A4 - Asserts on Emit()
        total_supply = self.dex_pairs.total_supply(tau_contract=self.tau.name, token_contract=self.eth.name)
        assert total_supply == expected_liquidity, 'Invalid Total supply'

        zero_address_balance = self.dex_pairs.balance_of(
            tau_contract=self.tau.name,
            token_contract=self.eth.name,
            account=self.zero_address()
        )
        assert zero_address_balance == self.expand_to_token_decimals(MINIMUM_LIQUIDITY), 'Invalid minimum liquidity initialized'

        wallet_address_balance = self.dex_pairs.balance_of(
            tau_contract=self.tau.name,
            token_contract=self.eth.name,
            account=self.wallet_address
        )
        assert wallet_address_balance == expected_liquidity - self.expand_to_token_decimals(MINIMUM_LIQUIDITY), 'Invalid balance initialized'

        assert self.tau.balance_of(account=self.dex_pairs.name) == tau_amount, 'Invalid tau balance'
        assert self.eth.balance_of(account=self.dex_pairs.name) == eth_amount, 'Invalid ethereum balance'

        tau_reserves, token_reserves = self.dex_pairs.get_pair_reserves(
            tau_contract=self.tau.name,
            token_contract=self.eth.name
        )

        assert tau_reserves == tau_amount, 'Invalid tau reserves'
        assert token_reserves == eth_amount, 'Invalid eth reserves'

    def add_liquidity(self, tau_amount, token_amount):
        self.tau.transfer(amount=tau_amount, to=self.dex_pairs.name)
        self.eth.transfer(amount=token_amount, to=self.dex_pairs.name)

        self.dex_pairs.mint_liquidity(
            dex_contract=self.dex.name,
            tau_contract=self.tau.name,
            token_contract=self.eth.name,
            to_address=self.wallet_address
        )

    def test_2_0_swap_tests(self):
        swap_test_cases = [
            [1, 5, 10, '1662497915624478906'],
            [1, 10, 5, '453305446940074565'],

            [2, 5, 10, '2851015155847869602'],
            [2, 10, 5, '831248957812239453'],

            [1, 10, 10, '906610893880149131'],
            [1, 100, 100, '987158034397061298'],
            [1, 1000, 1000, '996006981039903216']
        ]

        swap_test_cases = map(
            lambda case:
            map(
                lambda x:
                self.expand_to_token_decimals(int(x)) if isinstance(x, str) else ContractingDecimal(int(x)),
                case
            ),
            swap_test_cases
        )

        index = 0
        for test_case in swap_test_cases :
            self.setUp()

            swap_amount, tau_amount, token_amount, expected_output_amount = test_case

            index += 1
            print("Test Case [#{}] with params: [{},{},{},{}]".format(index, swap_amount, tau_amount, token_amount, expected_output_amount))

            self.add_liquidity(tau_amount, token_amount)
            self.tau.transfer(amount=swap_amount, to=self.dex_pairs.name)

            # TODO - A2 - Complete UniswapV2: K exceptions
            # with self.assertRaises(Exception) as context:
            # self.dex_pairs.swap(
            #     tau_contract=self.tau.name,
            #     token_contract=self.eth.name,
            #     tau_out=0,
            #     token_out=expected_output_amount + 1.0, # swap more
            #     to_address=self.wallet_address
            # )
            # self.assertTrue('UniswapV2: K' in context.exception, 'UniswapV2 ')

            self.dex_pairs.swap(
                tau_contract=self.tau.name,
                token_contract=self.eth.name,
                tau_out=0,
                token_out=expected_output_amount,
                to_address='test_results_wallet'
            )

            # Validate Reserves
            tau_reserve, token_reserve = self.dex_pairs.get_pair_reserves(
                tau_contract=self.tau.name,
                token_contract=self.eth.name
            )

            self.assertEqual(tau_reserve, tau_amount + swap_amount)
            self.assertEqual(token_reserve, token_amount - expected_output_amount)

            wallet_balance_tau = self.tau.balance_of(account='test_results_wallet')
            wallet_balance_token = self.eth.balance_of(account='test_results_wallet')
            self.assertEqual(wallet_balance_tau, 0)
            self.assertEqual(wallet_balance_token, expected_output_amount)

    def test_3_token0_swap(self):
        self.change_signer(self.wallet_address)

        tau_amount = 5
        token_amount = 10

        self.add_liquidity(tau_amount, token_amount)

        swap_amount = 1
        expected_output_amount = self.expand_to_token_decimals(1662497915624478906)

        self.tau.transfer(amount=swap_amount, to=self.dex_pairs.name)

        # TODO - A4 - Asserts on Emit()
        self.dex_pairs.swap(
            tau_contract=self.tau.name,
            token_contract=self.eth.name,
            tau_out=0,
            token_out=expected_output_amount,
            to_address='test_results_wallet'
        )
        # Validate Wallet Balances Post Swap
        wallet_balance_tau = self.tau.balance_of(account='test_results_wallet')
        self.assertEqual(wallet_balance_tau, 0.0)
        wallet_balance_token = self.eth.balance_of(account='test_results_wallet')
        self.assertEqual(wallet_balance_token, expected_output_amount)

        # Validate Reserves
        tau_reserve, token_reserve = self.dex_pairs.get_pair_reserves(
            tau_contract=self.tau.name,
            token_contract=self.eth.name
        )

        self.assertEqual(tau_reserve, tau_amount + swap_amount)
        self.assertEqual(token_reserve, token_amount - expected_output_amount)

        # Validate Balances + AMM Reserves Post-Swap
        pair_balance_tau = self.tau.balance_of(account=self.dex_pairs.name)
        self.assertEqual(pair_balance_tau, tau_amount + swap_amount)
        pair_balance_token = self.eth.balance_of(account=self.dex_pairs.name)
        self.assertEqual(pair_balance_token, token_amount - expected_output_amount)

        # TODO - A4 - Token Supply Validations.
        # Validate Supply @ UniswapV2Pair.specs.ts
        total_supply = self.dex_pairs.total_supply(
            tau_contract=self.tau.name,
            token_contract=self.eth.name
        )

    def test_3_token1_swap(self):
        self.change_signer(self.wallet_address)

        tau_amount = 5
        token_amount = 10

        self.add_liquidity(tau_amount, token_amount)

        swap_amount = 1
        expected_output_amount = self.expand_to_token_decimals(453305446940074565)

        self.eth.transfer(amount=swap_amount, to=self.dex_pairs.name)

        # TODO - A4 - Asserts on Emit()
        self.dex_pairs.swap(
            tau_contract=self.tau.name,
            token_contract=self.eth.name,
            tau_out=expected_output_amount,
            token_out=0,
            to_address='test_results_wallet'
        )

        # Validate Wallet Balances Post Swap
        wallet_balance_tau = self.tau.balance_of(account='test_results_wallet')
        self.assertEqual(wallet_balance_tau, expected_output_amount)
        wallet_balance_token = self.eth.balance_of(account='test_results_wallet')
        self.assertEqual(wallet_balance_token, 0.0)

        # Validate Reserves
        tau_reserve, token_reserve = self.dex_pairs.get_pair_reserves(
            tau_contract=self.tau.name,
            token_contract=self.eth.name
        )

        self.assertEqual(tau_reserve, tau_amount - expected_output_amount)
        self.assertEqual(token_reserve, token_amount + swap_amount)

        # Validate Balances + AMM Reserves Post-Swap
        pair_balance_tau = self.tau.balance_of(account=self.dex_pairs.name)
        self.assertEqual(pair_balance_tau, tau_amount - expected_output_amount)
        pair_balance_token = self.eth.balance_of(account=self.dex_pairs.name)
        self.assertEqual(pair_balance_token, token_amount + swap_amount)

        # TODO - A4 - Token Supply Validations.
        # Validate Supply @ UniswapV2Pair.specs.ts
        total_supply = self.dex_pairs.total_supply(
            tau_contract=self.tau.name,
            token_contract=self.eth.name
        )

    def test_4_burn(self):
        self.change_signer(self.wallet_address)

        tau_amount = 3
        token_amount = 3

        # Add liquidity
        self.add_liquidity(tau_amount, token_amount)

        expected_liquidity = 3

        self.dex_pairs.transfer(
            tau_contract=self.tau.name,
            token_contract=self.eth.name,
            amount=expected_liquidity-self.expand_to_token_decimals(MINIMUM_LIQUIDITY),
            to=self.dex_pairs.name
        )

        dex_pair_lp_balance = self.dex_pairs.balance_of(
            tau_contract=self.tau.name,
            token_contract=self.eth.name,
            account=self.dex_pairs.name
        )
        assert dex_pair_lp_balance == expected_liquidity-self.expand_to_token_decimals(MINIMUM_LIQUIDITY)

        # transfer, transfer, transfer, sync, burn
        tau_amount, token_amount = self.dex_pairs.burn_liquidity(
            dex_contract=self.dex.name,
            tau_contract=self.tau.name,
            token_contract=self.eth.name,
            to_address=self.wallet_address
        )

        # Assert we got back everything - MINIMUM LIQUIDITY
        assert tau_amount == token_amount
        assert tau_amount == expected_liquidity-self.expand_to_token_decimals(MINIMUM_LIQUIDITY)
        assert token_amount == expected_liquidity-self.expand_to_token_decimals(MINIMUM_LIQUIDITY)

        tau_wallet_balance = self.tau.balance_of(account=self.wallet_address)
        assert tau_wallet_balance == STARTING_BALANCE - self.expand_to_token_decimals(MINIMUM_LIQUIDITY)
        token_wallet_balance = self.eth.balance_of(account=self.wallet_address)
        assert token_wallet_balance == STARTING_BALANCE - self.expand_to_token_decimals(MINIMUM_LIQUIDITY)

        # Assert that remaining balance of liquidity for wallet is 0
        assert self.dex_pairs.balance_of(tau_contract=self.tau.name, token_contract=self.eth.name, account=self.wallet_address) == 0
        # assert total supply left for token pair is the MINIMUM_LIQUIDITY
        assert self.dex_pairs.total_supply(tau_contract=self.tau.name, token_contract=self.eth.name) == self.expand_to_token_decimals(MINIMUM_LIQUIDITY)

        # assert total currency left on currencies is only the minimum liquidity
        assert self.tau.balance_of(account=self.dex_pairs.name) == self.expand_to_token_decimals(MINIMUM_LIQUIDITY)
        assert self.eth.balance_of(account=self.dex_pairs.name) == self.expand_to_token_decimals(MINIMUM_LIQUIDITY)

    # Test = Dex.fee_to is not initialized (feeTo is Off)
    def test_5_feeTo_off(self):
        tau_amount = 1000
        eth_amount = 1000
        self.add_liquidity(tau_amount, eth_amount)

        swap_amount = 1
        expected_output_amount = self.expand_to_token_decimals(996006981039903216)
        self.eth.transfer(amount=swap_amount, to=self.dex_pairs.name)
        self.dex_pairs.swap(
            tau_contract=self.tau.name,
            token_contract=self.eth.name,
            tau_out=expected_output_amount,
            token_out=0,
            to_address='test_results_wallet'
        )

        # Validate Reserves
        tau_reserve, token_reserve = self.dex_pairs.get_pair_reserves(
            tau_contract=self.tau.name,
            token_contract=self.eth.name
        )
        self.assertEqual(tau_reserve, tau_amount - expected_output_amount)
        self.assertEqual(token_reserve, eth_amount + swap_amount)

        wallet_balance_tau = self.tau.balance_of(account='test_results_wallet')
        wallet_balance_token = self.eth.balance_of(account='test_results_wallet')
        self.assertEqual(wallet_balance_tau, expected_output_amount)
        self.assertEqual(wallet_balance_token, 0)

        expected_liquidity = 1000

        self.dex_pairs.transfer(
            tau_contract=self.tau.name,
            token_contract=self.eth.name,
            amount=expected_liquidity-self.expand_to_token_decimals(MINIMUM_LIQUIDITY),
            to=self.dex_pairs.name
        )

        dex_pair_lp_balance = self.dex_pairs.balance_of(
            tau_contract=self.tau.name,
            token_contract=self.eth.name,
            account=self.dex_pairs.name
        )
        assert dex_pair_lp_balance == expected_liquidity-self.expand_to_token_decimals(MINIMUM_LIQUIDITY)

        self.dex_pairs.burn_liquidity(
            dex_contract=self.dex.name,
            tau_contract=self.tau.name,
            token_contract=self.eth.name,
            to_address=self.wallet_address
        )

        # Total supply remains as MINIMUM LIQUIDITY
        pair_total_supply = self.dex_pairs.total_supply(tau_contract=self.tau.name, token_contract=self.eth.name)
        assert pair_total_supply == self.expand_to_token_decimals(MINIMUM_LIQUIDITY)

    # Test = Dex.fee_to gets initialized (feeTo is On)
    def test_5_feeTo_on(self):
        # Initialize dex.fee_to
        self.change_signer(self.fee_to_setter_address)
        self.dex.set_fee_to(account=self.fee_to_address)

        self.change_signer(self.wallet_address)

        tau_amount = 1000
        eth_amount = 1000
        self.add_liquidity(tau_amount, eth_amount)

        swap_amount = 1
        expected_output_amount = self.expand_to_token_decimals(996006981039903216)
        self.eth.transfer(amount=swap_amount, to=self.dex_pairs.name)
        self.dex_pairs.swap(
            tau_contract=self.tau.name,
            token_contract=self.eth.name,
            tau_out=expected_output_amount,
            token_out=0,
            to_address='test_results_wallet'
        )

        # Validate Reserves
        tau_reserve, token_reserve = self.dex_pairs.get_pair_reserves(
            tau_contract=self.tau.name,
            token_contract=self.eth.name
        )
        self.assertEqual(tau_reserve, tau_amount - expected_output_amount)
        self.assertEqual(token_reserve, eth_amount + swap_amount)

        wallet_balance_tau = self.tau.balance_of(account='test_results_wallet')
        wallet_balance_token = self.eth.balance_of(account='test_results_wallet')
        self.assertEqual(wallet_balance_tau, expected_output_amount)
        self.assertEqual(wallet_balance_token, 0)

        expected_liquidity = 1000

        self.dex_pairs.transfer(
            tau_contract=self.tau.name,
            token_contract=self.eth.name,
            amount=expected_liquidity-self.expand_to_token_decimals(MINIMUM_LIQUIDITY),
            to=self.dex_pairs.name
        )

        dex_pair_lp_balance = self.dex_pairs.balance_of(
            tau_contract=self.tau.name,
            token_contract=self.eth.name,
            account=self.dex_pairs.name
        )
        assert dex_pair_lp_balance == expected_liquidity-self.expand_to_token_decimals(MINIMUM_LIQUIDITY)

        self.dex_pairs.burn_liquidity(
            dex_contract=self.dex.name,
            tau_contract=self.tau.name,
            token_contract=self.eth.name,
            to_address=self.wallet_address
        )

        # Total supply remains as MINIMUM LIQUIDITY
        # ContractingDecimal carries more precision than Ethereum bigNumber
        # assert to 17 places
        expected_supply = self.expand_to_token_decimals(249750499251388 + MINIMUM_LIQUIDITY)
        pair_total_supply = self.dex_pairs.total_supply(tau_contract=self.tau.name, token_contract=self.eth.name)
        self.assertAlmostEqual(pair_total_supply, expected_supply, places=17)

        fee_to_balance = self.dex_pairs.balance_of(
            tau_contract=self.tau.name,
            token_contract=self.eth.name,
            account=self.fee_to_address
        )
        expected_fee_to_balance = self.expand_to_token_decimals(249750499251388)
        self.assertAlmostEqual(fee_to_balance, expected_fee_to_balance, places=17)

        tau_balance = self.tau.balance_of(account=self.dex_pairs.name)
        expected_tau_balance = self.expand_to_token_decimals(249501683697445 + MINIMUM_LIQUIDITY)
        self.assertAlmostEqual(tau_balance, expected_tau_balance, places=17)

        token_balance = self.eth.balance_of(account=self.dex_pairs.name)
        expected_token_balance = self.expand_to_token_decimals(250000187312969 + MINIMUM_LIQUIDITY)
        self.assertAlmostEqual(token_balance, expected_token_balance, places=17)
