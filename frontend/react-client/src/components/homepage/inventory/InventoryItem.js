import React, { Component } from 'react';
import PropTypes from 'prop-types';
import QuantityByLotTable from '../ingredient/onclickdetails/QuantityByLotTable';

let noCollapseButton = false;

class InventoryItem extends Component {
  constructor(props) {
    super(props);
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

  render() {
    const {num_packages, ingredient_num_native_units, ingredient_name, ingredient_temperature_state, ingredient_package_type, ingredient_native_unit}
      = this.props.item;
    const rawQuantity = num_packages * ingredient_num_native_units;
    const quantity = rawQuantity.toFixed(2);
    const columnClass = global.user_group == "admin" ? "OneFifthWidth" : "OneFourthWidth";
    return (
      <tbody>
        <tr data-toggle="collapse" data-target={`#inventory_${this.props.idx}`} className="accordion-toggle tablerow-hover">
          <td className={columnClass}>{ingredient_name}</td>
          <td className={columnClass}>{ingredient_temperature_state}</td>
          <td className={columnClass}>{ingredient_package_type}</td>
          <td className={columnClass}>{
            this.props.editIdx == this.props.idx
              ?
              <input type="number" onChange={this.props.changeQuantity} value={this.props.editQuantity} />
              :
              `${quantity}  ${ingredient_native_unit}`
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
        <tr>
          <td colSpan={1} className="hiddenRow"></td>
          <td colSpan={3} className="hiddenRow">
            <div id={`inventory_${this.props.idx}`} className="accordian-body collapse">
              <QuantityByLotTable
                ingredient={{id: this.props.item.ingredient_id, native_unit: ingredient_native_unit}}
              />
            </div>
          </td>
          {global.user_group == "admin" && <td colSpan={1} className="hiddenRow"></td>}
        </tr>
      </tbody>
    );
  }
}

InventoryItem.propTypes = {
  item: PropTypes.shape({
    ingredient_id: PropTypes.number,
    num_packages: PropTypes.number,
    ingredient_num_native_units: PropTypes.number,
    ingredient_name: PropTypes.string,
    ingredient_temperature_state: PropTypes.string,
    ingredient_package_type: PropTypes.string,
    ingredient_native_unit: PropTypes.string,
  }),
  mode: PropTypes.string,
  editIdx: PropTypes.number,
  idx: PropTypes.number,
  cancelEdit: PropTypes.func,
  finishEdit: PropTypes.func,
  changeQuantity: PropTypes.func,
  editQuantity: PropTypes.func,
  edit: PropTypes.func,
};

export default InventoryItem;
