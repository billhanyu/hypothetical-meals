import React, { Component } from 'react';
import FlatButton from 'material-ui/FlatButton';

class ProductionRunItemNonReport extends Component {
  render() {
    const { line_id, name, isactive, formula} = this.props;
    return (
      <tr>
        <td>{name}</td>
        <td>{formula}</td>
        <td>{line_id}</td>
        <td>{isactive ? 'ACTIVE' : "INACTIVE"}</td>
        <td>
          {
            isactive
            ? <button 
                type='button'
                className='btn btn-primary'
                onClick={() => {this.props.handleClick(this.props.line_id);}}>
                Mark Complete
              </button>
            : ''
          }
        </td>
      </tr>
    );
  }
}
export default ProductionRunItemNonReport;
