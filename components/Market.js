import React, { useState } from 'react';
import {Trader, Order} from "../modules/Trader.js";
import {Environment, Screen, Table, TraderList, MarketOrders, ManualOrders, MarketStatistics, OrderFormat} from './Styles';

export default function Market() {

    const [traders, setTraders] = useState([]);
    const [orders, setOrders] = useState([]);
    const [ordersAdmin, setOrdersAdmin] = useState([]);
    const [sessionState, setSessionState] = useState("Start");
    const [marketInterval, setMarketInterval] = useState(0);
    const [selectChange, setSelectChange] = useState(true);

    function handleManualTraderSubmit(event) {

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

    function matchTrades() {

        console.log("Matching Orders....")

        let orders_placed = [...orders];

        let sell_orders = orders_placed.filter((order) => { 
            return order.type == "Sell"
        })

        for (let order of orders_placed) { 

            if (order.type == "Buy") { 
                let sell_orders_sorted = sell_orders.sort((order1,order2) => { 
                    return order1.price - order2.price;
                })

                let min_sell_order = sell_orders_sorted[0];

                let index = orders_placed.indexOf(min_sell_order);
            
                let issuer;
                for (let trader in traders){if (trader.id == min_sell_order.trader){issuer = trader; break}}

                console.log("order matched : ", min_sell_order)

                min_sell_order.hideOrder();
                orders_placed[index] = min_sell_order;

                setOrders(orders_placed)

                // let buy_quantity = Math.min(order.quantit,min_sell_order.quantity)
                // let volume = buy_quantity * min_sell_order.price
            }
        }
    }

    function placeTraderOrder(trader, type) { 

        let key_order = traders.length
        trader.createOrder({
            id: key_order,
			type : type,
			quantity : 54,
			price : 21,
        })

        let order = trader.placeOrder()
        let ordersAux = [...orders]

        ordersAux.push(order)
        setOrders(ordersAux)
    }

    function activateTraders(activate) { 

        const websocket = new WebSocket("ws://localhost:8001/");

        websocket.onopen = () => {
           websocket.send(JSON.stringify({"message":"Iniciando Servidor..."})); 
        }
        
        websocket.addEventListener("message", ({ data }) => {
            console.log("Mensaje del servidor : ", data)
          });
        
        // if (activate) { 
        //     let traders = [...this.state.traders];
        //     traders.forEach((trader) => {
        //         trader.activateTrader(true);
        //         trader.startTrading(websocket)
        //     })
        //     this.setState({traders : traders})
        // } 
    }

    function startSimulation(active) {

        if (active){ 
            activateTraders(active);

            let interval = setInterval(() => matchTrades(),1000);
            setMarketInterval(interval)
            setSessionState("Stop")
        }else{
            clearInterval(marketInterval)
            setSessionState("Start")
        }
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