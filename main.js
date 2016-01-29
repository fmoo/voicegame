'strict';

// main.js
var React = require('react');
var ReactDOM = require('react-dom');


class App extends React.Component {

  constructor(props) {
    super(props);
  }

  render() {
    return (
      <div>
        <h1>Hello, world!</h1>
        <RenderSpeech />
      </div>
    );
  }
}

class RenderSpeech extends React.Component {

  constructor(props) {
    super(props);
    this.initSpeech();
    this.state = {
      text: '',
    };
  }

  initSpeech() {
    this.speech = new webkitSpeechRecognition();
    this.speech.continuous = true;
    this.speech.interimResults = true;
    this.speech.onresult = (event) => {
      let lastresult = event.results[event.results.length-1];
      let message = lastresult[0].transcript;
      console.log("Message: " + message);
      this.setState({
        text: message,
      });
    };
    this.speech.onerror = (event) => {
      console.log("ERROR");
      console.log(event);
    };
    this.speech.audioend = (event) => {
      // Restart
      console.log("Capture Restarted");
      this.speech.start();
    }
    console.log("Capture Begin");
    this.speech.start();
  }

  render() {
    return (
      <div>{this.state.text}</div>
    );
  }
}

ReactDOM.render(
  <App />,
  document.getElementById('main')
);
