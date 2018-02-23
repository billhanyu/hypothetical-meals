import React, { Component } from 'react';
import IngredientList from '../ingredient/IngredientList';
import Cart from './Cart';
import axios from 'axios';

class Order extends Component {
  constructor(props) {
    super(props);
    this.state = {
      cart: global.cart == null ? [] : global.cart,
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
      console.log(item.id);
      console.log(item);
      promises.push(axios.get(`/vendoringredients/${item.id}`, {
        headers: {Authorization: "Token " + global.token}
      }));
    }
    Promise.all(promises)
      .then(responses => {
        for (let response of responses) {
          const vendoringredients = response.data;
          if (vendoringredients.length > 0) {
            const id = vendoringredients[0].ingredient_id;
            let lowest = vendoringredients[0];
            for (let vendoringredient of vendoringredients) {
              if (vendoringredient.price < lowest.price) {
                lowest = vendoringredient;
              }
            }
            const ingredient = {
              vendoringredients,
              selected: lowest,
            };
            const state = {};
            state["ingredient"+id] = ingredient;
            this.setState(state);
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
            <div className="row justify-content-md-center">
              <form className="col-xl-6 col-lg-6 col-sm-8">
              {
                this.state.cart.map((item, idx) => {
                  const ingredient = this.state["ingredient" + item.id];
                  let vendoringredients = ingredient ? ingredient.vendoringredients : ['N/A'];
                  return (
                    <div className="form-group" key={idx}>
                      <label htmlFor="vendor">{item.name}</label>
                      <div className="col-*-8">
                        <select className="form-control" onChange={e=>this.handleInputChange(e, idx)}>
                          {
                            vendoringredients.map((vendoringredient, idx) => {
                              return <option key={idx} value={vendoringredient.id}>{vendoringredient.vendor_name + vendoringredient.price}</option>;
                            })
                          }
                        </select>
                      </div>
                    </div>
                  );
                })
              }
              <button type="submit" className="btn btn-primary" onClick={this.orderWithVendors}>Order</button>
              </form>
            </div>
          </div>
        }
      </div>
    );
  }
}

export default Order;
