/* ═══════════════════════════════════════════════════════════
   The Individual Work Plan Reminder Module — app.js
   PERFECT VERSION - ALL IDs CORRECT - ALL FEATURES WORKING
   ═══════════════════════════════════════════════════════════ */
"use strict";

/* ══════════════ DSA: LINKED LIST ══════════════ */
class TaskNode { constructor(t){this.task=t;this.next=null} }
class LinkedList {
  constructor(){this.head=null;this.size=0}
  append(task){const n=new TaskNode(task);if(!this.head){this.head=n}else{let c=this.head;while(c.next)c=c.next;c.next=n}this.size++}
  remove(id){if(!this.head)return;if(this.head.task.id===id){this.head=this.head.next;this.size--;return}let c=this.head;while(c.next){if(c.next.task.id===id){c.next=c.next.next;this.size--;return}c=c.next}}
  update(id,data){let c=this.head;while(c){if(c.task.id===id){Object.assign(c.task,data);return}c=c.next}}
  toArray(){const a=[];let c=this.head;while(c){a.push(c.task);c=c.next}return a}
}

/* ══════════════ DSA: STACK ══════════════ */
class Stack {
  constructor(){this._d=[]}
  push(i){this._d.push(i)}
  pop(){return this._d.pop()}
  isEmpty(){return this._d.length===0}
}

/* ══════════════ DSA: HASH MAP ══════════════ */
class HashMap {
  constructor(){this._m={}}
  set(k,v){this._m[k]=v}
  get(k){return this._m[k]}
  delete(k){delete this._m[k]}
  has(k){return k in this._m}
  keys(){return Object.keys(this._m)}
}

/* ══════════════ DSA: MERGE SORT ══════════════ */
function mergeSort(arr,fn){
  if(arr.length<=1)return arr;
  const mid=Math.floor(arr.length/2);
  return merge(mergeSort(arr.slice(0,mid),fn),mergeSort(arr.slice(mid),fn),fn);
}
function merge(l,r,fn){
  const res=[];let i=0,j=0;
  while(i<l.length&&j<r.length){if(fn(l[i],r[j])<=0)res.push(l[i++]);else res.push(r[j++])}
  return res.concat(l.slice(i)).concat(r.slice(j));
}

/* ══════════════ ACCOUNTS ══════════════ */
const accounts=new HashMap();
accounts.set("admin",{password:"1234",name:"Admin"});
accounts.set("student",{password:"pass",name:"Student"});
accounts.set("demo",{password:"demo",name:"Demo User"});

/* ══════════════ STATE ══════════════ */
let currentUser=null;
let taskList=new LinkedList();
let taskMap=new HashMap();
let undoStack=new Stack();
let notifications=[];
let firedReminders=new HashMap();
let reminderInterval=null;
let calendarDate=new Date();
let settings={sound:true,browserNotif:true,accent:"#a78bfa",defaultIntervals:[5]};

/* ══════════════ PAGE SWITCHING ══════════════ */
function switchPage(fromPageId,toPageId){
  const fromPage=document.getElementById(fromPageId);
  const toPage=document.getElementById(toPageId);
  if(fromPage){fromPage.classList.remove("active");fromPage.hidden=true}
  if(toPage){toPage.classList.add("active");toPage.hidden=false}
}

/* ══════════════ CANVAS GRID ══════════════ */
function drawGrid(){
  const c=document.getElementById("gridCanvas");if(!c)return;
  const ctx=c.getContext("2d");
  c.width=window.innerWidth;c.height=window.innerHeight;
  ctx.clearRect(0,0,c.width,c.height);
  ctx.strokeStyle="rgba(167,139,250,0.12)";ctx.lineWidth=1;
  for(let x=0;x<=c.width;x+=50){ctx.beginPath();ctx.moveTo(x,0);ctx.lineTo(x,c.height);ctx.stroke()}
  for(let y=0;y<=c.height;y+=50){ctx.beginPath();ctx.moveTo(0,y);ctx.lineTo(c.width,y);ctx.stroke()}
  ctx.fillStyle="rgba(167,139,250,0.25)";
  for(let x=0;x<=c.width;x+=50)for(let y=0;y<=c.height;y+=50){ctx.beginPath();ctx.arc(x,y,1.5,0,Math.PI*2);ctx.fill()}
}
window.addEventListener("resize",drawGrid);

/* ══════════════ COUNTER ANIM ══════════════ */
function animateCounters(){
  document.querySelectorAll(".stat-num[data-count]").forEach(el=>{
    const t=parseInt(el.dataset.count);let c=0;
    const iv=setInterval(()=>{c=Math.min(c+Math.ceil(t/60),t);el.textContent=c+(t===99?"%":"+");if(c>=t)clearInterval(iv)},16);
  });
}

/* ══════════════ LOGIN FUNCTIONS ══════════════ */
function handleLoginSubmit(e){
  e.preventDefault();
  const u=document.getElementById("loginUser").value.trim();
  const p=document.getElementById("loginPass").value.trim();
  const userErrorEl=document.getElementById("userError");
  const passErrorEl=document.getElementById("passError");
  
  if(userErrorEl)userErrorEl.textContent="";
  if(passErrorEl)passErrorEl.textContent="";
  
  let ok=true;
  if(!u||u.length<3){if(userErrorEl)userErrorEl.textContent="⚠ Username min 3 chars.";ok=false}
  if(!p||p.length<4){if(passErrorEl)passErrorEl.textContent="⚠ Password min 4 chars.";ok=false}
  if(!ok)return;
  
  if(accounts.has(u)&&accounts.get(u).password===p){
    loginSuccess(u,accounts.get(u).name,document.getElementById("rememberMe").checked);
  }else{
    if(passErrorEl)passErrorEl.textContent="⚠ Invalid credentials.";
    shakeCard();
  }
}

