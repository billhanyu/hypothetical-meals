import React, { Component } from 'react';
import axios from 'axios';

import RegistrationHeader from './../../Registration/RegistrationHeader.js';
import RegistrationInput from './../../Registration/RegistrationInput.js';

class AddVendor extends Component {
  constructor(props) {
    super(props);
    this.handleInputChange = this.handleInputChange.bind(this);
    this.handleSubmitButtonClick = this.handleSubmitButtonClick.bind(this);
    this.state = {
      name: '',
      contact: '',
      code: '',
      finishedSubmitting: false,
      errorMessage: null,
    };
  }

  handleInputChange(fieldName, event) {
    const newState = Object.assign({}, this.state);
    newState[fieldName] = event.target.value;
    this.setState(newState);
  }

  handleSubmitButtonClick() {
    const self = this;
    axios.post("/vendors", {
      vendors: [{
        name: this.state.name,
        contact: this.state.contact,
        code: this.state.code,
      }]
    }, {
        headers: { Authorization: "Token " + global.token }
      })
      .then(response => {
        self.setState({
          finishedSubmitting: true,
          errorMessage: null,
        });
        self.props.finishAdd();
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
        <RegistrationHeader HeaderText="New Vendor" HeaderIcon="fas fa-user fa-2x" />

        <RegistrationInput inputClass="RegistrationInput" placeholderText="Name" onChange={this.handleInputChange} id="name" />
        <div className="RegistrationInfoText">* Vendor Name </div>
        <RegistrationInput inputClass="RegistrationInput" placeholderText="Carrier Code" onChange={this.handleInputChange} id="code" />
        <div className="RegistrationInfoText">* Carrier Code </div>
        <RegistrationInput inputClass="RegistrationInput" placeholderText="Contact" onChange={this.handleInputChange} id="contact" />
        <div className="RegistrationInfoText">* Contact Info </div>

        <div className="RegistrationSubmitButton" onClick={this.handleSubmitButtonClick}>ADD VENDOR</div>
        <div className="RegistrationInfoText">{this.state.finishedSubmitting ? "Finished Adding Vendor" : null}</div>
        <div className="RegistrationInfoText">{this.state.errorMessage != null ? this.state.errorMessage : null}</div>
      </div>
    );
  }
}

export default AddVendor;
