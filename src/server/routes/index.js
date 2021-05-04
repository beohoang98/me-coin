const { Router } = require("express");

const route = new Router({ mergeParams: true });

route.get("/", (req, res) => {
  return res.render("index");
});
route.get("/history", (req, res) => {
  return res.render("history");
});
route.get("/send-coin", (req, res) => {
  return res.render("send-coin");
});


module.exports = route;
