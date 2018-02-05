import React, { Component } from 'react';
import { withRouter } from 'react-router';
import axios from 'axios';
import Cookies from 'universal-cookie';

import RegistrationHeader from './../Registration/RegistrationHeader.js';
import RegistrationInput from './../Registration/RegistrationInput.js';

class LoginWindow extends Component {
  constructor(props){
    super(props);
    this._handleClick = this._handleClick.bind(this);
    this._handleCheckboxClick = this._handleCheckboxClick.bind(this);
    this.handleInputChange = this.handleInputChange.bind(this);
    this.cookies = new Cookies();
    this.state = {
      email: this.cookies.get('username') != null ? this.cookies.get('username') : '',
      password: this.cookies.get('password') != null ? this.cookies.get('password') : '',
      isAdmin: this.cookies.get('admin') != null ? this.cookies.get('admin') : false,
    };
  }

  handleInputChange(fieldName, event) {
    const newState = this.state;
    this.setState({
      fieldName: event.target.value
    });
    this.setState(newState);
  }

  _handleClick(){
    this.cookies.set('username', this.state.email, { path: '/' });
    this.cookies.set('password', this.state.password, { path: '/' });

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
    const newIsAdmin = this.state.isAdmin == 'true' ? 'false' : 'true';
    this.cookies.set('admin', newIsAdmin, { path: '/' });
    this.setState({
      isAdmin: newIsAdmin
    })
  }

    render() {
        return (
            <div className="LoginWindow borderAll">
              <RegistrationHeader HeaderText='Sign In' HeaderIcon='fas fa-user fa-2x'/>
              <RegistrationInput inputClass="RegistrationInput" placeholderText="Email" value={this.state.email} onChange={this.handleInputChange} id="email" />
              <RegistrationInput inputType="password" inputClass="RegistrationInput" placeholderText="Password" value={this.state.password} onChange={this.handleInputChange} id="password" />
              <div style={{marginTop: '12px', marginLeft:'24px'}}><input type="checkbox" checked={this.state.isAdmin == 'true'} onClick={this._handleCheckboxClick}/> Admin?</div>
              <div className="RegistrationSubmitButton" onClick={this._handleClick}>SIGN IN</div>
            </div>
        );
    }
}

export default withRouter(LoginWindow);
