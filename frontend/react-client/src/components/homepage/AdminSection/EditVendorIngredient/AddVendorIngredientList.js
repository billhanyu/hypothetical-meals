import React, { Component } from 'react';
import AddVendorListItem from './AddVendorListItem.js';
import RegistrationHeader from './../../../Registration/RegistrationHeader.js';
import axios from 'axios';
import AddVendorIngredient from './AddVendorIngredient.js';
import PageArrows from './../PageArrows.js';

class AddVendorIngredientList extends Component {
  constructor(props){
    super(props);
    this.clickedIngredient = this.clickedIngredient.bind(this);
    this.state = {
      ingredients: [],
      hasPickedIngredient: false,
      activeId: -1,
      currentPage: 1,
    };
    this.onLeftArrowClick = this.onLeftArrowClick.bind(this);
    this.onRightArrowClick = this.onRightArrowClick.bind(this);
  }

  onLeftArrowClick() {
    const newPageNumber = this.state.currentPage <= 1 ? this.state.currentPage : this.state.currentPage - 1;
    const self = this;
    axios.get(`/ingredients/page/${newPageNumber}`, {
      headers: { Authorization: "Token " + global.token }
    })
    .then(function (response) {
      self.setState({
        ingredients: response.data,
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
    axios.get(`/ingredients/page/${newPageNumber}`, {
      headers: { Authorization: "Token " + global.token }
    })
    .then(function (response) {
      self.setState({
        ingredients: response.data,
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
    axios.get("/ingredients/page/1", {
      headers: { Authorization: "Token " + global.token }
    })
    .then(function (response) {
      self.setState({
        ingredients: response.data
      });
    })
    .catch(error => {
      console.log(error);
    });
  }

  clickedIngredient(dataObject) {
    this.setState({
      hasPickedIngredient: true,
      activeId: dataObject.id,
    });
  }

  render() {
    return (
      this.state.hasPickedIngredient ? <AddVendorIngredient id={this.state.activeId}/> :
      <div className="VendorList borderAll">
        <PageArrows onClickLeft={this.onLeftArrowClick} pageNumber={this.state.currentPage} onClickRight={this.onRightArrowClick}/>
        <RegistrationHeader HeaderText="Add Vendor Ingredient" HeaderIcon="fas fa-pencil-alt fa-2x"/>
        {
          this.state.ingredients.map((element, key) => {
            return <AddVendorListItem onClick={this.clickedIngredient} key={key} id={element.id} name={element.name}/>;
          })
        }
      </div>
    );
  }
}

export default AddVendorIngredientList;
