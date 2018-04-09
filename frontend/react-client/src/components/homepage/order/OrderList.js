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

  back() {
    this.setState({
      markingArrived: false,
    });
    this.reloadData();
  }

  reloadData() {
    axios.get('/orders', {
      headers: { Authorization: 'Token ' + global.token },
    })
      .then(response => {
        this.setState({
          orders: response.data,
        });
      })
      .catch(err => {
        this.setState({
          open: true,
          message: 'Error retrieving past orders',
          orders: [
            {
              ingredient: {
                name: 'FUCK',
              },
              vendor: {
                name: 'Duke',
              },
              created_at: '2018-03-31T06:56:44.000Z',
              num_packages: 2,
              arrived: 0,
            },
            {
              ingredient: {
                name: 'damn',
              },
              vendor: {
                name: 'UNC',
              },
              created_at: '2018-04-01T06:56:44.000Z',
              num_packages: 1,
              arrived: 1,
            },
          ],
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
        <h2>All Orders</h2>
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
