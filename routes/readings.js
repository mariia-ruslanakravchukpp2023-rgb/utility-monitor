const express = require("express");
const Reading = require("../models/Reading");

const router = express.Router();

router.post("/", async (req, res) => {
  try {
    const { userEmail, type, value, price } = req.body;

    if (!userEmail || !type || !value || !price) {
      return res.status(400).json({
        message: "Заповніть всі поля"
      });
    }

    const totalCost = Number(value) * Number(price);

    const reading = new Reading({
      userEmail,
      type,
      value,
      price,
      totalCost
    });

    await reading.save();

    res.status(201).json({
      message: "Показник додано",
      reading
    });
  } catch (error) {
    res.status(500).json({
      message: "Помилка додавання показника"
    });
  }
});

router.get("/:email", async (req, res) => {
  try {
    const readings = await Reading.find({
      userEmail: req.params.email
    }).sort({
      date: -1
    });

    res.json(readings);
  } catch (error) {
    res.status(500).json({
      message: "Помилка отримання даних"
    });
  }
});

router.delete("/:id", async (req, res) => {
  try {
    await Reading.findByIdAndDelete(req.params.id);

    res.json({
      message: "Запис видалено"
    });
  } catch (error) {
    res.status(500).json({
      message: "Помилка видалення"
    });
  }
});

module.exports = router;