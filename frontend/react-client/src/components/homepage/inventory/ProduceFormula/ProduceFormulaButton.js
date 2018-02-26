import React, { Component } from 'react';

class ProduceFormulaButton extends Component {
  constructor(props) {
    super(props);
  }
  /*** REQUIRED PROPS
    1. onClick (Func)
  */

  render() {
    return (
      <div className="ProduceFormulaButton" onClick={this.props.onClick}>
        Produce Formulas
      </div>
    );
  }
}

export default ProduceFormulaButton;
