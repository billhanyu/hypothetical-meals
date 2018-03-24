import React, { Component } from 'react';
import PropTypes from 'prop-types';

class QuantityByLotTableItem extends Component {
  render() {
    const { lot, vendor, quantity } = this.props.lot;
    const { native_unit } = this.props.ingredient;
    const columnClass = this.props.columnClass;
    return (
      <tr>
        <td className={columnClass}>{lot}</td>
        <td className={columnClass}>{vendor}</td>
        <td className={columnClass}>{
          this.props.editIdx == this.props.idx
            ?
            <input type="number" style={{ 'width': '100px' }} onChange={this.props.changeQuantity} value={this.props.editQuantity} />
            :
            `${quantity.toFixed(2)}  ${native_unit}`
        }</td>
        {
          global.user_group == 'admin' && this.props.editIdx !== this.props.idx &&
          <td className={columnClass}>
            <button
              type="button"
              className="btn btn-secondary no-collapse"
              onClick={e => this.props.edit(this.props.idx)}>
              Edit
              </button>
          </td>
        }
        {
          global.user_group == 'admin' && this.props.editIdx == this.props.idx &&
          <td className={columnClass}>
            <div className="btn-group" role="group" aria-label="Basic example">
              <button
                type="button"
                className="btn btn-secondary no-collapse"
                onClick={this.props.cancelEdit}>
                Cancel
                </button>
              <button
                type="button"
                className="btn btn-primary no-collapse"
                onClick={this.props.finishEdit}>
                Confirm
                </button>
            </div>
          </td>
        }
      </tr>
    );
  }
}

QuantityByLotTableItem.propTypes = {
  lot: PropTypes.shape({
    lot: PropTypes.string.isRequired,
    vendor: PropTypes.string.isRequired,
    quantity: PropTypes.number.isRequired,
  }),
  ingredient: PropTypes.shape({
    native_unit: PropTypes.string.isRequired,
  }),
  columnClass: PropTypes.string.isRequired,
  idx: PropTypes.number.isRequired,
  editIdx: PropTypes.number.isRequired,
  cancelEdit: PropTypes.func,
  finishEdit: PropTypes.func,
  changeQuantity: PropTypes.func,
  editQuantity: PropTypes.number,
  edit: PropTypes.func,
};

export default QuantityByLotTableItem;
