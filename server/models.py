from sqlalchemy import Boolean, Column, ForeignKey, Integer, String, Float 
from sqlalchemy.orm import relationship
from database import Base, SessionLocal

class Market(Base):
    __tablename__ = "markets"

    id = Column(String,primary_key=True)
    mean_price = Column(Float, default=0)
    mean_volume = Column(Float, default=0)
    duration = Column(Float, default=0)
    traders = Column(Integer,default=0)
    trades = Column(Integer,default=0)
    market_orders = Column(Integer,default=0)
    limit_orders = Column(Integer,default=0)

    transactions = relationship("Transaction", back_populates="market")

class Transaction(Base):
    __tablename__ = "transactions"
    
    id = Column(Integer, primary_key=True, index=True)
    limit_issuer = Column(Integer)
    market_issuer = Column(Integer)
    action = Column(String, default="")
    volume = Column(Integer, default=0)
    price = Column(Float,default=0)
    order_id = Column(Integer,default=0)
    market_id = Column(String,ForeignKey("markets.id"))

    market = relationship("Market", back_populates="transactions")
