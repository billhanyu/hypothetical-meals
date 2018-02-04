import React, { Component } from 'react';
import IngredientListItem from './IngredientListItem.js';
import RegistrationHeader from './../../../Registration/RegistrationHeader.js';
import axios from 'axios';
import EditIngredient from './EditIngredient.js';

class IngredientList extends Component {
  constructor(props){
    super(props);
    this.clickedIngredient = this.clickedIngredient.bind(this);
    this.state = {
      ingredients: [],
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
    axios.get("/ingredients/page/1", {
      headers: { Authorization: "Token " + this.props.token }
    })
    .then(function (response) {
      console.log(response);
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
      activeStorageID: dataObject.storage_id,
      activeName: dataObject.name,
      activeId: dataObject.id,
    });
  }

  render() {
    return (
      this.state.hasPickedIngredient ? <EditIngredient token={this.props.token} id={this.state.activeId} storage_id={this.state.activeStorageID} name={this.state.activeName}/> :
      <div className="VendorList borderAll">
        <RegistrationHeader HeaderText="Edit Ingredient" HeaderIcon="fas fa-pencil-alt fa-2x"/>
        {
          this.state.ingredients.map((element, key) => {
            return <IngredientListItem onClick={this.clickedIngredient} key={key} id={element.id} name={element.name} storage_id={element.storage_id}/>
          })
        }
      </div>
    );
  }
}

export default IngredientList;
