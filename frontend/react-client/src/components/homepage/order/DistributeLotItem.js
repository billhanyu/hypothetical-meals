import React, { Component } from 'react';
import axios from 'axios';
import PropTypes from 'prop-types';
import Snackbar from 'material-ui/Snackbar';

class DistributeLotItem extends Component {
  constructor(props) {
    super(props);
    this.state = {
      lots: [],
      fullyAllocated: false,
      noBlankLotNumbers: false,
      open: false,
      message: '',
    };
    this._deleteLotNumberEntry = this._deleteLotNumberEntry.bind(this);
    this.confirm = this.confirm.bind(this);
  }

  getAllocatedQuantity() {
    return this.state.lots.reduce((val, lot) => val + (isNaN(lot.quantity) ? 0 : Number(lot.quantity)), 0);
  }

  checkValidLotSet() {
    const count = this.getAllocatedQuantity();
    let noBlankLotNumbers = true;
    this.state.lots.forEach(element => {
      if (element.lotNumber.length === 0) {
        noBlankLotNumbers = false;
      }
    });
    let fullyAllocated = false;
    if (this.props.order.num_packages - count == 0) {
      fullyAllocated = true;
    }
    this.setState({
      fullyAllocated,
      noBlankLotNumbers,
    });
  }

  _deleteLotNumberEntry(index) {
    const lots = this.state.lots.slice();
    lots.splice(index, 1);
    this.setState({
      lots,
    }, this.checkValidLotSet);
  }

  _handleAmountChange(event, objectKey, index) {
    const lots = this.state.lots.slice();
    lots[index][objectKey] = event.target.value;
    this.setState({
      lots,
    }, this.checkValidLotSet);
  }

  _createAdditionalLot() {
    let lots = this.state.lots.slice();
    lots.push({
      quantity: 0,
      lotNumber: '',
    });
    this.setState({
      lots,
    }, this.checkValidLotSet);
  }

  handleRequestClose() {
    this.setState({
      open: false,
    });
  }

  confirm() {
    let message = ''; let errored = false;
    if (!this.state.noBlankLotNumbers) {
      message += 'Please fill out all lot numbers values -';
      errored = true;
    }
    if (!this.state.fullyAllocated) {
      errored = true;
      message += 'Please fully allocate lot numbers';
    }

    if (errored) {
      return this.setState({
        open: true,
        message,
      });
    }

    const lots = {};
    this.state.lots.forEach(lot => {
      if (Number(lot.quantity) !== 0) {
        lots[lot.lotNumber] = lots[lot.lotNumber] == null ? Number(lot.quantity) : Number(lots[lot.lotNumber]) + Number(lot.quantity);
      }
    });

    axios.post('/order/complete', {
      id: this.props.order.id,
      lots,
    }, {
      headers: {Authorization: 'Token ' + global.token},
    })
      .then(response => {
        this.setState({
          open: true,
          message: 'Order completed!',
        });
        this.props.back();
      })
      .catch(err => {
        this.setState({
          open: true,
          message: 'Order completion failure!',
        });
      });
  }
  
  render() {
    const leftoverAllocation = this.props.order.num_packages - this.getAllocatedQuantity();
    return (
      <div>
        <Snackbar
          open={this.state.open}
          message={this.state.message}
          autoHideDuration={2500}
          onRequestClose={this.handleRequestClose.bind(this)}
        />
        <div className="row justify-content-md-center" style={{'margin-top': '40px'}}>
          <form className="col-xl-6 col-lg-6 col-sm-8">
            <div className="form-group">
              <div className="col-*-8">
                <label htmlFor="vendor">{this.props.order.ingredient.name} ---
                <span style={{ color: 'red' }}>{!this.state.noBlankLotNumbers ? 'Please assign lot numbers to all amounts: ' : ''}</span>
                  <span style={{ color: 'red' }}>{leftoverAllocation == 0 ? '' : `${leftoverAllocation} unallocated`}</span>
                </label>
                {
                  this.state.lots.map((element, key) => {
                    return <div key={key} style={{ borderBottom: '1px solid #000', marginBottom: '10px' }}>
                      <i className="fas fa-times" style={{ cursor: 'pointer' }} onClick={() => { this._deleteLotNumberEntry(key); }}></i>
                      <div className="ChooseVendorHeader" style={{ display: 'inline-block', margin: '12px' }}>Amount:
                        <input placeholder="Amount" value={element.quantity} onChange={(e) => { this._handleAmountChange(e, 'quantity', key); }} />
                      </div>
                      <div className="ChooseVendorHeader" style={{ display: 'inline-block', margin: '12px' }}>Lot Number:
                        <input placeholder="Lot Number" style={element.lotNumber.length === 0 ? { border: '1px solid red' } : null} value={element.lotNumber} onChange={(e) => { this._handleAmountChange(e, 'lotNumber', key); }} />
                      </div>
                    </div>;
                  })
                }
                <div className="ChooseVendorItemButton" onClick={this._createAdditionalLot.bind(this)}>Add Set of Lot Numbers</div>
                <div className="btn-group" role="group" aria-label="Basic example">
                <button
                  type='button'
                  className='btn btn-secondary'
                  onClick={this.props.back}
                >
                  Back
                </button>
                <button
                  type='button'
                  className='btn btn-primary'
                  onClick={this.confirm}
                >
                  Confirm
                </button>
                </div>
              </div>
            </div>
          </form>
        </div>
      </div>
    );
  }
}

DistributeLotItem.propTypes = {
  order: PropTypes.object,
  back: PropTypes.func,
};

export default DistributeLotItem;
