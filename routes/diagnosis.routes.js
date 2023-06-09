const express = require('express');
const router = express.Router();
const { Configuration, OpenAIApi } = require("openai");

const Message = require('../models/Message.model');

const { isAuthenticated } = require("../middleware/jwt.middleware");

const configuration = new Configuration({
  apiKey: process.env.OPEN_AI_KEY,
});
const openai = new OpenAIApi(configuration);

router.get("/diagnosis", isAuthenticated, async (req, res, next) => {
  try {
    const userId = req.payload._id;
    let messages = await Message.find({ user: userId })
      .sort({ createdAt: 1 })
      .populate("user", "username");

    if (messages.length === 0) {
      const firstMessage = await Message.create({
        text: "TherapistAi: Hi there! How can I help you today?",
        user: userId,
      });
      messages.push(firstMessage);
    }

    res.status(200).json(messages);
  } catch (error) {
    next(error);
  }
});


router.post("/diagnosis", isAuthenticated, async (req, res, next) => {
  const userId = req.payload._id;

  try {

    let history = "";
    const userMessages = await Message.find({ user: userId });
    if (userMessages !== undefined) {
      history = userMessages.reduce((accumulator, message) => {
        return accumulator + message.text + "\n";
      }, "");
    } else {
      console.log("History empty");
    }

    try {
      const order = "//Psychological diagnosis by the Therapist: ";
      const response = await openai.createCompletion({
        model: "text-davinci-003",
        prompt:
          `Elabora, a partir de la próxima conversación entre un pseudo-terapeuta y un usuario, un diagnóstico psicológico, trata de no hacerlo tan extenso, además por favor, no pongas tantos carácteres.
            ` +
          history +
          order +
          '" \n\n',
        max_tokens: 120,
        temperature: 0.5,
        top_p: 1.0,
        frequency_penalty: 0.0,
        presence_penalty: 0.0,
        stop: ["\n"],
      });

      const reply = response.data.choices[0].text;
      console.log("Respuesta de OpenAi:", reply);

      if (!reply) {
        console.warn("Respuesta vacía de OpenAi");
        return res.status(500).send("Un error ha ocurrido");
      }
      res.status(201).json(reply);
    } catch (error) {
      console.error("Un error ha ocurrido", error);
      res.status(500).send("Un error ha ocurrido");
    }
  } catch (error) {
    next(error);
  }
});

module.exports = router;