'strict';

const arrayContains = require('array-contains');
const React = require('react');
const ReactDOM = require('react-dom');
const ReactCSSTransitionGroup = require('react-addons-css-transition-group');
const _ = require('lodash');


const SHAPES = [
  ["circle", "res/circle.png", []],
  ["square", "res/square.jpg", []],
  ["octagon", "res/octagon.png", []],
  ["oval", "res/oval.png", ["ellipse"]],
  ["moon", "res/moon.png", ["crescent"]],
  ["pentagon", "res/pentagon.png", []],
  ["rectangle", "res/rectangle.gif", []],
  ["hexagon", "res/hexagon.gif", []],
  ["parallelogram", "res/parallelogram.png", []],
  ["heart", "res/heart.jpg", []],
  ["star", "res/star.gif", []],
  ["diamond", "res/diamond.jpg", ["rhombus"]],
  ["semicircle", "res/semicircle.gif", []],
  ["arrow", "res/arrow.png", []],
  ["triangle", "res/triangle.png", []],
]

const GAMES = [
  ["Shapes", SHAPES],
]

class App extends React.Component {
  constructor(props) {
    super(props);

    this.state = {
      currentGame: null,
    };
  }

  _renderSelector() {
    return (
      <h1>
        <a 
          style={{
            textDecoration: "none",
          }}
          href="#" onClick={(event) => {
            this.setState({currentGame: SHAPES});
          }}>
          Shapes
        </a>
      </h1>
    );
  }

  render() {
    if (this.state.currentGame === null) {
      return this._renderSelector();
    }

    return (
      <Game cards={this.state.currentGame} />
    );
  }
}


class Game extends React.Component {

  constructor(props) {
    super(props);
    this._onGuess = this._onGuess.bind(this);

    this.state = {
      currentWord: null,
    };
    this.state.currentWord = this._pickWord();
    this._speechRenderer = null;
  }

  render() {
    return (
      <div style={{textAlign: "center"}} >
        <h1>What Shape is it?</h1>
        <div className="promptContainer">
          <ReactCSSTransitionGroup
            transitionName="promptImage"  
            transitionEnterTimeout={1000}
            transitionLeaveTimeout={1000}>
            <img 
              className="promptImage"
              key={this.state.currentWord[0]}
              src={this.state.currentWord[1]}
            />
          </ReactCSSTransitionGroup>
        </div>
        <RenderSpeech
          onguess={this._onGuess}
          ref={(o) => {this._speechRenderer = o}}
        />
      </div>
    );
  }

  _pickWord() {
    let chosen = _.sample(this.props.cards);
    if (this.state.currentWord === null) {
      return chosen;
    }

    while (chosen[0] === this.state.currentWord[0]) {
      chosen = _.sample(this.props.cards);
    }
    return chosen; 
  }

  _onGuess(guess) {
    console.log("Guess: " + guess + "..." + this.state.currentWord[0]);
    guess = guess.toLowerCase().trim();
    if (
      guess === this.state.currentWord[0] ||
      arrayContains(this.state.currentWord[2], guess)
    ) {
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
    this._onSpeechResult = this._onSpeechResult.bind(this);

    this.initSpeech();
    this.state = {
      guess: '',
    };
  }

  static defaultProps = {
    onguess: () => {},
  };

  render() {
    if (this.speech === null) {
      return this._renderUnsupportedBrowser();
    }
    return (
      <div>
        <h2>{this.state.guess}</h2>
      </div>
    );
  }

  _renderUnsupportedBrowser() {
    return <h1>Sorry, this browser is not supported.  Have you tried Chrome?</h1>;
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

  componentWillUnmount() {
    if (this.speech !== null) {
      this.speech.onend = null;
      this.speech.stop();
    }
  }

  _newSpeechRecognition() {
    if (typeof SpeechRecognition !== "undefined") {
      return new SpeechRecognition();
    }
    if (typeof webkitSpeechRecognition !== "undefined") {
      return new webkitSpeechRecognition();
    }
    return null;
  }

  initSpeech() {
    this.speech = this._newSpeechRecognition();
    if (this.speech === null) {
      return;
    }

    this.speech.continuous = true;
    this.speech.interimResults = true;
    this.speech.maxAlternatives = 10;
    this.speech.onresult = this._onSpeechResult
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

  _onSpeechResult(event) {
    let lastresult = event.results[event.results.length-1];
    console.log("{");
    for (let i = 0; i < lastresult.length; i++) {
      let guess = lastresult[i].transcript.split(' ').reverse()[0];
      if (this.props.onguess) {
        this.props.onguess(guess);
      }
    }
    console.log("}");

    let message = lastresult[0].transcript.split(' ').reverse()[0];
    this.setState({
      guess: message,
    });
  }
}

ReactDOM.render(
  <App />,
  document.getElementById('main')
);
