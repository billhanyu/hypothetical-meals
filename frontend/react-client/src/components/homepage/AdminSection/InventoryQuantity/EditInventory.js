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
      num_packages: props.num_packages,
      id: props.id,
      hasUpdated: false,
      errorMessage: null,
    };
  }

  /*** REQUIRED PROPS
    1. num_packages (Number)
    2. id (number)
    3. token (String)
  */

  handleInputChange(fieldName, event) {
    const newState = this.state;
    this.state[fieldName] = event.target.value;
    this.setState(newState);
  }

  handleSubmitButtonClick() {
    const self = this;

    const newVendorObject = {};
    newVendorObject[this.state.id] = Number(this.state.num_packages);

    axios.put("/inventory/admin", {
      changes: newVendorObject,
    }, {
      headers: { Authorization: "Token " + this.props.token }
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
          <RegistrationHeader HeaderText="Edit Inventory Size" HeaderIcon="fas fa-pencil-alt fa-2x"/>

          <RegistrationInput inputClass="RegistrationInput" placeholderText="Inventory Size" onChange={this.handleInputChange} id="num_packages" value={this.state.num_packages}/>
          <div className="RegistrationInfoText">* New Inventory Size</div>

          <div className="RegistrationSubmitButton" onClick={this.handleSubmitButtonClick}>EDIT INVENTORY SIZE</div>
          <div className="RegistrationInfoText">{this.state.hasUpdated ? "Updated" : null}</div>
          <div className="RegistrationInfoText">{this.state.errorMessage != null ? this.state.errorMessage : null}</div>
      </div>
    );
  }
}

export default EditVendor;
