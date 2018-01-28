import React, { Component } from 'react';

class CaptchaContainer extends Component {
  constructor(props){
    super(props);
  }

  render() {
    return (
      <div className="CaptchaContainer">
        <div className="g-recaptcha captchawidget" data-sitekey="6LdZTEEUAAAAADswUB1lMKxj536Qxt0xPbLPMAJ8"></div>
      </div>
    )
  }
}

export default CaptchaContainer;
