import React, { Component } from 'react';
import SelectField from 'material-ui/SelectField';
import MenuItem from 'material-ui/MenuItem';
import FormulaIngredientItem from './FormulaIngredientItem.js';

class FormulaInput extends Component {
  constructor(props) {
    super(props);
    this.handleChange = this.handleChange.bind(this);
    this.names = [
      'Chicken',
      'Beans',
      'Beef',
      'Salmon',
    ];
    this.state = {
      values:props.values != null ? props.values : ['Chicken'],
      nameToQuantityMap: {},
    };
  }

  /*** REQUIRED PROPS
    1. HeaderText (String)
    2. ContentText (String)

    OPTIONAL PROPS
    1. values (Array of Srings)
  */

  handleChange(event, index, values) {
    this.setState({values});
  }

  menuItems(values) {
    return this.names.map((name) => (
      <MenuItem
        key={name}
        insetChildren={true}
        checked={values && values.indexOf(name) > -1}
        value={name}
        primaryText={name}
      />
    ));
  }

  handleInputChange(element, newQuantity) {
    const newQuantityMap = this.state.nameToQuantityMap;
    newQuantityMap[element] = newQuantity;
    this.setState({
      nameToQuantityMap: newQuantityMap,
    });
  }

  render() {
    return (
      <div className="FormulaInputContainer">
        <div className="FormulaTextContainer">
          <div className="FormulaTextHeader">{this.props.HeaderText}</div>
          <div className="FormulaTextContent">{this.props.ContentText}</div>
        </div>

        <SelectField
           multiple={true}
           hintText="Select Coin data"
           value={this.state.values}
           onChange={this.handleChange}
           listStyle={{color: '#31749d', padding: '0px !important', paddingTop: '0px !important', paddingBottom: '0px !important',}}
         >
           {this.menuItems(this.state.values)}
         </SelectField>
         {
           this.state.values.map((element, key) => {
             return <FormulaIngredientItem key={key} element={element} onInputChange={this.handleInputChange.bind(this)}/>
           })
         }
      </div>
    );
  }
}

export default FormulaInput;
