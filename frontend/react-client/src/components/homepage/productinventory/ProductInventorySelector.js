import React from 'react';
import createClass from 'create-react-class';
import axios from 'axios';
import Select from 'react-select';
import '!style-loader!css-loader!react-select/dist/react-select.css';
import Snackbar from 'material-ui/Snackbar';

/*
 * selects a product in final product inventory
 * props.changeFormulaId(newValue): changes the id selected, for sale request
 * props.existing: what's already selected
*/

const ProductInventorySelector = createClass({
  displayName: 'Product',

  getInitialState() {
    return {
      disabled: false,
      searchable: this.props.searchable,
      selectValue: '',
      clearable: true,
      rtl: false,
      inventories: [],
    };
  },

  componentDidMount() {
    axios.get('/finalproductinventories', {
      headers: { Authorization: "Token " + global.token }
    })
      .then(response => {
        const inventories = [];
        response.data.forEach(inventory => {
          if (inventories.filter(el => el.value == inventory.formula_id).length == 0) {
            inventories.push({
              value: inventory.formula_id,
              label: inventory.formula_name,
            });
          }
        });
        this.allInventories = inventories;
        this.setState({
          inventories,
        });
      })
      .catch(err => {
        this.setState({
          open: true,
          message: "Error retrieving products in inventory",
        });
      });

    // placeholder
    this.allInventories = [
      {
        value: 1,
        label: 'fuck',
      },
      {
        value: 2,
        label: 'damn',
      },
    ];
    this.setState({
      inventories: this.allInventories,
    });
  },

  componentWillReceiveProps(newProps) {
    const inventories = this.allInventories.filter(inventory => !newProps.existing.find(el => el.id == inventory.value));
    this.setState({
      inventories,
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
    var options = this.state.inventories;
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
          placeholder="Select Product..."
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

export default ProductInventorySelector;
