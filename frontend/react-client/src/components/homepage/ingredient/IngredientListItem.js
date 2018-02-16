import React, { Component } from 'react';

class IngredientListItem extends Component {
  render() {
    const ingredient = this.props.ingredient;
    return (
      <tr>
        <td>{ingredient.id}</td>
        <td>{ingredient.name}</td>
        <td>{ingredient.package_type}</td>
        <td>{ingredient.storage_name}</td>
        <td>{ingredient.native_unit}</td>
        {
          global.user_group == 'admin' &&
          <td>
            <button type="button" className="btn btn-danger" onClick={this.props.delete}>Delete</button>
          </td>
        }
      </tr>
    );
  }
}

export default IngredientListItem;
