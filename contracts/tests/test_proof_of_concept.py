from unittest import TestCase
from contracting.client import ContractingClient

def tau() :
    balances = Hash(default_value=0)
    token_name = Variable()
    token_symbol = Variable()

    # Cannot set breakpoint in @construct
    @construct
    def seed(s_name:str, s_symbol: str, vk: str, vk_amount: int):
        # Overloading this to mint tokens
        token_name.set(s_name)
        token_symbol.set(s_symbol)
        balances[vk] = vk_amount

    @export
    def token_name():
        return token_name.get()

    @export
    def token_symbol():
        return token_symbol.get()

    @export
    def transfer(amount: float, to: str):
        assert amount > 0, 'Cannot send negative balances!'

        # TODO - A1 - why is this caller, and not signer?
        # if we have a contract calling this, although signed by someone else, this will not work
        sender = ctx.signer

        assert balances[sender] >= amount, 'Not enough coins to send!'

        balances[sender] -= amount
        balances[to] += amount

    @export
    def balance_of(account: str):
        return balances[account]

    @export
    def main_balance_of(main_account: str, account: str):
        return balances[main_account, account]

    @export
    def allowance(owner: str, spender: str):
        return balances[owner, spender]

    @export
    def approve(amount: float, to: str):
        assert amount > 0, 'Cannot send negative balances!'

        sender = ctx.caller
        balances[sender, to] += amount
        return balances[sender, to]

    @export
    def transfer_from(amount: float, from_address: str, to_address: str):
        assert amount > 0, 'Cannot send negative balances!'
        assert balances[from_address] > amount, 'Cannot send amount greater than balance!'

        # TODO - A1 - Trying to understand this currency.py vs. function in general...
        balances[from_address] -= amount
        balances[to_address] += amount

def eth() :
    balances = Hash(default_value=0)
    token_name = Variable()
    token_symbol = Variable()

    # Cannot set breakpoint in @construct
    @construct
    def seed(s_name:str, s_symbol: str, vk: str, vk_amount: int):
        # Overloading this to mint tokens
        token_name.set(s_name)
        token_symbol.set(s_symbol)
        balances[vk] = vk_amount

    @export
    def token_name():
        return token_name.get()

    @export
    def token_symbol():
        return token_symbol.get()

    @export
    def transfer(amount: float, to: str):
        assert amount > 0, 'Cannot send negative balances!'

        # TODO - A1 - why is this caller, and not signer?
        sender = ctx.signer

        assert balances[sender] >= amount, 'Not enough coins to send!'

        balances[sender] -= amount
        balances[to] += amount

    @export
    def balance_of(account: str):
        return balances[account]

    @export
    def main_balance_of(main_account: str, account: str):
        return balances[main_account, account]

    @export
    def allowance(owner: str, spender: str):
        return balances[owner, spender]

    @export
    def approve(amount: float, to: str):
        assert amount > 0, 'Cannot send negative balances!'

        sender = ctx.caller
        balances[sender, to] += amount
        return balances[sender, to]

    @export
    def transfer_from(amount: float, from_address: str, to_address: str):
        assert amount > 0, 'Cannot send negative balances!'
        assert balances[from_address] > amount, 'Cannot send amount greater than balance!'

        # TODO - A1 - Trying to understand this currency.py vs. function in general...
        balances[from_address] -= amount
        balances[to_address] += amount



