import React, { Component } from 'react';

import TopContentContainer from './../LandingPage/TopContent/TopContentContainer.js';
import FeaturesOverviewContainer from './../LandingPage/FeatureOverview/FeaturesOverviewContainer.js';
import LandingPageFooter from './../LandingPage/LandingPageFooter.js';
import LoginWindow from './../LandingPage/LoginWindow.js';

class IndexPage extends Component {
  componentDidMount() {
        // Get the DOM node and store the jQuery element reference
        //'#06F, #25BFF7, #0656F1'
        this.$node  = d3.select(this.refs.geometryBG);
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
              <div className="geometryBG" ref="geometryBG">
              </div>
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

export default IndexPage;
