import styled from 'styled-components'

export const Environment = styled.div`
    display: flex;
    flex-direction: column;
    font-family: "Times New Roman", Times, serif;
`

export const Screen = styled.div`
	align-items: center;
	display: flex;
    flex-direction : row;
	justify-content: center;
	height: 300px;
	width: 1500px;

    th, td { 
        border: 1px solid black;
        border-collapse: collapse;
    };
`

export const TraderList = styled.div`
    border: 1px solid red;
`

export const MarketOrders = styled.div`
    overflow: auto;
    height: 100%;
    width : 100%
`

export const ManualOrders = styled.div`
    overflow: auto;
    height : 100%;
    width : 100%
`

export const MarketStatistics = styled.div`
    height : 100%;
    width : 100%
`

export const OrderFormat = styled.tr` 

    &:hover {
        background-color:rgb(202, 202, 202)
    };

    .order_type { 
      background-color : ${(props) => {return props.type == "Buy" ? `green` : `red`}}  
    }
    
`

export const Table = styled.table`
    width: 100%;
    border-collapse: collapse;
`