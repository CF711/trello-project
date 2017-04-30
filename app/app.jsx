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
  for (var i in boards) {
    let board = boards[i];
    if (!board.closed && board.name !== "Welcome Board") {
      activeBoards.push(board);
    }
  }
  let returnObj = {
    project: selectProject(activeBoards),
    boards: activeBoards
  };
  return returnObj;
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
      tags: [],
      project: {}
    }
  }

  handleInput() {
    let username = document.getElementById('username-input').value;
    callTrello(username).then((response) => {
      console.log(response);
      this.setState({
        project: response.project,
        boards: response.boards
      });
      console.log(this.state);
    }, (error) => {
      console.log(error);
    });
  }

  differentSelection() {
    let project = selectProject(this.state.boards);
    console.log(project);
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

ReactDOM.render(React.createElement(App), document.getElementById('app'), null);
