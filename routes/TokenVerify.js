const express = require('express');
const router = express.Router();
const userStatus = require('../models/userstatus.js');
const { VerifyToken } = require('../midfile/jwtMIddleWare.js');

router.post('/', VerifyToken, async (req, res, next) => {
    try {
        const token = req.body.token;
        console.log('TokenVerify token:', token);
        
        if (!token) {
            return res.status(400).json({
                message: 'token不能为空',
                code: 400
            });
        }
    } catch (error) {
        console.error('TokenVerify错误:', error);
        return res.status(500).json({
            message: '服务器错误',
            code: 500
        });
    }
});

module.exports = router;