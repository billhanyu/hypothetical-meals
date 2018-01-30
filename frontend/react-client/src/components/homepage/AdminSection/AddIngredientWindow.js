import React, { Component } from 'react';
import axios from 'axios';

import RegistrationHeader from './../../Registration/RegistrationHeader.js';
import RegistrationInput from './../../Registration/RegistrationInput.js';
import RegistrationAgreement from './../../Registration/RegistrationAgreement.js';
import RegistrationSubmitButton from './../../Registration/RegistrationSubmitButton.js';

import VendorComboBox from './VendorComboBox.js';

class AddIngredientWindow extends Component {
  constructor(props){
    super(props);
    this.handleInputChange = this.handleInputChange.bind(this);
    this.handleSubmitButtonClick = this.handleSubmitButtonClick.bind(this);
    this.state = {
      name: '',
      price: '',
    };
  }

  handleInputChange(fieldName, event) {
    const newState = this.state;
    this.state[fieldName] = event.target.value;
    this.setState(newState);
  }

  handleSubmitButtonClick() {
    axios.get(`asdf`)
    .then(response => this.setState(response.data));
  }

  render() {
    return (
      <div className="EditContainer borderAll">
          <RegistrationHeader HeaderText="New Ingredient" HeaderIcon="fas fa-utensils fa-2x"/>

          <RegistrationInput inputClass="RegistrationInput" placeholderText="Name" onChange={this.handleInputChange} id="name" />
          <VendorComboBox Options={["Sack (50lbs)", 'Pail (50 lbs)',
          'Drum (500 lb)',
          'Supersack (2000 lbs)',
          'Truckload (50000 lbs)',
          'Railcar (280000 lbs)',]}/>
          <div className="RegistrationInfoText">* Package Type</div>
          <VendorComboBox Options={["Frozen","Refrigerated","Room Temperature"]}/>
          <div className="RegistrationInfoText">* Temperature </div>
          <VendorComboBox Options={["Global Mart"]}/>
          <div className="RegistrationInfoText">* Provided Vendors </div>
          <RegistrationInput inputClass="RegistrationInput" placeholderText="Price" onChange={this.handleInputChange} id="price" />

          <div className="RegistrationSubmitButton" onClick={this.handleSubmitButtonClick}>ADD INGREDIENT</div>
      </div>
    );
  }
}

export default AddIngredientWindow;
