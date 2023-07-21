const mongoose = require('mongoose');

const TextSchema = mongoose.Schema({
    sentence: {
        type: String,
        required: [true, "Sentence can't be empty"],
    },
    difficulty: {
        type: String,
        enum: ["easy", "medium", "hard"],
        default: "easy"
    }
});

TextSchema.statics.getDocuments = async function ({ difficulty, count }) {
    try {
        const randomDocuments = await this.aggregate([
            { $match: { difficulty: (difficulty || "easy") } },
            { $sample: { size: (count || 40) } },
        ]);
        const text = randomDocuments.map((document) => document.sentence).join(' ');
        return text.split(" ").map(word => word.trim()).filter(word => word !== "");
    } catch (error) {
        console.error('Error retrieving random documents:', error);
        return [];
    }
};

module.exports = mongoose.model('Text', TextSchema);