# Creating Tokens
![Template](./static/Token1.png ':size=1000')

In this walk through we are going to look at how incredibly easy and cheap it is to create a token on the Lamden Blockchain. I will walk you through everything step by step so you too can have a fat stack of tokens with your name on it.
You will learn:
* How to make a token on the Lamden Blockchain
* How to create and load a logo for your token
* How to get your token to be visible in your Lamden wallet
* How to get your token to appear on RocketSwap

You will need:
* Your Lamden Web Wallet with approximately 15 TAU in it
* RocketSwap setup — see my guide here (because hey, we need to throw some TAU behind our great idea and let people trade it).
A drawing application that saves as PNG (plenty of free options out there)

OK. Lets make a start by doing some prep.
## Logo creation
1. This is not a drawing tutorial, so lets keep the instructions to what are the restrictions: 
* Keep the file size under 32kB (which is a pretty small file) — my suggestion would be 96x96px size
* Aim for a logo that fits within a circle just in case any corner trimming occurs. It logo itself does not need to be a circle, some people have made shields, others, rain clouds. 
* Remove the circle when done
* Use a transparent background (it just looks better) 
* Save as PNG (SVG is another option however this walk through will concentrate on PNG).  

>[!Tip]
>A handy template to use below. There are plenty of free drawing apps that will save in PNG even Microsoft Paint will work! Online apps like [PixelArt](https://www.pixilart.com/draw) also work.

![Template](./static/Token2.png ':size=96')

2. We need to turn that great artwork you have just created into a base 64 string. Sounds complicated, however someone made an app for us. Head to https://base64.guru/converter/encode/image/png . Choose the file you created then click Encode PNG to Base64. In the Base64 box on the right hand side is a download option, download the output — the file will be called Base64.txt  

>[!Tip]
> You could also do this as an SVG if you are inclined — [link here](https://base64.guru/converter/encode/image/svg).

## Smart Contract
1. Creating a smart contract for a Lamden Standard Token. Well, in truth, we are just going to edit this one below. Copy the code block below.   

```python
# LST001
balances = Hash(default_value=0)

# LST002
metadata = Hash()

@construct
def seed():
    # LST001 - MINT SUPPLY to wallet that submits the contract
    balances[ctx.caller] = 1_000_000

    # LST002
    metadata['token_name'] = "MY TOKEN NAME"
    metadata['token_symbol'] = "TKN"
    metadata['operator'] = ctx.caller

# LST002
@export
def change_metadata(key: str, value: Any):
    assert ctx.caller == metadata['operator'], 'Only operator can set metadata!'
    metadata[key] = value

# LST001
@export
def transfer(amount: float, to: str):
    assert amount > 0, 'Cannot send negative balances!'
    assert balances[ctx.caller] >= amount, 'Not enough coins to send!'

    balances[ctx.caller] -= amount
    balances[to] += amount

# LST001
@export
def approve(amount: float, to: str):
    assert amount > 0, 'Cannot send negative balances!'
    balances[ctx.caller, to] += amount

# LST001
@export
def transfer_from(amount: float, to: str, main_account: str):
    assert amount > 0, 'Cannot send negative balances!'
    assert balances[main_account, ctx.caller] >= amount, 'Not enough coins approved to send! You have {} and are trying to spend {}'\
        .format(balances[main_account, ctx.caller], amount)
    assert balances[main_account] >= amount, 'Not enough coins to send!'

    balances[main_account, ctx.caller] -= amount
    balances[main_account] -= amount
    balances[to] += amount

```
2. Head over to your **Lamden Wallet** and follow these steps:
* Click *Smart Contracts* on the left menu   
* Click *con_new_contract*, which will populate the text box with a simple smart contract   
* Delete all the simple smart contract text in the text box   
* Paste in your smart contract you copied at step 3.   
3. We need to make 3 edits to this smart contract which are all near the start under `def seed():`
* First — `balances[ctx.caller] = 1_000_000`
    `1_000_000` — Is the number of tokens to be minted. 1 million tokens is a good number however, if you have the urge to have more or less, follow the numbering convention used which uses underscores as shown. If you want 10,000 it should be `10_000` do not do this `1_000_0`.
* Second — `metadata[‘token_name’] = “MY TOKEN NAME”`
    Change `“MY TOKEN NAME”` to the name of your coin, keep it short and also keep the `“ “` either side.
* Third — `metadata[‘token_symbol’] = “TKN”`. Replace `“TKN”` with your abbreviated token name, most people go with 3–5 characters. Keep it short and keep the `“ “` either side again.
4. Click *Check Contract*, you should get a green bar at the bottom saying Contract is OK. If it is red, you made an error in the contract it will tell you the line number etc however I would suggest going back to step 3 and try copying and editing again. Click *Submit to Network*.

5. You will get a screen similar to below. We need to select the account with our TAU (10 approx needed) in it which will also receive our new fancy token. And we also need to name our contract — I would suggest following the naming convention offered: `con_new_contract`, so keep the `con_` and `_contract` , replace new with your token name. If you use spaces replace with underscores.
Write down you contract name, then click *SUBMIT CONTRACT*.
> [!important]
> Rememeber to write down or copy the contract name you created!

![Template](./static/Token3.png ':size=947')

After a few seconds you should get a transaction successful message. At which point in time you have made your first token. 

## Adding a Logo to the Token
1. We need to apply the logo you made and converted in the earlier steps:
* Click *Smart Contracts* on the left menu
* Click **+** which is near *con_new_contract*.
* In the Open Contract pop-up, input the contract name you created (and wrote down), then click *OPEN*
2. This will open the contract you just created.
Scroll down to **Contract Methods** and the **change_metadata box**.
Populate the key(text) field with — `token_logo_base64_png`
In the *Value(any value)* field you will need to open the Base64.txt file you downloaded earlier copy the entire contents and paste it into the box.
Click the small blue *run* button beside change_metadata.
![Template](./static/Token4.png ':size=1000')

## Making the Token Visible
1. You will get a **Submit Transaction** pop-up. Select your account to pay for the transaction (1 TAU = 65 stamps). Then click *CONFIRM TRANSACTION*.
2. After a few seconds you will get a transaction successful message. Now lets make it visible in your wallet.
* Click *Accounts* on the left menu
* Click *+ACCOUNTS & TOKENS*
* In the pop-up under What to add? select *Token*
* Then enter your contract name in the contract name field, then press *ENTER*
* Give it 5 seconds to think….It should have loaded your token name, your token symbol and your logo!
* Click *ADD TOKEN*
3. You token will now appear in your wallet and you can transfer it to others, or to your other wallets!
13. Optional — loading to RocketSwap (Covered in two parts within the guide sections)

## Loading the Token to Rocektswap
This is a simple 2 step process which is covered by some of the other guide articles, links below:
* Manually transfer your token - [Guide - Adding Funds](guide.md#Adding-Funds)  
* We also need to provide liquidity for it, both some TAU and your token - [Guide - Liquidity](guide.md#Liquidity-Pools)

THATS IT YOU MADE IT!
