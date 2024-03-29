import React, { Component } from 'react';
import FormulaInput from './NewFormula/FormulaInput.js';
import FormulaSelector from './NewFormula/FormulaSelector.js';
import FormulaButton from './NewFormula/FormulaButton.js';
import axios from 'axios';
import Snackbar from 'material-ui/Snackbar';
import Checkbox from 'material-ui/Checkbox';
import ComboBox from '../../GeneralComponents/ComboBox';
import Storage2State from '../../Constants/Storage2State';
import packageTypes from '../../Constants/PackageTypes';
import SelectField from 'material-ui/SelectField';
import MenuItem from 'material-ui/MenuItem';

class FormulaWindow extends Component {
  constructor(props) {
    super(props);
    this.handleInputChange = this.handleInputChange.bind(this);
    const name = props.newFormulaObject != null ? props.newFormulaObject.name : '';
    const desc = props.newFormulaObject != null ? props.newFormulaObject.description : '';
    const quantity = props.newFormulaObject != null ? props.newFormulaObject.num_product : 0;
    const removed = props.newFormulaObject != null ? props.newFormulaObject.removed : 0;
    const idToQuantityMap = {};
    const values = [];
    const productionLines = [];
    const productionLinesAll = [];
    const ingredientNameToQuantityMap = {};
    const productionLinesMap = {};
    if (props.newFormulaObject != null) {
      Object.keys(props.newFormulaObject.ingredients).forEach(ingredient => {
        const element = props.newFormulaObject.ingredients[ingredient];
        idToQuantityMap[element.ingredient_id] = element.num_native_units;
        values.push(ingredient);
        ingredientNameToQuantityMap[element.name] = element.num_native_units;
      });
    }

    const defaultIngredient = {
      package_type: 'sack',
      native_unit: '',
      storage_id: 1,
      storage_name: 'freezer',
    };
    const ingredient = props.ingredientInfo || defaultIngredient;
    this.state = {
      name,
      desc,
      quantity,
      productionLines,
      productionLinesAll,
      productionLinesMap,
      removed,
      idToQuantityMap,
      values,
      ingredientNameToQuantityMap,
      isIntermediate: props.newFormulaObject == null ? false : props.newFormulaObject.intermediate,
      package_type: ingredient.package_type,
      native_unit: ingredient.native_unit,
      storage_id: ingredient.storage_id,
      storage: ingredient.storage_name,
    };
  }

  /*** REQUIRED PROPS
    1. onFinish (Func)
    2. isEditing (Bool)

    OPTIONAL PROPS
    1. BackButtonShown (Bool)
    2. onBackClick (Func)
    3. newFormulaObject (JSON Formula Object)
    4. activeId (Number)
  ****/

  componentDidMount() {
    axios.get(`/productionlines`, {
      headers: { Authorization: "Token " + global.token },
    })
    .then(response => {
      const productionLinesAll = [];
      const productionLinesMap = {};
      response.data.forEach(element => {
        productionLinesAll.push(element.name);
        productionLinesMap[element.name] = element.id;
      });
      this.setState({
        productionLinesAll,
        productionLinesMap,
      });
    })
    .catch(err => {
      console.log(err);
      console.log(err.response);
    });
  }

  handleInputChange(newInput, id) {
    const newState = this.state;
    let newInputVal = newInput;
    let errorObj = {};
    if (id == 'name') {
      Object.assign(errorObj, { nameError: false, });
    }
    if (id == 'desc') {
      Object.assign(errorObj, { descError: false, });
    }
    if (id == 'quantity') {
      Object.assign(errorObj, { quantityError: false, });
      const replacedValue = Number(newInputVal.replace('.', '').replace('-', ''));
      newInputVal = isNaN(replacedValue) ? newInputVal : replacedValue;
    }
    newState[id] = newInputVal;
    Object.assign(newState, errorObj);
    this.setState(newState);
  }

  _handleIngredientChange(idToQuantityMap, ingredientNameToQuantityMap) {
    this.setState({
      idToQuantityMap,
      ingredientNameToQuantityMap,
    });
  }

