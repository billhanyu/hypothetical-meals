import React, { Component } from 'react';
import { COUNT_PER_PAGE } from '../../Constants/Pagination';
import PageBar from '../../GeneralComponents/PageBar';
import axios from 'axios';
import FreshnessItem from './FreshnessItem';
import AddEditIngredient from '../ingredient/AddEditIngredient';

class FinalProductFreshness extends Component {
  constructor(props) {
    super(props);
    this.state = {
      pagedFresh: [],
      pages: 0,
      currentPage: 1,
      ingredient: null,
      viewIngredient: false,
      total: {
        averageDuration: null,
        worstDuration: null,
      },
    };
    this.fresh = [];
    this.filteredFresh = [];
    this.selectPage = this.selectPage.bind(this);
    this.viewIngredient = this.viewIngredient.bind(this);
    this.back = this.back.bind(this);
  }

  componentDidMount() {
    axios.get('/formulas-freshness', {
      headers: { Authorization: "Token " + global.token}
    })
      .then(response => {
        console.log(response.data);
        const data = response.data.formulas;
        this.filteredFresh = data;
        this.fresh = data;
        this.selectPage(1);
        this.setState({
          pages: Math.ceil(data.length / COUNT_PER_PAGE),
          total: response.data.freshnessData,
        });
      })
      .catch(err => {
        console.log(err);
        alert('Error retrieving freshness report data');
      })
    ;
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

  selectPage(idx) {
    const pagedFresh = [];
    for (let i = (idx - 1) * COUNT_PER_PAGE; i < idx * COUNT_PER_PAGE && i < this.filteredFresh.length; i++) {
      pagedFresh.push(this.filteredFresh[i]);
    }
    this.setState({
      pagedFresh,
      currentPage: idx,
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
        <h2>Final Product Freshness Report</h2>
        <h4>All</h4>
        <table className='table'>
          <thead>
            <tr>
              <th>Average Time in Inventory</th>
              <th>Max Time in Inventory</th>
            </tr>
          </thead>
          <tbody>
            <tr>
              <td>{this.state.total.averageDuration || 'N/A'}</td>
              <td>{this.state.total.worstDuration || 'N/A'}</td>
            </tr>
          </tbody>
        </table>
        <h4>Formulas</h4>
        <table className='table'>
          <thead>
            <tr>
              <th>Ingredient</th>
              <th>Average Time in Inventory</th>
              <th>Max Time in Inventory</th>
            </tr>
          </thead>
          <tbody>
            {
              this.state.pagedFresh.map((data, idx) =>
                <FreshnessItem
                  data={data}
                  key={idx}
                  viewIngredient={this.viewIngredient}
                />
              )
            }
          </tbody>
        </table>
        <PageBar
          selectPage={this.selectPage}
          currentPage={this.state.currentPage}
          pages={this.state.pages}
        />
      </div>;

    return this.state.viewIngredient ? viewIngredient : main;
  }
}

export default FinalProductFreshness;
