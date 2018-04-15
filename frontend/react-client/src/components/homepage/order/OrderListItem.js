import React, { Component } from 'react';
import PropTypes from 'prop-types';

class OrderListItem extends Component {
  render() {
    const { ingredient_name, vendor_name, order_start_time, num_packages } = this.props.order;
    const columnClass = this.props.columnClass;
    return (
      <tr>
        <td className={columnClass}>{(new Date(order_start_time)).toString().split(' GMT')[0]}</td>
        <td className={columnClass}>{ingredient_name}</td>
        <td className={columnClass}>{vendor_name}</td>
        <td className={columnClass}>{num_packages}</td>
        <td className={columnClass}>
          <button
            type='button'
            className='btn btn-primary'
            onClick={e => this.props.markArrived(this.props.order)}
          >
            Mark Arrived
          </button>
        </td>
      </tr>
    );
  }
}

OrderListItem.propTypes = {
  order: PropTypes.object,
  columnClass: PropTypes.string,
  markArrived: PropTypes.func,
};

export default OrderListItem;
