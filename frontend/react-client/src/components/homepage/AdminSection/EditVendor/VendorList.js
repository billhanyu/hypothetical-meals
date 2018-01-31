import React, { Component } from 'react';
import VendorListItem from './VendorListItem.js';
import RegistrationHeader from './../../../Registration/RegistrationHeader.js';
import axios from 'axios';
import EditVendor from './EditVendor.js';

class VendorList extends Component {
  constructor(props){
    super(props);
    this.clickedVendor = this.clickedVendor.bind(this);
    this.state = {
      vendors: [],
      hasPickedVendor: false,
      activeCode: '',
      activeId: -1,
      activeName: '',
      activeContact: '',
    };
  }

  /*** REQUIRED PROPS
    1. token (String)
  */

  componentDidMount() {
    const self = this;
    axios.get("/vendors", {
      headers: { Authorization: "Token " + this.props.token }
    })
    .then(function (response) {
      console.log(response);
      self.setState({
        vendors: response.data
      });
    })
    .catch(error => {
      console.log(error);
    });
  }

  clickedVendor(dataObject) {
    this.setState({
      hasPickedVendor: true,
      activeCode: dataObject.code,
      activeName: dataObject.name,
      activeId: dataObject.id,
      activeContact: dataObject.contact,
    });
  }

  render() {
    return (
      this.state.hasPickedVendor ? <EditVendor token={this.props.token} id={this.state.activeId} name={this.state.activeName} contact={this.state.activeContact} code={this.state.activeCode}/> :
      <div className="VendorList borderAll">
        <RegistrationHeader HeaderText="Edit Vendor" HeaderIcon="fas fa-pencil-alt fa-2x"/>
        {
          this.state.vendors.map((element, key) => {
            return <VendorListItem onClick={this.clickedVendor} key={key} name={element.name} contact={element.contact} id={element.id} code={element.code}/>
          })
        }
      </div>
    );
  }
}

export default VendorList;
