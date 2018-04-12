import React, { Component } from 'react';
import IngredientList from '../ingredient/IngredientList';
import Cart from './Cart';
import axios from 'axios';
import Snackbar from 'material-ui/Snackbar';
import ChooseVendorItem from './ChooseVendorItem';
import OrderList from './OrderList';

class Order extends Component {
  constructor(props) {
    super(props);
    this.state = {
      cart: [],
      chooseVendor: false,
      showOrders: false,
    };
    this.orderIngredient = this.orderIngredient.bind(this);
    this.setQuantity = this.setQuantity.bind(this);
    this.removeItem = this.removeItem.bind(this);
    this.order = this.order.bind(this);
    this.orderWithVendors = this.orderWithVendors.bind(this);
    this.handleInputChange = this.handleInputChange.bind(this);
    this.backToCart = this.backToCart.bind(this);
    this.showOrders = this.showOrders.bind(this);
    if (global.cart != null) {
      for (let item of global.cart) {
        this.orderIngredient(item, item.quantity);
      }
    }
  }

  showOrders() {
    this.setState({
      showOrders: true,
    });
  }

  handleInputChange(e, idx) {
    const ingredientId = "ingredient" + this.state.cart[idx].id;
    const ingredient = this.state[ingredientId];
    ingredient.selected = e.target.value;
  }

  backToCart() {
    this.setState({
      chooseVendor: false,
      showOrders: false,
    });
  }

  order() {
    this.setState({
      chooseVendor: true,
    });
  }

  orderIngredient(item, quantity) {
    axios.get(`/vendoringredients/${item.id}`, {
      headers: { Authorization: "Token " + global.token }
    })
      .then(response => {
          const vendoringredients = response.data;
          if (vendoringredients.length > 0) {
            const id = item.id;
            let lowest = vendoringredients[0];
            for (let vendoringredient of vendoringredients) {
              if (vendoringredient.price < lowest.price) {
                lowest = vendoringredient;
              }
            }
            const ingredient = {
              vendoringredients,
              selected: lowest.id,
            };
            const state = {};
            state["ingredient" + id] = ingredient;
            this.setState(state);
            const cart = this.state.cart.slice();
            const itemInCart = cart.filter(s => s.id === item.id);
            if (itemInCart.length == 0) {
              const newItem = Object.assign(item);
              newItem.quantity = quantity || 1;
              cart.push(newItem);
            } else {
              const newItem = itemInCart[0];
              newItem.quantity += quantity || 1;
            }
            this.setState({
              cart
            });
          } else {
            this.setState({
              open: true,
              message: 'There is no vendor for this ingredient!'
            });
          }
        })
      .catch(err => {
        this.setState({
          open: true,
          message: 'Error retrieving vendor information for ingredients'
        });
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

  orderWithVendors(event) {
    event.preventDefault();

    const orderObj = {};
    for (let item of this.state.cart) {
      const ingredientId = "ingredient" + item.id;
      const ingredient = this.state[ingredientId];
      orderObj[ingredient.selected] = {
        num_packages: item.quantity,
      };
    }

    axios.post('/order', {
      orders: orderObj,
    }, {
      headers: {Authorization: "Token " + global.token}
    })
    .then(response => {
      this.setState({
        cart: [],
        chooseVendor: false,
        open: true,
        message: "Order completed"
      });
      global.cart = [];
    })
    .catch(err => {
      this.setState({
        open: true,
        message: err.response.data
      });
    });
  }

  handleRequestClose() {
    this.setState({
      open: false,
    });
  }

  render() {
    const main =
      <div>
        <Snackbar
          open={this.state.open}
          message={this.state.message}
          autoHideDuration={2500}
          onRequestClose={this.handleRequestClose.bind(this)}
        />
        {
          !this.state.chooseVendor &&
          <div>
            <h2>Order</h2>
            <button type='button' className='btn btn-primary' onClick={this.showOrders}>
              All Orders
            </button>
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
                  return <ChooseVendorItem item={item} idx={idx} key={idx} state={this.state} handleInputChange={this.handleInputChange} />;
                })
              }
              <button type="button" className="btn btn-secondary" onClick={this.backToCart}>Back</button>
              <button type="submit" className="btn btn-primary" onClick={this.orderWithVendors}>Order</button>
              </form>
            </div>
          </div>
        }
      </div>;
    
    const showOrders = <OrderList back={this.backToCart} />;

    return this.state.showOrders ? showOrders : main;
  }
}

export default Order;
