import { useState, useEffect } from 'react';
import './CountDown.css';

export default function CountDown({ targetDate, title, type = 'days' }) {
  const [timeLeft, setTimeLeft] = useState(calculateTimeLeft());

  function calculateTimeLeft() {
    const now = new Date();
    const target = new Date(targetDate);

    if (type === 'since') {
      // 在一起多少天
      const diff = now - target;
      const days = Math.floor(diff / (1000 * 60 * 60 * 24));
      const hours = Math.floor((diff % (1000 * 60 * 60 * 24)) / (1000 * 60 * 60));
      const minutes = Math.floor((diff % (1000 * 60 * 60)) / (1000 * 60));
      const seconds = Math.floor((diff % (1000 * 60)) / 1000);
      return { days, hours, minutes, seconds };
    } else {
      // 距离目标日期
      const diff = target - now;
      if (diff <= 0) return { days: 0, hours: 0, minutes: 0, seconds: 0 };
      const days = Math.floor(diff / (1000 * 60 * 60 * 24));
      const hours = Math.floor((diff % (1000 * 60 * 60 * 24)) / (1000 * 60 * 60));
      const minutes = Math.floor((diff % (1000 * 60 * 60)) / (1000 * 60));
      const seconds = Math.floor((diff % (1000 * 60)) / 1000);
      return { days, hours, minutes, seconds };
    }
  }

  useEffect(() => {
    const timer = setInterval(() => {
      setTimeLeft(calculateTimeLeft());
    }, 1000);
    return () => clearInterval(timer);
  }, [targetDate]);

  return (
    <div className="countdown">
      {title && <h3 className="countdown-title">{title}</h3>}
      <div className="countdown-display">
        <div className="countdown-item">
          <span className="countdown-number">{timeLeft.days}</span>
          <span className="countdown-label">天</span>
        </div>
        <div className="countdown-item">
          <span className="countdown-number">{String(timeLeft.hours).padStart(2, '0')}</span>
          <span className="countdown-label">时</span>
        </div>
        <div className="countdown-item">
          <span className="countdown-number">{String(timeLeft.minutes).padStart(2, '0')}</span>
          <span className="countdown-label">分</span>
        </div>
        <div className="countdown-item">
          <span className="countdown-number">{String(timeLeft.seconds).padStart(2, '0')}</span>
          <span className="countdown-label">秒</span>
        </div>
      </div>
    </div>
  );
}
