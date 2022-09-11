import React from 'react';
import ReactDOM from 'react-dom/client';
import Market from './Market'

function App() {
  return (
    <div className="App">
      <Market 
        port = "ws://localhost:8001/"
      />
    </div>
  );
}

const root = ReactDOM.createRoot(document.getElementById('root'));
root.render(
  <App />
);
