import React, { Component } from 'react';
import axios from 'axios';
import Snackbar from 'material-ui/Snackbar';

class BulkImport extends Component {
  constructor(props) {
    super(props);
    this.submit = this.submit.bind(this);
    this.changeFile = this.changeFile.bind(this);
    this.state = {
      open: false,
      message: '',
    };
  }

  submit(e) {
    if (!this.file) {
      this.setState({
        open: true,
        message: 'Please Choose a File.',
      });
      return;
    }
    const data = new FormData();
    data.set('bulk', this.file);
    axios.post(this.props.endpoint, data, {
      headers: { Authorization: "Token " + global.token }
    })
    .then(response => {
      this.setState({
        open: true,
        message: 'Successfully Imported!',
      });
    })
    .catch(err => {
      this.setState({
        open: true,
        message: err.response.data,
      });
    });
  }

  changeFile(e) {
    this.file = e.target.files[0];
  }

  handleRequestClose() {
    this.setState({
      open: false,
    });
  }

  render() {
    return (
      <div>
        <Snackbar
          open={this.state.open}
          message={this.state.message}
          autoHideDuration={2500}
          onRequestClose={this.handleRequestClose.bind(this)}
        />
        <div className="row justify-content-md-center" style={{'margin-top': '20px'}}>
          <input className="col-*-auto BulkImportFile" type="file" name="bulk" onChange={this.changeFile} />
        </div>
        <div className="row justify-content-md-center">
          <div className="btn-group col-*-auto" role="group" aria-label="Basic example">
            <button className="btn btn-secondary" onClick={this.props.backToList}>Cancel</button>
            <button className="btn btn-primary" onClick={this.submit}>Import</button>
          </div>
        </div>
        <div className="row justify-content-md-center">
          Ensure that the file is a CSV and follows the formatting as specified&nbsp;<a href="https://docs.google.com/document/d/17I-GIYnQklkrRr4e2EUlgiejcLClG2CVSYyRdMPHV7Y/edit">here</a>.
        </div>
      </div>
    );
  }
}

export default BulkImport;
