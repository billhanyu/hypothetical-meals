import React from 'react';
import createClass from 'create-react-class';
import axios from 'axios';
import Select from 'react-select';
import '!style-loader!css-loader!react-select/dist/react-select.css';

const VendorSelector = createClass({
  displayName: 'Vendor',

  getInitialState() {
    return {
      country: 'AU',
      disabled: false,
      searchable: this.props.searchable,
      selectValue: 'new-south-wales',
      clearable: true,
      rtl: false,
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

  switchCountry(e) {
    var newCountry = e.target.value;
    this.setState({
      country: newCountry,
      selectValue: null,
    });
  },

  updateValue(newValue) {
    this.props.changeVendorId(newValue);
    this.setState({
      selectValue: newValue,
    });
  },

  focusStateSelect() {
    this.refs.stateSelect.focus();
  },

  toggleCheckbox(e) {
    let newState = {};
    newState[e.target.name] = e.target.checked;
    this.setState(newState);
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

export default VendorSelector;
