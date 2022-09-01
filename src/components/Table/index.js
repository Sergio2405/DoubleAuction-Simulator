import './style.scss'

const Table = ({ title , data }) => {
    
    return ( 
        <div className = "table">
            {data.length &&
            <table>
                <caption>{title}</caption>
                <thead>
                    <tr>
                        {Object.keys(data[0]).map((label,i) => (
                                <th key={i}>{label}</th>
                            )
                        )}
                    </tr>
                </thead>
                <tbody>
                    {data.map((obs,j) => (
                        <tr key = {j}>
                            {Object.keys(obs).map((feature,i) => (
                                <td key = {i}>{obs[feature]}</td>
                                )
                            )}
                        </tr>
                    ))}
                </tbody>
            </table>}
        </div>
    )
}

export default Table