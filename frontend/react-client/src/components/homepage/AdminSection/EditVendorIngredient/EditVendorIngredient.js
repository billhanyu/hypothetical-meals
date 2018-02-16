import React, { Component } from 'react';
import axios from 'axios';

import RegistrationHeader from './../../../Registration/RegistrationHeader.js';
import RegistrationInput from './../../../Registration/RegistrationInput.js';
import ComboBox from './../VendorComboBox.js';

class EditVendor extends Component {
  constructor(props){
    super(props);
    this.handleInputChange = this.handleInputChange.bind(this);
    this.handleSubmitButtonClick = this.handleSubmitButtonClick.bind(this);
    this.state = {
      Price: props.ingredient_price,
      vendor_ingredient_id: props.vendor_ingredient_id,
      hasUpdated: false,
      packaging: 'Sack-(50lbs)',
      errorMessage: null,
    };
  }

  /*** REQUIRED PROPS
    1. name (String)
    2. ingredient_price (Number)
    3. storage_id (String)
    4. vendor_ingredient_id (number)
    5. token (String)
  */

  handleInputChange(fieldName, event) {
    const newState = Object.assign({}, this.state);
    newState[fieldName] = event.target.value;
    this.setState(newState);
  }

  handleSubmitButtonClick() {
    const self = this;

    const newVendorObject = {};
    newVendorObject[this.props.vendor_ingredient_id] = {
      'package_type': this.state.packaging.split('-')[0].toLowerCase(),
      'price': Number(this.state.Price),
    };

    axios.put("/vendoringredients", {
      vendoringredients: newVendorObject,
    }, {
      headers: { Authorization: "Token " + global.token }
    })
    .then(function (response) {
      self.setState({
        hasUpdated: true,
        errorMessage: null,
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
          <RegistrationHeader HeaderText="Edit Vendor Ingredient" HeaderIcon="fas fa-pencil-alt fa-2x"/>

          <RegistrationInput inputClass="RegistrationInput" placeholderText="Price" onChange={this.handleInputChange} id="Price" value={this.state.Price}/>
          <div className="RegistrationInfoText">* Ingredient Price</div>
          <ComboBox id="packaging" onChange={this.handleInputChange} Options={["Sack-(50lbs)", 'Pail-(50 lbs)',
          'Drum-(500 lb)',
          'Supersack-(2000 lbs)',
          'Truckload-(50000 lbs)',
          'Railcar-(280000 lbs)',]}/>
          <div className="RegistrationInfoText">* Packaging Size </div>

          <div className="RegistrationSubmitButton" onClick={this.handleSubmitButtonClick}>EDIT VENDOR INGREDIENT</div>
          <div className="RegistrationInfoText">{this.state.hasUpdated ? "Updated" : null}</div>
          <div className="RegistrationInfoText">{this.state.errorMessage != null ? this.state.errorMessage : null}</div>
      </div>
    );
  }
}

export default EditVendor;
