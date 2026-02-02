# 数据库与接口文档

## 数据通道与集合

应用程序围绕几个关键的“代理”或领域（安全、医疗/财务、生活/物流、心灵）构建。以下是相应的数据集合及其模式。

## 1. 用户认证 (User Authentication)
*   **集合**: `users` (内部管理)
*   **接口**: `Auth`
*   **描述**: 管理用户登录、注册及会话。

#### 1.1 注册 (Register)
*   **接口**: `/register`
*   **描述**: 新用户注册账户。
*   **请求参数**: `RegisterRequest`

| 字段 | 类型 | 描述 |
| :--- | :--- | :--- |
| `userPhone` | string | 用户手机号 |
| `password` | string | 用户密码 |

*   **响应**: `AuthResponse`

#### 1.2 登录 (Login)
*   **接口**: `/login`
*   **描述**: 用户通过邮箱和密码登录。
*   **请求参数**: `LoginRequest`

| 字段 | 类型 | 描述 |
| :--- | :--- | :--- |
| `userPhone` | string | 用户手机号 |
| `password` | string | 用户密码 |
| `avatarSeed` | string | (可选) 头像种子 |
| `name` | string | 用户姓名 |

*   **响应**: `AuthResponse`

#### 响应结构 (Auth Response)
| 字段 | 类型 | 描述 |
| :--- | :--- | :--- |
| `token` | string | JWT 或会话 Token |
| `userInfo` | object | 用户信息 (`userId`, `name`, `userPhone`, `avatarSeed`) |

#### 1.3 用户信息修改 (UpdateUserInfo)
*   **接口**: `/updateUserInfo`
*   **描述**: 用户通过邮箱和密码登录。
*   **请求参数**: `UpdateUserInfoRequest`

| 字段 | 类型 | 描述 |
| :--- | :--- | :--- |
| `avatarSeed` | string | (可选) 头像种子 |
| `name` | string | 用户姓名 |

*   **响应**: `AuthResponse.userInfo`

#### 响应结构 (AuthResponse)
| 字段 | 类型 | 描述 |
| :--- | :--- | :--- |
| `token` | string | JWT 或会话 Token |
| `userInfo` | object | 用户信息 (`userId`, `name`, `userPhone`, `avatarSeed`) |

## 2. 大模型服务 (AI Service)
*   **接口**: `services/geminiService.ts`
*   **模型**: Google Gemini (gemini-3-flash-preview)
*   **描述**: 提供对话 (Chat) 和视觉分析 (Vision Analysis) 功能。支持查看历史对话记录。
*   **流程**: 
    1.  **创建问题 (Create Question)**: 将问题（文本或图片）上传，返回 `questionId`。
    2.  **调用流式接口 (Stream)**: 使用 `questionId` 和 类型 (`img` || `text`) 调用大模型接口，返回流式数据。
    3.  **数据解析**: 返回的数据包含问题类型（如药品、账单、创建任务等）和结构化内容。

#### 2.1 创建问题 (Create Question)
*   **接口**: `/createQuestion`
*   **描述**: 上传问题内容（文本或图片），生成唯一的问题 ID。
*   **参数**:
    *   `userId`: string
    *   `type`: string ('text' | 'image')
    *   `content`: string (文本内容 或 图片 Base64/URL)
*   **响应**: `Promise<{ questionId: string }>`

#### 2.2 获取流式回复 (Get AI Stream)
*   **接口**: `/aiStream` / `chat-stream`
*   **描述**: 根据问题 ID 获取 AI 的流式回复。
*   **参数**:
    *   `questionId`: string
    *   `type`: string ('text' | 'image')
*   **响应**: `Stream<AIResponse>`

**AIResponse 数据结构**:
返回的数据流中包含 `type` 字段，指示当前回复的业务类型：

