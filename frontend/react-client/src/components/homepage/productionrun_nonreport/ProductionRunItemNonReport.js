import React, { Component } from 'react';
import FlatButton from 'material-ui/FlatButton';

class ProductionRunItemNonReport extends Component {
  render() {
    const { id, name, productionrun_id, status, formula_name, quantity} = this.props;
    return (
      <tr>
        <td>{name}</td>
        <td>{formula_name}</td>
        <td>{quantity}</td>
        <td>{status}</td>
        <td><FlatButton label="Mark Complete" backgroundColor='#377CC9' labelStyle={{color: '#FFF'}} hoverColor='#4694ec' onClick={() => {this.props.handleClick(this.props.id);}}/></td>
      </tr>
    );
  }
}
export default ProductionRunItemNonReport;
