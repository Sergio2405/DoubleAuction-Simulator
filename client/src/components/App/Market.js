import { useState, useEffect } from 'react';
import Table from '../Table';
import Serie from '../Charts/Serie';
import TwoWay from '../Charts/TwoWay';
import Timer from '../Timer';

import './style.scss'

const INITIAL_TRADERS = {id : null, quantity : null, price: null, transactions: null, holdings : null};
const INITIAL_ADMIN_ORDERS = {quantity: null, price: null, action: null, type: null};
const INITIAL_LOGS = {time: null, log: null};
const INITIAL_MARKET_STATISTICS = {
    price : {variable:"Price", mean:0, deviation:0, max:0, min:0},
    quantity : {variable:"Quantity", mean:0, deviation:0, max:0, min:0},
    bids : {variable:"Bids", mean:0, deviation:0, max:0, min:0},
    asks : {variable:"Asks", mean:0, deviation:0, max:0, min:0},
}

function getTimeExtent(duration){
    let start_time = new Date();
    let start_aux = new Date();
    start_aux.setSeconds(start_aux.getSeconds() + duration);
  
    start_time = start_time.getHours()+':'+start_time.getMinutes()+':'+start_time.getSeconds()+'.'+start_time.getMilliseconds();
    let end_time = start_aux.getHours()+':'+start_aux.getMinutes()+':'+start_aux.getSeconds()+'.'+start_aux.getMilliseconds();
  
    return [start_time,end_time];
}

function getStandardDeviation(array, mean) {
    return Math.sqrt(array.map(x => Math.pow(x - mean, 2)).reduce((a, b) => a + b,0) / array.length)
  }

