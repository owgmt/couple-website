import AV from './config';

// ============ 情侣信息 ============
export async function getCoupleInfo() {
  try {
    const query = new AV.Query('CoupleInfo');
    const results = await query.find();
    if (results.length > 0) {
      const obj = results[0];
      return {
        id: obj.id,
        name1: obj.get('name1'),
        name2: obj.get('name2'),
        avatar1: obj.get('avatar1'),
        avatar2: obj.get('avatar2'),
        togetherDate: obj.get('togetherDate')
      };
    }
    return null;
  } catch (error) {
    // Class 不存在时返回 null
    if (error.code === 101) {
      return null;
    }
    throw error;
  }
}

export async function saveCoupleInfo(data) {
  let obj;

  try {
    const query = new AV.Query('CoupleInfo');
    const results = await query.find();
    if (results.length > 0) {
      obj = results[0];
    }
  } catch (error) {
    // Class 不存在，忽略错误，下面会创建新对象
    if (error.code !== 101) {
      throw error;
    }
  }

  // 如果没有找到，创建新对象
  if (!obj) {
    const CoupleInfo = AV.Object.extend('CoupleInfo');
    obj = new CoupleInfo();
  }

  obj.set('name1', data.name1);
  obj.set('name2', data.name2);
  obj.set('avatar1', data.avatar1 || '');
  obj.set('avatar2', data.avatar2 || '');
  obj.set('togetherDate', data.togetherDate);

  return await obj.save();
}

// ============ 纪念日 ============
export async function getAnniversaries() {
  try {
    const query = new AV.Query('Anniversary');
    query.ascending('date');
    const results = await query.find();
    return results.map(obj => ({
      id: obj.id,
      title: obj.get('title'),
      date: obj.get('date'),
      type: obj.get('type'),
      createdAt: obj.createdAt
    }));
  } catch (error) {
    if (error.code === 101) {
      return [];
    }
    throw error;
  }
}

export async function createAnniversary(data) {
  const Anniversary = AV.Object.extend('Anniversary');
  const obj = new Anniversary();
  obj.set('title', data.title);
  obj.set('date', data.date);
  obj.set('type', data.type);
  return await obj.save();
}

export async function deleteAnniversary(id) {
  const obj = AV.Object.createWithoutData('Anniversary', id);
  return await obj.destroy();
}

// ============ 动态帖子 ============
export async function getPosts() {
  try {
    const query = new AV.Query('Post');
    query.descending('createdAt');
    query.include('author'); // 包含作者信息
    const results = await query.find();
    return results.map(obj => {
      const author = obj.get('author');
      return {
        id: obj.id,
        content: obj.get('content'),
        images: obj.get('images') || [],
        likes: obj.get('likes') || 0,
        createdAt: obj.createdAt,
        author: author ? {
          id: author.id,
          nickname: author.get('nickname') || '匿名',
          avatar: author.get('avatar') || ''
        } : null
      };
    });
  } catch (error) {
    if (error.code === 101) {
      return [];
    }
    throw error;
  }
}

export async function createPost(data) {
  const Post = AV.Object.extend('Post');
  const obj = new Post();
  const currentUser = AV.User.current();

  obj.set('content', data.content);
  obj.set('images', data.images || []);
  obj.set('likes', 0);
  if (currentUser) {
    obj.set('author', currentUser); // 关联作者
  }
  return await obj.save();
}

export async function deletePost(id) {
  // 先删除该帖子的所有评论
  try {
    const query = new AV.Query('Comment');
    query.equalTo('postId', id);
    const comments = await query.find();
    if (comments.length > 0) {
      await AV.Object.destroyAll(comments);
    }
  } catch (error) {
    console.error('删除评论失败:', error);
  }

  // 再删除帖子
  const obj = AV.Object.createWithoutData('Post', id);
  return await obj.destroy();
}

export async function likePost(id) {
  const obj = AV.Object.createWithoutData('Post', id);
  obj.increment('likes', 1);
  return await obj.save();
}