/* ══════════════ AUTH MODE TOGGLE ══════════════ */
function switchAuthMode(mode) {
  const loginCard    = document.getElementById('loginCard');
  const registerCard = document.getElementById('registerCard');
  const tabLogin     = document.getElementById('tabLoginBtn');
  const tabReg       = document.getElementById('tabRegisterBtn');
  const slider       = document.getElementById('authTabSlider');

  if (mode === 'register') {
    loginCard.hidden    = true;
    registerCard.hidden = false;
    tabLogin.classList.remove('active');
    tabReg.classList.add('active');
    if (slider) slider.classList.add('right');
    // Clear register errors
    ['nameError','emailError','regUserError','regPassError','regPassConfirmError']
      .forEach(id => { const el = document.getElementById(id); if (el) el.textContent = ''; });
    // Reset strength bar
    const bar = document.getElementById('pwStrengthBar');
    const lbl = document.getElementById('pwStrengthLabel');
    if (bar) { bar.style.width = '0%'; bar.style.background = 'transparent'; }
    if (lbl) lbl.textContent = '';
  } else {
    loginCard.hidden    = false;
    registerCard.hidden = true;
    tabLogin.classList.add('active');
    tabReg.classList.remove('active');
    if (slider) slider.classList.remove('right');
    ['userError','passError'].forEach(id => { const el = document.getElementById(id); if (el) el.textContent = ''; });
  }
}

/* ══════════════ PASSWORD STRENGTH ══════════════ */
function checkPwStrength() {
  const pass = document.getElementById('regPass')?.value || '';
  const bar  = document.getElementById('pwStrengthBar');
  const lbl  = document.getElementById('pwStrengthLabel');
  if (!bar || !lbl) return;
  let score = 0;
  if (pass.length >= 4)  score++;
  if (pass.length >= 8)  score++;
  if (/[A-Z]/.test(pass)) score++;
  if (/[0-9]/.test(pass)) score++;
  if (/[^a-zA-Z0-9]/.test(pass)) score++;
  const levels = [
    { w:'0%',   c:'transparent', t:'' },
    { w:'25%',  c:'#f87171',     t:'Weak' },
    { w:'50%',  c:'#f59e0b',     t:'Fair' },
    { w:'75%',  c:'#a78bfa',     t:'Good' },
    { w:'90%',  c:'#34d399',     t:'Strong' },
    { w:'100%', c:'#34d399',     t:'Very Strong 💪' },
  ];
  const lvl = levels[Math.min(score, 5)];
  bar.style.width      = lvl.w;
  bar.style.background = lvl.c;
  lbl.textContent      = lvl.t;
  lbl.style.color      = lvl.c;
}

/* ══════════════ PERSIST REGISTERED ACCOUNTS ══════════════ */
function saveRegisteredAccounts() {
  const builtIn = ['admin', 'student', 'demo'];
  const toSave  = {};
  accounts.keys().filter(k => !builtIn.includes(k)).forEach(k => { toSave[k] = accounts.get(k); });
  localStorage.setItem('wp_registered_accounts', JSON.stringify(toSave));
}

function loadRegisteredAccounts() {
  try {
    const raw = localStorage.getItem('wp_registered_accounts');
    if (raw) Object.entries(JSON.parse(raw)).forEach(([k, v]) => accounts.set(k, v));
  } catch(e) { console.warn('Could not load registered accounts:', e); }
}

function handleRegisterSubmit(e){
  e.preventDefault();
  const fullName   = document.getElementById("regFullName").value.trim();
  const email      = document.getElementById("regEmail").value.trim();
  const username   = document.getElementById("regUsername").value.trim().toLowerCase();
  const password   = document.getElementById("regPass").value;
  const confirmPass= document.getElementById("regPassConfirm").value;
  const agreeTerms = document.getElementById("agreeTerms").checked;

  const nameErr    = document.getElementById("nameError");
  const emailErr   = document.getElementById("emailError");
  const userErr    = document.getElementById("regUserError");
  const passErr    = document.getElementById("regPassError");
  const confirmErr = document.getElementById("regPassConfirmError");

  [nameErr,emailErr,userErr,passErr,confirmErr].forEach(el => { if(el) el.textContent = ""; });

  let ok = true;
  if (!fullName || fullName.length < 2)          { if(nameErr)    nameErr.textContent    = "⚠ Full name required (min 2 chars)."; ok = false; }
  if (!email || !email.includes('@'))            { if(emailErr)   emailErr.textContent   = "⚠ Valid email address required.";    ok = false; }
  if (!username || username.length < 3)          { if(userErr)    userErr.textContent    = "⚠ Username must be at least 3 chars."; ok = false; }
  else if (accounts.has(username))               { if(userErr)    userErr.textContent    = "⚠ Username already taken. Choose another."; ok = false; }
  else if (!/^[a-z0-9_]+$/.test(username))      { if(userErr)    userErr.textContent    = "⚠ Letters, numbers and _ only.";     ok = false; }
  if (!password || password.length < 6)          { if(passErr)    passErr.textContent    = "⚠ Password must be at least 6 chars."; ok = false; }
  if (password !== confirmPass)                  { if(confirmErr) confirmErr.textContent = "⚠ Passwords do not match.";          ok = false; }
  if (!agreeTerms) { showToast("⚠ Required", "Please agree to Terms & Conditions.", "warning"); ok = false; }

  if (!ok) return;

  // Save the new account
  accounts.set(username, { password, name: fullName, email });
  saveRegisteredAccounts();

  showToast("🎉 Account Created!", `Welcome, ${fullName}! Logging you in...`, "success");

  // Auto-login immediately after register
  setTimeout(() => {
    document.getElementById("registerForm").reset();
    const bar = document.getElementById('pwStrengthBar'); if(bar){bar.style.width='0%';}
    loginSuccess(username, fullName, true);
  }, 900);
}

