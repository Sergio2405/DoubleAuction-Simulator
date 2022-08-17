import asyncio
import json
import websockets

async def handler(websocket):

    async for message in websocket: #recv from client
    
        event = json.loads(message)
        print(event)

        await websocket.send(json.dumps(event)) #send to client
        
async def main():
    print("Ready to Receive Trades")
    async with websockets.serve(handler, "localhost", 8001):
        await asyncio.Future()  # run forever

if __name__ == "__main__":
    asyncio.run(main())


