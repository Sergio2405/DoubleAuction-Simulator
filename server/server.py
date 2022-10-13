import asyncio
import websockets
import json
from datetime import timedelta, datetime
import logging
from market import Market
from fastapi import FastAPI, WebSocket 

HOST = "localhost" 
PORT = 8001

app = FastAPI()

@app.get("/")
async def connected():
    return "Hello from the server"

@app.websocket("/market_socket")
async def market_server(websocket:WebSocket):
    await websocket.accept()
    while True:
        message = await websocket.receive_json()
        
        if message["setup"]: 
            market = Market()
            setup = message["setup"]
            market.setupMarket(duration = setup["duration"])
            response = {"log": "Market is open", "time": datetime.now().strftime('%H:%M:%S.%f')}
            print("Market has opened!")
            await websocket.send_json(response) 
        else:
            if datetime.now() < market.duration: 
                order = message
                if order["type"] == "market":
                    response = market.matchTrade(order)
                else:
                    response = market.addOrder(order)

                response["time"] = datetime.now().strftime('%H:%M:%S.%f')
                await websocket.send_json(response)
            else:
                response = {"log" : "Market is closed", "time" : datetime.now().strftime('%H:%M:%S.%f')}
                await websocket.send_json(response)
                print("Market is Closed!")
                await websocket.close()
       
        await websocket.send_json({"log":"Message has been received"})

#async def market():
#    print("[SERVER UP]")
#    async with websockets.serve(exchange, HOST, PORT):
#        await asyncio.Future() 

if __name__ == "__main__":
    asyncio.run(market())
