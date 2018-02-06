import React, { Component } from 'react';

class VendorListItem extends Component {
  constructor(props){
    super(props);
    this._handleClick = this._handleClick.bind(this);
  }

  /*** REQUIRED PROPS
    1. ingredient_id (Number)
    2. ingredient_name (String)
    3. ingredient_storage_id (Number)
    4. ingredient_package_type (String)
    5. ingredient_price (Number)
    6. vendor_ingredient_id (Number)
  */
  _handleClick() {
    this.props.onClick(this.props);
  }

  _capitalize(inputString) {
    return inputString.charAt(0).toUpperCase() + inputString.slice(1).toLowerCase();
  }

  getStorageType(inputStorageID) {
    if(inputStorageID == 1){
      return 'Frozen';
    }
    else if (inputStorageID == 2) {
      return 'Refrigerated';
    }
    else if (inputStorageID == 3){
      return "Room Temperature";
    }
  }

  render() {
    return (
      <div className="VendorContainer" onClick={this._handleClick}>
        <div className="Vendor"> {this.props.ingredient_name} - {this._capitalize(this.props.ingredient_package_type)} - {this.props.ingredient_price} - {this.getStorageType(this.props.ingredient_storage_id)}</div>
      </div>
    );
  }
}

export default VendorListItem;
