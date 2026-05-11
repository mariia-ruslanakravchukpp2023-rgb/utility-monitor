const express = require("express");
const bcrypt = require("bcryptjs");
const User = require("../models/User");

const router = express.Router();

router.post("/register", async (req, res) => {
  try {
    const { name, email, password } = req.body;

    if (!name || !email || !password) {
      return res.status(400).json({
        message: "Заповніть всі поля"
      });
    }

    const existingUser = await User.findOne({ email });

    if (existingUser) {
      return res.status(400).json({
        message: "Користувач вже існує"
      });
    }

    const hashedPassword = await bcrypt.hash(password, 10);

    const user = new User({
      name,
      email,
      password: hashedPassword
    });

    await user.save();

    res.status(201).json({
      message: "Реєстрація успішна"
    });
  } catch (error) {
    res.status(500).json({
      message: "Помилка сервера"
    });
  }
});

router.post("/login", async (req, res) => {
  try {
    const { email, password } = req.body;

    if (!email || !password) {
      return res.status(400).json({
        message: "Заповніть всі поля"
      });
    }

    const user = await User.findOne({ email });

    if (!user) {
      return res.status(400).json({
        message: "Користувача не знайдено"
      });
    }

    const isPasswordValid = await bcrypt.compare(password, user.password);

    if (!isPasswordValid) {
      return res.status(400).json({
        message: "Неправильний пароль"
      });
    }

    req.session.user = {
      name: user.name,
      email: user.email
    };

    res.json({
      message: "Вхід успішний",
      user: req.session.user
    });
  } catch (error) {
    res.status(500).json({
      message: "Помилка сервера"
    });
  }
});

router.get("/me", (req, res) => {
  if (!req.session.user) {
    return res.status(401).json({
      message: "Користувач не авторизований"
    });
  }

  res.json({
    user: req.session.user
  });
});

router.get("/logout", (req, res) => {
  req.session.destroy(() => {
    res.redirect("/login.html");
  });
});

module.exports = router;