import React, { Component } from 'react';
import axios from 'axios';

import RegistrationHeader from './../../Registration/RegistrationHeader.js';
import RegistrationInput from './../../Registration/RegistrationInput.js';
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
      errorMessage: null,
    };
  }

  handleInputChange(fieldName, event) {
    const newState = Object.assign({}, this.state);
    newState[fieldName] = event.target.value;
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
      self.setState({
        errorMessage: null,
        finishedSubmitting: true,
      });
    })
    .catch(error => {
      self.setState({
        errorMessage: error.response.data
      });
    });
  }

  render() {
    return (
      <div className="EditContainer borderAll">
          <RegistrationHeader HeaderText="New Ingredient" HeaderIcon="fas fa-utensils fa-2x"/>

          <RegistrationInput inputClass="RegistrationInput" placeholderText="Name" onChange={this.handleInputChange} id="name" />
          <div className="RegistrationInfoText">* Ingredient Name</div>
          <VendorComboBox id="storage" Options={["Frozen","Refrigerated","Room Temperature"]} onChange={this.handleInputChange}/>
          <div className="RegistrationInfoText">* Temperature </div>

          <div className="RegistrationSubmitButton" onClick={this.handleSubmitButtonClick}>ADD INGREDIENT</div>
          <div className="RegistrationInfoText">{this.state.finishedSubmitting ? "Finished Adding Ingredient" : null}</div>
          <div className="RegistrationInfoText">{this.state.errorMessage != null ? this.state.errorMessage : null}</div>
      </div>
    );
  }
}

export default AddIngredientWindow;
