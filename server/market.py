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

    def emptyMarket(self, order):
        return len(self.sell_limit_orders) == 0 if order["action"] == "buy" else len(self.buy_limit_orders) == 0

    def addOrder(self, order):

        if order["action"] == "Buy":

            print("buy ", self.buy_limit_orders)
            self.buy_limit_orders.append(order)
        else:

            print("sell ", self.sell_limit_orders)
            self.sell_limit_orders.append(order)

    def findMinSellPrice(self):
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

    def findMaxBuyPrice(self):
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

        if order["action"] == "buy":

            offer = self.findMinSellPrice()
            
            quantity_match = order["quantity"] if order["quantity"] <= offer["quantity"] else offer["quantity"] 
            price_match = offer["price"]

            trader_limit = {
                "trader" : offer["trader"],
                "quantity" : quantity_match, # increments units of asset
                "holdings" : quantity_match * price_match
            }

            trader_market = {
                "trader" : order["trader"],
                "quantity" : -quantity_match, # decrements units of asset
                "holdings" : -quantity_match * price_match
            }
        
        else:
            
            offer = self.findMaxBuyPrice()
            
            quantity_match = order["quantity"] if order["quantity"] <= offer["quantity"] else offer["quantity"] 
            price_match = offer["price"]

            trader_limit = {
                "trader" : offer["trader"],
                "quantity" : -quantity_match, # decrements units of asset
                "holdings" : -quantity_match * price_match
            }

            trader_market = {
                "trader" : order["trader"],
                "quantity" : quantity_match, # increments units of asset
                "holdings" : quantity_match * price_match
            }

        transaction = {
            "id" : 0,
            "limit" : trader_limit,
            "market" : trader_market,
            "order" : offer
        }

        return transaction

if __name__ == "__main__":
    
    beba = deque([1,2,3])