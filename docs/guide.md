## Rocketswap Guide
A guide for first time users of Rocketswap which covers all the core functionality of the application in easy to follow steps.  

### Getting Started

1. Access your Lamden web wallet and make sure you have some TAU in an account (if not, buy some at TXBIT here). Stare longingly at your sweet stack of TAU.

?> You can refer back to your wallet to see the RocketSwap process progress — the account created, funds transferred or transaction history etc. For now move on, you can check this out when we are done.

2. You will need to connect your wallet with RocketSwap, click the Connect Wallet at the bottom left of the screen.

3. You will see the Choose a Login Option pop-up. We are using the Lamden Web wallet, also notice in the picture below, beside the Lamden Wallet is Installed with a green tick. Select the Lamden Wallet option.

4. On the Lamden Wallet Login pop-up:  
    A. Select the checkbox Auto Connect to Lamden Wallet. (Optional — I did this for convenience)
    
    B. Click Connect

5. A pop-up will appear, Linked Account Creation, which will guide you through the process of creating a linked account with RocketSwap. You can learn about linked accounts by selecting the bottom link learn about linked accounts, or click NEXT to proceed.

6. Next pop-up screen for Linked Account Creation. To speed up this process you can transfer TAU from your account to the RocketSwap account about to be created as one step (instead of manually transferring from your Lamden wallet):
    A. Select the account containing your TAU you would like to use

    B. Enter the amount to transfer (in my example I transferred 1 TAU, but you can input however much you would like to transfer to the RocketSwap account)

    C. Click Yes to proceed

7. Final pop-up screen for Linked Account Creation. Personal choice around security, read the options and make a selection (I selected Yes for convenience). Then click CREATE ACCOUNT.

8. Now, go and check your Lamden web wallet. You will see an additional account has been created for RocketSwap AND you should have funds. Go and enjoy RocketSwap!

?> Did you forget to select transfer funds or you just like doing things the hard way? Keep reading on how to transfer funds to RocketSwap Manually.

### Adding Funds

2. Head over to your Lamden web wallet and you will see the RocketSwap account:

    A. Click the RocketSwap account address on the right to copy it
    
    B. To initiate a transfer, click the account name with your TAU funds you would like send to the RocketSwap account
    
    C. On the next screen select SEND TX.

