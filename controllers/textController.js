const Text = require('./../models/Text')

module.exports.getText = async function (req, res) {
    try {
        // Fetch Random Documents from database
        const text = await Text.getDocuments(req.headers);

        res.status(200).json({
            status: "success",
            resultSize: text.length,
            difficulty: (req.headers.difficulty || "easy"),
            data: {
                text
            }
        });
    }
    catch (err) {
        res.status(500).json({
            status: "fail",
            message: err.message,
        });
    }
}

module.exports.postText = async function (req, res) {
    try {
        // Create a new document based on the TextModel schema
        const newText = new Text(req.body); // Assuming the request body contains 'sentence' and 'difficulty' fields

        // Save the new document to the database
        const savedText = await newText.save();

        res.status(201).json(savedText); // Respond with the saved document
    } catch (error) {
        console.error('Error saving text:', error);
        res.status(500).json({
            status: "fail",
            message: err.message,
        });
    }
}