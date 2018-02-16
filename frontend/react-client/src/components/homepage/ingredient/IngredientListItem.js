import React, { Component } from 'react';
import Storage2State from '../../Constants/Storage2State';

class IngredientListItem extends Component {
  constructor(props) {
    super(props);
  }
  
  render() {
    const ingredient = this.props.ingredient;
    return (
      <tr>
        <td>{ingredient.id}</td>
        <td>{ingredient.name}</td>
        <td>{ingredient.package_type}</td>
        <td>{Storage2State[ingredient.storage_name]}</td>
        <td>{ingredient.native_unit}</td>
        {
          global.user_group == 'admin' &&
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
      </tr>
    );
  }
}

export default IngredientListItem;
