import React, { Component } from 'react';
import axios from 'axios';

import RegistrationHeader from './../../Registration/RegistrationHeader';
import RegistrationInput from './../../Registration/RegistrationInput';
import ComboBox from '../AdminSection/VendorComboBox';
import Storage2State from '../../Constants/Storage2State';
import packageTypes from '../../Constants/PackageTypes';

const STORAGES = ["Frozen", "Refrigerated", "Room Temperature"];

class EditIngredient extends Component {
  constructor(props){
    super(props);
    this.handleInputChange = this.handleInputChange.bind(this);
    this.handleSubmitButtonClick = this.handleSubmitButtonClick.bind(this);
    this.state = {
      name: props.ingredient.name,
      package_type: props.ingredient.package_type,
      native_unit: props.ingredient.native_unit,
      storage_id: props.ingredient.storage_id,
      storage: Storage2State[props.storage_name],
      id: props.ingredient.id,
      hasUpdated: false,
      errorMessage: null,
    };
  }

  /*** REQUIRED PROPS
    1. name (String)
    2. storage_id (String)
    3. id (number)
  */

  handleInputChange(fieldName, event) {
    const newState = Object.assign({}, this.state);
    newState[fieldName] = event.target.value;
    this.setState(newState);
  }

  handleSubmitButtonClick() {
    const self = this;
    let storage_id;
    if(this.state.storage == "Frozen") {
      storage_id = 1;
    }
    else if (this.state.storage == 'Refrigerated') {
      storage_id = 2;
    }
    else if (this.state.storage == 'Room Temperature') {
      storage_id = 3;
    }

    const newIngredientObject = {};
    newIngredientObject[this.state.id] = {
      storage_id,
      name: this.state.name,
      native_unit: this.state.native_unit,
      package_type: this.state.package_type,
    };

    axios.put("/ingredients", {
      ingredients: newIngredientObject,
    }, {
      headers: { Authorization: "Token " + global.token }
    })
    .then(function (response) {
      self.setState({
        errorMessage: null,
        hasUpdated: true,
      });
    })
    .catch(error => {
      self.setState({
        errorMessage: error.response.data
      });
    });
  }

  render() {
    return (
      <div className="EditContainer borderAll">
        <RegistrationHeader HeaderText="Edit Ingredient" HeaderIcon="fas fa-pencil-alt fa-2x"/>

        <RegistrationInput inputClass="RegistrationInput" placeholderText="Name" onChange={this.handleInputChange} id="name" value={this.state.name}/>
        <div className="RegistrationInfoText">* Name</div>

        <ComboBox id="package_type" Options={packageTypes} onChange={this.handleInputChange} selected={this.state.package_type} />
        <div className="RegistrationInfoText">* Package Type</div>

        <ComboBox id="storage" Options={["Frozen", "Refrigerated", "Room Temperature"]} onChange={this.handleInputChange} selected={STORAGES[this.state.storage_id-1]} />
        <div className="RegistrationInfoText">* Temperature State</div>

        <RegistrationInput inputClass="RegistrationInput" placeholderText="Pounds" onChange={this.handleInputChange} id="native_unit" value={this.state.native_unit} />
        <div className="RegistrationInfoText">* Unit</div>

        <div className="RegistrationSubmitButton" onClick={this.handleSubmitButtonClick}>EDIT INGREDIENT</div>
        <div className="RegistrationInfoText">{this.state.hasUpdated ? "Updated" : null}</div>
        <div className="RegistrationInfoText">{this.state.errorMessage != null ? this.state.errorMessage : null}</div>
      </div>
    );
  }
}

export default EditIngredient;
