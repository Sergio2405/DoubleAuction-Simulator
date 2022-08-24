from collections import deque

class Market(): 

    def __init__(self): 
        self.buy_limit_orders = deque()
        self.sell_limit_orders = deque([{
			"type" : "limit",
            "action" : "Sell",
			"quantity" : 45,
			"price" : 12,
            "active" : True,
            "trader" : 0
        }, {
			"type" : "limit",
            "action" : "Sell",
			"quantity" : 12,
			"price" : 5,
            "active" : True,
            "trader" : 0
        }, {
			"type" : "limit",
            "action" : "Sell",
			"quantity" : 7,
			"price" : 81,
            "active" : True,
            "trader" : 0
        }])
        self.transactions = 0
        self.volume = 0

    def emptyMarket(self, order):
        return len(self.sell_limit_orders) == 0 if order["action"] == "buy" else len(self.buy_limit_orders) == 0

    def addOrder(self, order):

        if order["action"] == "Buy":
            self.buy_limit_orders.append(order)
        else:
            self.sell_limit_orders.append(order)

    def findBestOffer(self, order):
        if order["action"] == "buy":
            n_orders = len(self.sell_limit_orders)
            offer_min = self.sell_limit_orders.popleft() # first value of que
            for _ in range(n_orders): 
                offer = self.sell_limit_orders.popleft() 
                if offer["price"] < offer_min["price"]:
                    self.sell_limit_orders.append(offer_min)
                    offer_min = offer
                else:
                    self.sell_limit_orders.append(offer)
            return offer_min
        else:
            n_orders = len(self.buy_limit_orders)
            offer_max = self.buy_limit_orders.popleft() # first value of que
        
            for _ in range(n_orders): 
                offer = self.buy_limit_orders.popleft() 
                if offer.price > offer_max.price:
                    self.buy_limit_orders.append(offer_max)
                    offer_max = offer
                else:
                    self.buy_limit_orders.append(offer)

            return offer_max

    def matchTrade(self, order):

        if not self.emptyMarket(order):
 
            offer = self.findBestOffer(order)
        
            quantity_match = order["quantity"] if order["quantity"] <= offer["quantity"] else offer["quantity"] 

            limit_issuer = offer["trader"]
            market_issuer = order["trader"]

            transaction = {
                "id" : self.transactions,
                "limit_issuer" : limit_issuer,
                "market_issuer" : market_issuer,
                "volume" : quantity_match,
                "price" : offer["price"],
                "order_id" : offer
            }

            self.transactions += 1
            self.volume += quantity_match

        self.market_orders += 1

        return transaction

if __name__ == "__main__":
    
    beba = deque([1,2,3])