# Sub2API 品牌自定义修改记录

> 项目: Key2API (key2api.com)
> 基于: Wei-Shaw/sub2api
> 修改日期: 2026-06-04

---

## 一、Logo 替换

| 文件 | 说明 |
|------|------|
| `frontend/public/logo.png` | 替换为自定义 Logo（也作为 favicon 使用） |

> ⚠️ 升级注意: 升级后需重新替换此文件，然后重新构建前端。

---

## 二、站点名称（数据库）

| Key | Value |
|-----|-------|
| `site_name` | `Key2API` |

数据库 `settings` 表，通过管理员后台「系统设置 → 站点名称」也可以修改。

> ⚠️ 升级注意: 数据库记录不受升级影响，无需重新配置。

---

## 三、前端文件修改

### 1. `frontend/index.html`
```diff
- <title>Sub2API - AI API Gateway</title>
+ <title>Key2API - AI API Gateway</title>
```

### 2. `frontend/src/stores/app.ts`
```diff
- const siteName = ref<string>('Sub2API')
+ const siteName = ref<string>('Key2API')
```
```diff
- siteName.value = config.site_name || 'Sub2API'
+ siteName.value = config.site_name || 'Key2API'
```

### 3. `frontend/src/main.ts`
```diff
- if (appStore.siteName && appStore.siteName !== 'Sub2API') {
+ if (appStore.siteName && appStore.siteName !== 'Key2API') {
```

### 4. `frontend/src/components/layout/AuthLayout.vue`
```diff
- const siteName = computed(() => appStore.siteName || 'Sub2API')
+ const siteName = computed(() => appStore.siteName || 'Key2API')
```

### 5. `frontend/src/components/layout/AppHeader.vue`
```diff
- <a v-if="authStore.isAdmin" href="https://github.com/Wei-Shaw/sub2api" ...>
-   <svg ...>GitHub 图标</svg>
- </a>
+ <!-- GitHub 链接已隐藏 -->
```

### 6. `frontend/src/i18n/locales/zh.ts`

| 行号 | 修改前 | 修改后 |
|------|--------|--------|
| 190 | `'Sub2API 安装向导'` | `'Key2API 安装向导'` |
| 191 | `'配置您的 Sub2API 实例'` | `'配置您的 Key2API 实例'` |
| 5613 | `'用于 Sub2API 用户登录'` | `'用于 Key2API 用户登录'` |
| 5632 | `'用于 Sub2API 用户登录'` | `'用于 Key2API 用户登录'` |
| 5831 | `'Sub2API'`(占位符) | `'Key2API'` |
| 6122 | `'Sub2API'`(占位符) | `'Key2API'` |
| 6760 | `'👋 欢迎使用 Sub2API'` | `'👋 欢迎使用 Key2API'` |
| 6762 | `'Sub2API 是一个强大的...'` | `'Key2API 是一个强大的...'` |
| 6769 | `'分组是 Sub2API 的核心概念'` | `'分组是 Key2API 的核心概念'` |
| 6881 | `'👋 欢迎使用 Sub2API'`(用户版) | `'👋 欢迎使用 Key2API'` |
| 6883 | `'欢迎来到 Sub2API AI 服务平台'` | `'欢迎来到 Key2API AI 服务平台'` |

### 7. `frontend/src/i18n/locales/en.ts`

| 行号 | 修改前 | 修改后 |
|------|--------|--------|
| 190 | `'Sub2API Setup'` | `'Key2API Setup'` |
| 191 | `'Configure your Sub2API instance'` | `'Configure your Key2API instance'` |
| 5453 | `'for Sub2API end-user login'` | `'for Key2API end-user login'` |
| 5473 | `'for Sub2API end-user login'` | `'for Key2API end-user login'` |
| 5676 | `'Sub2API'`(占位符) | `'Key2API'` |
| 5966 | `'Sub2API'`(占位符) | `'Key2API'` |
| 6607 | `'👋 Welcome to Sub2API'` | `'👋 Welcome to Key2API'` |
| 6608 | `'Sub2API is a powerful...'` | `'Key2API is a powerful...'` |
| 6614 | `'Groups are the core concept of Sub2API'` | `'Groups are the core concept of Key2API'` |
| 6707 | `'👋 Welcome to Sub2API'`(用户版) | `'👋 Welcome to Key2API'` |
| 6708 | `'Welcome to the Sub2API AI service platform'` | `'Welcome to the Key2API AI service platform'` |

---

## 四、后端文件修改（Go 源码）

这些是**默认值/回退值**，当数据库未配置时生效。数据库有 `site_name` 记录后会优先使用数据库值。

### 1. `backend/internal/service/auth_email_binding.go:127`
```diff
- siteName := "Sub2API"
+ siteName := "Key2API"
```

### 2. `backend/internal/service/totp_service.go:92`
```diff
- totpIssuer = "Sub2API"
+ totpIssuer = "Key2API"
```

### 3. `backend/internal/service/payment_order.go:507`
```diff
- productName = "Sub2API Subscription " + plan.Name
+ productName = "Key2API Subscription " + plan.Name
```

### 4. `backend/internal/service/payment_order.go:519`
```diff
- return "Sub2API " + amountStr + " " + currency
+ return "Key2API " + amountStr + " " + currency
```

### 5. `backend/internal/service/content_moderation.go:1794,1798`
```diff
- return "Sub2API"
+ return "Key2API"
```

### 6. `backend/internal/service/setting_service.go:837,2478,2673,2861`
```diff
- SiteName: s.getStringOrDefault(settings, SettingKeySiteName, "Sub2API"),
+ SiteName: s.getStringOrDefault(settings, SettingKeySiteName, "Key2API"),
```
```diff
- return "Sub2API"
+ return "Key2API"
```
```diff
- SettingKeySiteName: "Sub2API",
+ SettingKeySiteName: "Key2API",
```

---

## 五、升级操作步骤

当你拉取上游最新代码后，按以下步骤重新自定义：

```bash
# 1. 拉取上游代码
git pull upstream main

# 2. 按本指南第三节、第四节 修改所有文件
# （建议用 sed 批量替换）

# 3. 替换 Logo 图片
cp /path/to/your/logo.png frontend/public/logo.png

# 4. 构建并部署
cd frontend && pnpm install && pnpm run build
cd ../backend && go build -o bin/server ./cmd/server
```

### 批量替换技巧

```bash
# 前端 TS/Vue 文件
sed -i "s/'Sub2API'/'Key2API'/g" frontend/src/stores/app.ts
sed -i "s/!== 'Sub2API'/!== 'Key2API'/g" frontend/src/main.ts
sed -i "s/|| 'Sub2API'/|| 'Key2API'/g" frontend/src/components/layout/AuthLayout.vue

# 前端 i18n
sed -i 's/Sub2API/Key2API/g' frontend/src/i18n/locales/zh.ts
sed -i 's/Sub2API/Key2API/g' frontend/src/i18n/locales/en.ts

# 前端 index.html
sed -i 's/<title>Sub2API/<title>Key2API/' frontend/index.html

# 后端 Go 文件
sed -i 's/"Sub2API"/"Key2API"/g' backend/internal/service/*.go
```
