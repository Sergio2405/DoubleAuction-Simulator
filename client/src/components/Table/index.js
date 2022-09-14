import './style.scss'

const Round = num => (Math.round(num*100))/100;

function Table({ title , headers, data , cellColors}){
    return ( 
        <div className = "table">
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
                                    
                                    let style_cell = null;
                                    if (cellColors){
                                        if (cellColors[feature]){
                                            let options = Object.keys(cellColors[feature]);
                                            for (let option of options){
                                                if (option == value){
                                                    style_cell = cellColors[feature][option];
                                                    break;
                                                };
                                            };
                                        }
                                    }
                                    return <td key = {i} style = {{backgroundColor: style_cell}}>{value}</td>;
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