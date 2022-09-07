import {useState, useEffect } from 'react';

const Timer = ({ duration }) => {

    const [seconds, setSeconds] = useState(duration) 
    const [timer, setTimer] = useState(null)
    
    useEffect(() => {
        if (seconds == duration){
            const interval = setInterval(() => setSeconds(seconds - 1),1000);
            setTimer(interval)
        }else if (seconds <= 0){ 
            clearInterval(timer);
        }else { 
            console.log(seconds)
        }
    }, [seconds]);

    return (
        <div className = "timer">
            <button type = "button">{seconds}</button>
        </div>
    )
}

export default Timer