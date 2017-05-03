import React from 'react';
import ReactDOM from 'react-dom';

import isEmpty from 'lodash/isEmpty';

import styles from './app.less';

function callTrello(username) {
  return new Promise((resolve, reject) => {
    const key = "49a8f0dbe7cbbebe728198366a98a01b";
    let token = "9d4546731132c9a2c51c654abc32360418e9f3f90ab060dcce333b72038575ca";
    let path = "https://api.trello.com/1/members/" + username + "/boards?key=" + key + "&token=" + token

    var xhr = new XMLHttpRequest();
    xhr.open("GET", path, true);

    xhr.onload = function() {
      if (this.status === 200) {
        resolve(filterProjects(JSON.parse(this.responseText)));
      } else {
        reject(Error(this.responseText));
      }
    };

    xhr.onerror = () => {
      reject(Error("Unable to connect to Trello."));
    }

    xhr.send();
  });
}

function filterProjects(boards) {
  var activeBoards = [];
  var tags = {};
  for (var i in boards) {
    let board = boards[i];
    if (!board.closed && board.name !== "Welcome Board") {
      activeBoards.push(board);
      getTags(board, tags);
    }
  }
  let returnObj = {
    boards: activeBoards,
    tags: tags
  };
  return returnObj;
}

function getTags(board, tags) {
  var j = 0;
  for (var i in board.labelNames) {
    let tag = board.labelNames[i];
    if (tag !== "") {
      (tags[tag]) ? tags[tag].boards.push(board) : tags[tag] = {boards: [board], color: selectColor(j)};
      j++;
      j = j % 10;
    }
  }
  (tags['Any']) ? tags['Any'].boards.push(board) : tags['Any'] = {boards: [board], color: selectColor(j)};
}

function selectColor(i){
  let colors = ['#d73027','#f46d43','#fdae61','#fee090','#ffffbf','#e0f3f8','#abd9e9','#74add1','#4575b4'];
  return colors[i];
}

function selectProject(boards) {
  var selector = Math.floor(Math.random() * (boards.length - 0));
  return boards[selector];
}

class App extends React.Component {
  constructor() {
    super();
    this.state = {
      boards: [],
      tags: {},
      project: {}
    }
  }

  handleInput() {
    let username = document.getElementById('username-input').value;
    callTrello(username).then((response) => {
      this.setState({
        project: response.project,
        boards: response.boards,
        tags: response.tags,
        activeTag: {},
        rejected: []
      });
    }, (error) => {
      console.log(error);
    });
  }

  getProject(tag, boards) {
    this.setState({
      project: selectProject(boards),
      activeTag: tag
    });
  }

  differentSelection() {
    let rejected = this.state.rejected.push(this.state.project);
    let project = selectProject(this.state.tags[this.state.activeTag].boards);
    this.setState({
      project: project
    });
  }

  render() {
    const projectSelected = !isEmpty(this.state.project);
    let project = this.state.project;

    return (
      <div className="App">
        <form>
          <div className="input-container">
            <label htmlFor="basic-url">Enter your username as it would appear below.</label>
            <div className="input-group">
              <span className="input-group-addon">https://trello.com/</span>
              <input type="text" name="uname-input" id="username-input" aria-describedby="basic-addon3" className="form-control input-field" />
            </div>
          </div>
          <br />
          <input type="button" className="btn btn-success button-margin" id="get-projects-button" value="Get my Projects" onClick={() => this.handleInput()}/>
        </form>

        {!isEmpty(this.state.tags) &&
          <div className="tag-container">
            <p> Select a technology you would like to focus on/work with. </p>
            {Object.keys(this.state.tags).map((tag) =>
              <Tag 
                tagName={tag} 
                count={this.state.tags[tag].boards.length} 
                color={this.state.tags[tag].color}
                onClick={() => this.getProject(tag, this.state.tags[tag].boards)}
                />
            )}
          </div>
        }

        {projectSelected &&
          <div className="selected-block"> 
            <p className="selected-statement"> We think you should work on: 
              <span> {project.name}</span> <br />
              Go check out the board <a href={project.url}>here</a>. 
            </p>
            <div>
              <input type="button" className="btn btn-danger" value="Something Different?" onClick={() => this.differentSelection()}/>
            </div>
          </div>
        }
      </div>
    );
  }
}

class Card extends React.Component {
  render() {
    return (
      <div className="well card">
      </div>
    )
  }
}

class Tag extends React.Component {
  render() {
    const tagName = this.props.tagName;
    const count = this.props.count;
    const style = {'backgroundColor': this.props.color};

    return (
      <button className="btn" style={style} onClick={() => this.props.onClick()}>
        {tagName}<span className="badge">{count}</span>
      </button>
    );
  }
}

class Nav extends React.Component {
  render() {
    return (
      <div>
        <nav className="navbar sticky-top navbar-top navbar-toggleable-md navbar-inverse bg-inverse">
          <div className="navbar-header page-scroll">
            <button type="button" className="navbar-toggle" data-toggle="collapse" data-target="#bs-example-navbar-collapse-1">
              <span className="sr-only">Toggle navigation</span>
              <span className="icon-bar"></span>
              <span className="icon-bar"></span>
              <span className="icon-bar"></span>
            </button>
          </div>

          <div className="collapse navbar-collapse" id="bs-example-navbar-collapse-1">
            <ul className="nav navbar-nav navbar-right">
              <li className="page-scroll">
                <a href="#browse">Browse</a>
              </li>
              <li className="page-scroll">
                <a href="#select">Select For Me</a>
              </li>
            </ul>
          </div>
        </nav>

        <App />
      </div>
    )
  }
}

ReactDOM.render(React.createElement(Nav), document.getElementById('nav'), null);