# 数据库与接口文档

## 概览
本文档概述了 **Sage Companion** 应用程序的数据模式和接口定义。目前项目使用的是临时模拟数据 (`constants.tsx`)，但已配置为连接到 **Google Firebase (Firestore)**。

## Firebase 配置
*   **来源**: `services/firebase.ts`
*   **项目 ID**: `buddy-console`
*   **Firestore 实例**: 在 `services/db.ts` 中初始化

## 数据通道与集合

应用程序围绕几个关键的“代理”或领域（安全、医疗/财务、生活/物流、心灵）构建。以下是相应的数据集合及其模式。

### 1. 联系人（家庭与护理团队）
*   **集合**: `contacts`
*   **接口**: `Contact`
*   **描述**: 存储家庭成员、护理人员和医生信息。

| 字段 | 类型 | 描述 |
| :--- | :--- | :--- |
| `id` | string | 唯一文档 ID |
| `name` | string | 显示名称 |
| `avatarSeed` | string | 头像生成种子 |
| `status` | string | 'active' (活跃) \| 'inactive' (非活跃) |
| `isOnline` | boolean | 在线状态 |
| `color` | string | 联系人的 UI 主题颜色 |
| `role` | string | 'caregiver' (护理人员) \| 'family' (家人) \| 'doctor' (医生) |

**模拟数据示例:**
```json
{
  "id": "1",
  "name": "John",
  "role": "caregiver",
  "status": "active"
}
```

#### 2.1 获取任务列表 (Get Tasks)
*   **函数**: `getTasks`
*   **描述**: 获取当前用户的所有任务列表。优先从 Firestore 获取，为空时返回模拟数据。
*   **参数**: 无
*   **响应**: `Promise<Task[]>`

#### 2.2 创建任务 (Create Task)
*   **函数**: `createTask`
*   **描述**: 创建一个新的任务文档。
*   **参数**: `task` (不包含 ID 的 `Task` 对象)

| 字段 | 类型 | 描述 |
| :--- | :--- | :--- |
| `title` | string | 任务标题 |
| `subtitle` | string | 任务副标题/详情 |
| `time` | string | 时间字符串 |
| `status` | string | e.g. 'pending' |
| `icon` | string | e.g. 'pill', 'heart' |
| `recurrence` | string | 'daily', 'weekly', etc. |
| `reminderSettings`| object | 提醒设置 |

*   **响应**: `Promise<Task>` (包含生成的 ID)

#### 2.3 删除任务 (Delete Task)
*   **函数**: `deleteTask`
*   **描述**: 根据 ID 删除指定任务。
*   **参数**:
    *   `taskId`: string (任务文档 ID)
*   **响应**: `Promise<void>`

### 2. 任务（日常惯例与健康）
*   **集合**: `tasks`
*   **接口**: `Task`
*   **描述**: 日常提醒、用药计划和健康检查。

| 字段 | 类型 | 描述 |
| :--- | :--- | :--- |
| `id` | string | 唯一文档 ID |
| `title` | string | 任务标题（例如，“心脏药”） |
| `subtitle` | string | 说明（例如，“随水服用 1 粒”） |
| `time` | string | 预定时间 |
| `status` | string | 'pending' (待处理) \| 'completed' (已完成) |
| `icon` | string | 'heart' (心) \| 'pill' (药丸) \| 'activity' (活动) |
| `recurrence` | string | 'daily' (每日) \| 'weekly' (每周) \| 'monthly' (每月) \| 'none' (无) |
| `reminderSettings` | object | `{ snoozeEnabled: boolean, alertSound: string }` |

### 3. 账单（财务与医疗保险）
*   **集合**: `bills`
*   **接口**: `Bill`
*   **描述**: 财务义务、公用事业账单和保险索赔。

