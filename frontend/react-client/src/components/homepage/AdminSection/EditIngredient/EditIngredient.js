import React, { Component } from 'react';
import axios from 'axios';

import RegistrationHeader from './../../../Registration/RegistrationHeader.js';
import RegistrationInput from './../../../Registration/RegistrationInput.js';
import RegistrationAgreement from './../../../Registration/RegistrationAgreement.js';
import RegistrationSubmitButton from './../../../Registration/RegistrationSubmitButton.js';
import VendorComboBox from './../VendorComboBox.js';

class EditVendor extends Component {
  constructor(props){
    super(props);
    this.handleInputChange = this.handleInputChange.bind(this);
    this.handleSubmitButtonClick = this.handleSubmitButtonClick.bind(this);
    this.state = {
      name: props.name,
      storage_id: props.storage_id,
      id: props.id,
      hasUpdated: false,
      errorMessage: null,
      storage: "Frozen",
    };
  }

  /*** REQUIRED PROPS
    1. name (String)
    2. storage_id (String)
    3. id (number)
    3. token (String)
  */

  handleInputChange(fieldName, event) {
    const newState = this.state;
    this.state[fieldName] = event.target.value;
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

    const newVendorObject = {};
    newVendorObject[this.state.id] = storage_id;

    axios.put("/ingredients", {
      ingredients: newVendorObject,
    }, {
      headers: { Authorization: "Token " + this.props.token }
    })
    .then(function (response) {
      console.log(response);
      self.setState({
        hasUpdated: true,
      });
    })
    .catch(error => {
      self.setState({
        errorMessage: error.data
      });
      console.log(error.response);
    });
  }

  render() {
    return (
      <div className="EditContainer borderAll">
          <RegistrationHeader HeaderText="Edit Ingredient" HeaderIcon="fas fa-pencil-alt fa-2x"/>

          <RegistrationInput inputClass="RegistrationInput" placeholderText="Name" onChange={this.handleInputChange} id="name" value={this.state.name}/>
          <div className="RegistrationInfoText">* Ingredient Name</div>
          <VendorComboBox id="storage" Options={["Frozen","Refrigerated","Room Temperature"]} onChange={this.handleInputChange}/>
          <div className="RegistrationInfoText">* Temperature </div>

          <div className="RegistrationSubmitButton" onClick={this.handleSubmitButtonClick}>EDIT VENDOR</div>
          <div className="RegistrationInfoText">{this.state.hasUpdated ? "Updated" : null}</div>
          <div className="RegistrationInfoText">{this.state.errorMessage != null ? this.state.errorMessage : null}</div>
      </div>
    );
  }
}

export default EditVendor;
