import React, { Component } from 'react';
import axios from 'axios';

import RegistrationHeader from './../../../Registration/RegistrationHeader.js';
import RegistrationInput from './../../../Registration/RegistrationInput.js';
import RegistrationAgreement from './../../../Registration/RegistrationAgreement.js';
import RegistrationSubmitButton from './../../../Registration/RegistrationSubmitButton.js';

class EditVendor extends Component {
  constructor(props){
    super(props);
    this.handleInputChange = this.handleInputChange.bind(this);
    this.handleSubmitButtonClick = this.handleSubmitButtonClick.bind(this);
    this.state = {
      name: props.name,
      contact: props.contact,
      code: props.code,
      id: props.id,
      hasUpdated: false,
      errorMessage: null,
    };
  }

  /*** REQUIRED PROPS
    1. name (String)
    2. id (Number)
    3. contact (String)
    4. code (String)
  */

  handleInputChange(fieldName, event) {
    const newState = this.state;
    this.state[fieldName] = event.target.value;
    this.setState(newState);
  }

  handleSubmitButtonClick() {
    const self = this;
    const newVendorObject = {};
    newVendorObject[this.state.id] = {
      name: this.state.name,
      contact: this.state.contact,
      code: this.state.code,
    };

    axios.put("/vendors", {
      vendors: newVendorObject,
    }, {
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
          <RegistrationHeader HeaderText="Edit Vendor" HeaderIcon="fas fa-user fa-2x"/>

          <RegistrationInput inputClass="RegistrationInput" placeholderText="Name" onChange={this.handleInputChange} id="name" value={this.state.name}/>
          <div className="RegistrationInfoText">* (Optional) How your name will appear after you have logged in</div>
          <RegistrationInput inputClass="RegistrationInput" placeholderText="Contact" onChange={this.handleInputChange} id="contact" value={this.state.contact}/>
          <div className="RegistrationInfoText">* Used to login after registration</div>
          <RegistrationInput inputClass="RegistrationInput" placeholderText="Carrier Code" onChange={this.handleInputChange} id="code" value={this.state.code}/>

          <div className="RegistrationSubmitButton" onClick={this.handleSubmitButtonClick}>EDIT VENDOR</div>
          <div className="RegistrationInfoText">{this.state.hasUpdated ? "Updated" : null}</div>
          <div className="RegistrationInfoText">{this.state.errorMessage != null ? this.state.errorMessage : null}</div>
      </div>
    );
  }
}

export default EditVendor;
