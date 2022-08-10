import React from 'react';
import ReactDOM from 'react-dom/client';
import Market from './components/Market'

function App() {
  return (
    <div className="App">
      <Market />
    </div>
  );
}

const root = ReactDOM.createRoot(document.getElementById('root'));
root.render(
  <App />
);
