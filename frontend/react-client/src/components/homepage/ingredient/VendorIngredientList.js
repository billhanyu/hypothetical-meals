import React, { Component } from 'react';
import PropTypes from 'prop-types';
import axios from 'axios';
import VendorSelector from './VendorSelector';

class VendorIngredientList extends Component {
  constructor(props) {
    super(props);
    this.state = {
      adding: false,
      vendor_id: '', // add
      price: 1, // add
      editing: false,
      editIdx: -1,
      deleting: -1,
      vendoringredients: [],
    };
    this.deletevendoringredient = this.deletevendoringredient.bind(this);
    this.confirmDelete = this.confirmDelete.bind(this);
    this.addvendor = this.addvendor.bind(this);
    this.handleAddVendor = this.handleAddVendor.bind(this);
    this.editvendor = this.editvendor.bind(this);
    this.cancelEdit = this.cancelEdit.bind(this);
    this.finishEdit = this.finishEdit.bind(this);
    this.handleInputChange = this.handleInputChange.bind(this);
    this.cancelAdd = this.cancelAdd.bind(this);
    this.changeVendorId = this.changeVendorId.bind(this);
  }

  componentDidMount() {
    this.reloadData();
  }

  reloadData() {
    axios.get(`/vendoringredients/${this.props.ingredientId}`, {
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

  handleInputChange(fieldName, event) {
    const newState = Object.assign({}, this.state);
    newState[fieldName] = event.target.value;
    this.setState(newState);
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
        alert('Deleted!');
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

  cancelAdd(event) {
    this.setState({
      adding: false,
    });
  }

  changeVendorId(vendorId) {
    this.setState({
      vendor_id: vendorId,
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
        headers: { Authorization: "Token " + global.token }
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

  handleAddVendor(event) {
    event.preventDefault();
    axios.post('/vendoringredients', {
      vendoringredients: [{
        ingredient_id: this.props.ingredientId,
        vendor_id: this.state.vendor_id,
        price: this.state.price,
      }]
    }, {
        headers: { Authorization: "Token " + global.token }
      })
      .then(response => {
        alert('Added product!');
        this.setState({
          adding: false,
        });
        this.reloadData();
      })
      .catch(err => {
        const msg = err.response.data;
        if (msg == "ER_DUP_ENTRY") {
          alert('A product with the same vendor already exists.');
        } else {
          alert(msg);
        }
      });
  }

  render() {
    const columnClass = global.user_group == "admin" ? "OneThirdWidth" : "HalfWidth";
    return (
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
                <label htmlFor="vendor">Vendor</label>
                <VendorSelector changeVendorId={this.changeVendorId} />
              </div>
              <div className="form-group">
                <label htmlFor="price">Price</label>
                <input type="number" className="form-control" id="price" aria-describedby="price" placeholder="price" onChange={e => this.handleInputChange('price', e)} value={this.state.price} />
              </div>
              <div className="btn-group" role="group" aria-label="Basic example">
                <button type="button" className="btn btn-secondary" onClick={this.cancelAdd}>Cancel</button>
                <button type="submit" className="btn btn-primary" onClick={this.handleAddVendor}>Submit</button>
              </div>
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
                      this.state.editIdx == idx && global.user_group == "admin" &&
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
                      this.state.editIdx !== idx && global.user_group == "admin" &&
                      <div className="btn-group" role="group" aria-label="Basic example">
                        <button
                          type="button"
                          className="btn btn-secondary"
                          onClick={e => this.editvendor(idx)}>
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
    );
  }
}

VendorIngredientList.propTypes = {
  ingredientId: PropTypes.number,
};

export default VendorIngredientList;
