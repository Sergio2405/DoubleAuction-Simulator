let interval;
let id;
let price;
let quantity;
let holdings;

function Round(number) { 
    return (Math.round(number*100))/100;
}

const createOrder = () => {
    let order = {
        type : Math.random() > 0.5 ? "market" : "limit" ,
        action : Math.random() > 0.5 ? "buy" : "sell",
        quantity : parseInt(Math.random()*quantity),
        price : Round(Math.random()*price),
        active : true,
        trader : id,
        setup  : null,
    }
    return order
}

const placeOrder = async () => {
    console.log("placing order")
    let awaitTime = Math.random()*1000;
    await new Promise((resolve) => {setTimeout(resolve,awaitTime)}); // "lag"

    let order = createOrder();
    return order
}

const startTrading = () => {
    placeOrder().then((order) => postMessage(order)); 
}
// eslint-disable-next-line no-restricted-globals
self.addEventListener("message", ({ data }) => {
    if (data.id != null){
        id = data.id;
        price = data.price;
        quantity = data.quantity;
    }
    holdings = data.holdings;
    if (data.status != null){
        switch (data.status) {
            case "start":
                postMessage(`Worker ${data.id} started trading`)
                interval = setInterval(() => {
                    startTrading();
                },1000)
                break;
        
            case "stop":
                console.log(`Worker stopped trading`);
                clearInterval(interval)
                break;
        }
    }
})