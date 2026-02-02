import { db, storage, auth } from './firebase';
import { 
  collection, 
  addDoc, 
  getDoc, 
  doc, 
  updateDoc, 
  query, 
  where, 
  orderBy, 
  limit, 
  getDocs,
  increment,
  getCountFromServer,
  Timestamp,
  deleteDoc
} from 'firebase/firestore';
import { ref, uploadBytes, getDownloadURL } from 'firebase/storage';

// 7. 老照片修复 (Old Photo Restoration)
export interface PhotoRestoration {
  id: string;
  userId: string;
  originalUrl: string;
  fixedUrl: string;
  description: string;
  likes: number;
  isLikes: boolean;
  status: 'processing' | 'completed' | 'failed';
  createdAt: string; 
}

const COLLECTION_NAME = 'photo_restorations';

/**
 * 7.2 上传并修复 (Upload & Restore)
 * 上传图片到存储并在 Firestore 中创建记录。
 * /restorePhoto
 */
export const restorePhoto = async (fileUrl: string, description?: string): Promise<PhotoRestoration> => {
  try {
    // 1. 上传文件到 Firebase Storage
    // 路径: photo_restorations/{userId}/{timestamp}_{filename}
    // 注意: 如果文件是 File 对象则使用文件名，如果是 Blob 则生成通用名称
    // const timestamp = Date.now();
    // const fileName = (file instanceof File) ? file.name : `image_${timestamp}.jpg`;
    // const storagePath = `photo_restorations/${userId}/${timestamp}_${fileName}`;
    
    // const storageRef = ref(storage, storagePath);
    // await uploadBytes(storageRef, file);
    // const originalUrl = await getDownloadURL(storageRef);

    const currentUser = auth.currentUser;

    // 2. 在 Firestore 中创建记录
    const newRestorationData = {
      userId: currentUser?.uid,
      originalUrl: fileUrl,
      fixedUrl: fileUrl, // 初始为空
      description: description || '',
      likes: 0,
      isLikes: false,
      status: 'processing' as const,
      createdAt: new Date().toISOString()
    };
    
    const docRef = await addDoc(collection(db, COLLECTION_NAME), newRestorationData);
    
    // 模拟 AI 触发:
    // 在真实应用中，云函数会监听创建/更新操作并调用 AI 服务。
    // 为了演示目的，如果是本地运行，我们可以模拟几秒后的完成状态，
    // 或者我们目前仅将其保留为 'processing' 状态。
    // 这里我们严格遵循仅创建它的要求。 
    
    return {
      id: docRef.id,
      ...newRestorationData
    };
  } catch (error) {
    console.error("Error in restorePhoto:", error);
    throw error;
  }
};

/**
 * 7.3 修复老照片详情 (Restore Photo)
 * /restorePhoto/detail
 */
export const getRestorationDetail = async (id: string): Promise<PhotoRestoration | null> => {
  try {
    const docRef = doc(db, COLLECTION_NAME, id);
    const docSnap = await getDoc(docRef);
    
    if (docSnap.exists()) {
      return { id: docSnap.id, ...docSnap.data() } as PhotoRestoration;
    } else {
      return null;
    }
  } catch (error) {
    console.error("Error in getRestorationDetail:", error);
    throw error;
  }
};

/**
 * 7.4 修复老照片结果保存 (Save Result)
 * /restorePhoto/save
 * 注意: 由于 Firestore 在创建/更新时会自动保存，这通常意味着
 * 确认结果或将其移动到通用相册。
 * 这里我们简单地返回最新的详情。
 */
export const saveRestorationResult = async (id: string): Promise<PhotoRestoration | null> => {
  return getRestorationDetail(id);
};

/**
 * 7.5 获取修复列表 (Get Restoration List)
 * /restorations
 */
export const getRestorationList = async (
  page: number = 1, 
  pageSize: number = 20
): Promise<PhotoRestoration[]> => {
  try {
    // 注意: 目前使用简单的分页。Page > 1 需要 Firestore 的游标逻辑。
    // 我们将根据 limit 获取。
    const currentUser = auth.currentUser;
    console.log("currentUser", currentUser);
    // Temporarily removed orderBy and limit to avoid needing a composite index.
    // Sorting and pagination are handled client-side.
    if (!currentUser?.uid) return [];

    const q = query(
      collection(db, COLLECTION_NAME),
      where("userId", "==", currentUser.uid)
    );

    const querySnapshot = await getDocs(q);
    const list: PhotoRestoration[] = [];
    querySnapshot.forEach((doc) => {
      list.push({ id: doc.id, ...doc.data() } as PhotoRestoration);
    });
    
    // Client-side sort by createdAt desc
    list.sort((a, b) => {
      return (new Date(b.createdAt).getTime() || 0) - (new Date(a.createdAt).getTime() || 0);
    });

    // Client-side pagination
    const startIndex = (page - 1) * pageSize;
    return list.slice(startIndex, startIndex + pageSize);
  } catch (error) {
    console.error("Error in getRestorationList:", error);
    throw error;
  }
};

/**
 * 7.6 点赞 (Like Restoration)
 * /restorations/{id}/like
 */
export const likeRestoration = async (id: string): Promise<void> => {
  try {
    const docRef = doc(db, COLLECTION_NAME, id);
    await updateDoc(docRef, {
      likes: increment(1),
      isLikes: true // 对用户的乐观更新
    });
  } catch (error) {
    console.error("Error in likeRestoration:", error);
    throw error;
  }
};

/**
 * 7.7 获取修复统计 (Get Stats)
 * /restorations/number
 */
export const getRestorationStats = async (userId: string): Promise<{ totalCount: number, userCount: number }> => {
  try {
    const coll = collection(db, COLLECTION_NAME);
    
    // 总数 (全局)
    const totalSnapshot = await getCountFromServer(coll);
    const totalCount = totalSnapshot.data().count;

    // 用户数量
    const userQ = query(coll, where("userId", "==", userId));
    const userSnapshot = await getCountFromServer(userQ);
    const userCount = userSnapshot.data().count;

    return { totalCount, userCount };
  } catch (error) {
    console.error("Error in getRestorationStats:", error);
    throw error;
  }
};

/**
 * 7.8 删除修复记录 (Delete Restoration)
 * /restorations/{id}
 */
export const deleteRestoration = async (id: string): Promise<void> => {
  try {
    const docRef = doc(db, COLLECTION_NAME, id);
    await deleteDoc(docRef);
  } catch (error) {
    console.error("Error in deleteRestoration:", error);
    throw error;
  }
};
