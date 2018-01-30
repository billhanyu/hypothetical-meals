import React, { Component } from 'react';
import axios from 'axios';

class OrderItem extends Component {
  constructor(props) {
    super(props);
    this.state = {
      vendorIngredients: []
    };
    this.selectedIngredient = this.selectedIngredient.bind(this);
  }

  selectedIngredient(event) {
    const ingredientId = event.target.value;
    axios.get(`/vendoringredients/${ingredientId}`, {
      headers: { Authorization: "Token " + this.props.token }
    })
      .then(response => {
        this.setState({
          vendorIngredients: response.data,
        });
      })
      .catch(err => {
        console.log(err);
      });
  }

  render() {
    return (
      <div>
        <select className="AdminDropdown" onChange={e => this.selectedIngredient(e)}>
          <option value="" disabled selected style={{display: "none"}}>None</option>
          {
            this.props.ingredients.map((element, key) => {
              return <option value={element['id']} key={key}>{element['name']}</option>;
            })
          }
        </select>
        <select className="AdminDropdown" onChange={e => this.props.selectedVendorIngredient(e, this.props.idx)}>
          <option value="" disabled selected style={{display: "none"}}>None</option>
          {
            this.state.vendorIngredients.map((element, key) => {
              return <option value={element['id']} key={key}>{element['id']}</option>;
            })
          }
        </select>
        <input type="text" name="quantity" onChange={e => this.props.changedQuantity(e, this.props.idx)} />
      </div>
    );
  }
}

export default OrderItem;
