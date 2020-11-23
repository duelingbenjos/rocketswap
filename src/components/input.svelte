<script lang="ts">
</script>

<div class="container">
  <div class="amount">
    <div class="label">From</div>
    <div class="amount-value">5.5132</div>
  </div>
  <div class="token-info">
    <div class="label">Balance: 50001</div>
    <div class="token-controls">
      <div class="max-button-cont"><button class="max-button">MAX</button></div>
      <div class="token-button-cont"><button class="token-select-button">TAU <img src="assets/images/chevron-arrow-down.svg" height="20" width="20" alt="" /></button></div>
    </div>
  </div>
</div>

<style>
.max-button-cont {
    margin-right: 20px;
}

  .token-select-button { 
    color: #fff;
    font-size: 30px;
  }

  .max-button {
    background-color: #3131d98f;
    color: #fff;
    font-size: 20px;
    padding: 6px 8px 8px 8px;
    border-radius: 10px;
  }

  .container {
    width: 90%;
    margin-top: 30px;
    padding: 10px;
    border-radius: 25px;
    border: 1px solid rgba(255, 255, 255, 0.3);
    display: flex;
    height: 120px;
    justify-content: space-between;
    margin: 0 auto;
  }

  .amount {
    padding: 5px 0px 0px 15px;
    display: flex;
    flex-direction: column;
    justify-content: space-between;
  }

  .token-info {
    padding: 5px 15px 0px 0px;
    display: flex;
    flex-direction: column;
    justify-content: space-between;
    text-align: right;
  }

  .token-controls {
    display: flex;
    justify-content: space-around;
    align-items: center;
  }

  .label {
    color: rgba(255, 255, 255, 0.7);
    font-size: 22px;
  }

  .amount-value {
    font-size: 40px;
    color: #fff;
  }

  button,
  input[type='submit'],
  input[type='reset'] {
    background: none;
    color: inherit;
    border: none;
    padding: 0;
    font: inherit;
    cursor: pointer;
    outline: inherit;
  }
</style>
