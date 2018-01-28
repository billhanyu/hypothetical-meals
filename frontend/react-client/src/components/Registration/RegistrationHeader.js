import React, { Component } from 'react';

class RegistrationHeader extends Component {
  constructor(props){
    super(props);
  }

  render() {
    return (
      <div className="RegistrationHeader">
        <i className="fas fa-user fa-2x RegistrationPersonIcon"></i>
        <span className="RegistrationHeaderText">Account Creation</span>
      </div>
    );
  }
}

export default RegistrationHeader;
