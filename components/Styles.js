import styled from 'styled-components'

export const Environment = styled.div`
    display: flex;
    flex-direction: column
`

export const Screen = styled.div`
	align-items: center;
	display: flex;
    flex-direction : row;
	justify-content: center;
	height: 300px;
	width: 1500px;
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

export const Table = styled.table`
    width: 100%;
    border-collapse: collapse;
`