| 字段 | 类型 | 描述 |
| :--- | :--- | :--- |
| `id` | string | 唯一文档 ID |
| `title` | string | 收款人名称（例如，“AT&T 移动”） |
| `amount` | number | 应付金额 |
| `dueDate` | string | 日期字符串或时间戳 |
| `status` | string | 'unpaid' (未付) \| 'paid' (已付) |
| `category` | string | 'utility' (公用事业) \| 'medical' (医疗) \| 'subscription' (订阅) |
| `aiAnalysis` | string | AI 洞察（例如，“高于平均水平”） |
| `history` | array | `PaymentRecord` 对象数组 |

### 4. 安全事件（守护盾）
*   **集合**: `security_events`
*   **接口**: `SecurityEvent`
*   **描述**: AI 拦截或警告的潜在诈骗、垃圾电话和风险信息的日志。

| 字段 | 类型 | 描述 |
| :--- | :--- | :--- |
| `id` | string | 唯一文档 ID |
| `type` | string | 'sms_scam' (短信诈骗) \| 'call_spam' (垃圾电话) \| 'image_scam' (图片诈骗) |
| `source` | string | 电话号码或发送者 ID |
| `content` | string | 信息内容（如果是短信） |
| `riskScore` | number | 0-100 评分 |
| `status` | string | 'blocked' (已拦截) \| 'warning' (警告) \| 'safe' (安全) |
| `aiAnalysis` | string | 拦截原因 |

### 5. 商业（购物与物流）
*   **集合**: `commerce_items`
*   **接口**: `CommerceItem`
*   **描述**: 建议购买和过去的支付记录。

| 字段 | 类型 | 描述 |
| :--- | :--- | :--- |
| `id` | string | 唯一文档 ID |
| `type` | string | 'purchase_suggestion' (购买建议) \| 'payment_record' (支付记录) |
| `title` | string | 产品名称 |
| `amount` | number | 价格 |
| `merchant` | string | 供应商（例如，“Amazon”） |
| `status` | string | 'pending_approval' (待批准) \| 'completed' (已完成) |
| `image` | string | 产品图片 URL |

### 6. 行程会话（交通出行）
*   **集合**: `ride_sessions`
*   **接口**: `RideSession`
*   **描述**: 进行中或过去的拼车会话。

| 字段 | 类型 | 描述 |
| :--- | :--- | :--- |
| `id` | string | 唯一文档 ID |
| `provider` | string | 'Uber' \| 'Lyft' |
| `driver` | string | 司机姓名 |
| `car` | string | 车辆描述 |
| `pickup` | string | 接载地点 |
| `dropoff` | string | 下车地点 |
| `status` | string | 'arriving' (即将到达) \| 'in_ride' (行程中) \| 'completed' (已完成) |
| `eta` | string | 预计到达时间 |

### 7. 用户认证 (User Authentication)
*   **集合**: `users` (内部管理)
*   **接口**: `Auth`
*   **描述**: 管理用户登录、注册及会话。

#### 7.1 登录 (Login)
*   **描述**: 用户通过邮箱和密码登录。
*   **请求参数**: `LoginRequest`

| 字段 | 类型 | 描述 |
| :--- | :--- | :--- |
| `email` | string | 用户邮箱 |
| `password` | string | 用户密码 |

*   **响应**: `AuthResponse`

#### 7.2 注册 (Register)
*   **描述**: 新用户注册账户。
*   **请求参数**: `RegisterRequest`

| 字段 | 类型 | 描述 |
| :--- | :--- | :--- |
| `name` | string | 用户姓名 |
| `email` | string | 用户邮箱 |
| `password` | string | 用户密码 |
| `avatarSeed` | string | (可选) 头像种子 |

*   **响应**: `AuthResponse`

#### 7.3 认证响应结构 (Auth Response)
| 字段 | 类型 | 描述 |
| :--- | :--- | :--- |
| `token` | string | JWT 或会话 Token |
| `user` | object | 用户信息 (`id`, `name`, `email`, `role`, `avatarSeed`) |

### 8. 大模型服务 (AI Service)
*   **来源**: `services/geminiService.ts`
*   **模型**: Google Gemini (gemini-3-flash-preview)
*   **描述**: 提供对话 (Chat) 和视觉分析 (Vision Analysis) 功能。

