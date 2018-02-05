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
      headers: { Authorization: "Token " + this.props.token }
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
      <div className="BulkImport">
        <input className="BulkImportFile" type="file" name="bulk" onChange={this.changeFile}/>
        <div className="BulkImportButton">
          <button className="UserButton btn btn-primary BulkImportSubmit" onClick={this.submit}>Import</button>
        </div>
      </div>
    );
  }
}

export default BulkImport;