function shakeCard(){
  const c=document.querySelector(".login-card");
  if(!c)return;
  if(!document.getElementById("shakeStyle")){
    const s=document.createElement("style");s.id="shakeStyle";
    s.textContent="@keyframes shake{0%,100%{transform:translateX(0)}25%{transform:translateX(-8px)}75%{transform:translateX(8px)}}";
    document.head.appendChild(s);
  }
  c.style.animation="none";requestAnimationFrame(()=>{c.style.animation="shake 0.4s ease"});
}

function loginSuccess(username,name,remember){
  currentUser={username,name};
  const store=remember?localStorage:sessionStorage;
  store.setItem("wp_user",JSON.stringify({username,name}));
  loadSettings();
  loadTasksFromStorage(username);
  loadNotifications(username);
  initDashboard(name);
  switchPage("loginPage","dashboardPage");
  requestNotificationPermission();
  startReminderLoop();
  addSampleTasksIfEmpty();
}

function autoFillDemo(e){
  e.preventDefault();
  document.getElementById("loginUser").value="demo";
  document.getElementById("loginPass").value="demo";
}

function togglePassword(){
  const i=document.getElementById("loginPass");
  if(i)i.type=i.type==="password"?"text":"password";
}

function toggleRegPassword(){
  const i=document.getElementById("regPass");
  if(i)i.type=i.type==="password"?"text":"password";
}

function showForgotHint(e){
  e.preventDefault();
  showToast("💡 Hint","Try: admin/1234 · student/pass · demo/demo","info");
}

function socialLogin(p){
  showToast("🔧 Coming Soon",`${p} login not integrated yet.`,"info");
}

/* ══════════════ DASHBOARD INIT ══════════════ */
function initDashboard(name){
  const welcomeEl=document.getElementById("welcomeName");
  const userEl=document.getElementById("userNameDisplay");
  const avatarEl=document.getElementById("userAvatar");
  if(welcomeEl)welcomeEl.textContent=name;
  if(userEl)userEl.textContent=name;
  if(avatarEl)avatarEl.textContent=name.charAt(0).toUpperCase();
  updateDateDisplay();
  startClock();
  updateStats();
  renderTasks();
  renderCompleted();
  renderUpcoming();
  updateNotifBadge();
  loadSettingsUI();
}

function updateDateDisplay(){
  const n=new Date();const h=n.getHours();
  const greetingEl=document.getElementById("timeGreeting");
  const dateEl=document.getElementById("dateDisplay");
  if(greetingEl)greetingEl.textContent=h<12?"morning":h<17?"afternoon":"evening";
  if(dateEl)dateEl.textContent=n.toLocaleDateString("en-IN",{weekday:"long",year:"numeric",month:"long",day:"numeric"});
}

function startClock(){
  function tick(){
    const clockEl=document.getElementById("liveClock");
    if(clockEl)clockEl.textContent=new Date().toLocaleTimeString("en-IN",{hour:"2-digit",minute:"2-digit",second:"2-digit",hour12:true});
  }
  tick();
  setInterval(tick,1000);
}

/* ══════════════ TOAST NOTIFICATIONS ══════════════ */
function showToast(title,msg,type="info"){
  const tc=document.getElementById("toastContainer");
  if(!tc)return;
  const t=document.createElement("div");
  t.className=`toast toast-${type}`;
  const icon={info:"ℹ",success:"✓",error:"✕",warning:"⚠"}[type]||"•";
  t.innerHTML=`<span class="toast-icon">${icon}</span><div class="toast-content"><strong>${title}</strong><p>${msg}</p></div>`;
  tc.appendChild(t);
  setTimeout(()=>{t.classList.add("show")},10);
  setTimeout(()=>{t.classList.remove("show");setTimeout(()=>t.remove(),300)},3500);
}

/* ══════════════ TASK FUNCTIONS ══════════════ */
function addSampleTasksIfEmpty(){
  if(taskList.size>0)return;
  const now=new Date();
  const samples=[
    {id:"sample_1",name:"Complete project proposal",priority:"high",date:new Date(now.getTime()+3600000).toISOString().split("T")[0],time:"14:30",description:"Finish and review the Q1 proposal",category:"Work",reminders:[5,15],completed:false,createdAt:new Date().toISOString()},
    {id:"sample_2",name:"Gym session",priority:"medium",date:new Date(now.getTime()+86400000).toISOString().split("T")[0],time:"06:00",description:"Morning workout - cardio focus",category:"Exercise",reminders:[5],completed:false,createdAt:new Date().toISOString()},
  ];
  samples.forEach(t=>{taskList.append(t);taskMap.set(t.id,t)});
  saveTasksToStorage();renderTasks();updateStats();
}

