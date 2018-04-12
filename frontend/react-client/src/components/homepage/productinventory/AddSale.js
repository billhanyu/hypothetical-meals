import React, { Component } from 'react';
import ProductInventorySelector from './ProductInventorySelector';
import axios from 'axios';
import Snackbar from 'material-ui/Snackbar';
import PropTypes from 'prop-types';

class AddSale extends Component {
  constructor(props) {
    super(props);
    this.state = {
      formulas: [], // 
      formulaToAdd: '',
      open: false,
      message: '',
    };
    this.changeFormulaId = this.changeFormulaId.bind(this);
    this.addFormula = this.addFormula.bind(this);
    this.removeFormula = this.removeFormula.bind(this);
    this.changeQuantity = this.changeQuantity.bind(this);
    this.addSale = this.addSale.bind(this);
  }

  changeFormulaId(id) {
    this.setState({
      formulaToAdd: id,
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
    // REQUEST
  }
  
  render() {
    return (
      <div>
        <h2>New Sale Request</h2>
        <button type='button' className="btn btn-secondary" onClick={this.props.back}>Back</button>
        <div className="row justify-content-md-center">
          <form className="col-xl-6 col-lg-6 col-sm-8">
            <div className="form-group">
              <ProductInventorySelector changeFormulaId={this.changeFormulaId} existing={this.state.formulas} />
            </div>
            <button type="submit" className="btn btn-primary" onClick={this.addFormula}>Add</button>
          </form>
        </div>
        <Snackbar
          open={this.state.open}
          message={this.state.message}
          autoHideDuration={2500}
          onRequestClose={this.handleRequestClose.bind(this)}
        />
        <div className="row justify-content-md-center" style={{ 'margin-top': '30px' }}>
          <table className='table col-xl-6 col-lg-6 col-sm-8'>
            <thead>
              <tr>
                <th>Product</th>
                <th>Number to Sell</th>
                {
                  global.user_group !== 'noob' &&
                  <th>Options</th>
                }
              </tr>
            </thead>
            <tbody>
              {
                this.state.formulas.map((formula, idx) => {
                  return (
                    <tr key={idx}>
                      <td>{formula.name}</td>
                      <td>
                        <input
                          type='number'
                          value={formula.quantity}
                          onChange={e=>this.changeQuantity(e, formula.id)}
                        />
                      </td>
                      <td onClick={e => this.removeFormula(formula.id)} style={{ cursor: 'pointer' }}>
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
      </div>
    );
  }
}

AddSale.propTypes = {
  back: PropTypes.func,
};

export default AddSale;
