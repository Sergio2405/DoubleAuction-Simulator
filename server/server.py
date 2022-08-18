import asyncio
import websockets
import json

from market import Market

async def exchange(websocket):

    market = Market()

    async for order in websocket: # receive from front

        response = {}
        order = json.loads(order)
        
        if order["type"] == "market":
            if market.emptyMarket(order): 
                order["active"] = False
                order["message"] = "Market is empty"
            else:
                print("matching")
                transaction = market.matchTrade(order)
                response["transaction"] = transaction
        else:
            market.addOrder(order)

        print("response -> ",response)

        await websocket.send(json.dumps(response)) # send back to front
        
async def main():
    print("Market has opened!")
    async with websockets.serve(exchange, "localhost", 8001):
        await asyncio.Future() 

if __name__ == "__main__":
    asyncio.run(main())