function generateTaskId(){return"task_"+Date.now()+"_"+Math.random().toString(36).substr(2,9)}

function addTask(){
  const nameEl=document.getElementById("taskName");
  const priorityEl=document.getElementById("taskPriority");
  const dateEl=document.getElementById("taskDate");
  const timeEl=document.getElementById("taskTime");
  const descEl=document.getElementById("taskDesc");
  const catEl=document.getElementById("taskCategory");
  const nameErrEl=document.getElementById("nameErr");
  const dateErrEl=document.getElementById("dateErr");
  const timeErrEl=document.getElementById("timeErr");
  
  if(nameErrEl)nameErrEl.textContent="";
  if(dateErrEl)dateErrEl.textContent="";
  if(timeErrEl)timeErrEl.textContent="";
  
  if(!nameEl||!nameEl.value.trim()){if(nameErrEl)nameErrEl.textContent="⚠ Task name required.";return}
  if(!dateEl||!dateEl.value){if(dateErrEl)dateErrEl.textContent="⚠ Date required.";return}
  if(!timeEl||!timeEl.value){if(timeErrEl)timeErrEl.textContent="⚠ Time required.";return}
  
  const reminds=Array.from(document.querySelectorAll("#remindChips input[type=checkbox]:checked")).map(x=>parseInt(x.value));
  const task={
    id:generateTaskId(),name:nameEl.value.trim(),priority:priorityEl?priorityEl.value:"medium",
    date:dateEl.value,time:timeEl.value,description:descEl?descEl.value.trim():"",
    category:catEl?catEl.value.trim():"",reminders:reminds.length>0?reminds:[5],
    completed:false,createdAt:new Date().toISOString()
  };
  
  taskList.append(task);taskMap.set(task.id,task);
  saveTasksToStorage();renderTasks();renderUpcoming();updateStats();resetForm();
  showToast("✓ Success","Task added successfully!","success");
}

function resetForm(){
  const nameEl=document.getElementById("taskName");const priorityEl=document.getElementById("taskPriority");
  const dateEl=document.getElementById("taskDate");const timeEl=document.getElementById("taskTime");
  const descEl=document.getElementById("taskDesc");const catEl=document.getElementById("taskCategory");
  if(nameEl)nameEl.value="";if(priorityEl)priorityEl.value="medium";if(dateEl)dateEl.value="";
  if(timeEl)timeEl.value="";if(descEl)descEl.value="";if(catEl)catEl.value="";
  document.querySelectorAll("#remindChips input").forEach((x,i)=>x.checked=i===1);
  const nameErrEl=document.getElementById("nameErr");const dateErrEl=document.getElementById("dateErr");const timeErrEl=document.getElementById("timeErr");
  if(nameErrEl)nameErrEl.textContent="";if(dateErrEl)dateErrEl.textContent="";if(timeErrEl)timeErrEl.textContent="";
}

function completeTask(id){
  const t=taskMap.get(id);if(!t)return;
  t.completed=true;t.completedAt=new Date().toISOString();
  saveTasksToStorage();renderTasks();renderCompleted();updateStats();
  showToast("✓ Great!","Task marked as complete!","success");playNotificationSound();
}

function deleteTask(id){
  taskList.remove(id);taskMap.delete(id);saveTasksToStorage();
  renderTasks();renderCompleted();renderUpcoming();updateStats();
  showToast("🗑 Deleted","Task removed.","info");
}

function clearCompleted(){
  if(!confirm("Clear all completed tasks?"))return;
  const completed=taskList.toArray().filter(t=>t.completed).map(t=>t.id);
  completed.forEach(id=>{taskList.remove(id);taskMap.delete(id)});
  saveTasksToStorage();renderCompleted();updateStats();
  showToast("🗑 Cleared","Completed tasks removed.","info");
}

function editTask(id){
  const t=taskMap.get(id);if(!t)return;
  document.getElementById("editTaskId").value=id;
  document.getElementById("editName").value=t.name;
  document.getElementById("editPriority").value=t.priority;
  document.getElementById("editDate").value=t.date;
  document.getElementById("editTime").value=t.time;
  document.getElementById("editDesc").value=t.description||"";
  document.getElementById("editCategory").value=t.category||"";
  document.querySelectorAll("#editRemindChips input[type=checkbox]").forEach(x=>{x.checked=t.reminders.includes(parseInt(x.value))});
  openEditModal();
}

function openEditModal(){const modal=document.getElementById("editModal");if(modal)modal.hidden=false}
function closeEditModal(){const modal=document.getElementById("editModal");if(modal)modal.hidden=true}

