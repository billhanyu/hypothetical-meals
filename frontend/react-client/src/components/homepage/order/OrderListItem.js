import React, { Component } from 'react';
import PropTypes from 'prop-types';

class OrderListItem extends Component {
  render() {
    const { ingredient, created_at, num_packages, arrived } = this.props.order;
    return (
      <tr>
        <td>{(new Date(created_at)).toString().split(' GMT')[0]}</td>
        <td>{ingredient.name}</td>
        <td>{num_packages}</td>
        <td>
          {
            arrived
            ?
            <span style={{color: 'green'}}>Arrived</span>
            :
            <span style={{ color: 'blue' }}>Pending</span>
          }
        </td>
      </tr>
    );
  }
}

OrderListItem.propTypes = {
  order: PropTypes.object,
};

export default OrderListItem;
