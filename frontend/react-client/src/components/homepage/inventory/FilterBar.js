import React, { Component } from 'react';
import tempStates from '../../Constants/TempStates';
import packageTypes from '../../Constants/PackageTypes';

class FilterBar extends Component {
  constructor(props) {
    super(props);
  }

  render() {
    return (
      <div className="FilterBar">
        <span>Ingredient:</span>
        <input className="FilterItem" onChange={e => this.props.filterIngredient(e)}/>
        <span>Temperature:</span>
        <select className="FilterItem" onChange={e => this.props.filterTemp(e)}>
          <option value="All">All</option>
          {
            tempStates.map((element, key) => {
              return <option value={element} key={key}>{element}</option>;
            })
          }
        </select>
        <span>Package Type:</span>
        <select className="FilterItem" onChange={e => this.props.filterPackage(e)}>
          <option value="All">All</option>
          {
            packageTypes.map((element, key) => {
              return <option value={element} key={key}>{element}</option>;
            })
          }
        </select>
      </div>
    );
  }
}

export default FilterBar;
