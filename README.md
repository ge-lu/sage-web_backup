

# Run and deploy your AI Studio app

This contains everything you need to run your app locally.

View your app in AI Studio: https://ai.studio/apps/drive/1KocCI9SuNfx1-ZML3J03_EFqksYY6vw8

## Run Locally

**Prerequisites:**  Node.js

.env.development 是本地运行项目读取的配置文件，GEMINI_API_KEY  如果使用antigravity 可以不用配置，取默认登录账号
.env 是打包部署服务运行项目读取的配置文件，GEMINI_API_KEY

获取gemini api key地址：https://aistudio.google.com/api-keys

1. Install dependencies:
   `npm install`
2. Run the app:
   `npm run dev`

### 开发之前，优先拉取代码。pull
左侧 Source Control菜单，最上面 Changes列 后面有三个点，点开之后找到 Pull

### 如何提交代码
#### 第一种。命令行
1. git add .
2. git commit -m "提交信息"
3. git pull
4. git push


##### 第二种。左侧 Source Control
Changes 将代码提交到缓冲区，再增加描述信息。点击 Commit。 再点击 Push，提交到远程仓库

##### 第三种。agent 输入
我要将本次修改内容提交远程代码仓库

会提示我们点击确认，将上面命令执行，
