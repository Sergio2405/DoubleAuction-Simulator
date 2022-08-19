import React, { useState, useEffect } from 'react';
import Order from "../modules/Order";
import {Environment, Screen, Table, TraderList, MarketOrders, ManualOrders, OrderFormat} from './Styles';

const Market =  function(props) {

    const [orders, setOrders] = useState([]);
    const [ordersAdmin, setOrdersAdmin] = useState([]);
    const [workers, setWorkers] = useState([])

    const [sessionState, setSessionState] = useState("Start");
    const [selectChange, setSelectChange] = useState(true);

    const [websocket,setWebsocket] = useState(0)

    const [order,setOrder] = useState(0)

    useEffect(() => {

        if (sessionState == "Stop"){
            console.log('Starting websocket')
            let websocket = new WebSocket("ws://localhost:8001/")
            setWebsocket(websocket)
        }else{
            if (websocket != 0){
                websocket.close()
            }
        }
      }, [sessionState])

    useEffect(() => {
        if (websocket != 0){
            websocket.onopen = () => {
            setWebsocket(websocket)
            createWorkers(parseInt(props.workers));
            setSessionState("Stop")
        }}
    }, [websocket])

    useEffect(() => {
        if (websocket.readyState == 1) {websocket.send(JSON.stringify(order))}
    }, [order])

    const createWorkers = (num) => { 
        console.log("creating workers")
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
                let order_to_place = event.data
                if (typeof order_to_place != "string"){setOrder(order_to_place)}
            });
            workers.push(worker);
        }
        setWorkers(workers);
    }   

    const startSimulation = (active) => {

        if (active){ 
            console.log("Activating market")
            setSessionState("Stop")
        }else{
            console.log("Closing market")

            workers.forEach((worker) => {
                worker.postMessage({status : "stop"});
                worker.terminate()
            })

            let websocketAux = websocket
            websocketAux.close()
            setWebsocket(websocketAux)

            setSessionState("Start")
        }
    }

    const handleManualTraderSubmit = (event) => {

        event.preventDefault() 
        let key_order = orders.length
        let manual_order =  new Order({
            id : key_order,
            type : event.target.order_type.value,
            quantity : event.target.quantity.value,
            price : event.target.price.value,
            trader : "admin",
        })
            
        let [ordersAux, ordersAdminAux] = [[...orders], [...ordersAdmin]]

        ordersAux.push(manual_order)
        ordersAdminAux.push(manual_order)

        setOrders(ordersAux);
        setOrdersAdmin(ordersAdminAux)
    }

    return (
        <Environment>
            <TraderList>
                <button onClick = {() => 
                    {let session_state = sessionState == "Start" ? true : false; startSimulation(session_state)}} 
                    style = {{backgroundColor : sessionState == "Start" ? "#7CB9E8" : "#fd5c63"}}
                    >
                    {sessionState}
                </button> 
            </TraderList>
            <Screen>
                <MarketOrders>
                    <Table>
                        <thead>
                            <tr style = {{border: "1px solid black",borderCollapse: "collapse"}}>
                                <th>Order ID</th>
                                <th>Player ID</th>
                                <th>Type</th>
                                <th>Quantity</th>
                                <th>Price</th> 
                            </tr>
                        </thead>
                        <tbody>
                            {orders.map((order,index) => {
                                return ( 
                                <OrderFormat key = {index} type = {order.type} hidden = {!order.active}>
                                    <td>{order.id}</td>
                                    <td>{order.trader}</td>
                                    <td className = "order_type">{order.type}</td>
                                    <td>{order.quantity}</td>
                                    <td>{order.price}</td>
                                </OrderFormat>
                                )
                            })}
                        </tbody>
                    </Table>
                </MarketOrders>
                <ManualOrders>
                        <form onSubmit = {handleManualTraderSubmit}>
                            <Table>
                                <thead>
                                    <tr style = {{border: "1px solid black",borderCollapse: "collapse"}}>
                                        <th>Type</th>
                                        <th>Quantity</th>
                                        <th>Price</th>
                                    </tr>
                                </thead>
                                <tbody>
                                    <tr>
                                        <td>
                                            <select 
                                            name = "order_type"
                                            style = { selectChange  ? {"backgroundColor" : "green"} : {"backgroundColor" : "red"}} 
                                            onChange = {() => setSelectChange(!selectChange)}
                                            >
                                                <option value = "Buy">Buy</option>
                                                <option value = "Sell">Sell</option>
                                            </select>
                                        </td>
                                        <td>
                                            <input type = "number" name = "quantity" placeholder = "Specify Quantity"/>
                                        </td>
                                        <td>
                                            <input type = "number" name = "price" placeholder = "Specify Price"/>
                                        </td>
                                    </tr>
                                </tbody>
                            </Table>
                            <button style = {{"width": "100%"}}> Place Order </button>
                        </form>
                        <Table>
                            <thead>
                                <tr style = {{border: "1px solid black",borderCollapse: "collapse"}}>
                                    <th>Order ID</th>
                                    <th>Player ID</th>
                                    <th>Type</th>
                                    <th>Quantity</th>
                                    <th>Price</th>
                                </tr>
                            </thead>
                            <tbody>
                                {ordersAdmin.map((order,index) => {
                                    return ( 
                                        <OrderFormat key = {index} type = {order.type} hidden = {!order.active}>
                                            <td>{order.id}</td>
                                            <td>{order.trader}</td>
                                            <td className = "order_type">{order.type}</td>
                                            <td>{order.quantity}</td>
                                            <td>{order.price}</td>
                                        </OrderFormat>                          
                                    )
                                })}
                            </tbody>
                        </Table>
                </ManualOrders> 
            </Screen>
        </Environment>
    )
}

export default Market;