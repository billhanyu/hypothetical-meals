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
    const lines = [];
    axios.get(`/productionlines`, {headers: {Authorization: "Token " + global.token}})
    .then(response => {
      response.data.forEach(element => {
        console.log(element);
        lines.push({
          line_id: element.id,
          name: element.name,
          isactive: element.occupancies.length !== 0,
          formula: element.occupancies.length === 0 ? 'N/A' : element.occupancies[0].formula_name
        });
      });
      this.setState({
        lines,
      });
    })
    .catch(error => {
      console.log(error);
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
              <th>ID</th>
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
