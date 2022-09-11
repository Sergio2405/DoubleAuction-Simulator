import {useState, useEffect, useRef } from 'react';

const Timer = ({ duration, active }) => {
    const [seconds, setSeconds] = useState(null);
    const [inter, setInter] = useState(null);

    const timer = useRef(null);
    
    useEffect(() => {
        if (seconds == duration){
            const interval = setInterval(() => setSeconds(parseInt(timer.current.innerHTML) - 1),1000);
            setInter(interval);
        }
        
        if (seconds <= 0){ 
            clearInterval(inter);
        }
    }, [seconds]);

    useEffect(() => {
        if (active) { 
            setSeconds(duration);
        }
    }, [active])

    return (
        <div className = "timer">
            <label>Time Left </label>
            <button ref = {timer} type = "button">{seconds ? seconds : duration}</button>
            <label> seconds</label>
        </div>
    )
}

export default Timer