function Market({ HOST, PORT }) {
    const [logs, setLogs] = useState([INITIAL_LOGS]);
    const [traders, setTraders] = useState([INITIAL_TRADERS]);
    const [adminOrders, setAdminOrders] = useState([INITIAL_ADMIN_ORDERS]);  
    const [marketStatistics, setMarketStatistics] = useState(INITIAL_MARKET_STATISTICS)

    const [transactions, setTransactions] = useState([]);
    const [workers, setWorkers] = useState([]);
    const [limitOrders, setLimitOrders] = useState([]);  

    const [serverResponse, setServerResponse] = useState("{}");
    const [workerResponse, setWorkerResponse] = useState(null);

    const [sessionState, setSessionState] = useState(false);
    const [websocket, setWebsocket] = useState(null);

    const [setup, setSetup] = useState(null);
    const [timer, setTimer] = useState(null);
 
    useEffect(() => {
        if (sessionState){
            console.log('[STARTING WEBSOCKET]')
            const ws = new WebSocket(`ws://${HOST}:${PORT}/`);
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
                console.log("[CLOSING MARKET]")
                workers.forEach((worker) => {
                    worker.postMessage({status : "stop"});
                    worker.terminate();
                });
                setTimer(false);
                websocket.close()
            }
        }
      }, [sessionState])

    useEffect(() => {
        if (workerResponse){
          if (websocket.readyState == 1) {
            if (typeof workerResponse != "string"){
                let order = workerResponse;
                let market_stats = Object.assign({},marketStatistics)
                if (order["type"] == "limit"){
                    let limit = {price: order["price"], quantity : order["quantity"], curve : null};
                    if (order["action"] == "buy"){
                        limit["curve"] = "demand";
                        let mean = limitOrders.reduce((priceAccum,order) => priceAccum + order["price"],0)/limitOrders.length;
                        market_stats["bids"]["mean"] = mean;
                        
                        let limit_list = limitOrders.map(order => order["price"])
                        market_stats["bids"]["max"] = Math.max(...limit_list);
                        market_stats["bids"]["min"] = Math.min(...limit_list);
                        market_stats["bids"]["deviation"] = getStandardDeviation(limit_list, mean)
                    }else{
                        limit["curve"] = "supply";
                        let mean = limitOrders.reduce((priceAccum,order) => priceAccum + order["price"],0)/limitOrders.length;
                        market_stats["asks"]["mean"] = mean;
                        
                        let limit_list = limitOrders.map(order => order["price"])
                        market_stats["asks"]["max"] = Math.max(...limit_list);
                        market_stats["asks"]["min"] = Math.min(...limit_list);
                        market_stats["asks"]["deviation"] = getStandardDeviation(limit_list, mean)
                    }
                    setLimitOrders(prevLimitOrders => [...prevLimitOrders,limit]); 
                    setMarketStatistics(market_stats)
                }
                order = JSON.stringify(order);
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
                "quantity" : parseInt(response["volume"]),
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

            // quantity statistics
            let market_stats = Object.assign({}, marketStatistics);
            let mean = transactions.reduce((quantityAccum,transaction) => quantityAccum + transaction["quantity"],0)/transactions.length;
            market_stats["quantity"]["mean"] = mean;

            let transaction_list = transactions.map(transaction => transaction["quantity"]);
            market_stats["quantity"]["max"] = Math.max(...transaction_list);
            market_stats["quantity"]["min"] = Math.min(...transaction_list);
            market_stats["quantity"]["deviation"] = getStandardDeviation(transaction_list, mean);

            // price statistics
            mean = transactions.reduce((priceAccum,transaction) => priceAccum + transaction["price"],0)/transactions.length;
            market_stats["price"]["mean"] = mean;

            transaction_list = transactions.map(transaction => transaction["price"]);
            market_stats["price"]["max"] = Math.max(...transaction_list);
            market_stats["price"]["min"] = Math.min(...transaction_list);
            market_stats["price"]["deviation"] = getStandardDeviation(transaction_list, mean);

            setMarketStatistics(market_stats)
            }

            if (response["log"]){
                if (response["log"].includes("closed")){
                    setSessionState(!sessionState);
                };

                setLogs(prevLogs => [{
                    "time": response["time"],
                    "log" : response["log"]
                },...prevLogs]);
            }
        }
    }, [serverResponse])

    const handleAdminOrderSubmit = (event) => { 
        event.preventDefault()
        let order = {
            quantity : parseInt(event.target.quantity.value),
            price : parseFloat(event.target.price.value),
            action : event.target.action.value,
            type : event.target.type.value,
            active : true,
            trader : traders.length-1,
            setup  : null,
        };
        setWorkerResponse(order);
        setAdminOrders(prevAdminOrders => [order,...prevAdminOrders]);
    }

    const createWorkers = (num) => { 
        console.log("[CREATING WORKERS]")
        let workers = []
        let traders =[]
        for (let ids = 0; ids <= num-1; ids ++) { 
            const worker = new Worker(new URL("../../workers/worker.js", import.meta.url));
            console.log("[WORKER CREATED]", worker, ids)
            worker.postMessage({
                id : ids,
                price : setup["max_price"],
                quantity : setup["max_quantity"],
                status : "start"
            })
            worker.addEventListener("message", ({ data }) => {
                setWorkerResponse(data)
            });
            traders.push({id : ids, quantity : 0, price: 0, transactions: 0, holdings : 0});
            workers.push(worker);
        }
        traders.push({id : num , quantity : 0, price: 0, transactions: 0, holdings : 0});
        setWorkers(workers);
        setTraders(traders);
    }   

    const startSimulation = (active) => {
        if (!active) { 
            console.log("[ACTIVATING MARKET]");
            setSessionState(true);
            setTimer(true);

            setTraders([INITIAL_TRADERS]);
            setAdminOrders([INITIAL_ADMIN_ORDERS]);
            setLogs([INITIAL_LOGS]);

            setLimitOrders([]);
            setTransactions([]);

            let setup_ = setup;
            setup_["timeExtent"] = getTimeExtent(setup_["duration"]) 
            setSetup(setup_)
        }else{
            console.log("[CLOSING MARKET]");
            setTimer(false);
            workers.forEach((worker) => {
                worker.postMessage({status : "stop"});
                worker.terminate();
            });
            setSessionState(false);
        }     
    }

    return (
        <div className = "market-environment">
            <Table 
                style = {{border: "1px solid red"}} 
                title = "Orders Placed" 
                headers = {["trader","quantity","price","action"]} 
                data = {limitOrders}/>
            <Table 
                title = "Trader Statistics" 
                headers = {["id","quantity","price","transactions","holdings"]} 
                data = {traders}/>
            <Serie 
                title = "Price Serie" 
                axis = {setup ? {xAxis: setup["timeExtent"], yAxis : setup["max_price"] + 10} : {xAxis:getTimeExtent(60),yAxis:50}}
                data={transactions} />
            <Table 
                title = "Logs" 
                headers = {["time","log"]} 
                data = {logs}/>
            <TwoWay 
                title = "Bids and Asks" 
                axis = {setup ? {xAxis: setup["max_quantity"] , yAxis : setup["max_price"] + 10} : {xAxis:50, yAxis:50}}
                data = {limitOrders}/>
            <Table 
                title = "Market Statistics" 
                headers = {["variable","mean","deviation","max","min"]} 
                data = {marketStatistics}/>
        </div>
    )
}

export default Market;