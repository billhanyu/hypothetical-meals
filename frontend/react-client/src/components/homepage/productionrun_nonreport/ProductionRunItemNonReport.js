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
        <td><FlatButton label="Mark Complete" backgroundColor='#377CC9' labelStyle={{color: '#FFF'}} hoverColor='#4694ec' onClick={() => {this.props.handleClick(this.props.line_id);}}/></td>
      </tr>
    );
  }
}
export default ProductionRunItemNonReport;
