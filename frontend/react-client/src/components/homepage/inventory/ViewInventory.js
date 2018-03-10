import React, { Component } from 'react';
import axios from 'axios';
import InventoryItem from './InventoryItem';
import FilterBar from './FilterBar';
import PageBar from '../../GeneralComponents/PageBar';
import TempStates from '../../Constants/TempStates';
import { COUNT_PER_PAGE } from '../../Constants/Pagination';

class ViewInventory extends Component {
  constructor(props) {
    super(props);
    this.state = {
      pagedEntries: [],
      pages: 0,
      currentPage: 1,
    };
    this.entries = [];
    this.filteredEntries = [];
    this.filterIngredient = this.filterIngredient.bind(this);
    this.filterTemp = this.filterTemp.bind(this);
    this.filterPackage = this.filterPackage.bind(this);
    this.selectPage = this.selectPage.bind(this);
    this.reloadData = this.reloadData.bind(this);
  }

  componentDidMount() {
    this.reloadData();
  }

  reloadData() {
    axios.get('/inventory', {
        headers: { Authorization: "Token " + global.token }
    })
    .then(response => {
      const entries = response.data;
      const grouped = [];
      entries.forEach(entry => {
        entry.ingredient_temperature_state = TempStates[entry.ingredient_storage_id];
        const existing = grouped.filter(item => item.ingredient_id == entry.ingredient_id);
        if (existing.length) {
          existing[0].num_packages += entry.num_packages;
        } else {
          grouped.push(entry);
        }
      });
      this.filteredEntries = grouped;
      this.entries = grouped;
      this.setState({
        pages: Math.ceil(grouped.length / COUNT_PER_PAGE),
      });
      this.selectPage(this.state.currentPage);
    })
    .catch(error => {
      alert('Data loading error');
    });
  }

  filterIngredient(e) {
    this.ingredientSearch = e.target.value;
    this.filterInventories();
  }

  filterTemp(e) {
    this.tempSearch = e.target.value;
    this.filterInventories();
  }

  filterPackage(e) {
    this.packageSearch = e.target.value;
    this.filterInventories();
  }

  filterInventories() {
    let filtered = this.entries.slice();
    if (this.ingredientSearch) {
      filtered = filtered.filter(item => {
        return item.ingredient_name.indexOf(this.ingredientSearch) > -1;
      });
    }
    if (this.tempSearch && this.tempSearch !== 'All') {
      filtered = filtered.filter(item => {
        return item.ingredient_temperature_state == this.tempSearch;
      });
    }
    if (this.packageSearch && this.packageSearch !== 'All') {
      filtered = filtered.filter(item => item.ingredient_package_type == this.packageSearch);
    }
    this.filteredEntries = filtered;
    const newPageNum = Math.ceil(this.filteredEntries.length / COUNT_PER_PAGE);
    this.setState({
      pages: newPageNum,
    });
    this.selectPage(1);
  }

  selectPage(idx) {
    const pagedEntries = [];
    for (let i = (idx - 1) * COUNT_PER_PAGE; i < idx * COUNT_PER_PAGE && i < this.filteredEntries.length; i++) {
      pagedEntries.push(this.filteredEntries[i]);
    }
    this.setState({
      pagedEntries,
      currentPage: idx,
    });
  }

  render() {
    console.log(this.state.pagedEntries);
    const columnClass = "OneFourthWidth";
    return (
      <div>
        <h2>Inventory</h2>
        <FilterBar
          filterIngredient={this.filterIngredient}
          filterTemp={this.filterTemp}
          filterPackage={this.filterPackage}
        />
        <table className="table">
          <thead>
            <tr>
              <th className={columnClass}>Ingredient Name</th>
              <th className={columnClass}>Temperature State</th>
              <th className={columnClass}>Package Type</th>
              <th className={columnClass}>Quantity</th>
            </tr>
          </thead>
          {this.state.pagedEntries.map((item, key) =>
            <InventoryItem
              key={key}
              item={item}
              idx={key}
              storages={this.state.storages}
              reloadData={this.reloadData}
            />
          )}
        </table>
        <PageBar
          pages={this.state.pages}
          selectPage={this.selectPage}
          currentPage={this.state.currentPage}
        />
      </div>
    );
  }
}

export default ViewInventory;
