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
    if (props.mode == "edit") {
      this.state = {
        name: props.ingredient.name,
        package_type: props.ingredient.package_type,
        native_unit: props.ingredient.native_unit,
        storage_id: props.ingredient.storage_id,
        storage: Storage2State[props.ingredient.storage_name],
        id: props.ingredient.id,
        vendoringredients: [],
        deleting: -1,
        adding: false,
        mode: "edit",
        vendor_code: '', // add
        vendor_quantity: 1, // add
        price: 1, // add
        editing: false,
        editIdx: -1,
      };
    } else {
      this.state = {
        name: '',
        package_type: 'sack',
        native_unit: '',
        storage_id: 1,
        storage: 'Frozen',
        vendoringredients: [],
        adding: false,
        mode: "add",
      };
    }
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
    putObj[id].num_native_units = this.state.editNumNativeUnits;
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
      alert('some error occurred');
    });
  }

  handleInputChange(fieldName, event) {
    const newState = Object.assign({}, this.state);
    newState[fieldName] = event.target.value;
    this.setState(newState);
  }

  handleSubmitButtonClick(event) {
    event.preventDefault();

    if (!this.state.name || !this.state.native_unit) {
      alert('Please fill out the name and native unit');
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
          alert('added!');
          this.props.backToList();
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
            num_native_units: this.state.vendor_quantity,
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
        alert(err.response.data);
      });
  }

  render() {
    const header = this.state.mode == "edit" ? "Edit Ingredient" : "Add Ingredient";
    return (
      <div>
        <h2>{header}</h2>
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
              <input type="text" className="form-control" id="name" aria-describedby="name" placeholder="Name" onChange={e => this.handleInputChange('name', e)} value={this.state.name} required />
            </div>
            <div className="form-group">
              <label htmlFor="package_type">Package Type</label>
              <ComboBox className="form-control" id="package_type" Options={packageTypes} onChange={this.handleInputChange} selected={this.state.package_type} />
            </div>
            <div className="form-group">
              <label htmlFor="storage">Temperature State</label>
              <ComboBox className="form-control" id="storage" Options={["Frozen", "Refrigerated", "Room Temperature"]} onChange={this.handleInputChange} selected={this.state.storage} />
            </div>
            <div className="form-group">
              <label htmlFor="native_unit">Unit</label>
              <input type="text" className="form-control" id="native_unit" aria-describedby="unit" placeholder="Pounds" onChange={e => this.handleInputChange('native_unit', e)} value={this.state.native_unit} required />
            </div>
            <button type="submit" className="btn btn-primary" onClick={this.handleSubmitButtonClick}>Submit</button>
          </form>
        </div>

        {this.state.mode == "edit" &&
          <div>
            <h3>Vendors That Produce This Ingredient</h3>
            {!this.state.adding &&
              <button
                type="button"
                className="btn btn-primary"
                onClick={this.addvendor}>
                Add Vendor
        </button>}
            {this.state.adding &&
              <div className="row justify-content-md-center">
                <form className="col-xl-6 col-lg-6 col-sm-8">
                  <div className="form-group">
                    <label htmlFor="vendor_code">Vendor Code</label>
                    <input type="text" className="form-control" id="vendor_code" aria-describedby="vendor_code" placeholder="code" onChange={e => this.handleInputChange('vendor_code', e)} value={this.state.vendor_code} />
                  </div>
                  <div className="form-group">
                    <label htmlFor="vendor_quantity">Quantity of native units in product</label>
                    <input type="number" className="form-control" id="vendor_quantity" aria-describedby="vendor_quantity" placeholder="quantity" onChange={e => this.handleInputChange('vendor_quantity', e)} value={this.state.vendor_quantity} />
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
                <th>Vendor</th>
                <th>Quantity in Package</th>
                <th>Price</th>
                <th>Options</th>
              </tr>
              {
                this.state.vendoringredients.map((vendoringredient, idx) => {
                  return (
                    <tr key={idx}>
                      <td>{vendoringredient.vendor_name}</td>
                      <td>
                        {this.state.editIdx !== idx && vendoringredient.num_native_units + " " + this.props.ingredient.native_unit}
                        {this.state.editIdx == idx &&
                          <input type="number" className="form-control" id="vendor_quantity" aria-describedby="vendor_quantity" placeholder="quantity" onChange={e => this.handleInputChange('editNumNativeUnits', e)} value={this.state.editNumNativeUnits} />
                        }
                      </td>
                      <td>
                        {this.state.editIdx !== idx && vendoringredient.price}
                        {this.state.editIdx == idx &&
                          <input type="number" id="price" aria-describedby="price" placeholder="price" onChange={e => this.handleInputChange('editPrice', e)} value={this.state.editPrice} />
                        }
                      </td>
                      <td>
                        {
                          this.state.editing &&
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
                          !this.state.editing &&
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
