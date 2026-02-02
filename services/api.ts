import { 
    MOCK_CONTACTS, 
    MOCK_TASKS, 
    MOCK_BILLS, 
    MOCK_SECURITY_EVENTS, 
    MOCK_COMMERCE_ITEMS, 
    MOCK_RIDE 
} from '../constants';
import { 
    Contact, 
    Task, 
    Bill, 
    SecurityEvent, 
    CommerceItem, 
    RideSession,
    LoginRequest,
    RegisterRequest,
    AuthResponse,
    User,
    Medication
} from '../types';
import { collection, getDocs, addDoc, deleteDoc, doc, updateDoc, setDoc } from 'firebase/firestore';
import { db, auth } from './firebase';
import { 
    signInWithPhoneNumber,
    RecaptchaVerifier, 
    createUserWithEmailAndPassword, 
    UserCredential,
    ConfirmationResult
} from 'firebase/auth';

// 此服务层作为桥梁。
// 目前返回 MOCK 数据，但其结构设计便于切换到 Firebase 调用。

// 1. 联系人
export const getContacts = async (): Promise<Contact[]> => {
    try {
        const snapshot = await getDocs(collection(db, 'contacts'));
        if (snapshot.empty) {
            console.log("No contacts in Firestore, returning MOCK_CONTACTS");
            return MOCK_CONTACTS;
        }
        return snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() } as Contact));
    } catch (error) {
        console.warn("Error fetching contacts from Firestore, returning MOCK_CONTACTS", error);
        return MOCK_CONTACTS;
    }
};

export const createContact = async (contact: Omit<Contact, 'id'>): Promise<Contact> => {
    try {
        const docRef = await addDoc(collection(db, 'contacts'), contact);
        return { id: docRef.id, ...contact };
    } catch (error) {
        console.error("Error creating contact:", error);
        throw error;
    }
};

export const deleteContact = async (contactId: string): Promise<void> => {
    try {
        await deleteDoc(doc(db, 'contacts', contactId));
    } catch (error) {
        console.error("Error deleting contact:", error);
        throw error;
    }
};

// 2. 任务
export const getTasks = async (): Promise<Task[]> => {
    try {
        const snapshot = await getDocs(collection(db, 'tasks'));
        if (snapshot.empty) {
            console.log("No tasks in Firestore, returning MOCK_TASKS");
            return MOCK_TASKS;
        }
        return snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() } as Task));
    } catch (error) {
        console.warn("Error fetching tasks from Firestore, returning MOCK_TASKS", error);
        return MOCK_TASKS;
    }
};

export const createTask = async (task: Omit<Task, 'id'>): Promise<Task> => {
    try {
        const docRef = await addDoc(collection(db, 'tasks'), task);
        return { id: docRef.id, ...task };
    } catch (error) {
        console.error("Error creating task:", error);
        throw error;
    }
};

export const deleteTask = async (taskId: string): Promise<void> => {
    try {
        await deleteDoc(doc(db, 'tasks', taskId));
    } catch (error) {
        console.error("Error deleting task:", error);
        throw error;
    }
};

// 3. 账单
export const getBills = async (): Promise<Bill[]> => {
    // TODO: Switch to: (await getDocs(collection(db, 'bills'))).docs.map(...)
    return Promise.resolve(MOCK_BILLS);
};

// 4. 安全事件
export const getSecurityEvents = async (): Promise<SecurityEvent[]> => {
    // TODO: Switch to: (await getDocs(collection(db, 'security_events'))).docs.map(...)
    return Promise.resolve(MOCK_SECURITY_EVENTS);
};

// 5. 商品项目
export const getCommerceItems = async (): Promise<CommerceItem[]> => {
    // TODO: Switch to: (await getDocs(collection(db, 'commerce_items'))).docs.map(...)
    return Promise.resolve(MOCK_COMMERCE_ITEMS);
};

// 6. 行程会话
export const getCurrentRide = async (): Promise<RideSession | null> => {
    // TODO: Switch to: doc(db, 'rides', 'current_user_id')
    return Promise.resolve(MOCK_RIDE);
};

// 7. 认证
/**
 * 使用手机号和密码登录
 * 使用手机号作为邮箱标识符 (phone@sage-app.com)
 * 如果用户不存在则自动注册
 */
export const login = async (req: LoginRequest): Promise<AuthResponse> => {
    try {
        // 将手机号转换为 Firebase 的邮箱格式
        const emailFromPhone = `${req.phone}@sage-app.com`;
        let userCredential: UserCredential;
        
        try {
            // 尝试使用现有账户登录
            const { signInWithEmailAndPassword } = await import('firebase/auth');
            userCredential = await signInWithEmailAndPassword(auth, emailFromPhone, req.password);
        } catch (signInError: any) {
            // 如果用户不存在，则自动注册
            if (signInError.code === 'auth/user-not-found' || 
                signInError.code === 'auth/invalid-credential' ||
                signInError.code === 'auth/invalid-login-credentials') {
                console.log('User not found, auto-registering with phone:', req.phone);
                userCredential = await createUserWithEmailAndPassword(auth, emailFromPhone, req.password);
                
                // 在 Firestore 中创建用户档案
                const newUser: User = {
                    id: userCredential.user.uid,
                    name: req.phone,
                    email: emailFromPhone,
                    role: 'user',
                    avatarSeed: userCredential.user.uid
                };
                
                await setDoc(doc(db, 'users', userCredential.user.uid), newUser);
                console.log('Created new user profile for phone:', req.phone);
            } else {
                throw signInError;
            }
        }
        
        // 获取 ID 令牌
        const token = await userCredential.user.getIdToken();
        
        // 获取或创建用户档案
        const userDoc = await getDocs(collection(db, 'users'));
        const existingUser = userDoc.docs.find(d => d.id === userCredential.user.uid);
        
        let user: User;
        if (existingUser) {
            user = existingUser.data() as User;
        } else {
            user = {
                id: userCredential.user.uid,
                name: req.phone,
                email: emailFromPhone,
                role: 'user',
                avatarSeed: userCredential.user.uid
            };
        }
        
        return {
            token,
            user
        };
    } catch (error: any) {
        console.error('Login error:', error);
        throw new Error(error.message || '登录失败，请重试');
    }
};

