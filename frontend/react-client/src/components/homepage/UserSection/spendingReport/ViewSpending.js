import React, { Component } from 'react';
import axios from 'axios';
import InventoryItem from './InventoryItem';
import FilterBar from './FilterBar';
import storage2State from '../../../Constants/Storage2State';

class ViewInventory extends Component {
  constructor(props) {
    super(props);
    this.state = {
      allSpendingLogs: [],
      spendingLogs: [],
      storages: [],
    };
    this.filterIngredient = this.filterIngredient.bind(this);
    this.filterTemp = this.filterTemp.bind(this);
    this.filterPackage = this.filterPackage.bind(this);
    this.selectInventoryItem = this.selectInventoryItem.bind(this);
  }

  componentDidMount() {
    this.reloadData();
  }

  reloadData() {
    const self = this;
    let allSpendingLogs;
    axios.get("/spendinglogs", {
      headers: { Authorization: "Token " + this.props.token }
    })
      .then(response => {
        allSpendingLogs = response.data;
        self.setState({
          allSpendingLogs,
          spendingLogs: response.data,
        });
        return axios.get('/ingredients', {
          headers: { Authorization: "Token " + this.props.token }
        });
      })
      .then(response => {
        const ingredients = response.data;
        const mySpendingLogs = allSpendingLogs.map(a => Object.assign({}, a));
        for (let log of mySpendingLogs) {
          for (let ingredient of ingredients) {
            if (log.ingredient_id == ingredient.id) {
              log.name = ingredient.name;
            }
          }
        }
        self.setState({
          allSpendingLogs: mySpendingLogs,
          spendingLogs: mySpendingLogs
        });
      })
      .catch(error => {
        console.error(error);
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
    let filtered = this.state.allInventories.slice();
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
      filtered = filtered.filter(item => item.package_type == this.packageSearch);
    }
    this.setState({
      inventories: filtered,
    });
  }

  selectInventoryItem(item) {
    if (this.props.onClickInventoryItem) {
      this.props.onClickInventoryItem(item);
    }
  }

  render() {
    return (
      <div>
        <FilterBar
          filterIngredient={this.filterIngredient}
          filterTemp={this.filterTemp}
          filterPackage={this.filterPackage}
        />
        <div className="InventoryHead">
          <span className="InventoryColumn">Ingredient Name</span>
          <span className="InventoryColumn">Temperature State</span>
          <span className="InventoryColumn">Package Type</span>
          <span className="InventoryColumn">Number of Packages</span>
        </div>
        {this.state.inventories.map((item, key) =>
          <InventoryItem
            mode={this.props.mode}
            selectInventoryItem={this.selectInventoryItem}
            key={key}
            item={item}
            storages={this.state.storages}
            token={this.props.token}
          />
        )}
      </div>
    );
  }
}

export default ViewInventory;
