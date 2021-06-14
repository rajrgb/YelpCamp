const User = require('../models/user');
module.exports.renderRegister = (req, res) => {
    res.render('users/register', { title: "Register" });
}
module.exports.register = async (req, res, next) => {
    try {
        const { username, password, email } = req.body;
        const user = new User({
            username,
            email
        })
        const registeredUser = await User.register(user, password);
        req.login(registeredUser, err => {
            if (err) return next(err);
            req.flash('success', 'Welcome to YelpCamp!');
            res.redirect('/campgrounds');
        })
    } catch (err) {
        req.flash('error', err.message);
        res.redirect('/register');
    }
}
module.exports.renderLogin = (req, res) => {
    res.render('users/login', { title: "Login" });
};
module.exports.login = (req, res) => {
    const redirectUrl = req.session.returnTo || '/campgrounds';
    delete req.session.returnTo;
    req.flash('success', 'Welcome Back!');
    res.redirect(redirectUrl);
}
module.exports.logout = (req, res) => {
    req.logout();
    req.flash('success', 'Good Bye!');
    res.redirect('/campgrounds');
}