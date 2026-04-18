
async function listModels() {
  const apiKey = "AIzaSyDjU_Nywc9Ohbd3m8VJFifmpu0AdNu89fM";
  const url = `https://generativelanguage.googleapis.com/v1/models?key=${apiKey}`;
  
  try {
    const response = await fetch(url);
    const data = await response.json();
    console.log("List Models Response Status:", response.status);
    console.log("Models:", JSON.stringify(data, null, 2));
  } catch (error) {
    console.error("List Models Error:", error.message);
  }
}

listModels();
