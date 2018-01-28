import React, { Component } from 'react';
import { Link } from 'react-router-dom';
import LoggedInAccountHeader from './LoggedInAccountHeader.js';

class NavBar extends Component {
  render() {
    return (
      <header className="borderBottom GeneralThemeColor">
        <ul className="headerButtons unselectable">
          <li className="navButton navLogo">
            <Link to="" className="navButtonText navLogoText">C O I N S I G H T F U L</Link>
          </li>
          <li className="navBarAccount">
            <LoggedInAccountHeader />
          </li>
        </ul>
      </header>
    )
  }
}

export default NavBar;
