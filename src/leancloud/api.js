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
    const results = await query.find();
    return results.map(obj => ({
      id: obj.id,
      content: obj.get('content'),
      images: obj.get('images') || [],
      likes: obj.get('likes') || 0,
      createdAt: obj.createdAt
    }));
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
  obj.set('content', data.content);
  obj.set('images', data.images || []);
  obj.set('likes', 0);
  return await obj.save();
}

export async function deletePost(id) {
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
