import {useState, useEffect, useRef } from 'react';

const Timer = ({ duration, active }) => {
    const [seconds, setSeconds] = useState(null);
    const [inter, setInter] = useState(null);

    const timer = useRef(null);
    
    useEffect(() => {
        if (seconds == duration){
            const interval = setInterval(() => setSeconds(parseInt(timer.current.innerHTML) - 1),1000);
            setInter(interval);
        }else if (seconds <= 0){ 
            clearInterval(inter);
        }else { 
            console.log(seconds);
        }
    }, [seconds]);

    useEffect(() => {
        if (active) { 
            setSeconds(duration);
        }
    }, [active])

    return (
        <div className = "timer">
            <button ref = {timer} type = "button">{seconds}</button>
            {active ? "true" : "false"}
        </div>
    )
}

export default Timer