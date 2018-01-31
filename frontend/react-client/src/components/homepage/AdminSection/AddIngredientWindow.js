import React, { Component } from 'react';
import axios from 'axios';

import RegistrationHeader from './../../Registration/RegistrationHeader.js';
import RegistrationInput from './../../Registration/RegistrationInput.js';
import RegistrationAgreement from './../../Registration/RegistrationAgreement.js';
import RegistrationSubmitButton from './../../Registration/RegistrationSubmitButton.js';

import VendorComboBox from './VendorComboBox.js';

class AddIngredientWindow extends Component {
  constructor(props){
    super(props);
    this.handleInputChange = this.handleInputChange.bind(this);
    this.handleSubmitButtonClick = this.handleSubmitButtonClick.bind(this);
    this.state = {
      name: '',
      finishedSubmitting: false,
      storage: 'Frozen',
    };
  }

  handleInputChange(fieldName, event) {
    const newState = this.state;
    this.state[fieldName] = event.target.value;
    this.setState(newState);
  }

  handleSubmitButtonClick() {
    const self = this;
    let storage_id;
    if(this.state.storage == "Frozen") {
      storage_id = 1;
    }
    else if (this.state.storage == 'Refrigerated') {
      storage_id = 2;
    }
    else if (this.state.storage == 'Room Temperature') {
      storage_id = 3;
    }

    axios.post(`/ingredients`, {
      ingredients:[{
        name: self.state.name,
        storage_id,
      }]
    }, {
      headers: { Authorization: "Token " + this.props.token }
    })
    .then(response => {
      console.log(response);
      self.setState({
        finishedSubmitting: true,
      });
    })
    .catch(error => {
      console.log(error);
      console.log(error.response);
    });
  }

  render() {
    return (
      <div className="EditContainer borderAll">
          <RegistrationHeader HeaderText="New Ingredient" HeaderIcon="fas fa-utensils fa-2x"/>

          <RegistrationInput inputClass="RegistrationInput" placeholderText="Name" onChange={this.handleInputChange} id="name" />
          <div className="RegistrationInfoText">* Package Type</div>
          <VendorComboBox id="storage" Options={["Frozen","Refrigerated","Room Temperature"]} onChange={this.handleInputChange}/>
          <div className="RegistrationInfoText">* Temperature </div>

          <div className="RegistrationSubmitButton" onClick={this.handleSubmitButtonClick}>ADD INGREDIENT</div>
          <div className="RegistrationInfoText">{this.state.finishedSubmitting ? "Finished Adding Ingredient" : null}</div>
      </div>
    );
  }
}

export default AddIngredientWindow;
