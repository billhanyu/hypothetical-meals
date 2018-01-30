import React, { Component } from 'react';
import { Link } from 'react-router-dom';

class RegistrationAgreement extends Component {
  constructor(props){
    super(props);
  }

  render() {
    return (
      <div className="AgreementAcceptanceContainer">
        <div className="AgreementAcceptanceText">
          By signing up, you agree to the <Link to=""> User Agreement </Link> and <Link to=""> Privacy Policy</Link>.
        </div>
      </div>
    );
  }
}

export default RegistrationAgreement;
