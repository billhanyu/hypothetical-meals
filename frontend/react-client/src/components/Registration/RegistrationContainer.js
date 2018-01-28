import React, { Component } from 'react';

import RegistrationHeader from './RegistrationHeader.js';
import RegistrationInput from './RegistrationInput.js';
import PasswordStrengthContainer from './PasswordStrengthContainer.js';
import CaptchaContainer from './CaptchaContainer.js';
import RegistrationAgreement from './RegistrationAgreement.js';
import RegistrationSubmitButton from './RegistrationSubmitButton.js';

class RegistrationContainer extends Component {
  constructor(props){
    super(props);
    this.handleInputChange = this.handleInputChange.bind(this);
    this.handleSubmitButtonClick = this.handleSubmitButtonClick.bind(this);
    this.state = {
      name: '',
      email: '',
      password: '',
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
      <div className="RegistrationBG">
        <div className="RegistrationContainer">
            <RegistrationHeader />

            <RegistrationInput inputClass="RegistrationInput" placeholderText="Full Name" onChange={this.handleInputChange} id="name" />
            <div className="RegistrationInfoText">* (Optional) How your name will appear after you have logged in</div>
            <RegistrationInput inputClass="RegistrationInput" placeholderText="Email" onChange={this.handleInputChange} id="email" />
            <div className="RegistrationInfoText">* Used to login after registration</div>
            <RegistrationInput inputClass="RegistrationInput" placeholderText="Password" onChange={this.handleInputChange} id="password" />

            <PasswordStrengthContainer passwordText={this.state.password} />
            <CaptchaContainer />
            <RegistrationSubmitButton handleClick={this.handleSubmitButtonClick} />
            <RegistrationAgreement />
          </div>
      </div>
    );
  }
}

export default RegistrationContainer;
