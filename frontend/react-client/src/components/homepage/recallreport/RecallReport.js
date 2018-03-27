import React, { Component } from 'react';
import IngredientSelector from '../../selector/IngredientSelector';
import RecallReportContent from './RecallReportContent';
import axios from 'axios';
import Snackbar from 'material-ui/Snackbar';
import LotSelector from '../../selector/LotSelector';

class RecallReport extends Component {
  constructor(props) {
    super(props);
    this.state = {
      ingredientId: '',
      viewReport: false,
      lots: [],
      lot: '',
      runs: [],
      open: false,
      message: '',
    };
    this.changeIngredientId = this.changeIngredientId.bind(this);
    this.changeLot = this.changeLot.bind(this);
    this.generate = this.generate.bind(this);
    this.back = this.back.bind(this);
  }

  handleRequestClose() {
    this.setState({
      open: false,
    });
  }

  changeIngredientId(newValue) {
    this.setState({
      ingredientId: newValue,
    });
    axios.get(`/inventory/productionlots/${newValue}`, {
      headers: { Authorization: "Token " + global.token }
    })
      .then(response => {
        console.log(response.data);
        this.setState({
          lots: response.data
        });
      })
      .catch(err => {
        this.setState({
          open: true,
          message: 'Error retrieving lots for ingredient',
        });
      });
  }

  changeLot(newValue) {
    this.setState({
      lot: newValue,
    });
  }

  back() {
    this.setState({
      viewReport: false,
    });
  }

  generate() {
    if (!this.state.ingredientId || !this.state.lot) {
      this.setState({
        open: true,
        message: 'Please fill in both ingredient and lot',
      });
      return;
    }
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
        <Snackbar
          open={this.state.open}
          message={this.state.message}
          autoHideDuration={2500}
          onRequestClose={this.handleRequestClose.bind(this)}
        />
        <IngredientSelector changeIngredientId={this.changeIngredientId} />
        <LotSelector lots={this.state.lots} changeLot={this.changeLot} />
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
