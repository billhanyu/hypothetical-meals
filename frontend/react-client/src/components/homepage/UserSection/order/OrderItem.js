import React, { Component } from 'react';
import axios from 'axios';

class OrderItem extends Component {
  constructor(props) {
    super(props);
    this.selectedIngredient = this.selectedIngredient.bind(this);
    this.remove = this.remove.bind(this);
  }

  selectedIngredient(event) {
    const ingredientName = event.target.value;
    axios.get('/ingredients-available', {
      headers: { Authorization: "Token " + this.props.token }
    })
    .then(response => {
      let ingredientId;
      for (let ingredient of response.data) {
        if (ingredient.name == ingredientName) {
          ingredientId = ingredient.id;
          break;
        }
      }
      if (ingredientId) {
        return axios.get(`/vendoringredients/${ingredientId}`, {
          headers: { Authorization: "Token " + this.props.token }
        });
      }
    })
    .then(response => {
      this.props.fillVendorIngredients(response.data, this.props.idx);
    })
    .catch(err => {
    });
  }

  remove() {
    this.props.removeOrderItem(this.props.idx);
  }

  render() {
    return (
      <div className="orderitem">
        <div
          className="fa fa-remove DeleteOrderColumn DeleteOrderItem"
          aria-hidden="true"
          onClick={this.remove}
        />
        <input
          className="OrderColumn inputitem"
          onChange={e => { 
            this.selectedIngredient(e);
            this.props.onChangeIngredientName(e, this.props.idx);
          }}
          value={this.props.data.ingredientName}
        />
        <select
          className="OrderColumn inputitem"
          onChange={e => this.props.selectedVendorIngredient(e, this.props.idx)}
          value={this.props.data.vendor_ingredient_id}
        >
          <option value="" disabled selected style={{display: "none"}}>None</option>
          {
            this.props.data.vendoringredients.map((element, key) => {
              return <option value={element.id} key={key}>{element.vendor_name}</option>;
            })
          }
        </select>
        <input
          className="OrderColumn inputitem"
          type="text"
          name="quantity"
          onChange={e => this.props.changedQuantity(e, this.props.idx)}
          value={this.props.data.quantity}
        />
      </div>
    );
  }
}

export default OrderItem;
