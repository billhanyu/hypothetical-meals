import React, { Component } from 'react';
import Storage2State from '../../Constants/Storage2State';
import axios from 'axios';

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
  }
  
  render() {
    const ingredient = this.props.ingredient;
    return (
      <tbody>
        <tr data-toggle="collapse" data-target={`#vendoringredient_${this.props.idx}`} className="accordion-toggle tablerow-hover">
        <td>{ingredient.id}</td>
        <td>{ingredient.name}</td>
        <td>{ingredient.package_type}</td>
        <td>{Storage2State[ingredient.storage_name]}</td>
        <td>{ingredient.num_native_units+" "+ingredient.native_unit}</td>
        {
          global.user_group == 'admin' && !this.props.order &&
          <td>
            <div className="btn-group" role="group" aria-label="Basic example">
              <button
                type="button"
                className="btn btn-secondary"
                onClick={e => this.props.edit(this.props.idx)}>
                Edit
              </button>
              <button
                type="button"
                className="btn btn-danger"
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
              className="btn btn-primary"
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
            <table className="table">
            <tr>
              <th>Sold By</th>
              <th>Price</th>
            </tr>
            {
              this.state.vendoringredients.map((vendoringredient, idx) => {
                return (
                  <tr key={idx}>
                    <td>{vendoringredient.vendor_name}</td>
                    <td>{vendoringredient.price}</td>
                  </tr>
                );
              })
            }
            </table>
          </div>
        </td>
        {global.user_group == "admin" && <td colSpan={1} className="hiddenRow"></td>}
      </tr>
      </tbody>
    );
  }
}

export default IngredientListItem;