def dex() :
    # Illegal use of a builtin
    # import time
    I = importlib

    # Enforceable interface
    token_interface = [
        I.Func('transfer', args=('amount', 'to')),
        # I.Func('balance_of', args=('account')),
        I.Func('allowance', args=('owner', 'spender')),
        I.Func('approve', args=('amount', 'to')),
        I.Func('transfer_from', args=('amount', 'from_address', 'to_address'))
    ]

    pairs = Hash()

    # Get token modules, validate & return
    def get_interface(tau_contract, token_contract):
        # Make sure that what is imported is actually a valid token
        tau = I.import_module(tau_contract)
        assert I.enforce_interface(tau, token_interface), 'Token contract does not meet the required interface'

        token = I.import_module(token_contract)
        assert I.enforce_interface(token, token_interface), 'Token contract does not meet the required interface'

        return tau, token

    def calculate_trade_details(tau_contract, token_contract, tau_in, token_in):
        # First we need to get tau + token reserve
        tau_reserve = pairs[tau_contract, token_contract, 'tau_reserve']
        token_reserve = pairs[tau_contract, token_contract, 'token_reserve']

        lp_total = tau_reserve * token_reserve

        # Calculate new reserve based on what was passed in
        tau_reserve_new = tau_reserve + tau_in if tau_in > 0 else 0
        token_reserve_new = token_reserve + token_in if token_in > 0 else 0

        # Calculate remaining reserve
        tau_reserve_new = lp_total / token_reserve_new if token_in > 0 else tau_reserve_new
        token_reserve_new = lp_total / tau_reserve_new if tau_in > 0 else token_reserve_new

        # Calculate how much will be removed
        tau_out = tau_reserve - tau_reserve_new if token_in > 0 else 0
        token_out = token_reserve - token_reserve_new if tau_in > 0  else 0

        # Finally, calculate the slippage incurred
        tau_slippage = (tau_reserve / tau_reserve_new) -1 if token_in > 0 else 0
        token_slippage = (token_reserve / token_reserve_new) -1 if tau_in > 0 else 0

        return tau_out, token_out, tau_slippage, token_slippage

    # From UniV2Pair.sol
    def update(tau, token, tau_balance, token_balance, tau_reserve_last, token_reserve_last):
        # block_ts = time.time()
        # time_elapsed = block_ts - pairs[tau.name, token.name, 'block_ts_last']

        # if time_elapsed > 0 and tau_reserve_last != 0 and token_reserve_last != 0 :
        #     TODO - Calculate price_cumulative_last
        #     Need time.time() to calculate price_cumulative_last
        #     pairs[tau.token_name(), token.token_name(), 'tau_price_cumulative_last'] = int(pairs[tau.name, token.name, 'token_reserve'] / pairs[tau.name, token.name, 'tau_reserve']) * time_elapsed
        #     pairs[tau.token_name(), token.token_name(), 'token_price_cumulative_last'] = int(pairs[tau.name, token.name, 'tau_reserve'] / pairs[tau.name, token.name, 'token_reserve']) * time_elapsed

        pairs[tau.token_name(), token.token_name(), 'tau_reserve'] = tau_balance
        pairs[tau.token_name(), token.token_name(), 'token_reserve'] = token_balance
        # pairs[tau.token_name(), token.token_name(), 'block_ts_last'] = block_ts

    # .SOL -> Lamden
    # amount0Out -> tau_out
    # amount1Out -> token_out
    # Ported from UniswapV2Pair.sol @ line 159
    # // this low-level function should be called from a contract which performs important safety checks
    # function swap(uint amount0Out, uint amount1Out, address to, bytes calldata data) external lock {
    def swap(tau, token, tau_out, token_out, to):
        assert not (tau_out > 0 and token_out > 0), 'Only one Coin Out allowed'
        assert tau_out > 0 or token_out > 0, 'Insufficient Ouput Amount'

        tau_reserve = pairs[tau.token_name(), token.token_name(), 'tau_reserve']
        token_reserve = pairs[tau.token_name(), token.token_name(), 'token_reserve']

        assert tau_reserve > tau_out and token_reserve > token_out, 'UniswapV2: Inssuficient Liquidity'

        # TODO - A2 - Why is this called BEFORE downstream asserts?
        # TODO - A2 - How is SOL.safe_transfer() != TAU.transfer_from()
        if tau_out > 0 :
            tau.transfer_from(tau_out, ctx.this, to)
        if token_out > 0 :
            token.transfer_from(token_out, ctx.this, to)

        # TODO - B1 - Identify this call from UniV2
        # if (data.length > 0) IUniswapV2Callee(to).uniswapV2Call(msg.sender, amount0Out, amount1Out, data);

        tau_balance = tau.balance_of(ctx.this)
        token_balance = token.balance_of(ctx.this)

        # TODO - A1/A2 - Deconstruct Curve Adjustment Calculation
        # tau_in = tau_balance - (tau_reserve - tau_out) if tau_balance > tau_reserve - tau_out else 0
        # token_in = token_balance - (token_reserve - token_out) if token_balance > token_reserve - token_out else 0
        #
        # assert tau_in > 0 or token_in > 0, 'UniswapV2: Insufficient Input Amount'
        #
        # ... I'm not sure why balances are being multiplied by 1000, then 3, then by 1000^2
        # I'm guessing this has something to do with smoothing the balance curve
        # tau_balance_adjusted = (tau_balance*1000) - (tau_in*3)
        # token_balance_adjusted = (token_balance*1000) - (token_in*3)
        #
        # assert tau_balance_adjusted * token_balance_adjusted >= (tau_reserve * token_reserve) * (1000^2), 'UniswapV2: Exception: K'

        # TODO - A1/A2 - Implement update function
        update(tau, token, tau_balance, token_balance, tau_reserve, token_reserve)

        # TODO - B2 - Event Emitters?
        # emit Swap(msg.sender, amount0In, amount1In, amount0Out, amount1Out, to);

    @construct
    def seed():
        pairs['count'] = 0

    @export
    # Number of pairs created
    def get_length_pairs():
        return pairs['count']

    @export
    # Returns the total reserves from each tau/token
    def get_reserves(tau_contract:str, token_contract:str):
        return pairs[tau_contract, token_contract, 'tau_reserve'], \
                pairs[tau_contract, token_contract, 'token_reserve']

    @export
    # Pass contracts + tokens_in, get: tokens_out, slippage
    def get_trade_details(tau_contract: str, token_contract: str, tau_in: int, token_in: int):
        return calculate_trade_details(tau_contract, token_contract, tau_in, token_in)

    @export
    # Swap tau or tokens
    def token_swap(tau_contract: str, token_contract: str, tau_in: float, token_in: float, to: str):
        assert tau_in > 0 or token_in > 0, 'Invalid amount!'
        assert not (tau_in > 0 and token_in > 0), 'Swap only accepts one currecy!'

        assert not pairs[tau_contract, token_contract] is None, 'Invalid token ID!'
        assert pairs[tau_contract, token_contract, 'tau_reserve'] > 0
        assert pairs[tau_contract, token_contract, 'token_reserve'] > 0

        tau, token = get_interface(tau_contract, token_contract)

        # 1 - Calculate trade outcome
        tau_out, token_out, tau_slippage, token_slippage = calculate_trade_details(
            tau_contract,
            token_contract,
            tau_in,
            token_in
        )

        # 2 - Transfer in tokens
        if tau_in > 0 : tau.transfer(tau_in, ctx.this)
        if token_in > 0 : token.transfer(token_in, ctx.this)

        # 3 - Swap/transfer out tokens + Update
        swap(tau, token, tau_out, token_out, to)

    @export
    # Pair must exist before liquidity can be added
    def add_liquidity(tau_contract: str, token_contract: str, tau_in: int, token_in: int):
        assert token_in > 0
        assert tau_in > 0

        # Make sure that what is imported is actually a valid token
        tau, token = get_interface(tau_contract, token_contract)

        assert tau_contract != token_contract
        assert not pairs[tau_contract, token_contract] is None, 'Market does not exist!'

        # 1 - This contract will own all amounts sent to it
        tau.transfer(tau_in, ctx.this)
        token.transfer(token_in, ctx.this)

        # Track liquidity provided by signer
        # TODO - If we care about "% pool" This needs to remain updated as market swings along X,Y
        if pairs[tau_contract, token_contract, ctx.signer] is None :
            pairs[tau_contract, token_contract, 'tau_liquidity', ctx.signer] = tau_in
            pairs[tau_contract, token_contract, 'token_liquidity', ctx.signer] = token_in
        else :
            pairs[tau_contract, token_contract, 'tau_liquidity', ctx.signer] += tau_in
            pairs[tau_contract, token_contract, 'token_liquidity', ctx.signer] += token_in

        # I'm assuming registry of [ctx.this,ctx.investor,amount] is done via LP
        update(
            tau,
            token,
            tau.balance_of(ctx.this),
            token.balance_of(ctx.this),
            pairs[tau.token_name(), token.token_name(), 'tau_reserve'],
            pairs[tau.token_name(), token.token_name(), 'token_reserve']
        )

    @export
    # Create pair before doing anything else
    def create_pair(tau_contract: str, token_contract: str, tau_in: int, token_in: int):
        # Make sure that what is imported is actually a valid token
        tau, token = get_interface(tau_contract, token_contract)

        assert tau_contract != token_contract
        assert pairs[tau_contract, token_contract] is None, 'Market already exists!'

        # 1 - Create the pair
        pairs[tau_contract, token_contract] = token_contract
        pairs['count'] += 1

        # 2 - Adds liquidity if provided
        if (not tau_in is None and tau_in > 0) and (not token_in is None and token_in > 0) :
            add_liquidity(tau_contract, token_contract, tau_in, token_in)

