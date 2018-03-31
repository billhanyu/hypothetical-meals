import React, { Component } from 'react';
import Storage2State from '../../Constants/Storage2State';
import axios from 'axios';
import VendorIngredientsTable from './onclickdetails/VendorIngredientsTable';
import QuantityByLotTable from './onclickdetails/QuantityByLotTable';
import Snackbar from 'material-ui/Snackbar';
import PropTypes from 'prop-types';

let noCollapseButton = false;

class IngredientListItem extends Component {
  constructor(props) {
    super(props);
    this.state = {
      vendoringredients: [],
      ordering: false,
      quantity: '',
      open: false,
      message: '',
    };
    this.startOrder = this.startOrder.bind(this);
    this.cancel = this.cancel.bind(this);
    this.confirmOrder = this.confirmOrder.bind(this);
    this.changeQuantity = this.changeQuantity.bind(this);
  }

  startOrder() {
    this.setState({
      ordering: true,
    });
  }

  cancel() {
    this.setState({
      ordering: false,
      quantity: '',
    });
  }

  confirmOrder() {
    if (this.state.quantity.isNaN || this.state.quantity < 0) {
      alert('Invalid quantity!');
      return;
    }
    this.props.orderIngredient(this.props.idx, this.state.quantity);
    this.cancel();
  }

  changeQuantity(e) {
    this.setState({
      quantity: e.target.value,
    });
  }

  componentDidMount() {
    axios.get(`/vendoringredients/${this.props.ingredient.id}`, {
      headers: { Authorization: "Token " + global.token }
    })
    .then(response => {
      this.setState({
        vendoringredients: response.data,
      });
    })
    .catch(err => {
      this.setState({
        open: true,
        message: 'Error getting product info for ingredient',
      });
    });
  }

  componentDidUpdate() {
    $('.collapse').unbind().on('show.bs.collapse', function (e) {
      if (noCollapseButton) {
        e.preventDefault();
        noCollapseButton = false;
      }
    });
    $('.no-collapse').unbind().on('click', function (e) {
      noCollapseButton = true;
    });
  }

  handleRequestClose() {
    this.setState({
      open: false,
    });
  }

  render() {
    const ingredient = this.props.ingredient;
    const columnClass = this.props.columnClass;
    return (
      <tbody>
        <Snackbar
          open={this.state.open}
          message={this.state.message}
          autoHideDuration={2500}
          onRequestClose={this.handleRequestClose.bind(this)}
        />
        <tr data-toggle="collapse" data-target={`#vendoringredient_${this.props.idx}`} className="accordion-toggle tablerow-hover">
        <td className={columnClass}>
          <a href="javascript:void(0)" onClick={e=>this.props.viewIngredient(this.props.idx)}>{ingredient.name}</a>
          {
            ingredient.intermediate == 1 &&
            <span style={{ 'margin-left': '10px' }} className="badge badge-secondary">Intermediate</span>
          }
        </td>
        <td className={columnClass}>{ingredient.package_type}</td>
        <td className={columnClass}>{Storage2State[ingredient.storage_name]}</td>
        <td className={columnClass}>{ingredient.num_native_units+" "+ingredient.native_unit}</td>
        {
          global.user_group == 'admin' && !this.props.order &&
          <td className={columnClass}>
            <div className="btn-group" role="group" aria-label="Basic example">
              <button
                type="button"
                className="btn btn-secondary no-collapse"
                onClick={e => this.props.edit(this.props.idx)}>
                Edit
              </button>
              <button
                type="button"
                className="btn btn-danger no-collapse"
                onClick={e=>this.props.delete(this.props.idx)}
                data-toggle="modal"
                data-target="#deleteIngredientModal">
                Delete
              </button>
            </div>
          </td>
        }
        {
          this.props.order && !this.state.ordering &&
          <td className={columnClass}>
            <button
              type="button"
              className="btn btn-primary no-collapse"
              onClick={this.startOrder}>
              Add To Cart
            </button>
          </td>
        }
        {
          this.props.order && this.state.ordering &&
          <td className={columnClass}>
            <input type='number' value={this.state.quantity} onChange={this.changeQuantity} />
            <div className="btn-group" role="group" aria-label="Basic example">
              <button
                type="button"
                className="btn btn-secondary no-collapse"
                onClick={this.cancel}>
                Cancel
              </button>
              <button
                type="button"
                className="btn btn-primary no-collapse"
                onClick={this.confirmOrder}>
                Confirm
              </button>
            </div>
          </td>
        }
      </tr>
      <tr>
        <td colSpan={1} className="hiddenRow"></td>
        <td colSpan={3} className="hiddenRow">
          <div id={`vendoringredient_${this.props.idx}`} className="accordian-body collapse">
            {
              ingredient.intermediate !== 1 &&
              <VendorIngredientsTable vendoringredients={this.state.vendoringredients} />
            }
            <div style={{'height': '20px'}} />
            {!this.props.order &&
              <QuantityByLotTable ingredient={this.props.ingredient} />
            }
          </div>
        </td>
        {global.user_group == "admin" && <td colSpan={1} className="hiddenRow"></td>}
      </tr>
      </tbody>
    );
  }
}

IngredientListItem.propTypes = {
  orderIngredient: PropTypes.func,
  ingredient: PropTypes.shape({
    id: PropTypes.number.isRequired,
  }).isRequired,
  columnClass: PropTypes.string,
  idx: PropTypes.number.isRequired,
  viewIngredient: PropTypes.func,
  order: PropTypes.bool,
  edit: PropTypes.func,
  delete: PropTypes.func,
};

export default IngredientListItem;
