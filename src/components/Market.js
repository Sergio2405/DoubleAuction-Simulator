import React, { useState, useEffect } from 'react';
import Table from './Tables';

const Market = (props) => {

    const [orders, setOrders] = useState([]);
    const [workers, setWorkers] = useState([]);
    const [logs, setLogs] = useState([]);

    const [sessionState, setSessionState] = useState("Start");

    const [websocket,setWebsocket] = useState(0);

    const [order,setOrder] = useState(0);
    const [log, setLog] = useState(0);

    useEffect(() => {
        if (sessionState == "Stop"){
            console.log('[STARTING WEBSOCKET]')
            let websocket = new WebSocket(props.port)
            setWebsocket(websocket)
        }
      }, [sessionState])

    useEffect(() => {
        if (websocket != 0){
            websocket.onopen = () => {
            // setWebsocket(websocket)
            createWorkers(parseInt(props.workers));
            setSessionState("Stop")
        }}
    }, [websocket])

    useEffect(() => { // send order to server
        if (websocket.readyState == 1) {websocket.send(JSON.stringify(order))}
    }, [order])

    useEffect(() => {
        if (log != 0) setLogs(logs.push(log))
    }, [log])

    // creating workers
    const createWorkers = (num) => { 
        console.log("[CREATING WORKERS]")
        console.log(websocket)
        let workers = []
        for (let ids = 0; ids <= num; ids ++) { 
            const worker = new Worker(new URL("../workers/worker.js", import.meta.url));
            console.log("[WORKER CREATED]", worker, ids)
            worker.postMessage({
                id : ids,
                status : "start"
            })
            worker.addEventListener("message", (event) => {
                let worker_response = event.data
                if (typeof worker_response != "string"){
                    setOrder(worker_response)
                }else{
                    setLog(worker_response)
                }
            });
            workers.push(worker);
        }
        setWorkers(workers);
    }   

    // starting simulation
    const startSimulation = (active) => {

        switch (active) { 
            case true: 
                console.log("[ACTIVATING MARKET]")
                setSessionState("Stop")
                break; 

            case false:
                console.log("[CLOSING MARKET]")

                workers.forEach((worker) => {
                    worker.postMessage({status : "stop"});
                    worker.terminate()
                })
    
                websocket.close()
                setSessionState("Start")
                break;
        }
    }

    return (
        <React.Fragment>
            <button onClick = {() => 
                {let session_state = sessionState == "Start" ? true : false; startSimulation(session_state)}} 
                style = {{backgroundColor : sessionState == "Start" ? "#7CB9E8" : "#fd5c63"}}
                >
                {sessionState}
            </button> 
         
            <Table data = {[{"beba": 90},{"beba": 110}]}/>
        </React.Fragment>
    )
}

export default Market;