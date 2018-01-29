import React, { Component } from 'react';

import RegistrationHeader from './../../../Registration/RegistrationHeader.js';

class AddVendor extends Component {
  constructor(props){
    super(props);
    this.state = {
    };
  }

  handleSubmitButtonClick() {
    //TODO: AJAX REQUEST
  }

  render() {
    return (
      <div className="VendorList borderAll">
        <RegistrationHeader HeaderText="Edit Ingredient" HeaderIcon="fas fa-pencil-alt fa-2x"/>
        <div className="VendorContainer">
          <div className="Vendor"> Potatoes </div>
        </div>
      </div>
    );
  }
}

export default AddVendor;