| 类型 (`type`) | 描述 | 数据结构示例 (`data`) |
| :--- | :--- | :--- |
| `CHAT` | 普通对话 | `{ reply: "你好，请问有什么可以帮您？", emotion: "HAPPY" }` |
| `TASK_CREATION` | 提示创建任务 | `{ title: "服用降压药", time: "20:00", recurrence: "daily" }` |
| `PRESCRIPTION` / `DISCHARGE_SUMMARY` | 药品/处方单/出院小结 | `{ title: "处方单", medications: [{ name: "Lisinopril", dosage: "10mg", frequency: "每日1次", times: ["08:00"] }] }` |
| `BILL` | 账单 | `{ title: "电费账单", amount: "200.00", dueDate: "2023-10-15", recipient: "电力公司" }` |
| `SCAM` | 诈骗风险 | `{ title: "诈骗预警", riskLevel: "DANGER", summary: "检测到冒充公检法的诈骗短信...", actionAdvice: "请勿转账，立即删除" }` |
| `APPLIANCE` | 电器说明 | `{ title: "咖啡机", summary: "这是咖啡机，使用步骤如下...", overlayIndicators: [] }` |
| `PRODUCT` | 商品购物 | `{ products: [{ name: "牛奶", price: "20.00", vendor: "超市" }] }` |
| `FOOD` | 食物关怀 | `{ advice: "天气寒冷，建议喝点热汤暖身。" }` |
| `QR_CODE` | 二维码 | `{ qrData: "https://example.com" }` |

#### 2.3 获取对话历史 (Get History)
*   **接口**: `/history`
*   **描述**: 获取用户的历史对话记录。
*   **参数**:
    *   `userId`: string
    *   `page`: number
*   **响应**: `Promise<HistoryItem[]>`

| 字段 | 类型 | 描述 |
| :--- | :--- | :--- |
| `id` | string | 对话记录 ID |
| `type` | string | 'text' \| 'image' |
| `userContent` | string | 用户发送的内容 |
| `aiResponse` | object | AI 回复的完整结构数据 |
| `createdAt` | string | 时间 |


## 3. 联系人（家庭与护理团队）
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

#### 3.1 添加联系人 (Create Contact)
*   **接口**: `/createContact`
*   **描述**: 创建一个新的联系人。如果此号未注册，要发送短信邀请，下载链接等信息
*   **参数**: `contact` (不包含 ID 的 `Contact` 对象)

| 字段 | 类型 | 描述 |
| :--- | :--- | :--- |
| `name` | string | 显示名称 |
| `role` | string | 'caregiver' \| 'family' \| 'doctor' |
| `phone` | string | 电话号码 |
| `remark` | string | 备注 |

*   **响应**: `Promise<Contact>` (包含生成的 ID)

#### 3.2 获取联系人列表 (Get Contacts)
*   **函数**: `getContacts`
*   **描述**: 获取所有联系人。优先从 Firestore 获取，为空时返回模拟数据。
*   **参数**: 无
*   **响应**: `Promise<Contact[]>`

| 字段 | 类型 | 描述 |
| :--- | :--- | :--- |
| `contactId` | string | 唯一 ID |
| `name` | string | 显示名称 |
| `role` | string | 'caregiver' \| 'family' \| 'doctor' |
| `phone` | string | 电话号码 |
| `isOnline` | boolean | 在线状态 |

#### 3.3 删除联系人 (Delete Contact)
*   **函数**: `deleteContact`
*   **描述**: 根据 ID 删除指定联系人。
*   **参数**:
    *   `contactId`: string (联系人 ID)
*   **响应**: `Promise<void>`

#### 3.4 更新联系人 (Update Contact)
*   **接口**: `/updateContact`
*   **描述**: 更新指定联系人的信息。
*   **参数**:
    *   `contactId`: string (联系人 ID)
    *   `contact`: `Contact` (联系人信息)
*   **响应**: `Promise<Contact>`

#### 3.5 同意/拒绝申请 (Agree/Reject Application)
*   **接口**: `/handleApplication`
*   **描述**: 同意/拒绝申请。
*   **参数**:
    *   `applicationId`: string (申请 ID)
    *   `status`: string ('agree' \| 'reject')
*   **响应**: `Promise<void>`


#### 3.6 结果通知 (Notification)
*   **集合**: `notifications` (结果通知)
*   **接口**: `/notifications/contact`

*   **响应**: `ContactResponse`
| 字段 | 类型 | 描述 |
| :--- | :--- | :--- |
| `contactId` | string | 联系人ID |
| `message` | string | 通知信息 |



