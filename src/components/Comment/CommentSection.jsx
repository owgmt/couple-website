import { useState, useEffect } from 'react';
import * as api from '../../leancloud/api';
import './CommentSection.css';

export default function CommentSection({ postId }) {
  const [comments, setComments] = useState([]);
  const [loading, setLoading] = useState(true);
  const [nickname, setNickname] = useState('');
  const [content, setContent] = useState('');
  const [submitting, setSubmitting] = useState(false);

  useEffect(() => {
    fetchComments();
  }, [postId]);

  async function fetchComments() {
    try {
      const data = await api.getComments(postId);
      setComments(data);
    } catch (error) {
      console.error('Error fetching comments:', error);
    } finally {
      setLoading(false);
    }
  }

  async function handleSubmit(e) {
    e.preventDefault();
    if (!nickname.trim() || !content.trim()) return;

    setSubmitting(true);
    try {
      const result = await api.createComment({
        postId,
        nickname: nickname.trim(),
        content: content.trim()
      });

      // 添加到本地列表
      setComments(prev => [{
        id: result.id,
        postId,
        nickname: nickname.trim(),
        content: content.trim(),
        createdAt: new Date()
      }, ...prev]);

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

  return (
    <div className="comment-section">
      {/* 评论表单 */}
      <form className="comment-form" onSubmit={handleSubmit}>
        <input
          type="text"
          className="input comment-nickname"
          placeholder="你的昵称"
          value={nickname}
          onChange={e => setNickname(e.target.value)}
          maxLength={20}
          required
        />
        <div className="comment-input-row">
          <input
            type="text"
            className="input comment-content"
            placeholder="写下你的评论..."
            value={content}
            onChange={e => setContent(e.target.value)}
            maxLength={500}
            required
          />
          <button
            type="submit"
            className="btn btn-primary comment-submit"
            disabled={submitting || !nickname.trim() || !content.trim()}
          >
            {submitting ? '...' : '发送'}
          </button>
        </div>
      </form>

      {/* 评论列表 */}
      <div className="comments-list">
        {loading ? (
          <div className="comments-loading">加载中...</div>
        ) : comments.length === 0 ? (
          <div className="comments-empty">还没有评论，来说点什么吧~</div>
        ) : (
          comments.map(comment => (
            <div key={comment.id} className="comment-item">
              <div className="comment-avatar">
                {comment.nickname[0]}
              </div>
              <div className="comment-body">
                <div className="comment-header">
                  <span className="comment-name">{comment.nickname}</span>
                  <span className="comment-time">{formatTime(comment.createdAt)}</span>
                </div>
                <p className="comment-text">{comment.content}</p>
              </div>
            </div>
          ))
        )}
      </div>
    </div>
  );
}
