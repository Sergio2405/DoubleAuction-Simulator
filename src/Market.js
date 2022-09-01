import { Fragment, useState, useEffect } from 'react';
import Table from './components/Table';
import Serie from './components/Charts/Serie';

import './Market.scss'

const Market = (props) => {

    const [transactions, setTransactions] = useState([]);
    const [logs, setLogs] = useState([])
    const [workers, setWorkers] = useState([]);
    const [workerResponse, setWorkerResponse] = useState(null);

    const [sessionState, setSessionState] = useState(false);
    const [serverResponse, setServerResponse] = useState("{}")

    const [websocket, setWebsocket] = useState(null)

    useEffect(() => {
        if (sessionState){
            console.log('[STARTING WEBSOCKET]')
            const ws = new WebSocket(props.port);
            ws.addEventListener("open", function(){
                createWorkers(parseInt(props.workers))
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
            console.log("inside worker response")
          if (websocket.readyState == 1) {
            console.log(websocket.readyState)
            if (typeof workerResponse != "string"){
                let order = JSON.stringify(workerResponse)
                console.log(order)
                websocket.send(order)
            }else{
                setLogs(prevLogs => [...prevLogs, {
                    "Time" : "1",
                    "Log": workerResponse}])
                }
            }  
         }   
    }, [workerResponse])

    useEffect(() => {
        const response = JSON.parse(serverResponse); 
        if (response){
            if (response["description"] == "exchange"){ 
            setTransactions(prevTransactions => [...prevTransactions, {
                "price" : parseFloat(response["price"]),
                "quantity" : parseFloat(response["volume"]),
            }]);      
            let workers_temp = [...workers]
            let limit_issuer = workers_temp[response["limit_issuer"]];
            let market_issuer = workers_temp[response["market_issuer"]];

            let volume_price = response["volume"] * response["price"];

            limit_issuer["quantity"] += response["action"] == "buy" ? -response["volume"] : response["volume"];
            limit_issuer["holdings"] += response["action"] == "buy" ? volume_price : -volume_price;

            market_issuer["quantity"] += response["action"] == "buy" ? response["volume"] : -response["volume"];
            market_issuer["holdings"] += response["action"] == "buy" ? -volume_price : volume_price;

            workers_temp[response["limit_issuer"]] = limit_issuer;
            workers_temp[response["market_issuer"]] = market_issuer;

            setWorkers(workers_temp);
            }
            setLogs(prevLogs => [...prevLogs, {
                "time": "1",
                "Log" : response["log"]
            }]);
        }
    }, [serverResponse])

    const createWorkers = (num) => { 
        console.log("[CREATING WORKERS]")
        let workers = []
        for (let ids = 0; ids <= num; ids ++) { 
            const worker = new Worker(new URL("./workers/worker.js", import.meta.url));
            console.log("[WORKER CREATED]", worker, ids)
            worker.postMessage({
                id : ids,
                status : "start"
            })
            worker.addEventListener("message", (event) => {
                setWorkerResponse(event.data)
            });
            workers.push({worker: worker, id : ids, quantity : 0, holdings : 0});
        }
        setWorkers(workers);
    }   

    const startSimulation = (active) => {
        if (!active) { 
            console.log("[ACTIVATING MARKET]")
            setSessionState(true)
        }else{
            console.log("[CLOSING MARKET]")

            workers.forEach((worker) => {
                worker["worker"].postMessage({status : "stop"});
                worker["worker"].terminate()
            })
            setSessionState(false)
        }     
    }

    return (
        <Fragment>
            <button onClick = {() => startSimulation(sessionState)} style = {{backgroundColor : sessionState ? "#fd5c63" : "#7CB9E8"}}>
                {!sessionState ? "Start" : "Stop"}
            </button> 

            <div className = "screen">
                <Table key = {1} title = "Market Statistics" data = {transactions}/>
                <Serie key = {2} title = "Price Serie" data={transactions} />
                {/* <Table key = {3} title = "Traders" data = {workers}/> object WORKER not valid as child */}
                <Table key = {4} title = "Logs" data = {logs}/>
                {/* <Serie key = {5} data={data} />
                <Serie key = {6} data={data} /> */}
            </div>
        </Fragment>
    )
}

export default Market;