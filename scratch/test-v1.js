
async function testV1() {
  const apiKey = "AIzaSyDjU_Nywc9Ohbd3m8VJFifmpu0AdNu89fM";
  const url = `https://generativelanguage.googleapis.com/v1/models/gemini-1.5-flash:generateContent?key=${apiKey}`;
  
  try {
    const response = await fetch(url, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        contents: [{ parts: [{ text: "Hello" }] }]
      })
    });
    
    const data = await response.json();
    console.log("V1 Response Status:", response.status);
    console.log("V1 Response Data:", JSON.stringify(data, null, 2));
  } catch (error) {
    console.error("V1 Error:", error.message);
  }
}

testV1();
