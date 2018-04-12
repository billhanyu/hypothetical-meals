import React, { Component } from 'react';
import axios from 'axios';
import Snackbar from 'material-ui/Snackbar';
import ProductionRunItemNonReport from './ProductionRunItemNonReport';
import Dialog from 'material-ui/Dialog';
import FlatButton from 'material-ui/FlatButton';

class ProductionRunNonReport extends Component {
  constructor(props) {
    super(props);
    this.state = {
      open: false,
      message: '',
      lines: [],
      modalOpen: false,
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
    const lines = [
      {
        id: 1,
        name: 'line1',
        productionrun_id: 1,
        status: 'Pending',
        formula_name: 'Potatoes',
        quantity: 3,
      },
    ];
    this.setState({
      lines,
    });
  }

  handleRequestClose() {
    this.setState({
      open: false,
    });
  }

  _markProductionRun() {
    //Axios request to mark something as complete
    this.setState({
      modalOpen: false,
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
        <FlatButton label="Back" backgroundColor='#377CC9' labelStyle={{color: '#FFF'}} hoverColor='#4694ec' onClick={this.props.onClick}/>
        <table className="table">
          <thead>
            <tr>
              <th>Name</th>
              <th>Formula</th>
              <th>Status</th>
              <th>Status</th>
              <th></th>
            </tr>
          </thead>
          <tbody>
          {
            this.state.lines.map((line, key) => {
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
      </div>;
  }
}

export default ProductionRunNonReport;
