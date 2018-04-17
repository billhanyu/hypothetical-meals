import React, { Component } from 'react';
import ProductInventorySelector from './ProductInventorySelector';
import axios from 'axios';
import Snackbar from 'material-ui/Snackbar';
import PropTypes from 'prop-types';

class AddSale extends Component {
  constructor(props) {
    super(props);
    this.state = {
      formulas: [],
      formulaToAdd: '',
      open: false,
      message: '',
      showSummary: false,
    };
    this.changeFormulaId = this.changeFormulaId.bind(this);
    this.addFormula = this.addFormula.bind(this);
    this.removeFormula = this.removeFormula.bind(this);
    this.changeQuantity = this.changeQuantity.bind(this);
    this.changePrice = this.changePrice.bind(this);
    this.addSale = this.addSale.bind(this);
    this.confirmSale = this.confirmSale.bind(this);
    this.cancelSale = this.cancelSale.bind(this);
  }

  changeFormulaId(id) {
    this.setState({
      formulaToAdd: id,
    });
  }

  changePrice(e, id) {
    const price = e.target.value;
    const formulas = this.state.formulas.slice();
    const formula = formulas.find(el => el.id == id);
    formula.price = price;
    this.setState({
      formulas,
    });
  }

  changeQuantity(e, id) {
    const quantity = e.target.value;
    const formulas = this.state.formulas.slice();
    const formula = formulas.find(el => el.id == id);
    formula.quantity = quantity;
    this.setState({
      formulas,
    });
  }

  addFormula(e) {
    e.preventDefault();
    if (!this.state.formulaToAdd) {
      this.setState({
        open: true,
        message: 'Please select a product to add',
      });
      return;
    }
    axios.get(`/formulas/id/${this.state.formulaToAdd}`, {
      headers: { Authorization: "Token " + global.token }
    })
      .then(response => {
        const formula = response.data[0];
        const formulas = this.state.formulas.slice();
        formula.quantity = 0;
        formula.price = 0;
        formulas.push(formula);
        this.setState({
          formulas,
        });
      })
      .catch(err => {
        this.setState({
          open: true,
          message: 'Error retrieving formula data',
        });
      });
  }

  removeFormula(id) {
    const formulas = this.state.formulas.filter(formula => formula.id !== id);
    this.setState({
      formulas,
    });
  }

  handleRequestClose() {
    this.setState({
      open: false,
    });
  }

  addSale() {
    let valid = true;
    let message = '';
    if (this.state.formulas.length == 0) {
      valid = false;
      message = 'You didn\'t request anything!';
    }
    this.state.formulas.every(formula => {
      // should also check for stock
      if (formula.quantity <= 0) {
        valid = false;
        message = `${formula.name} has selling quantity <= 0`;
        return false;
      }
      if (formula.price < 0) {
        valid = false;
        message = `${formula.name} has selling price < 0`;
        return false;
      }
      const stockQuantity = this.props.inventories
        .filter(inventory => inventory.formula_id == formula.id)
        .reduce((val, inventory) => val + inventory.num_packages, 0);
      if (formula.quantity > stockQuantity) {
        valid = false;
        message = `Requesting ${formula.quantity} for ${formula.name} while only ${stockQuantity} in stock`;
        return false;
      }
    });
    if (!valid) {
      this.setState({
        open: true,
        message,
      });
      return;
    }
    this.setState({
      showSummary: true,
    });
  }

  confirmSale() {
    const products = this.state.formulas.map(formula => {
      return {
        formula_id: formula.id,
        num_packages: formula.quantity,
        sell_price_per_product: formula.price,
      };
    });
    axios.post('/sales', {
      products,
    }, {
      headers: {Authorization: 'Token ' + global.token}
    })
      .then(response => {
        this.props.back('Sale Confirmed!');
      })
      .catch(err => {
        this.setState({
          open: true,
          message: err.response.data,
        });
      });
  }

  cancelSale() {
    this.setState({
      formulas: [],
    }, () => {
      this.props.back();
      this.props.cancelSale();
    });
  }
  
