import React, { Component } from 'react';
import axios from 'axios';
import OrderItem from './OrderItem';

class LogOrder extends Component {
  constructor(props) {
    super(props);
    this.state = {
      ingredients: [],
      orders: [],
      completed: false,
    };
    this.addOrderItem = this.addOrderItem.bind(this);
    this.selectedVendorIngredient = this.selectedVendorIngredient.bind(this);
    this.changedQuantity = this.changedQuantity.bind(this);
    this.commitOrder = this.commitOrder.bind(this);
  }

  addOrderItem() {
    const newOrders = this.state.orders.slice();
    newOrders.push({
      vendor_ingredient_id: null,
      quantity: 0,
    });
    this.setState({
      orders: newOrders
    });
  }

  selectedVendorIngredient(event, idx) {
    const newOrders = this.state.orders.slice();
    newOrders[idx].vendor_ingredient_id = event.target.value;
    this.setState({
      orders: newOrders
    });
  }

  changedQuantity(event, idx) {
    const newOrders = this.state.orders.slice();
    newOrders[idx].quantity = parseInt(event.target.value);
    this.setState({
      orders: newOrders
    });
  }

  commitOrder() {
    const self = this;
    axios.post("/logs", {
      logs: this.state.orders,
    }, {
        headers: { Authorization: "Token " + this.props.token }
      })
      .then(function (response) {
        self.setState({
          completed: true,
        });
      })
      .catch(error => {
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
        {!this.state.completed &&
          <div>
            <div>
              <span className="OrderColumn">Ingredient</span>
              <span className="OrderColumn">Vendor</span>
              <span className="OrderColumn">Quantity</span>
            </div>
            {
              this.state.orders.map((item, key) => 
                <OrderItem
                  key={key}
                  idx={key}
                  token={this.props.token}
                  ingredients={this.state.ingredients}
                  data={item}
                  selectedVendorIngredient={this.selectedVendorIngredient}
                  changedQuantity={this.changedQuantity}
                />
              )
            }
            <div className="OrderButtons">
              <button className="AdminButton" onClick={this.addOrderItem}>Add Another</button>
              <button className="AdminButton btn btn-primary" onClick={this.commitOrder}>Order</button>
            </div>
          </div>
        }
        {this.state.completed &&
          <div>
            <span>Order Completed</span>
          </div>
        }
      </div>
    );
  }
}

export default LogOrder;
