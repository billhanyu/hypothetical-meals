import React, { Component } from 'react';
import IngredientList from '../ingredient/IngredientList';
import Cart from './Cart';
import axios from 'axios';

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
    if (this.state.cart.length == 0) {
      alert('Please choose something first');
      return;
    }
    const promises = [];
    for (let item of this.state.cart) {
      promises.push(axios.get(`/vendoringredients/${item.id}`, {
        headers: {Authorization: "Token " + global.token}
      }));
    }
    Promise.all(promises)
      .then(responses => {
        for (let response of responses) {
          if (response.data.length > 0) {
            const vendoringredients = response.data;
            const id = vendoringredients[0].ingredient_id;
            const item = this.state.cart.find(x => x.id == id);
            item.vendoringredients = vendoringredients;
            let lowest = vendoringredients[0];
            for (let vendoringredient of vendoringredients) {
              if (vendoringredient.price < lowest.price) {
                lowest = vendoringredient;
              }
            }
            item.selected = lowest;
          }
        }
      })
      .catch(err => {
        alert('Error retrieving vendor information for ingredients');
      });
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
        {
          !this.state.chooseVendor &&
          <div>
            <h2>Order</h2>
            <IngredientList order={true} orderIngredient={this.orderIngredient} />
            <Cart cart={this.state.cart} setQuantity={this.setQuantity} removeItem={this.removeItem} order={this.order}/>
          </div>
        }
        {
          this.state.chooseVendor &&
          <div>
            <h2>Choose Vendors</h2>
            <form>
              {
                this.state.cart.map((item, idx) => {
                  return (
                    <div className="form-row" key={idx}>
                      <label htmlFor="vendor" className="col-*-5 col-form-label">{item.name}</label>
                      <div className="col-*-7">
                        <select className="form-control" onChange={this.handleInputChange}>
                          {
                            item.vendoringredients &&
                            item.vendoringredients.map((vendoringredient, idx) => {
                              return <option key={idx} value={vendoringredient.id}>{vendoringredient.vendor_name + vendoringredient.price}</option>;
                            })
                          }
                        </select>
                      </div>
                    </div>
                  );
                })
              }
              <button type="submit" className="btn btn-primary">Order</button>
            </form>
          </div>
        }
      </div>
    );
  }
}

export default Order;
