import React from 'react';
import createClass from 'create-react-class';
import axios from 'axios';
import Select from 'react-select';
import '!style-loader!css-loader!react-select/dist/react-select.css';

/*
 * selects a vendor with removed = 0
 * props.changeVendorId(newValue): changes the id selected
*/

const AvailableVendorSelector = createClass({
  displayName: 'Vendor',

  getInitialState() {
    return {
      disabled: false,
      searchable: this.props.searchable,
      selectValue: '',
      clearable: true,
      rtl: false,
      vendors: [],
    };
  },

  componentDidMount() {
    axios.get('/vendors-available', {
      headers: { Authorization: "Token " + global.token }
    })
      .then(response => {
        const vendors = response.data.map(vendor => {
          vendor.value = vendor.id;
          vendor.label = vendor.name;
          return vendor;
        });
        this.setState({
          vendors,
        });
      })
      .catch(err => {
        console.error(err);
        alert('Error retrieving vendors');
      });
  },

  clearValue(e) {
    this.select.setInputValue('');
  },

  updateValue(newValue) {
    this.props.changeVendorId(newValue);
    this.setState({
      selectValue: newValue,
    });
  },

  render() {
    var options = this.state.vendors;
    return (
      <div className="section">
        <Select
          id="state-select"
          placeholder="Select Vendor..."
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

export default AvailableVendorSelector;