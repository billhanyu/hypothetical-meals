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
    let vendorIngredients = [];
    axios.get(`/vendoringredients/${ingredientId}`, {
      headers: { Authorization: "Token " + this.props.token }
    })
      .then(response => {
        vendorIngredients = response.data;
        return axios.get(`/vendors`, {
          headers: { Authorization: "Token " + this.props.token }
        });
      })
      .then(response => {
        const vendorData = response.data;
        for (let vendorIngredient of vendorIngredients) {
          for (let data of vendorData) {
            if (vendorIngredient.vendor_id == data.id) {
              vendorIngredient.vendorName = data.name;
              break;
            }
          }
        }
        this.setState({
          vendorIngredients
        });
      })
      .catch(err => {
        console.log(err);
      });
  }

  render() {
    return (
      <div className="orderitem">
        <select className="inputitem" onChange={e => this.selectedIngredient(e)}>
          <option value="" disabled selected style={{display: "none"}}>None</option>
          {
            this.props.ingredients.map((element, key) => {
              return <option value={element.id} key={key}>{element.name}</option>;
            })
          }
        </select>
        <select className="inputitem" onChange={e => this.props.selectedVendorIngredient(e, this.props.idx)}>
          <option value="" disabled selected style={{display: "none"}}>None</option>
          {
            this.state.vendorIngredients.map((element, key) => {
              return <option value={element.id} key={key}>{element.vendorName}</option>;
            })
          }
        </select>
        <input className="inputitem" type="text" name="quantity" onChange={e => this.props.changedQuantity(e, this.props.idx)} />
      </div>
    );
  }
}

export default OrderItem;
