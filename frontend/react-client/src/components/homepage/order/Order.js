import React, { Component } from 'react';
import IngredientList from '../ingredient/IngredientList';
import Cart from './Cart';

class Order extends Component {
  constructor(props) {
    super(props);
    this.state = {
      cart: [],
      chooseVendor: false,
    };
    this.orderIngredient = this.orderIngredient.bind(this);
    this.setQuantity = this.setQuantity.bind(this);
    this.removeItem = this.removeItem.bind(this);
    this.order = this.order.bind(this);
  }

  order() {
    this.setState({
      chooseVendor: true,
    });
  }

  orderIngredient(item) {
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

  removeItem(id) {
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

  render() {
    return (
      <div>
        <h2>Order</h2>
        <IngredientList order={true} orderIngredient={this.orderIngredient}/>
        <Cart cart={this.state.cart} setQuantity={this.setQuantity} removeItem={this.removeItem} />
      </div>
    );
  }
}

export default Order;
