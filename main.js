'strict';

var React = require('react');
var ReactDOM = require('react-dom');
var _ = require('lodash');


const WORDS = [
  ["square", "res/square.jpg", []],
  ["octagon", "res/octagon.png", []],
  ["oval", "res/oval.png", []],
  ["moon", "res/moon.png", []],
  ["pentagon", "res/pentagon.png", []],
  ["rectangle", "res/rectangle.gif", []],
  ["hexagon", "res/hexagon.gif", []],
  ["parallelogram", "res/parallelogram.png", []],
  ["heart", "res/heart.jpg", []],
  ["star", "res/star.gif", []],
  ["diamond", "res/diamond.jpg", []],
  ["semicircle", "res/semicircle.gif", []],
]

class App extends React.Component {

  constructor(props) {
    super(props);
    this.state = {
      currentWord: null,
    };
    this.state.currentWord = this._pickWord();
    this._onGuess = this._onGuess.bind(this);
    this._speechRenderer = null;
  }

  render() {
    return (
      <div style={{textAlign: "center"}} >
        <h1>What Shape is it?</h1>
        <img 
          style={{
            width: "400px",
          }}
          src={this.state.currentWord[1]}
        />
        <RenderSpeech
          onguess={this._onGuess}
          ref={(o) => {this._speechRenderer = o}}
        />
      </div>
    );
  }

  _pickWord() {
    let chosen = _.sample(WORDS);
    if (this.state.currentWord === null) {
      return chosen;
    }

    while (chosen[0] === this.state.currentWord[0]) {
      chosen = _.sample(WORDS);
    }
    return chosen; 
  }

  _onGuess(guess) {
    console.log("Guess: " + guess + "..." + this.state.currentWord[0]);
    if (guess.toLowerCase().trim() === this.state.currentWord[0].toLowerCase().trim()) {
      console.log("Correct!")
      this.setState({
        currentWord: this._pickWord(),
      });
      this._speechRenderer.clear();
    }
  }
}



class RenderSpeech extends React.Component {

  constructor(props) {
    super(props);
    this.initSpeech();
    this.state = {
      guess: '',
      allGuesses: [],
    };
  }

  static defaultProps = {
    onguess: () => {},
  };

  render() {
    return (
      <div>
        <h2>{this.state.guess}</h2>
      </div>
    );
  }

  clear() {
    this.speech.onresult = null;
    this.speech.onend = null;
    this.speech.stop();
    this.initSpeech();
    this.setState({
      guess: '',
    });
  }

  initSpeech() {
    this.speech = new webkitSpeechRecognition();
    this.speech.continuous = true;
    this.speech.interimResults = true;
    this.speech.onresult = (event) => {
      let lastresult = event.results[event.results.length-1];
      let message = lastresult[0].transcript;
      this.setState({
        guess: message,
      });
      this.props.onguess(message);
    };
    this.speech.onerror = (event) => {
      console.log("ERROR");
      console.log(event);
      this.speech.stop()
    };
    this.speech.onend = (event) => {
      // Restart
      console.log("Capture Restarted");
      this.speech.start();
    }
    console.log("Capture Begin");
    this.speech.start();
  }
}

ReactDOM.render(
  <App />,
  document.getElementById('main')
);
