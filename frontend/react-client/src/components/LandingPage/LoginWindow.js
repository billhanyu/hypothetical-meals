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
    this.handleInputChange = this.handleInputChange.bind(this);
    this.cookies = new Cookies();
    this.state = {
      email: '',
      password: '',
    };
  }

  componentDidMount() {
    this.setState({
      email: this.cookies.get('email') || '',
      password: this.cookies.get('password') || ''
    });
  }

  handleInputChange(fieldName, event) {
    const newState = Object.assign({}, this.state);
    newState[fieldName] = event.target.value;
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
        console.log(response.data.user.user_group);
        this.cookies.set('user_group', response.data.user.user_group, { path: '/' });
        this.cookies.set('token', response.data.user.token, { path: '/' });
        global.token = response.data.user.token;
        global.user_group = response.data.user.user_group;
        this.props.history.push(`/dashboard`);
      }
    })
    .catch(error => {
      alert('Wrong username or password!');
    });
  }

    render() {
        return (
            <div className="LoginWindow borderAll">
              <RegistrationHeader HeaderText='Sign In' HeaderIcon='fas fa-user fa-2x'/>
              <RegistrationInput inputClass="RegistrationInput" placeholderText="Username" value={this.state.email} onChange={this.handleInputChange} id="email" />
              <RegistrationInput inputType="password" inputClass="RegistrationInput" placeholderText="Password" value={this.state.password} onChange={this.handleInputChange} id="password" />
              <div className="RegistrationSubmitButton" onClick={this._handleClick}>SIGN IN</div>
            </div>
        );
    }
}

export default withRouter(LoginWindow);
