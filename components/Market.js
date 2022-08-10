import React, { useState, useEffect } from 'react';
import {Trader, Order} from "../modules/Trader.js";
import {Environment, Screen, Table, TraderList, MarketOrders, ManualOrders, MarketStatistics, OrderFormat} from './Styles';

export default function Market() {

    const [traders, setTraders] = useState([new Trader({id:0,risk_aversion:90,loss_aversion:8,bot:true})]);
    const [orders, setOrders] = useState([]);
    const [ordersAdmin, setOrdersAdmin] = useState([]);

    const [sessionState, setSessionState] = useState("Start");
    const [selectChange, setSelectChange] = useState(true);

    const [marketInterval, setMarketInterval] = useState(0);
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
            websocket.addEventListener("message", ({ data }) => {
                console.log("Order received",data)
                setOrder(data)
            });

            websocket.onopen = () => {
                setWebsocket(websocket)
                console.log("Guardando websocket")

                let interval = setInterval(() => matchTrades(orders),1000);
                setMarketInterval(interval)
                setSessionState("Stop")

                activateTraders(true,websocket);
            }
        }
    }, [websocket])

    useEffect(() => {

        console.log(orders)
        if (order != 0){
            let ordersAux = [...orders]
            ordersAux.push(JSON.parse(order))
            setOrders(ordersAux)  
        }

    }, [order])

    const  startSimulation = (active) => {

        if (active){ 

            console.log("Activating market")
            setSessionState("Stop")
            
        }else{

            console.log("Cerrando market")
            clearInterval(marketInterval)

            let websocketAux = websocket
            activateTraders(active, websocketAux)
            websocketAux.close()
            setWebsocket(websocketAux)

            setSessionState("Start")
        }
    }

    const activateTraders = (active,websocket) => { 

        if (active) { 
            console.log("Activando traders")

            let tradersAux = [...traders];
            tradersAux.forEach((trader) => {
                trader.activateTrader(true);
                trader.startTrading(websocket)
            })

            setTraders(tradersAux)
        }else{
            let tradersAux = [...traders];
            tradersAux.forEach((trader) => {
                trader.activateTrader(false);
                trader.startTrading(websocket)
            })
        }
    }

    const placeTraderOrder = (trader, type) => { 

        let key_order = traders.length
        trader.createOrder({
            id: key_order,
			type : type,
			quantity : 54,
			price : 21,
        })
        trader.placeOrder(websocket)
        let order = trader.getOrders().slice(-1)[0]
        let ordersAux = [...orders]

        ordersAux.push(order)
        setOrders(ordersAux)
    }

    const handleManualTraderSubmit = (event) => {

        event.preventDefault() 
        let key_order = traders.length
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
                <MarketStatistics>
                    <Table>
                        <thead>
                            <tr style = {{border: "1px solid black",borderCollapse: "collapse"}}>
                                <th>Player ID</th>
                                <th>Risk Aversion</th>
                                <th>Loss Aversion</th>
                                <th>Buy</th>
                                <th>Sell</th>
                            </tr>
                        </thead>
                        <tbody>
                            {traders.map((trader,index) => {
                                return ( 
                                    <tr key = {index}>
                                        <td>{trader.id}</td>
                                        <td>{trader.risk_aversion}</td>
                                        <td>{trader.loss_aversion}</td>
                                        <td><button type = "button" style = {{ backgroundColor: "green"}} onClick = {() => placeTraderOrder(trader,"Buy")}>B</button></td>
                                        <td><button type = "button" style = {{ backgroundColor: "red"}} onClick = {() => placeTraderOrder(trader,"Sell")}>S</button></td>
                                    </tr>
                                )
                            })}
                        </tbody>
                    </Table>
                </MarketStatistics>  
            </Screen>
        </Environment>
    )
    

}