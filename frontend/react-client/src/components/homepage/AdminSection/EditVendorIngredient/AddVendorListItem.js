import React, { Component } from 'react';

class AddVendorListItem extends Component {
  constructor(props){
    super(props);
    this._handleClick = this._handleClick.bind(this);
  }

  /*** REQUIRED PROPS
    1. name (String)
    2. onClick (Func)
    3. id (Number)
  */
  _handleClick() {
    this.props.onClick({
      id: this.props.id,
    });
  }

  render() {
    return (
      <div className="VendorContainer" onClick={this._handleClick}>
        <div className="Vendor"> {this.props.name} </div>
      </div>
    );
  }
}

export default AddVendorListItem;
