<!-- # Getting Started with Create React App

This project was bootstrapped with [Create React App](https://github.com/facebook/create-react-app). -->

## Double-Auction Simulator (Development version)

Project that consists on simulating a double auction market using React (client side) and Python (server side).

### Client
The App consists of a Configuration Panel and a Dashboard consisting of currently 6 screens. 

1. Orders Placed : Limit orders placed by every trader bot.
2. Trader Statistics : A brief statistics about the status of the trader.
3. Price Serie : A Time Serie chart of the price.
4. Logs : Logs of the market such as transactions and orders placed.
5. Bids & Asks : Twoway chart of the Bids and Asks.
6. Market Statistics : Important statistics about the market such as the volume, price and bids & asks.

This screens will update in real time as the traders place their orders and transactions are made.

### Server
Websockets implementation for python using asyncio. These consists of a Market object that represents the market functionality. The market can do these operations: 
1. Add orders to a queue. 
2. Update the time. 
3. Match trading orders.
4. Sends back to the client the transactions and limit orders made.

### Deploy App
To launch the app you need to have installed node in order to run the React app (client side). For the server side just need python.

1. Open two terminals. In the first one will be running the client side and in the second will run the server side. 

2. Open the 1st terminal and cd to src folder and then run the following command:
```bash
npm start
```
The client side app runs the in the development mode.\
Open [http://localhost:3000](http://localhost:3000) to view it in your browser.

3. Open the 2nd terminal and run the following command: 
```bash
python server\server.py
```
4. If you want to change the PORT and HOST where the app runs and websocket listens: 
   - Change the parameters PORT and HOST in the Market component in the client side (client\src\index.js)
    ```js
    <Market 
        HOST = "localhost"
        PORT = "8001"
        DURATION = {setup["duration"]}
        MAX_PRICE = {setup["max_price"]}
        MAX_QUANTITY = {setup["max_quantity"]}
        TRADERS = {setup["n_traders"]}
        HOLDINGS = {setup["holdings"]}
        COLORS = {["yellow", "green","gray", "brown", "orange"]}
      />
    ```
    - Change the parameters PORT and HOST in the server side (server\server.py)
    ```python
    HOST = "localhost" 
    PORT = 8001
    ```
    - Remember that these parameters need to be the same in both server and client side.
<!-- The page will reload when you make changes.\
You may also see any lint errors in the console.

### `npm test`

Launches the test runner in the interactive watch mode.\
See the section about [running tests](https://facebook.github.io/create-react-app/docs/running-tests) for more information.

### `npm run build`

Builds the app for production to the `build` folder.\
It correctly bundles React in production mode and optimizes the build for the best performance.

The build is minified and the filenames include the hashes.\
Your app is ready to be deployed!

See the section about [deployment](https://facebook.github.io/create-react-app/docs/deployment) for more information.

### `npm run eject`

**Note: this is a one-way operation. Once you `eject`, you can't go back!**

If you aren't satisfied with the build tool and configuration choices, you can `eject` at any time. This command will remove the single build dependency from your project.

Instead, it will copy all the configuration files and the transitive dependencies (webpack, Babel, ESLint, etc) right into your project so you have full control over them. All of the commands except `eject` will still work, but they will point to the copied scripts so you can tweak them. At this point you're on your own.

You don't have to ever use `eject`. The curated feature set is suitable for small and middle deployments, and you shouldn't feel obligated to use this feature. However we understand that this tool wouldn't be useful if you couldn't customize it when you are ready for it. -->

<!-- ## Learn More

You can learn more in the [Create React App documentation](https://facebook.github.io/create-react-app/docs/getting-started).

To learn React, check out the [React documentation](https://reactjs.org/).

### Code Splitting

This section has moved here: [https://facebook.github.io/create-react-app/docs/code-splitting](https://facebook.github.io/create-react-app/docs/code-splitting)

### Analyzing the Bundle Size

This section has moved here: [https://facebook.github.io/create-react-app/docs/analyzing-the-bundle-size](https://facebook.github.io/create-react-app/docs/analyzing-the-bundle-size)

### Making a Progressive Web App

This section has moved here: [https://facebook.github.io/create-react-app/docs/making-a-progressive-web-app](https://facebook.github.io/create-react-app/docs/making-a-progressive-web-app)

### Advanced Configuration

This section has moved here: [https://facebook.github.io/create-react-app/docs/advanced-configuration](https://facebook.github.io/create-react-app/docs/advanced-configuration)

### Deployment

This section has moved here: [https://facebook.github.io/create-react-app/docs/deployment](https://facebook.github.io/create-react-app/docs/deployment)

### `npm run build` fails to minify

This section has moved here: [https://facebook.github.io/create-react-app/docs/troubleshooting#npm-run-build-fails-to-minify](https://facebook.github.io/create-react-app/docs/troubleshooting#npm-run-build-fails-to-minify) -->
