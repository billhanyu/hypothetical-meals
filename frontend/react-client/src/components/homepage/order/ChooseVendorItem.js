import React, { Component } from 'react';
import PropTypes from 'prop-types';

class AddEditIngredient extends Component {
  constructor(props) {
    super(props);
    this._handleAmountChange = this._handleAmountChange.bind(this);
  }

  _handleAmountChange(event, objectKey, index) {
    const entries = this.props.lotNumberSet;
    entries[index][objectKey] = event.target.value;
    let count = 0;
    entries.forEach(element => {
      count += element.quantity;
    });
    let fullyAllocated = false;
    if(this.props.item.quantity - count == 0) {
      fullyAllocated = true;
    }
    this.props.updateLotSet(this.props.key, entries, fullyAllocated);
  }

  _createAdditionalLot() {
    const entries = this.props.lotNumberSet;
    entries.push({
      quantity: 0,
      lotNumber: '',
    });
    this.props.updateLotSet(this.props.key, entries);
  }

  render() {
    const {state, lotNumberSet} = this.props;
    let count = 0;
    lotNumberSet.forEach(element => {
      count += element.quantity;
    });
    const leftoverAllocation = this.props.item.quantity - count;

    const ingredient = state["ingredient" + this.props.item.id];
    let vendoringredients = ingredient ? ingredient.vendoringredients : ['N/A'];
    return (
      <div className="form-group" style={{border: '1px solid black', padding:'8px'}}>
        <label htmlFor="vendor">{this.props.item.name} --- {leftoverAllocation == 0 ? '' : `${leftoverAllocation} unallocated`}</label>
        {
          this.props.lotNumberSet.map((element, key) => {
            return <div key={key}>
                <div className="ChooseVendorHeader" style={{display:'inline-block', marginLeft:'12px'}}>Amount:
                  <input placeholder="Amount" value={element.quantity} onChange={(e) => {this._handleAmountChange(e, 'quantity', key);}}/>
                </div>
                <div className="ChooseVendorHeader" style={{display:'inline-block', marginLeft:'12px'}}>Lot Number:
                  <input placeholder="Lot Number" value={element.lotNumber} onChange={(e) => {this._handleAmountChange(e, 'lotNumber', key);}}/>
                </div>
            </div>;
          })
        }
        <div className="ChooseVendorItemButton" onClick={this._createAdditionalLot.bind(this)}>Add Set of Lot Numbers</div>
        <div className="col-*-8">
          <select className="form-control" onChange={e=>this.props.handleInputChange(e, this.props.key)}>
            {
              vendoringredients.map((vendoringredient, idx) => {
                const selectedClass = ingredient && ingredient.selected == vendoringredient.id ? "selected" : "";
                return <option selected={selectedClass} key={idx} value={vendoringredient.id}>{`${vendoringredient.vendor_name} - $${vendoringredient.price} per ${vendoringredient.ingredient_package_type}`}</option>;
              })
            }
          </select>
        </div>
      </div>
    );
  }
}

AddEditIngredient.propTypes = {
  item: PropTypes.object,
  key: PropTypes.number,
  state: PropTypes.object,
  handleInputChange: PropTypes.func,
  handleLotNumberChange: PropTypes.func,
  updateLotSet: PropTypes.func,
  lotNumberSet: PropTypes.array,
};

export default AddEditIngredient;
