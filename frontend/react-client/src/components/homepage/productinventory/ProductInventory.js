import React, { Component } from 'react';
import axios from 'axios';
import Snackbar from 'material-ui/Snackbar';
import Sales from './Sales';

class ProductInventory extends Component {
  constructor(props) {
    super(props);
    this.state = {
      inventories: [],
      open: false,
      message: '',
      showSales: false,
    };
    this.showSales = this.showSales.bind(this);
    this.back = this.back.bind(this);
  }

  handleRequestClose() {
    this.setState({
      open: false,
    });
  }

  back() {
    this.setState({
      showSales: false,
    });
  }

  showSales() {
    this.setState({
      showSales: true,
    });
  }

  componentWillMount() {
    this.reloadData();    
  }

  reloadData() {
    const inventories = [
      {
        formula_name: 'fuck',
        num_packages: 10,
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
  
  render() {
    const main =
      <div>
        <Snackbar
          open={this.state.open}
          message={this.state.message}
          autoHideDuration={2500}
          onRequestClose={this.handleRequestClose.bind(this)}
        />
        <h2>Product Inventory</h2>
        <button
          type='button'
          className='btn btn-primary'
          onClick={this.showSales}
        >
          Sale Requests
        </button>
        <table className='table'>
          <thead>
            <tr>
              <th>Name</th>
              <th>Number of Packages</th>
            </tr>
          </thead>
          <tbody>
            {
              this.state.inventories.map((inventory, idx) => {
                return (
                  <tr key={idx}>
                    <td>{inventory.formula_name}</td>
                    <td>{inventory.num_packages}</td>
                  </tr>
                );
              })
            }
          </tbody>
        </table>
      </div>;
    
    const sales = <Sales back={this.back} />;

    return this.state.showSales ? sales : main;
  }
}

export default ProductInventory;
