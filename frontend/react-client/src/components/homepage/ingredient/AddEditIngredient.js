import React, { Component } from 'react';
import axios from 'axios';
import PropTypes from 'prop-types';

import ComboBox from '../../GeneralComponents/ComboBox';
import Storage2State from '../../Constants/Storage2State';
import packageTypes from '../../Constants/PackageTypes';
import DeleteIngredientButton from './DeleteIngredientButton';
import VendorIngredientList from './VendorIngredientList';
import SystemLogList from './SystemLogList';
import QuantityByLotTable from './onclickdetails/QuantityByLotTable';
import Snackbar from 'material-ui/Snackbar';

class AddEditIngredient extends Component {
  constructor(props) {
    super(props);
    this.handleInputChange = this.handleInputChange.bind(this);
    this.handleSubmitButtonClick = this.handleSubmitButtonClick.bind(this);
    const defaultIngredient = {
      name: '',
      package_type: 'sack',
      native_unit: '',
      removed: 0,
      intermediate: 0,
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
      removed: ingredient.removed,
      intermediate: ingredient.intermediate,
      storage_id: ingredient.storage_id,
      storage: Storage2State[ingredient.storage_name],
      mode: props.mode,
      logs: [],
      open: false,
      message: '',
    };
  }

  handleInputChange(fieldName, event) {
    const newState = Object.assign({}, this.state);
    newState[fieldName] = event.target.value;
    this.setState(newState);
  }

  handleSubmitButtonClick(event) {
    event.preventDefault();

    if (!this.state.name || !this.state.native_unit || !this.state.num_native_units) {
      this.setState({
        open: true,
        message: 'Please fill out the name, unit, and size',
      });
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
          global.AddEditIngredientNeedsRerender = true;
          this.setState({
            open: true,
            message: 'Updated',
          });
          if (this.props.reloadData) {
            this.props.reloadData();
          }
        })
        .catch(error => {
          const msg = error.response.data;
          if (msg.indexOf('ER_DUP_ENTRY') > -1) {
            this.setState({
              open: true,
              message: "Name already exists",
            });
          } else {
            this.setState({
              open: true,
              message: msg,
            });
          }
        });
    } else {
      axios.post("/ingredients", {
        ingredients: [ingredient],
      }, {
          headers: { Authorization: "Token " + global.token }
        })
        .then(response => {
          global.AddEditIngredientNeedsRerender = true;
          this.setState({
            id: response.data[0],
          }, () => {
            this.setState({
              open: true,
              message: "Added",
              mode: "edit",
            });
            if (this.props.reloadData) {
              this.props.reloadData();
            }
          });
        })
        .catch(error => {
          const msg = error.response.data;
          if (msg.indexOf('ER_DUP_ENTRY') > -1) {
            this.setState({
              open: true,
              message: "Name Exists",
            });
          } else {
            this.setState({
              open: true,
              message: msg,
            });
          }
        });
    }
  }

  handleRequestClose() {
    this.setState({
      open: false,
    });
  }

  render() {
    const header = "Ingredient: " + this.state.name;
    const readOnly = (global.user_group !== "admin") || (this.state.removed == 1);
    return (
      <div>
        <Snackbar
          open={this.state.open}
          message={this.state.message}
          autoHideDuration={2500}
          onRequestClose={this.handleRequestClose.bind(this)}
          style={{ color: '#FFF' }}
        />
        <h2>
          {header}
          {
            this.state.intermediate == 1 &&
            <span style={{ 'margin-left': '20px' }} className="badge badge-secondary">Intermediate</span>
          }
          {
            this.state.removed == 1 &&
            <span style={{'margin-left':'20px'}} className="badge badge-danger">Deleted</span>
          }
        </h2>
        {
          global.user_group == "admin" && this.state.mode == "edit"
          ?
          <DeleteIngredientButton
            id={this.state.id}
            backToList={this.props.backToList}
            reloadData={this.props.reloadData}
          />
          :
          <button
            type="button"
            className="btn btn-secondary"
            onClick={this.props.backToList}>
            Back to List
          </button>
        }
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
            {!this.state.intermediate &&
            <VendorIngredientList
              ingredientId={this.state.id}
            />
            }
            <QuantityByLotTable
              withTitle={true}
              ingredient={{id: this.state.id, native_unit: this.state.native_unit}}
            />
            {global.user_group !== "noob" &&
              <SystemLogList
                ingredientId={this.state.id}
              />
            }
          </div>
        }
      </div>
    );
  }
}

AddEditIngredient.propTypes = {
  ingredient: PropTypes.object,
  mode: PropTypes.string,
  backToList: PropTypes.func,
};

export default AddEditIngredient;
