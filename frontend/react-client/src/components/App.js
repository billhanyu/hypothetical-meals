import React, { Component } from 'react';
import { BrowserRouter as Router, Route, Link} from 'react-router-dom';
import { browserHistory } from 'react-router';
import HomePage from './pages/HomePage.js';
import RegistrationPage from './pages/RegistrationPage.js';
import IndexPage from './pages/IndexPage.js';

class App extends Component {
  render() {
    return (
      <Router>
        <div>
          <Route name="home" exact path="/" component={IndexPage} />
          <Route name="registration" exact path="/register" component={RegistrationPage} />
          <Route name="dashboard" exact path="/dashboard/:token/:isAdmin" component={HomePage}/>
        </div>
      </Router>
    );
  }
}

export default App;
