const checkRole = (role) => {
    return (req, res, next) => {
      if (!req.user) {
        return res.status(401).json({ success: false, message: "Bạn chưa đăng nhập" });
      }
      if (req.user.role && req.user.role.name === role) {
        return next();
      } else {
        return res.status(403).json({ success: false, message: "Bạn không có quyền" });
      }
    };
  };
  
  module.exports = {
    checkRole,
    // các middleware khác nếu có
  };
  