import { useState } from 'react';
import { useData } from '../../context/DataContext';
import CommentSection from '../Comment/CommentSection';
import './PostCard.css';

export default function PostCard({ post }) {
  const { likePost } = useData();
  const [likes, setLikes] = useState(post.likes || 0);
  const [liked, setLiked] = useState(false);
  const [showComments, setShowComments] = useState(false);
  const [imageIndex, setImageIndex] = useState(0);

  async function handleLike() {
    if (liked) return;

    try {
      setLikes(prev => prev + 1);
      setLiked(true);
      await likePost(post.id);
    } catch (error) {
      console.error('Error liking post:', error);
      setLikes(prev => prev - 1);
      setLiked(false);
    }
  }

  function formatDate(date) {
    if (!date) return '';
    const d = date instanceof Date ? date : new Date(date);
    const now = new Date();
    const diff = now - d;

    if (diff < 60 * 60 * 1000) {
      const minutes = Math.floor(diff / (60 * 1000));
      return `${minutes} 分钟前`;
    }
    if (diff < 24 * 60 * 60 * 1000) {
      const hours = Math.floor(diff / (60 * 60 * 1000));
      return `${hours} 小时前`;
    }
    if (diff < 7 * 24 * 60 * 60 * 1000) {
      const days = Math.floor(diff / (24 * 60 * 60 * 1000));
      return `${days} 天前`;
    }
    return d.toLocaleDateString('zh-CN', {
      year: 'numeric',
      month: 'short',
      day: 'numeric'
    });
  }

  const images = post.images || [];

  return (
    <article className="post-card fade-in">
      {/* 帖子头部 */}
      <div className="post-header">
        <div className="post-avatar">
          <span>♥</span>
        </div>
        <div className="post-meta">
          <span className="post-author">我们的日常</span>
          <span className="post-time">{formatDate(post.createdAt)}</span>
        </div>
      </div>

      {/* 帖子内容 */}
      <div className="post-content">
        <p>{post.content}</p>
      </div>

      {/* 图片展示 */}
      {images.length > 0 && (
        <div className="post-images">
          <div className="image-container">
            <img
              src={images[imageIndex]}
              alt={`图片 ${imageIndex + 1}`}
              className="post-image"
            />
            {images.length > 1 && (
              <>
                <button
                  className="image-nav prev"
                  onClick={() => setImageIndex(i => (i - 1 + images.length) % images.length)}
                  disabled={imageIndex === 0}
                >
                  ‹
                </button>
                <button
                  className="image-nav next"
                  onClick={() => setImageIndex(i => (i + 1) % images.length)}
                  disabled={imageIndex === images.length - 1}
                >
                  ›
                </button>
                <div className="image-dots">
                  {images.map((_, i) => (
                    <span
                      key={i}
                      className={`dot ${i === imageIndex ? 'active' : ''}`}
                      onClick={() => setImageIndex(i)}
                    />
                  ))}
                </div>
              </>
            )}
          </div>
        </div>
      )}

      {/* 互动区域 */}
      <div className="post-actions">
        <button
          className={`action-btn like-btn ${liked ? 'liked' : ''}`}
          onClick={handleLike}
        >
          <span className="action-icon">{liked ? '♥' : '♡'}</span>
          <span className="action-count">{likes}</span>
        </button>
        <button
          className="action-btn comment-btn"
          onClick={() => setShowComments(!showComments)}
        >
          <span className="action-icon">💬</span>
          <span className="action-text">评论</span>
        </button>
      </div>

      {/* 评论区 */}
      {showComments && <CommentSection postId={post.id} />}
    </article>
  );
}
