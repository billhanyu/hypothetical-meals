import React, { Component } from 'react';

class FormulaInput extends Component {
  constructor(props) {
    super(props);
  }

  /*** REQUIRED PROPS
    1. HeaderText (String)
    2. ContentText (String)
    3. useTextArea (Bool)

    OPTIONAL PROPS
    1. placeholder (String)
    2. inputStyle (JSON Style Object)
    3. value (String)
  */

  render() {
    return (
      <div className="FormulaInputContainer">
        <div className="FormulaTextContainer">
          <div className="FormulaTextHeader">{this.props.HeaderText}</div>
          <div className="FormulaTextContent">{this.props.ContentText}</div>
        </div>
        {
          this.props.useTextArea ? <textarea></textarea> : <input value={this.props.value != null ? this.props.value : null} style={this.props.inputStyle} placeholder={this.props.placeholder}/>
        }

      </div>
    );
  }
}

export default FormulaInput;
