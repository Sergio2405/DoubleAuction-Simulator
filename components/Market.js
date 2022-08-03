import React from 'react';
import {Trader, Order} from "../modules/Trader.js";
import {Environment, Screen, Table, TraderList, MarketOrders, ManualOrders, MarketStatistics, OrderFormat} from './Styles';

export default class Market extends React.Component {

    constructor(props) {
        super(props)
        this.duration = 0
        this.state = {
            "traders" : [ new Trader({id:0,risk_aversion:26,loss_aversion:9}),
                new Trader({id:1,risk_aversion:26,loss_aversion:9})],
            "orders_placed" : [],
            "selectChange" : true,
            "orders_placed_manual": []
        }
    }

    placeTraderOrder = (trader, type) => { 

        console.log("Placing trade", type)

        let key_order = this.state.orders_placed.length
        trader.createOrder({
            id: key_order,
			type : type,
			quantity : 54,
			price : 21,
        })

        let order = trader.placeOrder()
        this.state.orders_placed.push(order)
        this.setState({
            "orders_placed": this.state.orders_placed,
        })
    }

    handleManualTraderSubmit = (event) => {

        event.preventDefault() 
        let key_order = this.state.orders_placed.length
        let manual_order =  new Order({
            id : key_order,
            type : event.target.order_type.value,
            quantity : event.target.quantity.value,
            price : event.target.price.value,
            trader : "admin",
        })
            
        this.state.orders_placed.push(manual_order)
        this.state.orders_placed_manual.push(manual_order)

        this.setState({
            "orders_placed": this.state.orders_placed,
            "orders_placed_manual" : this.state.orders_placed_manual
        })
    }

    matchTrades = () => {

        console.log("Matching Orders....")

        let orders_placed = [...this.state.orders_placed];

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
                for (let trader in this.state.traders){if (trader.id == min_sell_order.trader){issuer = trader; break}}

                console.log("issuer : ", issuer)
                console.log("issuer : ", min_sell_order)

                min_sell_order.hideOrder();
                orders_placed[index] = min_sell_order;

                this.setState({orders_placed : orders_placed})

                // let buy_quantity = Math.min(order.quantit,min_sell_order.quantity)
                // let volume = buy_quantity * min_sell_order.price
            }
        }
    }

    render() {
        return (
            <Environment>
                <TraderList>
                    <button onClick = {() => this.matchTrades()}>Match Orders</button> 
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
                                {this.state.orders_placed.map((order,index) => {
                                    return ( 
                                    <OrderFormat key = {index} type = {order.type} display = {order.active}>
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
                            <form onSubmit = {this.handleManualTraderSubmit}>
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
                                                style = { this.state.selectChange  ? {"backgroundColor" : "green"} : {"backgroundColor" : "red"}} 
                                                onChange = {() => this.setState({"selectChange" : !this.state.selectChange})}
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
                                    {this.state.orders_placed_manual.map((order,index) => {
                                        return ( 
                                            <OrderFormat key = {index}>
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
                                {this.state.traders.map((trader,index) => {
                                    return ( 
                                        <tr key = {index}>
                                            <td>{trader.id}</td>
                                            <td>{trader.risk_aversion}</td>
                                            <td>{trader.loss_aversion}</td>
                                            <td><button type = "button" style = {{ backgroundColor: "green"}} onClick = {() => this.placeTraderOrder(trader,"Buy")}>B</button></td>
                                            <td><button type = "button" style = {{ backgroundColor: "red"}} onClick = {() => this.placeTraderOrder(trader,"Sell")}>S</button></td>
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
}