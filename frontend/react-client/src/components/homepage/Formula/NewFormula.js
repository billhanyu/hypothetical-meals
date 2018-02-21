import React, { Component } from 'react';
import axios from 'axios';
import FormulaWindow from './FormulaWindow.js';

class NewFormula extends Component {
  constructor(props) {
    super(props);
  }

  onFinish(newFormulaObject) {
    const {name, desc, quantity, ingredients} = newFormulaObject;
    //POST REQUEST HERE
  }

  render() {
    return (
      <FormulaWindow onFinish={this.onFinish.bind(this)}/>
    );
  }
}

export default NewFormula;
