import React from 'react';
import createClass from 'create-react-class';
import axios from 'axios';
import Select from 'react-select';
import '!style-loader!css-loader!react-select/dist/react-select.css';
import Snackbar from 'material-ui/Snackbar';

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
        const vendorsAll = response.data.map(vendor => {
          vendor.value = vendor.id;
          vendor.label = vendor.name;
          return vendor;
        });
        const vendors = vendorsAll.filter(element => {
          return element.id !== 1;
        });
        this.setState({
          vendors,
        });
      })
      .catch(err => {
        this.setState({
          open: true,
          message: "Error retrieving Vendors",
        });
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

  handleRequestClose() {
    this.setState({
      open: false,
    });
  },

  render() {
    var options = this.state.vendors;
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
