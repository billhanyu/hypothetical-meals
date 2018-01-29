import React, { Component } from 'react';

class VendorListItem extends Component {
  constructor(props){
    super(props);
    this._handleClick = this._handleClick.bind(this);
  }

  /*** REQUIRED PROPS
    1. id (Number)
    2. name (String)
    3. contact (String)
    4. code (String)
    5. clickedVendor (Func)
  */
  _handleClick() {
    this.props.onClick({
      code: this.props.code,
      name: this.props.name,
      id: this.props.id,
      contact: this.props.contact,
    });
  }

  render() {
    return (
      <div className="VendorContainer" onClick={this._handleClick}>
        <div className="Vendor"> Potatoes </div>
      </div>
    );
  }
}

export default VendorListItem;
