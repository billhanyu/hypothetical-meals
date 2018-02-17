import React, { Component } from 'react';
import axios from 'axios';
import InventoryItem from './InventoryItem';
import FilterBar from './FilterBar';
import PageBar from '../../GeneralComponents/PageBar';
import storage2State from '../../Constants/Storage2State';

class ViewInventory extends Component {
  constructor(props) {
    super(props);
    this.state = {
      allInventories: [],
      inventories: [],
      storages: [],
      editQuantity: 0,
      editIdx: -1,
      pages: 0,
    };
    this.filterIngredient = this.filterIngredient.bind(this);
    this.filterTemp = this.filterTemp.bind(this);
    this.filterPackage = this.filterPackage.bind(this);
    this.selectInventoryItem = this.selectInventoryItem.bind(this);
    this.selectPage = this.selectPage.bind(this);
    this.edit = this.edit.bind(this);
    this.cancelEdit = this.cancelEdit.bind(this);
    this.changeQuantity = this.changeQuantity.bind(this);
    this.finishEdit = this.finishEdit.bind(this);
  }

  componentDidMount() {
    this.reloadData();
  }

  reloadData() {
    axios.get('/inventory/pages', {
        headers: { Authorization: "Token " + global.token }
    })
    .then(response => {
      this.setState({
        pages: response.data.numPages
      });
      this.selectPage(1);
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
      filtered = filtered.filter(item => item.ingredient_package_type == this.packageSearch);
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

  edit(idx) {
    this.setState({
      editIdx: idx,
      editQuantity: this.state.inventories[idx].num_packages,
    });
  }

  changeQuantity(event) {
    this.setState({
      editQuantity: event.target.value,
    });
  }

  cancelEdit() {
    this.setState({
      editIdx: -1,
    });
  }

  finishEdit() {
    const putObj = {};
    const id = this.state.inventories[this.state.editIdx].id;
    putObj[id] = this.state.editQuantity;
    axios.put('/inventory/admin', {
      changes: putObj
    }, {
      headers: { Authorization: "Token " + global.token }
    })
      .then(response => {
        this.setState({
          editIdx: -1,
        });
      })
      .catch(err => {
        const message = err.response.data;
        alert(message);
      });
  }

  selectPage(idx) {
    const self = this;
    let allInventories;
    axios.get(`/inventory/page/${idx}`, {
      headers: { Authorization: "Token " + global.token }
    })
      .then(response => {
        allInventories = response.data;
        self.setState({
          allInventories,
          inventories: response.data,
        });
        return axios.get('/storages', {
          headers: { Authorization: "Token " + global.token }
        });
      })
      .then(response => {
        const storages = response.data;
        const newInventories = allInventories.map(a => Object.assign({}, a));
        for (let item of newInventories) {
          for (let storage of storages) {
            if (item.ingredient_storage_id == storage.id) {
              item.ingredient_storage_name = storage.name;
              item.ingredient_temperature_state = storage2State[storage.name];
            }
          }
        }
        self.setState({
          allInventories: newInventories,
          inventories: newInventories,
          storages,
        });
      })
      .catch(err => {
        console.error(err);
      });
  }

  render() {
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
              <th>Ingredient Name</th>
              <th>Temperature State</th>
              <th>Package Type</th>
              <th>Number of Packages</th>
              {
                global.user_group == "admin" &&
                <th>Options</th>
              }
            </tr>
          </thead>
          <tbody>
            {this.state.inventories.map((item, key) =>
              <InventoryItem
                mode={this.props.mode}
                idx={key}
                edit={this.edit}
                editQuantity={this.state.editQuantity}
                changeQuantity={this.changeQuantity}
                cancelEdit={this.cancelEdit}
                finishEdit={this.finishEdit}
                editIdx={this.state.editIdx}
                selectInventoryItem={this.selectInventoryItem}
                key={key}
                item={item}
                storages={this.state.storages}
              />
            )}
          </tbody>
        </table>
        <PageBar
          pages={this.state.pages}
          selectPage={this.selectPage}
        />
      </div>
    );
  }
}

export default ViewInventory;
