
(function initMapLoader(){
  const cfg = window.APP_CONFIG || {};
  if(!cfg.AMAP_KEY || cfg.AMAP_KEY.includes("YOUR_") || cfg.AMAP_KEY.includes("请填写")){
    renderFallbackMap();
    return;
  }
  window._AMapSecurityConfig = { securityJsCode: cfg.AMAP_SECURITY_CODE };
  const script = document.createElement("script");
  script.src = `https://webapi.amap.com/maps?v=2.0&key=${encodeURIComponent(cfg.AMAP_KEY)}`;
  script.onload = initAMap;
  script.onerror = renderFallbackMap;
  document.head.appendChild(script);
})();

function initAMap(){
  try{
    document.getElementById("fallbackMap").style.display = "none";
    amap = new AMap.Map("map", {
      zoom: 10.6,
      center: [115.58, 23.31],
      viewMode: "2D",
      mapStyle: "amap://styles/normal"
    });

    markers = window.SPOTS.map(spot => {
      const marker = new AMap.Marker({
        position: [spot.lng, spot.lat],
        title: spot.name,
        label: { content: spot.type, direction: "top" }
      });
      marker.on("click", () => selectSpot(spot.id));
      amap.add(marker);
      return marker;
    });

    const path = window.SPOTS.map(s => [s.lng, s.lat]);
    new AMap.Polyline({ map: amap, path, strokeColor:"#b3261e", strokeWeight:5, strokeOpacity:.75, strokeStyle:"dashed" });
    amap.setFitView();
  }catch(e){
    console.error(e);
    renderFallbackMap();
  }
}

function renderFallbackMap(){
  const box = document.getElementById("fallbackMap");
  if(!box) return;
  box.style.display = "grid";
  box.innerHTML = window.SPOTS.map((s, idx) => `
    <button class="fallback-pin" onclick="selectSpot('${s.id}')">
      <strong>${idx+1}. ${s.name}</strong>
      <span>${s.type}｜${s.address}</span>
    </button>
  `).join("");
}
