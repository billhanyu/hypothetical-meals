import React, { Component } from 'react';
import ProduceFormulaHeader from './ProduceFormula/ProduceFormulaHeader.js';
import ProduceFormulaListItem from './ProduceFormula/ProduceFormulaListItem.js';
import ProduceFormulaButton from './ProduceFormula/ProduceFormulaButton.js';
import ProduceFormulaComparator from './ProduceFormula/ProduceFormulaComparator.js';
import ProduceFormulaReturn from './ProduceFormula/ProduceFormulaReturn';
import FormulaListItem from './FormulaListItem';
import axios from 'axios';
import qs from 'qs';
import Snackbar from 'material-ui/Snackbar';
import FlatButton from 'material-ui/FlatButton';
import ProductionRunNonReport from '../productionrun_nonreport/ProductionRunNonReport';

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
      producing: false,
      formulaObject: {},
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
      console.log(error);
      console.log(error.response);
    });
  }

  handleNumChange(newFormulaAmount, formulaId, totalFormulaUnitsCreated, belowMinError) {
    const newFormulaToFormulaMap = {};
    newFormulaToFormulaMap[formulaId] = newFormulaAmount;
    const newFormulaToFormulaTotalMap = {};
    newFormulaToFormulaTotalMap[formulaId] = totalFormulaUnitsCreated;
    const errorMap = {};
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

  handleFormulaClick(formulaObject) {
    this.setState({
      producing: true,
      formulaObject,
    });
  }

  returnClick() {
    this.setState({
      producing: false,
    });
  }

  render() {
    if(this.state.isShowingProductionRuns) {
      return <ProductionRunNonReport onClick={() => {this.setState({isShowingProductionRuns: false,});}} />;
    }
    return (
      <div>
        <Snackbar
          open={this.state.open}
          message="Cannot proceed due to errors"
          autoHideDuration={2000}
          onRequestClose={this.handleRequestClose.bind(this)}
        />
        <ProduceFormulaHeader />
        <FlatButton label="See Production Runs" backgroundColor='#377CC9' labelStyle={{color: '#FFF'}} hoverColor='#4694ec' onClick={() => {this.setState({isShowingProductionRuns: true,});}}/>
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
             this.state.producing ?
             <div>
              <ProduceFormulaListItem name={this.state.formulaObject.element.name} num_product={this.state.formulaObject.element.num_product} ingredients={this.state.formulaObject.element.ingredients} handleNumChange={this.handleNumChange.bind(this)} id={this.state.formulaObject.element.id}/>
              <ProduceFormulaButton onClick={this.handleProduceFormulaClick.bind(this)} />
              <ProduceFormulaReturn onClick={this.returnClick.bind(this)} />
             </div> :
             <table className="table">
               <thead>
                 <tr>
                   <th>Name</th>
                   <th>Package Amount</th>
                   <th>Number of Ingredients</th>
                 </tr>
               </thead>
               <tbody>
                 {
                   this.state.EditFormulaBoxes.map((element, key) => {
                     return <FormulaListItem onClick={this.handleFormulaClick.bind(this)} key={key} element={element} />
                   })
                 }
               </tbody>
             </table>

            }
           </div>
        }
      </div>
    );
  }
}

export default ProduceFormula;