  render() {
    const columnClass = 'OneFourthWidth';
    const main =
      <div>
        <h2>New Sale Request</h2>
        <button type='button' className="btn btn-secondary" onClick={this.props.back}>Back</button>
        <div className="row justify-content-md-center">
          <form className="col-md-8">
            <div className='row'>
              <div className="col-md-10">
                <ProductInventorySelector changeFormulaId={this.changeFormulaId} existing={this.state.formulas} />
              </div>
              <button type="submit" className="btn btn-primary col-md-2" onClick={this.addFormula}>Add</button>
            </div>
          </form>
        </div>
        <Snackbar
          open={this.state.open}
          message={this.state.message}
          autoHideDuration={2500}
          onRequestClose={this.handleRequestClose.bind(this)}
        />
        <div className="row justify-content-md-center" style={{ 'margin-top': '30px' }}>
          <table className='table col-md-8'>
            <thead>
              <tr>
                <th className={columnClass}>Product</th>
                <th className={columnClass}>Number to Sell</th>
                <th className={columnClass}>Unit Price</th>
                {
                  global.user_group !== 'noob' &&
                  <th className={columnClass}>Options</th>
                }
              </tr>
            </thead>
            <tbody>
              {
                this.state.formulas.map((formula, idx) => {
                  return (
                    <tr key={idx}>
                      <td className={columnClass}>{formula.name}</td>
                      <td className={columnClass}>
                        <input
                          type='number'
                          value={formula.quantity}
                          onChange={e=>this.changeQuantity(e, formula.id)}
                        />
                      </td>
                      <td className={columnClass}>
                        <input
                          type='number'
                          value={formula.price}
                          onChange={e => this.changePrice(e, formula.id)}
                        />
                      </td>
                      <td onClick={e => this.removeFormula(formula.id)} style={{ cursor: 'pointer' }} className={columnClass}>
                        <i className="fas fa-trash"></i>
                      </td>
                    </tr>
                  );
                })
              }
            </tbody>
          </table>
        </div>
        <div className="row justify-content-md-center" style={{ 'margin-top': '20px' }}>
          <button type='button' className="btn btn-primary" onClick={this.addSale}>Submit</button>
        </div>
      </div>;

    const totalRevenue = this.state.formulas.reduce((val, formula) => val + formula.price * formula.quantity, 0);
    
    const summary =
      <div>
        <h2>Sale Summary</h2>
        <p>Total Revenue: ${totalRevenue}</p>
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
              <th className={columnClass}>Number to Sell</th>
              <th className={columnClass}>Unit Price</th>
              <th className={columnClass}>Subtotal</th>
            </tr>
          </thead>
          <tbody>
            {
              this.state.formulas.map((formula, idx) => {
                return (
                  <tr key={idx}>
                    <td className={columnClass}>{formula.name}</td>
                    <td className={columnClass}>{formula.quantity}</td>
                    <td className={columnClass}>{formula.price}</td>
                    <td className={columnClass}>${formula.price * formula.quantity}</td>
                  </tr>
                );
              })
            }
          </tbody>
        </table>
        <div className="btn-group" role="group" aria-label="Basic example">
          <button
            type="button"
            className="btn btn-secondary"
            data-toggle="modal"
            data-target="#cancelSaleModal">
            Cancel
          </button>
          <button
            type="button"
            className="btn btn-primary"
            onClick={this.confirmSale}>
            Confirm
          </button>
        </div>
        <div className="modal fade" id="cancelSaleModal" tabIndex="-1" role="dialog" aria-labelledby="exampleModalLabel" aria-hidden="true">
          <div className="modal-dialog" role="document">
            <div className="modal-content">
              <div className="modal-header">
                <h5 className="modal-title" id="exampleModalLabel">Confirm Cancel</h5>
                <button type="button" className="close" data-dismiss="modal" aria-label="Close">
                  <span aria-hidden="true">&times;</span>
                </button>
              </div>
              <div className="modal-body">
                Are you sure you want to cancel this sale request?
              </div>
              <div className="modal-footer">
                <button type="button" className="btn btn-secondary" data-dismiss="modal">Back</button>
                <button type="button" className="btn btn-danger" data-dismiss="modal" onClick={this.cancelSale}>Yes Cancel</button>
              </div>
            </div>
          </div>
        </div>
      </div>;

    return this.state.showSummary ? summary : main;
  }
}

AddSale.propTypes = {
  back: PropTypes.func,
  inventories: PropTypes.array,
  cancelSale: PropTypes.func,
};

export default AddSale;
