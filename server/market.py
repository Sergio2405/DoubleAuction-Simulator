from collections import deque
from datetime import timedelta, datetime
import secrets

class Market(): 

    def __init__(self): 
        self.id = None
        self.buy_limit_orders = deque()
        self.sell_limit_orders = deque()
        self.transactions = 0
        self.volume = 0
        self.market_orders = 0
        self.limit_orders = 0
        self.duration = None
        self.__statistics = {"mean_price"}

    def emptyMarket(self, order):
        return len(self.sell_limit_orders) == 0 if order["action"] == "buy" else len(self.buy_limit_orders) == 0

    def generateMarketId(self):
        chars = "ABCDEFGHIJKLMNOPQRSTUVWXYZ"
        key = "".join(secrets.choice(chars) for _ in range(5))
        return key

    def setupMarket(self, duration):
        self.duration = datetime.now() + timedelta(seconds = duration)
        self.id = self.generateMarketId()

    def setStatistics(self,statistics):
        self.statistics = statistics
        
    def getStatistics(self):
        return self.statistics

    def addOrder(self, order):
        if order["action"] == "buy":
            self.buy_limit_orders.append(order)
        else:
            self.sell_limit_orders.append(order)

        limit_issuer = order["trader"]
        action = order["action"]
        quantity = order["quantity"]
        price = order["price"]

        transaction = {
                "id" : self.limit_orders,
                "limit_issuer" : limit_issuer,
                "action" : action,
                "volume" : quantity,
                "price" : price,
                "log" : f"Trader {limit_issuer} | {action} | {quantity} at {price}",
                "description" : "order"
            }
        
        self.limit_orders += 1

        return transaction

    def findBestOffer(self, order):
        if order["action"] == "buy":
            offer_min = self.sell_limit_orders.popleft()
            n_orders = len(self.sell_limit_orders)
            for _ in range(n_orders): 
                offer = self.sell_limit_orders.popleft() 
                if offer["trader"] != order["trader"]:
                    if offer["price"] < offer_min["price"]:
                        self.sell_limit_orders.append(offer_min)
                        offer_min = offer
                    else:
                        self.sell_limit_orders.append(offer)
            return offer_min
        else:
            offer_max = self.buy_limit_orders.popleft() 
            n_orders = len(self.buy_limit_orders)
            for _ in range(n_orders): 
                offer = self.buy_limit_orders.popleft()
                if offer["trader"] != order["trader"]:
                    if offer["price"] > offer_max["price"]:
                        self.buy_limit_orders.append(offer_max)
                        offer_max = offer
                    else:
                        self.buy_limit_orders.append(offer)
            return offer_max

    def matchTrade(self, order):

        if not self.emptyMarket(order):
 
            offer = self.findBestOffer(order)
        
            quantity_match = order["quantity"] if order["quantity"] <= offer["quantity"] else offer["quantity"] 
            price_match = offer["price"]
            limit_issuer = offer["trader"]
            market_issuer = order["trader"]

            action = offer["action"]

            transaction = {
                "id" : self.transactions,
                "limit_issuer" : limit_issuer,
                "market_issuer" : market_issuer,
                "action" : action,
                "volume" : quantity_match,
                "price" : price_match,
                "order_id" : self.market_orders,
                "log" : f"Trader {limit_issuer} | {action} | Trader {market_issuer} | {quantity_match} at {price_match}",
                "description" : "exchange"
            }

            self.transactions += 1
            self.volume += quantity_match

            return transaction
        
        else: 

            return {
                "log" : "No limit orders placed",
                "description": "No Order"
            }

        self.market_orders += 1