## 4. 护理计划 (Care Plan)
*   **集合**: `carePlan`
*   **接口**: `CarePlan`
*   **描述**: 日常提醒、用药计划和健康检查。日程管理、健康追踪、账单处理、安全事件查看、网约车行程追踪、 被申请添加人员， 当时健康、账单、安全事件、护理计划 等类型，可以要求协助。
*   **用户动线**: 查看今日待办 -> 处理任务 -> 查看风险提示 -> 完成事务操作。

#### 4.1 创建护理计划 (Create CarePlan)
*   **函数**: `createCarePlan`
*   **描述**: 创建一个新的护理计划文档。 来源是 对话创建、打车推送、申请添加人员。
*   **参数**: `CarePlan` (不包含 ID 的 `CarePlan` 对象)
*   **响应**: `Promise<CarePlan>` (包含生成的 ID)

#### 4.2 获取护理计划列表 (Get CarePlan)
*   **函数**: `getCarePlan`
*   **描述**: 获取当前用户的所有护理计划列表。优先从 Firestore 获取，为空时返回模拟数据。
*   **参数**: 可以查看所有状态的，也可以查看需要处理的。
*   **响应**: `Promise<CarePlan[]>`

#### 4.3 更新护理计划 (Update CarePlan)
*   **函数**: `updateCarePlan`
*   **描述**: 更新指定护理计划的信息。
*   **参数**:
    *   `carePlanId`: string (护理计划 ID)
    *   `carePlan`: `CarePlan` (护理计划信息)
*   **响应**: `Promise<CarePlan>` (包含生成的 ID)

| 字段 | 类型 | 描述 |
| :--- | :--- | :--- |
| `title` | string | 任务标题 |
| `subtitle` | string | 任务副标题/详情 |
| `time` | string | 时间字符串 |
| `status` | string | e.g. 'pending' |
| `icon` | string | e.g. 'pill', 'heart' |
| `recurrence` | string | 'daily', 'weekly', etc. |
| `reminderSettings`| object | 提醒设置 |
| `reminderSettings.time` | string | 提醒时间 提醒的时间 (HH:mm) |
| `reminderSettings.ringtone` | number | 响铃方式：0:铃声；1:振动；2:静音 |
| `reminderSettings.repeat` | number | 重复频率：0:不重复；1:每天重复；2:每周重复；3:每月重复 |
| `remindId` | string | 提醒ID |

#### 4.3 删除护理计划 (Delete CarePlanId)
*   **函数**: `deleteCarePlanId`
*   **描述**: 根据 ID 删除指定护理计划。
*   **参数**:
    *   `carePlanId`: string (护理计划 ID)
*   **响应**: `Promise<void>`

#### 4.4 求助 (Helping)
*   **函数**: `helping`
*   **描述**: 求助。
*   **参数**:
    *   `carePlanId`: string (任务文档 ID)
*   **响应**: `Promise<CarePlanId>` (包含生成的 ID)

#### 4.5 求助回复 (Completed)
*   **函数**: `carePlan/completed`
*   **描述**: 求助回复。
*   **参数**:
    *   `carePlanId`: string (任务文档 ID)
    *   `answer`: string (回答)
*   **响应**: `Promise<CarePlanId>` (包含生成的 ID)


**响应**: `Promise<CarePlanId>` (包含生成的 ID)
| 字段 | 类型 | 描述 |
| :--- | :--- | :--- |
| `careId` | string | 唯一文档 ID |
| `title` | string | 任务标题（例如，“心脏药”） |
| `subtitle` | string | 说明（例如，“随水服用 1 粒”） |
| `time` | string | 预定时间 |
| `status` | string | 'pending' (待处理) \| 'helping' (求助中) \| 'helped' (已帮助) \| 'completed' (已完成) |
| `icon` | string | 'heart' (心) \| 'pill' (药丸) \| 'activity' (活动) |
| `recurrence` | string | 'daily' (每日) \| 'weekly' (每周) \| 'monthly' (每月) \| 'none' (无) |
| `type` | string | 'medication' (药物) \| 'appointment' (预约) \| 'bill' (账单) \| 'general' (一般) |
| `reminderSettings` | object | `{ snoozeEnabled: boolean, alertSound: string }` |


