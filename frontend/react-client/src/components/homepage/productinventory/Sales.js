import React, { Component } from 'react';
import axios from 'axios';
import Snackbar from 'material-ui/Snackbar';
import SaleItem from './SaleItem';
import PropTypes from 'prop-types';

class Sales extends Component {
  constructor(props) {
    super(props);
    this.state = {
      sales: [],
      open: false,
      message: '',
      requesting: false,
    };
    this.request = this.request.bind(this);
    this.back = this.back.bind(this);
  }

  request() {
    this.setState({
      requesting: true,
    });
  }

  back() {
    this.setState({
      requesting: false,
    });
  }
  
  componentWillMount() {
    this.reloadData();
  }

  reloadData() {
    axios.get('/sales', {
      headers: {Authorization: 'Token ' + global.token}
    })
      .then(response => {
        this.setState({
          sales: response.data,
        });
      })
      .catch(err => {
        this.setState({
          open: true,
          message: 'Error retrieving sales data',
        });
      });
  }

  handleRequestClose() {
    this.setState({
      open: false,
    });
  }

  render() {
    const columnClass = global.user_group == 'noob' ? 'OneThirdWidth' : 'OneFourthWidth';
    return (
      <div>
        <h2>Sales</h2>
        <button
          type='button'
          className='btn btn-primary'
          onClick={this.request}
        >
          Request Another Sale
        </button>
        <Snackbar
          open={this.state.open}
          message={this.state.message}
          autoHideDuration={2500}
          onRequestClose={this.handleRequestClose.bind(this)}
        />
        <table className='table'>
          <thead>
            <tr>
              <th className={columnClass}>Requested Time</th>
              <th className={columnClass}>Total Revenue</th>
              <th className={columnClass}>Number of Products</th>
              {
                global.user_group !== 'noob' &&
                <th className={columnClass}>Options</th>
              }
            </tr>
          </thead>
          {
            this.state.sales.map((sale, idx) => {
              return (
                <SaleItem columnClass={columnClass} idx={idx} key={idx} sale={sale} />
              );
            })
          }
        </table>
      </div>
    );
  }
}

Sales.propTypes = {
  back: PropTypes.func,
};

export default Sales;
