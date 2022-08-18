export default class Order{ 

    constructor(props) { 
        this.id = props.id
        this.type = props.type
        this.action = props.action
        this.quantity = props.quantity
        this.price = props.price
        this.active = true
        this.trader = props.trader
    }

    hideOrder() { 
        this.active = !this.active
    }
}