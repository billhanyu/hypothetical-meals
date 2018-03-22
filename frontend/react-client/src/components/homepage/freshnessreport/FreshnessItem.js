import React, { Component } from 'react';
import PropTypes from 'prop-types';

class FreshnessItem extends Component {
  render() {
    const { name, average, worst } = this.props.data;
    return (
      <tr>
        <td>{name}</td>
        <td>{average}</td>
        <td>{worst}</td>
      </tr>
    );
  }
}

FreshnessItem.propTypes = {
  data: PropTypes.shape({
    name: PropTypes.string,
    average: PropTypes.number,
    worst: PropTypes.number,
  }),
};

export default FreshnessItem;
