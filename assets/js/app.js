const SERVICES=[{id:'bath',n:'อาบน้ำ',p:300},{id:'cut',n:'ตัดขน',p:500},{id:'nail',n:'ตัดเล็บ',p:80},{id:'ear',n:'ทำความสะอาดหู',p:80},{id:'spa',n:'สปาบำรุงขน',p:250}];
const STYLES=['ตัดเล็มเล็กน้อย','ทรงเทดดี้แบร์','ทรงซัมเมอร์คัท','ทรงสิงโต','ทรงพุดเดิ้ล','ทรงเกาหลี','ตามรูป Reference'];
const ST=[['booked','จองแล้ว'],['grooming','กำลังทำ'],['done','เสร็จแล้ว รอรับ'],['closed','รับกลับแล้ว']];
const stName=k=>ST.find(s=>s[0]==k)[1];
const ICON={dog:'🐶',cat:'🐱',other:'🐰'};
const today=()=>{const d=new Date();return d.getFullYear()+'-'+String(d.getMonth()+1).padStart(2,'0')+'-'+String(d.getDate()).padStart(2,'0')};
const uid=()=>Math.random().toString(36).slice(2,9);
const baht=n=>'฿'+Number(n).toLocaleString('th-TH');
const esc=s=>String(s??'').replace(/[&<>"]/g,c=>({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;'}[c]));

function seed(){return{
 customers:[
  {id:'c1',name:'คุณมินตรา',phone:'081-234-5678',pets:[{id:'p1',name:'ข้าวปั้น',type:'dog',breed:'ชิสุ',note:'ขี้กลัวเสียงไดร์'}]},
  {id:'c2',name:'คุณธนกร',phone:'089-876-5432',pets:[{id:'p2',name:'มะลิ',type:'cat',breed:'เปอร์เซีย',note:''},{id:'p3',name:'โมจิ',type:'dog',breed:'ปอมเมอเรเนียน',note:'แพ้แชมพูกลิ่นแรง'}]}],
 bookings:[
  {id:'b1',cid:'c1',pid:'p1',date:today(),time:'10:00',svc:['bath','cut'],style:'ทรงเทดดี้แบร์',brief:'เก็บหน้ากลมๆ ขนหูยาวไว้นิดนึง',photo:'',status:'grooming',paid:false},
  {id:'b2',cid:'c2',pid:'p3',date:today(),time:'13:00',svc:['bath','nail'],style:'ตัดเล็มเล็กน้อย',brief:'',photo:'',status:'booked',paid:false},
  {id:'b3',cid:'c2',pid:'p2',date:today(),time:'09:00',svc:['bath','spa'],style:'ตัดเล็มเล็กน้อย',brief:'ขนพันกันบริเวณคอ',photo:'',status:'done',paid:false}],
 notifs:[],sales:[]}}
let S;try{S=JSON.parse(localStorage.getItem('bubblepaws')||'null')}catch(e){}
S=S||seed();
const save=()=>{try{localStorage.setItem('bubblepaws',JSON.stringify(S))}catch(e){}};
let view='dash',posSel=null,draftPhoto='';

const cust=id=>S.customers.find(c=>c.id==id);
const pet=(cid,pid)=>(cust(cid)?.pets||[]).find(p=>p.id==pid)||{name:'?',type:'other'};
const price=b=>b.svc.reduce((a,id)=>a+SERVICES.find(s=>s.id==id).p,0);
const svcNames=b=>b.svc.map(id=>SERVICES.find(s=>s.id==id).n).join(' + ');
function toast(t){const e=document.getElementById('toast');e.textContent=t;e.style.display='block';e.className='show';clearTimeout(toast.t);toast.t=setTimeout(()=>e.style.display='none',3600)}

/* ---------- nav ---------- */
const NAV=[['dash','📊','แดชบอร์ด'],['queue','✂️','คิวช่าง'],['book','📅','จองคิว'],['cust','🐾','ลูกค้า'],['pos','💳','ชำระเงิน']];
function drawNav(){
 const wait=S.bookings.filter(b=>b.status=='done').length;
 document.getElementById('nav').innerHTML='<div class="logo">🫧 Bubble Paws<small>ระบบจัดการร้านกรูมมิ่ง</small></div>'+
 NAV.map(n=>`<button data-v="${n[0]}" class="${view==n[0]?'on':''}"><span class="ic">${n[1]}</span>${n[2]}${n[0]=='pos'&&wait?`<span class="badge">${wait}</span>`:''}</button>`).join('');
 document.querySelectorAll('nav button').forEach(b=>b.onclick=()=>go(b.dataset.v));
}
function go(v){view=v;render()}
function render(){drawNav();const m=document.getElementById('main');m.innerHTML=({dash,queue,book,custV,pos})[view=='cust'?'custV':view]();bind();window.scrollTo(0,0)}

/* ---------- dashboard ---------- */
function dash(){
 const t=today(),bs=S.bookings.filter(b=>b.date==t);
 const rev=S.sales.filter(s=>s.date==t).reduce((a,s)=>a+s.total,0);
 const cnt=k=>S.bookings.filter(b=>b.status==k).length;
 const next=[...S.bookings].filter(b=>b.status!='closed').sort((a,b)=>(a.date+a.time).localeCompare(b.date+b.time));
 return`<h1>สวัสดี 👋 วันนี้ร้านเป็นยังไงบ้าง</h1><p class="sub">ภาพรวมของร้านวันนี้</p>
 <div class="grid stats">
  <div class="card stat hot"><b>${bs.length}</b><span>คิววันนี้</span></div>
  <div class="card stat"><b>${cnt('grooming')}</b><span>กำลังกรูมมิ่ง</span></div>
  <div class="card stat"><b>${cnt('done')}</b><span>รอชำระเงิน / รับกลับ</span></div>
  <div class="card stat"><b>${baht(rev)}</b><span>รายได้วันนี้</span></div></div>
 <div class="grid two">
  <div class="card"><h2>คิวที่ยังไม่เสร็จ</h2><div class="list">${next.length?next.map(b=>`<div><div class="av">${ICON[pet(b.cid,b.pid).type]}</div><div class="g"><b>${esc(pet(b.cid,b.pid).name)}</b> <small>· ${esc(cust(b.cid).name)}</small><br><small>${b.date==t?'วันนี้':b.date} ${b.time} น. · ${svcNames(b)}</small></div><span class="tag s-${b.status}">${stName(b.status)}</span></div>`).join(''):'<div class="empty">ยังไม่มีคิว กดจองคิวใหม่ได้เลย</div>'}</div></div>
  <div class="card"><h2>การแจ้งเตือนล่าสุด</h2><div class="list">${S.notifs.length?S.notifs.slice(0,6).map(n=>`<div><div class="av">🔔</div><div class="g">${esc(n.text)}<br><small>${n.time}</small></div></div>`).join(''):'<div class="empty">เมื่อกรูมมิ่งเสร็จ ระบบจะแจ้งเตือนที่นี่</div>'}</div></div>
 </div>`}

/* ---------- queue ---------- */
function kcard(b){
 const i=ST.findIndex(s=>s[0]==b.status),nx=ST[i+1],p=pet(b.cid,b.pid);
 let btn='';
 if(b.status=='booked')btn='<button class="btn sm" data-adv="'+b.id+'">เริ่มกรูมมิ่ง</button>';
 else if(b.status=='grooming')btn='<button class="btn sm sun" data-adv="'+b.id+'">เสร็จแล้ว · แจ้งลูกค้า</button>';
 else if(b.status=='done')btn='<button class="btn sm" data-pay="'+b.id+'">ไปชำระเงิน</button>';
 return`<div class="k" data-open="${b.id}" tabindex="0"><b>${ICON[p.type]} ${esc(p.name)}</b><small>${esc(cust(b.cid).name)} · ${b.time} น.</small><br><small>${svcNames(b)}</small><br><span class="tag">${esc(b.style)}</span>${b.photo?' 📷':''}${b.brief?' 📝':''}<div class="row">${btn}</div></div>`}
function queue(){
 return`<h1>คิวช่าง</h1><p class="sub">กดปุ่มในการ์ดเพื่อเลื่อนสถานะ · กดที่การ์ดเพื่อดูบรีฟและรูป</p>
 <div class="board">${ST.map(([k,n])=>{const l=S.bookings.filter(b=>b.status==k).sort((a,b)=>(a.date+a.time).localeCompare(b.date+b.time));
 return`<div class="col"><h3>${n}<span class="tag">${l.length}</span></h3>${l.map(kcard).join('')||'<div class="empty">—</div>'}</div>`}).join('')}</div>`}
function advance(id){
 const b=S.bookings.find(x=>x.id==id);
 if(b.status=='booked')b.status='grooming';
 else if(b.status=='grooming'){b.status='done';const c=cust(b.cid),p=pet(b.cid,b.pid);
  S.notifs.unshift({text:`ส่งข้อความถึง ${c.name} (${c.phone}): "${p.name} ตัดขนเสร็จแล้ว พร้อมรับกลับค่ะ"`,time:new Date().toLocaleTimeString('th-TH',{hour:'2-digit',minute:'2-digit'})+' น.'});
  toast(`🔔 แจ้ง ${c.name} แล้ว: ${p.name} พร้อมรับกลับ`)}
 save();render()}

/* ---------- booking ---------- */
function book(){
 draftPhoto='';
 return`<h1>จองคิวใหม่</h1><p class="sub">กรอกข้อมูลตามลำดับ ใช้เวลาไม่ถึงนาที</p>
 <form id="bf" class="card f" onsubmit="return false">
  <div><label>ลูกค้า</label><select id="bc">${S.customers.map(c=>`<option value="${c.id}">${esc(c.name)}</option>`).join('')}</select></div>
  <div><label>สัตว์เลี้ยง</label><select id="bp"></select></div>
  <div><label>วันที่</label><input type="date" id="bd" value="${today()}"></div>
  <div><label>เวลา</label><input type="time" id="bt" value="10:00"></div>
  <div class="full"><label>บริการ</label><div class="chips">${SERVICES.map(s=>`<label class="chip"><input type="checkbox" name="sv" value="${s.id}"${s.id=='bath'?' checked':''}><span>${s.n} ${baht(s.p)}</span></label>`).join('')}</div></div>
  <div class="full"><label>ทรงตัดขน</label><div class="chips">${STYLES.map((s,i)=>`<label class="chip"><input type="radio" name="st" value="${s}"${i==0?' checked':''}><span>${s}</span></label>`).join('')}</div></div>
  <div class="full"><label for="br">บรีฟถึงช่าง</label><textarea id="br" placeholder="เช่น ความยาวขน จุดที่ต้องระวัง ความชอบของน้อง"></textarea></div>
  <div class="full"><label for="ph">รูป Reference ทรงที่ต้องการ</label><input type="file" id="ph" accept="image/*"><div id="pvw"></div></div>
  <div class="full" style="display:flex;justify-content:space-between;align-items:center;gap:12px;flex-wrap:wrap"><div>รวมโดยประมาณ <span class="total" id="tot"></span></div><button class="btn" id="sv">บันทึกการจอง</button></div>
 </form>`}
function bookBind(){
 const bc=document.getElementById('bc');if(!bc)return;
 const fillPets=()=>{document.getElementById('bp').innerHTML=(cust(bc.value)?.pets||[]).map(p=>`<option value="${p.id}">${ICON[p.type]} ${esc(p.name)}</option>`).join('')||'<option value="">ยังไม่มีสัตว์เลี้ยง</option>'};
 const tot=()=>{document.getElementById('tot').textContent=baht([...document.querySelectorAll('[name=sv]:checked')].reduce((a,e)=>a+SERVICES.find(s=>s.id==e.value).p,0))};
 bc.onchange=fillPets;fillPets();tot();
 document.querySelectorAll('[name=sv]').forEach(e=>e.onchange=tot);
 document.getElementById('ph').onchange=e=>{const f=e.target.files[0];if(!f)return;const r=new FileReader();
  r.onload=()=>{const im=new Image();im.onload=()=>{const k=Math.min(1,480/im.width),c=document.createElement('canvas');c.width=im.width*k;c.height=im.height*k;c.getContext('2d').drawImage(im,0,0,c.width,c.height);draftPhoto=c.toDataURL('image/jpeg',.7);document.getElementById('pvw').innerHTML=`<img class="pv" alt="รูป Reference" src="${draftPhoto}">`};im.src=r.result};r.readAsDataURL(f)};
 document.getElementById('sv').onclick=()=>{
  const pid=document.getElementById('bp').value,svc=[...document.querySelectorAll('[name=sv]:checked')].map(e=>e.value);
  if(!pid)return toast('เพิ่มสัตว์เลี้ยงของลูกค้าก่อนที่หน้า "ลูกค้า"');
  if(!svc.length)return toast('เลือกบริการอย่างน้อย 1 อย่าง');
  S.bookings.push({id:uid(),cid:bc.value,pid,date:document.getElementById('bd').value,time:document.getElementById('bt').value,svc,style:document.querySelector('[name=st]:checked').value,brief:document.getElementById('br').value.trim(),photo:draftPhoto,status:'booked',paid:false});
  save();toast('✅ จองคิวเรียบร้อย');go('queue')}}

/* ---------- customers ---------- */
function custV(){
 return`<h1>ลูกค้าและสัตว์เลี้ยง</h1><p class="sub">เพิ่มลูกค้าใหม่ แล้วเพิ่มสัตว์เลี้ยงของลูกค้าได้ทันที</p>
 <div class="card f" style="margin-bottom:16px"><div><label for="cn">ชื่อลูกค้า</label><input id="cn"></div><div><label for="cp">เบอร์โทร</label><input id="cp" inputmode="tel"></div><div style="align-self:end"><button class="btn" id="addc">เพิ่มลูกค้า</button></div></div>
 <div class="grid" style="grid-template-columns:repeat(auto-fill,minmax(290px,1fr))">${S.customers.map(c=>`<div class="card"><h2>${esc(c.name)}</h2><small style="color:var(--mute)">${esc(c.phone)}</small>
  <div class="list">${c.pets.map(p=>`<div><div class="av">${ICON[p.type]}</div><div class="g"><b>${esc(p.name)}</b> <small>${esc(p.breed)}</small>${p.note?`<br><small>⚠️ ${esc(p.note)}</small>`:''}</div></div>`).join('')||'<div class="empty">ยังไม่มีสัตว์เลี้ยง</div>'}</div>
  <div class="f" style="margin-top:10px;grid-template-columns:1fr 1fr" data-pf="${c.id}"><input placeholder="ชื่อน้อง" class="pn"><select class="pt"><option value="dog">สุนัข</option><option value="cat">แมว</option><option value="other">อื่นๆ</option></select><input placeholder="สายพันธุ์" class="pb"><input placeholder="หมายเหตุ (แพ้/ขี้กลัว)" class="po"><button class="btn alt sm full" data-addp="${c.id}">+ เพิ่มสัตว์เลี้ยง</button></div></div>`).join('')}</div>`}

/* ---------- POS ---------- */
function pos(){
 const wait=S.bookings.filter(b=>b.status=='done');
 if(!posSel||!wait.find(b=>b.id==posSel))posSel=wait[0]?.id||null;
 const b=S.bookings.find(x=>x.id==posSel);
 const bill=b?`<h2>บิลของ ${ICON[pet(b.cid,b.pid).type]} ${esc(pet(b.cid,b.pid).name)}</h2><small style="color:var(--mute)">${esc(cust(b.cid).name)}</small>
  <table>${b.svc.map(id=>{const s=SERVICES.find(x=>x.id==id);return`<tr><td>${s.n}</td><td class="r">${baht(s.p)}</td></tr>`}).join('')}</table>
  <div class="f" style="margin:12px 0;grid-template-columns:1fr 1fr"><div><label for="dc">ส่วนลด (บาท)</label><input id="dc" type="number" min="0" value="0"></div><div><label for="pm">ช่องทางชำระ</label><select id="pm"><option>เงินสด</option><option>โอน / PromptPay</option><option>บัตรเครดิต</option></select></div></div>
  <div style="display:flex;justify-content:space-between;align-items:center"><span>ยอดสุทธิ</span><span class="total" id="net">${baht(price(b))}</span></div>
  <button class="btn" style="width:100%;margin-top:12px" id="paybtn">รับชำระเงิน และส่งมอบน้อง</button>`:'<div class="empty">ยังไม่มีน้องที่รอชำระเงิน<br>เมื่อช่างกด "เสร็จแล้ว" จะขึ้นที่นี่</div>';
 return`<h1>ชำระเงิน (POS)</h1><p class="sub">เลือกน้องที่ตัดขนเสร็จ คิดเงิน แล้วส่งมอบกลับ</p>
 <div class="grid two"><div class="card"><h2>รอชำระเงิน</h2><div class="list">${wait.map(w=>`<div data-sel="${w.id}" style="cursor:pointer;${w.id==posSel?'background:var(--soft);border-radius:12px;padding-left:8px':''}"><div class="av">${ICON[pet(w.cid,w.pid).type]}</div><div class="g"><b>${esc(pet(w.cid,w.pid).name)}</b><br><small>${svcNames(w)}</small></div><b>${baht(price(w))}</b></div>`).join('')||'<div class="empty">—</div>'}</div>
 <h2 style="margin-top:20px">ประวัติการชำระ</h2><div class="wrap"><table>${S.sales.slice(0,8).map(s=>`<tr><td>${esc(s.pet)}</td><td>${s.method}</td><td class="r">${baht(s.total)}</td></tr>`).join('')||'<tr><td class="empty">ยังไม่มีรายการ</td></tr>'}</table></div></div>
 <div class="card">${bill}</div></div>`}
function posBind(){
 const dc=document.getElementById('dc');if(!dc)return;const b=S.bookings.find(x=>x.id==posSel);
 const net=()=>Math.max(0,price(b)-(+dc.value||0));
 dc.oninput=()=>document.getElementById('net').textContent=baht(net());
 document.getElementById('paybtn').onclick=()=>{
  S.sales.unshift({date:today(),pet:pet(b.cid,b.pid).name,method:document.getElementById('pm').value,total:net()});
  b.paid=true;b.status='closed';save();toast(`✅ รับชำระ ${baht(net())} · ส่งมอบ ${pet(b.cid,b.pid).name} แล้ว`);render()}}

/* ---------- detail dialog ---------- */
function openB(id){
 const b=S.bookings.find(x=>x.id==id),p=pet(b.cid,b.pid),d=document.getElementById('dlg');
 d.innerHTML=`<h2>${ICON[p.type]} ${esc(p.name)} <span class="tag s-${b.status}">${stName(b.status)}</span></h2>
 <p>${esc(cust(b.cid).name)} · ${b.date} ${b.time} น.<br>${svcNames(b)} · <b>${baht(price(b))}</b></p>
 <p><b>ทรง:</b> ${esc(b.style)}</p>${p.note?`<p>⚠️ ${esc(p.note)}</p>`:''}
 <p><b>บรีฟถึงช่าง:</b><br>${esc(b.brief)||'<small style="color:var(--mute)">ไม่มี</small>'}</p>
 ${b.photo?`<img class="thumb" alt="รูป Reference" src="${b.photo}">`:''}
 <div style="text-align:right;margin-top:14px"><button class="btn alt" onclick="document.getElementById('dlg').close()">ปิด</button></div>`;
 d.showModal()}

/* ---------- events ---------- */
function bind(){
 bookBind();posBind();
 document.querySelectorAll('[data-adv]').forEach(e=>e.onclick=ev=>{ev.stopPropagation();advance(e.dataset.adv)});
 document.querySelectorAll('[data-pay]').forEach(e=>e.onclick=ev=>{ev.stopPropagation();posSel=e.dataset.pay;go('pos')});
 document.querySelectorAll('[data-open]').forEach(e=>{e.onclick=()=>openB(e.dataset.open);e.onkeydown=ev=>{if(ev.key=='Enter')openB(e.dataset.open)}});
 document.querySelectorAll('[data-sel]').forEach(e=>e.onclick=()=>{posSel=e.dataset.sel;render()});
 const ac=document.getElementById('addc');
 if(ac)ac.onclick=()=>{const n=document.getElementById('cn').value.trim();if(!n)return toast('กรอกชื่อลูกค้าก่อน');S.customers.push({id:uid(),name:n,phone:document.getElementById('cp').value.trim(),pets:[]});save();render()};
 document.querySelectorAll('[data-addp]').forEach(e=>e.onclick=()=>{const w=document.querySelector(`[data-pf="${e.dataset.addp}"]`),n=w.querySelector('.pn').value.trim();if(!n)return toast('กรอกชื่อสัตว์เลี้ยงก่อน');
  cust(e.dataset.addp).pets.push({id:uid(),name:n,type:w.querySelector('.pt').value,breed:w.querySelector('.pb').value.trim(),note:w.querySelector('.po').value.trim()});save();render()});
}
render();
