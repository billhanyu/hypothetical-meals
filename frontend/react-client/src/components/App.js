import React, { Component } from 'react';
import { HashRouter as Router, Route, Redirect } from 'react-router-dom';
import { hashHistory } from 'react-router';
import HomePage from './pages/HomePage.js';
import RegistrationPage from './pages/RegistrationPage.js';
import IndexPage from './pages/IndexPage.js';
import Cookies from 'universal-cookie';

class App extends Component {
  constructor(props) {
    super(props);
    this.cookies = new Cookies();
    global.token = this.cookies.get('token');
    global.user_group = this.cookies.get('user_group');
  }

  render() {
    return (
      <Router history={hashHistory}>
        <div>
          <Route
            name="home"
            exact path="/"
            render={() => (
              global.token ? (
                <Redirect to="/dashboard" />
              ) : (
                <IndexPage/>
              )
            )}
          />
          <Route name="registration" exact path="/register" component={RegistrationPage} />
          <Route
            name="dashboard"
            exact path="/dashboard"
            component={HomePage}
            render={() => (
              global.token ? (
                <HomePage/>
              ) : (
                <Redirect to={{
                  pathname: '/'
                }}/>
              )
            )}
          />
        </div>
      </Router>
    );
  }
}

export default App;
