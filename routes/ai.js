const express = require('express');
const router = express.Router();
const { Ollama } = require('ollama');

const ollama = new Ollama({
    host: 'http://127.0.0.1:11434'
});

router.post('/', async (req, res) => {
    await handleChatRequest(req, res);
});
router.get('/', async (req, res) => {
    await handleChatRequest(req, res);
});

async function handleChatRequest(req, res) {
    try {
        const message = req.body?.message || req.query?.message;
        console.log('收到消息:', message);
        if (!message) {
            return res.status(400).json({ code: 400, message: '缺少消息内容' });
        }

        const projectContext = `你是购物车应用的智能助手。请根据项目信息回答用户问题，并生成页面链接。

【项目页面】
- 首页 (/home) - 浏览商品
- 商品详情 (/goodsdetail) - 查看商品详情
- 购物车 (/cart) - 管理购物车
- 结算 (/jiesuan) - 订单结算
- 登录 (/login) - 用户登录
- 注册 (/register) - 新用户注册
- 个人中心 (/mycenter) - 个人信息
- 添加商品 (/addgoods) - 商家添加商品
- 新增地址 (/newaddress) - 添加收货地址
- 设置 (/setting) - 应用设置

【回答规则】

1. 用户问功能在哪里，直接给链接，
2. 链接格式：http://localhost:5173/页面路径,返回a标签，链接内容为功能名称，链接为页面路径
3. 用简洁友好的中文回答
4. 只回答购物车相关问题`;

        res.setHeader('Content-Type', 'text/event-stream; charset=utf-8');
        res.setHeader('Cache-Control', 'no-cache');
        res.setHeader('Connection', 'keep-alive');
        res.flushHeaders();

        req.on('close', () => {
            res.end();
        });

        const stream = await ollama.chat({
            model: 'qwen:0.5b',
            messages: [
                { role: 'system', content: projectContext },
                { role: 'user', content: message }
            ],
            stream: true
        });

        for await (const chunk of stream) {
            const content = chunk.message?.content || '';
            if (content) {
                res.write(`data: ${JSON.stringify({ content })}\n\n`);
            }
        }

        res.write('data: [DONE]\n\n');
        res.end();
    } catch (err) {
        console.error('AI 聊天错误:', err);
        res.end();
    }
}

router.get('/health', async (req, res) => {
    res.status(200).json({ status: 'ok' });
});

module.exports = router;
