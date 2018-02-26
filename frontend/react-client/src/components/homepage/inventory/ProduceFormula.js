import React, { Component } from 'react';
import ProduceFormulaHeader from './ProduceFormula/ProduceFormulaHeader.js';
import ProduceFormulaListItem from './ProduceFormula/ProduceFormulaListItem.js';
import ProduceFormulaButton from './ProduceFormula/ProduceFormulaButton.js';
import ProduceFormulaComparator from './ProduceFormula/ProduceFormulaComparator.js';
import axios from 'axios';
import qs from 'qs';

class ProduceFormula extends Component {
  constructor(props) {
    super(props);
    this.state = {
      EditFormulaBoxes: [],
      shouldShowSummaryTable: false,
      formulaToFormulaAmountMap: {},
      formulaToFormulaAmountTotalMap: {},
      inventoryStock: [],
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
    });
  }

  handleNumChange(newFormulaAmount, formulaId, totalFormulaUnitsCreated) {
    const newFormulaToFormulaMap = this.state.formulaToFormulaAmountMap;
    newFormulaToFormulaMap[formulaId] = newFormulaAmount;
    const newFormulaToFormulaTotalMap = this.state.formulaToFormulaAmountTotalMap;
    newFormulaToFormulaTotalMap[formulaId] = totalFormulaUnitsCreated;
    this.setState({
      formulaToFormulaAmountMap: newFormulaToFormulaMap,
      formulaToFormulaAmountTotalMap: newFormulaToFormulaTotalMap
    });
  }

  handleReturn() {
    this.setState({
      shouldShowSummaryTable: false,
    });
  }

  render() {
    return (
      <div>
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
