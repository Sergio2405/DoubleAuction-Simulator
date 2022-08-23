import { Fragment, useState, useEffect } from 'react';
import Table from './components/Tables';
import Serie from './components/Charts/Serie';

import './Market.scss'

const Market = (props) => {

    const [orders, setOrders] = useState([]);
    const [log, setLogs] = useState([])
    const [workers, setWorkers] = useState([]);
    const [workerResponse, setWorkerResponse] = useState([]);

    const [sessionState, setSessionState] = useState(false);

    const [websocket,setWebsocket] = useState(0);

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
        if (websocket.readyState == 1) {
            if (typeof workerResponse != "string"){
                let order = JSON.stringify(workerResponse)
                websocket.send(order)
                setOrders(prevOrders => [...prevOrders, order])
            }else{
                setLogs(prevLogs => [...prevLogs, workerResponse])
            }
        }
    }, [workerResponse])

    // creating workers
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
            workers.push(worker);
        }
        setWorkers(workers);
    }   

    // starting simulation
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

            websocket.close()
            setSessionState(false)
        }     
    }

    const data = [
        {year: 1, efficiency: 24.3, sales: 8949000},
        {year: 2, efficiency: 27.6, sales: 10979000},
        {year: 3, efficiency: 28, sales: 9303000},
        {year: 4, efficiency: 28.4, sales: 8185000},
        {year: 5, efficiency: 27.9, sales: 8213000},
        {year: 6, efficiency: 28.4, sales: 8518000},
        {year: 7, efficiency: 28.3, sales: 8991000},
        {year: 8, efficiency: 28.6, sales: 8620000},
        {year: 9, efficiency: 28.5, sales: 8479000},
        {year: 10, efficiency: 28.7, sales: 8217000},
        {year: 11, efficiency: 28.8, sales: 8085000},
        {year: 12, efficiency: 28.3, sales: 8638000},
        {year: 13, efficiency: 28.5, sales: 8778000},
        {year: 14, efficiency: 28.8, sales: 8352000},
        {year: 15, efficiency: 29, sales: 8042000},
        {year: 16, efficiency: 29.5, sales: 7556000},
        {year: 17, efficiency: 29.5, sales: 7483000},
        {year: 18, efficiency: 30.3, sales: 7660000},
        {year: 19, efficiency: 30.1, sales: 7762000},
        {year: 20, efficiency: 31.2, sales: 7562000},
        {year: 21, efficiency: 31.5, sales: 6769000},
        {year: 22, efficiency: 32.9, sales: 5402000},
        {year: 23, efficiency: 33.9, sales: 5636000},
        {year: 24, efficiency: 33.1, sales: 6093000},
        {year: 25, efficiency: 35.3, sales: 7245000},
        {year: 26, efficiency: 36.4, sales: 7586000},
        {year: 27, efficiency: 36.5, sales: 7708000},
        {year: 28, efficiency: 37.2, sales: 7517000},
        {year: 29, efficiency: 37.7, sales: 6873000},
        {year: 30, efficiency: 39.4, sales: 6081000},
        {year: 31, efficiency: 39.4, sales: 6081000},
      ]

    return (
        <Fragment>
            <button onClick = {() => startSimulation(sessionState)} style = {{backgroundColor : sessionState ? "#fd5c63" : "#7CB9E8"}}>
                {!sessionState ? "Start" : "Stop"}
            </button> 

            <div className = "screen">
                <Table 
                key = {1}
                    title = "Market Statistics" 
                    data = {[{"id": 90, "Price": 15},{"id": 110,"Price":89}]}
                />
                <Serie key = {2} title = "Price Serie" data={data} />
                <Table 
                key = {3}
                    title = "Traders" 
                    data = {[{"beba": 90},{"beba": 110}]}
                />
                <Table 
                    key = {4}
                    title = "Logs" 
                    data = {[{"log": 90},{"log": 110}]}
                />
                <Serie key = {5} data={data} />
                <Serie key = {6} data={data} />
            </div>
        </Fragment>
    )
}

export default Market;