  _handleValueChange(values) {
    const newIngredientNameToQuantityMap = this.state.ingredientNameToQuantityMap;
    const newidToQuantityMap = this.state.idToQuantityMap;
    Object.keys(this.state.ingredientNameToQuantityMap).forEach(ingredientName => {
      if (values.find(element => element == ingredientName) == null) {
        delete newIngredientNameToQuantityMap[ingredientName];
        let ingredientId = -1;
        Object.keys(this.props.newFormulaObject.ingredients).forEach(ingredient => {
          const element = this.props.newFormulaObject.ingredients[ingredient];
          if (element.name == ingredientName) {
            ingredientId = element.ingredient_id;
          }
        });
        delete newidToQuantityMap[ingredientId];
      }
    });
    this.setState({
      values,
      ingredError: false,
      ingredientNameToQuantityMap: newIngredientNameToQuantityMap,
      idToQuantityMap: newidToQuantityMap,
    });
  }

  _onFinish() {
    const isNameEmpty = this.state.name == '' || this.state.name == null;
    const isQuantityEmpty = this.state.quantity == '' || this.state.quantity == null || isNaN(Number(this.state.quantity)) || Number(this.state.quantity <= 0);
    const isIngredEmpty = this.state.values.length == 0;
    const isProductionLineEmpty = this.state.productionLines.length === 0;
    if (isNameEmpty || isQuantityEmpty || isIngredEmpty || isProductionLineEmpty) {
      return this.setState({
        nameError: isNameEmpty,
        quantityError: isQuantityEmpty,
        ingredError: isIngredEmpty,
        productionLineError: isProductionLineEmpty
      });
    }

    if (this.props.isEditing) {
      const { name, desc, quantity, idToQuantityMap,  productionLinesMap} = this.state;
      //PUT REQUEST HERE
      const ingredients = [];
      const productionLineIds = Object.values(productionLinesMap);
      Object.keys(idToQuantityMap).forEach(key => {
        if (Number(idToQuantityMap[key]) > 0) {
          ingredients.push({
            ingredient_id: key,
            num_native_units: idToQuantityMap[key],
          });
        }
      });

      const id = this.props.activeId;
      axios.put(`/formulas`, {
        'formulas': [
          {
            id,
            name,
            description: desc,
            num_product: quantity,
            ingredients,
            lines : productionLineIds,
          }
        ]
      }, {
          headers: { Authorization: "Token " + global.token }
      }).then(responses => {
        this.setState({
          open: true,
          message: "Finished updating"
        });

      }).catch(err => {
        this.setState({
          open: true,
          message: err.response.data,
        });
      });
    } else {
      this.props.onFinish(this.state);
    }
  }

  updateCheck() {
    this.setState({
      isIntermediate: !this.state.isIntermediate,
    });
  }

  selectedProductionLine(event, index, values) {
    this.setState({
      productionLines: values,
    });
  }

  productionItems(values) {
    return this.state.productionLinesAll.map((name) => (
      <MenuItem
        key={name}
        insetChildren={true}
        checked={values && values.indexOf(name) > -1}
        value={name}
        primaryText={name}
      />
    ));
  }

  handleRequestClose() {
    this.setState({
      open: false,
    });
  }

