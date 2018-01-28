import React, { Component } from 'react';
import CoinTotalValueWindow from './CoinTotalValueWindow.js';
import CoinNetProfitWindow from './CoinNetProfitWindow.js';

// COMPONENT INFO: Refers to container at top of portfolio with two windows
class CoinNetValueContainer extends Component {
  constructor(props) {
    super(props);
  }

  render() {
    return (
      <div className="CoinNetValueContainer">
        <CoinTotalValueWindow />
        <CoinNetProfitWindow />
      </div>
    )
  }
}

export default CoinNetValueContainer;
