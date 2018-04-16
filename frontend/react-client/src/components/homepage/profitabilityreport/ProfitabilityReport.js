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
    this.viewIngredient = this.viewIngredient.bind(this);
    this.back = this.back.bind(this);
  }

  componentDidMount() {
    axios.get('/profitability', {
      headers: { Authorization: "Token " + global.token }
    })
    .then(response => {
      const entries = [];
      response.data.forEach(element => {
        entries.push({
          name: element.formula_name,
          total_cost: element.total_ingredient_cost,
          units_sold: element.units_sold,
          average_wholesale_price: element.average_wholesale_price,
          wholesale_revenue: element.wholesale_revenue,
          total_profit: element.total_profit,
          unit_profit: element.unit_profit,
          profit_margin: element.profit_margin,
        });
      });
      this.setState({
        entries,
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
              <th>Total Cost</th>
              <th>Units Sold</th>
              <th>Average Wholesale Price</th>
              <th>Wholesale Revenue</th>
              <th>Total Profit</th>
              <th>Unit Profit</th>
              <th>Profit Margin</th>
            </tr>
          </thead>
          <tbody>
            {
              this.state.entries.map((entry, key) =>
                <ProfitabilityReportEntry
                  {...entry}
                  key={key}
                  viewIngredient={this.viewIngredient}
                />
              )
            }
          </tbody>
        </table>
      </div>;

    return this.state.viewIngredient ? viewIngredient : main;
  }
}

export default ProfitabilityReport;
