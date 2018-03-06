import React, { Component } from 'react';
import PropTypes from 'prop-types';

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
              <table className="table">
                <thead>
                  <th>Ingredient</th>
                  <th>Quantity</th>
                  <th>Lot Number</th>
                </thead>
                <tbody>
                  {
                    this.props.ingredients.map((ingredient, idx) => {
                      return (
                        <tr key={idx}>
                          <td>{ingredient.ingredient_name}</td>
                          <td>{ingredient.ingredient_num_native_units}</td>
                          <td>{ingredient.ingredient_lot_number}</td>
                        </tr>
                      );
                    })
                  }
                </tbody>
              </table>
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
