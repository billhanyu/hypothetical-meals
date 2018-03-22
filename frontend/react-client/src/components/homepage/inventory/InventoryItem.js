import React, { Component } from 'react';
import PropTypes from 'prop-types';
import QuantityByLotTable from '../ingredient/onclickdetails/QuantityByLotTable';
import packageSpaceMap from '../../Constants/PackageSpaceMap';

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
    const columnClass = global.user_group == "admin" ? "OneSixthWidth" : "OneFifthWidth";
    return (
      <tbody>
        <tr data-toggle="collapse" data-target={`#inventory_${this.props.idx}`} className="accordion-toggle tablerow-hover">
          <td className={columnClass}><a href="javascript:void(0)" onClick={e=>this.props.viewIngredient(this.props.idx)}>{ingredient_name}</a></td>
          <td className={columnClass}>{ingredient_temperature_state}</td>
          <td className={columnClass}>{ingredient_package_type}</td>
          <td className={columnClass}>{quantity} {ingredient_native_unit}</td>
          <td className={columnClass}>{(packageSpaceMap[ingredient_package_type] * num_packages).toFixed(1) + ' sqft'}</td>
        </tr>
        <tr>
          <td colSpan={1} className="hiddenRow"></td>
          <td colSpan={3} className="hiddenRow">
            <div id={`inventory_${this.props.idx}`} className="accordian-body collapse">
              <QuantityByLotTable
                ingredient={{
                  id: this.props.item.ingredient_id,
                  native_unit: ingredient_native_unit,
                  num_native_units: ingredient_num_native_units,
                }}
                refreshInventories={this.props.reloadData}
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
  viewIngredient: PropTypes.func.isRequired,
  mode: PropTypes.string,
  idx: PropTypes.number.isRequired,
  reloadData: PropTypes.func,
};

export default InventoryItem;
