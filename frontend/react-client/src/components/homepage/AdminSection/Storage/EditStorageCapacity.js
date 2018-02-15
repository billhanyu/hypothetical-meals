import React, { Component } from 'react';
import axios from 'axios';

import RegistrationHeader from './../../../Registration/RegistrationHeader.js';
import RegistrationInput from './../../../Registration/RegistrationInput.js';
import VendorComboBox from './../VendorComboBox.js';

class EditVendor extends Component {
  constructor(props){
    super(props);
    this.handleInputChange = this.handleInputChange.bind(this);
    this.handleComboBoxChange = this.handleComboBoxChange.bind(this);
    this.handleSubmitButtonClick = this.handleSubmitButtonClick.bind(this);
    this.state = {
      size: 0,
      storage: 'Frozen',
      errorMessage: null,
      frozen_storage: 0,
      refrigerated_storage: 0,
      room_temp_storage: 0,
    };
  }

  /*** REQUIRED PROPS
    1. Token (String)
  */

  componentDidMount(){
    const self = this;
    axios.get("/storages", {
      headers: { Authorization: "Token " + global.token }
    })
    .then(function (response) {
      self.setState({
        frozen_storage: response.data[0].capacity,
        refrigerated_storage: response.data[1].capacity,
        room_temp_storage: response.data[2].capacity,
        size: response.data[0].capacity,
        errorMessage: null,
      });
    })
    .catch(error => {
      self.setState({
        errorMessage: error.response.data,
      });
    });
  }

  handleInputChange(fieldName, event) {
    const newState = this.state;
    newState[fieldName] = event.target.value;
    this.setState(newState);
  }

  handleComboBoxChange(fieldName, event) {
    let newPriceForStorage = 0;
    const storage = event.target.value;
    if(storage == "Frozen") {
      newPriceForStorage = this.state.frozen_storage;
    }
    else if (storage == 'Refrigerated') {
      newPriceForStorage = this.state.refrigerated_storage;
    }
    else if (storage == 'Room Temperature') {
      newPriceForStorage = this.state.room_temp_storage;
    }
    this.setState({
      size: newPriceForStorage,
    });
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

    const paramObject = {};
    paramObject[storage_id] = this.state.size;

    axios.put("/storages", paramObject, {
      headers: { Authorization: "Token " + global.token }
    })
    .then(function (response) {
      self.setState({
        hasUpdated: true,
        errorMessage: null,
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
          <RegistrationHeader HeaderText="Storage Size" HeaderIcon="fas fa-pencil-alt fa-2x"/>

          <RegistrationInput inputClass="RegistrationInput" placeholderText="Size" onChange={this.handleInputChange} id="size" value={this.state.size}/>
          <div className="RegistrationInfoText">* Max Capacity</div>
          <VendorComboBox id="storage" Options={["Frozen","Refrigerated","Room Temperature"]} onChange={this.handleComboBoxChange}/>
          <div className="RegistrationInfoText">* Storage Type </div>

          <div className="RegistrationSubmitButton" onClick={this.handleSubmitButtonClick}>EDIT STORAGE SIZE</div>
          <div className="RegistrationInfoText">{this.state.hasUpdated ? "Updated" : null}</div>
          <div className="RegistrationInfoText">{this.state.errorMessage != null ? this.state.errorMessage : null}</div>
      </div>
    );
  }
}

export default EditVendor;
