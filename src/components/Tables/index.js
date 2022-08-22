import './style.scss'

const Table = ({ data }) => (
    <table>
        <thead>
            <tr>
                {Object.keys(data[0]).map(label => (
                        <th>{label}</th>
                    )
                )}
            </tr>
         </thead>
         <tbody>
            {data.map(obs => (
                <tr>
                    {Object.keys(obs).map(feature => (
                        <td>{obs[feature]}</td>
                        )
                    )}
                </tr>
            ))}
         </tbody>
    </table>
)

export default Table