import React, { Component } from 'react';
import PageBar from '../../GeneralComponents/PageBar';
import axios from 'axios';
import ProfitabilityReportEntry from './ProfitabilityReportEntry';
import AddEditIngredient from '../ingredient/AddEditIngredient';

class ProfitabilityReport extends Component {
  constructor(props) {
    super(props);
    this.state = {
      pages: 0,
      entries: [],
      currentPage: 1,
      ingredient: null,
      viewIngredient: false,
    };
    this.selectPage = this.selectPage.bind(this);
    this.viewIngredient = this.viewIngredient.bind(this);
    this.back = this.back.bind(this);
  }

  componentDidMount() {
    axios.get('/spendinglogs/pages', {
      headers: { Authorization: "Token " + global.token }
    })
    .then(response => {
      this.setState({
        pages: response.data.numPages
      });
      this.selectPage(1);
    });
  }

  selectPage(idx) {
    this.setState({
      currentPage: idx,
    });
    axios.get(`/spendinglogs/page/${idx}`, {
      headers: { Authorization: "Token " + global.token }
    })
    .then(response => {
      this.setState({
        entries: response.data
      });
    });
  }

  viewIngredient(id) {
    axios.get(`/ingredients/id/${id}`, {
      headers: { Authorization: "Token " + global.token }
    })
      .then(response => {
        this.setState({
          ingredient: response.data,
          viewIngredient: true,
        });
      })
      .catch(err => {
        alert('Error retrieving ingredient data');
      });
  }

  back() {
    this.setState({
      viewIngredient: false,
    });
  }

  render() {
    const viewIngredient =
      <AddEditIngredient
        mode='edit'
        backToList={this.back}
        ingredient={this.state.ingredient}
      />;

    const main =
      <div>
        <h2>Spending Log</h2>
        <table className="table">
          <thead>
            <tr>
              <th>Ingredient Name</th>
              <th>Total Unit Ordered</th>
              <th>Cost</th>
              <th>Sales Amount</th>
              <th>Net Profit</th>
            </tr>
          </thead>
          <tbody>
            {
              this.state.entries.map((entry, key) =>
                <ProfitabilityReportEntry
                  item={entry}
                  key={key}
                  viewIngredient={this.viewIngredient}
                />
              )
            }
          </tbody>
        </table>
        <PageBar
          pages={this.state.pages}
          selectPage={this.selectPage}
          currentPage={this.state.currentPage}
        />
      </div>;

    return this.state.viewIngredient ? viewIngredient : main;
  }
}

export default ProfitabilityReport;
