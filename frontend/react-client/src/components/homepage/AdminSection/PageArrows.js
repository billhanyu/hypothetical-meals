import React, { Component } from 'react';

class PageArrows extends Component {
  constructor(props) {
    super(props);
  }

  /**** REQUIRED PROPS
    1. onClickLeft (Func)
    2. onClickRight (Func)
    3. pageNumber (Number)
  */

  render() {
    return (
      <div className="PageArrows">
        <div className="PageNumber">Page Number: {this.props.pageNumber}</div>
        <div className="LeftPageArrow" onClick={this.props.onClickLeft}>
          <i className="fas fa-arrow-left fa-lg PageArrow"></i>
        </div>
        <div className="RightPageArrow" onClick={this.props.onClickRight}>
          <i className="fas fa-arrow-right fa-lg PageArrow"></i>
        </div>
      </div>
    );
  }
}

export default PageArrows;
