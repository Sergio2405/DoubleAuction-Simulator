export class Trader{

    constructor(props) { 
		this.id = props.id
        this.risk_aversion = props.risk_aversion 
        this.loss_aversion = props.loss_aversion 
        this.bot = props.bot
        this.active = false
        this.my_orders = []
        this.interval = undefined
    }

    startTrading(websocket) { 

        if ((this.active) && (websocket.readyState != 3)){
            console.log("Empezando a tradear")
            this.interval = setInterval(() => {
                console.log("Dentro de trader interval")
                this.createOrder({
                    type : "Buy",
                    quantity : Math.random()*45,
                    price : Math.random()*21,
                });
                this.placeOrder(websocket)
            },5000)  
        }else{
            clearInterval(this.interval)
            console.log("Cerrando trader interval")
        }
    }

    createOrder(args){

        let order_to_place = new Order({
			type : args.type,
			quantity : args.quantity,
			price : args.price,
            active : true,
            trader : this.id
        })

        this.updateOrders(order_to_place)
    }

    activateTrader(state) {
        this.active = state
    }

    placeOrder(websocket) { 

        let order_to_place = new Order({
			type : "Buy",
			quantity : Math.random()*45,
			price : Math.random()*12,
            active : true,
            trader : this.id
        })

        websocket.send(JSON.stringify(order_to_place))
        console.log("Trader ${this.id} send to server: ", order_to_place)
    }

    getOrders() { 
        return this.my_orders
    }

    updateOrders(order) { 
        this.my_orders.push(order)
    }
}

export class Order{ 

    constructor(props) { 
        this.id = props.id
        this.type = props.type
        this.quantity = props.quantity
        this.price = props.price
        this.active = true
        this.trader = props.trader
    }

    hideOrder() { 
        this.active = !this.active
    }
}