import React, { useEffect, useState } from "react";

function CountDown(props) {
    const [timerDays, setTimerDays] = useState(0);
    const [timerHours, setTimerHours] = useState(0);
    const [timerMinutes, setTimerMinutes] = useState(0);
    const [timerSeconds, setTimerSeconds] = useState(0);

    let interval;

    const startTimer = () => {
        const countDownDate = props.date;

        interval = setInterval(() => {
            const now = new Date().getTime();

            const distance = countDownDate - now;

            const days = Math.floor(distance / (24 * 60 * 60 * 1000));
            const hours = Math.floor(
                (distance % (24 * 60 * 60 * 1000)) / (1000 * 60 * 60)
            );
            const minutes = Math.floor((distance % (60 * 60 * 1000)) / (1000 * 60));
            const seconds = Math.floor((distance % (60 * 1000)) / 1000);

            if (distance < 0) {
                clearInterval(interval.current);
            } else {
                // Update Timer
                setTimerDays(days);
                setTimerHours(hours);
                setTimerMinutes(minutes);
                setTimerSeconds(seconds);
            }
        });
    };

    useEffect(() => {
        startTimer();
    });

    return (
        <section class="container">
            <div class="countdown">
                <ul
                    id="countdown"
                    class="count-down"
                    data-date="Feb 17, 2022 4:00:00 PM UTC"
                >
                    <li class="clock-item">
                        <span class="count-number days">{timerDays}</span>
                        <p class="count-text">Days</p>
                    </li>

                    <li class="clock-item">
                        <span class="count-number hours">{timerHours}</span>
                        <p class="count-text">Hour</p>
                    </li>

                    <li class="clock-item">
                        <span class="count-number minutes">{timerMinutes}</span>
                        <p class="count-text">Min</p>
                    </li>

                    <li class="clock-item">
                        <span class="count-number seconds">{timerSeconds}</span>
                        <p class="count-text">Sec</p>
                    </li>
                </ul>
            </div>
        </section>
    );
}

export default CountDown;