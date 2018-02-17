import React, { Component } from 'react';

class PageBar extends Component {
  constructor(props) {
    super(props);
    this.state = {
      currentPage: 1,
    };
    this.onClickLink = this.onClickLink.bind(this);
    this.onClickPrevious = this.onClickPrevious.bind(this);
    this.onClickNext = this.onClickNext.bind(this);
  }

  onClickLink(idx) {
    this.props.selectPage(idx);
    this.setState({
      currentPage: idx,
    });
  }

  onClickPrevious() {
    this.props.selectPage(this.state.currentPage - 1);
    this.setState({
      currentPage: this.state.currentPage - 1,
    });
  }

  onClickNext() {
    this.props.selectPage(this.state.currentPage + 1);
    this.setState({
      currentPage: this.state.currentPage + 1,
    });
  }

  render() {
    const links = [];
    for (let i = 0; i < this.props.pages; i++) {
      links.push(i+1);
    }
    const disablePrev = this.state.currentPage == 1 ? "disabled" : "";
    const disableNext = this.state.currentPage == this.props.pages ? "disabled" : "";
    return(
      <nav aria-label="...">
        <ul className="pagination justify-content-center">
          <li className={"page-item " + disablePrev}>
            <span className="page-link" href="javascript:void(0)" onClick={this.onClickPrevious}>Previous</span>
          </li>
          {
            links.map((pageNum, idx) => {
              const active = pageNum == this.state.currentPage ? "active" : "";
              return (
                <li key={idx} className={"page-item " + active}>
                  <span className="page-link" onClick={e => this.onClickLink(pageNum)}>
                    {pageNum}
                    {active && <span className="sr-only">(current)</span>}
                  </span>
                </li>
              );
              
            })
          }
          <li className={"page-item " + disableNext}>
            <a className="page-link" href="javascript:void(0)" onClick={this.onClickNext}>Next</a>
          </li>
        </ul>
      </nav>
    );
  }
}

export default PageBar;
