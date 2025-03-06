import express from 'express';
import cors from 'cors';
import dotenv from 'dotenv';
import { GoogleGenerativeAI } from '@google/generative-ai';
dotenv.config();

const app = express();
const port = process.env.PORT || 3000;

app.use(cors());
app.use(express.json());

const genAI = new GoogleGenerativeAI(process.env.API_KEY);
const model = genAI.getGenerativeModel({
    model: "gemini-2.0-flash-lite",
    systemInstruction: "You are an expert content creator."
});

app.get('/api/generate-text', async (req, res) => {
    try {
        const wordLimit = parseInt(req.query.wordLimit) || 50;
        const type = req.query.type || 'story';
        const userPrompt = req.query.prompt || '';
        
        let prompt = '';
        let adjustedWordLimit = wordLimit;
        switch (type) {
            case 'vocabulary':
                adjustedWordLimit = wordLimit >= 15000 ? 500 : wordLimit / 5;
                prompt = `Generate a vocabulary list with exactly ${adjustedWordLimit} words in the following format: "word1 : definition. \n word2 : definition." and so on. 
                Choose words from IELTS Vocabulary. Provide clear, simple definitions. Provide plain text only.`;
                break;
                
            case 'gk':
                adjustedWordLimit = wordLimit >= 15000 ? 500 : wordLimit;
                prompt = `Write a short, informative passage about general knowledge with exactly ${adjustedWordLimit} words. 
                Include interesting facts about history, science, geography, or current affairs. Each fact start in a new line.
                The content should be educational, factually very accurate, and written in clear, simple language. Provide plain text only.`;
                break;
                
            case 'custom':
                adjustedWordLimit = wordLimit >= 15000 ? 500 : wordLimit;
                if (userPrompt) {
                    prompt = `Create text based on the following prompt: "${userPrompt}". 
                    The text should be approximately ${adjustedWordLimit} words long and use clear, straightforward language. Provide plain text only.`;
                } else {
                    prompt = `Write engaging content that's exactly ${adjustedWordLimit} words long in clear and simple language. Write each sample/example in new line. Provide plain text only.`;
                }
                break;
                
            case 'story':
            default:
                adjustedWordLimit = wordLimit >= 15000 ? 500 : wordLimit;
                prompt = `Write a short, engaging story with exactly ${adjustedWordLimit} words. 
                The story should captivate the reader with a compelling narrative, interesting characters, and a touch of intrigue or emotion. 
                Use vivid language and create a sense of wonder or suspense. The story should have a clear beginning, middle, and end. 
                Focus on creating an interesting and memorable experience for the reader. Write in clear and simple language. Provide plain text only.`;
                break;
        }
        
        const result = await model.generateContent({
            contents: [{
                role: 'user',
                parts: [{text: prompt}]
            }], 
            generationConfig: {
                temperature: 0.7
            }
        });
        
        const text = result.response.text();
        res.json({ text });
    } 
    catch (error) {
        console.error('Error generating text:', error);
        res.status(500).json({ error: 'Error generating text' });
    }
});

app.listen(port, () => {
    console.log(`Server running at http://localhost:${port}`);
});