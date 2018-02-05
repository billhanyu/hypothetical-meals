import React, { Component } from 'react';

class VendorListItem extends Component {
  constructor(props){
    super(props);
    this._handleClick = this._handleClick.bind(this);
  }

  /*** REQUIRED PROPS
    1. storage_id (Number)
    2. name (String)
    3. onClick (Func)
    4. id (Number)
  */
  _handleClick() {
    this.props.onClick({
      storage_id: this.props.storage_id,
      name: this.props.name,
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

export default VendorListItem;
