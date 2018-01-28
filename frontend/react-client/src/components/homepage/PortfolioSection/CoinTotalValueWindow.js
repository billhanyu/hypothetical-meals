import React, { Component } from 'react';

// COMPONENT INFO: Refers to top left window for total value of coins in portfolio
class CoinTotalValueWindow extends Component {
  constructor(props) {
    super(props);
  }

  render() {
    return (
      <div className="OverallChangePortfolioWindow borderAll">
        <div>
          <div className="TotalValueCoinText">
            Total Value of Coins:
          </div>
          <div className="PrevValueCoinText RightAlign">
            Previous Value of Coins (24H ago): <span style={{color: 'red'}}>-9.13%</span>
          </div>
        </div>

        <div>
          <div className="TotalValueNumbersText">
            $55,458.27 <span className="BTCColor"> (4.12 BTC) </span>
          </div>
          <div className="TotalValueNumbersText RightAlign PrevValueAlign">
            $61,429.18 <span className="BTCColor"> (4.56 BTC) </span>
          </div>
        </div>
      </div>
    )
  }
}

export default CoinTotalValueWindow;
