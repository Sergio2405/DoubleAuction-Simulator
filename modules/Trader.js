export class Trader{

    constructor(props) { 
		this.id = props.id
        this.risk_aversion = props.risk_aversion 
        this.loss_aversion = props.loss_aversion 
        this.my_orders = []
    }

    createOrder(args){

        let order_to_place = new Order({
            id: args.id,
			type : args.type,
			quantity : args.quantity,
			price : args.price,
            active : true,
            trader : this.id
        })

        this.updateOrders(order_to_place)
    }

    placeOrder() { 
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