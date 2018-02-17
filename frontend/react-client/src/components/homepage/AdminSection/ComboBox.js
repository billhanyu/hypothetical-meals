import React, { Component } from 'react';

class ComboBox extends Component {
  constructor(props){
    super(props);
    this.handleChange = this.handleChange.bind(this);
  }

  /*** REQUIRED PROPS
    1. Options (Array of Strings)
    2. onChange (Func)
    3. id (String)
  */

  handleChange(event) {
    this.props.onChange(this.props.id, event);
  }

  render() {
    return (
      <select className="AdminDropdown" onChange={this.handleChange}>
        {
          this.props.Options.map((element, key) => {
            const selected = element == this.props.selected ? "selected" : "";
            return <option selected={selected} value={element} key={key}>{element}</option>;
          })
        }
      </select>
    );
  }
}

export default ComboBox;
