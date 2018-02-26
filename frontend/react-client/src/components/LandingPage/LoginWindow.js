import React, { Component } from 'react';
import { withRouter } from 'react-router';
import axios from 'axios';
import Cookies from 'universal-cookie';
import RegistrationHeader from './../Registration/RegistrationHeader.js';
import RegistrationInput from './../Registration/RegistrationInput.js';
import { getAuthorizeLink } from '../../oauth/OAuth';

class LoginWindow extends Component {
  constructor(props){
    super(props);
    this._handleClick = this._handleClick.bind(this);
    this.handleInputChange = this.handleInputChange.bind(this);
    this.keyPress = this.keyPress.bind(this);
    this.login_oauth = this.login_oauth.bind(this);
    this.cookies = new Cookies();
    this.state = {
      email: '',
      password: '',
    };
  }

  componentDidMount() {
    this.setState({
      email: this.cookies.get('username') || '',
      password: this.cookies.get('password') || ''
    });
  }

  handleInputChange(fieldName, event) {
    const newState = Object.assign({}, this.state);
    newState[fieldName] = event.target.value;
    this.setState(newState);
  }

  keyPress(e) {
    if (e.key == 'Enter') {
      this._handleClick();
    }
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
        this.cookies.set('user_group', response.data.user.user_group, { path: '/' });
        this.cookies.set('token', response.data.user.token, { path: '/' });
        global.token = response.data.user.token;
        global.user_group = response.data.user.user_group;
        global.user_username = response.data.user.username;
        this.props.history.push(`/dashboard`);
      }
    })
    .catch(error => {
      alert('Wrong username or password!');
    });
  }

  login_oauth() {
    window.location = getAuthorizeLink();
  }

  render() {
    return (
      <div className="LoginWindow borderAll">
        <RegistrationHeader HeaderText='Sign In' HeaderIcon='fas fa-user fa-2x'/>
        <RegistrationInput inputClass="RegistrationInput" placeholderText="Username" value={this.state.email} onChange={this.handleInputChange} onKeyPress={this.keyPress} id="email" />
        <RegistrationInput inputType="password" inputClass="RegistrationInput" placeholderText="Password" value={this.state.password} onChange={this.handleInputChange} onKeyPress={this.keyPress} id="password" />
        <div className="RegistrationSubmitButton" onClick={this._handleClick}>SIGN IN</div>
        <hr/>
        <div className="RegistrationSubmitButton OAuthButton" onClick={this.login_oauth}/>
      </div>
    );
  }
}

export default withRouter(LoginWindow);
