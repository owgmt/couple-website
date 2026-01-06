import { createContext, useContext, useState, useEffect, useCallback } from 'react';
import * as api from '../leancloud/api';

const DataContext = createContext(null);

export function DataProvider({ children }) {
  const [coupleInfo, setCoupleInfo] = useState(null);
  const [anniversaries, setAnniversaries] = useState([]);
  const [posts, setPosts] = useState([]);
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);
  const [initialized, setInitialized] = useState(false);

  // 初始化加载数据
  useEffect(() => {
    if (initialized) return;

    async function init() {
      try {
        // 检查登录状态
        const currentUser = api.getCurrentUser();
        setUser(currentUser);

        // 并行加载所有数据
        const [couple, anns, postList] = await Promise.all([
          api.getCoupleInfo().catch(() => null),
          api.getAnniversaries().catch(() => []),
          api.getPosts().catch(() => [])
        ]);

        setCoupleInfo(couple || {
          name1: '他',
          name2: '她',
          togetherDate: new Date().toISOString().split('T')[0]
        });
        setAnniversaries(anns);
        setPosts(postList);
      } catch (error) {
        console.error('Failed to load data:', error);
      } finally {
        setLoading(false);
        setInitialized(true);
      }
    }

    init();
  }, [initialized]);

  // 刷新动态
  const refreshPosts = useCallback(async () => {
    try {
      const postList = await api.getPosts();
      setPosts(postList);
    } catch (error) {
      console.error('Failed to refresh posts:', error);
    }
  }, []);

  // 刷新纪念日
  const refreshAnniversaries = useCallback(async () => {
    try {
      const anns = await api.getAnniversaries();
      setAnniversaries(anns);
    } catch (error) {
      console.error('Failed to refresh anniversaries:', error);
    }
  }, []);

  // 刷新情侣信息
  const refreshCoupleInfo = useCallback(async () => {
    try {
      const couple = await api.getCoupleInfo();
      if (couple) {
        setCoupleInfo(couple);
      }
    } catch (error) {
      console.error('Failed to refresh couple info:', error);
    }
  }, []);

  // 登录
  const login = useCallback(async (username, password) => {
    const loggedUser = await api.login(username, password);
    setUser(loggedUser);
    return loggedUser;
  }, []);

  // 登出
  const logout = useCallback(async () => {
    await api.logout();
    setUser(null);
  }, []);

  // 点赞（本地乐观更新）
  const likePost = useCallback(async (postId) => {
    // 乐观更新
    setPosts(prev => prev.map(p =>
      p.id === postId ? { ...p, likes: p.likes + 1 } : p
    ));

    try {
      await api.likePost(postId);
    } catch (error) {
      // 回滚
      setPosts(prev => prev.map(p =>
        p.id === postId ? { ...p, likes: p.likes - 1 } : p
      ));
      throw error;
    }
  }, []);

  const value = {
    coupleInfo,
    anniversaries,
    posts,
    user,
    loading,
    refreshPosts,
    refreshAnniversaries,
    refreshCoupleInfo,
    login,
    logout,
    likePost,
    setCoupleInfo,
    setAnniversaries,
    setPosts
  };

  return (
    <DataContext.Provider value={value}>
      {children}
    </DataContext.Provider>
  );
}

export function useData() {
  const context = useContext(DataContext);
  if (!context) {
    throw new Error('useData must be used within a DataProvider');
  }
  return context;
}
