import React, { Component } from 'react';

class VendorComboBox extends Component {
  constructor(props){
    super(props);
  }

  /*** REQUIRED PROPS
    1. Options (Array of Strings)
  */

  render() {
    return (
      <select className="AdminDropdown">
        {
          this.props.Options.map((element, key) => {
            return <option value={element} key={key}>{element}</option>;
          })
        }
      </select>
    );
  }
}

export default VendorComboBox;
