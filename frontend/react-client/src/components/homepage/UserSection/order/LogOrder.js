import React, { Component } from 'react';
import axios from 'axios';
import OrderItem from './OrderItem';

class LogOrder extends Component {
  constructor(props) {
    super(props);
    this.state = {
      ingredients: [],
      orders: [],
    };
    this.addOrderItem = this.addOrderItem.bind(this);
    this.onChangeIngredientName = this.onChangeIngredientName.bind(this);
    this.selectedVendorIngredient = this.selectedVendorIngredient.bind(this);
    this.changedQuantity = this.changedQuantity.bind(this);
    this.commitOrder = this.commitOrder.bind(this);
    this.removeOrderItem = this.removeOrderItem.bind(this);
    this.fillVendorIngredients = this.fillVendorIngredients.bind(this);
  }

  addOrderItem() {
    const newOrders = this.state.orders.slice();
    newOrders.push({
      ingredientName: '',
      vendor_ingredient_id: null,
      quantity: 0,
      vendoringredients: [],
    });
    this.setState({
      orders: newOrders
    });
  }

  removeOrderItem(component_id) {
    const newOrders = this.state.orders.slice();
    newOrders.splice(component_id, 1);
    this.setState({
      orders: newOrders
    });
  }

  onChangeIngredientName(event, idx) {
    const orders = this.state.orders.slice();
    orders[idx].ingredientName = event.target.value;
    this.setState({
      orders
    });
  }

  selectedVendorIngredient(event, idx) {
    const orders = this.state.orders.slice();
    orders[idx].vendor_ingredient_id = event.target.value;
    this.setState({
      orders
    });
  }

  changedQuantity(event, idx) {
    const orders = this.state.orders.slice();
    orders[idx].quantity = event.target.value ? parseInt(event.target.value) : '';
    this.setState({
      orders
    });
  }

  fillVendorIngredients(vendoringredients, idx) {
    const orders = this.state.orders.slice();
    orders[idx].vendoringredients = vendoringredients;
    this.setState({
      orders
    });
  }

  commitOrder() {
    const self = this;
    const orders = {};
    for (let order of this.state.orders) {
      orders[order.vendor_ingredient_id] = order.quantity;
    }
    axios.post("/order", {
      orders
    }, {
        headers: { Authorization: "Token " + this.props.token }
      })
      .then(function (response) {
        self.setState({
          orders: [],
        });
        alert('Order Completed!');
      })
      .catch(error => {
        alert(error.response.data);
      });
  }

  componentDidMount() {
    const self = this;
    axios.get("/ingredients-available", {
      headers: { Authorization: "Token " + this.props.token }
    })
      .then(function (response) {
        self.setState({
          ingredients: response.data
        });
      })
      .catch(error => {
      });
  }

  render() {
    return (
      <div>
        <div className="orderitem">
          <div className="DeleteOrderColumn" />
          <span className="OrderColumn OrderColumnHeader">Ingredient</span>
          <span className="OrderColumn OrderColumnHeader">Vendor</span>
          <span className="OrderColumn OrderColumnHeader">Quantity</span>
        </div>
        {
          this.state.orders.map((item, key) => 
            <OrderItem
              key={key}
              idx={key}
              token={this.props.token}
              ingredients={this.state.ingredients}
              data={item}
              onChangeIngredientName={this.onChangeIngredientName}
              selectedVendorIngredient={this.selectedVendorIngredient}
              changedQuantity={this.changedQuantity}
              removeOrderItem={this.removeOrderItem}
              fillVendorIngredients={this.fillVendorIngredients}
            />
          )
        }
        <div className="OrderButtons orderitem">
          <button className="UserButton" onClick={this.addOrderItem}>Add Another</button>
          <button className="UserButton btn btn-primary" onClick={this.commitOrder}>Order</button>
        </div>
      </div>
    );
  }
}

export default LogOrder;
