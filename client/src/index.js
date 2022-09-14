import React , { useState } from 'react';
import ReactDOM from 'react-dom/client';
import Market from './components/App/Market'

import './index.scss'

function App() {

  const [setup, setSetup] = useState({duration:15, n_traders:3, max_quantity: 50, max_price:50, holdings:1000});

  const handleConfigSubmit = (event) => {
    event.preventDefault();
    let duration = parseInt(event.target.duration.value);
    let setup = {
        duration : duration,
        n_traders : parseInt(event.target.n_traders.value),
        max_quantity : parseInt(event.target.max_quantity.value),
        max_price : parseFloat(event.target.max_price.value),
        holdings : parseFloat(event.target.max_price.holdings),
    };
    setSetup(setup);
  }

  return (
    <div className = "App">
      <div className = "menu">
        <div className = "market-control">
            <form onSubmit = {event => handleConfigSubmit(event)}>
                <table>
                    <thead>
                        <tr>
                            <th>Duration (in seconds)</th>
                            <th>Traders</th>
                            <th>Max Quantity</th>
                            <th>Max Price</th>
                            <th>Holdings</th>
                            <th></th> 
                        </tr>
                    </thead>
                    <tbody>
                        <tr>
                            <td><input type = "number" value = {setup["duration"]} name = "duration"/></td>
                            <td><input type = "number" value = {setup["n_traders"]} name = "n_traders"/></td>
                            <td><input type = "number" value = {setup["max_quantity"]} name = "max_quantity"/></td>
                            <td><input type = "number" value = {setup["max_price"]} name = "max_price"/></td>
                            <td><input type = "number" value = {setup["holdings"]} name = "holdings"/></td>
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
        DURATION = {setup["duration"]}
        MAX_PRICE = {setup["max_price"]}
        MAX_QUANTITY = {setup["max_quantity"]}
        TRADERS = {setup["n_traders"]}
        HOLDINGS = {setup["holdings"]}
      />
    </div>
  );
}

const root = ReactDOM.createRoot(document.getElementById('root'));
root.render(
  <App />
);
