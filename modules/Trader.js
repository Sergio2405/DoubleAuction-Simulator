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

        if (this.active){
            this.interval = setInterval(() => {
                this.createOrder({
                    type : "Buy",
                    quantity : 54,
                    price : 21,
                });
                this.placeOrder(websocket)
            },2000)  
        }else{
            clearInterval(this.interval)
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

        console.log("Trader ${this.id}", order_to_place)

        this.updateOrders(order_to_place)
    }

    activateTrader(state) {
        this.active = state
    }

    placeOrder(websocket) { 
        console.log("Placing order")
        return this.my_orders.slice(-1)[0] // get recent order
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