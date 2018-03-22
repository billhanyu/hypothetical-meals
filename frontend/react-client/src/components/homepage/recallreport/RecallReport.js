import React, { Component } from 'react';
import IngredientSelector from '../../selector/IngredientSelector';

class RecallReport extends Component {
  constructor(props) {
    super(props);
    this.state = {
      ingredientId: '',
      viewReport: false,
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
    return (
      <div>
        <h3>Recall Report</h3>
        <IngredientSelector changeIngredientId={this.changeIngredientId} />
        <button
          type="button"
          className="btn btn-primary"
          onClick={this.generate}>
          Generate Report
        </button>
      </div>
    );
  }
}

export default RecallReport;
