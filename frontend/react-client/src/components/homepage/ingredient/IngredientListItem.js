import React, { Component } from 'react';
import Storage2State from '../../Constants/Storage2State';
import axios from 'axios';
import VendorIngredientsTable from './onclickdetails/VendorIngredientsTable';
import QuantityByLotTable from './onclickdetails/QuantityByLotTable';

let noCollapseButton = false;

class IngredientListItem extends Component {
  constructor(props) {
    super(props);
    this.state = {
      vendoringredients: [],
    };
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
      console.log(err);
      alert('Error getting product info for ingredient');
    });
    $('.collapse').on('show.bs.collapse', function (e) {
      if (noCollapseButton) {
        e.preventDefault();
        noCollapseButton = false;
      }
    });
    $('.no-collapse').on('click', function (e) {
      noCollapseButton = true;
    });
  }
  
  render() {
    const ingredient = this.props.ingredient;
    return (
      <tbody>
        <tr data-toggle="collapse" data-target={`#vendoringredient_${this.props.idx}`} className="accordion-toggle tablerow-hover">
        <td>{ingredient.id}</td>
        <td><a href="javascript:void(0)" onClick={e=>this.props.viewIngredient(this.props.idx)}>{ingredient.name}</a></td>
        <td>{ingredient.package_type}</td>
        <td>{Storage2State[ingredient.storage_name]}</td>
        <td>{ingredient.num_native_units+" "+ingredient.native_unit}</td>
        {
          global.user_group == 'admin' && !this.props.order &&
          <td>
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
          this.props.order &&
            <td>
            <button
              type="button"
              className="btn btn-primary no-collapse"
              onClick={e => {this.props.orderIngredient(this.props.idx);}}>
              Add To Cart
            </button>
            </td>
        }
      </tr>
      <tr>
        <td colSpan={2} className="hiddenRow"></td>
        <td colSpan={3} className="hiddenRow">
          <div id={`vendoringredient_${this.props.idx}`} className="accordian-body collapse">
            <VendorIngredientsTable vendoringredients={this.state.vendoringredients} />
            <div style={{'height': '20px'}} />
            <QuantityByLotTable ingredient={this.props.ingredient} />
          </div>
        </td>
        {global.user_group == "admin" && <td colSpan={1} className="hiddenRow"></td>}
      </tr>
      </tbody>
    );
  }
}

export default IngredientListItem;
