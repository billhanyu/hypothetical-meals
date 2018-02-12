import React, { Component } from 'react';

class LoggedInAccountHeader extends Component {
  render() {
    return (
      <div className="navButtonText">
        <i className="fas fa-user fa-lg navButtonAccountSign"></i>
        <i className="fas fa-angle-down fa-sm navButtonAccountDropdownArrow"></i>
        <span className="navButtonAccountName">Brian Zhou</span>
      </div>
    );
  }
}

export default LoggedInAccountHeader;
