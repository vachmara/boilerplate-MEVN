const config = require("../config/auth.config");
const sendEmail = require("../utils/sendEmail");
const db = require("../models");
const ethers = require('ethers');
const User = db.user;
const Role = db.role;
const Token = db.token;
const crypto = require("crypto");
var bcrypt = require("bcryptjs");

exports.adminBoard = (req, res) => {
  res.status(200).send("Admin Content.");
};

exports.userBoard = (req, res) => {
  User.findById(req.userId)
    .populate("roles", "-__v")
    .exec((err, user) => {
      if (err) {
        res.status(500).send({ message: "error.err" });
        return;
      }
      if (!user) {
        return res.status(404).send({ message: "error.user_not_found" });
      }
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
      });
    });
};

exports.addRole = (req, res) => {
  User.findOne({
    username: req.body.username
  }, function (err, user) {
    if (err) {
      res.status(500).send({ message: "error.err" });
      return;
    };
    if (!user) {
      res.status(401).send({ message: "error.user_not_found" });
      return;
    }
    if (req.body.role) {
      Role.findOne({
        name:
          { $in: req.body.role }
      }, (err, role) => {
        if (err) {
          res.status(500).send({ message: "error.err" });
          return;
        }
        if (user.roles.includes(role._id)) {
          res.status(401).send({ message: "error.role_already_set" });
          return;
        }
        user.roles.push(role._id);
        user.save(err => {
          if (err) {
            res.status(500).send({ message: "error.err" });
            return;
          }
          res.send({ message: "success.role_added" });
        });
      });
    }
  })
}

exports.resetEmailToken = (req, res) => {
  User.findById(req.userId, function (err, user) {
    if (err) {
      res.status(500).send({ message: "error.err" });
      return;
    };

    if (!user) {
      res.status(401).send({ message: "error.user_not_found" });
      return;
    }

    Token.findOne({
      userId: user._id,
      type: "welcome",
    }, async (err, token) => {
      if (err) {
        res.status(500).send({ message: "error.err" });
        return;
      };

      if (req.body.reset) {

        if(!token){
          token.remove(async (err) => {
            if (err) {
              res.status(500).send({ message: "error.err" });
              return;
            };
          })
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

        const link = `${config.CLIENT_URL}/confirm/${resetToken}${user._id}`;

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
        res.send({ message: "success.email_sent" })
        return;
      }
      else{

        if(!token)
          return res.send({ token: false })

        let now = Math.floor(Date.now() / 1000)
        let reset = Math.floor(new Date(token.created) / 1000) + 300
        if (reset - now <= 0) {
          token.remove((err) => {
            if (err) {
              res.status(500).send({ message: "error.err" });
              return;
            };
            res.send({ token: false })
            return
          })
        }
        else
            res.send({ token: true, timeRemaining: reset - now })
      }
    })
  })
}

exports.removeRole = (req, res) => {
  User.findOne({
    username: req.body.username
  }, function (err, user) {
    if (err) {
      res.status(500).send({ message: "error.err" });
      return;
    };
    if (!user) {
      res.status(401).send({ message: "error.user_not_found" });
      return;
    }
    if (req.body.role) {
      Role.findOne({
        name:
          { $in: req.body.role }
      }, (err, role) => {
        if (err) {
          res.status(500).send({ message: "error.err" });
          return;
        }
        if (!user.roles.includes(role._id)) {
          res.status(401).send({ message: "error.role_not_set" });
          return;
        }
        var index = user.roles.indexOf(role._id);
        if (index !== -1) {
          user.roles.splice(index, 1);
        }
        user.save(err => {
          if (err) {
            res.status(500).send({ message: "error.err" });
            return;
          }
          res.send({ message: "success.role_removed" });
        });
      });
    }
  })
}