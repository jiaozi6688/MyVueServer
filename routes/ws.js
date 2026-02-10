const ws = require('ws');
const wss = new ws.Server(
    // noServer: true 表示不自动创建 HTTP 服务器
    // 这允许我们在 HTTP 服务器上监听 WebSocket 连接
    // origin: '*' 表示允许所有来源的连接
    {
        port: 1234,
        origin: '*',
    }
);
const clients = [];
// 监听 WebSocket 连接事件
wss.on('connection', ws => {
    // 将每一个连接的 WebSocket 实例添加到数组中
    clients.push(ws);
    console.log('新的WebSocket连接'); 

    // 处理收到的消息事件
    ws.on('message', (message) => {
        console.log('收到消息:', message.toString());
        // 广播消息给所有连接的客户端
        clients.forEach(client => {
            // readyState === ws.OPEN 表示连接是打开的
            if (client.readyState === ws.OPEN) {
                client.send(message.toString());
            }
        });
    });
    // auywgdja

    // 处理连接关闭事件
    ws.on('close', () => {
        console.log('WebSocket连接关闭');
    });
});

