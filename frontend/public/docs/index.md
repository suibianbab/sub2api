# Key2API 使用文档

## 📋 基本信息

| 项目 | 内容 |
|:----|:------|
| **API 地址** | `https://key2api.com` |
| **计费说明** | 按 Token 用量计费，价格已含汇率换算 |
| **结算方式** | 人民币充值，余额扣费，**¥1 = 1 余额** |
| **价格说明** | 页面显示 `$` 仅作为价格格式，实际扣的是人民币余额 |
| **新用户赠送** | 注册即送 **¥1** 体验金 |

---

## 🚀 快速开始

### 第一步：注册账号

1. 访问 [https://key2api.com](https://key2api.com) 注册账号
2. 验证邮箱后登录

### 第二步：充值

1. 登录后点击左侧菜单 **充值**
2. 选择金额，使用支付宝扫码付款
3. 充值成功后余额自动到账

### 第三步：创建 API Key

1. 点击左侧菜单 **API 密钥**
2. 点击 **创建密钥**
3. 复制密钥并保存（关闭后不再显示完整密钥）

### 第四步：调用 API

Key2API 兼容 **OpenAI、Claude、Gemini** 的接口格式，可直接替换使用。

---

## 💻 调用示例

### OpenAI 兼容接口

```bash
curl https://key2api.com/v1/chat/completions \
  -H "Content-Type: application/json" \
  -H "Authorization: Bearer sk-你的密钥" \
  -d '{
    "model": "gpt-4o",
    "messages": [{"role": "user", "content": "你好"}]
  }'
```

### Python

```python
from openai import OpenAI

client = OpenAI(
    api_key="sk-你的密钥",
    base_url="https://key2api.com"
)

response = client.chat.completions.create(
    model="gpt-4o",
    messages=[{"role": "user", "content": "你好"}]
)
print(response.choices[0].message.content)
```

### JavaScript / Node.js

```javascript
import OpenAI from 'openai';

const client = new OpenAI({
  apiKey: 'sk-你的密钥',
  baseURL: 'https://key2api.com'
});

const response = await client.chat.completions.create({
  model: 'gpt-4o',
  messages: [{ role: 'user', content: '你好' }]
});

console.log(response.choices[0].message.content);
```

### Claude API

```bash
curl https://key2api.com/v1/messages \
  -H "Content-Type: application/json" \
  -H "x-api-key: sk-你的密钥" \
  -d '{
    "model": "claude-sonnet-4-20250514",
    "max_tokens": 1024,
    "messages": [{"role": "user", "content": "你好"}]
  }'
```

### Gemini API

```bash
curl https://key2api.com/v1/models/gemini-2.5-pro:generateContent \
  -H "Content-Type: application/json" \
  -H "x-goog-api-key: sk-你的密钥" \
  -d '{
    "contents": [{"parts":[{"text": "你好"}]}]
  }'
```

---

## 📊 定价说明

### 理解价格

页面显示的 `$0.5` 只是格式，**实际扣的是你的人⺠币余额**，1:1 对应。`$0.5` = 余额扣 **¥0.5**。

### 计算示例：GPT-4o

一次对话，输入 1,000 tokens，输出 2,000 tokens：

| 项目 | 费用 |
|:----|:----:|
| 输入（1,000 tokens） | $0.025 |
| 输出（2,000 tokens） | $0.200 |
| **合计扣费** | **$0.225 → ¥0.225（两毛二）** |

> 注册送 ¥1 体验金，大约可以用 **4 次**。日常聊天一次仅几毛钱。

### 常见模型价格参考

以下是各模型**每百万 Token** 的价格（已含所有费用）：

| 模型 | 输入 (/1M) | 输出 (/1M) |
|:----|:---------:|:----------:|
| **GPT-4o** | $25.00 | $100.00 |
| **GPT-4o-mini** | $1.50 | $6.00 |
| **Claude Sonnet 4** | $30.00 | $150.00 |
| **Gemini 2.5 Pro** | $12.50 | $100.00 |
| **DeepSeek V3** | $2.80 | $4.20 |

> 实际价格以登录后 **可用渠道** 页面显示的为准。

### 其他计费方式

- **缓存计费**：部分模型（如 Claude）支持缓存，按比例计费
- **按次计费**：部分模型按请求次数计费，页面有标注

---

## 🔧 常用功能

### 查看用量

左侧菜单 **用量统计** → 可查看每日/每模型的详细用量和扣费明细。

### 查看订单

左侧菜单 **订单记录** → 查看充值记录和退款申请。

### 可用渠道

左侧菜单 **可用渠道** → 查看你所有可用的模型和定价信息（鼠标悬停模型名查看详情）。

---

## ❓ 常见问题

### Q: 页面显示 $ 但扣的是人民币？

**A:** 页面显示 `$` 只是价格格式，实际扣的是你的人民币余额，1:1 对应。`$0.5` = 余额扣 ¥0.5。

### Q: 这个价格怎么算的？

### Q: 支持哪些模型？

**A:** 登录后点击 **可用渠道** 查看全部支持的模型列表，持续更新中。

### Q: API Key 丢了怎么办？

**A:** 在 **API 密钥** 页面删除旧密钥，重新创建新密钥即可。

### Q: 如何申请退款？

**A:** 在 **订单记录** 中找到已支付订单，点击 **申请退款** 并填写原因，管理员审核后处理。

### Q: 余额不足怎么办？

**A:** 余额低于 ¥10 时系统会发送邮件提醒，请及时充值以免服务中断。

### Q: 充值后多久到账？

**A:** 支付宝扫码支付成功后，通常 **几秒钟内** 自动到账。如果长时间未到账，请联系客服。

### Q: 页面显示的价格是最终价格吗？

**A:** 是的，**可用渠道** 中鼠标悬停模型名看到的定价就是最终扣费价格。

---

## 📞 联系我们

- **邮箱**: key2api@163.com

---

*文档版本: v2.0 · 最后更新: 2026-06-04*
