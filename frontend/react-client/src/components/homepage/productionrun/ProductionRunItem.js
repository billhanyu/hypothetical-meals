import React, { Component } from 'react';
import PropTypes from 'prop-types';
import ProductionRunIngredientTable from './ProductionRunIngredientTable';

class ProductionRunItem extends Component {
  render() {
    const run = this.props.run;
    const idx = this.props.idx;
    return (
      <tbody>
        <tr style={{ 'margin': 0 }} data-toggle="collapse" data-target={`#productionrun_${idx}`} className="accordion-toggle tablerow-hover row">
          <td className="col-md-3">{(new Date(run.created_at)).toString().split(' GMT')[0]}</td>
          <td className="col-md-3">{run.username}</td>
          <td className="col-md-3">{run.num_product}</td>
          <td className="col-md-3">{run.lot}</td>
        </tr>
        <tr>
          <td colSpan={1} className="hiddenRow"></td>
          <td colSpan={3} className="hiddenRow">
            <div id={`productionrun_${this.props.idx}`} className="accordian-body collapse">
              <ProductionRunIngredientTable ingredients={this.props.ingredients} />
            </div>
          </td>
        </tr>
      </tbody>
    );
  }
}

ProductionRunItem.propTypes = {
  run: PropTypes.object,
  idx: PropTypes.number,
  ingredients: PropTypes.array,
};

export default ProductionRunItem;
