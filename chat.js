
async function sendQuestion(){
  const input = document.getElementById("questionInput");
  const question = input.value.trim();
  if(!question) return;
  addMessage(question, "user");
  input.value = "";
  addMessage("正在检索本地知识库并调用 AI 服务……", "bot", "loading-msg");

  try{
    const answer = await askAI(question);
    removeLoading();
    addMessage(answer, "bot");
  }catch(err){
    removeLoading();
    addMessage(localAnswer(question), "bot");
  }
}

async function askAI(question){
  const cfg = window.APP_CONFIG || {};
  if(!cfg.API_BASE_URL){
    return localAnswer(question);
  }
  const res = await fetch(`${cfg.API_BASE_URL.replace(/\/$/, "")}/api/chat`, {
    method:"POST",
    headers:{ "Content-Type":"application/json" },
    body: JSON.stringify({
      question,
      currentSpotId: currentSpot?.id || "",
      knowledge: window.KNOWLEDGE,
      spots: window.SPOTS
    })
  });
  if(!res.ok) throw new Error("AI 接口异常");
  const data = await res.json();
  return data.answer || localAnswer(question);
}

function localAnswer(question){
  const q = question.toLowerCase();
  const matched = window.KNOWLEDGE.find(item => item.keywords.some(k => q.includes(String(k).toLowerCase())));
  if(matched) return "【本地知识库】" + matched.a;
  const spot = window.SPOTS.find(s => q.includes(s.name.toLowerCase()) || s.tags.some(t => q.includes(t.toLowerCase())));
  if(spot) return `【本地知识库】${spot.name}位于${spot.address}。${spot.intro} ${window.SPOT_STORIES[spot.id] || spot.storyShort}`;
  return "【本地知识库】我已收到你的问题。当前演示版可回答红色遗址、客家文化、扫码听故事、AI 数字人、地图导航等内容；正式版会调用后端大模型接口并结合知识库生成更完整的答案。";
}

function addMessage(text, type, id){
  const chat = document.getElementById("chatWindow");
  const div = document.createElement("div");
  div.className = `msg ${type}`;
  if(id) div.id = id;
  div.innerText = text;
  chat.appendChild(div);
  chat.scrollTop = chat.scrollHeight;
}
function removeLoading(){
  const node = document.getElementById("loading-msg");
  if(node) node.remove();
}
document.getElementById("questionInput").addEventListener("keydown", e => { if(e.key==="Enter") sendQuestion(); });
document.getElementById("searchInput").addEventListener("keydown", e => { if(e.key==="Enter") quickSearch(); });
