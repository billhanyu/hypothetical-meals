import React, { Component } from 'react';
import axios from 'axios';

import ComboBox from '../../GeneralComponents/ComboBox';
import Storage2State from '../../Constants/Storage2State';
import packageTypes from '../../Constants/PackageTypes';

class AddEditIngredient extends Component {
  constructor(props) {
    super(props);
    this.handleInputChange = this.handleInputChange.bind(this);
    this.handleSubmitButtonClick = this.handleSubmitButtonClick.bind(this);
    this.deletevendoringredient = this.deletevendoringredient.bind(this);
    this.confirmDelete = this.confirmDelete.bind(this);
    this.addvendor = this.addvendor.bind(this);
    this.handleAddVendor = this.handleAddVendor.bind(this);
    this.editvendor = this.editvendor.bind(this);
    this.cancelEdit = this.cancelEdit.bind(this);
    this.finishEdit = this.finishEdit.bind(this);
    const defaultIngredient = {
      name: '',
      package_type: 'sack',
      native_unit: '',
      removed: {
        data: [0],
      },
      storage_id: 1,
      storage_name: 'freezer',
      id: 0,
    };
    const ingredient = props.ingredient || defaultIngredient;
    this.state = {
      id: ingredient.id,
      name: ingredient.name,
      package_type: ingredient.package_type,
      native_unit: ingredient.native_unit,
      num_native_units: ingredient.num_native_units,
      removed: ingredient.removed.data[0],
      storage_id: ingredient.storage_id,
      storage: Storage2State[ingredient.storage_name],
      vendoringredients: [],
      deleting: -1,
      adding: false,
      mode: props.mode,
      logs: [],
      vendor_code: '', // add
      price: 1, // add
      editing: false,
      editIdx: -1,
    };
  }

  componentDidMount() {
    if (this.state.mode == "edit") {
      this.reloadData();
    }
  }

  reloadData() {
    axios.get(`/vendoringredients/${this.state.id}`, {
      headers: { Authorization: "Token " + global.token }
    })
      .then(response => {
        this.setState({
          vendoringredients: response.data,
        });
      })
      .catch(err => {
        console.error(err);
        alert('Error retrieving vendors for the ingredient');
      });

    if (global.user_group !== "noob") {
      axios.get(`/systemlogs?ingredient_id=${this.state.id}`, {
        headers: { Authorization: "Token " + global.token }
      })
      .then(response => {
        this.setState({
          logs: response.data,
        });
      })
      .catch(err => {
        console.error(err);
        alert('Error retrieving sytem logs related to this ingredient');
      });
    }

    this.setState({
      mode: "edit",
    });
  }

  deletevendoringredient(idx) {
    this.setState({
      deleting: idx,
    });
  }

  confirmDelete() {
    axios.delete('/vendoringredients', {
      data: { ids: [this.state.vendoringredients[this.state.deleting].id] },
      headers: { Authorization: "Token " + global.token }
    })
      .then(response => {
        this.reloadData();
      })
      .catch(err => {
        console.error(err);
        alert('Error deleting this product');
      });
  }

  addvendor(event) {
    this.setState({
      adding: true,
    });
  }

  editvendor(idx) {
    this.setState({
      editing: true,
      editIdx: idx,
      editNumNativeUnits: this.state.vendoringredients[idx].num_native_units,
      editPrice: this.state.vendoringredients[idx].price,
    });
  }

  cancelEdit() {
    this.setState({
      editing: false,
      editIdx: -1,
    });
  }

  finishEdit() {
    const id = this.state.vendoringredients[this.state.editIdx].id;
    const putObj = {};
    putObj[id] = Object.assign({}, this.state.vendoringredients[this.state.editIdx]);
    putObj[id].price = this.state.editPrice;
    axios.put('/vendoringredients', {
      vendoringredients: putObj
    }, {
      headers: {Authorization: "Token " + global.token}
    })
    .then(response => {
      alert('updated!');
      this.setState({
        editing: false,
        editIdx: -1,
      });
      this.reloadData();
    })
    .catch(err => {
      alert(err.response.data);
    });
  }

  handleInputChange(fieldName, event) {
    const newState = Object.assign({}, this.state);
    newState[fieldName] = event.target.value;
    this.setState(newState);
  }

