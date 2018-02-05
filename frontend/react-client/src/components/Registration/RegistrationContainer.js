import React, { Component } from 'react';
import { withRouter } from 'react-router';

import RegistrationHeader from './RegistrationHeader.js';
import RegistrationInput from './RegistrationInput.js';
import PasswordStrengthContainer from './PasswordStrengthContainer.js';
import RegistrationAgreement from './RegistrationAgreement.js';
import RegistrationSubmitButton from './RegistrationSubmitButton.js';

import axios from 'axios';

class RegistrationContainer extends Component {
  constructor(props){
    super(props);
    this.handleInputChange = this.handleInputChange.bind(this);
    this.handleSubmitButtonClick = this.handleSubmitButtonClick.bind(this);
    this._handleCheckboxClick = this._handleCheckboxClick.bind(this);
    this.state = {
      name: '',
      email: '',
      password: '',
      isAdmin: false,
    };
  }

  _handleCheckboxClick() {
    this.setState({
      isAdmin: !this.state.isAdmin
    });
  }

  handleInputChange(fieldName, event) {
    const newState = this.state;
    this.state[fieldName] = event.target.value;
    this.setState(newState);
  }

  handleSubmitButtonClick() {
    axios.post(this.state.isAdmin ? '/users/admin' : '/users/noob', {
      'user':{
        username: this.state.email,
        name: this.state.name,
        password: this.state.password,
      }
    })
    .then(response => {
      if(response.status == 200) {
        this.props.history.push('/');
      }
    })
    .catch(error => {
      console.log(error.response);
    });
  }

  render() {
    return (
      <div className="RegistrationBG">
        <div className="RegistrationContainer">
            <RegistrationHeader HeaderText='Account Creation' HeaderIcon='fas fa-user fa-2x'/>

            <RegistrationInput inputClass="RegistrationInput" placeholderText="Full Name" onChange={this.handleInputChange} id="name" />
            <div className="RegistrationInfoText">* (Optional) How your name will appear after you have logged in</div>
            <RegistrationInput inputClass="RegistrationInput" placeholderText="Email" onChange={this.handleInputChange} id="email" />
            <div className="RegistrationInfoText">* Used to login after registration</div>
            <RegistrationInput inputType="password" inputClass="RegistrationInput" placeholderText="Password" onChange={this.handleInputChange} id="password" />

            <PasswordStrengthContainer passwordText={this.state.password} />
            <div style={{marginTop: '12px', marginLeft:'24px', float:'left', marginBottom:'20px'}}><input type="checkbox" onClick={this._handleCheckboxClick}/> Admin?</div>
            <div className="RegistrationSubmitButton" onClick={this.handleSubmitButtonClick}>CREATE ACCOUNT</div>
            <RegistrationAgreement />
          </div>
      </div>
    );
  }
}

export default withRouter(RegistrationContainer);
