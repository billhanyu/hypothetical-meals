import React, { Component } from 'react';
import axios from 'axios';
import InventoryItem from './InventoryItem';
import FilterBar from './FilterBar';
import PageBar from '../../GeneralComponents/PageBar';
import TempStates from '../../Constants/TempStates';
import { COUNT_PER_PAGE } from '../../Constants/Pagination';
import AddEditIngredient from '../ingredient/AddEditIngredient';

class ViewInventory extends Component {
  constructor(props) {
    super(props);
    this.state = {
      pagedEntries: [],
      pages: 0,
      currentPage: 1,
      viewingIdx: -1,
    };
    this.entries = [];
    this.filteredEntries = [];
    this.filterIngredient = this.filterIngredient.bind(this);
    this.filterTemp = this.filterTemp.bind(this);
    this.filterPackage = this.filterPackage.bind(this);
    this.selectPage = this.selectPage.bind(this);
    this.reloadData = this.reloadData.bind(this);
    this.viewIngredient = this.viewIngredient.bind(this);
    this.backToList = this.backToList.bind(this);
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

  viewIngredient(idx) {
    this.setState({
      viewingIdx: idx,
    });
  }

  backToList() {
    this.setState({
      viewingIdx: -1,
    });
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
    const columnClass = global.user_group == "admin" ? "OneSixthWidth" : "OneFifthWidth";
    
    const ingredient = this.state.viewingIdx > -1 ? this.state.pagedEntries[this.state.viewingIdx] : null;

    const view =
      <AddEditIngredient
        mode="edit"
        ingredient={ingredient ? {
          id: ingredient.ingredient_id,
          name: ingredient.ingredient_name,
          native_unit: ingredient.ingredient_native_unit,
          num_native_units: ingredient.ingredient_num_native_units,
          package_type: ingredient.ingredient_package_type,
          removed: {
            data: [false],
          },
          intermediate: ingredient.ingredient_intermediate,
          storage_id: ingredient.ingredient_storage_id,
          storage_name: ingredient.ingredient_storage_name
        } : null}
        backToList={this.backToList}
      />;
    const main = 
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
              <th className={columnClass}>Storage Space Taken</th>
            </tr>
          </thead>
          {this.state.pagedEntries.map((item, key) =>
            <InventoryItem
              key={key}
              item={item}
              idx={key}
              storages={this.state.storages}
              reloadData={this.reloadData}
              viewIngredient={this.viewIngredient}
            />
          )}
        </table>
        <PageBar
          pages={this.state.pages}
          selectPage={this.selectPage}
          currentPage={this.state.currentPage}
        />
      </div>;

    if (this.state.viewingIdx > -1) {
      return view;
    } else {
      return main;
    }
  }
}

export default ViewInventory;
