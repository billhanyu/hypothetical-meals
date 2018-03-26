import React, { Component } from 'react';
import PropTypes from 'prop-types';
import axios from 'axios';
import Snackbar from 'material-ui/Snackbar';

class DeleteIngredientButton extends Component {
  constructor(props) {
    super(props);
    this.confirmDelete = this.confirmDelete.bind(this);
    this.state = {
      open: false,
      message: '',
    };
  }

  confirmDelete() {
    axios.delete('/ingredients', {
      data: {
        ingredients: [this.props.id]
      },
      headers: {
        Authorization: "Token " + global.token
      }
    })
      .then(response => {
        this.setState({
          open: true,
          message: 'Deleted!',
        });
        this.props.backToList();
      })
      .catch(err => {
        this.setState({
          open: true,
          message: err.response.data,
        });
      });
  }

  handleRequestClose() {
    this.setState({
      open: false,
    });
  }

  render() {
    return (
      <div>
        <div className="btn-group" role="group" aria-label="Basic example">
        <Snackbar
          open={this.state.open}
          message={this.state.message}
          autoHideDuration={2500}
          onRequestClose={this.handleRequestClose.bind(this)}
        />
        <button
          type="button"
          className="btn btn-secondary"
          onClick={this.props.backToList}>
          Back to List
        </button>
        <button
          type="button"
          className="btn btn-danger"
          data-toggle="modal"
          data-target="#deleteIngredientModal"
        >Delete</button>
        </div>
        <div className="modal fade" id="deleteIngredientModal" tabIndex="-1" role="dialog" aria-labelledby="exampleModalLabel" aria-hidden="true">
          <div className="modal-dialog" role="document">
            <div className="modal-content">
              <div className="modal-header">
                <h5 className="modal-title" id="exampleModalLabel">Confirm Delete</h5>
                <button type="button" className="close" data-dismiss="modal" aria-label="Close">
                  <span aria-hidden="true">&times;</span>
                </button>
              </div>
              <div className="modal-body">
                Are you sure you want to delete this ingredient?
              </div>
              <div className="modal-footer">
                <button type="button" className="btn btn-secondary" data-dismiss="modal">Cancel</button>
                <button type="button" className="btn btn-danger" data-dismiss="modal" onClick={this.confirmDelete}>Delete</button>
              </div>
            </div>
          </div>
        </div>
      </div>
    );
  }
}

DeleteIngredientButton.propTypes = {
  id: PropTypes.number,
  backToList: PropTypes.func,
};

export default DeleteIngredientButton;
