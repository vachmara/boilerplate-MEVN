const { authJwt } = require("../middlewares");
const controller = require("../controllers/user.controller");
module.exports = function(app) {
  app.use(function(req, res, next) {
    res.header(
      "Access-Control-Allow-Headers",
      "x-access-token, Origin, Content-Type, Accept"
    );
    next();
  });
 
  app.post("/api/dashboard/user", [authJwt.verifyToken], controller.userBoard);
  app.post("/api/dashboard/user/resetEmailToken", [authJwt.verifyToken], controller.resetEmailToken);
  app.get(
    "/api/dashboard/admin",
    [authJwt.verifyToken, authJwt.isAdmin],
    controller.adminBoard
  );
  app.post(
    "/api/dashboard/admin/addRole",
    [authJwt.verifyToken, authJwt.isAdmin],
    controller.addRole
  );
  app.post(
    "/api/dashboard/admin/removeRole",
    [authJwt.verifyToken, authJwt.isAdmin],
    controller.removeRole
  );
};