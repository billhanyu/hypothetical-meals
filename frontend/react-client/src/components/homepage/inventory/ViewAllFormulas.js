import React, { Component } from 'react';
import ProduceFormulaHeader from './ProduceFormula/ProduceFormulaHeader.js';
import ProduceFormulaListNoob from './ProduceFormula/ProduceFormulaListNoob.js';
import axios from 'axios';

class ViewAllFormulas extends Component {
  constructor(props) {
    super(props);
    this.state = {
      EditFormulaBoxes: [],
    };
  }

  componentWillMount() {
    axios.get(`/formulas`, {
      headers: {Authorization: "Token " + global.token}
    })
    .then(response => {
      this.setState({
        EditFormulaBoxes: response.data
      });
    });
  }

  render() {
    return (
      <div>
      <div className="ProduceFormulaHeader">
        All Formulas
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
      </div>
    );
  }
}

export default ViewAllFormulas;
