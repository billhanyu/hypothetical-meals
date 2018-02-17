import React, { Component } from 'react';

class InventoryItem extends Component {
  constructor(props) {
    super(props);
    this.selectSelf = this.selectSelf.bind(this);
  }

  selectSelf() {
    this.props.selectInventoryItem(Object.assign(this.props.item));
  }

  render() {
    const cssClassName = this.props.mode == "view" ? "" : "InventoryRowCart";
    return (
      <tr className={cssClassName} onClick={this.selectSelf}>
        <td>{this.props.item.ingredient_name}</td>
        <td>{this.props.item.ingredient_temperature_state}</td>
        <td>{this.props.item.ingredient_package_type}</td>
        <td>{
          this.props.editIdx == this.props.idx
            ?
            <input type="number" onChange={this.props.changeQuantity} value={this.props.editQuantity} />
            :
            this.props.item.num_packages
        }</td>
        {
          global.user_group == 'admin' && this.props.editIdx !== this.props.idx &&
          <td>
            <button
              type="button"
              className="btn btn-secondary"
              onClick={e => this.props.edit(this.props.idx)}>
              Edit
            </button>
          </td>
        }
        {
          global.user_group == 'admin' && this.props.editIdx == this.props.idx &&
          <td>
            <div className="btn-group" role="group" aria-label="Basic example">
              <button
                type="button"
                className="btn btn-secondary"
                onClick={this.props.cancelEdit}>
                Cancel
              </button>
              <button
                type="button"
                className="btn btn-primary"
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

export default InventoryItem;
