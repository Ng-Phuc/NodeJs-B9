let jwt = require('jsonwebtoken');
let constants = require('./constants');
var userControllers = require('../controllers/users');

module.exports = {
    check_authentication: async function (req, res, next) {
        if (!req.headers || !req.headers.authorization) {
            return next(new Error("Bạn chưa đăng nhập"));
        }
        if (!req.headers.authorization.startsWith("Bearer")) {
            return next(new Error("Bạn chưa đăng nhập"));
        }
        let token = req.headers.authorization.split(" ")[1];
        let result;
        try {
            result = jwt.verify(token, constants.SECRET_KEY);
        } catch (err) {
            return next(new Error("Token không hợp lệ hoặc đã bị giả mạo"));
        }
        if (result.expireIn <= Date.now()) {
            return next(new Error("Token hết hạn"));
        }
        try {
            let user = await userControllers.getUserById(result.id);
            if (!user) {
                return next(new Error("Không tìm thấy thông tin người dùng"));
            }
            req.user = user;
            next();
        } catch (err) {
            return next(err);
        }
    },

    check_authorization: function (roles) {
        return function (req, res, next) {
            // Giả định req.user đã có từ middleware check_authentication
            if (!req.user || !req.user.role) {
                return next(new Error("Bạn chưa đăng nhập hoặc không có quyền truy cập"));
            }
            let roleOfUser = req.user.role.name;
            if (roles.includes(roleOfUser)) {
                return next();
            } else {
                return next(new Error("Bạn không có quyền"));
            }
        };
    }
};
