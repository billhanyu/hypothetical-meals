import React, { Component } from 'react';
import VendorListItem from './VendorListItem.js';
import RegistrationHeader from './../../../Registration/RegistrationHeader.js';
import axios from 'axios';
import EditVendor from './EditVendor.js';
import PageArrows from './../PageArrows.js';

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
      currentPage: 1,
    };
    this.onLeftArrowClick = this.onLeftArrowClick.bind(this);
    this.onRightArrowClick = this.onRightArrowClick.bind(this);
  }

  onLeftArrowClick() {
    const newPageNumber = this.state.currentPage <= 1 ? this.state.currentPage : this.state.currentPage - 1;
    const self = this;
    axios.get(`/vendors/page/${newPageNumber}`, {
      headers: { Authorization: "Token " + this.props.token }
    })
    .then(function (response) {
      self.setState({
        vendors: response.data,
        currentPage: newPageNumber,
      });
    })
    .catch(error => {
      console.log(error);
    });
  }

  onRightArrowClick() {
    const newPageNumber = this.state.currentPage + 1;
    const self = this;
    axios.get(`/vendors/page/${newPageNumber}`, {
      headers: { Authorization: "Token " + this.props.token }
    })
    .then(function (response) {
      self.setState({
        vendors: response.data,
        currentPage: newPageNumber,
      });
    })
    .catch(error => {
      console.log(error);
    });
  }

  /*** REQUIRED PROPS
    1. token (String)
  */

  componentDidMount() {
    const self = this;
    axios.get("/vendors/page/1", {
      headers: { Authorization: "Token " + this.props.token }
    })
    .then(function (response) {
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
        <PageArrows onClickLeft={this.onLeftArrowClick} pageNumber={this.state.currentPage} onClickRight={this.onRightArrowClick}/>
        <RegistrationHeader HeaderText="Edit Vendor" HeaderIcon="fas fa-pencil-alt fa-2x"/>
        {
          this.state.vendors.map((element, key) => {
            return <VendorListItem onClick={this.clickedVendor} key={key} name={element.name} contact={element.contact} id={element.id} code={element.code}/>;
          })
        }
      </div>
    );
  }
}

export default VendorList;
