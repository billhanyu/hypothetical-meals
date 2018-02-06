import React, { Component } from 'react';
import Cookies from 'universal-cookie';
import { withRouter } from 'react-router';

class LogOutButton extends Component {
  constructor(props) {
    super(props);
    this.cookies = new Cookies();
    this.logout = this.logout.bind(this);
  }

  logout() {
    this.cookies.set('user_group', null, { path: '/' });
    this.cookies.set('token', null, { path: '/' });
    global.user_group = null;
    global.token = null;
    this.props.history.push('/');
  }

  render() {
    return (
      <a
        className="LogOutLink"
        href="javascript:void(0)"
        onClick={this.logout}>Log Out</a>
    );
  }
}

export default withRouter(LogOutButton);