  handleSubmitButtonClick(event) {
    event.preventDefault();

    if (!this.state.name || !this.state.native_unit || !this.state.num_native_units) {
      alert('Please fill out the name, unit, and size');
      return;
    }

    let storage_id;
    if (this.state.storage == "Frozen") {
      storage_id = 1;
    }
    else if (this.state.storage == 'Refrigerated') {
      storage_id = 2;
    }
    else if (this.state.storage == 'Room Temperature') {
      storage_id = 3;
    }
    const ingredient = {
      storage_id,
      name: this.state.name,
      native_unit: this.state.native_unit,
      package_type: this.state.package_type,
      num_native_units: this.state.num_native_units,
    };

    if (this.state.mode == "edit") {
      const newIngredientObject = {};
      newIngredientObject[this.state.id] = ingredient;
      axios.put("/ingredients", {
        ingredients: newIngredientObject,
      }, {
          headers: { Authorization: "Token " + global.token }
        })
        .then(response => {
          alert('updated!');
          this.reloadData();
        })
        .catch(error => {
          const msg = error.response.data;
          if (msg.indexOf('ER_DUP_ENTRY') > -1) {
            alert('Name Exists');
          } else {
            alert(msg);
          }
        });
    } else {
      axios.post("/ingredients", {
        ingredients: [ingredient],
      }, {
          headers: { Authorization: "Token " + global.token }
        })
        .then(response => {
          this.setState({
            id: response.data[0],
          }, () => {
            alert('added!');
            this.reloadData();
          });
        })
        .catch(error => {
          const msg = error.response.data;
          if (msg.indexOf('ER_DUP_ENTRY') > -1) {
            alert('Name Exists');
          } else {
            alert(msg);
          }
        });
    }
  }

  handleAddVendor(event) {
    event.preventDefault();
    axios.get('/vendors/code', {
      params: { code: this.state.vendor_code },
      headers: { Authorization: "Token " + global.token }
      })
      .then(response => {
        const vendor_id = response.data.id;
        return axios.post('/vendoringredients', {
          vendoringredients: [{
            ingredient_id: this.state.id,
            vendor_id,
            price: this.state.price,
          }]
        }, {
            headers: { Authorization: "Token " + global.token }
          });
      })
      .then(response => {
        alert('Added product!');
        this.setState({
          adding: false,
        });
        this.reloadData();
      })
      .catch(err => {
        console.log(err);
        const msg = err.response.data;
        if (msg == "ER_DUP_ENTRY") {
          alert('A product with the same vendor code already exists.');
        } else {
          alert(msg);
        }
      });
  }

  display(description) {
    let arr = description.split(/{|}/);
    for (let i = 1; i < arr.length; i+=2) {
      arr[i] = arr[i].split('=')[0];
    }
    return arr.join('');
  }

