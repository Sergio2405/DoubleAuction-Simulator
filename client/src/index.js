import React from 'react';
import ReactDOM from 'react-dom/client';
import Market from './components/App/Market'

import './index.scss'

function App() {
  return (
    <div className = "App">
      <div className = "menu">
        <div className = "market-control">
            <form>
                <table>
                    <thead>
                        <tr>
                            <th>Duration (in seconds)</th>
                            <th>Traders</th>
                            <th>Max Quantity</th>
                            <th>Max Price</th>
                            <th></th> 
                        </tr>
                    </thead>
                    <tbody>
                        <tr>
                            <td><input type = "number" value = "15" name = "duration"/></td>
                            <td><input type = "number" value = "3" name = "n_traders"/></td>
                            <td><input type = "number" value = "50" name = "max_quantity"/></td>
                            <td><input type = "number" value = "20" name = "max_price"/></td>
                            <td><button type = "submit">Create</button></td>
                        </tr>
                    </tbody>
                </table> 
            </form>
        </div>
        <button className = "title" type = "button">Configuration Panel</button>
      </div>
      <Market 
        HOST = "localhost"
        PORT = "8001"
      />
    </div>
  );
}

const root = ReactDOM.createRoot(document.getElementById('root'));
root.render(
  <App />
);
