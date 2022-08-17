import asyncio
import websockets
import json

from market import Market

async def handler(websocket):

    market = Market()

    async for order in websocket: # receive from front
        market.addOrder(order)

        buy_limit = market.buy_limit_orders
        sell_limit = market.sell_limit_orders

        response = {
            "buy_limit" : list(buy_limit),
            "sell_limit" : list(sell_limit)
        }
        await websocket.send(json.dumps(response)) #send back to front
        
async def main():
    print("Market has opened!")
    async with websockets.serve(handler, "localhost", 8001):
        await asyncio.Future() 

if __name__ == "__main__":
    asyncio.run(main())