## 5. 圈子 （社区）
*   **集合**: `circles`
*   **接口**: `Circle`
*   **描述**: 社区圈子功能，包括查看列表、详情、创建、点赞、加入及评论互动。

#### 5.1 圈子信息模型 (Circle Schema)
| 字段 | 类型 | 描述 |
| :--- | :--- | :--- |
| `id` | string | 唯一文档 ID |
| `title` | string | 标题 |
| `description` | string | 描述 |
| `topic` | string | 主题内容 |
| `createdAt` | string | 创建时间 |
| `creatorId` | string | 创建者 ID |
| `likesNumber` | number | 点赞数 |
| `membersNumber` | number | 加入圈子的成员数 |
| `coverImage` | string | (可选) 封面图 |
| `isLike` | boolean | 是否点赞 |
| `isMember` | boolean | 是否加入圈子 |


#### 5.2 创建圈子 (Create Circle)
*   **函数**: `/createCircle`
*   **描述**: 创建为圈子信息。
*   **参数**:
    *   `title`: string
    *   `description`: string
    *   `topic`: string
*   **响应**: `Promise<Circle>`


#### 5.3 获取圈子列表 (Get Circles)
*   **函数**: `/circles`
*   **描述**: 查看所有圈子列表。
*   **响应**: `Promise<Circle[]>`

#### 5.4 获取圈子详情 (Get Circle Detail)
*   **函数**: `/circles/{circleId}`
*   **描述**: 查看单个圈子详情，包含评论与回复。
*   **参数**:
    *   `circleId`: string
*   **响应**: `Promise<CircleDetail>`
    *   返回结构包含 `Circle` 信息及 `comments` 列表。

#### 5.5 加入圈子 (Join Circle)
*   **函数**: `joinCircle`
*   **描述**: 加入指定圈子。
*   **参数**:
    *   `circleId`: string
*   **响应**: `Promise<void>`

#### 5.6 点赞圈子 (Like Circle)
*   **函数**: `likeCircle`
*   **描述**: 对圈子进行点赞。
*   **参数**:
    *   `circleId`: string
*   **响应**: `Promise<void>`

#### 5.7 评论模型 (Comment/Reply Schema)
| 字段 | 类型 | 描述 |
| :--- | :--- | :--- |
| `id` | string | 唯一 ID |
| `circleId` | string | 所属圈子 ID |
| `content` | string | 评论内容 |
| `authorId` | string | 作者 ID |
| `createdAt` | string | 评论时间 |
| `replyToId` | string | (可选) 回复的评论 ID |


## 6. SOS
*   **集合**: `security_events`
*   **接口**: `/sos`
*   **描述**: 也要发送短信通知，实现一键呼救、多渠道通知，打造全链路紧急响应机制，保障用户安全。

| 字段 | 类型 | 描述 |
| :--- | :--- | :--- |
| `userId` | string | 用户ID |
| `sosId` | string | 唯一 ID |
| `location` | string | 位置 |


## 7. 老照片修复 (Old Photo Restoration)
*   **集合**: `photo_restorations`
*   **接口**: `PhotoRestoration`
*   **描述**: 上传老照片，使用 AI 进行修复、上色或增强，支持查看修复对比、点赞及统计。

#### 7.1 修复记录模型 (Schema)
| 字段 | 类型 | 描述 |
| :--- | :--- | :--- |
| `id` | string | 唯一 ID |
| `userId` | string | 用户 ID |
| `originalUrl` | string | 原始图片 URL |
| `fixedUrl` | string | 修复后图片 URL |
| `description` | string | 照片描述 |
| `likes` | number | 点赞数量 |
| `isLikes` | boolean | 是否点赞 |
| `status` | string | 'processing' (处理中) \| 'completed' (完成) \| 'failed' (失败) |
| `createdAt` | string | 创建时间 |

#### 7.2 上传并修复 (Upload & Restore)
*   **函数**: `/restorePhoto`
*   **描述**: 上传图片并触发 AI 修复流程。
*   **参数**:
    *   `photo`: File/Blob (图片文件)
    *   `description`: string (可选描述)
*   **响应**: `Promise<PhotoRestoration>` (包含初始状态和 ID)

#### 7.3 修复老照片详情 (Restore Photo)
*   **函数**: `/restorePhoto/detail`
*   **描述**: 上传图片并触发 AI 修复流程。
*   **参数**:
    *   `id`: number (修复记录ID)