class MyTestCase(TestCase):

    def setUp(self):
        self.client = ContractingClient()
        self.client.flush()

        # Currently mocking Lamdem functionality w/ inline tokens
        self.client.submit(tau, 'lamden', constructor_args={
            's_name': 'lamden',
            's_symbol': 'TAU',
            'vk': 'actor1',
            'vk_amount': 15
        })

        self.client.submit(eth, 'ethereum', constructor_args={
            's_name': 'ethereum',
            's_symbol': 'ETH',
            'vk': 'actor1',
            'vk_amount': 15
        })

        self.client.submit(dex, 'dex')


    def change_signer(self, name):
        self.client.signer = name

        self.lamden = self.client.get_contract('lamden')
        self.ethereum = self.client.get_contract('ethereum')
        self.dex = self.client.get_contract('dex')

    # Unit Test designed around
    # UniV2
    # X+Y=Z AMMs - https://ethresear.ch/t/improving-front-running-resistance-of-x-y-k-market-makers/1281
    def test_1_token_interfaces(self):
        self.change_signer('actor1')

        # get balances
        self.assertEqual(self.lamden.token_name(), 'lamden')
        self.assertEqual(self.lamden.token_symbol(), 'TAU')
        self.assertEqual(self.lamden.quick_read('balances', 'actor1'), 15)
        self.assertEqual(self.lamden.balance_of(account='actor1'), 15)

        self.assertEqual(self.ethereum.token_name(), 'ethereum')
        self.assertEqual(self.ethereum.token_symbol(), 'ETH')
        self.assertEqual(self.ethereum.quick_read('balances', 'actor1'), 15)
        self.assertEqual(self.ethereum.balance_of(account = 'actor1'), 15)

    def test_2_dex_create_pair(self):
        self.change_signer('actor1')

        n_pairs_before = self.dex.get_length_pairs()

        # Optionally => Pass in tau_in and token_in
        self.dex.create_pair(
            tau_contract = 'lamden',
            token_contract = 'ethereum',
            tau_in=10,
            token_in=10
        )

        # Verify pairs increased
        n_pairs_after = self.dex.get_length_pairs()
        assert n_pairs_after > n_pairs_before


        # The dex should now own 10 of each
        self.assertEqual(self.lamden.balance_of(account='actor1'), 5)
        self.assertEqual(self.lamden.balance_of(account='dex'), 10)

        self.assertEqual(self.ethereum.balance_of(account='actor1'), 5)
        self.assertEqual(self.ethereum.balance_of(account='dex'), 10)

        # Verify reserves are in place
        tau_reserve, token_reserve = self.dex.get_reserves(
            tau_contract = 'lamden',
            token_contract = 'ethereum'
        )

        self.assertEqual(tau_reserve, 10)
        self.assertEqual(token_reserve, 10)

    def test_3_dex_review_trade(self):
        self.change_signer('actor1')

        # CREATE MARKET + ADD LIQUIDITY
        # Create pair (this will be owned by the dex)
        self.dex.create_pair(
            tau_contract='lamden',
            token_contract='ethereum'
        )

        # Add liquidity
        self.dex.add_liquidity(
            tau_contract='lamden',
            token_contract='ethereum',
            tau_in=10,
            token_in=10
        )

        # TRADE NUMBER 1 - Check trade details
        # Miner spends one unit of A: (11, 9.090909), gets 0.909091 units of B
        tau_out, token_out, tau_slippage, token_slippage = self.dex.get_trade_details(
            tau_contract='lamden',
            token_contract='ethereum',
            tau_in=1,
            token_in=0
        )

        # Review trade details are correct
        assert tau_out == 0
        assert round(token_out, 6) == 0.909091
        assert round(token_slippage, 2) * 100 == 10.00

    def test_4_dex_swap(self):
        self.change_signer('actor1')

        # Distribute currencies to other actors
        self.lamden.transfer(amount = 1, to = 'miner')
        self.lamden.transfer(amount = 1, to = 'buyer')

        # CREATE MARKET + ADD LIQUIDITY
        # Create pair (this will be owned by the dex)
        self.dex.create_pair(
            tau_contract='lamden',
            token_contract='ethereum'
        )

        # Add liquidity
        self.dex.add_liquidity(
            tau_contract='lamden',
            token_contract='ethereum',
            tau_in = 10,
            token_in = 10
        )

        # TRADE NUMBER 1 - MINER
        # Miner spends one unit of A: (11, 9.090909), gets 0.909091 units of B
        self.change_signer('miner')
        self.dex.token_swap(
            tau_contract = 'lamden',
            token_contract = 'ethereum',
            tau_in = 1,
            token_in = 0,
            to = 'miner'
        )

        # Validate Balances + AMM Reserves Post-Swap
        miner_balance_tau = self.lamden.balance_of(account='miner')
        self.assertEqual(miner_balance_tau, 0)
        miner_balance_eth = round(float(str(self.ethereum.balance_of(account='miner'))),6)
        self.assertEqual(miner_balance_eth, 0.909091)

        dex_balance_tau = self.lamden.balance_of(account='dex')
        self.assertEqual(dex_balance_tau, 11)
        dex_balance_eth = round(float(str(self.ethereum.balance_of(account='dex'))), 6)
        self.assertEqual(dex_balance_eth, 9.090909)

        # Get remaining reserves
        tau_reserve, token_reserve = self.dex.get_reserves(
            tau_contract = 'lamden',
            token_contract = 'ethereum'
        )

        tau_reserve = round(float(str(tau_reserve)), 2)
        self.assertEqual(tau_reserve, 11.0)
        token_reserve = round(float(str(token_reserve)), 6)
        self.assertEqual(token_reserve, 9.090909)


        # TRADE NUMBER 2 - BUYER
        self.change_signer('buyer')

        self.dex.token_swap(
            tau_contract = 'lamden',
            token_contract = 'ethereum',
            tau_in = 1,
            token_in = 0,
            to = 'buyer'
        )

        # Validate Balances + AMM Reserves Post-Swap
        buyer_balance_tau = self.lamden.balance_of(account='buyer')
        self.assertEqual(buyer_balance_tau, 0)
        buyer_balance_eth = round(float(str(self.ethereum.balance_of(account='buyer'))),6)
        self.assertEqual(buyer_balance_eth, 0.757576)

        dex_balance_tau = self.lamden.balance_of(account='dex')
        self.assertEqual(dex_balance_tau, 12)
        dex_balance_eth = round(float(str(self.ethereum.balance_of(account='dex'))), 6)
        self.assertEqual(dex_balance_eth, 8.333333)

        # Get remaining reserves
        tau_reserve, token_reserve = self.dex.get_reserves(
            tau_contract = 'lamden',
            token_contract = 'ethereum'
        )

        tau_reserve = round(float(str(tau_reserve)), 2)
        self.assertEqual(tau_reserve, 12.0)
        token_reserve = round(float(str(token_reserve)), 6)
        self.assertEqual(token_reserve, 8.333333)


        # TRADE NUMBER 3 - MINER
        self.change_signer('miner')

        self.dex.token_swap(
            tau_contract='lamden',
            token_contract='ethereum',
            tau_in=0,
            token_in=0.757576,
            to='miner'
        )

        # Validate Balances + AMM Reserves Post-Swap
        miner_balance_tau = round(float(str(self.lamden.balance_of(account='miner'))), 2)
        self.assertEqual(miner_balance_tau, 1.0)
        miner_balance_eth = round(float(str(self.ethereum.balance_of(account='miner'))), 6)
        self.assertEqual(miner_balance_eth, 0.151515)

        dex_balance_tau = round(float(str(self.lamden.balance_of(account='dex'))),2)
        self.assertEqual(dex_balance_tau, 11.0)
        dex_balance_eth = round(float(str(self.ethereum.balance_of(account='dex'))), 6)
        self.assertEqual(dex_balance_eth, 9.090909)

        # Get remaining reserves
        tau_reserve, token_reserve = self.dex.get_reserves(
            tau_contract='lamden',
            token_contract='ethereum'
        )

        tau_reserve = round(float(str(tau_reserve)), 2)
        self.assertEqual(tau_reserve, 11.0)
        token_reserve = round(float(str(token_reserve)), 6)
        self.assertEqual(token_reserve, 9.090909)
