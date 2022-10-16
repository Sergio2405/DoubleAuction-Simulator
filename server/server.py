from datetime import datetime
from fastapi import Depends, FastAPI, WebSocket 
from sqlalchemy.orm import Session

import models
from database import engine, Db 
from market import Market

models.Base.metadata.create_all(bind=engine)

app = FastAPI()

#def get_db():
#    db = SessionLocal()
#    try:
#        yield db
#    finally:
#        db.close()

@app.get("/")
async def connected():
    #await Db.connect()
    return "Hello from the server"

@app.websocket("/market_socket")
async def market_server(websocket:WebSocket):
    await websocket.accept()
    print("Hola desde socket")
    while True:
        message = await websocket.receive_json()
        
        if message["setup"]: 
            global market
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
                #await Db.disconnect()
       
        #await websocket.send_json({"log":"Message has been received"})
        
@app.post("/save_database")
async def save_database(database_name:str,db: Session = Depends(get_db)):
    return "Received " + database_name 

