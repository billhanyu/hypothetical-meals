import React, { Component } from 'react';
import PropTypes from 'prop-types';
import ProductionRunIngredientTable from './ProductionRunIngredientTable';

class ProductionRunItem extends Component {
  render() {
    const run = this.props.run;
    const idx = this.props.idx;
    const columnClass = "OneFourthWidth";
    return (
      <tbody>
        <tr style={{ 'margin': 0 }} data-toggle="collapse" data-target={`#productionrun_${idx}`} className="accordion-toggle tablerow-hover">
          <td className={columnClass}>{(new Date(run.created_at)).toString().split(' GMT')[0]}</td>
          <td className={columnClass}>{run.user_name}</td>
          <td className={columnClass}>{run.num_product}</td>
          <td className={columnClass}>{run.lot}</td>
        </tr>
        <tr>
          <td colSpan={1} className="hiddenRow"></td>
          <td colSpan={2} className="hiddenRow">
            <div id={`productionrun_${this.props.idx}`} className="accordian-body collapse">
              <ProductionRunIngredientTable ingredients={run.ingredients} />
            </div>
          </td>
          <td colSpan={1} className="hiddenRow"></td>
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
