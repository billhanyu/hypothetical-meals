import React, { Component } from 'react';
import axios from 'axios';
import Snackbar from 'material-ui/Snackbar';
import OrderListItem from './OrderListItem';
import PropTypes from 'prop-types';
import DistributeLotItem from './DistributeLotItem';

class OrderList extends Component {
  constructor(props) {
    super(props);
    this.state = {
      orders: [],
      open: false,
      message: '',
      markingArrived: false,
      arrivingOrder: {},
    };
    this.markArrived = this.markArrived.bind(this);
    this.back = this.back.bind(this);
  }

  handleRequestClose() {
    this.setState({
      open: false,
    });
  }
  
  componentWillMount() {
    this.reloadData();
  }

  markArrived(arrivingOrder) {
    this.setState({
      arrivingOrder,
      markingArrived: true,
    });
  }

  back(message) {
    this.setState({
      markingArrived: false,
    });
    this.reloadData();
    if (message) {
      this.setState({
        open: true,
        message,
      });
    }
  }

  reloadData() {
    axios.get('/order/pending', {
      headers: { Authorization: 'Token ' + global.token },
    })
      .then(response => {
        const result = response.data;
        let orders = [];
        Object.values(result).forEach(v => {
          orders = orders.concat(v);
        });
        this.setState({
          orders,
        });
      })
      .catch(err => {
        this.setState({
          open: true,
          message: 'Error retrieving past orders',
        });
      });
  }
  
  render() {
    const columnClass = 'OneFifthWidth';
    const main =
      <div>
        <Snackbar
          open={this.state.open}
          message={this.state.message}
          autoHideDuration={2500}
          onRequestClose={this.handleRequestClose.bind(this)}
        />
        <h2>Pending Orders</h2>
        <button type='button' onClick={this.props.back} className='btn btn-secondary'>
          Back
        </button>
        <table className='table'>
          <thead>
            <tr>
              <th className={columnClass}>Order Time</th>
              <th className={columnClass}>Ingredient</th>
              <th className={columnClass}>Vendor</th>
              <th className={columnClass}>Number of Packages</th>
              <th className={columnClass}>Status</th>
            </tr>
          </thead>
          <tbody>
            {
              this.state.orders.map((order, idx) =>
                <OrderListItem
                  markArrived={this.markArrived}
                  key={idx}
                  order={order}
                  columnClass={columnClass}
                />)
            }
          </tbody>
        </table>
      </div>;
    
    const markingArrived =
      <DistributeLotItem order={this.state.arrivingOrder} back={this.back} />;
    
    return this.state.markingArrived ? markingArrived : main;
  }
}

OrderList.propTypes = {
  back: PropTypes.func,
};

export default OrderList;
