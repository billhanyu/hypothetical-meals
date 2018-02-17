import React, { Component } from 'react';
import axios from 'axios';

class BulkImport extends Component {
  constructor(props) {
    super(props);
    this.submit = this.submit.bind(this);
    this.changeFile = this.changeFile.bind(this);
  }

  submit(e) {
    if (!this.file) {
      alert('Please choose some file!');
    }
    const data = new FormData();
    data.set('bulk', this.file);
    axios.post('/ingredients/import', data, {
      headers: { Authorization: "Token " + global.token }
    })
    .then(response => {
      alert('Successfully Imported!');
    })
    .catch(err => {
      alert('Incorrect Format!');
    });
  }

  changeFile(e) {
    this.file = e.target.files[0];
  }

  render() {
    return (
      <div>
        <div className="row justify-content-md-center" style={{'margin-top': '20px'}}>
          <input className="col-*-auto BulkImportFile" type="file" name="bulk" onChange={this.changeFile} />
        </div>
        <div className="row justify-content-md-center">
          <div className="btn-group col-*-auto" role="group" aria-label="Basic example">
            <button className="btn btn-secondary" onClick={this.props.backToList}>Cancel</button>
            <button className="btn btn-primary" onClick={this.submit}>Import</button>
          </div>
        </div>
      </div>
    );
  }
}

export default BulkImport;