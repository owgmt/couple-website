import { useData } from '../context/DataContext';
import PostCard from '../components/Post';
import './Timeline.css';

export default function Timeline() {
  const { posts, loading } = useData();

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
      <div className="timeline-page">
        <h1 className="page-title">我们的动态</h1>
        <p className="page-subtitle">记录生活中的点点滴滴</p>

        {posts.length === 0 ? (
          <div className="empty-state">
            <div className="empty-icon">📝</div>
            <p>还没有发布动态</p>
            <p className="empty-hint">管理员可以在后台发布</p>
          </div>
        ) : (
          <div className="posts-list">
            {posts.map(post => (
              <PostCard key={post.id} post={post} />
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
