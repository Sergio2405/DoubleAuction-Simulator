import './style.scss'

const Round = num => (Math.round(num*100))/100;

function Table({ title , headers, data, style }){
    return ( 
        <div className = "table" style = {style}>
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
                    {Object.keys(data).map((obs,j) => (
                        <tr key = {j}>
                            {headers.map((feature,i) => {
                                    let value = data[obs][feature];
                                    if (typeof value == "number"){
                                        value = Round(value);
                                    };
                                    return <td key = {i}>{value}</td>
                                }
                            )}
                        </tr>
                    ))}
                </tbody>
            </table>
        </div>
    )
}

export default Table