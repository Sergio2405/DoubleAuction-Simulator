let interval;
let websocket;

const createOrder = () => {}

const placeOrder = async () => {

    let awaitTime = Math.random()*1000;
    await new Promise((resolve) => {setTimeout(resolve,awaitTime)}) // "lag"
    
    let order = {
        type : "market",
        action : "buy",
        quantity : Math.random()*45,
        price : Math.random()*12,
        active : true,
        trader : 0
    }
    return order
}

const startTrading = () => {
    placeOrder().then((order) => postMessage(order)); 
}

// eslint-disable-next-line no-restricted-globals
self.addEventListener("message", (e) => {
    const workerData = e.data
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