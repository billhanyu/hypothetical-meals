import React, { Component } from 'react';

class FormulaButton extends Component {
  constructor(props) {
    super(props);
  }

  /*** REQUIRED PROPS
    1. onClick (Func)
    2. text (String)
  */

  render() {
    return (
      <div className="FormulaButton" onClick={this.props.onClick}>
        {this.props.text}
      </div>
    );
  }
}

export default FormulaButton;