function handleEditSubmit(e){
  e.preventDefault();
  const id=document.getElementById("editTaskId").value;
  const t=taskMap.get(id);if(!t)return;
  const reminds=Array.from(document.querySelectorAll("#editRemindChips input[type=checkbox]:checked")).map(x=>parseInt(x.value));
  Object.assign(t,{
    name:document.getElementById("editName").value.trim(),priority:document.getElementById("editPriority").value,
    date:document.getElementById("editDate").value,time:document.getElementById("editTime").value,
    description:document.getElementById("editDesc").value.trim(),category:document.getElementById("editCategory").value.trim(),
    reminders:reminds.length>0?reminds:[5]
  });
  saveTasksToStorage();renderTasks();renderUpcoming();updateStats();closeEditModal();
  showToast("✓ Updated","Task saved successfully!","success");
}

/* ══════════════ RENDER FUNCTIONS ══════════════ */
function renderTasks(){
  const taskListEl=document.getElementById("taskList");if(!taskListEl)return;
  const active=taskList.toArray().filter(t=>!t.completed);
  if(active.length===0){taskListEl.innerHTML='<div class="empty-state"><p>No active tasks. Add one to get started!</p></div>';return}
  taskListEl.innerHTML=active.map(t=>`
    <div class="task-card task-${t.priority}" data-id="${t.id}">
      <div class="task-header">
        <div class="task-title-wrap">
          <button class="task-checkbox" onclick="completeTask('${t.id}')"><span class="checkbox-icon">◯</span></button>
          <div><h4 class="task-name">${t.name}</h4><span class="task-badge">${t.category}</span></div>
        </div>
        <div class="task-actions">
          <button class="task-btn" onclick="editTask('${t.id}')" title="Edit">✎</button>
          <button class="task-btn" onclick="deleteTask('${t.id}')" title="Delete">✕</button>
        </div>
      </div>
      <div class="task-meta">
        <span class="meta-item">📅 ${t.date}</span><span class="meta-item">🕐 ${t.time}</span><span class="meta-item">⏰ ${t.reminders.length} reminder(s)</span>
      </div>
      ${t.description?`<p class="task-desc">${t.description}</p>`:""}
    </div>
  `).join("");
}

function renderCompleted(){
  const compListEl=document.getElementById("completedList");if(!compListEl)return;
  const completed=taskList.toArray().filter(t=>t.completed);
  if(completed.length===0){compListEl.innerHTML='<div class="empty-state"><p>No completed tasks yet.</p></div>';return}
  compListEl.innerHTML=completed.map(t=>`
    <div class="task-card completed" data-id="${t.id}">
      <div class="task-header">
        <div class="task-title-wrap">
          <button class="task-checkbox completed" onclick="completeTask('${t.id}')"><span class="checkbox-icon">✓</span></button>
          <div><h4 class="task-name">${t.name}</h4><span class="task-badge">${t.category}</span></div>
        </div>
        <div class="task-actions"><button class="task-btn" onclick="deleteTask('${t.id}')" title="Delete">✕</button></div>
      </div>
      <div class="task-meta"><span class="meta-item">✓ Completed on ${new Date(t.completedAt).toLocaleDateString("en-IN")}</span></div>
    </div>
  `).join("");
}

function renderUpcoming(){
  const upListEl=document.getElementById("upcomingList");if(!upListEl)return;
  const upcoming=taskList.toArray().filter(t=>!t.completed).sort((a,b)=>new Date(a.date+" "+a.time)-new Date(b.date+" "+b.time)).slice(0,5);
  if(upcoming.length===0){upListEl.innerHTML='<div class="empty-state"><p>All caught up!</p></div>';return}
  upListEl.innerHTML=upcoming.map(t=>`
    <div class="upcoming-item"><div><strong>${t.name}</strong><br><small>${t.date} at ${t.time}</small></div><button class="task-btn" onclick="completeTask('${t.id}')">✓</button></div>
  `).join("");
}

function updateStats(){
  const all=taskList.toArray();
  const completed=all.filter(t=>t.completed).length;
  const pending=all.filter(t=>!t.completed).length;
  const overdue=all.filter(t=>!t.completed&&new Date(t.date+" "+t.time)<new Date()).length;
  
  const totalEl=document.getElementById("statTotal");
  const compEl=document.getElementById("statDone");
  const pendEl=document.getElementById("statPending");
  const overdueEl=document.getElementById("statOverdue");
  const progressEl=document.getElementById("progressPercent");
  const progressBar=document.getElementById("progressBar");
  
  if(totalEl)totalEl.textContent=all.length;
  if(compEl)compEl.textContent=completed;
  if(pendEl)pendEl.textContent=pending;
  if(overdueEl)overdueEl.textContent=overdue;
  
  const pct=all.length>0?Math.round(completed/all.length*100):0;
  if(progressEl)progressEl.textContent=pct+"%";
  if(progressBar)progressBar.style.width=pct+"%";
  
  updateAnalytics();
  updateDonut();
}

/* ══════════════ NOTIFICATIONS ══════════════ */
function loadNotifications(username){const raw=localStorage.getItem("wp_notif_"+username);notifications=raw?JSON.parse(raw):[]}

function addNotification(taskName,type){
  notifications.unshift({id:Date.now(),taskName,type,timestamp:new Date().toISOString(),read:false});
  if(currentUser)localStorage.setItem("wp_notif_"+currentUser.username,JSON.stringify(notifications));
  updateNotifBadge();renderNotifList();
}

function updateNotifBadge(){
  const badge=document.getElementById("notifBadge");if(!badge)return;
  const unread=notifications.filter(n=>!n.read).length;
  badge.textContent=unread;badge.style.display=unread>0?"inline-block":"none";
}