*   **响应**: `Promise<PhotoRestoration>` (包含初始状态和 ID)

#### 7.4 修复老照片结果保存 (保存就会放入相册或者列表里面)
*   **函数**: `/restorePhoto/save`
*   **描述**: 保存修复后的老照片。
*   **参数**:
    *   `id`: number (修复记录ID)
*   **响应**: `Promise<PhotoRestoration>` (包含初始状态和 ID)

#### 7.5 获取修复列表 (Get Restoration List)
*   **函数**: `/restorations`
*   **描述**: 获取照片对比列表。
*   **参数**:
    *   `userId`: string (可选，筛选特定用户)
    *   `page`: number
    *   `pageSize`: number
*   **响应**: `Promise<PhotoRestoration[]>`

#### 7.6 点赞 (Like Restoration)
*   **函数**: `/restorations/{id}/like`
*   **描述**: 对修复效果点赞。
*   **参数**:
    *   `restorationId`: string
*   **响应**: `Promise<void>`

#### 7.7 获取修复统计 (Get Stats)
*   **函数**: `/restorations/number`
*   **描述**: 获取修复数量统计。
*   **响应**: `Promise<{ totalCount: number, userCount: number }>`


#### 7.8 删除修复记录 (Delete Restoration)
*   **函数**: `/restorations/{id} (DELETE)`
*   **描述**: 根据 ID 删除修复记录。
*   **参数**:
    *   `id`: string (修复记录 ID)
*   **响应**: `Promise<void>`


## 8. 上传照片和文件 (Upload Image)
*   **函数**: `/uploadImage`
*   **描述**: 上传图片和文件。
*   **参数**:
    *   `file`: File/Blob (文件)
*   **响应**: `Promise<{url: string}>`


## 9. 订阅服务 (Subscription Service)
*   **集合**: `subscriptions`
*   **接口**: `Subscription`
*   **描述**: 管理用户订阅状态、订阅记录及过期时间查询。

#### 9.1 获取订阅方案 (Get Subscription Plans)
*   **接口**: `/subscription/plans`
*   **描述**: 获取可选的订阅套餐（如月度、年度会员）。
*   **响应**: `Promise<SubscriptionPlan[]>`

| 字段 | 类型 | 描述 |
| :--- | :--- | :--- |
| `id` | string | 方案 ID |
| `name` | string | 方案名称 (e.g., "月度会员") |
| `price` | number | 价格 |
| `currency` | string | 货币单位 |
| `duration` | number | 时长（天） |
| `description` | string | 描述 |

#### 9.2 创建订阅/支付 (Subscribe)
*   **接口**: `/subscription/subscribe`
*   **描述**: 用户购买订阅。
*   **参数**:
    *   `planId`: string (方案 ID)
    *   `paymentMethod`: string (支付方式)
*   **响应**: `Promise<SubscriptionRecord>`

#### 9.3 获取当前订阅状态 (Get Subscription Status)
*   **接口**: `/subscription/status`
*   **描述**: 查询用户当前的订阅状态及过期时间。
*   **参数**:
    *   `userId`: string
*   **响应**: `Promise<SubscriptionStatus>`

| 字段 | 类型 | 描述 |
| :--- | :--- | :--- |
| `isSubscribed` | boolean | 是否处于订阅期 |
| `expireAt` | string | 过期时间 (ISO 8601) |
| `planName` | string | 当前方案名称 |
| `autoRenew` | boolean | 是否自动续费 |

#### 9.4 获取订阅记录 (Get Subscription History)
*   **接口**: `/subscription/history`
*   **描述**: 获取用户的历史订阅/购买记录。
*   **参数**:
    *   `userId`: string
    *   `page`: number
*   **响应**: `Promise<SubscriptionRecord[]>`

| 字段 | 类型 | 描述 |
| :--- | :--- | :--- |
| `id` | string | 记录 ID |
| `planName` | string | 购买方案 |
| `amount` | number | 金额 |
| `status` | string | 'success' \| 'pending' \| 'failed' |
| `createdAt` | string | 购买时间 |
| `expireAt` | string | 该次订阅对应的过期时间 |
