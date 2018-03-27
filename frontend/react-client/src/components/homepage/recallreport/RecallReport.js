import React, { Component } from 'react';
import IngredientSelector from '../../selector/IngredientSelector';
import RecallReportContent from './RecallReportContent';

class RecallReport extends Component {
  constructor(props) {
    super(props);
    this.state = {
      ingredientId: '',
      viewReport: false,
      runs: [],
    };
    this.changeIngredientId = this.changeIngredientId.bind(this);
    this.generate = this.generate.bind(this);
    this.back = this.back.bind(this);
  }

  changeIngredientId(newValue) {
    this.setState({
      ingredientId: newValue,
    });
  }

  back() {
    this.setState({
      viewReport: false,
    });
  }

  generate() {
    // API call
    this.setState({
      viewReport: true,
    });
  }

  render() {
    const content =
      <RecallReportContent runs={this.state.runs} back={this.back} />;

    const main =
      <div>
        <h2>Recall Report</h2>
        <IngredientSelector changeIngredientId={this.changeIngredientId} />
        <button
          type="button"
          className="btn btn-primary"
          onClick={this.generate}>
          Generate Report
        </button>
      </div>;

    return this.state.viewReport ? content : main;
  }
}

export default RecallReport;
