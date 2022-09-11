import './style.scss'

const Round = num => (Math.round(num*100))/100;

const Table = ({ title , headers, data }) => {
    return ( 
        <div className = "table">
            {data.length &&
            <table>
                <caption>{title}</caption>
                <thead>
                    <tr>
                        {headers.map((label,i) => (
                                <th key={i}>{label}</th>
                            )
                        )}
                    </tr>
                </thead>
                <tbody>
                    {data.map((obs,j) => (
                        <tr key = {j}>
                            {headers.map((feature,i) => {
                                    let value = obs[feature];
                                    if (typeof value == "number"){
                                        value = Round(value);
                                    };
                                    return <td key = {i}>{value}</td>
                                }
                            )}
                        </tr>
                    ))}
                </tbody>
            </table>}
        </div>
    )
}

export default Table