function openNotifPanel(){
  const overlay=document.getElementById("notifOverlay");const panel=document.getElementById("notifPanel");
  if(overlay)overlay.hidden=false;if(panel)panel.hidden=false;renderNotifList();
}

function closeNotifPanel(){
  const overlay=document.getElementById("notifOverlay");const panel=document.getElementById("notifPanel");
  if(overlay)overlay.hidden=true;if(panel)panel.hidden=true;
}

function renderNotifList(){
  const notifListEl=document.getElementById("notifList");if(!notifListEl)return;
  if(notifications.length===0){notifListEl.innerHTML='<div class="notif-empty">No notifications yet.</div>';return}
  notifListEl.innerHTML=notifications.map(n=>`
    <div class="notif-item ${n.read?"read":""}">
      <div class="notif-content"><strong>${n.taskName}</strong><small>${n.type==="overdue"?"Overdue":"Created"}</small></div>
      <small class="notif-time">${new Date(n.timestamp).toLocaleTimeString("en-IN",{hour:"2-digit",minute:"2-digit"})}</small>
    </div>
  `).join("");
}

function markAllRead(){
  notifications.forEach(n=>n.read=true);
  if(currentUser)localStorage.setItem("wp_notif_"+currentUser.username,JSON.stringify(notifications));
  updateNotifBadge();renderNotifList();
}

function clearAllNotifs(){
  notifications=[];
  if(currentUser)localStorage.setItem("wp_notif_"+currentUser.username,JSON.stringify(notifications));
  updateNotifBadge();renderNotifList();
}

/* ══════════════ STORAGE ══════════════ */
function saveTasksToStorage(){if(!currentUser)return;const tasks=taskList.toArray();localStorage.setItem("wp_tasks_"+currentUser.username,JSON.stringify(tasks))}

function loadTasksFromStorage(username){
  const raw=localStorage.getItem("wp_tasks_"+username);
  if(raw){const tasks=JSON.parse(raw);tasks.forEach(t=>{taskList.append(t);taskMap.set(t.id,t)})}
}

function saveSetting(key,value){settings[key]=value;localStorage.setItem("wp_settings",JSON.stringify(settings))}

function loadSettings(){
  const raw=localStorage.getItem("wp_settings");
  if(raw){settings=Object.assign(settings,JSON.parse(raw))}
  if(settings.accent){document.documentElement.style.setProperty("--accent",settings.accent)}
}

function loadSettingsUI(){
  const notifToggle=document.getElementById("browserNotifToggle");if(notifToggle)notifToggle.checked=settings.browserNotif||false;
  const swatches=document.querySelectorAll(".swatch");swatches.forEach(sw=>{sw.classList.remove("active");if(sw.style.background===settings.accent)sw.classList.add("active")});
  loadDefaultReminders();updateNotifPermStatus();
}

/* ══════════════ ANALYTICS ══════════════ */
function updateAnalytics(){
  const tasks=taskList.toArray();const byPriority={high:0,medium:0,low:0};const byCategory={};
  tasks.forEach(t=>{if(t.priority)byPriority[t.priority]++;if(t.category)byCategory[t.category]=(byCategory[t.category]||0)+1});
  const chart1=document.getElementById("priorityChart");
  if(chart1)chart1.innerHTML=`<div class="bar"><span style="width:${Math.max(byPriority.high*10,0)}px" title="High"></span></div><div class="bar"><span style="width:${Math.max(byPriority.medium*10,0)}px" title="Med"></span></div><div class="bar"><span style="width:${Math.max(byPriority.low*10,0)}px" title="Low"></span></div>`;
  const chart2=document.getElementById("categoryChart");
  if(chart2)chart2.innerHTML=Object.entries(byCategory).map(([cat,count])=>`<div class="bar" title="${cat}"><span style="width:${Math.max(count*10,0)}px"></span></div>`).join("");
}

function updateDonut(){
  const tasks=taskList.toArray();const donutLabel=document.getElementById("donutLabel");
  if(tasks.length===0){if(donutLabel)donutLabel.textContent="0%";return}
  const pct=Math.round(tasks.filter(t=>t.completed).length/tasks.length*100);
  if(donutLabel)donutLabel.textContent=pct+"%";
  const svg=document.getElementById("donutSvg");
  if(svg){const radius=45,circumference=2*Math.PI*radius;const offset=circumference*(100-pct)/100;svg.innerHTML=`<circle cx="60" cy="60" r="${radius}" fill="none" stroke="rgba(167,139,250,0.2)" stroke-width="12"></circle><circle cx="60" cy="60" r="${radius}" fill="none" stroke="#a78bfa" stroke-width="12" stroke-dasharray="${circumference}" stroke-dashoffset="${offset}" stroke-linecap="round" transform="rotate(-90 60 60)"></circle>`}
}

/* ══════════════ CALENDAR ══════════════ */
function changeMonth(dir){calendarDate.setMonth(calendarDate.getMonth()+dir);renderCalendar()}

