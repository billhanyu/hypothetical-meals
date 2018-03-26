import React, { Component } from 'react';
import PropTypes from 'prop-types';

class AddEditIngredient extends Component {
  constructor(props) {
    super(props);
    this._handleAmountChange = this._handleAmountChange.bind(this);
    this._deleteLotNumberEntry = this._deleteLotNumberEntry.bind(this);
  }

  _deleteLotNumberEntry(index) {
    const {lotNumberSet} = this.props;
    const entries = lotNumberSet[this.props.item.id];
    entries.splice(index, 1);
    let count = 0;
    entries.forEach(element => {
      count += Number(element.quantity);
    });
    let fullyAllocated = false;
    if(this.props.item.quantity - count == 0) {
      fullyAllocated = true;
    }
    this.props.updateLotSet(lotNumberSet, fullyAllocated);
  }

  _handleAmountChange(event, objectKey, index) {
    const {lotNumberSet} = this.props;
    const entries = lotNumberSet[this.props.item.id];
    //This is an array
    entries[index][objectKey] = event.target.value;
    let count = 0;
    entries.forEach(element => {
      count += Number(element.quantity);
    });
    let fullyAllocated = false;
    if(this.props.item.quantity - count == 0) {
      fullyAllocated = true;
    }
    this.props.updateLotSet(lotNumberSet, fullyAllocated);
  }

  _createAdditionalLot() {
    const {lotNumberSet} = this.props;
    let entries = lotNumberSet[this.props.item.id];
    if(entries != null) {
      entries.push({
        quantity: 0,
        lotNumber: '',
      });
    }
    else {
      lotNumberSet[this.props.item.id] = [{quantity: 0, lotNumber: '',}];
      entries = this.props.lotNumberSet[this.props.item.id];
    }
    let count = 0;
    entries.forEach(element => {
      count += Number(element.quantity);
    });
    let fullyAllocated = false;
    if(this.props.item.quantity - count == 0) {
      fullyAllocated = true;
    }
    this.props.updateLotSet(lotNumberSet, fullyAllocated);
  }

  render() {
    const {state, lotNumberSet, item} = this.props;
    let count = 0;
    if(lotNumberSet[item.id] != null){
      lotNumberSet[item.id].forEach(element => {
        count += Number(element.quantity);
      });
    }
    const leftoverAllocation = this.props.item.quantity - count;

    const ingredient = state["ingredient" + this.props.item.id];
    let vendoringredients = ingredient ? ingredient.vendoringredients : ['N/A'];
    return (
      <div className="form-group" style={{border: '1px solid black', padding:'8px'}}>
        <label htmlFor="vendor">{this.props.item.name} --- <span style={{color: 'red'}}>{leftoverAllocation == 0 ? '' : `${leftoverAllocation} unallocated`}</span></label>
        {
          this.props.lotNumberSet[item.id] != null && this.props.lotNumberSet[item.id].map((element, key) => {
            return <div key={key} style={{borderBottom: '1px solid #000', marginBottom:'10px'}}>
                <i className="fas fa-times" style={{cursor:'pointer'}} onClick={() => {this._deleteLotNumberEntry(key);}}></i>
                <div className="ChooseVendorHeader" style={{display:'inline-block', margin:'12px'}}>Amount:
                  <input placeholder="Amount" value={element.quantity} onChange={(e) => {this._handleAmountChange(e, 'quantity', key);}}/>
                </div>
                <div className="ChooseVendorHeader" style={{display:'inline-block', margin:'12px'}}>Lot Number:
                  <input placeholder="Lot Number" value={element.lotNumber} onChange={(e) => {this._handleAmountChange(e, 'lotNumber', key);}}/>
                </div>
            </div>;
          })
        }
        <div className="ChooseVendorItemButton" onClick={this._createAdditionalLot.bind(this)}>Add Set of Lot Numbers</div>
        <div className="col-*-8">
          <select className="form-control" onChange={e=>this.props.handleInputChange(e, this.props.idx)}>
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
  idx: PropTypes.number,
  state: PropTypes.object,
  handleInputChange: PropTypes.func,
  handleLotNumberChange: PropTypes.func,
  updateLotSet: PropTypes.func,
  lotNumberSet: PropTypes.array,
};

export default AddEditIngredient;
