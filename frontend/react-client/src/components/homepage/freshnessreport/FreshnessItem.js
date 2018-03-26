import React, { Component } from 'react';
import PropTypes from 'prop-types';

class FreshnessItem extends Component {
  render() {
    const { id, name, averageDuration, worstDuration } = this.props.data;
    return (
      <tr>
        <td>
          <a href="javascript:void(0)" onClick={e => this.props.viewIngredient(id)}>{name}</a>
        </td>
        <td>{averageDuration || 'N/A'}</td>
        <td>{worstDuration || 'N/A'}</td>
      </tr>
    );
  }
}

FreshnessItem.propTypes = {
  data: PropTypes.shape({
    id: PropTypes.number,
    name: PropTypes.string,
    averageDuration: PropTypes.number,
    worstDuration: PropTypes.number,
  }),
  viewIngredient: PropTypes.func,
};

export default FreshnessItem;
