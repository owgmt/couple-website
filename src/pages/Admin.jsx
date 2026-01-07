import { useState, useEffect } from 'react';
import { useData } from '../context/DataContext';
import * as api from '../leancloud/api';
import './Admin.css';

export default function Admin() {
  const { user, userProfile, login, logout, updateProfile, coupleInfo, anniversaries, posts, refreshPosts, refreshAnniversaries, refreshCoupleInfo } = useData();
  const [activeTab, setActiveTab] = useState('posts');

  // 登录/注册表单
  const [isRegisterMode, setIsRegisterMode] = useState(false);
  const [username, setUsername] = useState('');
  const [password, setPassword] = useState('');
  const [regNickname, setRegNickname] = useState('');
  const [regRole, setRegRole] = useState('person1');
  const [loginError, setLoginError] = useState('');
  const [loginLoading, setLoginLoading] = useState(false);

  // 动态表单
  const [postContent, setPostContent] = useState('');
  const [postImages, setPostImages] = useState([]);
  const [uploading, setUploading] = useState(false);
  const [posting, setPosting] = useState(false);

  // 纪念日表单
  const [annTitle, setAnnTitle] = useState('');
  const [annDate, setAnnDate] = useState('');
  const [annType, setAnnType] = useState('yearly');
  const [annPosting, setAnnPosting] = useState(false);

  // 情侣信息
  const [editCoupleInfo, setEditCoupleInfo] = useState({
    name1: coupleInfo?.name1 || '',
    name2: coupleInfo?.name2 || '',
    togetherDate: coupleInfo?.togetherDate || ''
  });
  const [savingCouple, setSavingCouple] = useState(false);

  // 个人资料
  const [editProfile, setEditProfile] = useState({
    nickname: '',
    avatar: ''
  });
  const [savingProfile, setSavingProfile] = useState(false);
  const [uploadingAvatar, setUploadingAvatar] = useState(false);

  // 评论管理
  const [allComments, setAllComments] = useState([]);
  const [loadingComments, setLoadingComments] = useState(false);

  // 加载所有评论
  async function loadAllComments() {
    setLoadingComments(true);
    try {
      const comments = await api.getAllComments();
      setAllComments(comments);
    } catch (error) {
      console.error('加载评论失败:', error);
    } finally {
      setLoadingComments(false);
    }
  }

  // 切换到评论管理时加载评论
  useEffect(() => {
    if (activeTab === 'comments' && user) {
      loadAllComments();
    }
  }, [activeTab, user]);

  // 删除评论
  async function handleDeleteComment(id) {
    if (!confirm('确定要删除这条评论吗？')) return;
    try {
      await api.deleteComment(id);
      setAllComments(prev => prev.filter(c => c.id !== id));
    } catch (error) {
      console.error('删除评论失败:', error);
      alert('删除失败');
    }
  }

  // 格式化时间
  function formatCommentTime(date) {
    if (!date) return '';
    const d = date instanceof Date ? date : new Date(date);
    return d.toLocaleString('zh-CN', {
      year: 'numeric',
      month: '2-digit',
      day: '2-digit',
      hour: '2-digit',
      minute: '2-digit'
    });
  }

  // 初始化个人资料表单
  useEffect(() => {
    if (userProfile) {
      setEditProfile({
        nickname: userProfile.nickname || '',
        avatar: userProfile.avatar || ''
      });
    }
  }, [userProfile]);

  // 更新编辑表单
  useState(() => {
    if (coupleInfo) {
      setEditCoupleInfo({
        name1: coupleInfo.name1 || '',
        name2: coupleInfo.name2 || '',
        togetherDate: coupleInfo.togetherDate || ''
      });
    }
  }, [coupleInfo]);

  async function handleLogin(e) {
    e.preventDefault();
    setLoginError('');
    setLoginLoading(true);
    try {
      await login(username, password);
    } catch (error) {
      setLoginError('登录失败：用户名或密码错误');
    } finally {
      setLoginLoading(false);
    }
  }

  async function handleRegister(e) {
    e.preventDefault();
    setLoginError('');

    if (!regNickname.trim()) {
      setLoginError('请输入昵称');
      return;
    }

    setLoginLoading(true);
    try {
      // 注册新用户
      const newUser = await api.register(username, password);
      // 设置用户资料
      newUser.set('nickname', regNickname.trim());
      newUser.set('role', regRole);
      await newUser.save();
      // 注册成功后自动登录
      await login(username, password);
    } catch (error) {
      if (error.code === 202) {
        setLoginError('用户名已存在，请换一个');
      } else {
        setLoginError('注册失败：' + error.message);
      }
    } finally {
      setLoginLoading(false);
    }
  }

  async function handleLogout() {
    await logout();
  }

  // 上传图片
  async function handleImageUpload(e) {
    const files = Array.from(e.target.files);
    if (files.length === 0) return;

    setUploading(true);
    try {
      const uploadPromises = files.map(file => api.uploadFile(file));
      const urls = await Promise.all(uploadPromises);
      setPostImages(prev => [...prev, ...urls]);
    } catch (error) {
      console.error('Error uploading images:', error);
      alert('图片上传失败');
    } finally {
      setUploading(false);
    }
  }

  // 发布动态
  async function handlePostSubmit(e) {
    e.preventDefault();
    if (!postContent.trim()) return;

    setPosting(true);
    try {
      await api.createPost({
        content: postContent.trim(),
        images: postImages
      });
      setPostContent('');
      setPostImages([]);
      await refreshPosts();
      alert('发布成功！');
    } catch (error) {
      console.error('Error creating post:', error);
      alert('发布失败：' + error.message);
    } finally {
      setPosting(false);
    }
  }

  // 删除动态
  async function handleDeletePost(id) {
    if (!confirm('确定要删除这条动态吗？')) return;
    try {
      await api.deletePost(id);
      await refreshPosts();
    } catch (error) {
      console.error('Error deleting post:', error);
      alert('删除失败');
    }
  }

  // 添加纪念日
  async function handleAnnSubmit(e) {
    e.preventDefault();
    if (!annTitle.trim() || !annDate) return;

    setAnnPosting(true);
    try {
      await api.createAnniversary({
        title: annTitle.trim(),
        date: annDate,
        type: annType
      });
      setAnnTitle('');
      setAnnDate('');
      await refreshAnniversaries();
      alert('添加成功！');
    } catch (error) {
      console.error('Error creating anniversary:', error);
      alert('添加失败：' + error.message);
    } finally {
      setAnnPosting(false);
    }
  }

  // 删除纪念日
  async function handleDeleteAnn(id) {
    if (!confirm('确定要删除这个纪念日吗？')) return;
    try {
      await api.deleteAnniversary(id);
      await refreshAnniversaries();
    } catch (error) {
      console.error('Error deleting anniversary:', error);
      alert('删除失败');
    }
  }

  // 保存情侣信息
  async function handleCoupleSubmit(e) {
    e.preventDefault();
    setSavingCouple(true);
    try {
      await api.saveCoupleInfo(editCoupleInfo);
      await refreshCoupleInfo();
      alert('保存成功！');
    } catch (error) {
      console.error('Error saving couple info:', error);
      alert('保存失败：' + error.message);
    } finally {
      setSavingCouple(false);
    }
  }

  // 上传头像
  async function handleAvatarUpload(e) {
    const file = e.target.files?.[0];
    if (!file) return;

    // 限制文件大小 2MB
    if (file.size > 2 * 1024 * 1024) {
      alert('头像文件不能超过 2MB');
      return;
    }

    setUploadingAvatar(true);
    try {
      const url = await api.uploadFile(file);
      setEditProfile(prev => ({ ...prev, avatar: url }));
    } catch (error) {
      console.error('Error uploading avatar:', error);
      alert('头像上传失败');
    } finally {
      setUploadingAvatar(false);
    }
  }

  // 保存个人资料
  async function handleProfileSubmit(e) {
    e.preventDefault();
    if (!editProfile.nickname.trim()) {
      alert('昵称不能为空');
      return;
    }

    setSavingProfile(true);
    try {
      await updateProfile({
        nickname: editProfile.nickname.trim(),
        avatar: editProfile.avatar
      });
      alert('保存成功！');
    } catch (error) {
      console.error('Error saving profile:', error);
      alert('保存失败：' + error.message);
    } finally {
      setSavingProfile(false);
    }
  }

  // 未登录显示登录/注册表单
  if (!user) {
    return (
      <div className="container">
        <div className="admin-login">
          <h1>{isRegisterMode ? '注册账户' : '管理员登录'}</h1>

          {isRegisterMode ? (
            // 注册表单
            <form onSubmit={handleRegister} className="login-form">
              <input
                type="text"
                className="input"
                placeholder="用户名（用于登录）"
                value={username}
                onChange={e => setUsername(e.target.value)}
                required
              />
              <input
                type="password"
                className="input"
                placeholder="密码"
                value={password}
                onChange={e => setPassword(e.target.value)}
                required
              />
              <input
                type="text"
                className="input"
                placeholder="你的昵称（显示在网站上）"
                value={regNickname}
                onChange={e => setRegNickname(e.target.value)}
                required
              />
              <div className="role-select">
                <label className="role-label">我是：</label>
                <div className="role-options">
                  <label className={`role-option ${regRole === 'person1' ? 'selected' : ''}`}>
                    <input
                      type="radio"
                      name="role"
                      value="person1"
                      checked={regRole === 'person1'}
                      onChange={e => setRegRole(e.target.value)}
                    />
                    <span>TA（左边）</span>
                  </label>
                  <label className={`role-option ${regRole === 'person2' ? 'selected' : ''}`}>
                    <input
                      type="radio"
                      name="role"
                      value="person2"
                      checked={regRole === 'person2'}
                      onChange={e => setRegRole(e.target.value)}
                    />
                    <span>我（右边）</span>
                  </label>
                </div>
              </div>
              {loginError && <p className="error-text">{loginError}</p>}
              <button type="submit" className="btn btn-primary" disabled={loginLoading}>
                {loginLoading ? '注册中...' : '注册'}
              </button>
              <p className="switch-mode">
                已有账户？
                <button type="button" className="link-btn" onClick={() => {
                  setIsRegisterMode(false);
                  setLoginError('');
                }}>
                  去登录
                </button>
              </p>
            </form>
          ) : (
            // 登录表单
            <form onSubmit={handleLogin} className="login-form">
              <input
                type="text"
                className="input"
                placeholder="用户名"
                value={username}
                onChange={e => setUsername(e.target.value)}
                required
              />
              <input
                type="password"
                className="input"
                placeholder="密码"
                value={password}
                onChange={e => setPassword(e.target.value)}
                required
              />
              {loginError && <p className="error-text">{loginError}</p>}
              <button type="submit" className="btn btn-primary" disabled={loginLoading}>
                {loginLoading ? '登录中...' : '登录'}
              </button>
              <p className="switch-mode">
                还没有账户？
                <button type="button" className="link-btn" onClick={() => {
                  setIsRegisterMode(true);
                  setLoginError('');
                }}>
                  去注册
                </button>
              </p>
            </form>
          )}
        </div>
      </div>
    );
  }

  return (
    <div className="container">
      <div className="admin-page">
        <div className="admin-header">
          <div className="admin-user-info">
            <div className="admin-avatar">
              {userProfile?.avatar ? (
                <img src={userProfile.avatar} alt={userProfile.nickname} />
              ) : (
                <span>{userProfile?.nickname?.[0] || '?'}</span>
              )}
            </div>
            <div className="admin-user-text">
              <h1>管理后台</h1>
              <span className="admin-username">{userProfile?.nickname || user?.getUsername?.() || '管理员'}</span>
            </div>
          </div>
          <button onClick={handleLogout} className="btn btn-secondary">退出登录</button>
        </div>

        {/* 标签页 */}
        <div className="admin-tabs">
          <button
            className={`tab ${activeTab === 'posts' ? 'active' : ''}`}
            onClick={() => setActiveTab('posts')}
          >
            动态管理
          </button>
          <button
            className={`tab ${activeTab === 'anniversaries' ? 'active' : ''}`}
            onClick={() => setActiveTab('anniversaries')}
          >
            纪念日管理
          </button>
          <button
            className={`tab ${activeTab === 'profile' ? 'active' : ''}`}
            onClick={() => setActiveTab('profile')}
          >
            个人设置
          </button>
          <button
            className={`tab ${activeTab === 'settings' ? 'active' : ''}`}
            onClick={() => setActiveTab('settings')}
          >
            基本设置
          </button>
          <button
            className={`tab ${activeTab === 'comments' ? 'active' : ''}`}
            onClick={() => setActiveTab('comments')}
          >
            评论管理
          </button>
        </div>

        {/* 动态管理 */}
        {activeTab === 'posts' && (
          <div className="admin-section">
            <h2>发布新动态</h2>
            <form onSubmit={handlePostSubmit} className="post-form">
              <textarea
                className="input textarea"
                placeholder="写点什么..."
                value={postContent}
                onChange={e => setPostContent(e.target.value)}
                rows={4}
              />
              <div className="image-upload">
                <input
                  type="file"
                  accept="image/*"
                  multiple
                  onChange={handleImageUpload}
                  id="image-input"
                  style={{ display: 'none' }}
                />
                <label htmlFor="image-input" className="btn btn-secondary">
                  {uploading ? '上传中...' : '添加图片'}
                </label>
                {postImages.length > 0 && (
                  <div className="preview-images">
                    {postImages.map((url, i) => (
                      <div key={i} className="preview-item">
                        <img src={url} alt="" />
                        <button
                          type="button"
                          className="remove-btn"
                          onClick={() => setPostImages(prev => prev.filter((_, idx) => idx !== i))}
                        >
                          ×
                        </button>
                      </div>
                    ))}
                  </div>
                )}
              </div>
              <button type="submit" className="btn btn-primary" disabled={!postContent.trim() || posting}>
                {posting ? '发布中...' : '发布'}
              </button>
            </form>

            <h2>已发布动态</h2>
            <div className="items-list">
              {posts.length === 0 ? (
                <p className="empty-hint">暂无动态</p>
              ) : posts.map(post => (
                <div key={post.id} className="list-item">
                  <div className="item-content">
                    <p>{post.content?.substring(0, 100)}{post.content?.length > 100 ? '...' : ''}</p>
                    {post.images?.length > 0 && (
                      <span className="image-count">{post.images.length} 张图片</span>
                    )}
                  </div>
                  <button
                    className="btn btn-danger"
                    onClick={() => handleDeletePost(post.id)}
                  >
                    删除
                  </button>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* 纪念日管理 */}
        {activeTab === 'anniversaries' && (
          <div className="admin-section">
            <h2>添加纪念日</h2>
            <form onSubmit={handleAnnSubmit} className="ann-form">
              <input
                type="text"
                className="input"
                placeholder="纪念日名称"
                value={annTitle}
                onChange={e => setAnnTitle(e.target.value)}
                required
              />
              <input
                type="date"
                className="input"
                value={annDate}
                onChange={e => setAnnDate(e.target.value)}
                required
              />
              <select
                className="input"
                value={annType}
                onChange={e => setAnnType(e.target.value)}
              >
                <option value="yearly">每年重复</option>
                <option value="once">仅一次</option>
              </select>
              <button type="submit" className="btn btn-primary" disabled={annPosting}>
                {annPosting ? '添加中...' : '添加'}
              </button>
            </form>

            <h2>纪念日列表</h2>
            <div className="items-list">
              {anniversaries.length === 0 ? (
                <p className="empty-hint">暂无纪念日</p>
              ) : anniversaries.map(ann => (
                <div key={ann.id} className="list-item">
                  <div className="item-content">
                    <strong>{ann.title}</strong>
                    <span>{ann.date}</span>
                    <span className="badge">{ann.type === 'yearly' ? '每年' : '一次'}</span>
                  </div>
                  <button
                    className="btn btn-danger"
                    onClick={() => handleDeleteAnn(ann.id)}
                  >
                    删除
                  </button>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* 个人设置 */}
        {activeTab === 'profile' && (
          <div className="admin-section">
            <h2>个人信息</h2>
            <form onSubmit={handleProfileSubmit} className="profile-form">
              <div className="avatar-upload-section">
                <div className="current-avatar-large">
                  {editProfile.avatar ? (
                    <img src={editProfile.avatar} alt="头像" />
                  ) : (
                    <span>{editProfile.nickname?.[0] || '?'}</span>
                  )}
                </div>
                <div className="avatar-upload-controls">
                  <input
                    type="file"
                    accept="image/*"
                    onChange={handleAvatarUpload}
                    id="avatar-input"
                    style={{ display: 'none' }}
                  />
                  <label htmlFor="avatar-input" className="btn btn-secondary">
                    {uploadingAvatar ? '上传中...' : '更换头像'}
                  </label>
                  <p className="hint">建议上传正方形图片，最大 2MB</p>
                </div>
              </div>

              <div className="form-group">
                <label>我的昵称</label>
                <input
                  type="text"
                  className="input"
                  value={editProfile.nickname}
                  onChange={e => setEditProfile(prev => ({ ...prev, nickname: e.target.value }))}
                  placeholder="输入你的昵称"
                  required
                />
              </div>

              <button type="submit" className="btn btn-primary" disabled={savingProfile}>
                {savingProfile ? '保存中...' : '保存个人信息'}
              </button>
            </form>
          </div>
        )}

        {/* 基本设置 */}
        {activeTab === 'settings' && (
          <div className="admin-section">
            <h2>在一起的日期</h2>
            <form onSubmit={handleCoupleSubmit} className="settings-form">
              <div className="form-group">
                <label>我们在一起的日期</label>
                <input
                  type="date"
                  className="input"
                  value={editCoupleInfo.togetherDate}
                  onChange={e => setEditCoupleInfo(prev => ({ ...prev, togetherDate: e.target.value }))}
                />
              </div>
              <button type="submit" className="btn btn-primary" disabled={savingCouple}>
                {savingCouple ? '保存中...' : '保存设置'}
              </button>
            </form>
          </div>
        )}

        {/* 评论管理 */}
        {activeTab === 'comments' && (
          <div className="admin-section">
            <h2>所有评论</h2>
            <div className="items-list">
              {loadingComments ? (
                <p className="empty-hint">加载中...</p>
              ) : allComments.length === 0 ? (
                <p className="empty-hint">暂无评论</p>
              ) : allComments.map(comment => (
                <div key={comment.id} className="list-item comment-item-admin">
                  <div className="item-content">
                    <div className="comment-meta">
                      <strong className="comment-author">{comment.nickname}</strong>
                      <span className="comment-date">{formatCommentTime(comment.createdAt)}</span>
                    </div>
                    <p className="comment-text-admin">{comment.content}</p>
                  </div>
                  <button
                    className="btn btn-danger"
                    onClick={() => handleDeleteComment(comment.id)}
                  >
                    删除
                  </button>
                </div>
              ))}
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