#### 8.1 聊天对话 (Chat API)
*   **函数**: `chatWithAura`
*   **描述**: 与 AI 助手 Aura 进行对话，返回文本回复、情感状态及可选动作。
*   **参数**:
    *   `message`: string (用户消息)
    *   `history`: array (`{role: string, text: string}`)

*   **响应**: `ChatResponse`

| 字段 | 类型 | 描述 |
| :--- | :--- | :--- |
| `reply` | string | AI 回复内容 |
| `emotion` | string | 情感状态 ('HAPPY', 'SAD', 'ANGRY', 'FEAR', 'SURPRISE', 'DISGUST', 'THINKING', 'NEUTRAL') |
| `action` | string | (可选) AI 建议的动作 ('create_task', 'none') |
| `taskSuggestion` | object | (可选) 当 action 为 'create_task' 时返回的任务建议数据 |

#### 8.2 视觉分析 (Vision API)
*   **函数**: `analyzeVisualContext`
*   **描述**: 分析上传的图片 (Base64)，识别文档、产品、诈骗风险、电器、二维码等。
*   **参数**:
    *   `base64Image`: string (图片数据)

*   **响应**: `ScanResult`

| 字段 | 类型 | 描述 |
| :--- | :--- | :--- |
| `type` | string | 分析类型 ('DOCUMENT', 'PRODUCT', 'SCAM', 'APPLIANCE', 'FOOD', 'GENERAL', 'QR_CODE') |
| `title` | string | 识别结果标题 |
| `summary` | string | 简短描述（面向老年人） |
| `riskLevel` | string | (安全扫描) 风险等级 ('SAFE', 'CAUTION', 'DANGER') |
| `products` | array | (购物) `Array<{ vendor, price, delivery, recommended }>` |
| `overlayIndicators` | array | (电器指南) `Array<{ x, y, label, direction }>` |
| `qrData` | string | (二维码) 扫描到的数据 |

#### 8.3 AI 智能任务创建 (AI Smart Task Creation)
*   **功能**: 通过自然语言指令创建待办事项与提醒。
*   **流程**: 用户输入指令 -> AI 解析意图 -> 返回结构化数据 -> 前端确认并保存 -> Firestore 存储。
*   **示例指令**: "提醒我每天晚上 8 点吃降压药"
*   **数据结构 (TaskSuggestion)**:

| 字段 | 类型 | 描述 |
| :--- | :--- | :--- |
| `title` | string | 任务标题 (例如: "服用降压药") |
| `subtitle` | string | 辅助描述 (例如: "记得喝水") |
| `time` | string | ISO 8601 时间字符串或 Cron 表达式 |
| `recurrence` | string | 重复模式 ('daily', 'weekly', 'monthly', 'none') |
| `type` | string | 任务类型 ('medication', 'appointment', 'general') |

*   **UI 交互**:
    *   聊天界面显示任务卡片预览。
    *   用户点击“确认添加”后，调用 `createTask` API 保存至数据库。
    *   任务将显示在“任务”页面，并在预定时间触发应用内通知。

## 过渡策略：从模拟数据到 Firebase

1.  **第一阶段（当前）**:
    *   UI 组件使用 `constants.tsx` 中的数据。
    *   `firebase.ts` 已初始化，但组件尚未主动作查询。

2.  **第二阶段（混合/并行）**:
    *   在 `services/api.ts` 中创建服务函数（例如，`fetchTasks()`）。
    *   这些函数最初将返回 `Promise.resolve(MOCK_TASKS)`。
    *   示例：
        ```typescript
        // services/api.ts
        import { MOCK_TASKS } from '../constants';
        export const getTasks = async () => {
            return MOCK_TASKS;
        };
        ```

3.  **第三阶段（实况）**:
    *   更新 `services/api.ts` 以查询 Firestore。
    *   示例：
        ```typescript
        // services/api.ts
        import { collection, getDocs } from 'firebase/firestore';
        import { db } from './db';
        
        export const getTasks = async () => {
             const snapshot = await getDocs(collection(db, 'tasks'));
             return snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() }));
        }
        ```
