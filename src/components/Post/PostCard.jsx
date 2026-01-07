import { useState, useEffect, useRef } from 'react';
import { useData } from '../../context/DataContext';
import * as api from '../../leancloud/api';
import CommentSection from '../Comment/CommentSection';
import './PostCard.css';

export default function PostCard({ post }) {
  const { likePost } = useData();
  const [likes, setLikes] = useState(post.likes || 0);
  const [imageIndex, setImageIndex] = useState(0);
  const [comments, setComments] = useState([]);
  const [loadingComments, setLoadingComments] = useState(true);
  const commentInputRef = useRef(null);

  // 从 localStorage 读取点赞状态
  const getLikedPosts = () => {
    try {
      return JSON.parse(localStorage.getItem('likedPosts') || '[]');
    } catch {
      return [];
    }
  };

  const [liked, setLiked] = useState(() => getLikedPosts().includes(post.id));

  // 加载评论
  useEffect(() => {
    async function loadComments() {
      try {
        const data = await api.getComments(post.id);
        setComments(data);
      } catch (error) {
        console.error('Failed to load comments:', error);
      } finally {
        setLoadingComments(false);
      }
    }
    loadComments();
  }, [post.id]);

  async function handleLike() {
    if (liked) return;

    try {
      setLikes(prev => prev + 1);
      setLiked(true);

      // 保存到 localStorage
      const likedPosts = getLikedPosts();
      likedPosts.push(post.id);
      localStorage.setItem('likedPosts', JSON.stringify(likedPosts));

      await likePost(post.id);
    } catch (error) {
      console.error('Error liking post:', error);
      // 回滚
      setLikes(prev => prev - 1);
      setLiked(false);

      // 从 localStorage 移除
      const likedPosts = getLikedPosts().filter(id => id !== post.id);
      localStorage.setItem('likedPosts', JSON.stringify(likedPosts));
    }
  }

  function handleCommentClick() {
    // 滚动到评论输入框
    commentInputRef.current?.scrollIntoView({ behavior: 'smooth', block: 'center' });
    commentInputRef.current?.focus();
  }

  function handleNewComment(newComment) {
    setComments(prev => [newComment, ...prev]);
  }

  function formatDate(date) {
    if (!date) return '';
    const d = date instanceof Date ? date : new Date(date);
    const now = new Date();
    const diff = now - d;

    if (diff < 60 * 60 * 1000) {
      const minutes = Math.floor(diff / (60 * 1000));
      return minutes <= 0 ? '刚刚' : `${minutes} 分钟前`;
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
      {/* 帖子头部 - 显示作者信息 */}
      <div className="post-header">
        <div className="post-avatar">
          {post.author?.avatar ? (
            <img src={post.author.avatar} alt={post.author.nickname} />
          ) : (
            <span>{post.author?.nickname?.[0] || '♥'}</span>
          )}
        </div>
        <div className="post-meta">
          <span className="post-author">{post.author?.nickname || '我们'}</span>
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
          onClick={handleCommentClick}
        >
          <span className="action-icon">💬</span>
          <span className="action-text">发评论</span>
        </button>
      </div>

      {/* 评论区 - 始终显示 */}
      <CommentSection
        postId={post.id}
        comments={comments}
        loading={loadingComments}
        onNewComment={handleNewComment}
        inputRef={commentInputRef}
      />
    </article>
  );
}
