import React from 'react';
import createClass from 'create-react-class';
import axios from 'axios';
import Select from 'react-select';
import '!style-loader!css-loader!react-select/dist/react-select.css';
import Snackbar from 'material-ui/Snackbar';

/*
 * selects a formula with removed = 0
 * props.changeFormulaId(newValue): changes the id selected
*/

const AvailableFormulaSelector = createClass({
  displayName: 'Vendor',

  getInitialState() {
    return {
      disabled: false,
      searchable: this.props.searchable,
      selectValue: '',
      clearable: true,
      rtl: false,
      allFormulas: [],
    };
  },

  componentWillMount() {
    axios.get('/formulas', {
      headers: { Authorization: "Token " + global.token }
    })
      .then(response => {
        const allFormulas = response.data.map(formula => {
          formula.value = formula.id;
          formula.label = formula.name;
          return formula;
        });
        const formulas = allFormulas.filter(formula => !this.props.existing.find(el => el.id == formula.id));
        this.setState({
          allFormulas,
          formulas,
        });
      })
      .catch(err => {
        this.setState({
          open: true,
          message: "Error retrieving formulas",
        });
      });
  },

  componentWillReceiveProps(newProps) {
    const formulas = this.state.allFormulas.filter(formula => !newProps.existing.find(el => el.formula_id == formula.id));
    this.setState({
      formulas,
    });
  },

  clearValue(e) {
    this.select.setInputValue('');
  },

  updateValue(newValue) {
    this.props.changeFormulaId(newValue);
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
    var options = this.state.formulas;
    return (
      <div className="section">
        <Snackbar
          open={this.state.open}
          message={this.state.message}
          autoHideDuration={2500}
          onRequestClose={this.handleRequestClose.bind(this)}
        />
        <Select
          id="state-select"
          placeholder="Select Formula..."
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

export default AvailableFormulaSelector;
