import React, { Component } from 'react';
import axios from 'axios';
import FormulaWindow from './FormulaWindow.js';
import Snackbar from 'material-ui/Snackbar';

class NewFormula extends Component {
  constructor(props) {
    super(props);
    this.state = {
      open: false,
    };
  }

  handleRequestClose() {
    this.setState({
      open: false,
    });
  }

  onFinish(newFormulaObject) {
    const {name, desc, quantity, idToQuantityMap} = newFormulaObject;
    //POST REQUEST HERE
    const ingredients = [];
    const self = this;
    Object.keys(idToQuantityMap).forEach(key => {
      if(Number(idToQuantityMap[key]) > 0){
        ingredients.push({
          ingredient_id: key,
          num_native_units: idToQuantityMap[key],
        });
      }
    });
    axios.post(`/formulas`, {'formulas':[
      {
          name,
          description: desc,
          num_product: quantity,
          ingredients,
      }
    ]}, {
      headers: {Authorization: "Token " + global.token}
    }).then(response => {
      self.setState({
        open: true,
      });
    }).catch(error => {
      alert("Error creating new Formula");
    });
  }

  render() {
    return (
      <div>
        <FormulaWindow onFinish={this.onFinish.bind(this)}/>
        <Snackbar
          open={this.state.open}
          message="New Formula Created"
          autoHideDuration={2500}
          onRequestClose={this.handleRequestClose.bind(this)}
        />
      </div>
    );
  }
}

export default NewFormula;
