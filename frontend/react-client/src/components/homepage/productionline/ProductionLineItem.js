import React, { Component } from 'react';
import PropTypes from 'prop-types';

let noCollapseButton = false;

class ProductionLineItem extends Component {
  componentDidMount() {
    this.noCollapse();
  }

  componentDidUpdate() {
    this.noCollapse();
  }

  noCollapse() {
    $('.collapse').unbind().on('show.bs.collapse', function (e) {
      if (noCollapseButton) {
        e.preventDefault();
        noCollapseButton = false;
      }
    });
    $('.no-collapse').unbind().on('click', function (e) {
      noCollapseButton = true;
    });
  }

  render() {
    const { id, idx, name, description, formulas, occupancies } = this.props;
    const busy = occupancies.filter(occupancy => occupancy.busy == 1).length > 0;
    const columnClass = "OneFifthWidth";
    return (
      <tbody>
        <tr style={{ 'margin': 0 }} data-toggle="collapse" data-target={`#productionline_${idx}`} className="accordion-toggle tablerow-hover">
          <td className={columnClass}>{name}</td>
          <td className={columnClass}>{description}</td>
          <td className={columnClass}>
          {
              busy > 0
            ?
              <div>
                <span style={{ color: 'blue' }}>In Progress</span>
                {
                  global.user_group !== 'noob' &&
                  <button
                    type='button'
                    style={{'margin-left': '10px'}}
                    className='btn btn-primary no-collapse'
                    onClick={() => {
                      this.props.markComplete(id);
                    }}>
                    Mark Complete
                  </button>
                }
              </div>
            :
              <span style={{ color: 'green' }}>Idle</span>
          }
          </td>
          {
            global.user_group == 'admin' &&
            <td className={columnClass}>
              <div className="btn-group" role="group" aria-label="Basic example">
                <button
                  type="button"
                  className="btn btn-secondary no-collapse"
                  onClick={e => this.props.edit(idx)}>
                  Edit
                </button>
                <button
                  type="button"
                  className="btn btn-danger no-collapse"
                  onClick={e => this.props.delete(id)}
                  data-toggle="modal"
                  data-target="#deleteProductionlineModal">
                  Delete
                </button>
              </div>
            </td>
          }
        </tr>
        <tr>
          <td colSpan={1} className="hiddenRow"></td>
          <td colSpan={2} className="hiddenRow">
            <div id={`productionline_${this.props.idx}`} className="accordian-body collapse">
              <h4>Formulas that this line produces</h4>
              <table className='table'>
                <tr>
                  <th>
                    Name
                  </th>
                </tr>
                {
                  formulas.map((formula, idx) => {
                    return <tr key={idx}>
                      <td>
                        <a href="javascript:void(0)" onClick={e => this.props.viewFormula(formula.formula_id)}>{formula.name}</a>
                      </td>
                    </tr>;
                  })
                }
              </table>
            </div>
          </td>
          {
            global.user_group == 'admin' &&
            <td colSpan={1} className="hiddenRow"></td>
          }
        </tr>
      </tbody>
    );
  }
}

ProductionLineItem.propTypes = {
  id: PropTypes.number,
  idx: PropTypes.number,
  viewFormula: PropTypes.func,
  name: PropTypes.string,
  description: PropTypes.string,
  formulas: PropTypes.array,
  occupancies: PropTypes.array,
  markComplete: PropTypes.func,
  edit: PropTypes.func,
  delete: PropTypes.func,
};

export default ProductionLineItem;
