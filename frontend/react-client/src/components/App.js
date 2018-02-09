import React, { Component } from 'react';
import { BrowserRouter as Router, Route, Redirect } from 'react-router-dom';
import HomePage from './pages/HomePage.js';
import RegistrationPage from './pages/RegistrationPage.js';
import IndexPage from './pages/IndexPage.js';
import Cookies from 'universal-cookie';
import OAuthComponent from '../oauth/OAuthComponent';

class App extends Component {
  constructor(props) {
    super(props);
    this.cookies = new Cookies();
    global.token = this.cookies.get('token');
    global.user_group = this.cookies.get('user_group');
  }

  render() {
    return (
      <Router>
        <div>
          <Route
            name="home"
            exact path="/"
            render={() => global.token ? <Redirect to="/dashboard" /> : <IndexPage />}
          />
          <Route
            name="oauth"
            exact path="/oauth"
            render={() => <OAuthComponent />}
          />
          <Route
            name="registration"
            exact path="/register"
            render={() => (global.user_group == 'admin'
              ? <RegistrationPage />
              : <Redirect to="/" />
            )}
          />
          <Route
            name="dashboard"
            exact path="/dashboard"
            render={() => global.token ? <HomePage /> : <Redirect to="/" />}
          />
        </div>
      </Router>
    );
  }
}

export default App;
