import React, { Component } from 'react';
import CoinPortfolioTable from './CoinPortfolioTable.js';

// COMPONENT INFO: Refers main coin table container box
class CoinPortfolioTableContainer extends Component {
  render() {
    return (
      <div className="FeatureContainer borderAll">
        <CoinPortfolioTable />
      </div>
    )
  }
}

export default CoinPortfolioTableContainer;
