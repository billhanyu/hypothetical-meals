import React, { Component } from 'react';
import axios from 'axios';
import Snackbar from 'material-ui/Snackbar';
import ProductionRunItemNonReport from './ProductionRunItemNonReport';
import Dialog from 'material-ui/Dialog';
import FlatButton from 'material-ui/FlatButton';
import Checkbox from 'material-ui/Checkbox';

class ProductionRunNonReport extends Component {
  constructor(props) {
    super(props);
    this.state = {
      open: false,
      message: '',
      lines: [],
      filteredLines: [],
      modalOpen: false,
      checkedActive: false,
      checkedInactive: false,
      productLot: '',
    };
    this.reloadData = this.reloadData.bind(this);
  }

  /**** REQUIRED PROPS
    1. onClick (Func)
  */

  componentDidMount() {
    this.reloadData();
  }

  reloadData() {
    const lines = [];
    axios.get(`/productionlines`, {headers: {Authorization: "Token " + global.token}})
    .then(response => {
      response.data.forEach(element => {
        lines.push({
          occupancies: element.occupancies,
          line_id: element.id,
          name: element.name,
          isactive: element.occupancies.length !== 0,
          formula: element.occupancies.length === 0 ? 'N/A' : element.occupancies[0].formula_name
        });
      });
      this.setState({
        lines,
        filteredLines: lines,
      });
    })
    .catch(error => {
      this.state({
        open: true,
        message: 'Error retrieving production runs data'
      });
    });
  }

  handleRequestClose() {
    this.setState({
      open: false,
    });
  }

  _markProductionRun() {
    //Axios request to mark something as complete
    const productionline_id = this.state.markedId;
    axios.post('/productionlines/complete', {productionline_id,}, {headers: {Authorization: "Token " + global.token},})
      .then(response => {
        this.setState({
          modalOpen: false,
          open: true,
          message: 'Success!',
        }, () => {
          this.reloadData();
        });
        const runId = this.state.filteredLines.filter(line => line.line_id == productionline_id)[0].occupancies.filter(item => item.busy == 1)[0].productrun_id;
        return axios.get(`/productruns/id/${runId}`, {
          headers: { Authorization: 'Token ' + global.token }
        });
      })
      .then(response => {
        this.setState({
          productLot: response.data[0].lot,
        }, () => {
          $('#productLotModal').modal('show');
        });
      })
      .catch(error => {
        this.setState({
          modalOpen: false,
          open: true,
          message: 'Error marking complete',
        });
      });
  }

  _handleCompleteClick(id) {
    this.setState({
      modalOpen: true,
      markedId: id,
    });
  }

  handleModalClose() {
    this.setState({
      modalOpen: false,
    });
  }

  updateCheckActive() {
    this.filterList(!this.state.checkedActive, this.state.checkedInactive);
    this.setState({
      checkedActive: !this.state.checkedActive,
    });
  }

  updateCheckInactive() {
    this.filterList(this.state.checkedActive, !this.state.checkedInactive);
    this.setState({
      checkedInactive: !this.state.checkedInactive,
    });
  }

  filterList(checkedActive, checkedInactive) {
    let filteredLines = this.state.lines;
    let newList = this.state.lines;
    if(checkedActive) {
      newList = filteredLines.filter(element => {
        return element.occupancies.length !== 0;
      });
    }
    if(checkedInactive) {
      newList = filteredLines.filter(element => {
        return element.occupancies.length === 0;
      });
    }

    this.setState({
      filteredLines: newList,
    });
  }

  render() {
    const actions = [
      <FlatButton
        key={1}
        label="Cancel"
        primary={true}
        onClick={this.handleModalClose.bind(this)}
      />,
      <FlatButton
        key={2}
        label="Submit"
        primary={true}
        keyboardFocused={true}
        onClick={this._markProductionRun.bind(this)}
      />,
    ];

    return <div>
        <Snackbar
          open={this.state.open}
          message={this.state.message}
          autoHideDuration={2500}
          onRequestClose={this.handleRequestClose.bind(this)}
        />
        <Dialog
          title="Confirm Action"
          actions={actions}
          modal={false}
          open={this.state.modalOpen}
          onRequestClose={this.handleClose}
        >
          Mark production run as complete?
        </Dialog>
        <h2>Production Runs</h2>
        <Checkbox
          label="Show Only Active Runs"
          checked={this.state.checkedActive}
          onCheck={this.updateCheckActive.bind(this)}
        />
        <Checkbox
          label="Show Only Inactive Runs"
          checked={this.state.checkedInactive}
          onCheck={this.updateCheckInactive.bind(this)}
        />
        <button
          type='button'
          className='btn btn-secondary'
          onClick={this.props.onClick}>
          Back
        </button>
        <table className="table">
          <thead>
            <tr>
              <th>Name</th>
              <th>Formula</th>
              <th>ID</th>
              <th>Status</th>
              <th></th>
            </tr>
          </thead>
          <tbody>
          {
            this.state.filteredLines.map((line, key) => {
              return (
                <ProductionRunItemNonReport
                  key={key}
                  handleClick={this._handleCompleteClick.bind(this)}
                  {...line}
                />
              );
            })
          }
          </tbody>
        </table>
        <div className="modal fade" id="productLotModal" tabIndex="-1" role="dialog" aria-labelledby="exampleModalLabel" aria-hidden="true">
          <div className="modal-dialog" role="document">
            <div className="modal-content">
              <div className="modal-header">
                <h5 className="modal-title" id="exampleModalLabel">Lot Number</h5>
                <button type="button" className="close" data-dismiss="modal" aria-label="Close">
                  <span aria-hidden="true">&times;</span>
                </button>
              </div>
              <div className="modal-body">
                Product Lot: {this.state.productLot}
              </div>
              <div className="modal-footer">
                <button type="button" className="btn btn-primary" data-dismiss="modal">Acknowledged</button>
              </div>
            </div>
          </div>
        </div>
      </div>;
  }
}

export default ProductionRunNonReport;
