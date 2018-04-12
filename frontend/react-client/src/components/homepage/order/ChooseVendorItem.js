import React, { Component } from 'react';
import PropTypes from 'prop-types';

class ChooseVendorItem extends Component {
  constructor(props) {
    super(props);
  }

  render() {
    const {state, item} = this.props;
    const ingredient = state["ingredient" + item.id];
    let vendoringredients = ingredient ? ingredient.vendoringredients : ['N/A'];
    return (
      <div className="form-group">
        <div className="col-*-8">
          <label htmlFor="vendor">{this.props.item.name}</label>
          <select className="form-control" onChange={e=>this.props.handleInputChange(e, this.props.idx)}>
            {
              vendoringredients.map((vendoringredient, idx) => {
                const selectedClass = ingredient && ingredient.selected == vendoringredient.id ? "selected" : "";
                return <option selected={selectedClass} key={idx} value={vendoringredient.id}>{`${vendoringredient.vendor_name} - $${vendoringredient.price} per ${vendoringredient.ingredient_package_type}`}</option>;
              })
            }
          </select>
        </div>
      </div>
    );
  }
}

ChooseVendorItem.propTypes = {
  item: PropTypes.object,
  idx: PropTypes.number,
  state: PropTypes.object,
  handleInputChange: PropTypes.func,
};

export default ChooseVendorItem;
