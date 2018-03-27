import React, { Component } from 'react';
import ProductionRun from '../productionrun/ProductionRun';
import PropTypes from 'prop-types';

class RecallReportContent extends Component {
  render() {
    return (
      <ProductionRun runs={this.props.runs} back={this.props.back} />
    );
  }
}

RecallReportContent.propTypes = {
  runs: PropTypes.array,
  back: PropTypes.func,
};

export default RecallReportContent;
