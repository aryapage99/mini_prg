const axios = require('axios');

// Replace this with your MacBook's Ethernet IP address we tested earlier
const MACBOOK_IP = process.env.MACBOOK_IP || '192.168.10.2';
const ANSWER_OLLAMA_BASE_URL = process.env.ANSWER_OLLAMA_BASE_URL || `http://${MACBOOK_IP}:11434`;
const ANSWER_OLLAMA_MODEL = process.env.ANSWER_OLLAMA_MODEL || 'llama3.1';
const OLLAMA_URL = `${ANSWER_OLLAMA_BASE_URL}/api/generate`;

const generateAnswer = async (prompt) => {
    try {
        const response = await axios.post(OLLAMA_URL, {
            model: ANSWER_OLLAMA_MODEL,
            prompt: prompt,
            stream: false
        });
        return response.data.response;
    } catch (error) {
        console.error("Error communicating with MacBook LLM:", error.message);
        throw new Error("MacBook LLM is unreachable. Ensure 'OLLAMA_HOST=0.0.0.0 ollama serve' is running.");
    }
};

module.exports = { generateAnswer };