import React, { Component } from 'react';
import { BrowserRouter as Router, Route, Link} from 'react-router-dom';
import { browserHistory } from 'react-router';
import RegistrationContainer from './../Registration/RegistrationContainer.js';
import RegistrationNavBar from './../Registration/RegistrationNavBar.js';

class App extends Component {
  render() {
    return (
      <div>
        <RegistrationNavBar />
        <RegistrationContainer />
      </div>
    )
  }
}

export default App;
