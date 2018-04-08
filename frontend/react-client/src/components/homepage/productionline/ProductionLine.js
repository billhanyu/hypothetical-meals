import React, { Component } from 'react';
import axios from 'axios';
import Snackbar from 'material-ui/Snackbar';
import { COUNT_PER_PAGE } from '../../Constants/Pagination';
import ProductionLineItem from './ProductionLineItem';
import AddEditProductionLine from './AddEditProductionLine';
import PageBar from '../../GeneralComponents/PageBar';
import FormulaWindow from '../Formula/FormulaWindow';

class ProductionLine extends Component {
  constructor(props) {
    super(props);
    this.state = {
      pagedLines: [],
      line: null,
      viewLine: false,
      formula: null,
      viewFormula: false,
      pages: 1,
      page: 1,
      toDelete: 0,
      adding: false,
      editing: false,
      editingIdx: -1,
      open: false,
      message: '',
    };
    this.selectPage = this.selectPage.bind(this);
    this.delete = this.delete.bind(this);
    this.confirmDelete = this.confirmDelete.bind(this);
    this.add = this.add.bind(this);
    this.edit = this.edit.bind(this);
    this.backToList = this.backToList.bind(this);
    this.reloadData = this.reloadData.bind(this);
    this.markComplete = this.markComplete.bind(this);
    this.viewFormula = this.viewFormula.bind(this);
  }

  backToList() {
    this.setState({
      adding: false,
      viewFormula: false,
      editing: false,
    });
  }

  add() {
    this.setState({
      adding: true,
    });
  }

  edit(idx) {
    this.setState({
      editing: true,
      editingIdx: idx,
    });
  }

  componentWillMount() {
    this.reloadData();
  }

  reloadData() {
    /* waiting for backend api
    axios.get('/productionlines', {
      headers: { Authorization: "Token " + global.token }
    })
      .then(response => {
        this.lines = response.data;
        this.selectPage(1);
        this.setState({
          pages: Math.ceil(response.data.length / COUNT_PER_PAGE),
        });
      })
      .catch(err => {
        this.setState({
          open: true,
          message: err.response.data
        });
      });
    */
    this.lines = [
      {
        id: 1,
        name: 'line1',
        description: 'des1',
        productionrun_id: 1,
        formulas: [
          {
            id: 1,
            name: 'formula1',
          },
          {
            id: 2,
            name: 'formula2',
          }
        ],
      },
      {
        id: 2,
        name: 'line2',
        description: 'des2',
        formulas: [
          {
            id: 3,
            name: 'formula3',
          },
          {
            id: 4,
            name: 'formula4',
          }
        ],
      },
    ];
    this.selectPage(1);
    this.setState({
      pages: Math.ceil(this.lines.length / COUNT_PER_PAGE),
    });
  }

  selectPage(idx) {
    const pagedLines = [];
    for (let i = (idx - 1) * COUNT_PER_PAGE; i < idx * COUNT_PER_PAGE && i < this.lines.length; i++) {
      pagedLines.push(this.lines[i]);
    }
    this.setState({
      pagedLines,
      currentPage: idx,
    });
  }

  delete(id) {
    this.setState({
      toDelete: id,
    });
  }

  viewFormula(id) {
    axios.get(`/formulas/id/${id}`, {
      headers: { Authorization: "Token " + global.token }
    })
      .then(response => {
        this.setState({
          formula: response.data[0],
          viewFormula: true,
        });
      })
      .catch(err => {
        console.log(err);
        this.setState({
          open: true,
          message: 'Error retrieving formula data'
        });
      });
  }

  confirmDelete() {
    axios.delete('/productionlines', {
      data: {
        ids: [this.state.toDelete]
      },
      headers: { Authorization: "Token " + global.token }
    })
      .then(response => {
        this.reloadData();
        this.setState({
          open: true,
          message: "Deleted"
        });
      })
      .catch(err => {
        this.setState({
          open: true,
          message: err.response.data
        });
      });
  }

  handleRequestClose() {
    this.setState({
      open: false,
    });
  }

  markComplete(id) {
    // REQUEST
    // then reload data
  }

  render() {
    const main =
      <div>
        <Snackbar
          open={this.state.open}
          message={this.state.message}
          autoHideDuration={2500}
          onRequestClose={this.handleRequestClose.bind(this)}
        />
        <h2>Production Lines</h2>
        {global.user_group == "admin" && <button type="button" className="btn btn-primary" onClick={this.add}>Add Production Line</button>}
        <table className="table">
          <thead>
            <tr>
              <th>Name</th>
              <th>Description</th>
              <th>Status</th>
              {
                global.user_group == 'admin' &&
                <th>
                  Options
                </th>
              }
            </tr>
          </thead>
          {
            this.state.pagedLines.map((line, idx) => {
              return (
                <ProductionLineItem
                  edit={this.edit}
                  delete={this.delete}
                  markComplete={this.markComplete}
                  key={idx}
                  idx={idx}
                  {...line}
                  viewFormula={this.viewFormula}
                />
              );
            })
          }
        </table>
        <div className="modal fade" id="deleteProductionlineModal" tabIndex="-1" role="dialog" aria-labelledby="exampleModalLabel" aria-hidden="true">
          <div className="modal-dialog" role="document">
            <div className="modal-content">
              <div className="modal-header">
                <h5 className="modal-title" id="exampleModalLabel">Confirm Delete</h5>
                <button type="button" className="close" data-dismiss="modal" aria-label="Close">
                  <span aria-hidden="true">&times;</span>
                </button>
              </div>
              <div className="modal-body">
                Are you sure you want to delete this production line?
              </div>
              <div className="modal-footer">
                <button type="button" className="btn btn-secondary" data-dismiss="modal">Cancel</button>
                <button type="button" className="btn btn-danger" data-dismiss="modal" onClick={this.confirmDelete}>Delete</button>
              </div>
            </div>
          </div>
        </div>
        <PageBar pages={this.state.pages} selectPage={this.selectPage} currentPage={this.state.page} />
      </div>;

    const edit =
      <AddEditProductionLine
        mode="edit"
        backToList={this.backToList}
        line={this.state.pagedLines[this.state.editingIdx]}
      />;

    const add =
      <AddEditProductionLine 
        mode="add"
        backToList={this.backToList}
      />;
    
    const viewFormula =
      <FormulaWindow
        isEditing={true}
        BackButtonShown={true}
        onBackClick={this.backToList}
        newFormulaObject={this.state.formula}
        activeId={this.state.formula ? this.state.formula.id : 1}
      />;
    
    if (this.state.editing) {
      return edit;
    } else if (this.state.adding) {
      return add;
    } else if (this.state.viewFormula) {
      return viewFormula;
    } else {
      return main;
    }
  }
}

export default ProductionLine;
