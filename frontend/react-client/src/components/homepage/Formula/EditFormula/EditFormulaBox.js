import React, { Component } from 'react';

class EditFormulaBox extends Component {
  constructor(props) {
    super(props);
  }

  /*** REQUIRED PROPS
    1. onClick (Func)
    2. onDelete (Func)
    3. FormulaName (String)
    4. element (JSON Object that holds all of the New Formula Data)
  ***/

  handleClick() {
    this.props.onClick(this.props.element);
  }

  handleDelete(e) {
    e.stopPropagation();
    this.props.onDelete(this.props.element);
  }

  render() {
    return (
      <div className="EditFormulaBox" onClick={this.handleClick.bind(this)}>
        <i className="fas fa-times CloseEditFormulaBox" onClick={this.handleDelete.bind(this)}></i>
        <i className="fas fa-utensils fa-3x FormulaBoxFork"></i>
        <div className="unselectable">{this.props.FormulaName}</div>
      </div>
    );
  }
}

export default EditFormulaBox;
