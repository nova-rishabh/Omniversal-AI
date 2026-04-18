
const { GoogleGenerativeAI } = require("@google/generative-ai");

async function checkModels() {
  const apiKey = "AIzaSyDjU_Nywc9Ohbd3m8VJFifmpu0AdNu89fM";
  if (!apiKey) {
    console.error("No API key found");
    return;
  }
  const genAI = new GoogleGenerativeAI(apiKey);
  try {
    // There isn't a direct "listModels" in the standard SDK easily accessible without the client
    // but we can try to hit an endpoint or just try a different model name.
    console.log("Testing gemini-1.5-flash...");
    const model = genAI.getGenerativeModel({ model: "gemini-1.5-flash" });
    const result = await model.generateContent("Hello");
    console.log("Success with gemini-1.5-flash");
  } catch (error) {
    console.error("Error with gemini-1.5-flash:", error.message);
  }

  try {
    console.log("Testing gemini-pro...");
    const model = genAI.getGenerativeModel({ model: "gemini-pro" });
    const result = await model.generateContent("Hello");
    console.log("Success with gemini-pro");
  } catch (error) {
    console.error("Error with gemini-pro:", error.message);
  }
}

checkModels();
