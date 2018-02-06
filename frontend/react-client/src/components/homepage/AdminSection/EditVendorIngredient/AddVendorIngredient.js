import React, { Component } from 'react';
import axios from 'axios';

import RegistrationHeader from './../../../Registration/RegistrationHeader.js';
import RegistrationInput from './../../../Registration/RegistrationInput.js';
import RegistrationAgreement from './../../../Registration/RegistrationAgreement.js';
import RegistrationSubmitButton from './../../../Registration/RegistrationSubmitButton.js';

import VendorComboBox from './../VendorComboBox.js';

class AddVendorIngredient extends Component {
  constructor(props){
    super(props);
    this.handleInputChange = this.handleInputChange.bind(this);
    this.handleSubmitButtonClick = this.handleSubmitButtonClick.bind(this);
    this.state = {
      originalVendorArray:[],
      vendorNames:[],
      price: '',
      packaging: 'Sack-(50lbs)',
      vendor: '',
      hasUpdated: false,
      errorMessage: null,
    };
  }

  /*** REQUIRED PROPS
    1. token (String)
    2. id (String) - Ingredient ID string
  */

  componentDidMount() {
    const self = this;
    axios.get("/vendors/page/1", {
      headers: { Authorization: "Token " + this.props.token }
    })
    .then(function (response) {
      const vendorNameArray = [];
      for (let elem of response.data){
        vendorNameArray.push(elem.name);
      }
      self.setState({
        vendorNames: vendorNameArray,
        originalVendorArray: response.data,
        vendor: vendorNameArray[0],
      });
    })
    .catch(error => {
      console.log(error);
    });
  }

  handleInputChange(fieldName, event) {
    const newState = this.state;
    this.state[fieldName] = event.target.value;
    this.setState(newState);
  }

  handleSubmitButtonClick() {
    const self = this;
    const correspondingIdToVendorName = this.state.originalVendorArray.find((vendorObj) => {
      return self.state.vendor == vendorObj.name;
    }).id;

    axios.post(`/vendoringredients`, {
      vendoringredients:[{
        'ingredient_id': self.props.id,
        'vendor_id': Number(correspondingIdToVendorName),
        'package_type': self.state.packaging.split("-")[0].toLowerCase(),
        'price': Number(self.state.price),
      }]
    }, {
      headers: { Authorization: "Token " + this.props.token }
    })
    .then(response => {
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
          <RegistrationHeader HeaderText="New Vendor Ingredient" HeaderIcon="fas fa-utensils fa-2x"/>

          <VendorComboBox id="packaging" onChange={this.handleInputChange} Options={["Sack-(50lbs)", 'Pail-(50 lbs)',
          'Drum-(500 lb)',
          'Supersack-(2000 lbs)',
          'Truckload-(50000 lbs)',
          'Railcar-(280000 lbs)',]}/>
          <div className="RegistrationInfoText">* Package Type</div>
          <VendorComboBox id="vendor" Options={this.state.vendorNames} onChange={this.handleInputChange} />
          <div className="RegistrationInfoText">* Provided Vendors </div>
          <RegistrationInput inputClass="RegistrationInput" placeholderText="Price" onChange={this.handleInputChange} id="price" />

          <div className="RegistrationSubmitButton" onClick={this.handleSubmitButtonClick}>ADD VENDOR INGREDIENT</div>
          <div className="RegistrationInfoText">{this.state.hasUpdated ? "Updated" : null}</div>
          <div className="RegistrationInfoText">{this.state.errorMessage != null ? this.state.errorMessage : null}</div>
      </div>
    );
  }
}

export default AddVendorIngredient;
