const API_KEYS = [
    process.env.API_KEY_0,
    process.env.API_KEY_1,
]

export const getApiKey = () => {
    const apiKey = API_KEYS[Math.floor(Math.random() * API_KEYS.length)];
    if (!apiKey) {
        throw new Error("API key not found");
    }
    return apiKey;
}