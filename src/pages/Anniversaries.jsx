import { useData } from '../context/DataContext';
import './Anniversaries.css';

export default function Anniversaries() {
  const { anniversaries, loading } = useData();

  function getDaysInfo(dateStr, type) {
    const now = new Date();
    const date = new Date(dateStr);

    if (type === 'yearly') {
      const thisYear = new Date(date);
      thisYear.setFullYear(now.getFullYear());

      const nextYear = new Date(date);
      nextYear.setFullYear(now.getFullYear() + 1);

      const target = thisYear > now ? thisYear : nextYear;
      const diff = Math.ceil((target - now) / (1000 * 60 * 60 * 24));

      return { days: diff, isPast: false, label: `还有 ${diff} 天` };
    } else {
      const diff = Math.ceil((date - now) / (1000 * 60 * 60 * 24));
      if (diff < 0) {
        return { days: Math.abs(diff), isPast: true, label: `${Math.abs(diff)} 天前` };
      }
      return { days: diff, isPast: false, label: `还有 ${diff} 天` };
    }
  }

  function formatDate(dateStr) {
    const date = new Date(dateStr);
    return date.toLocaleDateString('zh-CN', {
      year: 'numeric',
      month: 'long',
      day: 'numeric'
    });
  }

  if (loading) {
    return (
      <div className="container">
        <div className="loading">
          <div className="loading-spinner"></div>
        </div>
      </div>
    );
  }

  return (
    <div className="container">
      <div className="anniversaries-page">
        <h1 className="page-title">纪念日</h1>
        <p className="page-subtitle">那些值得铭记的日子</p>

        {anniversaries.length === 0 ? (
          <div className="empty-state">
            <p>还没有添加纪念日</p>
            <p className="empty-hint">管理员可以在后台添加</p>
          </div>
        ) : (
          <div className="anniversaries-list">
            {anniversaries.map((item, index) => {
              const daysInfo = getDaysInfo(item.date, item.type);
              return (
                <div
                  key={item.id}
                  className={`anniversary-card fade-in ${daysInfo.isPast ? 'past' : ''}`}
                  style={{ animationDelay: `${index * 0.1}s` }}
                >
                  <div className="anniversary-date">
                    <span className="date-day">{new Date(item.date).getDate()}</span>
                    <span className="date-month">
                      {new Date(item.date).toLocaleDateString('zh-CN', { month: 'short' })}
                    </span>
                  </div>
                  <div className="anniversary-info">
                    <h3 className="anniversary-name">{item.title}</h3>
                    <p className="anniversary-full-date">{formatDate(item.date)}</p>
                    {item.type === 'yearly' && (
                      <span className="anniversary-badge">每年</span>
                    )}
                  </div>
                  <div className="anniversary-countdown">
                    <span className={`days-number ${daysInfo.isPast ? 'past' : ''}`}>
                      {daysInfo.days}
                    </span>
                    <span className="days-label">
                      {daysInfo.isPast ? '天前' : '天后'}
                    </span>
                  </div>
                </div>
              );
            })}
          </div>
        )}
      </div>
    </div>
  );
}
