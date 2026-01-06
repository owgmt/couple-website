import AV from 'leancloud-storage';

// LeanCloud 初始化
AV.init({
  appId: import.meta.env.VITE_LEANCLOUD_APP_ID,
  appKey: import.meta.env.VITE_LEANCLOUD_APP_KEY,
  serverURL: import.meta.env.VITE_LEANCLOUD_SERVER_URL
});

export default AV;
