
let currentSpot = window.SPOTS[0];
let amap = null;
let markers = [];

document.addEventListener("DOMContentLoaded", () => {
  document.getElementById("spotCount").innerText = window.SPOTS.length;
  document.getElementById("storyCount").innerText = Object.keys(window.SPOT_STORIES).length;
  document.getElementById("qrCount").innerText = window.SPOTS.length;
  document.getElementById("routeCount").innerText = window.ROUTES.length;
  selectSpot(currentSpot.id);
});

function selectSpot(id){
  const spot = window.SPOTS.find(s => s.id === id) || window.SPOTS[0];
  currentSpot = spot;
  document.getElementById("spotTitle").innerText = spot.name;
  document.getElementById("spotDesc").innerText = spot.intro + " 地址：" + spot.address;
  document.getElementById("spotTags").innerHTML = spot.tags.map(t => `<span>${t}</span>`).join("");
  if(amap){ amap.setCenter([spot.lng, spot.lat]); amap.setZoom(12); }
}

function openModal(title, html){
  document.getElementById("modalTitle").innerText = title;
  document.getElementById("modalContent").innerHTML = html;
  document.getElementById("modalMask").style.display = "flex";
}
function closeModal(){
  document.getElementById("modalMask").style.display = "none";
  if("speechSynthesis" in window) window.speechSynthesis.cancel();
}
function focusChat(){
  document.getElementById("chatPanel").scrollIntoView({behavior:"smooth", block:"center"});
  setTimeout(()=>document.getElementById("questionInput").focus(), 300);
}
function focusMap(){
  document.getElementById("mapPanel").scrollIntoView({behavior:"smooth", block:"center"});
}

function openDigitalHuman(id=currentSpot.id){
  const spot = window.SPOTS.find(s=>s.id===id) || currentSpot;
  const story = window.SPOT_STORIES[spot.id] || spot.storyShort;
  const options = window.SPOTS.map(s => `<option value="${s.id}" ${s.id===spot.id?"selected":""}>${s.name}</option>`).join("");
  openModal("AI 数字人讲解", `
    <div class="form-grid">
      <label>讲解点位
        <select id="dhSpot" onchange="openDigitalHuman(this.value)">${options}</select>
      </label>
      <label>数字人角色
        <select id="dhRole">
          <option>客家阿婆</option><option>革命先辈</option><option>红军交通员</option><option>青年讲解员</option>
        </select>
      </label>
      <label>讲解语言
        <select id="dhLang"><option value="zh-CN">普通话</option><option value="zh-CN">客家话占位</option></select>
      </label>
      <label>讲解时长
        <select><option>${spot.duration}</option></select>
      </label>
    </div>
    <div class="video-box">
      <video controls preload="metadata" onerror="this.style.display='none';this.parentNode.insertAdjacentHTML('beforeend','<div style=&quot;padding:22px;text-align:center;line-height:1.8&quot;>暂无数字人视频，请将 ${spot.video} 放入 assets/videos/ 文件夹。<br>当前可使用浏览器语音讲解。</div>')">
        <source src="${spot.video}" type="video/mp4">
      </video>
    </div>
    <div class="btn-row">
      <button class="btn btn-primary" onclick="speakText(\`${escapeTemplate(story)}\`)">播放语音讲解</button>
      <button class="btn btn-secondary" onclick="openQR('${spot.id}')">生成扫码入口</button>
      <button class="btn btn-ghost" onclick="openNavigation('${spot.id}')">一键导航</button>
    </div>
    <div class="story-text" style="margin-top:12px">${story}</div>
  `);
}

function speakText(text){
  if(!("speechSynthesis" in window)){ alert("当前浏览器不支持语音朗读"); return; }
  speechSynthesis.cancel();
  const u = new SpeechSynthesisUtterance(text);
  u.lang = "zh-CN";
  u.rate = 0.95;
  speechSynthesis.speak(u);
}

function openQR(id=currentSpot.id){
  const spot = window.SPOTS.find(s=>s.id===id) || currentSpot;
  const base = (window.APP_CONFIG && window.APP_CONFIG.HOME_URL) || location.origin + location.pathname.replace(/index\.html$/, "");
  const url = new URL("spot.html", base).toString() + `?id=${spot.id}`;
  openModal("扫码听故事", `
    <p>点位：<b>${spot.name}</b></p>
    <p>扫码后将打开对应点位详情页，展示 AI 数字人讲解、故事文本和一键导航。</p>
  <div class="qr-wrap">
  <img 
    class="qr-img"
    src="https://api.qrserver.com/v1/create-qr-code/?size=220x220&data=${encodeURIComponent(url)}"
    alt="扫码听故事二维码"
  />
  <p style="word-break:break-all">${url}</p>
</div>
    <div class="btn-row"><button class="btn btn-primary" onclick="window.open('${url}','_blank')">打开点位页面</button></div>
  `);
  
}

function openNavigation(id=currentSpot.id){
  const spot = window.SPOTS.find(s=>s.id===id) || currentSpot;
  const url = `https://uri.amap.com/marker?position=${spot.lng},${spot.lat}&name=${encodeURIComponent(spot.name)}&src=red-tour-guide&coordinate=gaode&callnative=1`;
  window.open(url, "_blank");
}

function openRoutes(){
  const html = window.ROUTES.map(r => {
    const spotNames = r.spots.map(id => window.SPOTS.find(s=>s.id===id)?.name || id).join(" → ");
    return `<div class="story-text" style="margin-bottom:12px">
      <h4 style="color:var(--deep-red);margin-bottom:8px">${r.name}</h4>
      <p><b>主题：</b>${r.theme}</p>
      <p><b>路线：</b>${spotNames}</p>
      <p>${r.desc}</p>
      <button class="btn btn-primary" onclick="showRouteOnMap('${r.id}');closeModal()">在地图上查看</button>
    </div>`;
  }).join("");
  openModal("精品文旅路线推荐", html);
}

function showRouteOnMap(routeId){
  const route = window.ROUTES.find(r => r.id === routeId);
  if(!route) return;
  const first = route.spots[0];
  selectSpot(first);
  focusMap();
  if(amap && window.AMap){
    const path = route.spots.map(id => {
      const s = window.SPOTS.find(x=>x.id===id);
      return [s.lng, s.lat];
    });
    new AMap.Polyline({ map: amap, path, strokeColor:"#b3261e", strokeWeight:6, strokeStyle:"solid" });
    amap.setFitView();
  }
}

function quickSearch(){
  const value = document.getElementById("searchInput").value.trim();
  if(!value){ focusChat(); return; }
  document.getElementById("questionInput").value = value;
  sendQuestion();
  focusChat();
}

function escapeTemplate(text){
  return String(text).replace(/`/g, "\\`").replace(/\$/g, "\\$");
}
