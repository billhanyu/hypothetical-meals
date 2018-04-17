import React, { Component } from 'react';
import axios from 'axios';
import FormulaWindow from './FormulaWindow.js';
import Snackbar from 'material-ui/Snackbar';
import PropTypes from 'prop-types';

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
    const {name, desc, quantity, idToQuantityMap, isIntermediate, num_native_units, native_unit, package_type, storage, productionLines, productionLinesMap} = newFormulaObject;
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
    const productionLineIDsThatMakeFormula = [];
    productionLines.forEach(element => {
      productionLineIDsThatMakeFormula.push(productionLinesMap[element]);
    });

    axios.get('/storages', {headers: {Authorization: "Token " + global.token}})
    .then(response => {
      let storage_id = 1;
      if(storage === "freezer") {
        storage_id = 1;
      }
      else if(storage === 'refrigerator') {
        storage_id = 2;
      }
      else if(storage === 'warehouse') {
        storage_id = 3;
      }
      axios.post(`/formulas`, {'formulas':[
        {
            name,
            //BILL LOOK HERE
            //(christine's new parameter, name may change) production_line_ids: productionLineIDsThatMakeFormula,
            lines: productionLineIDsThatMakeFormula,
            ingredient_name: name,
            description: desc,
            num_product: quantity,
            ingredients,
            intermediate: isIntermediate ? 1 : 0,
            num_native_units: Number(num_native_units),
            native_unit,
            storage_id,
            package_type,
        }
      ]}, {
        headers: {Authorization: "Token " + global.token}
      }).then(response => {
        this.props.onFinish();
      }).catch(error => {
        self.setState({
          open: true,
          message: error.response.data,
        });
      });
    })
    .catch(error => {
      self.setState({
        open: true,
        message: error.response.data,
      });
    });
  }

  render() {
    return (
      <div>
        <FormulaWindow
          onFinish={this.onFinish.bind(this)}
          BackButtonShown={true}
          onBackClick={this.props.onBackClick}
        />
        <Snackbar
          open={this.state.open}
          message={this.state.message}
          autoHideDuration={2500}
          onRequestClose={this.handleRequestClose.bind(this)}
        />
      </div>
    );
  }
}

NewFormula.propTypes = {
  onBackClick: PropTypes.func,
  onFinish: PropTypes.func,
};

export default NewFormula;
