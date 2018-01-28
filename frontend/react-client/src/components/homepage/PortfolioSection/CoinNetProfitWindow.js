import React, { Component } from 'react';

// COMPONENT INFO: Refers to small top right window for total profit in portfolio
class CoinNetProfitWindow extends Component {
  constructor(props) {
    super(props);
  }

  render() {
    return (
      <div className="OverallChangePortfolioWindow borderAll marginLeft-5">
      <div>
        <div className="TotalValueCoinText">
          Net Profit to Date:
        </div>
        <div className="PrevValueCoinText RightAlign">
          Prev Net Profit to Date (24H ago): <span style={{color: 'red'}}> -10.71%</span>
        </div>
      </div>

        <div>
          <div className="TotalValueNumbersText">
            <span className="ProfitGreen"> $72,247.13 </span> <span className="BTCColor"> (4.12 BTC) </span>
          </div>
          <div className="TotalValueNumbersText RightAlign PrevValueAlign">
            <span className="ProfitGreen">  $78,723.29 </span> <span className="BTCColor"> (4.56 BTC) </span>
          </div>
        </div>
      </div>
    )
  }
}

export default CoinNetProfitWindow;
