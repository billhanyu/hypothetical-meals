import React, { Component } from 'react';
import VendorIngredientListItem from './VendorIngredientListItem.js';
import RegistrationHeader from './../../../Registration/RegistrationHeader.js';
import axios from 'axios';
import EditVendorIngredient from './EditVendorIngredient.js';

class IngredientList extends Component {
  constructor(props){
    super(props);
    this.clickedIngredient = this.clickedIngredient.bind(this);
    this.state = {
      vendoringredients: [],
      hasPickedIngredient: false,
      activeStorageID: -1,
      activeId: -1,
      name: '',
    };
  }

  /*** REQUIRED PROPS
    1. token (String)
  */

  componentDidMount() {
    const self = this;
    axios.get("/vendoringredients-available/page/1", {
      headers: { Authorization: "Token " + this.props.token }
    })
    .then(function (response) {
      self.setState({
        vendoringredients: response.data,
      });
    })
    .catch(error => {
      console.log(error);
    });
  }

  clickedIngredient(dataObject) {
    this.setState({
      hasPickedIngredient: true,
      vendor_ingredient_id: dataObject.vendor_ingredient_id,
      storage_id: dataObject.storage_id,
      ingredient_id: dataObject.ingredient_name,
      ingredient_name: dataObject.ingredient_id,
      ingredient_package_type: dataObject.ingredient_package_type,
      ingredient_price: dataObject.ingredient_price,
    });
  }

  render() {
    return (
      this.state.hasPickedIngredient ? <EditVendorIngredient token={this.props.token} vendor_ingredient_id={this.state.vendor_ingredient_id} price={this.state.ingredient_price} storage_id={this.state.storage_id} name={this.state.ingredient_name}/> :
      <div className="VendorList borderAll">
        <RegistrationHeader HeaderText="Edit Ingredient" HeaderIcon="fas fa-pencil-alt fa-2x"/>
        {
          this.state.vendoringredients.map((element, key) => {
            return <VendorIngredientListItem onClick={this.clickedIngredient} key={key} vendor_ingredient_id={element.id} ingredient_id={element.ingredient_id} ingredient_name={element.ingredient_name} ingredient_storage_id={element.ingredient_storage_id} ingredient_package_type={element.package_type} ingredient_price={element.price}/>
          })
        }
      </div>
    );
  }
}

export default IngredientList;
