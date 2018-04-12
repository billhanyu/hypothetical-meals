import React, { Component } from 'react';
import PropTypes from 'prop-types';

class OrderListItem extends Component {
  render() {
    const { ingredient, vendor, created_at, num_packages, arrived } = this.props.order;
    const columnClass = this.props.columnClass;
    return (
      <tr>
        <td className={columnClass}>{(new Date(created_at)).toString().split(' GMT')[0]}</td>
        <td className={columnClass}>{ingredient.name}</td>
        <td className={columnClass}>{vendor.name}</td>
        <td className={columnClass}>{num_packages}</td>
        <td className={columnClass}>
          {
            arrived
            ?
            <span style={{color: 'green'}}>Arrived</span>
            :
            <div>
              <span style={{ color: 'blue' }}>Pending</span>
              {
                global.user_group !== 'noob' &&
                <button
                  type='button'
                  className='btn btn-primary'
                  style={{'margin-left': '10px'}}
                  onClick={e => this.props.markArrived(this.props.order)}
                >
                  Mark Arrived
                </button>
              }
            </div>
          }
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
