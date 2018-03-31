import React, { Component } from 'react';
import PropTypes from 'prop-types';
import axios from 'axios';
import QuantityByLotTableItem from './QuantityByLotTableItem';
import Snackbar from 'material-ui/Snackbar';

class QuantityByLotTable extends Component {
  constructor(props) {
    super(props);
    this.state = {
      lots: [],
      editQuantity: '',
      editIdx: -1,
      open: false,
      message: '',
    };
    this.edit = this.edit.bind(this);
    this.changeQuantity = this.changeQuantity.bind(this);
    this.cancelEdit = this.cancelEdit.bind(this);
    this.finishEdit = this.finishEdit.bind(this);
  }

  handleRequestClose() {
    this.setState({
      open: false,
    });
  }

  edit(idx) {
    this.setState({
      editIdx: idx,
      editQuantity: this.state.lots[idx].quantity.toFixed(2),
    });
  }

  changeQuantity(event) {
    this.setState({
      editQuantity: event.target.value,
    });
  }

  cancelEdit() {
    this.setState({
      editIdx: -1,
    });
  }

  finishEdit() {
    const putObj = {};
    const id = this.state.lots[this.state.editIdx].inventory_id;
    const newQuantity = this.state.editQuantity / this.props.ingredient.num_native_units;
    putObj[id] = newQuantity;
    axios.put('/inventory/admin', {
      changes: putObj
    }, {
        headers: { Authorization: "Token " + global.token }
      })
      .then(response => {
        this.setState({
          editIdx: -1,
        });
        this.reloadData();
      })
      .catch(err => {
        const message = err.response.data;
        this.setState({
          open: true,
          message,
        });
      });
  }

  componentDidMount() {
    this.reloadData();
  }

  reloadData() {
    axios.get(`/inventory/lot/${this.props.ingredient.id}`, {
      headers: { Authorization: "Token " + global.token }
    })
      .then(response => {
        this.setState({
          lots: response.data
        });
        if (this.props.refreshInventories) {
          this.props.refreshInventories();
        }
      })
      .catch(err => {
      });
  }

  render() {
    const columnClass = global.user_group == "admin" ? "OneFourthWidth" : "OneThirdWidth";
    return (
      <div>
        {
          this.props.withTitle &&
          <h3>Quantities by Lot Numbers</h3>
        }
        <Snackbar
          open={this.state.open}
          message={this.state.message}
          autoHideDuration={2500}
          onRequestClose={this.handleRequestClose.bind(this)}
        />
      <table className="table">
        <thead>
          <th className={columnClass}>Lot Number</th>
          <th className={columnClass}>Vendor</th>
          <th className={columnClass}>Quantity</th>
          {
            global.user_group == "admin" &&
            <th className={columnClass}>Options</th>
          }
        </thead>
        <tbody>
        {
          this.state.lots.map((lot, idx) =>
            <QuantityByLotTableItem
              key={idx}
              lot={lot}
              idx={idx}
              ingredient={this.props.ingredient}
              columnClass={columnClass}
              editQuantity={this.state.editQuantity}
              editIdx={this.state.editIdx}
              cancelEdit={this.cancelEdit}
              finishEdit={this.finishEdit}
              edit={this.edit}
              changeQuantity={this.changeQuantity}
            />)
        }
        </tbody>
      </table>
      </div>
    );
  }
}

QuantityByLotTable.propTypes = {
  ingredient: PropTypes.shape({
    id: PropTypes.number.isRequired,
    native_unit: PropTypes.string.isRequired,
    num_native_units: PropTypes.number.isRequired,
  }).isRequired,
  withTitle: PropTypes.bool,
  refreshInventories: PropTypes.func,
};

export default QuantityByLotTable;
