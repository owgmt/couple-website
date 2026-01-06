import { useData } from '../context/DataContext';
import CountDown from '../components/CountDown';
import './Home.css';

export default function Home() {
  const { coupleInfo, anniversaries, loading } = useData();

  if (loading) {
    return (
      <div className="container">
        <div className="loading">
          <div className="loading-spinner"></div>
        </div>
      </div>
    );
  }

  // 计算下一个纪念日
  const now = new Date();
  let nextAnniversary = null;
  let minDiff = Infinity;

  anniversaries.forEach(item => {
    let targetDate = new Date(item.date);

    if (item.type === 'yearly') {
      targetDate.setFullYear(now.getFullYear());
      if (targetDate < now) {
        targetDate.setFullYear(now.getFullYear() + 1);
      }
    }

    const diff = targetDate - now;
    if (diff > 0 && diff < minDiff) {
      minDiff = diff;
      nextAnniversary = { ...item, nextDate: targetDate.toISOString() };
    }
  });

  return (
    <div className="container">
      <div className="home">
        {/* 情侣头像和名字 */}
        <div className="couple-header fade-in">
          <div className="couple-avatars">
            <div className="avatar">
              {coupleInfo?.avatar1 ? (
                <img src={coupleInfo.avatar1} alt={coupleInfo.name1} />
              ) : (
                <span>{coupleInfo?.name1?.[0] || '他'}</span>
              )}
            </div>
            <div className="heart-connector">♥</div>
            <div className="avatar">
              {coupleInfo?.avatar2 ? (
                <img src={coupleInfo.avatar2} alt={coupleInfo.name2} />
              ) : (
                <span>{coupleInfo?.name2?.[0] || '她'}</span>
              )}
            </div>
          </div>
          <h1 className="couple-names">
            {coupleInfo?.name1 || '他'} & {coupleInfo?.name2 || '她'}
          </h1>
        </div>

        {/* 在一起的天数 */}
        <div className="card main-countdown fade-in">
          <p className="together-text">我们已经在一起</p>
          <CountDown
            targetDate={coupleInfo?.togetherDate || new Date().toISOString()}
            type="since"
          />
        </div>

        {/* 下一个纪念日 */}
        {nextAnniversary && (
          <div className="card next-anniversary fade-in">
            <h3 className="anniversary-title">
              距离 <span className="highlight">{nextAnniversary.title}</span> 还有
            </h3>
            <CountDown targetDate={nextAnniversary.nextDate} />
          </div>
        )}
      </div>
    </div>
  );
}
