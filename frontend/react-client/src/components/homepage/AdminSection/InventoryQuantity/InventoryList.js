import React, { Component } from 'react';
import RegistrationHeader from './../../../Registration/RegistrationHeader.js';
import axios from 'axios';

import InventoryListItem from './InventoryListItem.js';
import EditInventory from './EditInventory.js';
import PageArrows from './../PageArrows.js';

class IngredientList extends Component {
  constructor(props){
    super(props);
    this.clickedIngredient = this.clickedIngredient.bind(this);
    this.state = {
      inventory: [],
      hasPickedIngredient: false,
      currentPage: 1,
    };
    this.onLeftArrowClick = this.onLeftArrowClick.bind(this);
    this.onRightArrowClick = this.onRightArrowClick.bind(this);
  }

  onLeftArrowClick() {
    const newPageNumber = this.state.currentPage <= 1 ? this.state.currentPage : this.state.currentPage - 1;
    const self = this;
    axios.get(`/inventory/page/${newPageNumber}`, {
      headers: { Authorization: "Token " + this.props.token }
    })
    .then(function (response) {
      self.setState({
        inventory: response.data,
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
    axios.get(`/inventory/page/${newPageNumber}`, {
      headers: { Authorization: "Token " + this.props.token }
    })
    .then(function (response) {
      self.setState({
        inventory: response.data,
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
    axios.get("/inventory/page/1", {
      headers: { Authorization: "Token " + this.props.token }
    })
    .then(function (response) {
      self.setState({
        inventory: response.data,
      })
    })
    .catch(error => {
      console.log(error);
    });
  }

  clickedIngredient(dataObject) {
    this.setState({
      hasPickedIngredient: true,
      id: dataObject.id,
      num_packages: dataObject.num_packages,
    });
  }

  render() {
    return (
      this.state.hasPickedIngredient ? <EditInventory token={this.props.token} id={this.state.id} num_packages={this.state.num_packages}/> :
      <div className="VendorList borderAll">
        <PageArrows onClickLeft={this.onLeftArrowClick} pageNumber={this.state.currentPage} onClickRight={this.onRightArrowClick}/>
        <RegistrationHeader HeaderText="Edit Ingredient" HeaderIcon="fas fa-pencil-alt fa-2x"/>
        {
          this.state.inventory.map((element, key) => {
            return <InventoryListItem onClick={this.clickedIngredient} key={key} id={element.id} ingredient_name={element.ingredient_name} package_type={element.package_type} num_packages={element.num_packages}/>
          })
        }
      </div>
    );
  }
}

export default IngredientList;
