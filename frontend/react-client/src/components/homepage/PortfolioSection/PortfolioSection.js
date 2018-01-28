import React, { Component } from 'react';
import CoinPortfolioTableContainer from './CoinPortfolioTableContainer.js';
import CoinNetValueContainer from './CoinNetValueContainer.js';

class PortfolioSection extends Component {
  constructor(props) {
    super(props);
  }

  render() {
    return (
      <div>
        <CoinNetValueContainer />
        <CoinPortfolioTableContainer />
      </div>
    )
  }
}

export default PortfolioSection;
