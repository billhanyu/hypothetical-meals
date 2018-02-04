import React, { Component } from 'react';
import AddVendorListItem from './AddVendorListItem.js';
import RegistrationHeader from './../../../Registration/RegistrationHeader.js';
import axios from 'axios';
import AddVendorIngredient from './AddVendorIngredient.js';

class AddVendorIngredientList extends Component {
  constructor(props){
    super(props);
    this.clickedIngredient = this.clickedIngredient.bind(this);
    this.state = {
      ingredients: [],
      hasPickedIngredient: false,
      activeId: -1,
    };
  }

  /*** REQUIRED PROPS
    1. token (String)
  */

  componentDidMount() {
    const self = this;
    axios.get("/ingredients/page/1", {
      headers: { Authorization: "Token " + this.props.token }
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
      this.state.hasPickedIngredient ? <AddVendorIngredient token={this.props.token} id={this.state.activeId}/> :
      <div className="VendorList borderAll">
        <RegistrationHeader HeaderText="Add Vendor Ingredient" HeaderIcon="fas fa-pencil-alt fa-2x"/>
        {
          this.state.ingredients.map((element, key) => {
            return <AddVendorListItem onClick={this.clickedIngredient} key={key} id={element.id} name={element.name}/>
          })
        }
      </div>
    );
  }
}

export default AddVendorIngredientList;
