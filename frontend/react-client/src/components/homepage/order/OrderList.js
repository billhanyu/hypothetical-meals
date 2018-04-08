import React, { Component } from 'react';
import axios from 'axios';
import Snackbar from 'material-ui/Snackbar';
import OrderListItem from './OrderListItem';
import PropTypes from 'prop-types';

class OrderList extends Component {
  constructor(props) {
    super(props);
    this.state = {
      orders: [],
      open: false,
      message: '',
    };
  }

  handleRequestClose() {
    this.setState({
      open: false,
    });
  }
  
  componentWillMount() {
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
              created_at: '2018-03-31T06:56:44.000Z',
              num_packages: 2,
              arrived: 0,
            },
            {
              ingredient: {
                name: 'damn',
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
    return (
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
              <th>Order Time</th>
              <th>Ingredient Name</th>
              <th>Number of Packages</th>
              <th>Status</th>
            </tr>
          </thead>
          <tbody>
            {
              this.state.orders.map((order, idx) => <OrderListItem key={idx} order={order} />)
            }
          </tbody>
        </table>
      </div>
    );
  }
}

OrderList.propTypes = {
  back: PropTypes.func,
};

export default OrderList;
