const escape = (value) => String(value ?? "").replace(/[&<>"']/g, (character) => ({ "&": "&amp;", "<": "&lt;", ">": "&gt;", '"': "&quot;", "'": "&#39;" })[character]);

export function renderDijiangLoader(projectName, en, instrument) {
  return `<div class="loader loader--field" role="status" aria-label="${en ? "Opening local report" : "打开本地报告"}">
    <section class="field-loader-sheet">
      <canvas class="ed-contours" aria-hidden="true"></canvas>
      <header class="field-loader-mast"><span class="field-loader-id">DSH / DIJIANG</span><span class="field-loader-project">${escape(projectName)}</span></header>
      <div class="field-loader-center"><div class="field-loader-copy"><span class="field-loader-kicker">${en ? "LOCAL EVIDENCE / REPORT ACCESS" : "本地凭据 / 报告接入"}</span><strong>${en ? "EVIDENCE\nONLINE" : "证据接入"}</strong><p>${en ? "Dijiang / Opening the retained delivery record" : "终末地帝江号 / 正在打开交付档案"}</p></div>${instrument.replace("D-0017", "DIJIANG").replace("LINK / 04", "LOCAL")}</div>
      <footer class="field-loader-statusbar"><div class="field-loader-readout"><span class="field-loader-status" data-loader-status>${en ? "Opening local report" : "打开本地报告"}</span><b data-loader-percent>00%</b></div><i class="field-loader-progress"><em data-loader-fill></em></i><div class="field-loader-stages" aria-hidden="true"><b>01 / LOCAL</b><b>02 / RECORDS</b><b>03 / DISPLAY</b></div></footer>
    </section><div class="field-loader-topband" aria-hidden="true"></div>
  </div>`;
}

export function readDijiangPreferences(embedded, readStored) {
  const prefs = { palette: "light", accent: "yellow", background: true, motion: true, fps: 24, speed: 1 };
  const sources = [embedded];
  try { sources.push(readStored()); } catch { /* Offline files may not have access to storage. */ }
  for (const source of sources) {
    try {
      const saved = JSON.parse(source || "{}");
      if (!saved || typeof saved !== "object" || Array.isArray(saved)) continue;
      if (["light", "dark"].includes(saved.palette)) prefs.palette = saved.palette;
      if (["yellow", "cyan"].includes(saved.accent)) prefs.accent = saved.accent;
      if (typeof saved.background === "boolean") prefs.background = saved.background;
      if (typeof saved.motion === "boolean") prefs.motion = saved.motion;
      if ([24,60,120].includes(saved.fps)) prefs.fps = saved.fps;
      if ([.5,1,1.5,2].includes(saved.speed)) prefs.speed = saved.speed;
    } catch { /* A corrupt preference does not invalidate the report. */ }
  }
  return prefs;
}

// Embedded in the exported HTML: no runtime, CDN or network access is required.
export const dijiangMotionScript = `(()=>{
  const root=document.documentElement;
  const key='dijiang-presentation-v1';
  const prefs=(${readDijiangPreferences.toString()})(root.dataset.edPreferences,()=>localStorage.getItem(key));
  if(new URLSearchParams(location.search).get('motion')==='accessible')prefs.motion=false;
  let redraw=()=>{};
  function apply(persist=false){
    root.dataset.edPalette=prefs.palette;root.dataset.edAccent=prefs.accent;root.dataset.dijiangMotion=prefs.motion?'full':'accessible';root.dataset.edPreferences=JSON.stringify(prefs);
    document.querySelectorAll('[data-ed-pref]').forEach(input=>{const name=input.dataset.edPref;if(input.type==='radio')input.checked=input.value===prefs[name];else if(input.type==='checkbox')input.checked=prefs[name];else input.value=String(prefs[name]);if(name==='fps'||name==='speed')input.disabled=!prefs.background||!prefs.motion});
    const speed=document.querySelector('[data-ed-speed-output]');if(speed)speed.value=prefs.speed+'x';
    if(persist)try{localStorage.setItem(key,JSON.stringify(prefs))}catch{}
    redraw();
  }
  apply();
  document.querySelectorAll('[data-ed-pref]').forEach(input=>input.addEventListener('input',()=>{const name=input.dataset.edPref;prefs[name]=input.type==='checkbox'?input.checked:['fps','speed'].includes(name)?Number(input.value):input.value;apply(true)}));
  const settings=document.querySelector('.ed-settings');
  document.addEventListener('click',event=>{if(settings&&!settings.contains(event.target))settings.open=false});
  document.addEventListener('keydown',event=>{if(event.key==='Escape'&&settings?.open){settings.open=false;settings.querySelector('summary').focus()}});

  // Trace terrain isolines once per size or palette; animate only the raster offset.
  const fields=[...document.querySelectorAll('canvas.ed-contours')].map(canvas=>({canvas,buffer:document.createElement('canvas'),visible:true,width:0,height:0}));
  function prepare(field){
    const {canvas,buffer}=field,box=canvas.getBoundingClientRect();
    const scale=Math.min(devicePixelRatio||1,1.5);field.width=Math.max(1,Math.round(box.width*scale));field.height=Math.max(1,Math.round(box.height*scale));
    canvas.width=field.width;canvas.height=field.height;buffer.width=field.width+96;buffer.height=field.height+96;
    const ctx=buffer.getContext('2d');if(!ctx)return;
    ctx.strokeStyle=getComputedStyle(canvas).getPropertyValue('--contour').trim();
    const step=6*scale,cols=Math.ceil(buffer.width/step),rows=Math.ceil(buffer.height/step);
    const values=Array.from({length:rows+1},(_,j)=>Array.from({length:cols+1},(_,i)=>{
      const x=i/cols*2,y=j/rows;
      return .58*x-.72*y+.36*Math.sin(x*3.8+y*2.6)+.12*Math.cos(x*7.3-y*3.5)+.06*Math.sin(x*10.5+y*7.4);
    }));
    const paths=Array.from({length:97},()=>new Path2D());
    for(let j=0;j<rows;j++)for(let i=0;i<cols;i++){
      const corners=[[i*step,j*step,values[j][i]],[(i+1)*step,j*step,values[j][i+1]],[(i+1)*step,(j+1)*step,values[j+1][i+1]],[i*step,(j+1)*step,values[j+1][i]]];
      const low=Math.max(-32,Math.ceil(Math.min(...corners.map(c=>c[2]))/.026)),high=Math.min(64,Math.floor(Math.max(...corners.map(c=>c[2]))/.026));
      for(let level=low;level<=high;level++){
        const height=level*.026,hits=[],path=paths[level+32];
        for(let edge=0;edge<4;edge++){
          const a=corners[edge],b=corners[(edge+1)%4];
          if((a[2]<height)===(b[2]<height))continue;
          const t=(height-a[2])/(b[2]-a[2]);hits.push([a[0]+(b[0]-a[0])*t,a[1]+(b[1]-a[1])*t]);
        }
        for(let n=0;n+1<hits.length;n+=2){path.moveTo(...hits[n]);path.lineTo(...hits[n+1])}
      }
    }
    paths.forEach((path,index)=>{ctx.lineWidth=((index-32)%5===0?1:.5)*scale;ctx.stroke(path)});
    paint(field,0);
  }
  function paint(field,phase){const ctx=field.canvas.getContext('2d');if(!ctx)return;ctx.clearRect(0,0,field.width,field.height);ctx.drawImage(field.buffer,-48+Math.sin(phase)*16,-48+Math.cos(phase*.7)*12)}
  let frame=0,last=0,phase=0;
  function tick(now){frame=0;if(document.hidden||!prefs.background||!prefs.motion)return;const interval=1000/prefs.fps;if(now-last>=interval){phase+=Math.min(100,now-(last||now))*.00004*prefs.speed;last=now;fields.forEach(field=>{if(field.visible&&field.canvas.isConnected)paint(field,phase)})}if(fields.some(field=>field.visible&&field.canvas.isConnected))frame=requestAnimationFrame(tick)}
  function start(){if(frame)cancelAnimationFrame(frame);frame=0;last=0;if(!document.hidden&&prefs.background&&prefs.motion&&fields.some(field=>field.visible&&field.canvas.isConnected))frame=requestAnimationFrame(tick)}
  redraw=()=>{fields.forEach(field=>{if(field.canvas.isConnected)prepare(field)});start()};
  const observer=typeof IntersectionObserver==='function'?new IntersectionObserver(entries=>{for(const entry of entries){const field=fields.find(item=>item.canvas===entry.target);if(field)field.visible=entry.isIntersecting}start()}):null;
  fields.forEach(field=>observer?.observe(field.canvas));
  const resize=typeof ResizeObserver==='function'?new ResizeObserver(()=>redraw()):null;fields.forEach(field=>resize?.observe(field.canvas));if(!resize)addEventListener('resize',redraw);
  document.addEventListener('visibilitychange',start);addEventListener('pagehide',()=>{cancelAnimationFrame(frame);observer?.disconnect();resize?.disconnect()});addEventListener('pageshow',event=>{if(event.persisted){fields.forEach(field=>{if(field.canvas.isConnected){observer?.observe(field.canvas);resize?.observe(field.canvas)}});redraw()}else start()});redraw();

  const loader=document.querySelector('.loader');
  if(!loader){root.dataset.loaderReady='true';return}
  root.dataset.loaderReady='false';loader.dataset.dijiangMotion=root.dataset.dijiangMotion;loader.setAttribute('aria-busy','true');
  const en=root.lang==='en',began=performance.now();let finished=false,progressFrame=0;
  function progress(now){if(finished)return;const value=Math.min(1,(now-began)/1550);loader.querySelector('[data-loader-fill]').style.transform='scaleX('+value+')';loader.querySelector('[data-loader-percent]').textContent=String(Math.round(value*100)).padStart(2,'0')+'%';loader.querySelector('[data-loader-status]').textContent=(en?['Opening local report','Preparing retained records','Preparing the display','Report available']:['打开本地报告','整理已保存记录','准备显示界面','报告可供查看'])[Math.min(3,Math.floor(value*4))];if(value<1)progressFrame=requestAnimationFrame(progress)}
  function remove(){if(finished)return;finished=true;cancelAnimationFrame(progressFrame);loader.setAttribute('aria-busy','false');root.dataset.loaderReady='true';fields.filter(field=>loader.contains(field.canvas)).forEach(field=>{observer?.unobserve(field.canvas);resize?.unobserve(field.canvas);field.visible=false});loader.remove();start()}
  function onExit(event){if(event.target===loader){loader.removeEventListener('animationend',onExit);remove()}}
  loader.addEventListener('animationend',onExit);progressFrame=requestAnimationFrame(progress);setTimeout(remove,prefs.motion?2900:180);
})()`;
