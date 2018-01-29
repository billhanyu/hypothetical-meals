import React, { Component } from 'react';
import MainTable from './MainTable.js';

class PortfolioSection extends Component {
  constructor(props) {
    super(props);
  }

  render() {
    return (
      <div className="FeatureContainer borderAll">
        <MainTable />
      </div>
    )
  }
}

export default PortfolioSection;