  render() {
    const header = "Ingredient: " + this.state.name;
    const columnClass = global.user_group == "admin" ? "OneThirdWidth" : "HalfWidth";
    const readOnly = (global.user_group !== "admin") || (this.state.removed == 1);
    return (
      <div>
        <h2>
          {header}
          {
            this.state.removed == 1 &&
            <span style={{'margin-left':'20px'}} className="badge badge-danger">Deleted</span>
          }
        </h2>
        <button
          type="button"
          className="btn btn-secondary"
          onClick={this.props.backToList}>
          Back to List
        </button>
        <div className="row justify-content-md-center">
          <form className="col-xl-6 col-lg-6 col-sm-8">
            <div className="form-group">
              <label htmlFor="name">Ingredient Name</label>
              <input type="text" className="form-control" id="name" aria-describedby="name" placeholder="Name" onChange={e => this.handleInputChange('name', e)} value={this.state.name} readOnly={readOnly} />
            </div>
            <div className="form-group">
              <label htmlFor="package_type">Package Type</label>
              <ComboBox className="form-control" id="package_type" Options={packageTypes} onChange={this.handleInputChange} selected={this.state.package_type} readOnly={readOnly} />
            </div>
            <div className="form-group">
              <label htmlFor="storage">Temperature State</label>
              <ComboBox className="form-control" id="storage" Options={["Frozen", "Refrigerated", "Room Temperature"]} onChange={this.handleInputChange} selected={this.state.storage} readOnly={readOnly} />
            </div>
            <div className="form-group">
              <label htmlFor="native_unit">Unit</label>
              <input type="text" className="form-control" id="native_unit" aria-describedby="unit" placeholder="Pounds" onChange={e => this.handleInputChange('native_unit', e)} value={this.state.native_unit} readOnly={readOnly}/>
              </div>
            <div className="form-group">
              <label htmlFor="num_native_units">Native Units per Package</label>
              <input type="text" className="form-control" id="num_native_units" aria-describedby="num_native_units" placeholder="1" onChange={e => this.handleInputChange('num_native_units', e)} value={this.state.num_native_units} readOnly={readOnly} />
              </div>
            {
              !readOnly &&
              <button type="submit" className="btn btn-primary" onClick={this.handleSubmitButtonClick}>Submit</button>
            }
          </form>
        </div>

        {this.state.mode == "edit" &&
          <div>
            <h3>Vendors That Produce This Ingredient</h3>
            {!this.state.adding && global.user_group == "admin" &&
              <button
                type="button"
                className="btn btn-primary"
                onClick={this.addvendor}>
                Add Vendor
              </button>}
            {this.state.adding && global.user_group == "admin" &&
              <div className="row justify-content-md-center">
                <form className="col-xl-6 col-lg-6 col-sm-8">
                  <div className="form-group">
                    <label htmlFor="vendor_code">Vendor Code</label>
                    <input type="text" className="form-control" id="vendor_code" aria-describedby="vendor_code" placeholder="code" onChange={e => this.handleInputChange('vendor_code', e)} value={this.state.vendor_code} />
                  </div>
                  <div className="form-group">
                    <label htmlFor="price">Price</label>
                    <input type="number" className="form-control" id="price" aria-describedby="price" placeholder="price" onChange={e => this.handleInputChange('price', e)} value={this.state.price} />
                  </div>
                  <button type="submit" className="btn btn-primary" onClick={this.handleAddVendor}>Submit</button>
                </form>
              </div>
            }

            <table className="table">
              <tr>
                <th className={columnClass}>Vendor</th>
                <th className={columnClass}>Price</th>
                {
                global.user_group == "admin" &&
                <th className={columnClass}>Options</th>
                }
              </tr>
              {
                this.state.vendoringredients.map((vendoringredient, idx) => {
                  return (
                    <tr key={idx}>
                      <td className={columnClass}>{vendoringredient.vendor_name}</td>
                      <td className={columnClass}>
                        {this.state.editIdx !== idx && vendoringredient.price}
                        {this.state.editIdx == idx &&
                          <input type="number" id="price" aria-describedby="price" placeholder="price" onChange={e => this.handleInputChange('editPrice', e)} value={this.state.editPrice} />
                        }
                      </td>
                      <td className={columnClass}>
                        {
                          this.state.editing && global.user_group == "admin" &&
                          <div className="btn-group" role="group" aria-label="Basic example">
                            <button
                              type="button"
                              className="btn btn-secondary"
                              onClick={this.cancelEdit}>
                              Cancel
                      </button>
                            <button
                              type="button"
                              className="btn btn-primary"
                              onClick={this.finishEdit}>
                              Confirm
                      </button>
                          </div>
                        }
                        {
                          !this.state.editing && global.user_group == "admin" &&
                          <div className="btn-group" role="group" aria-label="Basic example">
                            <button
                              type="button"
                              className="btn btn-secondary"
                              onClick={e=>this.editvendor(idx)}>
                              Edit
                            </button>
                            <button
                              type="button"
                              className="btn btn-danger"
                              onClick={e => this.deletevendoringredient(idx)}
                              data-toggle="modal"
                              data-target="#deleteVendorIngredientModal">
                              Delete
                            </button>
                          </div>
                        }
                      </td>
                    </tr>
                  );
                })
              }
            </table>

            {global.user_group !== "noob" &&
              <div>
                <h3>Actions On This Ingredient</h3>
                <table className="table">
                  <thead>
                    <tr className="row" style={{ 'margin': 0 }}>
                      <th className="col-md-3">Time</th>
                      <th className="col-md-3">Username</th>
                      <th className="col-md-6">Description</th>
                    </tr>
                  </thead>
                  <tbody>
                    {
                      this.state.logs.map((log, idx) => {
                        return (
                          <tr className="row" style={{ 'margin': 0 }} key={idx}>
                            <td className="col-md-3">{(new Date(log.created_at)).toString().split(' GMT')[0]}</td>
                            <td className="col-md-3">{log.username}</td>
                            <td className="col-md-6">{this.display(log.description)}</td>
                          </tr>
                        );
                      })
                    }
                  </tbody>
                </table>
              </div>
            }

            <div className="modal fade" id="deleteVendorIngredientModal" tabIndex="-1" role="dialog" aria-labelledby="exampleModalLabel" aria-hidden="true">
              <div className="modal-dialog" role="document">
                <div className="modal-content">
                  <div className="modal-header">
                    <h5 className="modal-title" id="exampleModalLabel">Confirm Delete</h5>
                    <button type="button" className="close" data-dismiss="modal" aria-label="Close">
                      <span aria-hidden="true">&times;</span>
                    </button>
                  </div>
                  <div className="modal-body">
                    Are you sure you want to delete this product?
              </div>
                  <div className="modal-footer">
                    <button type="button" className="btn btn-secondary" data-dismiss="modal">Cancel</button>
                    <button type="button" className="btn btn-danger" data-dismiss="modal" onClick={this.confirmDelete}>Delete</button>
                  </div>
                </div>
              </div>
            </div>
          </div>
        }
      </div>
    );
  }
}

export default AddEditIngredient;
