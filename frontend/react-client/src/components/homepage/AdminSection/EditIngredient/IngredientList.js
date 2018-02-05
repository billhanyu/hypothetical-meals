import React, { Component } from 'react';
import IngredientListItem from './IngredientListItem.js';
import RegistrationHeader from './../../../Registration/RegistrationHeader.js';
import axios from 'axios';
import EditIngredient from './EditIngredient.js';
import PageArrows from './../PageArrows.js';

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
      currentPage: 1,
    };
    this.onLeftArrowClick = this.onLeftArrowClick.bind(this);
    this.onRightArrowClick = this.onRightArrowClick.bind(this);
  }

  onLeftArrowClick() {
    const newPageNumber = this.state.currentPage <= 1 ? this.state.currentPage : this.state.currentPage - 1;
    const self = this;
    axios.get(`/ingredients/page/${newPageNumber}`, {
      headers: { Authorization: "Token " + this.props.token }
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
      headers: { Authorization: "Token " + this.props.token }
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
      activeStorageID: dataObject.storage_id,
      activeName: dataObject.name,
      activeId: dataObject.id,
    });
  }

  render() {
    return (
      this.state.hasPickedIngredient ? <EditIngredient token={this.props.token} id={this.state.activeId} storage_id={this.state.activeStorageID} name={this.state.activeName}/> :
      <div className="VendorList borderAll">
        <PageArrows onClickLeft={this.onLeftArrowClick} pageNumber={this.state.currentPage} onClickRight={this.onRightArrowClick}/>
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
