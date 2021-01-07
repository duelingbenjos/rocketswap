<style>
    div{
        box-sizing: border-box;
        background-color: var(--msg-box-background);
        color: var(--text-primary-color);
        font-size: var(--text-size-small);
        border-radius: var(--border-radius);
        padding: 30px;
        box-shadow: -1px 10px 82px 0px rgba(0, 0, 0, 0.3);
        -webkit-box-shadow: -1px 10px 82px 0px rgba(0, 0, 0, 0.3);
        -moz-box-shadow: -1px 10px 82px 0px rgba(0, 0, 0, 0.3);
        padding-top: 15px;
        width: 100%;
    }
    @media screen and (max-width: 800px) {
        div {
            border-radius: 0px;
        }
    }
</style>

<div>
    <p><strong>Liquidity provider rewards</strong></p>
    <p>
        Liquidity providers earn a 0.3% fee on all trades proportional to the their share of the pool. 
        Fees are added to the pool, accrue in real time and can be claimed by withdrawing your liquidity.
    </p>
</div>