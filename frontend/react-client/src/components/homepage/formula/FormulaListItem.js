import React, { Component } from 'react';
import Snackbar from 'material-ui/Snackbar';
import PropTypes from 'prop-types';
import FormulaIngredientsTable from './FormulaIngredientsTable';

let noCollapseButton = false;

class FormulaListItem extends Component {
  constructor(props) {
    super(props);
    this.state = {
      open: false,
      message: '',
    };
  }

  componentDidUpdate() {
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

  handleRequestClose() {
    this.setState({
      open: false,
    });
  }

  render() {
    const { id, name, description, num_product, ingredients, columnClass } = this.props;
    return (
      <tbody>
        <Snackbar
          open={this.state.open}
          message={this.state.message}
          autoHideDuration={2500}
          onRequestClose={this.handleRequestClose.bind(this)}
        />
        <tr data-toggle="collapse" data-target={`#formula_${this.props.idx}`} className="accordion-toggle tablerow-hover">
          <td className={columnClass}><a href="javascript:void(0)" onClick={e => this.props.edit(this.props.idx)}>{name}</a></td>
          <td className={columnClass}>{description}</td>
          <td className={columnClass}>{num_product}</td>
          {
            <td className={columnClass}>
              <div className="btn-group" role="group" aria-label="Basic example">
                <button
                  type="button"
                  className="btn btn-secondary no-collapse"
                  onClick={e => this.props.edit(this.props.idx)}>
                  Edit
              </button>
                <button
                  type="button"
                  className="btn btn-danger no-collapse"
                  onClick={e => this.props.delete(id)}
                  data-toggle="modal"
                  data-target="#deleteFormulaModal">
                  Delete
              </button>
              </div>
            </td>
          }
        </tr>
        <tr>
          <td colSpan={1} className="hiddenRow"></td>
          <td colSpan={2} className="hiddenRow">
            <div id={`formula_${this.props.idx}`} className="accordian-body collapse">
              <FormulaIngredientsTable ingredients={Object.values(ingredients)} viewIngredient={this.props.viewIngredient} />
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

FormulaListItem.propTypes = {
  idx: PropTypes.number,
  edit: PropTypes.func,
  delete: PropTypes.func,
  viewIngredient: PropTypes.func,
  id: PropTypes.number,
  name: PropTypes.string,
  description: PropTypes.string,
  num_product: PropTypes.number,
  ingredients: PropTypes.array,
  columnClass: PropTypes.string,
};

export default FormulaListItem;
