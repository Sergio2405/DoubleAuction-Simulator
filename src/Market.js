import { Fragment, useState, useEffect } from 'react';
import Table from './components/Table';
import Serie from './components/Charts/Serie';

import './Market.scss'
import TwoWay from './components/Charts/TwoWay';

const Market = (props) => {

    const [transactions, setTransactions] = useState([]);
    const [logs, setLogs] = useState([])
    const [workers, setWorkers] = useState([]);
    const [traders, setTraders] = useState([{id : null, quantity : null, price: null, transactions: null, holdings : null}])
    const [workerResponse, setWorkerResponse] = useState(null);

    const [sessionState, setSessionState] = useState(false);
    const [serverResponse, setServerResponse] = useState("{}")

    const [websocket, setWebsocket] = useState(null)

    useEffect(() => {
        if (sessionState){
            console.log('[STARTING WEBSOCKET]')
            const ws = new WebSocket(props.port);
            ws.addEventListener("open", function(){
                createWorkers(parseInt(props.workers));
                let setup = JSON.stringify({
                                "setup": {
                                    "duration": 10
                                }});
                ws.send(setup)
            })
            ws.addEventListener("message", function({ data }){
                setServerResponse(data)
            })
            setWebsocket(ws)
        }else{
            if (websocket){
                websocket.close()
            }
        }
      }, [sessionState])

    useEffect(() => {
        if (workerResponse){
          if (websocket.readyState == 1) {
            if (typeof workerResponse != "string"){
                let order = JSON.stringify(workerResponse)
                websocket.send(order)
            }else{
                setLogs(prevLogs => [{
                    "time" : "1",
                    "log": workerResponse},...prevLogs])
                }
            }  
         }   
    }, [workerResponse])

    useEffect(() => {
        const response = JSON.parse(serverResponse); 
        if (response){
            if (response["description"] == "exchange"){ 
            setTransactions(prevTransactions => [...prevTransactions,{
                "price" : parseFloat(response["price"]),
                "time" : response["time"],
            }]);      
            
            let workers_temp = [...traders]
            let limit_issuer = workers_temp[response["limit_issuer"]];
            let market_issuer = workers_temp[response["market_issuer"]];

            let volume_price = response["volume"] * response["price"];

            limit_issuer["quantity"] += response["action"] == "buy" ? -response["volume"] : response["volume"];
            limit_issuer["holdings"] += response["action"] == "buy" ? volume_price : -volume_price;

            market_issuer["quantity"] += response["action"] == "buy" ? response["volume"] : -response["volume"];
            market_issuer["holdings"] += response["action"] == "buy" ? -volume_price : volume_price;

            limit_issuer["transactions"] ++ ; market_issuer["transactions"] ++;

       
            limit_issuer["price"] = (limit_issuer["price"] + response["price"]) / (limit_issuer["transactions"] == 0 ? 1 : limit_issuer["transactions"]);
            market_issuer["price"] = (market_issuer["price"] + response["price"]) / (market_issuer["transactions"] == 0 ? 1 : market_issuer["transactions"]);
            
            workers_temp[response["limit_issuer"]] = limit_issuer;
            workers_temp[response["market_issuer"]] = market_issuer;

            setTraders(workers_temp);

            }
            setLogs(prevLogs => [{
                "time": response["time"],
                "log" : response["log"]
            },...prevLogs]);
        }
    }, [serverResponse])

    const createWorkers = (num) => { 
        console.log("[CREATING WORKERS]")
        let workers = []
        let traders =[]
        for (let ids = 0; ids <= num; ids ++) { 
            const worker = new Worker(new URL("./workers/worker.js", import.meta.url));
            console.log("[WORKER CREATED]", worker, ids)
            worker.postMessage({
                id : ids,
                status : "start"
            })
            worker.addEventListener("message", ({ data }) => {
                setWorkerResponse(data)
            });
            traders.push({id : ids, quantity : 0, price: 0, transactions: 0, holdings : 0});
            workers.push(worker)
        }
        setWorkers(workers);
        setTraders(traders);
    }   

    const startSimulation = (active) => {
        if (!active) { 
            console.log("[ACTIVATING MARKET]")
            setSessionState(true)
        }else{
            console.log("[CLOSING MARKET]")

            workers.forEach((worker) => {
                worker.postMessage({status : "stop"});
                worker.terminate()
            })
            setSessionState(false)
        }     
    }

    const data = [
        {price: 91, quantity: 31, curve: "supply"},
        {price: 82, quantity: 32, curve: "supply"},
        {price: 15, quantity: 56, curve: "supply"},
        {price: 61.5, quantity: 12, curve: "demand"},
        {price: 7, quantity:  92, curve: "demand"},
        {price: 101, quantity: 23, curve: "demand"},
    ]

    return (
        <Fragment>
            <div className = "market-environment">
                <div className = "market-control">
                    <div>
                        <button 
                        onClick = {() => startSimulation(sessionState)} 
                        style = {{backgroundColor : sessionState ? "#fd5c63" : "#7CB9E8"}}>
                        {!sessionState ? "Start" : "Stop"}
                        </button>
                        <form>
                            <table>
                                <thead>
                                    <tr>
                                        <th>Duration (in seconds)</th>
                                        <th>Traders</th>
                                        <th></th> 
                                    </tr>
                                </thead>
                                <tbody>
                                    <tr>
                                        <td><input type = "number"/></td>
                                        <td><input type = "number"/></td>
                                        <td><button type = "submit">Create</button></td>
                                    </tr>
                                </tbody>
                            </table> 
                        </form>
                        <form>
                            <table>
                                <thead>
                                    <tr>
                                        <th>Quantity</th>
                                        <th>Price</th>
                                        <th>Action</th>
                                        <th>Type</th>
                                        <th></th>
                                    </tr>
                                </thead>
                                <tbody>
                                    <tr>
                                        <td><input type = "number"/></td>
                                        <td><input type = "number"/></td>
                                        <td>
                                            <select>
                                                <option disabled selected value>--</option>
                                                <option>Buy</option>
                                                <option>Sell</option>
                                            </select>
                                        </td>
                                        <td>
                                            <select>
                                                <option disabled selected value>--</option>
                                                <option>Market</option>
                                                <option>Limit</option>
                                            </select>
                                        </td>
                                        <td><button type = "submit">Send</button></td>
                                    </tr>
                                </tbody>
                            </table>
                        </form>
                        <Table title = "Orders Placed" data = {traders}/>
                    </div>
                </div>
                <Table title = "Market Statistics" data = {traders}/>
                <Serie title = "Price Serie" data={transactions} />
                <Table title = "Logs" data = {logs}/>
                <TwoWay title = "Supply and Demand" data = {data}/>
                <Table title = "Trader Statistics" data = {traders}/>
            </div>
        </Fragment>
    )
}

export default Market;