  render() {
    const readOnly = global.user_group !== "admin" || this.state.removed == 1;
    return (
      <div className="NewFormulaContainer borderAll">
        <Snackbar
          open={this.state.open}
          message={this.state.message}
          autoHideDuration={2500}
          onRequestClose={this.handleRequestClose.bind(this)}
        />
        {
          this.props.BackButtonShown ? <i className="far fa-arrow-alt-circle-left fa-2x BackButtonFormulaContainer" onClick={this.props.onBackClick} ></i> : null
        }
        {
          global.user_group == "admin" &&
          <div className="NewFormulaHeader">{this.props.isEditing ? "Edit Formula" : "New Formula"}</div>
        }
        {
          global.user_group != "admin" &&
          <div className="NewFormulaHeader">{"Formula: " + this.state.name}</div>
        }
        <h3>
          {
            this.state.removed == 1 &&
            <span style={{ 'margin-left': '20px' }} className="badge badge-danger">Deleted</span>
          }
        </h3>
        <FormulaInput readOnly={readOnly} error={this.state.nameError} errorText="Invalid Name" value={this.state.name} id="name" onChange={this.handleInputChange} HeaderText="Unique Formula Name" ContentText="Name of the amalgamated entity" placeholder="Formula Name" />
        <FormulaInput readOnly={readOnly} error={this.state.descError} errorText="Invalid Desc" value={this.state.desc} id="desc" onChange={this.handleInputChange} HeaderText="Formula Description" ContentText="Full description or important notes for this particular formula" useTextArea />
        <div className="FormulaInputContainer">
          <div className="FormulaTextContainer">
            <div className="FormulaTextHeader">Formula Production Lines</div>
            <div className="FormulaTextContent">All production lines that can produce this formula</div>
          </div>
          <SelectField
            multiple={true}
            hintText="Select production lines"
            value={this.state.productionLines}
            onChange={this.selectedProductionLine.bind(this)}
            errorText={this.state.productionLineError ? 'Select at least one production line' : null}
          >
            {this.productionItems(this.state.productionLines)}
          </SelectField>
        </div>
        <FormulaSelector
          readOnly={readOnly}
          onChange={this._handleIngredientChange.bind(this)}
          onValueChange={this._handleValueChange.bind(this)}
          nameToQuantityMap={this.state.idToQuantityMap}
          values={this.state.values}
          ingredientNameToQuantityMap={this.state.ingredientNameToQuantityMap}
          HeaderText="Formula Ingredients"
          ContentText="List of all formula ingredients utilized, with corresponding quantities"
          errorText={this.state.ingredError ? "Select at least 1 ingredient" : null}
        />
        <FormulaInput readOnly={readOnly} error={this.state.quantityError} errorText="Invalid Quantity" value={this.state.quantity} id="quantity" onChange={this.handleInputChange} HeaderText="Quantity Created" ContentText="Total quantity created per instance of formula recipe / ingredient usage" placeholder="Quantity Created" inputStyle={{ marginTop: '12px' }} />
        <Checkbox
          label="Intermediate Product"
          checked={this.state.isIntermediate}
          onCheck={this.updateCheck.bind(this)}
          style={{marginLeft:'10%'}}
          disabled={this.props.isEditing}
        />
        {
          this.state.isIntermediate && !this.props.isEditing ? <div style={{width:'80%', margin: '0 auto'}}>
          <div className="form-group">
            <label htmlFor="package_type">Package Type</label>
            <ComboBox className="form-control" id="package_type" Options={packageTypes} onChange={this.handleInputChange} selected={this.state.package_type} />
          </div>
          <div className="form-group">
            <label htmlFor="storage">Temperature State</label>
            <ComboBox className="form-control" id="storage" Options={["freezer", "refrigerator", "warehouse"]} onChange={this.handleInputChange} selected={this.state.storage} />
          </div>
          <div className="form-group">
            <label htmlFor="native_unit">Unit</label>
            <input type="text" className="form-control" id="native_unit" aria-describedby="unit" placeholder="Pounds" onChange={e => this.handleInputChange(e.target.value, 'native_unit')} value={this.state.native_unit}/>
          </div>
          <div className="form-group">
            <label htmlFor="num_native_units">Number of Native Units</label>
            <input type="text" className="form-control" id="num_native_units" aria-describedby="unit" placeholder="Native Units Amt" onChange={e => this.handleInputChange(e.target.value, 'num_native_units')} value={this.state.num_native_units}/>
          </div>
          </div>: null
        }

        {
          global.user_group == "admin" &&
          <FormulaButton text={this.props.isEditing ? "Edit Formula" : "Create New Formula"} onClick={this._onFinish.bind(this)} />
        }
        <div style={{ clear: 'both' }}></div>
      </div>
    );
  }
}

export default FormulaWindow;
