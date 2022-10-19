from datetime import datetime
from fastapi import Depends, FastAPI, WebSocket 
from sqlalchemy.orm import Session

import models
from database import engine, SessionLocal 
from market import Market

models.Base.metadata.create_all(bind=engine)

app = FastAPI()

def get_db():
    db = SessionLocal()
    try:
        yield db
    finally:
        db.close()

@app.get("/")
async def connected():
    return "Hello from the server"

@app.websocket("/market_socket")
async def market_server(websocket:WebSocket, db:Session=Depends(get_db)):
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

            db_market = models.Market(id=market.id)
            db.add(db_market)
            db.commit()
            db.refresh(db_market)
        else:
            if datetime.now() < market.duration: 
                order = message
                if order["type"] == "market":
                    response = market.matchTrade(order)
                    response_copy = response.copy()

                    if response_copy["description"]!="No Order":
                        del response_copy["log"]
                        del response_copy["description"]
                        del response_copy["id"]
                        
                        db_transaction = models.Transaction(**response_copy,market_id=market.id)
                        db.add(db_transaction)
                        db.commit()
                        db.refresh(db_transaction)

                elif order["type"] == "limit":
                    response = market.addOrder(order)
                else:
                    pass
                    #market.setStatistics(order)

                response["time"] = datetime.now().strftime('%H:%M:%S.%f')
                await websocket.send_json(response)

            else:
                response = {"log" : "Market is closed", "time" : datetime.now().strftime('%H:%M:%S.%f')}
                await websocket.send_json(response)
                print("Market is Closed!")

                #statistics = market.getStatistics()
                #for statistic in statistics:
                #    setattr(db_market,statistic,statistics[statistic]) 
                #db.commit()
                await websocket.close()
                break 
@app.post("/save_db")
async def save_db(database_name:str, db: Session = Depends(get_db)):
    return "Received " + database_name 

