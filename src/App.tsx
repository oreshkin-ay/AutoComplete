import React from 'react';
import AutoComplete from './AutoComplete';
import { Items, makeRequest } from './api';
import './App.css';



function App() {
  return (
    <div className="App">
      <AutoComplete<Items>
        onRequest={makeRequest}
      />
    </div>
  );
}

export default App;
