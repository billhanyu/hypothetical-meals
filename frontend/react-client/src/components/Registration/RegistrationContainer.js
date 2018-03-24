import React, { Component } from 'react';
import { withRouter } from 'react-router';

import RegistrationHeader from './RegistrationHeader';
import RegistrationInput from './RegistrationInput';
import PasswordStrengthContainer from './PasswordStrengthContainer';
import Snackbar from 'material-ui/Snackbar';

import axios from 'axios';

class RegistrationContainer extends Component {
  constructor(props) {
    super(props);
    this.handleInputChange = this.handleInputChange.bind(this);
    this.handleSubmitButtonClick = this.handleSubmitButtonClick.bind(this);
    this.handleOptionChange = this.handleOptionChange.bind(this);
    this.keyPress = this.keyPress.bind(this);
    this.state = {
      name: '',
      email: '',
      password: '',
      selectedGroup: 'noob',
    };
  }

  handleOptionChange(e) {
    this.setState({
      selectedGroup: e.target.value,
    });
  }

  handleInputChange(fieldName, event) {
    const newState = Object.assign({}, this.state);
    newState[fieldName] = event.target.value;
    this.setState(newState);
  }

  handleSubmitButtonClick() {
    axios.post(`/users/${this.state.selectedGroup}`, {
      'user': {
        username: this.state.email,
        name: this.state.name,
        password: this.state.password,
      }
    }, {
        headers: { Authorization: "Token " + global.token }
      })
      .then(response => {
        this.setState({
          open: true,
          message: "Success!"
        });
      })
      .catch(error => {
        this.setState({
          open: true,
          message: error.response.data
        });
      });
  }

  keyPress(e) {
    if (e.key == 'Enter') {
      this.handleSubmitButtonClick();
    }
  }

  handleRequestClose() {
    this.setState({
      open: false,
    });
  }

  render() {
    return (
      <div className="RegistrationContainer">
        <Snackbar
          open={this.state.open}
          message={this.state.message}
          autoHideDuration={2500}
          onRequestClose={this.handleRequestClose.bind(this)}
        />
        <RegistrationHeader HeaderText='Account Creation' HeaderIcon='fas fa-user fa-2x' />

        <RegistrationInput inputClass="RegistrationInput" placeholderText="Full Name" onKeyPress={this.keyPress} onChange={this.handleInputChange} id="name" />
        <div className="RegistrationInfoText">* User's full name</div>
        <RegistrationInput inputClass="RegistrationInput" placeholderText="Username" onKeyPress={this.keyPress} onChange={this.handleInputChange} id="email" />
        <div className="RegistrationInfoText">* Used to login after registration</div>
        <RegistrationInput inputType="password" inputClass="RegistrationInput" placeholderText="Password" onChange={this.handleInputChange} onKeyPress={this.keyPress} id="password" />

        <PasswordStrengthContainer passwordText={this.state.password} />

        <div className="groupRadios">
          <label className="radio-inline groupRadio">
            <input className="groupRadioInput" type="radio" name="groupRadio" value="noob" checked={this.state.selectedGroup === "noob"} onChange={this.handleOptionChange} />
            Unprivileged
          </label>
          <label className="radio-inline groupRadio">
            <input className="groupRadioInput" type="radio" name="groupRadio" value="manager" checked={this.state.selectedGroup === "manager"} onChange={this.handleOptionChange} />
            Manager
          </label>
          <label className="radio-inline groupRadio">
            <input className="groupRadioInput" type="radio" name="groupRadio" value="admin" checked={this.state.selectedGroup === "admin"} onChange={this.handleOptionChange} />
            Admin
          </label>
        </div>
        <div className="RegistrationSubmitButton" onClick={this.handleSubmitButtonClick}>CREATE ACCOUNT</div>
      </div>
    );
  }
}

export default withRouter(RegistrationContainer);
