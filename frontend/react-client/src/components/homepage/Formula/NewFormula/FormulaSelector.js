import React, { Component } from 'react';
import SelectField from 'material-ui/SelectField';
import MenuItem from 'material-ui/MenuItem';
import FormulaIngredientItem from './FormulaIngredientItem.js';
import axios from 'axios';

class FormulaInput extends Component {
  constructor(props) {
    super(props);
    this.handleChange = this.handleChange.bind(this);
    this.state = {
      values: props.values != null ? props.values : [],
      allIngredients: [],
      ingredientData: [],
      nameToQuantityMap: props.nameToQuantityMap != null ? props.nameToQuantityMap : {},
      ingredientNameToQuantityMap: props.ingredientNameToQuantityMap,
    };
  }

  /*** REQUIRED PROPS
    1. HeaderText (String)
    2. ContentText (String)
    3. onChange (Func)
    4. nameToQuantityMap (JSON Object)
    5. onValueChange (Func)
    6. values (String)
    7. ingredientNameToQuantityMap (JSON Object)

    OPTIONAL PROPS
    1. errorText
  */

  componentWillMount() {
    //GET REQUEST HERE
    axios.get(`/ingredients/page/1`, {
      headers: {Authorization: "Token " + global.token}
    })
    .then(response => {
      const allIngredients = [];
      response.data.forEach(element => {
        if(element.removed.data[0] == 0) {
          allIngredients.push(element.name);
        }
      });

      this.setState({
        ingredientData: response.data,
        allIngredients,
      });
    });
  }

  handleChange(event, index, values) {
    this.setState({values});
    this.props.onValueChange(values);
  }

  menuItems(values) {
    return this.state.allIngredients.map((name) => (
      <MenuItem
        key={name}
        insetChildren={true}
        checked={values && values.indexOf(name) > -1}
        value={name}
        primaryText={name}
      />
    ));
  }

  handleInputChange(elementName, newQuantity) {
    const newQuantityMap = this.props.nameToQuantityMap;
    const newIngredientNameToQuantityMap = this.props.ingredientNameToQuantityMap;
    const IDforElement = this.state.ingredientData.find(element => {
      return elementName === element.name;
    }).id;

    if((isNaN(Number(newQuantity)) || Number(newQuantity) <= 0)) {
      newQuantityMap[IDforElement] = 1;
      newIngredientNameToQuantityMap[elementName] = 1;
    }
    else {
      newQuantityMap[IDforElement] = newQuantity;
      newIngredientNameToQuantityMap[elementName] = newQuantity;
    }

    this.props.onChange(newQuantityMap, newIngredientNameToQuantityMap);
  }

  render() {
    return (
      <div className="FormulaInputContainer">
        <div className="FormulaTextContainer">
          <div className="FormulaTextHeader">{this.props.HeaderText}</div>
          <div className="FormulaTextContent">{this.props.ContentText}</div>
        </div>

        <SelectField
           disabled={this.props.readOnly}
           multiple={true}
           hintText="Select Ingredients"
           value={this.state.values}
           onChange={this.handleChange}
           errorText={this.props.errorText}
           listStyle={{color: '#31749d', padding: '0px !important', paddingTop: '0px !important', paddingBottom: '0px !important',}}
         >
           {this.menuItems(this.state.values)}
         </SelectField>
         {
           this.state.values.map((elementName, key) => {
             return <FormulaIngredientItem
             readOnly={this.props.readOnly}
             key={key}
             elementName={elementName}
             value={this.props.ingredientNameToQuantityMap[elementName]}
             onInputChange={this.handleInputChange.bind(this)}
            />;
           })
         }
      </div>
    );
  }
}

export default FormulaInput;