export const register = async (req: RegisterRequest): Promise<AuthResponse> => {
    try {
        const userCredential = await createUserWithEmailAndPassword(auth, req.email, req.password);
        
        // Get ID token
        const token = await userCredential.user.getIdToken();
        
        const newUser: User = {
            id: userCredential.user.uid,
            name: req.name,
            email: req.email,
            role: 'user',
            avatarSeed: req.avatarSeed || userCredential.user.uid
        };
        
        // 在 Firestore 中存储用户档案
        await setDoc(doc(db, 'users', userCredential.user.uid), newUser);
        
        return {
            token,
            user: newUser
        };
    } catch (error: any) {
        console.error('Registration error:', error);
        throw new Error(error.message || 'Failed to register');
    }
};

// 获取当前用户认证令牌的辅助函数
export const getAuthToken = async (): Promise<string | null> => {
    const currentUser = auth.currentUser;
    if (currentUser) {
        try {
            return await currentUser.getIdToken();
        } catch (error) {
            console.error('Error getting auth token:', error);
            return null;
        }
    }
    return null;
};

// 全局存储确认结果以进行验证
let confirmationResult: ConfirmationResult | null = null;

/**
 * 发送验证码到手机号
 * @param phoneNumber - E.164 格式的手机号 (例如: "+8615738805764")
 * @param recaptchaVerifier - RecaptchaVerifier 实例
 * @returns 发送成功时解析的 Promise
 */
export const sendVerificationCode = async (
    phoneNumber: string,
    recaptchaVerifier: RecaptchaVerifier
): Promise<void> => {
    try {
        // 确保手机号为 E.164 格式
        const formattedPhone = phoneNumber.startsWith('+') ? phoneNumber : '+86' + phoneNumber;
        
        confirmationResult = await signInWithPhoneNumber(auth, formattedPhone, recaptchaVerifier);
        console.log('Verification code sent to', formattedPhone);
    } catch (error: any) {
        console.error('Error sending verification code:', error);
        throw new Error(error.message || 'Failed to send verification code');
    }
};

/**
 * 验证代码并完成手机认证
 * @param verificationCode - 短信收到的 6 位验证码
 * @returns 包含令牌和用户信息的 AuthResponse
 */
export const verifyPhoneCode = async (verificationCode: string): Promise<AuthResponse> => {
    try {
        if (!confirmationResult) {
            throw new Error('Please request verification code first');
        }
        
        const userCredential = await confirmationResult.confirm(verificationCode);
        const token = await userCredential.user.getIdToken();
        
        // 检查 Firestore 中是否存在用户档案
        const userDoc = doc(db, 'users', userCredential.user.uid);
        const userSnapshot = await getDocs(collection(db, 'users'));
        const existingUser = userSnapshot.docs.find(d => d.id === userCredential.user.uid);
        
        let user: User;
        
        if (existingUser) {
            // 现有用户
            user = existingUser.data() as User;
        } else {
            // 新用户 - 创建档案
            user = {
                id: userCredential.user.uid,
                name: userCredential.user.phoneNumber || 'User',
                email: userCredential.user.email || '',
                role: 'user',
                avatarSeed: userCredential.user.uid
            };
            
            await setDoc(userDoc, user);
            console.log('Created new user profile for', userCredential.user.phoneNumber);
        }
        
        // 验证成功后清除确认结果
        confirmationResult = null;
        
        return {
            token,
            user
        };
    } catch (error: any) {
        console.error('Verification error:', error);
        throw new Error(error.message || 'Failed to verify code');
    }
};

// 7. 药物
export const getMedications = async (): Promise<Medication[]> => {
    try {
        const snapshot = await getDocs(collection(db, 'medications'));
        if (snapshot.empty) {
            console.log("No medications in Firestore, returning empty array");
            return [];
        }
        return snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() } as Medication));
    } catch (error) {
        console.warn("Error fetching medications from Firestore, returning empty array", error);
        return [];
    }
};

export const createMedication = async (medication: Omit<Medication, 'id'>): Promise<Medication> => {
    try {
        const docRef = await addDoc(collection(db, 'medications'), medication);
        return { id: docRef.id, ...medication };
    } catch (error) {
        console.error("Error creating medication:", error);
        throw error;
    }
};

export const updateMedication = async (medicationId: string, updates: Partial<Medication>): Promise<void> => {
    try {
        await updateDoc(doc(db, 'medications', medicationId), updates);
    } catch (error) {
        console.error("Error updating medication:", error);
        throw error;
    }
};

export const deleteMedication = async (medicationId: string): Promise<void> => {
    try {
        await deleteDoc(doc(db, 'medications', medicationId));
    } catch (error) {
        console.error("Error deleting medication:", error);
        throw error;
    }
};
