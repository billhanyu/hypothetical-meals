import React, { Component } from 'react';
import { COUNT_PER_PAGE } from '../../Constants/Pagination';
import PageBar from '../../GeneralComponents/PageBar';
import axios from 'axios';

class Freshness extends Component {
  constructor(props) {
    super(props);
    this.state = {
      pagedFresh: [],
      pages: 0,
      currentPage: 1,
    };
    this.fresh = [];
    this.filteredFresh = [];
    this.selectPage = this.selectPage.bind(this);
  }

  componentDidMount() {
    axios.get('/ingredients/freshness');
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
    return (
      <div>
        <h3>Freshness Report</h3>
        <table className='table'>
          <thead>
            <tr>
              <th>Ingredient</th>
              <th>Average Time in Inventory</th>
              <th>Max Time in Inventory</th>
            </tr>
          </thead>
          <tbody>

          </tbody>
        </table>
        <PageBar
          selectPage={this.selectPage}
          currentPage={this.state.currentPage}
          pages={this.state.pages}
        />
      </div>
    );
  }
}

export default Freshness;
