import React from "react";
import ReactDOM from "react-dom";
// import {DataBase} from "./stores/DataStore";
import "./style/app.css";
// import {UIState} from "./stores/UIStore";
// import {TextEditor} from "./components/markdown";
// import {SelectedObj} from "./components/selectedObj";
export const showDebug = true;

// todo(reactQ): is it better to place this in a context rather than as a global import?
//  well, we are using it in a react wrapper, but then we are importing it from here?

// const dataBase = new DataBase();
// const uiState = new UIState();

ReactDOM.render(
  <React.StrictMode>
    <div className="top-container">
      <TextEditor dataBase={dataBase} uiState={uiState} />
      <SelectedObj dataBase={dataBase} uiState={uiState} />
    </div>
  </React.StrictMode>,
  document.getElementById("root"),
);
