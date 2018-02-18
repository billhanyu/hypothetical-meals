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
    this.setQuantity = this.setQuantity.bind(this);
    this.removeInventoryItem = this.removeInventoryItem.bind(this);
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

  removeInventoryItem(id) {
    let index = -1;
    for (let i = 0; i < this.state.cart.length; i++) {
      if (this.state.cart[i].id === id) {
        index = i;
        break;
      }
    }
    if (index > -1) {
      const cart = this.state.cart.slice();
      cart.splice(index, 1);
      this.setState({
        cart
      });
    }
  }

  setQuantity(item, quantity) {
    const cart = this.state.cart.slice();
    const itemInCart = cart.filter(s => s.id === item.id)[0];
    itemInCart.quantity = quantity;
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
        headers: { Authorization: "Token " + global.token }
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
      alert('Error, please check that you checked out valid numbers.');
    });
  }

  render() {
    return (
      <div>
        <ViewInventory
          ref={e => {this.viewInventory = e;}}
          mode="cart"
          onClickInventoryItem={this.onClickInventoryItem}
        />
        <Cart
          ref={e => {this.cart = e;}}
          cart={this.state.cart}
          checkout={this.checkout}
          setQuantity={this.setQuantity}
          removeItem={this.removeInventoryItem}
        />
      </div>
    );
  }
}

export default CheckOut;
