import React, { Component } from 'react';
import ViewInventory from '../inventory/ViewInventory';
import Cart from './Cart';
import axios from 'axios';

class CheckOut extends Component {
  constructor(props) {
    super(props);
    this.state = {
      cart: [],
    };
    this.onClickInventoryItem = this.onClickInventoryItem.bind(this);
    this.checkout = this.checkout.bind(this);
  }

  onClickInventoryItem(item) {
    const cart = this.state.cart.slice();
    const itemInCart = cart.filter(s => s.id === item.id);
    if (itemInCart.length == 0) {
      const newItem = Object.assign(item);
      newItem.quantity = 1;
      cart.push(newItem);
    } else {
      const newItem = itemInCart[0];
      newItem.quantity += 1;
    }
    this.setState({
      cart
    });
  }

  checkout() {
    const req = {};
    const self = this;
    for (let item of this.state.cart) {
      req[item.id] = item.quantity;
    }
    axios.put('/inventory', {
      cart: req
    }, {
        headers: { Authorization: "Token " + this.props.token }
    })
    .then(response => {
      self.setState({
        cart: []
      });
      self.viewInventory.reloadData();
      this.cart.reset();
      alert('Checked Out!');
    })
    .catch(error => {
      console.log(error);
    });
  }

  render() {
    return (
      <div>
        <ViewInventory
          ref={e => {this.viewInventory = e;}}
          token={this.props.token}
          mode="cart"
          onClickInventoryItem={this.onClickInventoryItem}
        />
        <Cart
          ref={e => {this.cart = e;}}
          cart={this.state.cart}
          checkout={this.checkout}
        />
      </div>
    );
  }
}

export default CheckOut;
