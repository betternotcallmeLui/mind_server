const express = require('express');
const router = express.Router();
const { Configuration, OpenAIApi } = require("openai");

const Message = require('../models/Message.model');
const { isAuthenticated } = require("../middleware/jwt.middleware");

const configuration = new Configuration({
  apiKey: process.env.OPEN_AI_KEY,
});
const openai = new OpenAIApi(configuration);

router.get("/messages", isAuthenticated, async (req, res, next) => {
  try {
    const userId = req.payload._id;
    let messages = await Message.find({ user: userId })
      .sort({ createdAt: 1 })
      .populate("user", "username");

    if (messages.length === 0) {
      const firstMessage = await Message.create({
        text: "MindBot: ¡Hola! ¿Cómo puedo ayudarte hoy?",
        user: userId,
      });
      messages.push(firstMessage);
    }

    res.status(200).json(messages);
  } catch (error) {
    next(error);
  }
});

router.delete("/messages", isAuthenticated, async (req, res, next) => {
  try {
    const userId = req.payload._id;
    await Message.deleteMany({ user: userId });
    res.status(200).json({ message: "Los mensajes fueron eliminados de forma correcta." });
  } catch (error) {
    next(error);
  }
});

router.post("/messages", isAuthenticated, async (req, res, next) => {
  const { text } = req.body;
  const userId = req.payload._id;

  try {
    const newMessage = await Message.create({ text: "Paciente: " + text, user: userId });

    let history = "";
    const userMessages = await Message.find({ user: userId });
    if (userMessages !== undefined) {
      history = userMessages.reduce((accumulator, message) => {
        return accumulator + message.text + "\n";
      }, "");
    } else {
      console.log("El historial está vacío");
    }

    try { 
      const response = await openai.createCompletion({
        model: "text-davinci-003",
        prompt:
          `Imagina una conversación entre un terapeuta (llamado "MindBot") y un paciente. Yo proporcionaré el diálogo del paciente y tú solo proporcionarás el diálogo del terapeuta, actuando como una persona que escucha, un amigo que te aconseja. No completes el diálogo del paciente. Crea solo el diálogo para el terapeuta teniendo en cuenta la respuesta y la información del paciente. Si el paciente muestra algún comportamiento perjudicial, por favor aconseja al paciente buscar ayuda profesional real. Si el paciente te pide que respondas con más de 256 caracteres, no puedes hacerlo. Siempre responde en menos de 256 caracteres. Más que un terapeuta, quiero que le hagas como de una especie de amigo que te ayuda, te aconseja, pero no tanto como un terapeuta que sólo te pregunta cosas, trata de no sobrepreguntar las cosas, pregunta de vez en cuando, pero muy de vez en cuando, si en el historial dado te encuentras con preguntas, no las repitas, trata de evitarlas.
          ` +
          history +
          newMessage.text +
          '" \n\n',
        max_tokens: 120,
        temperature: 0.5,
        top_p: 1.0,
        frequency_penalty: 0.0,
        presence_penalty: 0.0,
        stop: ["\n"],
      });

      const reply = response.data.choices[0].text;
      console.log("Respuesta de OpenAI:", reply);

      if (!reply) {
        console.warn("Respuesta vacía de OpenAI");
        return res.status(500).send("Un error ha ocurrido.");
      }

      await Message.create({ text: reply, user: userId });

      res.status(201).json(reply);
    } catch (error) {
      console.error("Un error ha ocurrido.", error);
      res.status(500).send("Un error ha ocurrido.");
    }
  } catch (error) {
    next(error);
  }
});

module.exports = router;