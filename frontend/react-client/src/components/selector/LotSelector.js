import React from 'react';
import createClass from 'create-react-class';
import Select from 'react-select';
import '!style-loader!css-loader!react-select/dist/react-select.css';

/*
 * selects an ingredient regardless of removed status (all ingredients)
 * props.changeLot(newValue): changes the id selected
*/

const LotSelector = createClass({
  displayName: 'Lot',

  getInitialState() {
    return {
      disabled: false,
      searchable: this.props.searchable,
      selectValue: '',
      clearable: true,
      rtl: false,
      lots: [],
    };
  },

  componentWillReceiveProps(nextProps) {
    const arr = nextProps.lots || [];
    const lots = arr.map(lot => {
      return {
        value: lot,
        label: lot,
      };
    });
    this.setState({
      lots,
    });
  },

  clearValue(e) {
    this.select.setInputValue('');
  },

  updateValue(newValue) {
    this.props.changeLot(newValue);
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
    var options = this.state.lots;
    return (
      <div className="section" style={{ 'width': '400px' }}>
        <Select
          id="state-select"
          placeholder="Select Lot..."
          ref={(ref) => { this.select = ref; }}
          onBlurResetsInput={false}
          onSelectResetsInput={false}
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

export default LotSelector;
