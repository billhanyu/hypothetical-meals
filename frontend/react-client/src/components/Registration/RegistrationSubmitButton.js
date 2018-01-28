import React, { Component } from 'react';

class RegistrationAgreement extends Component {
  constructor(props){
    super(props);
  }

  /**** REQUIRED PROPS
    1. onChange (Func)
  */

  render() {
    return (
      <div className="RegistrationSubmitButton" onClick={this.handleClick}>CREATE ACCOUNT</div>
    );
  }
}

export default RegistrationAgreement;
