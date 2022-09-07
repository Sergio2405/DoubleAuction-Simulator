import { Fragment, useState, useEffect } from 'react';
import Table from './components/Table';
import Serie from './components/Charts/Serie';
import TwoWay from './components/Charts/TwoWay';
import Timer from './components/Timer';


import './Market.scss'


const Market = (props) => {

    const [transactions, setTransactions] = useState([]);
    const [logs, setLogs] = useState([]);
    const [workers, setWorkers] = useState([]);
    const [traders, setTraders] = useState([{id : null, quantity : null, price: null, transactions: null, holdings : null}]);
    const [workerResponse, setWorkerResponse] = useState(null);

    const [sessionState, setSessionState] = useState(false);
    const [serverResponse, setServerResponse] = useState("{}");

    const [websocket, setWebsocket] = useState(null);

    const [setup, setSetup] = useState(null);
    const [timer, setTimer] = useState(null);
 
    useEffect(() => {
        if (sessionState){
            console.log('[STARTING WEBSOCKET]')
            const ws = new WebSocket(props.port);
            const setup_ = setup;
            ws.addEventListener("open", function(){
                createWorkers(parseInt(setup_["n_traders"]));
                let setup = JSON.stringify({
                                "setup": {
                                    "duration" : setup_["duration"]
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

    const handleAdminOrderSubmit = (event) => { 
        event.preventDefault()
        let order = {
            type : event.target.type.value,
            action : event.target.action.value,
            quantity : parseInt(event.target.quantity.value),
            price : parseFloat(event.target.price.value),
            active : true,
            trader : traders.length - 1,
            setup  : null,
        }
        setWorkerResponse(order)
    }

    const handleConfigSubmit = (event) => { 
        event.preventDefault();
        let setup = {
            duration : parseInt(event.target.duration.value),
            n_traders : parseInt(event.target.n_traders.value)
        };
        setSetup(setup);
    }

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
            workers.push(worker);
        }
        traders.push({id : num + 1, quantity : 0, price: 0, transactions: 0, holdings : 0});
        setWorkers(workers);
        setTraders(traders);
    }   

    const startSimulation = (active) => {
        if (!active) { 
            console.log("[ACTIVATING MARKET]");
            setSessionState(true);
            setTimer(true);
        }else{
            console.log("[CLOSING MARKET]")

            workers.forEach((worker) => {
                worker.postMessage({status : "stop"});
                worker.terminate();
            });
            setSessionState(false);
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
                        {setup && (<button 
                        onClick = {() => startSimulation(sessionState)} 
                        style = {{backgroundColor : sessionState ? "#fd5c63" : "#7CB9E8"}}>
                        {!sessionState ? "Start" : "Stop"}
                        </button>)}
                        
                        {setup && Object.keys(setup).map((config, index) => (
                        <label key = {index}>{setup[config]}</label>))}

                        {setup && <Timer duration = {setup["duration"]} active = {timer}/>}

                        <form onSubmit = {event => handleConfigSubmit(event)}>
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
                                        <td><input type = "number" name = "duration"/></td>
                                        <td><input type = "number" name = "n_traders"/></td>
                                        <td><button type = "submit">Create</button></td>
                                    </tr>
                                </tbody>
                            </table> 
                        </form>
                        <form onSubmit = {event => handleAdminOrderSubmit(event)}>
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
                                        <td><input type = "number" name = "quantity"/></td>
                                        <td><input type = "number" name = "price"/></td>
                                        <td>
                                            <select defaultValue = {"--"} name = "action">
                                                <option value = "--" disabled>--</option>
                                                <option value = "buy">Buy</option>
                                                <option value = "sell">Sell</option>
                                            </select>
                                        </td>
                                        <td>
                                            <select defaultValue = {"--"} name = "type">
                                                <option value = "--" disabled>--</option>
                                                <option value = "market">Market</option>
                                                <option value = "limit">Limit</option>
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