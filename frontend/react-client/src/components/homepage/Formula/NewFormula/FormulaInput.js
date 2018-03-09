import React, { Component } from 'react';

class FormulaInput extends Component {
  constructor(props) {
    super(props);
  }

  /*** REQUIRED PROPS
    1. HeaderText (String)
    2. ContentText (String)
    3. useTextArea (Bool)
    4. onChange (Func)
    5. id (String) - name, desc, or quantity

    OPTIONAL PROPS
    1. placeholder (String)
    2. inputStyle (JSON Style Object)
    3. value (String)
    4. error (Bool)
    5. errorText (String)
  */

  _handleChange(event) {
    this.props.onChange(event.target.value, this.props.id);
  }

  render() {
    return (
      <div className="FormulaInputContainer">
        <div className="FormulaTextContainer">
          <div className="FormulaTextHeader">{this.props.HeaderText}</div>
          <div className="FormulaTextContent">{this.props.ContentText}</div>
        </div>
        {
          this.props.useTextArea ? <textarea value={this.props.value != null ? this.props.value : null} onChange={this._handleChange.bind(this)}></textarea> : <input onChange={this._handleChange.bind(this)} value={this.props.value != null ? this.props.value : null} style={this.props.inputStyle} placeholder={this.props.placeholder}/>
        }
        {
          this.props.error ? <div className="FormulaTextError">
            {this.props.errorText}
          </div> : null
        }
      </div>
    );
  }
}

export default FormulaInput;
