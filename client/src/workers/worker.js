let interval;
let id;
let price;
let quantity;

function Round(number) { 
    return (Math.round(number*100))/100
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
    let awaitTime = Math.random()*1000;
    await new Promise((resolve) => {setTimeout(resolve,awaitTime)}); // "lag"
    
    let order = createOrder();
    return order
}

const startTrading = () => {
    placeOrder().then((order) => postMessage(order)); 
}

// eslint-disable-next-line no-restricted-globals
self.addEventListener("message", (e) => {
    const workerData = e.data
    id = workerData.id;
    price = workerData.price;
    quantity = workerData.quantity;
    switch (workerData.status) {
        case "start":
            postMessage(`Worker ${workerData.id} started trading`)
            interval = setInterval(() => {
                startTrading();
            },1000)
            break;
    
        case "stop":
            console.log(`Worker stopped trading`)
            clearInterval(interval)
            break;
    }
})