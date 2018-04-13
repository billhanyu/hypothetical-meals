import React, { Component } from 'react';
import axios from 'axios';
import Snackbar from 'material-ui/Snackbar';
import AddSale from './AddSale';

class ProductInventory extends Component {
  constructor(props) {
    super(props);
    this.state = {
      inventories: [],
      open: false,
      message: '',
      newSale: false,
    };
    this.newSale = this.newSale.bind(this);
    this.back = this.back.bind(this);
    this.cancelSale = this.cancelSale.bind(this);
  }

  handleRequestClose() {
    this.setState({
      open: false,
    });
  }

  back() {
    this.setState({
      newSale: false,
    });
  }

  newSale() {
    this.setState({
      newSale: true,
    });
  }

  componentWillMount() {
    this.reloadData();    
  }

  reloadData() {
    const inventories = [
      {
        formula_id: 1,
        formula_name: 'cake',
        num_packages: 10,
      },
      {
        formula_id: 2,
        formula_name: 'shit',
        num_packages: 20,
      },
    ];
    axios.get('/finalproductinventories', {
      headers: {Authorization: 'Token ' + global.token}
    })
      .then(response => {
        this.setState({
          inventories,
        });
      })
      .catch(err => {
        this.setState({
          open: true,
          message: 'Error getting inventory items',
        });
      });
    this.setState({
      inventories,
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
        <table className='table'>
          <thead>
            <tr>
              <th className={columnClass}>Name</th>
              <th className={columnClass}>Number of Packages</th>
            </tr>
          </thead>
          <tbody>
            {
              this.state.inventories.map((inventory, idx) => {
                return (
                  <tr key={idx}>
                    <td className={columnClass}>{inventory.formula_name}</td>
                    <td className={columnClass}>{inventory.num_packages}</td>
                  </tr>
                );
              })
            }
          </tbody>
        </table>
      </div>;
    
    const sales = <AddSale back={this.back} inventories={this.state.inventories} cancelSale={this.cancelSale} />;

    return this.state.newSale ? sales : main;
  }
}

export default ProductInventory;
