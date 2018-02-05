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
      size: 0,
      storage: 'Frozen',
      errorMessage: null,
    };
  }

  /*** REQUIRED PROPS
    1. Token (String)
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

    const paramObject = {};
    paramObject[storage_id] = this.state.size;

    axios.put("/storages", paramObject, {
      headers: { Authorization: "Token " + this.props.token }
    })
    .then(function (response) {
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
          <RegistrationHeader HeaderText="Storage Size" HeaderIcon="fas fa-pencil-alt fa-2x"/>

          <RegistrationInput inputClass="RegistrationInput" placeholderText="Size" onChange={this.handleInputChange} id="size" value={this.state.size}/>
          <div className="RegistrationInfoText">* Max Capacity</div>
          <VendorComboBox id="storage" Options={["Frozen","Refrigerated","Room Temperature"]} onChange={this.handleInputChange}/>
          <div className="RegistrationInfoText">* Storage Type </div>

          <div className="RegistrationSubmitButton" onClick={this.handleSubmitButtonClick}>EDIT STORAGE SIZE</div>
          <div className="RegistrationInfoText">{this.state.hasUpdated ? "Updated" : null}</div>
          <div className="RegistrationInfoText">{this.state.errorMessage != null ? this.state.errorMessage : null}</div>
      </div>
    );
  }
}

export default EditVendor;
