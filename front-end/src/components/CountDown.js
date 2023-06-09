import React, { useEffect, useState } from "react";
import Countdown from "react-countdown";
import { CollectionConfig } from "../utils/CollectionConfig";

function CountDown() {
  const [nextDate, setNextDate] = useState(0);

  const format = (num) => {
    return num.toLocaleString("en-US", {
      minimumIntegerDigits: 2,
      useGrouping: false,
    });
  };

  const renderer = ({ days, hours, minutes, seconds, completed }) => {
    if (completed) {
      return <></>;
    } else {
      return (
        <ul id="countdown" className="count-down">
          <li className="clock-item">
            <span className="count-number days">{format(days)}</span>
            <p className="count-text">Days</p>
          </li>

          <li className="clock-item">
            <span className="count-number hours">{format(hours)}</span>
            <p className="count-text">Hour</p>
          </li>

          <li className="clock-item">
            <span className="count-number minutes">{format(minutes)}</span>
            <p className="count-text">Min</p>
          </li>

          <li className="clock-item">
            <span className="count-number seconds">{format(seconds)}</span>
            <p className="count-text">Sec</p>
          </li>
        </ul>
      );
    }
  };

  const getNextDate = () => {
    const now = Date.now();
    const dates = CollectionConfig.releaseDates;
    const whitelistStart = dates.whitelistStart.getTime();
    const whitelistEnd = dates.whitelistEnd.getTime();
    const presaleStart = dates.presaleStart.getTime();
    const presaleEnd = dates.presaleEnd.getTime();
    const publicSaleOpen = dates.publicSaleOpen.getTime();
    let _nextDate;
    if (now < whitelistStart) {
      _nextDate = whitelistStart;
    } else if (now > whitelistStart && now < whitelistEnd) {
      _nextDate = whitelistEnd;
    } else if (now < presaleStart) {
      _nextDate = presaleStart;
    } else if (now > presaleStart && now < presaleEnd) {
      _nextDate = presaleEnd;
    } else if (now < publicSaleOpen) {
      _nextDate = publicSaleOpen;
    }
    setNextDate(_nextDate);
  };

  useEffect(() => {
    getNextDate();
  }, []);

  return (
    <section className="container">
      <div className="countdown">
        <Countdown
          date={CollectionConfig.releaseDates.whitelistStart.getTime()}
          renderer={renderer}
        />
      </div>
    </section>
  );
}

export default CountDown;