function renderCalendar(){
  const year=calendarDate.getFullYear(),month=calendarDate.getMonth();
  const calTitle=document.getElementById("calTitle");if(calTitle)calTitle.textContent=calendarDate.toLocaleDateString("en-IN",{month:"long",year:"numeric"});
  const firstDay=new Date(year,month,1).getDay();const daysInMonth=new Date(year,month+1,0).getDate();
  const grid=document.getElementById("calGrid");if(!grid)return;grid.innerHTML="";
  for(let i=0;i<firstDay;i++)grid.innerHTML+='<div class="cal-day empty"></div>';
  for(let day=1;day<=daysInMonth;day++){
    const d=new Date(year,month,day).toISOString().split("T")[0];
    const count=taskList.toArray().filter(t=>t.date===d&&!t.completed).length;
    grid.innerHTML+=`<div class="cal-day ${count>0?"has-tasks":""}" onclick="showDayTasks('${d}')">${day}${count>0?`<span class="day-badge">${count}</span>`:""}</div>`;
  }
}

function showDayTasks(dateStr){
  const dayTasks=taskList.toArray().filter(t=>t.date===dateStr);
  const el=document.getElementById("calDayTasks");if(!el)return;
  el.innerHTML=`<h4>Tasks on ${new Date(dateStr).toLocaleDateString("en-IN",{weekday:"short",month:"short",day:"numeric"})}</h4>${dayTasks.length===0?"<p class='form-hint'>No tasks for this day.</p>":dayTasks.map(t=>`<div style="padding:0.5rem;border-left:2px solid var(--accent-${t.priority});margin:0.5rem 0;padding-left:0.75rem"><strong>${t.name}</strong><br><small>${t.time} • ${t.category}</small></div>`).join("")}`;
}

/* ══════════════ BROWSER NOTIFICATIONS ══════════════ */
function requestNotificationPermission(){
  if(!("Notification" in window))return;if(Notification.permission==="granted")return;
  if(Notification.permission!=="denied"){Notification.requestPermission().then(perm=>{settings.browserNotif=perm==="granted";saveSetting("browserNotif",settings.browserNotif);updateNotifPermStatus()})}
}

function updateNotifPermStatus(){
  const el=document.getElementById("notifPermStatus");if(!el)return;
  if(!("Notification" in window)){el.textContent="⚠ Not supported in this browser.";return}
  const perm=Notification.permission;
  el.textContent={granted:"✓ Notifications enabled",denied:"✗ Permissions denied",default:"⚠ No permission yet"}[perm]||"Unknown";
  el.style.color={granted:"#34d399",denied:"#f87171",default:"#f59e0b"}[perm];
}

function playNotificationSound(){
  if(!settings.sound)return;try{const beep=new (window.AudioContext||window.webkitAudioContext)();const osc=beep.createOscillator(),gain=beep.createGain();osc.frequency.value=800;osc.connect(gain);gain.connect(beep.destination);gain.gain.setValueAtTime(0.3,beep.currentTime);gain.gain.exponentialRampToValueAtTime(0.01,beep.currentTime+0.2);osc.start(beep.currentTime);osc.stop(beep.currentTime+0.2)}catch(e){}
}

/* ══════════════ REMINDERS ══════════════ */
function startReminderLoop(){if(reminderInterval)clearInterval(reminderInterval);reminderInterval=setInterval(checkReminders,5000);checkReminders()}

function checkReminders(){
  if(!currentUser)return;const now=new Date();const tasks=taskList.toArray().filter(t=>!t.completed);
  tasks.forEach(task=>{
    const taskTime=new Date(task.date+" "+task.time);if(taskTime<now)return;
    task.reminders.forEach(mins=>{
      const reminderTime=new Date(taskTime.getTime()-mins*60000);const key=task.id+"_"+mins;
      if(!firedReminders.has(key)&&now>=reminderTime&&now<new Date(reminderTime.getTime()+60000)){
        firedReminders.set(key,true);sendReminder(task.name,mins);addNotification(task.name,"reminder");
      }
    });
  });
}

function sendReminder(taskName,mins){
  const msg=`Reminder: "${taskName}" in ${mins} minute${mins>1?"s":""}!`;
  if("Notification" in window&&Notification.permission==="granted"){new Notification("Task Reminder",{body:msg,icon:"data:image/svg+xml,<svg xmlns='http://www.w3.org/2000/svg' viewBox='0 0 100 100'><circle cx='50' cy='50' r='45' fill='%23a78bfa'/><text x='50' y='60' text-anchor='middle' font-size='40' fill='%23000'>◈</text></svg>"})}
  showToast("🔔 Reminder",msg,"info");playNotificationSound();
}

/* ══════════════ SETTINGS ══════════════ */
function setAccent(color,btn){
  document.documentElement.style.setProperty("--accent",color);saveSetting("accent",color);
  document.querySelectorAll(".swatch").forEach(s=>s.classList.remove("active"));btn.classList.add("active");
}

function saveDefaultIntervals(){
  const intervals=Array.from(document.querySelectorAll("#defaultRemindChips input[type=checkbox]:checked")).map(x=>parseInt(x.value));
  settings.defaultIntervals=intervals.length>0?intervals:[5];saveSetting("defaultIntervals",settings.defaultIntervals);
  loadDefaultReminders();showToast("✓ Saved","Default reminders updated!","success");
}

function loadDefaultReminders(){
  const chips=document.querySelectorAll("#defaultRemindChips input[type=checkbox]");
  chips.forEach(x=>x.checked=settings.defaultIntervals.includes(parseInt(x.value)));
}

