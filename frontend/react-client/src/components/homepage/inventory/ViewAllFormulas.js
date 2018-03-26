import React, { Component } from 'react';
import ProduceFormulaListNoob from './ProduceFormula/ProduceFormulaListNoob.js';
import axios from 'axios';
import BulkImport from '../ingredient/BulkImport';

class ViewAllFormulas extends Component {
  constructor(props) {
    super(props);
    this.state = {
      EditFormulaBoxes: [],
      finalBulkImport: false,
      intermediateBulkImport: false,
    };
    this.backToList = this.backToList.bind(this);
    this.finalBulkImport = this.finalBulkImport.bind(this);
    this.intermediateBulkImport = this.intermediateBulkImport.bind(this);
  }

  finalBulkImport() {
    this.setState({
      finalBulkImport: true,
    });
  }

  intermediateBulkImport() {
    this.setState({
      intermediateBulkImport: true,
    });
  }

  backToList() {
    this.setState({
      intermediateBulkImport: false,
      finalBulkImport: false,
    });
    this.reloadData();
  }

  componentWillMount() {
    this.reloadData();
  }

  reloadData() {
    axios.get('/formulas', {
      headers: { Authorization: "Token " + global.token }
    })
      .then(response => {
        this.setState({
          EditFormulaBoxes: response.data
        });
      });
  }

  render() {
    const finalBulkImport =
      <BulkImport endpoint='/formulas/import/final' backToList={this.backToList} />;
    const intermediateBulkImport =
      <BulkImport endpoint='/formulas/import/intermediate' backToList={this.backToList} />;
    const main =
      <div>
        <div className="ProduceFormulaHeader">
          All Formulas
          {global.user_group == 'admin' && <button style={{margin: '0 8px'}} type="button" className="btn btn-primary" onClick={this.finalBulkImport}>Final Product Bulk Import</button>}
          {global.user_group == 'admin' && <button style={{margin: '0 8px'}} type="button" className="btn btn-primary" onClick={this.intermediateBulkImport}>Intermediate Product Bulk Import</button>}
        </div>
        <table className="table">
          <thead>
            <tr>
              <th>Name</th>
              <th>Package Amount</th>
              <th>Number of Ingredients</th>
            </tr>
          </thead>
          <tbody>
            {
              this.state.EditFormulaBoxes.map((element, key) => {
                return <tr key={key}>
                  <td>{element.name}</td>
                  <td>{element.num_product}</td>
                  <td>{Object.keys(element.ingredients).length}</td>
                </tr>;
              })
            }
          </tbody>
        </table>
      </div>;

    if (this.state.finalBulkImport) {
      return finalBulkImport;
    }
    else if (this.state.intermediateBulkImport) {
        return intermediateBulkImport;
    } else {
      return main;
    }
  }
}

export default ViewAllFormulas;
