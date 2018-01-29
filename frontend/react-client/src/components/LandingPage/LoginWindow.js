import React, { Component } from 'react';
import { withRouter } from 'react-router';
import axios from 'axios';

import RegistrationHeader from './../Registration/RegistrationHeader.js';
import RegistrationInput from './../Registration/RegistrationInput.js';

class LoginWindow extends Component {
  constructor(props){
    super(props);
    this._handleClick = this._handleClick.bind(this);
    this._handleCheckboxClick = this._handleCheckboxClick.bind(this);
    this.handleInputChange = this.handleInputChange.bind(this);
    this.state = {
      email: '',
      password: '',
      isAdmin: false,
    };
  }

  handleInputChange(fieldName, event) {
    const newState = this.state;
    this.state[fieldName] = event.target.value;
    this.setState(newState);
  }

  _handleClick(){
    axios.post('/users/login', {
      "user":{
        username: this.state.email,
        password: this.state.password,
      }
    })
    .then(response => {
      if(response.status == 200) {
        this.props.history.push(`/dashboard/${response.data.user.token}/${this.state.isAdmin}`);
      }
    })
    .catch(error => {
      console.log(error);
    });
  }

  _handleCheckboxClick() {
    this.setState({
      isAdmin: !this.state.isAdmin
    })
  }

    render() {
        return (
            <div className="LoginWindow borderAll">
              <RegistrationHeader HeaderText='Sign In' HeaderIcon='fas fa-user fa-2x'/>
              <RegistrationInput inputClass="RegistrationInput" placeholderText="Email" onChange={this.handleInputChange} id="email" />
              <RegistrationInput inputClass="RegistrationInput" placeholderText="Password" onChange={this.handleInputChange} id="password" />
              <div style={{marginTop: '12px', marginLeft:'24px'}}><input type="checkbox" onClick={this._handleCheckboxClick}/> Admin?</div>
              <div className="RegistrationSubmitButton" onClick={this._handleClick}>SIGN IN</div>
            </div>
        );
    }
}

export default withRouter(LoginWindow);
