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
      <div className="ProduceFormulaButton" onClick={this.props.onClick} style={{marginLeft: '500px'}}>
        Back
      </div>
    );
  }
}

export default ProduceFormulaButton;
