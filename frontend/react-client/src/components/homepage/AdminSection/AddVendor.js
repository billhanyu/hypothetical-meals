import React, { Component } from 'react';
import axios from 'axios';

import RegistrationHeader from './../../Registration/RegistrationHeader.js';
import RegistrationInput from './../../Registration/RegistrationInput.js';
import RegistrationAgreement from './../../Registration/RegistrationAgreement.js';
import RegistrationSubmitButton from './../../Registration/RegistrationSubmitButton.js';
import PageArrows from './PageArrows.js';

class AddVendor extends Component {
  constructor(props){
    super(props);
    this.handleInputChange = this.handleInputChange.bind(this);
    this.handleSubmitButtonClick = this.handleSubmitButtonClick.bind(this);
    this.state = {
      name: '',
      contact: '',
      carriercode: '',
      finishedSubmitting: false,
      errorMessage: null,
    };
  }

  handleInputChange(fieldName, event) {
    const newState = this.state;
    this.state[fieldName] = event.target.value;
    this.setState(newState);
  }

  handleSubmitButtonClick() {
    axios.post("/vendors", {
      vendors: [{
        name: this.state.name,
        contact: this.state.contact,
        code: this.state.carriercode,
      }]
    }, {
      headers: { Authorization: "Token " + this.props.token }
    })
    .then(response => {
      this.setState({
        finishedSubmitting: true
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
          <RegistrationHeader HeaderText="New Vendor" HeaderIcon="fas fa-user fa-2x"/>

          <RegistrationInput inputClass="RegistrationInput" placeholderText="Name" onChange={this.handleInputChange} id="name" />
          <div className="RegistrationInfoText">* (Optional) How your name will appear after you have logged in</div>
          <RegistrationInput inputClass="RegistrationInput" placeholderText="Contact" onChange={this.handleInputChange} id="contact" />
          <div className="RegistrationInfoText">* Used to login after registration</div>
          <RegistrationInput inputClass="RegistrationInput" placeholderText="Carrier Code" onChange={this.handleInputChange} id="carriercode" />

          <div className="RegistrationSubmitButton" onClick={this.handleSubmitButtonClick}>ADD INGREDIENT</div>
          <div className="RegistrationInfoText">{this.state.finishedSubmitting ? "Finished Adding Vendor" : null}</div>
          <div className="RegistrationInfoText">{this.state.errorMessage != null ? this.state.errorMessage : null}</div>
      </div>
    );
  }
}

export default AddVendor;
