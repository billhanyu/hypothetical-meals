import React, { Component } from 'react';
import ProduceFormulaHeader from './ProduceFormula/ProduceFormulaHeader.js';
import ProduceFormulaListItem from './ProduceFormula/ProduceFormulaListItem.js';
import ProduceFormulaButton from './ProduceFormula/ProduceFormulaButton.js';
import ProduceFormulaComparator from './ProduceFormula/ProduceFormulaComparator.js';
import axios from 'axios';
import qs from 'qs';
import Snackbar from 'material-ui/Snackbar';

class ProduceFormula extends Component {
  constructor(props) {
    super(props);
    this.state = {
      EditFormulaBoxes: [],
      shouldShowSummaryTable: false,
      formulaToFormulaAmountMap: {},
      formulaToFormulaAmountTotalMap: {},
      inventoryStock: [],
      errorMap: {},
      open: false,
    };
  }

  componentWillMount() {
    axios.get(`/formulas`, {
      headers: {Authorization: "Token " + global.token}
    })
    .then(response => {
      this.setState({
        EditFormulaBoxes: response.data
      });
    });
  }

  handleProduceFormulaClick() {
    let error = false;
    Object.keys(this.state.errorMap).forEach(element => {
      if(this.state.errorMap[element] == true) {
        error = true;
      }
    });
    if(error) {
      return this.setState({
        open: true,
      });
    }

    const inventoryIDs = new Set();
    this.state.EditFormulaBoxes.forEach(element => {
      Object.keys(element.ingredients).forEach(ingredientKey => {
        inventoryIDs.add(element.ingredients[ingredientKey].ingredient_id);
      });
    });
    axios.get(`/inventory/stock`, {
      'params': {ids: [...inventoryIDs]},
      'paramsSerializer': function(params) {
         return qs.stringify(params, {arrayFormat: 'repeat'});
      },
      headers: {Authorization: "Token " + global.token},
    })
    .then(response => {
      this.setState({
        shouldShowSummaryTable: true,
        inventoryStock: response.data,
      });
    })
    .catch(error => {
      console.log(error.response);
    });
  }

  handleNumChange(newFormulaAmount, formulaId, totalFormulaUnitsCreated, belowMinError) {
    const newFormulaToFormulaMap = this.state.formulaToFormulaAmountMap;
    newFormulaToFormulaMap[formulaId] = newFormulaAmount;
    const newFormulaToFormulaTotalMap = this.state.formulaToFormulaAmountTotalMap;
    newFormulaToFormulaTotalMap[formulaId] = totalFormulaUnitsCreated;
    const errorMap = this.state.errorMap;
    errorMap[formulaId] = belowMinError;
    this.setState({
      formulaToFormulaAmountMap: newFormulaToFormulaMap,
      formulaToFormulaAmountTotalMap: newFormulaToFormulaTotalMap,
      errorMap,
    });
  }

  handleReturn() {
    this.setState({
      shouldShowSummaryTable: false,
    });
  }

  handleRequestClose() {
    this.setState({
      open: false,
    });
  }

  render() {
    return (
      <div>
        <Snackbar
          open={this.state.open}
          message="Cannot proceed due to errors"
          autoHideDuration={2000}
          onRequestClose={this.handleRequestClose.bind(this)}
        />
        <ProduceFormulaHeader />
        {
          this.state.shouldShowSummaryTable ?
            <ProduceFormulaComparator
              link={this.props.link}
              onBackClick={this.handleReturn.bind(this)}
              EditFormulaBoxes={this.state.EditFormulaBoxes}
              inventoryStock={this.state.inventoryStock}
              formulaToFormulaAmountMap={this.state.formulaToFormulaAmountMap}
              formulaToFormulaAmountTotalMap={this.state.formulaToFormulaAmountTotalMap}
            />
           :
           <div>
            {
              this.state.EditFormulaBoxes.map((element, key) => {
                return <ProduceFormulaListItem key={key}
                        name={element.name}
                        num_product={element.num_product}
                        ingredients={element.ingredients}
                        id={element.id}
                        handleNumChange={this.handleNumChange.bind(this)} />;
              })
            }
            <ProduceFormulaButton onClick={this.handleProduceFormulaClick.bind(this)} />
           </div>
        }
      </div>
    );
  }
}

export default ProduceFormula;
