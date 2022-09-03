import asyncio
import websockets
import json
from datetime import timedelta, datetime
import logging
from market import Market

async def exchange(websocket):

    market = Market()
    
    async for message in websocket:

        message = json.loads(message)
        
        if message["setup"]: 
            setup = message["setup"]
            market.setupMarket(duration = setup["duration"])
            response = {"log": "Market is open", "time": datetime.now().strftime('%H:%M:%S.%f')}
            print("Market has opened!")
            await websocket.send(json.dumps(response)) 
        else:
            if datetime.now() < market.duration: 
                order = message
                if order["type"] == "market":
                    response = market.matchTrade(order)
                else:
                    response = market.addOrder(order)

                response["time"] = datetime.now().strftime('%H:%M:%S.%f')
                await websocket.send(json.dumps(response))
            else:
                response = {"log" : "Market is closed", "time" : datetime.now().strftime('%H:%M:%S.%f')}
                print("Market is Closed!")
                await websocket.close()
        
async def main():
    async with websockets.serve(exchange, "localhost", 8001):
        await asyncio.Future() 

if __name__ == "__main__":
    asyncio.run(main())