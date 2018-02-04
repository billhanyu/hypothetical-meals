import React, { Component } from 'react';

class InventoryListItem extends Component {
  constructor(props){
    super(props);
    this._handleClick = this._handleClick.bind(this);
  }

  /*** REQUIRED PROPS
    1. id (Number)
    2. ingredient_name (String)
    3. package_type (String)
    4. num_packages (Number)
  */
  _handleClick() {
    this.props.onClick(this.props);
  }

  _capitalize(inputString) {
    return inputString.charAt(0).toUpperCase() + inputString.slice(1).toLowerCase();
  }

  render() {
    return (
      <div className="VendorContainer" onClick={this._handleClick}>
        <div className="Vendor"> {this.props.ingredient_name} - {this._capitalize(this.props.package_type)} - {this.props.num_packages}</div>
      </div>
    );
  }
}

export default InventoryListItem;
