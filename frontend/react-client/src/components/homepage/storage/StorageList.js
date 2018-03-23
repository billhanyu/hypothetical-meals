import React, { Component } from 'react';
import axios from 'axios';
import Snackbar from 'material-ui/Snackbar';

class StorageList extends Component {
  constructor(props) {
    super(props);
    this.state = {
      storages: [],
      editIdx: -1,
      editCapacity: 0,
    };
    this.edit = this.edit.bind(this);
    this.changeCapacity = this.changeCapacity.bind(this);
    this.cancelEdit = this.cancelEdit.bind(this);
    this.finishEdit = this.finishEdit.bind(this);
  }

  componentDidMount() {
    this.reloadData();
  }

  reloadData() {
    axios.get('/storages', {
      headers: { Authorization: "Token " + global.token }
    })
      .then(response => {
        this.setState({
          storages: response.data,
        });
      })
      .catch(err => {
        this.setState({
          open: true,
          message: "Error getting storages",
        });
      });
  }

  edit(idx) {
    this.setState({
      editIdx: idx,
      editCapacity: this.state.storages[idx].capacity,
    });
  }

  changeCapacity(event) {
    this.setState({
      editCapacity: event.target.value,
    });
  }

  cancelEdit() {
    this.setState({
      editIdx: -1,
    });
  }

  finishEdit() {
    const putObj = {};
    const id = this.state.storages[this.state.editIdx].id;
    putObj[id] = this.state.editCapacity;
    axios.put('/storages', putObj, {
      headers: { Authorization: "Token " + global.token }
    })
    .then(response => {
      this.setState({
        editIdx: -1,
        open: true,
        message: "Updated",
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

  handleRequestClose() {
    this.setState({
      open: false,
    });
  }

  render() {
    const columnClass = global.user_group == "admin" ? "OneFifthWidth" : "OneFourthWidth";
    return (
      <div>
        <h2>Storages</h2>
        <Snackbar
          open={this.state.open}
          message={this.state.message}
          autoHideDuration={2500}
          onRequestClose={this.handleRequestClose.bind(this)}
        />
        <table className="table">
          <thead>
            <tr>
              <th className={columnClass}>id</th>
              <th className={columnClass}>Name</th>
              <th className={columnClass}>Capacity</th>
              <th className={columnClass}>Occupied Space</th>
              {
                global.user_group == 'admin' &&
                <th className={columnClass}>Options</th>
              }
            </tr>
          </thead>
          <tbody>
            {
              this.state.storages.map((storage, idx) => {
                return (
                  <tr key={idx}>
                    <td className={columnClass}>{storage.id}</td>
                    <td className={columnClass}>{storage.name}</td>
                    <td className={columnClass}>
                      {
                        this.state.editIdx == idx
                          ?
                          <div>
                            <input type="number" style={{'width': '100px'}} onChange={this.changeCapacity} value={this.state.editCapacity} />
                            <span>&nbsp;&nbsp;sqft</span>
                          </div>
                          :
                          storage.capacity + " sqft"
                      }
                    </td>
                    <td className={columnClass}>{storage.used.toFixed(2) + " sqft"}</td>
                    {
                      global.user_group == 'admin' && this.state.editIdx !== idx &&
                      <td className={columnClass}>
                        <button
                          type="button"
                          className="btn btn-secondary"
                          onClick={e => this.edit(idx)}>
                          Edit
                        </button>
                      </td>
                    }
                    {
                      global.user_group == 'admin' && this.state.editIdx == idx &&
                      <td className={columnClass}>
                      <div className="btn-group" role="group" aria-label="Basic example">
                        <button
                          type="button"
                          className="btn btn-secondary"
                          onClick={this.cancelEdit}>
                          Cancel
                        </button>
                        <button
                          type="button"
                          className="btn btn-primary"
                          onClick={this.finishEdit}>
                          Confirm
                        </button>
                      </div>
                    </td>
                    }
                  </tr>
                );
              })
            }
          </tbody>
        </table>
      </div>
    );
  }
}

export default StorageList;
