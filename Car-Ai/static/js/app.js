const form=document.getElementById('form');
const photos=document.getElementById('photos');
const video=document.getElementById('video');
const previews=document.getElementById('previews');
const camera=document.getElementById('camera');
const cameraView=document.getElementById('cameraView');
const cameraActions=document.getElementById('cameraActions');
const snap=document.getElementById('snap');
const stop=document.getElementById('stop');
let mediaFiles=[];
let stream=null;

function addFiles(files){
  for(const f of files){
    if(mediaFiles.length>=20) break;
    if(f.type.startsWith('image/')||f.type.startsWith('video/')) mediaFiles.push(f);
  }
  renderPreviews();
}
function renderPreviews(){
  previews.innerHTML='';
  mediaFiles.forEach(f=>{
    const url=URL.createObjectURL(f);
    const el=document.createElement(f.type.startsWith('video/')?'video':'img');
    el.src=url; el.controls=f.type.startsWith('video/');
    previews.appendChild(el);
  });
}
photos.onchange=e=>addFiles(e.target.files);
video.onchange=e=>addFiles(e.target.files);

camera.onclick=async()=>{
  try{
    stream=await navigator.mediaDevices.getUserMedia({video:{facingMode:{ideal:'environment'}},audio:false});
    cameraView.srcObject=stream; cameraView.hidden=false; cameraActions.hidden=false;
  }catch(e){alert('Camera access failed. Use Upload instead.')}
};
snap.onclick=()=>{
  const c=document.createElement('canvas');
  c.width=cameraView.videoWidth; c.height=cameraView.videoHeight;
  c.getContext('2d').drawImage(cameraView,0,0);
  c.toBlob(blob=>{
    addFiles([new File([blob],`camera-${Date.now()}.jpg`,{type:'image/jpeg'})]);
  },'image/jpeg',.92);
};
stop.onclick=()=>{
  if(stream) stream.getTracks().forEach(t=>t.stop());
  cameraView.srcObject=null; cameraView.hidden=true; cameraActions.hidden=true;
};

form.onsubmit=async e=>{
  e.preventDefault();
  if(!mediaFiles.length){alert('Add at least one photo or video.');return;}
  const fd=new FormData(form);
  mediaFiles.forEach(f=>fd.append('media',f,f.name));
  const btn=form.querySelector('.primary'); btn.disabled=true; btn.textContent='Analyzing…';
  try{
    const r=await fetch('/api/analyze',{method:'POST',body:fd});
    const data=await r.json();
    if(!r.ok) throw new Error(data.error||'Analysis failed');
    showResults(data);
  }catch(err){alert(err.message)}
  finally{btn.disabled=false;btn.textContent='Analyze with AutoWise AI →'}
};

function rupee(n){return '₹'+Math.round(n||0).toLocaleString('en-IN')}
function showResults(d){
  document.getElementById('results').hidden=false;
  document.getElementById('price').textContent=rupee(d.market.estimated_price);
  document.getElementById('range').textContent=`Expected range: ${rupee(d.market.range_low)} – ${rupee(d.market.range_high)}`;
  document.getElementById('rel').textContent=d.market.reliability+'%';
  document.getElementById('modelName').textContent=d.market.model_name;
  document.getElementById('repair').textContent=rupee(d.vision.repair_estimate);
  document.getElementById('adjustment').textContent=(d.market.damage_adjustment_pct>0?'+':'')+d.market.damage_adjustment_pct+'%';

  const mm=document.getElementById('mismatch');
  if(d.mismatch){
    mm.hidden=false;
    mm.textContent=`${d.mismatch.status}: Listed ${rupee(d.mismatch.listed_price)} vs AI market ${rupee(d.mismatch.market_price)}. Difference ${rupee(d.mismatch.difference)} (${d.mismatch.difference_pct}%).`;
  }else mm.hidden=true;

  document.getElementById('visionMsg').textContent=d.vision.message;
  const findings=document.getElementById('findings');
  const videoPrompt=document.getElementById('videoPrompt');
  if(!d.vision.findings.length){
    findings.innerHTML='<div class="finding"><span><b>No verified dents or scratches found.</b><br><small>No damage discount was applied.</small></span><span>Clear result</span></div>';
    if((d.vision.video_uploaded===false || d.vision.frames_analyzed < 2) && d.vision.model_ready){
      videoPrompt.hidden=false;
      videoPrompt.textContent='No verified visible damage was detected. Upload a clear walk-around video (front → both sides → rear → wheels → interior) to get a more complete vehicle inspection report. AutoWise cannot promise a perfect report from images alone.';
    } else {
      videoPrompt.hidden=true;
    }
  }else{
    videoPrompt.hidden=true;
    findings.innerHTML=d.vision.findings.map(f=>`<div class="finding"><span><b>${escapeHtml(f.type)}</b><br><small>Confidence ${f.confidence}%</small></span><span>Verified detection</span></div>`).join('');
  }

  document.getElementById('explain').innerHTML=(d.market.explanation||[]).map(x=>`<div class="explain"><b>${escapeHtml(x.feature)}</b><br><span class="${x.direction}">${escapeHtml(x.impact)}</span></div>`).join('') || '<div class="explain">The trained model is using the full feature set.</div>';

  const v=d.vehicle;
  const source=d.market.source==='trained_ml'?'a trained Indian-market ML model':'the deterministic baseline because the ML model has not been trained yet';
  document.getElementById('summary').textContent=`For the ${v.year} ${v.make} ${v.model}${v.variant?' '+v.variant:''}, AutoWise estimates ${rupee(d.market.estimated_price)} with an expected range of ${rupee(d.market.range_low)} to ${rupee(d.market.range_high)}. The valuation uses ${source}. ${d.market.coverage_note||''} ${d.vision.repair_estimate?`The vision system estimates roughly ${rupee(d.vision.repair_estimate)} in repair impact.`:'No verified repair adjustment was applied.'}`;
  document.getElementById('results').scrollIntoView({behavior:'smooth'});
}
function escapeHtml(s){return String(s).replace(/[&<>"']/g,m=>({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#039;'}[m]))}
