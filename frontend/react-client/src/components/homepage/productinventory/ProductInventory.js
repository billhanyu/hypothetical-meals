import React, { Component } from 'react';
import axios from 'axios';
import Snackbar from 'material-ui/Snackbar';
import AddSale from './AddSale';
import Sales from './Sales';

class ProductInventory extends Component {
  constructor(props) {
    super(props);
    this.state = {
      inventories: [],
      open: false,
      message: '',
      newSale: false,
      viewSales: false,
    };
    this.newSale = this.newSale.bind(this);
    this.viewSales = this.viewSales.bind(this);
    this.back = this.back.bind(this);
    this.cancelSale = this.cancelSale.bind(this);
  }

  handleRequestClose() {
    this.setState({
      open: false,
    });
  }

  back(message) {
    this.setState({
      newSale: false,
      viewSales: false,
    });
    if (message) {
      this.setState({
        open: true,
        message,
      });
    }
    this.reloadData();
  }

  newSale() {
    this.setState({
      newSale: true,
    });
  }

  viewSales() {
    this.setState({
      viewSales: true,
    });
  }

  componentWillMount() {
    this.reloadData();    
  }

  reloadData() {
    axios.get('/inventory/final', {
      headers: {Authorization: 'Token ' + global.token}
    })
      .then(response => {
        const mapping = {};
        response.data.forEach(item => {
          item.num_packages = item.num_packages * item.num_product;
          if (item.formula_id in mapping) {
            mapping[item.formula_id].num_packages += item.num_packages;
          } else {
            mapping[item.formula_id] = item;
          }
        });
        this.setState({
          inventories: Object.values(mapping),
        });
      })
      .catch(err => {
        this.setState({
          open: true,
          message: 'Error getting inventory items',
        });
      });
  }

  cancelSale() {
    this.setState({
      open: true,
      message: 'Sale Cancelled',
    });
  }
  
  render() {
    const columnClass = 'HalfWidth';
    const main =
      <div>
        <Snackbar
          open={this.state.open}
          message={this.state.message}
          autoHideDuration={2500}
          onRequestClose={this.handleRequestClose.bind(this)}
        />
        <h2>Product Inventory</h2>
        <div className="btn-group" role="group" aria-label="Basic example">
          {
            global.user_group !== 'noob' &&
            <button
              type='button'
              className='btn btn-primary'
              onClick={this.newSale}
            >
              New Sale
            </button>
          }
          <button
            type='button'
            className='btn btn-secondary'
            onClick={this.viewSales}
          >
            Sales
          </button>
        </div>
        <table className='table'>
          <thead>
            <tr>
              <th className={columnClass}>Name</th>
              <th className={columnClass}>Number of Products</th>
            </tr>
          </thead>
          <tbody>
            {
              this.state.inventories.map((inventory, idx) => {
                return (
                  <tr key={idx}>
                    <td className={columnClass}>{inventory.name}</td>
                    <td className={columnClass}>{inventory.num_packages}</td>
                  </tr>
                );
              })
            }
          </tbody>
        </table>
      </div>;
    
    const newSale = <AddSale back={this.back} inventories={this.state.inventories} cancelSale={this.cancelSale} />;

    const sales = <Sales back={this.back} />;

    if (this.state.newSale) {
      return newSale;
    }
    else if (this.state.viewSales) {
      return sales;
    }
    else {
      return main;
    }
  }
}

export default ProductInventory;
