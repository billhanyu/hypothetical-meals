import React, { Component } from 'react';

class FormulaButton extends Component {
  constructor(props) {
    super(props);
  }

  /*** REQUIRED PROPS
    1. onClick (Func)
  */

  render() {
    return (
      <div className="FormulaButton" onClick={this.props.onClick}>
        Create New Formula
      </div>
    );
  }
}

export default FormulaButton;
