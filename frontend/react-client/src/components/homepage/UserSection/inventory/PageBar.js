import React, { Component } from 'react';

class PageBar extends Component {
  constructor(props) {
    super(props);
    this.onClickLink = this.onClickLink.bind(this);
  }

  onClickLink(idx) {
    this.props.selectPage(idx);
  }

  render() {
    const links = [];
    for (let i = 0; i < this.props.pages; i++) {
      links.push(<a key={i} className="PageLink" onClick={e => this.onClickLink(i+1)} href="#">{i+1}</a>);
    }
    return(
      <div className="PageBar">
        <p>Pages:</p>
        {links}
      </div>
    );
  }
}

export default PageBar;
