const bcrypt = require("bcrypt");
const jwt = require("jsonwebtoken");
const sgMail = require("@sendgrid/mail");
const User = require("../models/User.model");
const SecurityModel = require("../models/Security.model");

const saltRounds = 10;

sgMail.setApiKey(process.env.SENDGRID_API_KEY);

exports.deleteUser = (req, res, next) => {
    User.findByIdAndDelete(req.payload._id)
        .then(() => {
            res.status(200).json({ message: "User deleted successfully." });
        })
        .catch((err) => next(err));
};

exports.signup = async (req, res, next) => {
    const adminEmail = "mindease@tutoripolis.com";

    try {
        const { username, name, email, password } = req.body;

        if (!name || !email || !password || !username) {
            return res
                .status(422)
                .json({ message: "Validación fallida. Todos los campos son obligatorios." });
        }

        const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]{2,}$/;
        if (!emailRegex.test(email)) {
            res.status(400).json({ message: "Ingresa un correo electrónico válido." });
            return;
        }

        const passwordRegex = /(?=.*\d)(?=.*[a-z])(?=.*[A-Z]).{6,}/;
        if (!passwordRegex.test(password)) {
            res.status(400).json({
                message:
                    "La contraseña debe tener al menos 6 caracteres y contener al menos un número, una minúscula y una letra mayúscula.",
            });
            return;
        }

        const hashedPassword = await bcrypt.hash(password, saltRounds);
        const newUser = new User({
            name,
            email,
            username,
            password: hashedPassword,
            isVerified: false,
            resetVerified: false,
        });

        await newUser.save();
        console.log(`Detalles del usuario ${name} guardados en la base de datos.`);

        const otp = Math.floor(100000 + Math.random() * 900000);
        const OTP = new SecurityModel({
            otp: otp,
            email: email,
        });

        await OTP.save();

        res.status(201).json({ message: `El OTP ${otp} se ha enviado a tu correo.` });

        await sgMail.send({
            to: email,
            from: adminEmail,
            subject: "Verificación OTP para MindEase.",
            html: `
                <p style="font-size:50px">Verificación</p>
                <p style="font-size:25px">¡Te damos la bienvenida a MindEase!</p>
                <p style="font-size:25px">Este es tu código de verificación: ${otp}</p>
            `,
        });
    } catch (error) {
        console.error(error.message);
        res.status(error.statusCode || 500).json({ message: error.message });
    }
};

exports.login = (req, res, next) => {
    const { email, password } = req.body;

    if (email === "" || password === "") {
        res.status(400).json({ message: "Ingresa un correo y una contraseña." });
        return;
    }

    User.findOne({ email })
        .then(async (foundUser) => {
            if (!foundUser) {
                res.status(401).json({ message: "Usuario no encontrado." });
                return;
            }

            const passwordCorrect = bcrypt.compareSync(password, foundUser.password);

            if (passwordCorrect) {
                const { _id, email, name } = foundUser;
                const payload = { _id, email, name };
                const authToken = jwt.sign(payload, process.env.TOKEN_SECRET, {
                    expiresIn: "6h",
                });

                res.status(200).json({
                    message: "Sesión iniciada..",
                    authToken: authToken,
                    userId: _id.toString(),
                    username: name,
                });
            } else {
                res.status(401).json({ message: "Credenciales inválidas." });
            }
        })
        .catch((err) => next(err));
};

exports.otpVerification = async (req, res, next) => {
    try {
        const receivedOTP = req.body.otp;
        const email = req.body.email;

        let user = await SecurityModel.findOne({ email: email });

        if (!user) {
            const error = new Error("Validación fallida, este usuario no existe.");
            error.statusCode = 403;
            error.data = {
                value: receivedOTP,
                message: "Correo inválido.",
                param: "otp",
                location: "otpVerification",
            };
            res.status(422).json({ message: error.data });
            throw error;
        }

        console.log(receivedOTP)

        if (user.otp !== receivedOTP) {
            const error = new Error("El OTP es erróneo");
            error.statusCode = 401;
            res.status(401).json({ message: "El OTP es erróneo " });
            error.data = {
                value: receivedOTP,
                message: "OTP incorrecto.",
                param: "otp",
                location: "otp",
            };
            throw error;
        } else {
            let userResult = await User.findOne({ email: email });

            if (!userResult) {
                const error = new Error("Validación fallida, este usuario no existe.");
                error.statusCode = 403;
                error.data = {
                    value: receivedOTP,
                    message: "Correo inválido.",
                    param: "otp",
                    location: "otpVerification",
                };
                res.status(422).json({ message: error.data });
                throw error;
            }

            userResult.isVerified = true;
            const authToken = jwt.sign(
                { email: email, userId: userResult._id },
                process.env.TOKEN_SECRET,
                {
                    algorithm: "HS256",
                    expiresIn: "6h",
                }
            );
            await userResult.save();
            const username = userResult.name;

            return res.status(200).json({
                message: "El OTP es correcto, usuario añadido",
                authToken: authToken,
                userId: userResult._id.toString(),
                username: username,
            });
        }
    } catch (error) {
        console.error(error);
        if (!error.statusCode) {
            error.statusCode = 500;
        }
        next(error);
    }
};

exports.verifyToken = (req, res, next) => {
    res.status(200).json(req.payload);
};