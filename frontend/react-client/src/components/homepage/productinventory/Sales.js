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
    this.confirmCancel = this.confirmCancel.bind(this);
    this.cancel = this.cancel.bind(this);
    this.confirm = this.confirm.bind(this);
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

  confirmCancel() {
    // REQUEST
    // Reload data
  }

  confirm(id) {
    // REQUEST
    // reload data
  }

  cancel(id) {
    this.setState({
      canceling: id,
    });
  }
  
  componentWillMount() {
    this.reloadData();
  }

  reloadData() {
    const sales = [
      {
        id: 1,
        created_at: '2018-03-31T06:56:44.000Z',
        products: [
          {
            sale_id: 1,
            formula_id: 1,
            num_packages: 2,
            unit_price: 1,
            formula_name: 'fuck',
          },
          {
            sale_id: 1,
            formula_id: 2,
            num_packages: 3,
            unit_price: 4,
            formula_name: 'damn',
          }
        ]
      }
    ];
    axios.get('/sales', {
      headers: {Authorization: 'Token ' + global.token}
    })
      .then(response => {
        this.setState({
          sales,
        });
      })
      .catch(err => {
        this.setState({
          open: true,
          message: 'Error retrieving sales data',
        });
      });
    this.setState({
      sales,
    });
  }

  handleRequestClose() {
    this.setState({
      open: false,
    });
  }

  render() {
    const columnClass = global.user_group == 'noob' ? 'OneThirdWidth' : 'OneFourthWidth';
    const main =
      <div>
        <h2>Pending Sale Requests</h2>
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
        </table>

        <div className="modal fade" id="cancelSaleModal" tabIndex="-1" role="dialog" aria-labelledby="exampleModalLabel" aria-hidden="true">
          <div className="modal-dialog" role="document">
            <div className="modal-content">
              <div className="modal-header">
                <h5 className="modal-title" id="exampleModalLabel">Confirm Delete</h5>
                <button type="button" className="close" data-dismiss="modal" aria-label="Close">
                  <span aria-hidden="true">&times;</span>
                </button>
              </div>
              <div className="modal-body">
                Are you sure you want to cancel this sale?
              </div>
              <div className="modal-footer">
                <button type="button" className="btn btn-secondary" data-dismiss="modal">Back</button>
                <button type="button" className="btn btn-danger" data-dismiss="modal" onClick={this.confirmCancel}>Yeah Sure</button>
              </div>
            </div>
          </div>
        </div>
      </div>;

    const addSale = <AddSale back={this.back} />;

    return this.state.requesting ? addSale : main;
  }
}

Sales.propTypes = {
  back: PropTypes.func,
};

export default Sales;
