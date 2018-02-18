import React, { Component } from 'react';
import { withRouter } from 'react-router';

import RegistrationHeader from './RegistrationHeader';
import RegistrationInput from './RegistrationInput';
import PasswordStrengthContainer from './PasswordStrengthContainer';

import axios from 'axios';

class RegistrationContainer extends Component {
  constructor(props) {
    super(props);
    this.handleInputChange = this.handleInputChange.bind(this);
    this.handleSubmitButtonClick = this.handleSubmitButtonClick.bind(this);
    this._handleCheckboxClick = this._handleCheckboxClick.bind(this);
    this.keyPress = this.keyPress.bind(this);
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
    const newState = Object.assign({}, this.state);
    newState[fieldName] = event.target.value;
    this.setState(newState);
  }

  handleSubmitButtonClick() {
    axios.post(this.state.isAdmin ? '/users/admin' : '/users/noob', {
      'user': {
        username: this.state.email,
        name: this.state.name,
        password: this.state.password,
      }
    }, {
        headers: { Authorization: "Token " + global.token }
      })
      .then(response => {
        alert('Success!');
      })
      .catch(error => {
        alert(error.response.data);
      });
  }

  keyPress(e) {
    if (e.key == 'Enter') {
      this.handleSubmitButtonClick();
    }
  }

  render() {
    return (
      <div className="RegistrationContainer">
        <RegistrationHeader HeaderText='Account Creation' HeaderIcon='fas fa-user fa-2x' />

        <RegistrationInput inputClass="RegistrationInput" placeholderText="Full Name" onKeyPress={this.keyPress} onChange={this.handleInputChange} id="name" />
        <div className="RegistrationInfoText">* (Optional) User's full name</div>
        <RegistrationInput inputClass="RegistrationInput" placeholderText="Username" onKeyPress={this.keyPress} onChange={this.handleInputChange} id="email" />
        <div className="RegistrationInfoText">* Used to login after registration</div>
        <RegistrationInput inputType="password" inputClass="RegistrationInput" placeholderText="Password" onChange={this.handleInputChange} onKeyPress={this.keyPress} id="password" />

        <PasswordStrengthContainer passwordText={this.state.password} />
        <div style={{ marginTop: '12px', marginLeft: '24px', float: 'left', marginBottom: '20px' }}><input type="checkbox" onClick={this._handleCheckboxClick} /> Admin?</div>
        <div className="RegistrationSubmitButton" onClick={this.handleSubmitButtonClick}>CREATE ACCOUNT</div>
      </div>
    );
  }
}

export default withRouter(RegistrationContainer);