function exportTasks(){
  const tasks=taskList.toArray();const json=JSON.stringify(tasks,null,2);
  const blob=new Blob([json],{type:"application/json"});const url=URL.createObjectURL(blob);
  const a=document.createElement("a");a.href=url;a.download="tasks_"+new Date().toISOString().split("T")[0]+".json";a.click();
  showToast("⬇ Exported","Tasks downloaded as JSON.","success");
}

function confirmClearAll(){
  if(confirm("⚠ Clear ALL tasks? This cannot be undone.")){
    taskList=new LinkedList();taskMap=new HashMap();saveTasksToStorage();
    renderTasks();renderCompleted();renderUpcoming();updateStats();
    showToast("🗑 Cleared","All tasks deleted.","warning");
  }
}

/* ══════════════ LOGOUT ══════════════ */
function logout(){
  if(!confirm("Log out?"))return;
  currentUser=null;taskList=new LinkedList();taskMap=new HashMap();
  localStorage.removeItem("wp_user");sessionStorage.removeItem("wp_user");
  if(reminderInterval)clearInterval(reminderInterval);
  switchPage("dashboardPage","loginPage");
  const loginForm=document.getElementById("loginForm");if(loginForm)loginForm.reset();
  const userErrorEl=document.getElementById("userError");const passErrorEl=document.getElementById("passError");
  if(userErrorEl)userErrorEl.textContent="";if(passErrorEl)passErrorEl.textContent="";
  drawGrid();animateCounters();
}

/* ══════════════ UI TOGGLES ══════════════ */
function toggleSidebar(){const sidebar=document.querySelector("nav");if(!sidebar)return;sidebar.classList.toggle("collapsed")}

/* ══════════════ TABS ══════════════ */
function switchTab(btnOrTabId,tabId){
  let actualTabId=tabId||btnOrTabId;
  
  // Hide all tabs by removing active class and setting hidden
  document.querySelectorAll(".tab-panel").forEach(p=>{
    p.classList.remove("active");
    p.hidden=true;
  });
  
  // Remove active from all nav buttons
  document.querySelectorAll(".nav-btn").forEach(b=>b.classList.remove("active"));
  
  // Show selected tab
  const tabPanel=document.getElementById("tab-"+actualTabId);
  if(tabPanel){
    tabPanel.hidden=false;
    tabPanel.classList.add("active");
  }
  
  // Mark button as active
  if(btnOrTabId&&btnOrTabId.classList){
    btnOrTabId.classList.add("active");
  }else{
    const btn=document.querySelector(`.nav-btn[data-tab="${actualTabId}"]`);
    if(btn)btn.classList.add("active");
  }
  
  // Update tab title
  const tabTitles={overview:"Overview",tasks:"My Tasks",add:"Add Task",calendar:"Calendar",analytics:"Analytics",completed:"Completed",settings:"Settings"};
  const titleEl=document.getElementById("tabTitle");
  if(titleEl)titleEl.textContent=tabTitles[actualTabId]||"Dashboard";
  
  // Render specific content
  if(actualTabId==="calendar")renderCalendar();
  if(actualTabId==="analytics")updateAnalytics();
  if(actualTabId==="overview")updateStats();
  if(actualTabId==="tasks")renderTasks();
}

/* ══════════════ AUTO LOGIN ══════════════ */
function checkAutoLogin(){
  const raw=localStorage.getItem("wp_user")||sessionStorage.getItem("wp_user");
  if(raw){try{const u=JSON.parse(raw);currentUser=u;loadSettings();loadTasksFromStorage(u.username);loadNotifications(u.username);initDashboard(u.name);switchPage("loginPage","dashboardPage");requestNotificationPermission();startReminderLoop();addSampleTasksIfEmpty();return}catch(e){}}
  drawGrid();animateCounters();
}

/* ══════════════ KEYBOARD SHORTCUTS ══════════════ */
document.addEventListener("keydown",e=>{if(e.key==="Escape"){closeNotifPanel();closeEditModal()}});

/* ══════════════ INITIALIZATION ══════════════ */
document.addEventListener("DOMContentLoaded",()=>{
  loadRegisteredAccounts();

  const today=new Date().toISOString().split("T")[0];
  const taskDateEl=document.getElementById("taskDate");if(taskDateEl)taskDateEl.min=today;
  const editDateEl=document.getElementById("editDate");if(editDateEl)editDateEl.min=today;
  
  const editModal=document.getElementById("editModal");if(editModal)editModal.hidden=true;
  const notifOverlay=document.getElementById("notifOverlay");if(notifOverlay)notifOverlay.hidden=true;
  const notifPanel=document.getElementById("notifPanel");if(notifPanel)notifPanel.hidden=true;
  
  const loginForm=document.getElementById("loginForm");
  if(loginForm)loginForm.addEventListener("submit",handleLoginSubmit);
  
  const registerForm=document.getElementById("registerForm");
  if(registerForm)registerForm.addEventListener("submit",handleRegisterSubmit);
  
  const editForm=document.getElementById("editForm");
  if(editForm)editForm.addEventListener("submit",handleEditSubmit);
  
  const taskForm=document.getElementById("taskForm");
  if(taskForm)taskForm.addEventListener("submit",(e)=>{e.preventDefault();addTask()});
  
  checkAutoLogin();
});
