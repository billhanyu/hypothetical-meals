import React, { Component } from 'react';
import ProduceFormulaListNoob from './ProduceFormula/ProduceFormulaListNoob.js';
import axios from 'axios';
import BulkImport from '../ingredient/BulkImport';

class ViewAllFormulas extends Component {
  constructor(props) {
    super(props);
    this.state = {
      EditFormulaBoxes: [],
      bulkImport: false,
    };
    this.backToList = this.backToList.bind(this);
    this.bulkImport = this.bulkImport.bind(this);
  }

  bulkImport() {
    this.setState({
      bulkImport: true,
    });
  }

  backToList() {
    this.setState({
      bulkImport: false,
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

    const bulkImport =
      <BulkImport endpoint='/formulas/import' backToList={this.backToList} />;

    const main =
      <div>
        <div className="ProduceFormulaHeader">
          All Formulas
          {global.user_group == 'admin' && <button type="button" className="btn btn-primary" onClick={this.bulkImport}>Bulk Import</button>}
      </div>
        <div>
          {
            this.state.EditFormulaBoxes.map((element, key) => {
              return <ProduceFormulaListNoob key={key}
                name={element.name}
                num_product={element.num_product}
                ingredients={element.ingredients}
              />;
            })
          }
        </div>
      </div>;
    
    if (this.state.bulkImport) {
      return bulkImport;
    } else {
      return main;
    }
  }
}

export default ViewAllFormulas;
