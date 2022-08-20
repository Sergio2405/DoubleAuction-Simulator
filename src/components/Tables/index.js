const Table = ({  }) => (
    <table>
        <thead>
            <tr style = {{border: "1px solid black",borderCollapse: "collapse"}}>
                <th>Order ID</th>
                <th>Player ID</th>
                <th>Type</th>
                <th>Action</th>
                <th>Quantity</th>
                <th>Price</th> 
            </tr>
         </thead>
         <tbody>
            {orders.map(order => {
                <Order order = {order}/>
            })}
         </tbody>
    </table>
)

export default Table