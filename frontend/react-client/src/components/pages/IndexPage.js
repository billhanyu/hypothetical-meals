import React, { Component } from 'react';
import { withRouter } from 'react-router';
import TopContentContainer from './../LandingPage/TopContent/TopContentContainer.js';
import FeaturesOverviewContainer from './../LandingPage/FeatureOverview/FeaturesOverviewContainer.js';
import LandingPageFooter from './../LandingPage/LandingPageFooter.js';
import LoginWindow from './../LandingPage/LoginWindow.js';
import { logInWithRedirectedHash } from '../../oauth/OAuth';

class IndexPage extends Component {
  constructor(props) {
    super(props);
    this.checkOauth();
  }

  checkOauth() {
    if (window.location.hash.indexOf('access_token') > -1) {
      logInWithRedirectedHash(window.location.hash, this.props.history);
    }
  }

  componentDidMount() {
    // Get the DOM node and store the jQuery element reference
    //'#06F, #25BFF7, #0656F1'
    this.$node = global.d3.select(this.geometryBG);
    this.$node.trigons({
      width: 900,
      height: 300,
      size: 90,
      offset: 0.75,
      colors: '#005DE9, #1B7ADB, #014FE6',
      colorMode: 'build',
      colorBuild: 'build5',
      colorSpace: 'lab',
      colorWay: 0.5,
      lightDark: 2.5,
      responsive: true,
      startVisible: true,
      beforeCreate: false,
      afterCreate: false
    });
  }

  // Force a single-render of the component,
  // This way, ReactJS will never re-render our component,
  shouldComponentUpdate() {
    return false;
  }
  // Digital Currency Tracker and Knowledge Hub
  //Discover and Track Digital Currency
  render() {
    return (
      <div className="LandingPageContainer">
        <div className="geometryBG" ref={e => {this.geometryBG = e;}}/>
        <LoginWindow />
        <TopContentContainer />
        <FeaturesOverviewContainer />
        <LandingPageFooter />
      </div>
    );
  }

  componentWillUnmount() {
    this.$node.remove();
  }
}

export default withRouter(IndexPage);