// ============ 评论 ============
export async function getComments(postId) {
  try {
    const query = new AV.Query('Comment');
    query.equalTo('postId', postId);
    query.descending('createdAt');
    const results = await query.find();
    return results.map(obj => ({
      id: obj.id,
      postId: obj.get('postId'),
      nickname: obj.get('nickname'),
      content: obj.get('content'),
      createdAt: obj.createdAt
    }));
  } catch (error) {
    if (error.code === 101) {
      return [];
    }
    throw error;
  }
}

export async function createComment(data) {
  const Comment = AV.Object.extend('Comment');
  const obj = new Comment();
  obj.set('postId', data.postId);
  obj.set('nickname', data.nickname);
  obj.set('content', data.content);
  return await obj.save();
}

export async function deleteComment(id) {
  const obj = AV.Object.createWithoutData('Comment', id);
  return await obj.destroy();
}

// 获取所有评论（用于后台管理）
export async function getAllComments() {
  try {
    const query = new AV.Query('Comment');
    query.descending('createdAt');
    query.limit(500);
    const results = await query.find();
    return results.map(obj => ({
      id: obj.id,
      postId: obj.get('postId'),
      nickname: obj.get('nickname'),
      content: obj.get('content'),
      createdAt: obj.createdAt
    }));
  } catch (error) {
    if (error.code === 101) {
      return [];
    }
    throw error;
  }
}

// ============ 文件上传 ============
export async function uploadFile(file) {
  const avFile = new AV.File(file.name, file);
  const savedFile = await avFile.save();
  return savedFile.url();
}

// ============ 管理员认证 ============
export async function login(username, password) {
  return await AV.User.logIn(username, password);
}

export async function register(username, password) {
  const user = new AV.User();
  user.setUsername(username);
  user.setPassword(password);
  return await user.signUp();
}

export async function logout() {
  return await AV.User.logOut();
}

export function getCurrentUser() {
  return AV.User.current();
}

// ============ 用户资料 ============
export async function getCurrentUserProfile() {
  const user = AV.User.current();
  if (!user) return null;

  // 确保获取完整属性
  await user.fetch();
  return {
    id: user.id,
    username: user.getUsername(),
    nickname: user.get('nickname') || user.getUsername(),
    avatar: user.get('avatar') || '',
    role: user.get('role') || ''
  };
}

export async function updateUserProfile({ nickname, avatar }) {
  const user = AV.User.current();
  if (!user) throw new Error('未登录');

  if (nickname !== undefined) user.set('nickname', nickname);
  if (avatar !== undefined) user.set('avatar', avatar);

  await user.save();

  // 同时更新 CoupleInfo 表，这样首页可以读取
  const role = user.get('role');
  if (role === 'person1' || role === 'person2') {
    try {
      let coupleInfo;
      const query = new AV.Query('CoupleInfo');
      const results = await query.find();

      if (results.length > 0) {
        coupleInfo = results[0];
      } else {
        const CoupleInfo = AV.Object.extend('CoupleInfo');
        coupleInfo = new CoupleInfo();
      }

      if (role === 'person1') {
        if (nickname !== undefined) coupleInfo.set('name1', nickname);
        if (avatar !== undefined) coupleInfo.set('avatar1', avatar);
      } else {
        if (nickname !== undefined) coupleInfo.set('name2', nickname);
        if (avatar !== undefined) coupleInfo.set('avatar2', avatar);
      }

      await coupleInfo.save();
    } catch (error) {
      console.error('同步到 CoupleInfo 失败:', error);
    }
  }

  return user;
}

// 获取两位情侣的公开信息
export async function getCoupleUsers() {
  try {
    const query = new AV.Query('_User');
    query.containedIn('role', ['person1', 'person2']);
    query.select(['nickname', 'avatar', 'role']); // 只选择需要的字段
    const users = await query.find();

    console.log('getCoupleUsers result:', users.length, 'users found');

    return users.map(u => ({
      id: u.id,
      nickname: u.get('nickname') || u.getUsername?.() || '',
      avatar: u.get('avatar') || '',
      role: u.get('role')
    }));
  } catch (error) {
    // 如果是权限问题，打印提示
    console.error('获取情侣用户失败:', error.code, error.message);
    if (error.code === 119 || error.code === 403) {
      console.warn('提示：需要在 LeanCloud 控制台设置 _User 表的 find 权限为"所有用户"');
    }
    return [];
  }
}
