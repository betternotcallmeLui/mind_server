const DirectoryModel = require('../models/DirectoryModel');

exports.createDirectory = async (req, res) => {
    const { title, description, services, payment, address, phone, website } = req.body;

    try {
        const directory = await new DirectoryModel({
            title,
            description,
            services,
            payment,
            address,
            phone,
            website,
        });

        await directory.save();

        res.status(201).json({ success: true, message: "Directorio creado con éxito." })
    } catch (error) {
        res.status(500).json({ error: error.message });
    }
};

exports.getAllDirectories = async (req, res) => {
    try {
        const directories = await DirectoryModel.find();
        res.status(200).json(directories);
    } catch (error) {
        res.status(404).json({ error: error.message })
    }
}
