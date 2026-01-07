import { useState, useEffect } from 'react';
import * as api from '../../leancloud/api';
import './CommentSection.css';

const DISPLAY_LIMIT = 3;

export default function CommentSection({ postId, comments: externalComments, loading: externalLoading, onNewComment, inputRef }) {
  // 使用外部传入的评论数据，或内部管理
  const [internalComments, setInternalComments] = useState([]);
  const [internalLoading, setInternalLoading] = useState(true);

  const comments = externalComments !== undefined ? externalComments : internalComments;
  const loading = externalLoading !== undefined ? externalLoading : internalLoading;

  // 从 localStorage 读取上次使用的昵称
  const [nickname, setNickname] = useState(() => {
    return localStorage.getItem('commentNickname') || '';
  });
  const [content, setContent] = useState('');
  const [submitting, setSubmitting] = useState(false);
  const [showAll, setShowAll] = useState(false);

  // 如果没有外部评论数据，内部加载
  useEffect(() => {
    if (externalComments === undefined) {
      fetchComments();
    }
  }, [postId, externalComments]);

  async function fetchComments() {
    try {
      const data = await api.getComments(postId);
      setInternalComments(data);
    } catch (error) {
      console.error('Error fetching comments:', error);
    } finally {
      setInternalLoading(false);
    }
  }

  async function handleSubmit(e) {
    e.preventDefault();
    if (!nickname.trim() || !content.trim()) return;

    setSubmitting(true);
    try {
      // 保存昵称到 localStorage
      localStorage.setItem('commentNickname', nickname.trim());

      const result = await api.createComment({
        postId,
        nickname: nickname.trim(),
        content: content.trim()
      });

      const newComment = {
        id: result.id,
        postId,
        nickname: nickname.trim(),
        content: content.trim(),
        createdAt: new Date()
      };

      // 如果有外部回调，通知父组件
      if (onNewComment) {
        onNewComment(newComment);
      } else {
        // 否则更新内部状态
        setInternalComments(prev => [newComment, ...prev]);
      }

      setContent('');
    } catch (error) {
      console.error('Error adding comment:', error);
      alert('评论失败，请重试');
    } finally {
      setSubmitting(false);
    }
  }

  function formatTime(date) {
    if (!date) return '';
    const d = date instanceof Date ? date : new Date(date);
    const now = new Date();
    const diff = now - d;

    if (diff < 60 * 1000) return '刚刚';
    if (diff < 60 * 60 * 1000) return `${Math.floor(diff / (60 * 1000))} 分钟前`;
    if (diff < 24 * 60 * 60 * 1000) return `${Math.floor(diff / (60 * 60 * 1000))} 小时前`;
    return d.toLocaleDateString('zh-CN', { month: 'short', day: 'numeric' });
  }

  const displayedComments = showAll ? comments : comments.slice(0, DISPLAY_LIMIT);
  const hasMore = comments.length > DISPLAY_LIMIT;

  return (
    <div className="comment-section">
      {/* 评论列表 - 始终显示 */}
      <div className="comments-list">
        {loading ? (
          <div className="comments-loading">加载评论中...</div>
        ) : comments.length === 0 ? (
          <div className="comments-empty">还没有评论，来说点什么吧~</div>
        ) : (
          <>
            {displayedComments.map(comment => (
              <div key={comment.id} className="comment-item">
                <div className="comment-avatar">
                  {comment.nickname?.[0] || '?'}
                </div>
                <div className="comment-body">
                  <div className="comment-header">
                    <span className="comment-name">{comment.nickname}</span>
                    <span className="comment-time">{formatTime(comment.createdAt)}</span>
                  </div>
                  <p className="comment-text">{comment.content}</p>
                </div>
              </div>
            ))}

            {/* 查看更多按钮 */}
            {hasMore && !showAll && (
              <button className="show-more-btn" onClick={() => setShowAll(true)}>
                查看全部 {comments.length} 条评论
              </button>
            )}
          </>
        )}
      </div>

      {/* 评论表单 - 内联样式 */}
      <form className="comment-form-inline" onSubmit={handleSubmit}>
        <input
          type="text"
          className="input comment-nickname-inline"
          placeholder="昵称"
          value={nickname}
          onChange={e => setNickname(e.target.value)}
          maxLength={20}
          required
        />
        <input
          ref={inputRef}
          type="text"
          className="input comment-content-inline"
          placeholder="写下你的评论..."
          value={content}
          onChange={e => setContent(e.target.value)}
          maxLength={500}
          required
        />
        <button
          type="submit"
          className="btn btn-primary comment-submit-inline"
          disabled={submitting || !nickname.trim() || !content.trim()}
        >
          {submitting ? '...' : '发送'}
        </button>
      </form>
    </div>
  );
}
