import React, { Component } from 'react';
import axios from 'axios';
import Snackbar from 'material-ui/Snackbar';
import SaleItem from './SaleItem';
import PropTypes from 'prop-types';
import AddSale from './AddSale';

class Sales extends Component {
  constructor(props) {
    super(props);
    this.state = {
      sales: [],
      open: false,
      message: '',
      requesting: false,
      canceling: '',
    };
    this.request = this.request.bind(this);
    this.back = this.back.bind(this);
  }

  request() {
    this.setState({
      requesting: true,
    });
  }

  back(message) {
    this.reloadData();
    this.setState({
      requesting: false,
    });
    if (message) {
      this.setState({
        open: true,
        message,
      });
    }
  }

  componentWillMount() {
    this.reloadData();
  }

  reloadData() {
    axios.get('/sales/all', {
      headers: { Authorization: 'Token ' + global.token }
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
    const columnClass = 'OneFourthWidth';
    const main =
      <div>
        <h2>Sales</h2>
        <div className="btn-group" role="group" aria-label="Basic example">
          <button
            type="button"
            className="btn btn-secondary"
            onClick={this.props.back}>
            Back
          </button>
          {
            global.user_group !== 'noob' &&
            <button
              type='button'
              className='btn btn-primary'
              onClick={this.request}
            >
              Request Another Sale
            </button>
          }
        </div>
        <Snackbar
          open={this.state.open}
          message={this.state.message}
          autoHideDuration={2500}
          onRequestClose={this.handleRequestClose.bind(this)}
        />
        <table className='table'>
          <thead>
            <tr>
              <th className={columnClass}>Product</th>
              <th className={columnClass}>Number of Products</th>
              <th className={columnClass}>Total Cost</th>
              <th className={columnClass}>Total Revenue</th>
            </tr>
          </thead>
          <tbody>
            {
              this.state.sales.map((sale, idx) => {
                return (
                  <SaleItem
                    columnClass={columnClass}
                    idx={idx}
                    key={idx}
                    sale={sale}
                    cancel={this.cancel}
                    confirm={this.confirm}
                  />
                );
              })
            }
          </tbody>
        </table>
      </div>;

    const addSale = <AddSale back={this.back} />;

    return this.state.requesting ? addSale : main;
  }
}

Sales.propTypes = {
  back: PropTypes.func,
};

export default Sales;
