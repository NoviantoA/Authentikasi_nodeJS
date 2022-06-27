module.exports = {
  ensureAuthenticated: function (req, res, next) {
    if (req.isAuthenticated()) {
      return next();
    }
    req.flash("error_msg", "Tolong login terlebih dahulu untuk melihat sumber");
    res.redirect("/users/login");
  },
};
