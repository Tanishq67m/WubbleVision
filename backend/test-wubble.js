async function test() {
  const email = `test.hack.${Math.random()}@example.com`;
  console.log("Creating user...", email);
  let res = await fetch('https://api.wubble.ai/api/user', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ email, plan: 'free' })
  });
  console.log("User create:", res.status, await res.text());

  console.log("Creating API key...");
  res = await fetch('https://api.wubble.ai/api/v1/apikeys', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ email })
  });
  const data = await res.json();
  const key = data.key || data.apiKey || data.token;
  
  if (!key) return console.log("Missing key");

  console.log("Requesting chat generation...");
  res = await fetch('https://api.wubble.ai/api/v1/chat', {
    method: 'POST',
    headers: { 'Authorization': `Bearer ${key}`, 'Content-Type': 'application/json' },
    body: JSON.stringify({ prompt: "Generate an electronic music track at 120 bpm", vo: true, vocals: true })
  });
  const chatData = await res.json();
  console.log("Chat response:", chatData);

  if (!chatData.request_id) return;
  const requestId = chatData.request_id;

  for (let i=0; i<4; i++) {
     console.log(`Poll ${i+1}...`);
     res = await fetch(`https://api.wubble.ai/api/v1/polling/${requestId}`, {
       headers: { 'Authorization': `Bearer ${key}` }
     });
     const pollData = await res.json();
     console.log("Poll data:", pollData);
     if (pollData.status === 'completed' || pollData.status === 'failed') break;
     await new Promise(r => setTimeout(r, 10000));
  }
}
test().catch(console.error);
