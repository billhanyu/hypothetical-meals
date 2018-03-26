import React, { Component } from 'react';
import AutoComplete from 'material-ui/AutoComplete';
import FormulaIngredientItem from './FormulaIngredientItem.js';
import axios from 'axios';

class FormulaInput extends Component {
  constructor(props) {
    super(props);
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
        if(element.removed == 0) {
          allIngredients.push(element.name);
        }
      });

      this.setState({
        ingredientData: response.data,
        allIngredients,
      });
    });
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

  handleNewRequest(chosenRequest, index) {
    const array = this.state.values.slice();
    array.push(chosenRequest);
    this.setState({
      values: array,
    });
    this.props.onValueChange(array);
  }

  render() {
    return (
      <div className="FormulaInputContainer">
        <div className="FormulaTextContainer">
          <div className="FormulaTextHeader">{this.props.HeaderText}</div>
          <div className="FormulaTextContent">{this.props.ContentText}</div>
        </div>
        <AutoComplete
          hintText="Select Ingredients"
          dataSource={this.state.allIngredients}
          disabled={this.props.readOnly}
          filter={AutoComplete.caseInsensitiveFilter}
          listStyle={{color: '#31749d'}}
          onNewRequest={this.handleNewRequest.bind(this)}
          openOnFocus={true}
        />
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
