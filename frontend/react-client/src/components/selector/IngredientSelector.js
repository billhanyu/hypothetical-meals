import React from 'react';
import createClass from 'create-react-class';
import axios from 'axios';
import Select from 'react-select';
import '!style-loader!css-loader!react-select/dist/react-select.css';
import Snackbar from 'material-ui/Snackbar';

/*
 * selects an ingredient regardless of removed status (all ingredients)
 * props.changeIngredientId(newValue): changes the id selected
*/

const IngredientSelector = createClass({
  displayName: 'Ingredient',

  getInitialState() {
    return {
      disabled: false,
      searchable: this.props.searchable,
      selectValue: '',
      clearable: true,
      rtl: false,
      ingredients: [],
    };
  },

  componentDidMount() {
    axios.get('/ingredients', {
      headers: { Authorization: "Token " + global.token }
    })
      .then(response => {
        const ingredients = response.data.map(ingredient => {
          ingredient.value = ingredient.id;
          ingredient.label = ingredient.name;
          return ingredient;
        });
        this.setState({
          ingredients,
        });
      })
      .catch(err => {
        this.setState({
          open: true,
          message: "Error retrieving ingredients",
        });
      });
  },

  clearValue(e) {
    this.select.setInputValue('');
  },

  updateValue(newValue) {
    this.props.changeIngredientId(newValue);
    this.setState({
      selectValue: newValue,
    });
  },

  handleRequestClose() {
    this.setState({
      open: false,
    });
  },

  render() {
    var options = this.state.ingredients;
    return (
      <div className="section" style={{'width': '400px'}}>
        <Snackbar
          open={this.state.open}
          message={this.state.message}
          autoHideDuration={2500}
          onRequestClose={this.handleRequestClose.bind(this)}
        />
        <Select
          id="state-select"
          placeholder="Select Ingredient..."
          ref={(ref) => { this.select = ref; }}
          onBlurResetsInput={false}
          onSelectResetsInput={false}
          autoFocus
          options={options}
          simpleValue
          clearable={this.state.clearable}
          name="selected-state"
          disabled={this.state.disabled}
          value={this.state.selectValue}
          onChange={this.updateValue}
          rtl={this.state.rtl}
          searchable={this.state.searchable}
        />
      </div>
    );
  }
});

export default IngredientSelector;
