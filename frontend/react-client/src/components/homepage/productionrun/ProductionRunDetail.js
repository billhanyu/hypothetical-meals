import React, { Component } from 'react';
import PropTypes from 'prop-types';
import ProductionRunIngredientTable from './ProductionRunIngredientTable';

class ProductionRunDetail extends Component {
  render() {
    const { name, created_at, username } = this.props.run;
    return (
      <div>
        <h3>Production: {name}</h3>
        <table>
          <thead>
            <th>Time</th>
            <th>Product Name</th>
            <th>User</th>
          </thead>
          <tbody>
            <tr>
              <td>{(new Date(created_at)).toString().split(' GMT')[0]}</td>
              <td>{name}</td>
              <td>{username}</td>
            </tr>
          </tbody>
        </table>
        <ProductionRunIngredientTable ingredients={this.props.run.ingredients} />
      </div>
    );
  }
}

ProductionRunDetail.propTypes = {
  run: PropTypes.shape({
    name: PropTypes.string,
    created_at: PropTypes.string,
    username: PropTypes.string,
    ingredients: PropTypes.array,
  }),
};

export default ProductionRunDetail;
