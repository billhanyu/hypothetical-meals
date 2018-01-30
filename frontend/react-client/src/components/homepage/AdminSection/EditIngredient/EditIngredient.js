import React, { Component } from 'react';

import RegistrationHeader from './../../../Registration/RegistrationHeader.js';
import RegistrationInput from './../../../Registration/RegistrationInput.js';
import RegistrationAgreement from './../../../Registration/RegistrationAgreement.js';
import RegistrationSubmitButton from './../../../Registration/RegistrationSubmitButton.js';

import VendorComboBox from './../VendorComboBox.js';

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
    //TODO: AJAX REQUEST
  }

  render() {
    return (
      <div className="EditContainer borderAll">
          <RegistrationHeader HeaderText="New Ingredient" HeaderIcon="fas fa-utensils fa-2x"/>

          <RegistrationInput inputClass="RegistrationInput" placeholderText="Name" onChange={this.handleInputChange} id="name" />
          <VendorComboBox Options={["ASDF","ASDF","ASDF"]}/>
          <div className="RegistrationInfoText">* Package Type</div>
          <VendorComboBox Options={["ASDF","ASDF","ASDF"]}/>
          <div className="RegistrationInfoText">* Temperature </div>
          <VendorComboBox Options={["ASDF","ASDF","ASDF"]}/>
          <div className="RegistrationInfoText">* Provided Vendors </div>
          <RegistrationInput inputClass="RegistrationInput" placeholderText="Price" onChange={this.handleInputChange} id="price" />

          <RegistrationSubmitButton handleClick={this.handleSubmitButtonClick} />
          <RegistrationAgreement />
      </div>
    );
  }
}

export default AddIngredientWindow;
