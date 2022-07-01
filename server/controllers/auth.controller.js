const config = require("../config/auth.config");
const sendEmail = require("../utils/sendEmail");
const db = require("../models");
const User = db.user;
const Role = db.role;
const Token = db.token;
var jwt = require("jsonwebtoken");
const crypto = require("crypto");
const EmailValidation = require('emailvalid')
var bcrypt = require("bcryptjs");
//const { userInfo } = require("os");

const ev = new EmailValidation({ allowFreemail: true,})
exports.signup = (req, res) => {

  if( !(req.body.password && req.body.password.length >= 8 && /[A-Z]+/.test(req.body.password) && /[a-z]+/.test(req.body.password) && /[0-9]+/.test(req.body.password)))
    return res.status(403).send({ message: "error.password_incorrect" })
  
  if(!ev.check(req.body.email).valid)
    return res.status(403).send({ message: "error.disposable_email" })
  
  const user = new User({
    username: req.body.username,
    email: req.body.email,
    ERC20Address: "",
    password: bcrypt.hashSync(req.body.password, 8)
  });

  if (req.body.referral) {
    User.findById(req.body.referral, (err, user_referral) => {
      if (err) {
        res.status(500).send({ message: "error.err" });
        return;
      }
      if (!user_referral)
        res.status(500).send({ message: "error.incorrect_referral" })


      if (user_referral.referral)
        user_referral.referral.push(user._id)
      else
        user_referral.referral = [user._id]

      user_referral.save((err) => {
        if (err) {
          res.status(500).send({ message: "error.err" });
          return;
        }
        console.log("Referral added")
      })
    })
  }

  user.save(async (err, user) => {
    if (err) {
      res.status(500).send({ message: "error.err" });
      return;
    }

    let resetToken = crypto.randomBytes(32).toString("hex");
    const hash = await bcrypt.hash(resetToken, 10);

    await new Token({
      userId: user._id,
      token: hash,
      type: "welcome",
      created: Date.now(),
    }).save()

    let subject = !req.body.subject ? "Sparkso - Confirm your email." : "Sparkso - " + req.body.subject;

    const link = `${config.CLIENT_URL}/confirm?token=${resetToken}${user._id}`;

    sendEmail(
      user.email,
      subject,
      {
        user: user.username,
        link: link,
        lang_en: req.body.lang === "en" || (!req.body.lang === "en" && !req.body.lang === "fr") ? true : false,
        lang_fr: req.body.lang === "fr" ? true : false,
      },
      "./template/welcome.handlebars"
    )
    res.send({ message: "success.user_registered" });
  
  });
};
exports.confirmEmail = async (req, res) => {

  if (!req.body.userId || !req.body.token || !req.body.userId.match(/^[0-9a-fA-F]{24}$/) || !req.body.token.match(/^[0-9a-fA-F]{64}$/)) {
    res.status(500).send({ message: "error.err" });
    return;
  }

  Token.findOne({
    userId: req.body.userId,
    type: "welcome"
  }).exec((err, confirmToken) => {

    if (err) {
      res.status(500).send({ message: "error.err" });
      return;
    }

    if (!confirmToken)
      return res.status(404).send({
        message: "error.token_not_found"
      })

    if (!bcrypt.compareSync(req.body.token, confirmToken.token))
      return res.status(401).send({
        message: "error.token"
      })

    User.findById(req.body.userId).exec((err, user) => {
      if (!user) {
        return res.status(404).send({ message: "error.user_not_found" });
      }
      if (err) {
        res.status(500).send({ message: "error.err" });
        return;
      }

      Role.findOne({ name: "user" }, (err, role) => {
        if (err) {
          res.status(500).send({ message: "error.err" });
          return;
        }
        user.roles = [role._id];

        user.save(err => {
          if (err) {
            res.status(500).send({ message: "error.err" });
            return;
          }
          confirmToken.deleteOne();
          res.send({ message: "success.user_email" });
        });
      })
    })


  });
}

exports.sendResetPassword = (req, res) => {
  User.findOne({
    email: req.body.email
  }, (err, user) => {
    if (err) {
      res.status(500).send({ message: "error.err" });
      return;
    }
    if (!user) {
      return res.status(404).send({ message: "error.user_not_found" });
    }

    Token.findOne({
      userId: user._id,
      type: "reset-password",
    }, async (err, token) => {
      if (err) {
        res.status(500).send({ message: "error.err" });
        return;
      }

      if (token)
        return res.status(403).send({ message: "error.token_exist" })

      let resetToken = crypto.randomBytes(32).toString("hex");
      const hash = await bcrypt.hash(resetToken, 10);

      await new Token({
        userId: user._id,
        token: hash,
        type: "reset-password",
        created: Date.now(),
      }).save()

      let subject = !req.body.subject ? "Sparkso - Reset your password." : "Sparkso - " + req.body.subject;

      const link = `${config.CLIENT_URL}/reset?token=${resetToken}${user._id}`;

      sendEmail(
        user.email,
        subject,
        {
          user: user.username,
          link: link,
          lang_en: req.body.lang === "en" || (!req.body.lang === "en" && !req.body.lang === "fr") ? true : false,
          lang_fr: req.body.lang === "fr" ? true : false,
        },
        "./template/requestResetPassword.handlebars"
      )

      res.send({ message: "success.email_sent" });
    })
  })
}

exports.resetPassword = (req, res) => {
  Token.findOne({
    userId: req.body.userId,
    type: "reset-password",
  }, (err, token) => {
    if (err) {
      res.status(500).send({ message: "error.err" });
      return;
    }
    if (!token)
      return res.status(403).send({ message: "error.token_not_found" })

    if (!bcrypt.compareSync(req.body.token, token.token))
      return res.status(401).send({ message: "error.token" })

    User.findById(req.body.userId, (err, user) => {
      if (err) {
        res.status(500).send({ message: "error.err" });
        return;
      }
      if (!user)
        return res.status(403).send({ message: "error.user_not_found" })

      if( !(req.body.password && req.body.password.length >= 8 && /[A-Z]+/.test(req.body.password) && /[a-z]+/.test(req.body.password) && /[0-9]+/.test(req.body.password)))
        return res.status(403).send({ message: "error.password_incorrect" })

      user.password = bcrypt.hashSync(req.body.password, 8)
      user.save(err => {
        if (err) {
          res.status(500).send({ message: "error.err" });
          return;
        }
        token.deleteOne();
        res.send({ message: "success.reset_password" });
      });


    })

  })
}

exports.signin = (req, res) => {
  User.findOne({
    email: req.body.email
  })
    .populate("roles", "-__v")
    .exec((err, user) => {
      if (err) {
        res.status(500).send({ message: "error.err" });
        return;
      }
      if (!user) {
        return res.status(404).send({ message: "error.user_not_found" });
      }
      var passwordIsValid = bcrypt.compareSync(
        req.body.password,
        user.password
      );
      if (!passwordIsValid) {
        return res.status(401).send({
          accessToken: null,
          message: "error.user_invalid_password"
        });
      }
      var token = jwt.sign({ id: user.id }, config.secret, {
        expiresIn: 86400 // 24 hours
      });
      var authorities = [];
      for (let i = 0; i < user.roles.length; i++) {
        authorities.push("ROLE_" + user.roles[i].name.toUpperCase());
      }
      res.status(200).send({
        id: user._id,
        username: user.username,
        email: user.email,
        roles: authorities,
        referral: user.referral,
        accessToken: token,
        message: "success.user_login"
      });
    });
};