3. On the Make a Lamden Transaction pop-up:

    A. Check your account (this will default to what you clicked)

    B. Check stamp limit (default is already populated, this is equivalent in terminology to Ethereum GAS fees — but much cheaper)

    C. Choose Function to Run — Default is transfer and this is the option we need

    D. Set the amount to the figure you would like to transfer (you will need a small amount remaining for stamps

    E. In the TO field, paste in the address you copied from the last screen

    F. REVIEW YOUR TRANSACTION DETAILS!

    G. Click NEXT

4. On the next screen, click Confirm Transaction, you should then receive a pop-up notification that the transaction was successful and the transmission cost in stamps. Select Home.

5. Select Accounts in the top left of your screen in the Lamden wallet. You will see the RocketSwap account now has the TAU deposited.

**Thats it! You have now deposited TAU to your RocketSwap account.**

### Staking

1. Once you are in RocketSwap:

    A. Confirm your wallet is connected from the bottom left of the screen and you have funds available (Guide steps above)
    
    B. Click the $RSWP wording on the top right of the screen

2. Now let’s get STAKING!
2A. Enter the amount you would like to stake in TAU. Alternatively you can select the MAX button instead of entering an amount to stake your entire wallet, you will notice if you select MAX this is not equal to your full wallet amount, this is due to some small fees need to be extracted.
2B. When you are happy with the amount to be staked, go ahead and click STAKE.

3. The Confirm Staking pop-up will appear. READ the conditions of what you are staking and what you are getting in return, then click STAKE.

4. You will get a pop-up from your Lamden web wallet requesting approval for RocketSwap to spend your TAU. READ the details and if you want further information click the what is this? link at the bottom, otherwise, click APPROVE.

5. Another pop-up from the security conscious people at Lamden asking to Confirm Transaction.
5A. You can check some of the transaction details here. The amount should be the amount you entered when requesting to stake at Step 4A.
5B. Click APPROVE at the bottom to progress

6. YOU DID IT! Staking done! You will get a helpful message flash up briefly in the top right of the screen for a few seconds:

### Performing Swaps

1. The site will open up on the Swap screen, if not, select Swap on the top right of the screen.

2. Lets have a good look at what we are seeing on the Swap screen:
2A. Top box is what we are swapping FROM — handily labelled “From”.
2B. Next box down is what we swapping TO — also a great label on it, “To”.
2C. The arrow allows us to swap the FROM and TO tokens around. Go ahead try it out and see what it does (no costs involved).
2D. The TO box also contains the drop down to select the token we would like to swap —go in and select the token you would like to swap. In this example I am going to swap FROM TAU TO RSWP.

3. Now that we have selected the token we are swapping to, input how much we would either like to ‘spend’ (input into the FROM box), or how much we would like to ‘buy’ (in the TO box) — the opposite box will auto-magically populate. In this example I am going to populate the TO box with 50 RSWP and it is telling me it will cost me 32.14835475 TAU (in FROM).

4. Lets also look at the final box because this is the most important piece of the transaction (see picture below):
4A. Price — the price you paying for your chosen token (the TO) relative to your base token (the FROM).
4B. Price Impact (slippage) — this is the most important piece in the entire swap and determines how much slip is likely to occur when you perform your swap. So you will see in the next screen down I did not get my full 50 RSWP, it slipped to 49.5 — this is based on the Liquidity Pool which we will cover in another article. Needless to say, be aware of slippage!
4C. Fee — as it says, this is the fee for the transaction you can reduce the fee by paying in RSWP (if you have it), and also can be reduced further by staking RSWP (holding it in your tank — another article I will cover).
4D. Slippage Tolerance — you can set the maximum permissible slip you would allow for the transaction to proceed (all the way to 49%). If the slippage at step 3B is above the tolerance you set you will get this message.


You can either increase the amount of slippage you will allow OR input a lower swap amount should reduce slippage (but of course you get less of what you want). Please make sure you understand slippage and the consequences before adjusting.

4E. Guaranteed minimum — as the name says, this is a guarantee the amount you receive will not slip below this figure.
4F. Below this box is a brief history of previous swaps, you can scroll through it by hovering your mouse over it and scrolling with your mouse wheel.

5. Once you are happy with all the details, you can click the Swap button. A Confirm Swap pop-up will appear, for you to review the details. Take a moment to read the note, in my example it reads as follows:
>Output is estimated. You will receive at least 49.14579622 RSWP or the transaction will revert.

!> This is another important piece of info. If you remember above we had a guaranteed minimum of this same amount which is based on our Slippage Tolerance. If you get too stingy on your slippage, the transaction might not go through (as it says ‘revert’). On RocketSwap, this is less of an issue, you loose the tx fee (a few cents — if you did this on Ethereum, you would have just lost $30 at Uniswap). If this occurs, try again — maybe with a larger slippage (read my multiple cautions about large slippage please).

Anyway, lets keep moving, click Launch.

**LIFTOFF!!!** That’s it, you did it! Sit back and watch the rocket lift off! No seriously, RocketSwap has a rocket!  The other, less fun, notification will flash up for a few seconds in the top right of your screen — like below:

### Liquidity Pools

?> By adding liquidity you will earn 0.3% of all trades on the pair, proportional to your share of the pool. Some pairs may have some additional bonuses — RSWP for example provides additional benefits(additional RSWP earned) through staking liquidity points.

1. Double check you have BOTH TAU and your other token of choice available — so a balance above 0 of both TAU and the other token.


2. Click on Pools in the top right of the screen.

3. There is a very good chance you will not be the first to create the pool, so we don’t need to create a pool so we will add to a pool that already exists. Click Add Liquidity.

4. Click Select token dropdown, wait for the list to load then select the token you would like to use (I will use DOUG for the example).


5. From here we can do a few things:
5A. At the bottom we can see some of the stats for the pair selected — how much is one compared to the other which will determine how much we can add to the pool. As you can see in my example I have a lot more DOUG than TAU and they are a similar price, so I will run out of TAU before I run out of DOUG.
5B. Feel free to click on either MAX and see the result or you can enter a figure into either box to see the result. In my example I am adding 50 TAU and it automatically populates the DOUG as 61.
5C. After you are happy with the amount you are adding to the pool click Add Supply.

6. Read and verify the details on the popup then click Confirm Add Supply.

7. For first time users to liquidity pools there will be a popup from the Lamden Wallet for you to authorise the contract action. (Sorry did not get a screen shot). Read and accept to proceed.


8. Thats it! You will get a brief message pop up on the top right for a few seconds. Similar to below (except for your chosen pair):

?> Handy Hint! To remove your liquidity, you need to go back to Add Liquidity, select your token again. When it loads you will see on the top right of the popup and option to remove. (Have a look at the figure at step 6 and you can see it).

