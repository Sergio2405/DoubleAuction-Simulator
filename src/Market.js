import React, { useState, useEffect } from 'react';
import Table from './components/Tables';
import Serie from './components/Charts/Serie';

import './Market.scss'

const Market = (props) => {

    const [orders, setOrders] = useState([]);
    const [workers, setWorkers] = useState([]);
    const [logs, setLogs] = useState([]);

    const [sessionState, setSessionState] = useState(false);

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
        if (websocket.readyState == 1) {
            websocket.send(JSON.stringify(order))
            setOrders(prevOrders => [...prevOrders, order])
        }
    }, [order])

    useEffect(() => {
        if (log != 0) {
            setLogs(prevLogs => [...prevLogs, log])
        }
    }, [log])

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
        {year: 1980, efficiency: 24.3, sales: 8949000},
        {year: 1985, efficiency: 27.6, sales: 10979000},
        {year: 1990, efficiency: 28, sales: 9303000},
        {year: 1991, efficiency: 28.4, sales: 8185000},
        {year: 1992, efficiency: 27.9, sales: 8213000},
        {year: 1993, efficiency: 28.4, sales: 8518000},
        {year: 1994, efficiency: 28.3, sales: 8991000},
        {year: 1995, efficiency: 28.6, sales: 8620000},
        {year: 1996, efficiency: 28.5, sales: 8479000},
        {year: 1997, efficiency: 28.7, sales: 8217000},
        {year: 1998, efficiency: 28.8, sales: 8085000},
        {year: 1999, efficiency: 28.3, sales: 8638000},
        {year: 2000, efficiency: 28.5, sales: 8778000},
        {year: 2001, efficiency: 28.8, sales: 8352000},
        {year: 2002, efficiency: 29, sales: 8042000},
        {year: 2003, efficiency: 29.5, sales: 7556000},
        {year: 2004, efficiency: 29.5, sales: 7483000},
        {year: 2005, efficiency: 30.3, sales: 7660000},
        {year: 2006, efficiency: 30.1, sales: 7762000},
        {year: 2007, efficiency: 31.2, sales: 7562000},
        {year: 2008, efficiency: 31.5, sales: 6769000},
        {year: 2009, efficiency: 32.9, sales: 5402000},
        {year: 2010, efficiency: 33.9, sales: 5636000},
        {year: 2011, efficiency: 33.1, sales: 6093000},
        {year: 2012, efficiency: 35.3, sales: 7245000},
        {year: 2013, efficiency: 36.4, sales: 7586000},
        {year: 2014, efficiency: 36.5, sales: 7708000},
        {year: 2015, efficiency: 37.2, sales: 7517000},
        {year: 2016, efficiency: 37.7, sales: 6873000},
        {year: 2017, efficiency: 39.4, sales: 6081000},
        {year: 2018, efficiency: 39.4, sales: 6081000},
      ]

    return (
        <React.Fragment>
            <button onClick = {() => startSimulation(sessionState)} style = {{backgroundColor : sessionState ? "#fd5c63" : "#7CB9E8"}}>
                {!sessionState ? "Start" : "Stop"}
            </button> 

            <div className = "screen">
                <Table 
                    title = "Market Statistics" 
                    data = {[{"id": 90, "Price": 15},{"id": 110,"Price":89}]}
                />
                <Serie data={data} />
                <Table 
                    title = "Traders" 
                    data = {[{"beba": 90},{"beba": 110}]}
                />
                <Table 
                    title = "Logs" 
                    data = {[{"log": 90},{"log": 110}]}
                />
                <Serie data={data} />
                <Serie data={data} />
            </div>
        </React.Fragment>
    )
}

export default Market;