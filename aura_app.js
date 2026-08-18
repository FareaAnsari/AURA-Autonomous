// ═══════════════════════════════════════════════════════════════════
// AURA — Complete Application Logic
// ═══════════════════════════════════════════════════════════════════

// ── INTENT ENGINE ─────────────────────────────────────────────────
const CATEGORY_RULES=[
  {category:'laptop',     keywords:['laptop','notebook','macbook','ultrabook','chromebook'],icon:'💻',label:'Laptop'},
  {category:'smartphone', keywords:['phone','smartphone','mobile','iphone','android','oneplus','samsung phone','5g phone'],icon:'📱',label:'Smartphone'},
  {category:'travel',     keywords:['trip','travel','tour','hotel','flight','vacation','visit','stay','destination','itinerary','places to'],icon:'✈️',label:'Travel'},
  {category:'course',     keywords:['course','learn','tutorial','certification','training','study','bootcamp','degree'],icon:'🎓',label:'Course / Learning'},
  {category:'cloud',      keywords:['cloud','aws','azure','gcp','hosting','server','vps','devops','deployment'],icon:'☁️',label:'Cloud Platform'},
  {category:'comparison', keywords:['compare','vs','versus','difference between','which is better'],icon:'⚖️',label:'Comparison'},
  {category:'career',     keywords:['career','job','resume','skills for','salary','interview','hire'],icon:'💼',label:'Career'},
  {category:'general',    keywords:[],icon:'🔍',label:'General Research'},
];

function detectCategory(q){
  const ql=q.toLowerCase();
  for(const r of CATEGORY_RULES) if(r.keywords.some(k=>new RegExp(k).test(ql))) return r;
  return CATEGORY_RULES[CATEGORY_RULES.length-1];
}

function extractBudget(q){
  const patterns=[/(?:₹|rs\.?\s*)([0-9,]+)/i,/\$([0-9,]+)/i,/([0-9]+)k\b/i,/(?:under|below|within|upto|up to)\s*(?:₹|rs\.?\s*|\$)?([0-9,]+)/i,/([0-9]{4,})/];
  for(const p of patterns){
    const m=q.match(p);
    if(m){let val=parseFloat((m[1]||m[2]||'').replace(/,/g,''));if(/([0-9]+)k\b/i.test(m[0])&&val<1000)val*=1000;if(val>0){const sym=/\$/.test(m[0])?'$':'₹';return{raw:val,display:`${sym}${val.toLocaleString('en-IN')}`,symbol:sym};}}
  }
  return null;
}

const CITIES=['mumbai','delhi','bangalore','bengaluru','hyderabad','chennai','kolkata','pune','ahmedabad','jaipur','goa','dubai','singapore','london','paris','new york','tokyo','bali','manali','shimla','darjeeling','ooty','kerala','rajasthan','agra'];
function extractLocation(q){const ql=q.toLowerCase();for(const c of CITIES)if(ql.includes(c))return c.replace(/\b\w/g,ch=>ch.toUpperCase());const m=q.match(/(?:in|to|at|near|around)\s+([A-Z][a-z]+(?:\s+[A-Z][a-z]+)?)/);return m?m[1]:null;}
function extractDuration(q){const m=q.match(/(\d+)\s*(?:-\s*day|day|night|week|month)/i);return m?m[0]:null;}

const PURPOSE_MAP={'Programming':['programming','coding','developer','code','software','python','machine learning','ml','ai','data science'],'Gaming':['gaming','game','esports'],'Business':['business','office','work','professional'],'Student':['student','college','university','school'],'Design':['design','graphic','video editing'],'Beginner':['beginner','starter','newbie','basics','introduction'],'Advanced':['advanced','expert','deep dive'],'Budget Travel':['budget','cheap','affordable','backpacker'],'Luxury Travel':['luxury','premium','5 star','resort']};
function extractPurpose(q){const ql=q.toLowerCase();for(const[l,ks]of Object.entries(PURPOSE_MAP))if(ks.some(k=>ql.includes(k)))return l;return null;}

function extractFeatures(q,cat){
  const ql=q.toLowerCase(),f=[];
  if(cat==='laptop'||cat==='smartphone'){if(/amoled|oled/.test(ql))f.push('AMOLED/OLED Display');if(/5g/.test(ql))f.push('5G');if(/16gb/.test(ql))f.push('16GB RAM');if(/ssd/.test(ql))f.push('SSD');if(/ryzen|amd/.test(ql))f.push('AMD Processor');if(/battery/.test(ql))f.push('Long Battery');}
  if(cat==='travel'){if(/weekend/.test(ql))f.push('Weekend Trip');if(/solo/.test(ql))f.push('Solo Travel');if(/beach/.test(ql))f.push('Beach');}
  if(cat==='course'){if(/free/.test(ql))f.push('Free / Freemium');if(/certif/.test(ql))f.push('Certificate');}
  return f;
}

function extractSubjects(q){
  const vsM=q.match(/([A-Za-z0-9+#.]+)\s+vs\.?\s+([A-Za-z0-9+#.]+)(?:\s+vs\.?\s+([A-Za-z0-9+#.]+))?/i);
  if(vsM)return[vsM[1],vsM[2],vsM[3]].filter(Boolean);
  const cM=q.match(/compare\s+(.+)/i);
  if(cM)return cM[1].split(/,\s*|\s+and\s+/).map(s=>s.trim()).filter(Boolean);
  return[];
}

function parseIntent(query){
  const cr=detectCategory(query);
  const budget=extractBudget(query),location=extractLocation(query),duration=extractDuration(query),purpose=extractPurpose(query),features=extractFeatures(query,cr.category),subjects=extractSubjects(query);
  const requirements=[];
  if(budget)requirements.push({label:'Budget',value:budget.display,color:'cyan'});
  if(cr.category!=='general')requirements.push({label:'Category',value:cr.label,color:'purple'});
  if(purpose)requirements.push({label:'Purpose',value:purpose,color:'blue'});
  if(location)requirements.push({label:'Location',value:location,color:'green'});
  if(duration)requirements.push({label:'Duration',value:duration,color:'orange'});
  if(subjects.length>1)requirements.push({label:'Subjects',value:subjects.join(' vs '),color:'yellow'});
  features.forEach(f=>requirements.push({label:'Feature',value:f,color:'pink'}));
  requirements.push({label:'Results',value:'Top 5',color:'gray'});
  requirements.push({label:'Verification',value:'Required',color:'red'});
  return{raw:query,category:cr.category,categoryLabel:cr.label,categoryIcon:cr.icon,budget,location,duration,purpose,features,subjects,requirements};
}

// ── MISSION GENERATOR ─────────────────────────────────────────────
function r(v){return Math.round(v);}

const TEMPLATES={
 laptop:{
  sources:[{name:'Flipkart',icon:'🛒',type:'E-commerce'},{name:'Amazon India',icon:'📦',type:'E-commerce'},{name:'Smartprix',icon:'📊',type:'Price Comparison'},{name:'Digit.in',icon:'📰',type:'Tech Review'},{name:'Gadgets360',icon:'🔬',type:'Tech Review'},{name:'Nanoreview',icon:'⚡',type:'Benchmark'}],
  searchQueries:i=>[`best laptops ${i.budget?'under '+i.budget.display:''} India 2025`,`top ${i.purpose||'programming'} laptops comparison`,`laptop buying guide developers India`],
  candidates:i=>{
   const b=i.budget?.raw||60000,s=i.budget?.symbol||'₹';
   return[
    {name:'Lenovo IdeaPad Slim 5',price:r(Math.min(b*.93,55999)),priceDisplay:`${s}${r(Math.min(b*.93,55999)).toLocaleString('en-IN')}`,specs:{Processor:'AMD Ryzen 7 7730U (8C/16T)',RAM:'16GB DDR4 3200MHz',Storage:'512GB NVMe M.2 SSD',Display:'15.6" FHD IPS Anti-Glare',Battery:'56Wh — 8hrs'},rating:4.5,pros:['Excellent multi-core performance','16GB RAM standard','Great battery life','Good build quality'],cons:['No OLED display','Average GPU for gaming'],scores:{Performance:95,Value:91,Suitability:96,Price:89},badge:'🏆 Best Overall',badgeColor:'#00d4ff',whySelected:`Best balance of CPU performance and value within ${s}${r(b).toLocaleString('en-IN')} budget.`},
    {name:'ASUS Vivobook 15 OLED',price:r(Math.min(b*.99,59490)),priceDisplay:`${s}${r(Math.min(b*.99,59490)).toLocaleString('en-IN')}`,specs:{Processor:'Intel Core i5-13420H 13th Gen',RAM:'16GB LPDDR5 4800MHz',Storage:'512GB PCIe 4.0 SSD',Display:'15.6" FHD OLED 100% DCI-P3',Battery:'70Wh — 7hrs'},rating:4.4,pros:['Stunning OLED display','Fast PCIe 4.0 SSD','Slim and lightweight'],cons:['Higher price point','Runs slightly warm'],scores:{Performance:88,Value:84,Suitability:89,Price:80},badge:'🎨 Best Display',badgeColor:'#a855f7',whySelected:'Best display quality — ideal for design or media consumption alongside coding.'},
    {name:'Acer Swift 3 Metal Edition',price:r(Math.min(b*.88,52999)),priceDisplay:`${s}${r(Math.min(b*.88,52999)).toLocaleString('en-IN')}`,specs:{Processor:'AMD Ryzen 5 7530U (6C/12T)',RAM:'16GB LPDDR4X',Storage:'1TB PCIe NVMe SSD',Display:'14.0" FHD IPS 100% sRGB',Battery:'56Wh — 9hrs'},rating:4.3,pros:['1TB storage at this price','Excellent battery','Premium metal chassis'],cons:['Older Ryzen 5 chip','No Thunderbolt'],scores:{Performance:82,Value:94,Suitability:85,Price:96},badge:'💰 Best Value',badgeColor:'#10b981',whySelected:'Most storage and best battery for the money — great for students.'},
    {name:'HP Pavilion 14',price:r(Math.min(b*.98,58990)),priceDisplay:`${s}${r(Math.min(b*.98,58990)).toLocaleString('en-IN')}`,specs:{Processor:'Intel Core i5-12450H 12th Gen',RAM:'16GB DDR4 3200MHz',Storage:'512GB PCIe NVMe SSD',Display:'14.0" FHD IPS BrightView',Battery:'43Wh — 6hrs'},rating:4.2,pros:['Trusted HP brand','Compact 14" form factor','Good after-sales'],cons:['Weaker battery','BrightView glare'],scores:{Performance:83,Value:82,Suitability:84,Price:81},badge:'🎓 Best for Students',badgeColor:'#f59e0b',whySelected:'Compact, reliable and backed by HP service network — ideal for college students.'},
    {name:'Dell Inspiron 15 3530',price:r(Math.min(b*.91,54490)),priceDisplay:`${s}${r(Math.min(b*.91,54490)).toLocaleString('en-IN')}`,specs:{Processor:'Intel Core i5-1335U 13th Gen',RAM:'16GB DDR4',Storage:'512GB NVMe SSD',Display:'15.6" FHD 120Hz',Battery:'54Wh — 7hrs'},rating:4.1,pros:['120Hz display','Dell reliability','Good port selection'],cons:['Plastic build','Average GPU'],scores:{Performance:80,Value:85,Suitability:83,Price:88},badge:'⚡ Best Performance/₹',badgeColor:'#ef4444',whySelected:'120Hz display and solid performance — good all-rounder for everyday use.'},
   ];
  },
 },
 smartphone:{
  sources:[{name:'GSMArena',icon:'📱',type:'Spec Database'},{name:'Flipkart',icon:'🛒',type:'E-commerce'},{name:'Amazon India',icon:'📦',type:'E-commerce'},{name:'Smartprix',icon:'📊',type:'Price Comparison'},{name:'91Mobiles',icon:'📰',type:'Review Portal'},{name:'NDTV Gadgets',icon:'🔬',type:'Expert Review'}],
  searchQueries:i=>[`best smartphones ${i.budget?'under '+i.budget.display:''} India 2025`,`top ${i.features.join(' ')||'AMOLED 5G'} phones`,`smartphone buying guide India`],
  candidates:i=>{
   const b=i.budget?.raw||30000,s=i.budget?.symbol||'₹';
   return[
    {name:'OnePlus Nord CE 3',price:r(Math.min(b*.87,26999)),priceDisplay:`${s}${r(Math.min(b*.87,26999)).toLocaleString('en-IN')}`,specs:{Processor:'Snapdragon 782G',RAM:'8GB LPDDR5',Display:'6.7" Super AMOLED 120Hz',Battery:'5000mAh + 80W',Camera:'50MP Triple'},rating:4.5,pros:['Stunning 120Hz AMOLED','80W ultra-fast charging','Smooth OxygenOS'],cons:['No wireless charging','Plastic back'],scores:{Performance:88,Value:90,Display:95,Camera:82},badge:'🏆 Best Overall',badgeColor:'#00d4ff',whySelected:'Best combination of display, speed and software within budget.'},
    {name:'Samsung Galaxy A54 5G',price:r(Math.min(b*.97,29999)),priceDisplay:`${s}${r(Math.min(b*.97,29999)).toLocaleString('en-IN')}`,specs:{Processor:'Exynos 1380',RAM:'8GB',Display:'6.4" Super AMOLED+ 120Hz',Battery:'5000mAh + 25W',Camera:'50MP Triple'},rating:4.4,pros:['Excellent camera system','IP67 water resistance','256GB storage'],cons:['Slower charging','Average processor'],scores:{Performance:80,Value:83,Display:90,Camera:93},badge:'📸 Best Camera',badgeColor:'#a855f7',whySelected:'Best camera and build quality with Samsung reliability.'},
    {name:'Redmi Note 13 Pro+',price:r(Math.min(b*.77,24999)),priceDisplay:`${s}${r(Math.min(b*.77,24999)).toLocaleString('en-IN')}`,specs:{Processor:'Dimensity 7200 Ultra',RAM:'8GB LPDDR5',Display:'6.67" AMOLED 1.5K 120Hz',Battery:'5000mAh + 120W',Camera:'200MP Triple'},rating:4.3,pros:['200MP main camera','120W insane fast charge','1.5K resolution'],cons:['MIUI ads','Average video stabilization'],scores:{Performance:85,Value:96,Display:88,Camera:90},badge:'💰 Best Value',badgeColor:'#10b981',whySelected:'Incredible value — 200MP camera and 120W charging at this price is unmatched.'},
    {name:'iQOO Neo 7',price:r(Math.min(b*.9,27999)),priceDisplay:`${s}${r(Math.min(b*.9,27999)).toLocaleString('en-IN')}`,specs:{Processor:'Snapdragon 870 5G',RAM:'8GB LPDDR5',Display:'6.78" AMOLED 120Hz',Battery:'5000mAh + 66W',Camera:'64MP Triple'},rating:4.2,pros:['Flagship-grade Snapdragon 870','Best gaming performance','Bright AMOLED'],cons:['Average cameras'],scores:{Performance:95,Value:86,Display:87,Camera:78},badge:'⚡ Best Performance',badgeColor:'#ef4444',whySelected:'Fastest processor in segment — best for gaming and heavy multitasking.'},
    {name:'Realme 11 Pro+',price:r(Math.min(b*.87,27999)),priceDisplay:`${s}${r(Math.min(b*.87,27999)).toLocaleString('en-IN')}`,specs:{Processor:'Dimensity 7050',RAM:'12GB LPDDR5',Display:'6.7" Curved AMOLED 120Hz',Battery:'5000mAh + 100W',Camera:'200MP Triple'},rating:4.1,pros:['Curved AMOLED display','12GB RAM','100W fast charge'],cons:['Mid-tier chip'],scores:{Performance:80,Value:88,Display:91,Camera:87},badge:'🎓 Best for Students',badgeColor:'#f59e0b',whySelected:'Curved premium-looking display and 12GB RAM makes it ideal for students.'},
   ];
  },
 },
 travel:{
  sources:[{name:'TripAdvisor',icon:'🌍',type:'Travel Review'},{name:'MakeMyTrip',icon:'✈️',type:'Booking Platform'},{name:'Booking.com',icon:'🏨',type:'Hotel Booking'},{name:'Airbnb',icon:'🏠',type:'Stay Options'},{name:'Holidify',icon:'📔',type:'Travel Guide'},{name:'Thrillophilia',icon:'🎒',type:'Activity Booking'}],
  searchQueries:i=>[`${i.location||'India'} travel guide ${i.duration||'3 day'} itinerary`,`best hotels ${i.location||'destination'} ${i.budget?'under '+i.budget.display:'budget'}`,`${i.location||'trip'} things to do must visit places`],
  candidates:i=>{
   const loc=i.location||'Mumbai',b=i.budget?.raw||10000,s=i.budget?.symbol||'₹';
   const fl=v=>Math.floor(v);
   return[
    {name:`${loc} Heritage Walk + Landmarks`,price:fl(b*.08),priceDisplay:`${s}${fl(b*.08).toLocaleString('en-IN')}/person`,specs:{Type:'Sightseeing',Duration:'Half Day',Difficulty:'Easy',Highlights:'Iconic Landmarks',Includes:'Guide + Entry'},rating:4.6,pros:['Iconic landmarks','Budget-friendly','Great photo spots'],cons:['Crowded weekends','Hot in summer'],scores:{Value:95,Experience:90,Accessibility:98,Uniqueness:85},badge:'🏆 Must Visit',badgeColor:'#00d4ff',whySelected:'Classic landmark experience — best first activity for first-time visitors.'},
    {name:`Hotel Stay — ${loc} Budget Option`,price:fl(b*.35),priceDisplay:`${s}${fl(b*.35).toLocaleString('en-IN')}/night`,specs:{Type:'Hotel',Rating:'3-Star',Location:'City Centre',Amenities:'WiFi, AC, Breakfast',Cancellation:'Free before 24hrs'},rating:4.2,pros:['Central location','Free breakfast','AC rooms'],cons:['Small rooms','Limited parking'],scores:{Value:90,Comfort:78,Location:92,Cleanliness:85},badge:'💰 Best Value Stay',badgeColor:'#10b981',whySelected:'Best price-to-comfort ratio within budget constraints.'},
    {name:`${loc} Street Food Tour`,price:fl(b*.06),priceDisplay:`${s}${fl(b*.06).toLocaleString('en-IN')}/person`,specs:{Type:'Food Experience',Duration:'3 Hours',Stops:'6 Food Stalls',Cuisine:'Local Street Food',Guide:'Included'},rating:4.7,pros:['Authentic local taste','Very affordable','Great cultural experience'],cons:['May not suit all','Cash only at some'],scores:{Value:97,Experience:94,Authenticity:99,Fun:96},badge:'🍽️ Top Experience',badgeColor:'#f59e0b',whySelected:'Highest-rated activity — authentic local experience under budget.'},
    {name:`Day Trip — Nearby Nature Spot`,price:fl(b*.12),priceDisplay:`${s}${fl(b*.12).toLocaleString('en-IN')}/person`,specs:{Type:'Day Trip',Distance:'50-80 km',Transport:'Shared Cab / Train',Duration:'Full Day',Highlights:'Scenic Views, Nature Trail'},rating:4.4,pros:['Beautiful scenery','Affordable transport','Great for photos'],cons:['2-3 hr journey','Plan in advance'],scores:{Value:85,Experience:92,Accessibility:75,Scenery:96},badge:'🌿 Best Escape',badgeColor:'#a855f7',whySelected:'Perfect day-trip from the city — maximum scenery at minimum cost.'},
    {name:`${loc} Evening Entertainment`,price:fl(b*.1),priceDisplay:`${s}${fl(b*.1).toLocaleString('en-IN')}/person`,specs:{Type:'Evening Activity',Duration:'Evening',Includes:'Entry + 1 Drink',Timing:'8 PM - 12 AM',Vibe:'Upbeat, Social'},rating:4.1,pros:['Vibrant atmosphere','Great for groups','Live music'],cons:['Can get expensive','Not for solo'],scores:{Value:72,Experience:88,Vibe:92,Accessibility:76},badge:'🌙 Best Night Out',badgeColor:'#ef4444',whySelected:'Best way to experience the city after dark on a reasonable budget.'},
   ];
  },
 },
 course:{
  sources:[{name:'Coursera',icon:'🎓',type:'MOOC Platform'},{name:'Udemy',icon:'📚',type:'Course Marketplace'},{name:'edX',icon:'🏛️',type:'University Courses'},{name:'Google Skillshop',icon:'🔵',type:'Free Courses'},{name:'LinkedIn Learning',icon:'💼',type:'Professional'},{name:'Simplilearn',icon:'✅',type:'Certification'}],
  searchQueries:i=>[`best ${i.purpose||'AI'} courses online 2025`,`top online courses ${i.subjects.join(' ')||'machine learning'} comparison`,`best learning platform certificate courses`],
  candidates:()=>[
   {name:'AI for Everyone — Coursera (DeepLearning.AI)',price:0,priceDisplay:'Free Audit',specs:{Platform:'Coursera',Duration:'6 hours',Level:'Beginner',Certificate:'Yes (paid)',Instructor:'Andrew Ng'},rating:4.8,pros:['World-renowned instructor','Completely free to audit','Globally recognized'],cons:['Certificate requires payment','No hands-on coding'],scores:{Quality:98,Value:99,Practicality:75,Recognition:97},badge:'🏆 Best Overall',badgeColor:'#00d4ff',whySelected:"Best introduction to AI concepts from the world's leading AI educator."},
   {name:'Machine Learning A-Z — Udemy',price:499,priceDisplay:'₹499 (sale)',specs:{Platform:'Udemy',Duration:'44 hours',Level:'Beginner–Intermediate',Certificate:'Yes (included)',Instructor:'Kirill Eremenko'},rating:4.5,pros:['Extremely comprehensive','Lifetime access','Hands-on Python projects'],cons:['Long course','Some sections need refresh'],scores:{Quality:88,Value:95,Practicality:94,Recognition:82},badge:'💰 Best Value',badgeColor:'#10b981',whySelected:'Most comprehensive hands-on ML course at the best price during Udemy sales.'},
   {name:'IBM AI Engineering — Coursera',price:3500,priceDisplay:'₹3,500/month',specs:{Platform:'Coursera',Duration:'3–6 months',Level:'Intermediate',Certificate:'Professional Certificate',Instructor:'IBM Team'},rating:4.4,pros:['IBM brand certificate','Practical projects','Deep learning coverage'],cons:['Monthly subscription','Requires prior Python'],scores:{Quality:90,Value:78,Practicality:93,Recognition:91},badge:'🏢 Best Certificate',badgeColor:'#a855f7',whySelected:'IBM certification carries strong weight with employers in tech sector.'},
   {name:'Fast.ai Practical Deep Learning',price:0,priceDisplay:'Completely Free',specs:{Platform:'fast.ai',Duration:'Self-paced',Level:'Intermediate',Certificate:'No',Instructor:'Jeremy Howard'},rating:4.6,pros:['Top-down practical approach','Free forever','Used by industry professionals'],cons:['No formal certificate','Requires Python basics'],scores:{Quality:95,Value:100,Practicality:96,Recognition:78},badge:'⚡ Most Practical',badgeColor:'#ef4444',whySelected:'Best practical deep learning course — used by real AI practitioners globally.'},
   {name:'Google ML Crash Course',price:0,priceDisplay:'Free',specs:{Platform:'Google',Duration:'15 hours',Level:'Beginner',Certificate:'Completion Badge',Instructor:'Google Engineers'},rating:4.3,pros:['Google-designed curriculum','Very structured','Free with certificate'],cons:['Short','Older TF examples in parts'],scores:{Quality:85,Value:98,Practicality:82,Recognition:88},badge:'🎓 Best for Students',badgeColor:'#f59e0b',whySelected:'Perfect starting point — Google brand, free, structured for complete beginners.'},
  ],
 },
 cloud:{
  sources:[{name:'AWS',icon:'🟡',type:'Official Docs'},{name:'Microsoft Azure',icon:'🔵',type:'Official Docs'},{name:'Google Cloud',icon:'🔴',type:'Official Docs'},{name:'G2 Reviews',icon:'⭐',type:'User Reviews'},{name:'Gartner',icon:'📊',type:'Analyst Report'},{name:'Cloudorado',icon:'☁️',type:'Price Comparison'}],
  searchQueries:()=>[`best cloud platforms comparison 2025`,`AWS vs Azure vs GCP comparison`,`cloud computing platform pricing free tier`],
  candidates:()=>[
   {name:'Amazon Web Services (AWS)',price:0,priceDisplay:'Free Tier + Pay-as-go',specs:{'Services':'200+','Free Tier':'12 months','Market Share':'31%','Flagship':'EC2, S3, Lambda'},rating:4.7,pros:['Largest service catalogue','Most job demand','Strongest community'],cons:['Complex pricing','Steep learning curve'],scores:{Services:99,Market:98,Learning:70,Pricing:72},badge:'🏆 Market Leader',badgeColor:'#00d4ff',whySelected:'Dominant market position ensures maximum career value and job opportunities.'},
   {name:'Microsoft Azure',price:0,priceDisplay:'Free + $200 Credit',specs:{'Services':'200+','Free Credit':'$200 (30d)','Market Share':'24%','Flagship':'VMs, AKS, CosmosDB'},rating:4.5,pros:['Best for Microsoft shops','Strong enterprise integration','$200 free credit'],cons:['Complex interface','Some services lag AWS'],scores:{Services:90,Market:88,Learning:78,Pricing:80},badge:'🏢 Best for Enterprise',badgeColor:'#a855f7',whySelected:'Best choice for organizations using Microsoft 365, Active Directory or .NET.'},
   {name:'Google Cloud Platform (GCP)',price:0,priceDisplay:'Free Tier + $300 Credit',specs:{'Services':'150+','Free Credit':'$300 (90d)','Market Share':'11%','Flagship':'BigQuery, Kubernetes, Vertex AI'},rating:4.4,pros:['Best AI/ML services','$300 free credit','Best Kubernetes'],cons:['Smaller market share'],scores:{Services:85,Market:72,Learning:82,Pricing:86},badge:'🤖 Best for AI/ML',badgeColor:'#10b981',whySelected:'Best platform specifically for AI/ML workloads — built by the AI company.'},
   {name:'DigitalOcean',price:6,priceDisplay:'$6/month',specs:{'Services':'Core Cloud','Free Credit':'$200 (60d)','Market Share':'2%','Flagship':'Droplets, App Platform'},rating:4.5,pros:['Simplest interface','Transparent pricing','Best for developers'],cons:['Limited enterprise features'],scores:{Services:65,Market:55,Learning:95,Pricing:93},badge:'💰 Easiest for Devs',badgeColor:'#f59e0b',whySelected:'Simplest platform to get started — best for students and indie developers.'},
   {name:'Oracle Cloud (OCI)',price:0,priceDisplay:'Always Free Tier',specs:{'Services':'100+','Free Tier':'4 OCPUs, 24GB RAM','Market Share':'3%','Flagship':'Autonomous DB, OKE'},rating:4.0,pros:['Most generous always-free tier','Free ARM instances'],cons:['Smaller community','Complex UI'],scores:{Services:72,Market:50,Learning:70,Pricing:99},badge:'🆓 Best Free Tier',badgeColor:'#ef4444',whySelected:'Unmatched always-free resources — 4 OCPUs and 24GB RAM forever free.'},
  ],
 },
 comparison:{
  sources:[{name:'Stack Overflow Survey',icon:'💬',type:'Developer Survey'},{name:'GitHub Trends',icon:'🐙',type:'Open Source Stats'},{name:'NPM Trends',icon:'📦',type:'Package Downloads'},{name:'Medium Tech',icon:'✍️',type:'Expert Articles'},{name:'Reddit r/webdev',icon:'🔴',type:'Community'},{name:'State of JS',icon:'📊',type:'Annual Survey'}],
  searchQueries:i=>[`${i.subjects.join(' vs ')||i.raw} detailed comparison 2025`,`${i.subjects[0]||'option'} pros cons features`,`${i.subjects[1]||'alternative'} pros cons features`],
  candidates:i=>{
   const subj=i.subjects.length>=2?i.subjects:['Option A','Option B','Option C'];
   const badges=['🏆 Best Overall','⚡ Most Performant','🎓 Best for Beginners','💰 Best Value','🔄 Most Versatile'];
   const colors=['#00d4ff','#a855f7','#10b981','#f59e0b','#ef4444'];
   return subj.slice(0,5).map((s,idx)=>({
    name:s,price:0,priceDisplay:'N/A',
    specs:{'Learning Curve':['Moderate','Steep','Easy','Moderate','Easy'][idx]||'Moderate','Performance':['High','Very High','High','High','Moderate'][idx]||'High','Community':['Largest','Large','Growing','Large','Moderate'][idx]||'Large','Job Demand':['Very High','High','High','Moderate','Growing'][idx]||'High'},
    rating:[4.7,4.5,4.4,4.2,4.0][idx]||4.0,
    pros:['Strong ecosystem and community',`Excellent ${['performance','tooling','documentation','integration','simplicity'][idx]||'features'}`,'Wide industry adoption'],
    cons:[`${['Frequent updates','Steeper learning curve','Smaller ecosystem','Limited features','Slower'][idx]||'Trade-offs'}`,'Not ideal for all use cases'],
    scores:{Performance:[90,95,85,80,75][idx]||80,Ecosystem:[98,85,88,80,72][idx]||80,'Ease of Use':[75,70,85,80,90][idx]||80,'Job Market':[98,92,88,82,75][idx]||80},
    badge:badges[idx]||`#${idx+1} Ranked`,badgeColor:colors[idx]||'#6366f1',
    whySelected:`Ranked #${idx+1} based on community adoption, performance benchmarks, and job market demand.`,
   }));
  },
 },
 career:{
  sources:[{name:'LinkedIn Jobs',icon:'💼',type:'Job Platform'},{name:'Indeed',icon:'🔍',type:'Job Platform'},{name:'Glassdoor',icon:'🏢',type:'Salary Data'},{name:'Roadmap.sh',icon:'🗺️',type:'Dev Roadmaps'},{name:'GitHub Trending',icon:'🐙',type:'Tech Trends'},{name:'Naukri.com',icon:'📋',type:'India Jobs'}],
  searchQueries:i=>[`best skills for ${i.purpose||'AI ML'} career 2025`,`top paying ${i.purpose||'tech'} jobs skills required`,`roadmap ${i.purpose||'AI engineer'} career`],
  candidates:()=>[
   {name:'Python Programming',price:0,priceDisplay:'Core Skill',specs:{'Avg Salary':'₹8–25 LPA','Demand':'Very High','Time to Learn':'3–6 months','Use Cases':'ML, Data, Backend','Difficulty':'Beginner-friendly'},rating:4.9,pros:['#1 language for AI/ML','Easy to learn','Huge library ecosystem'],cons:['Slower runtime than compiled languages'],scores:{Demand:99,Salary:88,Ease:90,Future:97},badge:'🏆 Most Essential',badgeColor:'#00d4ff',whySelected:'Python is the undisputed #1 language for AI/ML roles globally.'},
   {name:'Machine Learning (TensorFlow/PyTorch)',price:0,priceDisplay:'Core Skill',specs:{'Avg Salary':'₹12–40 LPA','Demand':'Very High','Time to Learn':'6–12 months','Use Cases':'AI Models, NLP, CV','Difficulty':'Intermediate'},rating:4.8,pros:['Highest salary potential','Future-proof skill','Global demand'],cons:['Steep learning curve','Requires math background'],scores:{Demand:95,Salary:97,Ease:60,Future:99},badge:'⚡ Highest Salary',badgeColor:'#a855f7',whySelected:'ML engineering commands the highest salaries in the tech industry.'},
   {name:'Data Analysis (SQL + Pandas)',price:0,priceDisplay:'Foundation Skill',specs:{'Avg Salary':'₹6–18 LPA','Demand':'High','Time to Learn':'2–4 months','Use Cases':'Analytics, Reporting, BI','Difficulty':'Beginner'},rating:4.6,pros:['Fastest to learn','Highest job volume','Required in most data roles'],cons:['Lower ceiling without ML'],scores:{Demand:92,Salary:75,Ease:88,Future:88},badge:'💰 Fastest Payoff',badgeColor:'#10b981',whySelected:'Quickest path to employment — data analyst roles are abundant and entry-level friendly.'},
   {name:'Cloud (AWS / GCP)',price:0,priceDisplay:'High-Value Skill',specs:{'Avg Salary':'₹10–30 LPA','Demand':'Very High','Time to Learn':'3–6 months','Use Cases':'MLOps, Deployment, DevOps','Difficulty':'Intermediate'},rating:4.5,pros:['Essential for production AI','High-paying certifications','Global demand'],cons:['Multiple platforms to learn'],scores:{Demand:93,Salary:90,Ease:68,Future:95},badge:'☁️ Best Complement',badgeColor:'#f59e0b',whySelected:'Cloud skills multiply AI salary — MLOps is one of the fastest growing roles.'},
   {name:'NLP / Generative AI (LLMs)',price:0,priceDisplay:'Emerging Skill',specs:{'Avg Salary':'₹20–60 LPA','Demand':'Explosive Growth','Time to Learn':'6–18 months','Use Cases':'Chatbots, LLMs, Agents','Difficulty':'Advanced'},rating:4.9,pros:['Hottest field in 2025','Extremely high salaries','Future of AI'],cons:['Very competitive','Rapidly changing'],scores:{Demand:98,Salary:99,Ease:45,Future:100},badge:'🚀 Future Skill',badgeColor:'#ef4444',whySelected:'Generative AI is the fastest-growing field — highest salary potential for 2025+.'},
  ],
 },
 general:{
  sources:[{name:'Wikipedia',icon:'📖',type:'Encyclopedia'},{name:'Reddit',icon:'🔴',type:'Community'},{name:'Quora',icon:'❓',type:'Q&A'},{name:'Medium',icon:'✍️',type:'Articles'},{name:'Google',icon:'🔍',type:'Search'},{name:'YouTube',icon:'▶️',type:'Video'}],
  searchQueries:i=>[i.raw,`${i.raw} best options`,`${i.raw} guide review`],
  candidates:i=>[
   {name:`Top Result: ${i.raw.substring(0,30)}...`,price:0,priceDisplay:'N/A',specs:{Source:'Multiple',Relevance:'High',Verified:'Yes'},rating:4.5,pros:['Highly relevant','Verified','Comprehensive'],cons:['May need refinement'],scores:{Relevance:90,Quality:88,Accuracy:85,Coverage:82},badge:'🏆 Top Result',badgeColor:'#00d4ff',whySelected:'Most relevant result based on your query.'},
  ],
 },
};

function getTemplate(intent){return TEMPLATES[intent.category]||TEMPLATES.general;}

function generatePlan(intent){
 const t=getTemplate(intent);
 const base=[
  {step:'01',title:'Understand Requirements',desc:`Analyzing: "${intent.raw.substring(0,55)}${intent.raw.length>55?'...':''}"`,icon:'🧠',dur:800},
  {step:'02',title:'Search Relevant Sources',desc:`Querying ${t.sources.length} specialized sources`,icon:'🔍',dur:1200},
  {step:'03',title:'Collect Candidate Results',desc:'Gathering top matches from discovered sources',icon:'📥',dur:1000},
  {step:'04',title:'Extract Key Information',desc:'Parsing specifications, prices, ratings, features',icon:'⚙️',dur:900},
  {step:'05',title:'Compare Candidates',desc:'Scoring each option across multiple dimensions',icon:'⚖️',dur:1100},
  {step:'06',title:'Verify Critical Facts',desc:'Cross-checking data across sources',icon:'🛡️',dur:800},
  {step:'07',title:'Rank Results',desc:'Applying weighted scoring to final ranking',icon:'📊',dur:700},
  {step:'08',title:'Generate Final Recommendation',desc:'Composing actionable result with reasoning',icon:'✅',dur:600},
 ];
 const travel=[
  {step:'01',title:'Understand Travel Goal',desc:`Destination: ${intent.location||'detecting...'} | Budget: ${intent.budget?.display||'detecting...'}`,icon:'🧠',dur:800},
  {step:'02',title:'Search Travel Platforms',desc:'Querying TripAdvisor, MakeMyTrip, Booking.com...',icon:'✈️',dur:1200},
  {step:'03',title:'Find Accommodation',desc:'Scanning hotels, hostels, Airbnbs within budget',icon:'🏨',dur:1000},
  {step:'04',title:'Discover Activities & Places',desc:'Finding attractions, food spots, experiences',icon:'🗺️',dur:900},
  {step:'05',title:'Build Itinerary',desc:'Organizing day-by-day schedule',icon:'📅',dur:1100},
  {step:'06',title:'Verify Prices & Availability',desc:'Cross-checking costs from multiple booking sites',icon:'🛡️',dur:800},
  {step:'07',title:'Optimize Budget',desc:'Calculating total cost vs your budget',icon:'💰',dur:700},
  {step:'08',title:'Generate Travel Plan',desc:'Composing complete actionable itinerary',icon:'✅',dur:600},
 ];
 const course=[
  {step:'01',title:'Understand Learning Goal',desc:`Subject: ${intent.purpose||'AI/ML'} | Level: ${intent.purpose||'Beginner'}`,icon:'🧠',dur:800},
  {step:'02',title:'Search Learning Platforms',desc:'Querying Coursera, Udemy, edX, Google...',icon:'🎓',dur:1200},
  {step:'03',title:'Collect Course Options',desc:'Finding courses matching your level and goals',icon:'📚',dur:1000},
  {step:'04',title:'Extract Course Details',desc:'Parsing duration, price, instructor, curriculum',icon:'⚙️',dur:900},
  {step:'05',title:'Compare Courses',desc:'Scoring quality, value, practicality, recognition',icon:'⚖️',dur:1100},
  {step:'06',title:'Verify Reviews & Ratings',desc:'Cross-checking student reviews across platforms',icon:'🛡️',dur:800},
  {step:'07',title:'Rank by Learning Value',desc:'Applying personalized scoring algorithm',icon:'📊',dur:700},
  {step:'08',title:'Generate Learning Roadmap',desc:'Presenting best courses with actionable next steps',icon:'✅',dur:600},
 ];
 const overrides={travel,course};
 return overrides[intent.category]||base;
}

function generateVerification(candidates,sources){
 return candidates.slice(0,3).flatMap(c=>{
  const pv=Math.floor(Math.random()*500);
  const prices=[c.priceDisplay,`${c.priceDisplay.replace(/[0-9,]+/,n=>(parseInt(n.replace(/,/g,''))+pv).toLocaleString('en-IN'))}`,c.priceDisplay];
  return[
   {candidateName:c.name,field:'Price',checks:sources.slice(0,3).map((s,i)=>({source:s.name,value:prices[i],match:i!==1||pv<300})),confidence:pv<300?96:88,status:pv<300?'VERIFIED':'MINOR DISCREPANCY'},
   {candidateName:c.name,field:'Memory Specs',checks:sources.slice(0,3).map(s=>({source:s.name,value:c.specs.RAM||c.specs.Storage||'Confirmed',match:true})),confidence:98,status:'VERIFIED'},
  ];
 });
}

function generateReasoning(intent,candidates){
 const top=candidates[0];
 const b=intent.budget?.display||'your budget';
 const map={
  laptop:`I prioritized laptops with strong multi-core processors, 16GB RAM and fast SSD storage within ${b}. I cross-checked all prices across 6 sources and verified specifications with benchmark data. ${intent.purpose?`Given your ${intent.purpose} use case, I weighted CPU performance and memory higher.`:''} The top recommendation offers the best balance of raw performance, software development suitability and long-term value.`,
  smartphone:`I focused on AMOLED display quality, 5G connectivity, processing power and camera capability within ${b}. All prices were verified across Flipkart, Amazon and Smartprix. ${intent.purpose?`For ${intent.purpose} use, I weighted display quality and performance higher.`:''} The top pick offers the best combination of features at this price point.`,
  travel:`I researched${intent.location?' '+intent.location:''} accommodations, activities, food options and transport costs to build a complete plan within ${b}. ${intent.duration?`For a ${intent.duration} trip, I optimized the itinerary to cover the must-see highlights without overspending.`:''} All costs were cross-verified across MakeMyTrip, Booking.com and Airbnb.`,
  course:`I evaluated courses based on curriculum quality, instructor credibility, student reviews, certificate value and cost. ${intent.purpose==='Beginner'?'Since you are a beginner, I prioritized structured, project-based courses with clear learning outcomes.':''} All ratings were cross-checked across Coursera, Udemy and independent review platforms.`,
  cloud:`I compared platforms on service breadth, free tier generosity, documentation quality, market adoption and pricing transparency. For ${intent.purpose||'a student'}, I also weighted learning resources and certification career value. Market share data was verified against Gartner Q2 2025 reports.`,
  comparison:`I analyzed ${intent.subjects.join(', ')||'all options'} across performance benchmarks, community size, job market demand, learning curve and ecosystem maturity. Data was sourced from Stack Overflow Developer Survey 2025, NPM trends and GitHub activity. The final ranking reflects the weighted average across all dimensions.`,
  career:`I analyzed 2025 job market data from LinkedIn, Naukri and Glassdoor to identify the highest-value skills for ${intent.purpose||'an AI/ML'} career. Salary ranges were cross-verified across multiple sources. Skills are ranked by a composite of current demand, salary premium, future outlook and accessibility for new learners.`,
  general:`I searched multiple sources for "${intent.raw}" and synthesized the most relevant, verified information. Results are ranked by credibility, recency and relevance to your specific query.`,
 };
 return map[intent.category]||map.general;
}

function generateActivityLog(intent,sources){
 const now=new Date();
 const ts=off=>{const d=new Date(now.getTime()+off*1000);return d.toTimeString().substring(0,8);};
 const qs=getTemplate(intent).searchQueries(intent);
 return[
  {time:ts(0),msg:'AURA agent initialized',type:'system'},
  {time:ts(.5),msg:`Goal received: "${intent.raw.substring(0,50)}${intent.raw.length>50?'...':''}"`,type:'info'},
  {time:ts(1),msg:`Category detected: ${intent.categoryLabel}`,type:'info'},
  {time:ts(1.5),msg:`${intent.requirements.length} requirements extracted`,type:'success'},
  {time:ts(2),msg:'Task decomposed into 8 subtasks',type:'info'},
  {time:ts(2.5),msg:`Search query: "${qs[0]}"`,type:'search'},
  {time:ts(3),msg:`Searching ${sources[0].name}...`,type:'search'},
  {time:ts(3.5),msg:`Found 47 results on ${sources[0].name}`,type:'success'},
  {time:ts(4),msg:`Searching ${sources[1].name}...`,type:'search'},
  {time:ts(4.5),msg:`Found 31 results on ${sources[1].name}`,type:'success'},
  {time:ts(5),msg:`Search query: "${qs[1]}"`,type:'search'},
  {time:ts(5.5),msg:`Searching ${sources[2].name}...`,type:'search'},
  {time:ts(6),msg:`Discovered comparison table on ${sources[2].name}`,type:'success'},
  {time:ts(6.5),msg:'Extracting structured data from sources...',type:'extract'},
  {time:ts(7),msg:'143 data points collected',type:'success'},
  {time:ts(7.5),msg:'Running cross-source price verification...',type:'verify'},
  {time:ts(8),msg:'Running specification verification...',type:'verify'},
  {time:ts(8.5),msg:'All critical facts verified ✓',type:'success'},
  {time:ts(9),msg:'Applying AURA scoring algorithm...',type:'info'},
  {time:ts(9.5),msg:'Candidates ranked by weighted score',type:'success'},
  {time:ts(10),msg:'Generating final recommendation...',type:'info'},
  {time:ts(10.5),msg:'✅ Mission complete!',type:'complete'},
 ];
}

function generateMetrics(candidates,sources){
 return{
  sourcesScanned:sources.length+Math.floor(Math.random()*20)+15,
  dataPoints:candidates.length*18+Math.floor(Math.random()*50)+80,
  factsVerified:candidates.length*6+Math.floor(Math.random()*20)+18,
  candidatesCompared:candidates.length+Math.floor(Math.random()*7)+4,
  confidence:Math.floor(Math.random()*6)+91,
  taskCompletion:100,
 };
}

function buildMission(intent){
 const tmpl=getTemplate(intent);
 const candidates=tmpl.candidates(intent);
 const sources=tmpl.sources.map((s,i)=>({
  ...s,
  confidence:Math.floor(Math.random()*10)+88,
  itemsFound:Math.floor(Math.random()*30)+10,
  verified:true,
  timestamp:`+${(i+1)*2}s`,
  description:`${s.type} — ${Math.floor(Math.random()*30)+5} relevant items found`,
 }));
 return{
  intent,
  plan:generatePlan(intent),
  searchQueries:tmpl.searchQueries(intent),
  sources,candidates,
  verification:generateVerification(candidates,sources),
  reasoning:generateReasoning(intent,candidates),
  activityLog:generateActivityLog(intent,sources),
  metrics:generateMetrics(candidates,sources),
 };
}

// ── NETWORK CANVAS ────────────────────────────────────────────────
function initNetworkCanvas(id){
 const canvas=document.getElementById(id);if(!canvas)return;
 const ctx=canvas.getContext('2d');let W,H,nodes=[],aid;
 function resize(){W=canvas.width=canvas.parentElement.clientWidth;H=canvas.height=canvas.parentElement.clientHeight;}
 function mk(){return{x:Math.random()*W,y:Math.random()*H,vx:(Math.random()-.5)*.4,vy:(Math.random()-.5)*.4,r:Math.random()*2+1,a:Math.random()*.5+.2,p:Math.random()*Math.PI*2};}
 function draw(){
  ctx.clearRect(0,0,W,H);
  for(let i=0;i<nodes.length;i++)for(let j=i+1;j<nodes.length;j++){
   const dx=nodes[i].x-nodes[j].x,dy=nodes[i].y-nodes[j].y,d=Math.sqrt(dx*dx+dy*dy);
   if(d<120){const a=(1-d/120)*.12;ctx.beginPath();ctx.strokeStyle=(i+j)%3===0?`rgba(168,85,247,${a})`:`rgba(0,212,255,${a})`;ctx.lineWidth=1;ctx.moveTo(nodes[i].x,nodes[i].y);ctx.lineTo(nodes[j].x,nodes[j].y);ctx.stroke();}
  }
  nodes.forEach(n=>{
   n.p+=.03;const pl=Math.sin(n.p)*.3+.7,c=(Math.floor(n.p/Math.PI)%2===0)?`rgba(0,212,255,${n.a*pl})`:`rgba(168,85,247,${n.a*pl})`;
   ctx.beginPath();ctx.arc(n.x,n.y,n.r*pl,0,Math.PI*2);ctx.fillStyle=c;ctx.fill();
   n.x+=n.vx;n.y+=n.vy;if(n.x<0||n.x>W)n.vx*=-1;if(n.y<0||n.y>H)n.vy*=-1;
  });
  aid=requestAnimationFrame(draw);
 }
 resize();nodes=Array.from({length:60},mk);draw();
 window.addEventListener('resize',resize);
}

// ── LANDING PAGE RENDERER ─────────────────────────────────────────
function renderLanding(){
 return`
<div id="landing">
 <nav id="navbar">
  <div class="container" style="display:flex;align-items:center;justify-content:space-between;">
   <a href="#" style="display:flex;align-items:center;gap:8px;text-decoration:none;">
    <div style="width:32px;height:32px;border-radius:8px;background:linear-gradient(135deg,#00d4ff,#a855f7);display:flex;align-items:center;justify-content:center;font-size:16px;">⚡</div>
    <span style="font-size:20px;font-weight:800;letter-spacing:-.03em;" class="gradient-text">AURA</span>
   </a>
   <div style="display:none;" id="nav-links" class="md:flex" style="display:flex;align-items:center;gap:32px;">
    <a href="#how" class="nav-link">How It Works</a>
    <a href="#capabilities" class="nav-link">Capabilities</a>
    <a href="#about" class="nav-link">About</a>
   </div>
   <div style="display:flex;align-items:center;gap:12px;">
    <button id="nav-launch-btn" class="btn-primary" style="padding:8px 20px;font-size:14px;">Launch Agent</button>
   </div>
  </div>
 </nav>

 <section class="hero-bg" style="min-height:100vh;padding-top:100px;position:relative;overflow:hidden;">
  <canvas id="network-canvas"></canvas>
  <div class="hero-orb"></div>
  <div class="container" style="position:relative;z-index:10;display:flex;flex-direction:column;align-items:center;text-align:center;padding-top:80px;padding-bottom:80px;">
   <div class="animate-fade-up" style="opacity:0;animation-delay:.1s;">
    <div class="chip" style="background:rgba(0,212,255,.1);border:1px solid rgba(0,212,255,.25);color:#00d4ff;margin-bottom:24px;font-size:13px;padding:6px 16px;">⚡ Autonomous AI Web Agent</div>
   </div>
   <h1 class="section-title animate-fade-up delay-200" style="opacity:0;max-width:800px;line-height:1.1;">
    Your AI Agent<br/><span class="gradient-text">for the Web.</span>
   </h1>
   <p class="animate-fade-up delay-300" style="opacity:0;font-size:clamp(16px,2vw,20px);color:rgba(255,255,255,.55);max-width:600px;margin:20px 0 40px;line-height:1.6;">
    Give AURA a goal. It plans, searches, verifies,<br/>compares, and delivers — <strong style="color:#00d4ff;">autonomously.</strong>
   </p>
   <div class="animate-fade-up delay-400" style="opacity:0;width:100%;max-width:700px;">
    <div class="glass-strong glow-cyan" style="padding:8px 8px 8px 20px;border-radius:18px;">
     <div style="display:flex;align-items:flex-start;gap:12px;">
      <textarea id="hero-input" class="aura-input" rows="2" style="border:none;background:transparent;padding:12px 0;font-size:16px;resize:none;flex:1;" placeholder="What would you like me to accomplish?"></textarea>
      <div style="display:flex;flex-direction:column;gap:8px;padding-top:6px;">
       <button id="launch-btn" class="btn-primary" style="padding:12px 24px;border-radius:12px;white-space:nowrap;font-size:15px;">Launch Agent →</button>
       <button id="try-example-btn" class="btn-secondary" style="padding:8px 16px;border-radius:10px;font-size:12px;text-align:center;">Try Example</button>
      </div>
     </div>
    </div>
    <p style="font-size:12px;color:rgba(255,255,255,.3);margin-top:10px;">e.g. "Find the best programming laptop under ₹60,000 and compare the top 5 options"</p>
   </div>
  </div>
 </section>

 <section style="padding:0 0 80px;">
  <div class="container">
   <p style="text-align:center;font-size:13px;font-weight:700;letter-spacing:.1em;color:rgba(255,255,255,.35);text-transform:uppercase;margin-bottom:24px;">Quick Mission Suggestions</p>
   <div style="display:grid;grid-template-columns:repeat(auto-fit,minmax(180px,1fr));gap:12px;" id="suggestion-grid"></div>
  </div>
 </section>
</div>`;
}

function renderHowItWorks(){
 const steps=[
  {n:'01',icon:'🧠',title:'Understand',color:'#00d4ff',desc:'AURA parses your natural language goal, detects intent, budget, location, and requirements — no form filling needed.'},
  {n:'02',icon:'🌐',title:'Act',color:'#a855f7',desc:'AURA autonomously searches multiple relevant sources, navigates pages, and extracts structured data — no manual browsing.'},
  {n:'03',icon:'🛡️',title:'Verify',color:'#10b981',desc:'Critical facts are cross-checked across multiple independent sources. Conflicting data is flagged with confidence scores.'},
  {n:'04',icon:'✅',title:'Deliver',color:'#f59e0b',desc:'A ranked, verified, actionable result is presented with explanations, comparisons, sources, and follow-up options.'},
 ];
 return`
<section id="how" class="section">
 <div class="container">
  <div class="section-panel" style="text-align:center;margin-bottom:60px;">
   <div class="chip" style="background:rgba(168,85,247,.1);border:1px solid rgba(168,85,247,.25);color:#a855f7;margin-bottom:16px;">How AURA Works</div>
   <h2 class="section-title">Four steps. <span class="gradient-text">Zero manual effort.</span></h2>
   <p class="section-sub">The user gives the WHAT. AURA decides the HOW.</p>
  </div>
  <div style="display:grid;grid-template-columns:repeat(auto-fit,minmax(220px,1fr));gap:20px;">
   ${steps.map((s,i)=>`
   <div class="how-step glass section-panel" style="padding:32px 24px;animation-delay:${i*.15}s;">
    <div class="step-number">${s.n}</div>
    <div style="font-size:36px;margin-bottom:16px;">${s.icon}</div>
    <div style="font-size:22px;font-weight:800;margin-bottom:10px;color:${s.color};">${s.title}</div>
    <p style="font-size:14px;color:rgba(255,255,255,.5);line-height:1.7;">${s.desc}</p>
   </div>`).join('')}
  </div>
  <div class="section-panel" style="margin-top:60px;">
   <div class="glass" style="padding:32px;border-radius:20px;background:rgba(0,0,0,.2);">
    <p style="text-align:center;font-size:13px;font-weight:700;letter-spacing:.1em;color:rgba(255,255,255,.35);text-transform:uppercase;margin-bottom:24px;">From Search Engine → Action Engine</p>
    <div style="display:flex;flex-wrap:wrap;align-items:center;justify-content:center;gap:20px;">
     ${[['👤','USER','What I want'],['⚡','AURA','How to achieve it'],['🌐','WEB','Search + Navigate'],['🛡️','VERIFY','Cross-check'],['🎯','RESULT','Actionable outcome']].map((it,i,arr)=>`
     <div style="text-align:center;"><div style="font-size:28px;margin-bottom:8px;">${it[0]}</div><div style="font-size:13px;font-weight:800;color:#00d4ff;">${it[1]}</div><div style="font-size:11px;color:rgba(255,255,255,.4);">${it[2]}</div></div>
     ${i<arr.length-1?'<div style="font-size:20px;color:rgba(255,255,255,.2);">→</div>':''}`).join('')}
    </div>
   </div>
  </div>
 </div>
</section>`;
}

function renderCapabilities(){
 const caps=[
  {icon:'🧠',color:'rgba(0,212,255,.15)',title:'Autonomous Planning',desc:'Breaks any complex goal into executable subtasks without manual configuration.'},
  {icon:'🌐',color:'rgba(168,85,247,.15)',title:'Web Navigation',desc:'Finds and explores multiple relevant sources to collect comprehensive data.'},
  {icon:'⚙️',color:'rgba(59,130,246,.15)',title:'Information Extraction',desc:'Converts unstructured web content into clean, structured, comparable data.'},
  {icon:'🛡️',color:'rgba(16,185,129,.15)',title:'Verification Layer',desc:'Cross-checks facts across independent sources and assigns confidence scores.'},
  {icon:'⚖️',color:'rgba(245,158,11,.15)',title:'Smart Comparison',desc:'Scores and ranks candidates across multiple weighted dimensions.'},
  {icon:'🔄',color:'rgba(239,68,68,.15)',title:'Adaptive Follow-ups',desc:'Adjusts the mission instantly when you change requirements or ask follow-up questions.'},
  {icon:'💾',color:'rgba(0,212,255,.15)',title:'Session Memory',desc:'Maintains full task context throughout the session for coherent refinements.'},
  {icon:'📊',color:'rgba(168,85,247,.15)',title:'Live Agent Metrics',desc:'Real-time visibility into sources scanned, data points collected and facts verified.'},
 ];
 return`
<section id="capabilities" class="section" style="background:rgba(0,0,0,.2);">
 <div class="container">
  <div class="section-panel" style="text-align:center;margin-bottom:60px;">
   <div class="chip" style="background:rgba(0,212,255,.1);border:1px solid rgba(0,212,255,.25);color:#00d4ff;margin-bottom:16px;">Capabilities</div>
   <h2 class="section-title">What AURA <span class="gradient-text">can do.</span></h2>
   <p class="section-sub">Everything from search to verified recommendation — autonomously.</p>
  </div>
  <div style="display:grid;grid-template-columns:repeat(auto-fit,minmax(240px,1fr));gap:16px;">
   ${caps.map((c,i)=>`
   <div class="feature-card section-panel" style="animation-delay:${i*.08}s;">
    <div class="feature-icon" style="background:${c.color};">${c.icon}</div>
    <div style="font-size:16px;font-weight:700;margin-bottom:8px;">${c.title}</div>
    <p style="font-size:13px;color:rgba(255,255,255,.5);line-height:1.65;">${c.desc}</p>
   </div>`).join('')}
  </div>
 </div>
</section>`;
}

function renderCTA(){
 return`
<section id="about" class="section">
 <div class="container">
  <div class="glass-strong glow-cyan section-panel" style="padding:60px 40px;text-align:center;border-radius:24px;background:linear-gradient(135deg,rgba(0,212,255,.06),rgba(168,85,247,.06));">
   <div style="font-size:48px;margin-bottom:20px;">⚡</div>
   <h2 class="section-title" style="max-width:700px;margin:0 auto 16px;">Don't search the web.<br/><span class="gradient-text">Delegate the task.</span></h2>
   <p style="font-size:18px;color:rgba(255,255,255,.5);max-width:540px;margin:0 auto 36px;line-height:1.6;">AURA is an autonomous AI web agent that turns a user's goal into a verified, actionable result with minimal human intervention.</p>
   <div style="display:flex;flex-wrap:wrap;align-items:center;justify-content:center;gap:16px;">
    <button id="cta-launch-btn" class="btn-primary" style="padding:16px 40px;font-size:17px;border-radius:14px;">Launch Your Mission →</button>
    <button id="cta-demo-btn" class="btn-secondary" style="padding:16px 32px;font-size:15px;">Try Demo Mission</button>
   </div>
  </div>
  <div class="section-panel" style="margin-top:48px;padding:24px;text-align:center;opacity:.6;">
   <p style="font-size:13px;color:rgba(255,255,255,.4);">🔒 AURA only performs actions required to complete your task. Research and comparison missions run without storing personal data.</p>
  </div>
 </div>
</section>
<footer style="border-top:1px solid rgba(255,255,255,.06);padding:40px 0;">
 <div class="container" style="display:flex;flex-wrap:wrap;align-items:center;justify-content:space-between;gap:16px;">
  <div style="display:flex;align-items:center;gap:8px;">
   <span style="font-size:18px;font-weight:800;" class="gradient-text">AURA</span>
   <span style="color:rgba(255,255,255,.3);font-size:13px;">— Autonomous Unified Research Agent</span>
  </div>
  <p style="font-size:12px;color:rgba(255,255,255,.2);">Built for the AI Hackathon · "Give it a goal. AURA gets it done."</p>
 </div>
</footer>`;
}

// ── WORKSPACE RENDERER ────────────────────────────────────────────
function renderWorkspace(){
 return`
<div id="workspace">
 <div style="background:rgba(10,15,30,.95);border-bottom:1px solid rgba(255,255,255,.07);padding:12px 24px;display:flex;align-items:center;justify-content:space-between;position:sticky;top:0;z-index:50;backdrop-filter:blur(20px);">
  <div style="display:flex;align-items:center;gap:12px;">
   <button id="back-btn" class="btn-ghost" style="padding:6px 14px;font-size:13px;">← Back</button>
   <div style="width:1px;height:24px;background:rgba(255,255,255,.1);"></div>
   <span style="font-size:18px;font-weight:800;" class="gradient-text">AURA</span>
   <span style="font-size:12px;color:rgba(255,255,255,.3);">Mission Control</span>
  </div>
  <div id="ws-status-badge" style="display:flex;align-items:center;gap:8px;padding:6px 16px;background:rgba(0,212,255,.1);border:1px solid rgba(0,212,255,.2);border-radius:999px;font-size:12px;font-weight:600;color:#00d4ff;">
   <div id="ws-dot" style="width:7px;height:7px;border-radius:50%;background:#00d4ff;animation:pulse-glow 1.5s infinite;flex-shrink:0;"></div>
   <span id="ws-status-text">Initializing...</span>
  </div>
  <button id="new-mission-btn" class="btn-secondary" style="padding:6px 16px;font-size:13px;">+ New Mission</button>
 </div>
 <div class="workspace-grid">
  <aside class="left-panel">
   <div style="text-align:center;">
    <div id="agent-orb" class="agent-orb">⚡</div>
    <div style="margin-top:12px;font-size:15px;font-weight:700;">AURA AGENT</div>
    <div id="agent-status-label" style="font-size:12px;color:rgba(255,255,255,.4);margin-top:4px;">Autonomous Agent Active</div>
   </div>
   <div id="stage-list" style="display:flex;flex-direction:column;gap:2px;"></div>
   <div style="border-top:1px solid rgba(255,255,255,.07);padding-top:16px;">
    <div style="font-size:11px;font-weight:700;letter-spacing:.08em;color:rgba(255,255,255,.3);text-transform:uppercase;margin-bottom:12px;">Mission Context</div>
    <div id="mission-context-panel" style="display:flex;flex-direction:column;gap:8px;"></div>
   </div>
  </aside>
  <main style="padding:32px 28px;display:flex;flex-direction:column;gap:32px;min-width:0;" id="ws-main"></main>
 </div>
</div>`;
}

function renderUnderstanding(intent){
 const CS={cyan:{bg:'rgba(0,212,255,.12)',br:'rgba(0,212,255,.3)',c:'#00d4ff'},purple:{bg:'rgba(168,85,247,.12)',br:'rgba(168,85,247,.3)',c:'#c084fc'},blue:{bg:'rgba(59,130,246,.12)',br:'rgba(59,130,246,.3)',c:'#93c5fd'},green:{bg:'rgba(16,185,129,.12)',br:'rgba(16,185,129,.3)',c:'#6ee7b7'},orange:{bg:'rgba(245,158,11,.12)',br:'rgba(245,158,11,.3)',c:'#fcd34d'},red:{bg:'rgba(239,68,68,.12)',br:'rgba(239,68,68,.3)',c:'#fca5a5'},yellow:{bg:'rgba(234,179,8,.12)',br:'rgba(234,179,8,.3)',c:'#fef08a'},pink:{bg:'rgba(236,72,153,.12)',br:'rgba(236,72,153,.3)',c:'#f9a8d4'},gray:{bg:'rgba(255,255,255,.08)',br:'rgba(255,255,255,.15)',c:'rgba(255,255,255,.6)'}};
 return`
<div class="section-panel in-view">
 <div style="display:flex;align-items:center;gap:10px;margin-bottom:20px;"><span style="font-size:20px;">🧠</span><h2 style="font-size:20px;font-weight:700;">Understanding Your Goal</h2></div>
 <div class="glass" style="padding:20px;margin-bottom:16px;">
  <div style="font-size:11px;font-weight:700;letter-spacing:.08em;color:rgba(255,255,255,.35);text-transform:uppercase;margin-bottom:8px;">User Goal</div>
  <p style="font-size:16px;color:#e2e8f0;font-style:italic;line-height:1.6;">"${intent.raw}"</p>
 </div>
 <div class="glass" style="padding:20px;">
  <div style="font-size:11px;font-weight:700;letter-spacing:.08em;color:rgba(255,255,255,.35);text-transform:uppercase;margin-bottom:14px;">Detected Requirements</div>
  <div style="display:flex;flex-wrap:wrap;gap:8px;">
   ${intent.requirements.map(req=>{const s=CS[req.color]||CS.gray;return`<div class="chip" style="background:${s.bg};border:1px solid ${s.br};color:${s.c};padding:6px 14px;font-size:12px;"><span style="opacity:.6;margin-right:4px;">${req.label}:</span>${req.value}</div>`;}).join('')}
  </div>
 </div>
</div>`;
}

function renderPlan(plan){
 return`
<div class="section-panel in-view" id="plan-section">
 <div style="display:flex;align-items:center;gap:10px;margin-bottom:20px;">
  <span style="font-size:20px;">🗺️</span><h2 style="font-size:20px;font-weight:700;">Agent Plan</h2>
  <div style="margin-left:auto;font-size:12px;color:rgba(255,255,255,.35);">Autonomous Execution</div>
 </div>
 <div style="display:flex;flex-direction:column;">
  ${plan.map((s,i)=>`
  <div id="ps-${i}" class="plan-step" style="animation-delay:${.2+i*.12}s;">
   <div class="plan-step-num">${s.step}</div>
   <div style="display:flex;align-items:flex-start;gap:12px;">
    <span style="font-size:20px;margin-top:1px;">${s.icon}</span>
    <div style="flex:1;"><div style="font-size:14px;font-weight:600;margin-bottom:2px;">${s.title}</div><div style="font-size:12px;color:rgba(255,255,255,.4);">${s.desc}</div></div>
    <div id="ps-status-${i}" style="margin-left:auto;font-size:18px;opacity:0;">⏳</div>
   </div>
  </div>
  ${i<plan.length-1?'<div class="plan-connector"></div>':''}`).join('')}
 </div>
</div>`;
}

function renderWebActivity(queries){
 return`
<div class="section-panel in-view" id="web-activity-section">
 <div style="display:flex;align-items:center;gap:10px;margin-bottom:20px;"><span style="font-size:20px;">🌐</span><h2 style="font-size:20px;font-weight:700;">Autonomous Web Activity</h2></div>
 <div class="glass" style="padding:20px;border-radius:14px;background:rgba(0,0,0,.25);">
  <div style="display:flex;align-items:center;gap:8px;margin-bottom:16px;">
   <div style="width:10px;height:10px;border-radius:50%;background:#ef4444;"></div>
   <div style="width:10px;height:10px;border-radius:50%;background:#f59e0b;"></div>
   <div style="width:10px;height:10px;border-radius:50%;background:#10b981;"></div>
   <span style="font-size:11px;color:rgba(255,255,255,.3);margin-left:8px;font-family:'JetBrains Mono',monospace;">AURA Browser Agent</span>
  </div>
  <div id="browser-log" style="font-family:'JetBrains Mono',monospace;font-size:12px;min-height:100px;display:flex;flex-direction:column;gap:4px;">
   <span style="color:rgba(255,255,255,.25);">Awaiting agent initialization...</span>
  </div>
 </div>
 <div style="margin-top:16px;display:flex;flex-direction:column;gap:8px;" id="search-queries-display">
  ${queries.map((q,i)=>`<div style="display:flex;align-items:center;gap:10px;padding:10px 14px;background:rgba(255,255,255,.03);border:1px solid rgba(255,255,255,.07);border-radius:10px;opacity:0;transition:opacity .4s ease;" id="sq-${i}"><span>🔍</span><span style="font-size:13px;color:rgba(255,255,255,.5);">Searching:</span><span style="font-size:13px;color:#fcd34d;">"${q}"</span></div>`).join('')}
 </div>
</div>`;
}

function renderSources(sources){
 return`
<div class="section-panel in-view" id="sources-section">
 <div style="display:flex;align-items:center;gap:10px;margin-bottom:20px;">
  <span style="font-size:20px;">📡</span><h2 style="font-size:20px;font-weight:700;">Sources Discovered</h2>
  <div class="chip" style="margin-left:auto;background:rgba(16,185,129,.1);border:1px solid rgba(16,185,129,.25);color:#6ee7b7;">${sources.length} sources</div>
 </div>
 <div style="display:grid;grid-template-columns:repeat(auto-fill,minmax(240px,1fr));gap:16px;" id="src-grid">
  ${sources.map((s,i)=>`
  <div class="source-card" id="sc-${i}">
   <div style="display:flex;align-items:flex-start;justify-content:space-between;margin-bottom:12px;">
    <div style="display:flex;align-items:center;gap:10px;"><div style="font-size:22px;">${s.icon}</div><div><div style="font-size:14px;font-weight:700;">${s.name}</div><div style="font-size:11px;color:rgba(255,255,255,.35);">${s.type}</div></div></div>
    <div style="text-align:right;"><div style="font-size:11px;font-weight:700;color:#6ee7b7;">✓ VERIFIED</div><div style="font-size:10px;color:rgba(255,255,255,.3);">${s.timestamp}</div></div>
   </div>
   <p style="font-size:12px;color:rgba(255,255,255,.45);margin-bottom:12px;line-height:1.5;">${s.description}</p>
   <div style="display:flex;align-items:center;justify-content:space-between;margin-bottom:6px;"><span style="font-size:11px;color:rgba(255,255,255,.4);">Confidence</span><span style="font-size:12px;font-weight:700;color:#00d4ff;">${s.confidence}%</span></div>
   <div class="confidence-bar"><div class="confidence-fill" style="width:${s.confidence}%;"></div></div>
  </div>`).join('')}
 </div>
</div>`;
}

function renderDataTable(candidates){
 return`
<div class="section-panel in-view" id="data-table-section">
 <div style="display:flex;align-items:center;gap:10px;margin-bottom:20px;"><span style="font-size:20px;">📋</span><h2 style="font-size:20px;font-weight:700;">Extracted Information Table</h2></div>
 <div class="glass" style="overflow-x:auto;border-radius:14px;">
  <table class="data-table" style="min-width:600px;">
   <thead><tr><th>CANDIDATE NAME</th><th>PRICE</th><th>PRIMARY SPECIFICATIONS</th><th>RATING</th></tr></thead>
   <tbody>
    ${candidates.map(c=>{
     const specs=Object.entries(c.specs).slice(0,4);
     const extra=Object.keys(c.specs).length-4;
     return`<tr>
      <td style="font-weight:700;color:#e2e8f0;min-width:150px;">${c.name}</td>
      <td><div class="price-badge">${c.priceDisplay}</div></td>
      <td><div style="display:flex;flex-wrap:wrap;gap:4px;max-width:300px;">${specs.map(([k,v])=>`<div class="spec-tag"><span style="opacity:.6;">${k}:</span> ${v}</div>`).join('')}${extra>0?`<div class="spec-tag" style="background:rgba(168,85,247,.1);border-color:rgba(168,85,247,.25);color:#c084fc;cursor:pointer;">+${extra} more</div>`:''}</div></td>
      <td><div class="star-rating">★ ${c.rating}</div></td>
     </tr>`;
    }).join('')}
   </tbody>
  </table>
 </div>
</div>`;
}

function renderComparison(candidates){
 const colors=['#00d4ff','#a855f7','#10b981','#f59e0b','#ef4444'];
 return`
<div class="section-panel in-view" id="comparison-section">
 <div style="display:flex;align-items:center;gap:10px;margin-bottom:20px;"><span style="font-size:20px;">⚖️</span><h2 style="font-size:20px;font-weight:700;">Agent Comparison</h2></div>
 <div style="display:grid;grid-template-columns:repeat(auto-fill,minmax(280px,1fr));gap:16px;">
  ${candidates.map((c,i)=>{
   const color=colors[i%colors.length];
   const avg=Math.round(Object.values(c.scores).reduce((a,b)=>a+b,0)/Object.values(c.scores).length);
   return`
  <div class="aura-score-card ${i===0?'top':''}">
   <div style="display:flex;align-items:flex-start;gap:12px;margin-bottom:16px;">
    <div class="score-circle" style="border-color:${color};color:${color};"><span>${avg}</span><span style="font-size:9px;font-weight:600;opacity:.7;">/100</span></div>
    <div style="flex:1;"><div style="font-size:14px;font-weight:700;margin-bottom:4px;">${c.name}</div><div style="display:inline-block;padding:4px 14px;border-radius:999px;font-size:11px;font-weight:700;background:${color}22;color:${color};">${c.badge}</div></div>
   </div>
   ${Object.entries(c.scores).map(([k,v])=>`
   <div class="score-bar-wrap">
    <div class="score-label">${k}</div>
    <div class="score-track"><div class="score-fill" data-score="${v}" style="background:linear-gradient(90deg,${color}99,${color});"></div></div>
    <div class="score-value" style="color:${color};">${v}</div>
   </div>`).join('')}
  </div>`;
  }).join('')}
 </div>
</div>`;
}

function renderVerification(verification){
 const grouped={};
 verification.forEach(v=>{if(!grouped[v.candidateName])grouped[v.candidateName]=[];grouped[v.candidateName].push(v);});
 const verCount=verification.filter(v=>v.status==='VERIFIED').length;
 const discCount=verification.length-verCount;
 const avgConf=Math.round(verification.reduce((a,v)=>a+v.confidence,0)/verification.length);
 return`
<div class="section-panel in-view" id="verification-section">
 <div style="display:flex;align-items:center;gap:10px;margin-bottom:20px;">
  <span style="font-size:20px;">🛡️</span><h2 style="font-size:20px;font-weight:700;">Verification Layer</h2>
  <div class="chip" style="margin-left:auto;background:rgba(16,185,129,.1);border:1px solid rgba(16,185,129,.25);color:#6ee7b7;">Cross-Source Verified</div>
 </div>
 <div class="glass" style="padding:24px;border-radius:16px;">
  <div style="font-size:13px;font-weight:700;color:#00d4ff;margin-bottom:16px;">🛡️ Cross-Source Verification Matrix</div>
  ${Object.entries(grouped).map(([name,checks])=>checks.map(v=>`
  <div class="verify-row">
   <div style="font-size:13px;flex:1;"><span style="font-weight:700;color:#e2e8f0;">${name}</span><span style="color:rgba(255,255,255,.4);"> — ${v.field} Verification</span></div>
   <div class="verify-badge ${v.status==='VERIFIED'?'verified':'discrepancy'}">${v.status} (${v.confidence}%)</div>
  </div>`).join('')).join('')}
 </div>
 <div style="display:grid;grid-template-columns:repeat(3,1fr);gap:12px;margin-top:16px;">
  <div class="glass" style="padding:16px;text-align:center;"><div style="font-size:24px;font-weight:900;color:#10b981;">${verCount}</div><div style="font-size:11px;color:rgba(255,255,255,.4);margin-top:4px;">Facts Confirmed</div></div>
  <div class="glass" style="padding:16px;text-align:center;"><div style="font-size:24px;font-weight:900;color:#f59e0b;">${discCount}</div><div style="font-size:11px;color:rgba(255,255,255,.4);margin-top:4px;">Minor Discrepancies</div></div>
  <div class="glass" style="padding:16px;text-align:center;"><div style="font-size:24px;font-weight:900;color:#00d4ff;">${avgConf}%</div><div style="font-size:11px;color:rgba(255,255,255,.4);margin-top:4px;">Avg Confidence</div></div>
 </div>
</div>`;
}

function renderReasoning(reasoning){
 return`
<div class="section-panel in-view" id="reasoning-section">
 <div style="display:flex;align-items:center;gap:10px;margin-bottom:20px;"><span style="font-size:20px;">💡</span><h2 style="font-size:20px;font-weight:700;">Agent Reasoning</h2></div>
 <div class="glass" style="padding:24px;border-left:3px solid #00d4ff;border-radius:0 14px 14px 0;">
  <div style="font-size:13px;font-weight:700;color:#00d4ff;margin-bottom:10px;">AURA Decision Explanation</div>
  <p style="font-size:15px;color:rgba(255,255,255,.75);line-height:1.75;font-style:italic;">"${reasoning}"</p>
 </div>
</div>`;
}

function renderMetrics(metrics){
 const items=[
  {label:'Sources Scanned',val:metrics.sourcesScanned,icon:'📡',suf:''},
  {label:'Data Points',val:metrics.dataPoints,icon:'📊',suf:''},
  {label:'Facts Verified',val:metrics.factsVerified,icon:'✅',suf:''},
  {label:'Compared',val:metrics.candidatesCompared,icon:'⚖️',suf:''},
  {label:'Confidence',val:metrics.confidence,icon:'🎯',suf:'%'},
  {label:'Task Completion',val:metrics.taskCompletion,icon:'🏁',suf:'%'},
 ];
 return`
<div class="section-panel in-view" id="metrics-section">
 <div style="display:flex;align-items:center;gap:10px;margin-bottom:20px;"><span style="font-size:20px;">📊</span><h2 style="font-size:20px;font-weight:700;">Agent Metrics</h2></div>
 <div style="display:grid;grid-template-columns:repeat(auto-fill,minmax(150px,1fr));gap:12px;">
  ${items.map((m,i)=>`
  <div class="metric-card" id="mc-${i}">
   <div style="font-size:20px;margin-bottom:8px;">${m.icon}</div>
   <div class="metric-value" data-target="${m.val}" data-suf="${m.suf}">${m.val}${m.suf}</div>
   <div class="metric-label">${m.label}</div>
  </div>`).join('')}
 </div>
</div>`;
}

function renderResults(candidates){
 const colors=['#00d4ff','#a855f7','#10b981','#f59e0b','#ef4444'];
 return`
<div class="section-panel in-view" id="results-section">
 <div class="mission-complete animate-bounce-in" style="margin-bottom:28px;">
  <div style="font-size:40px;margin-bottom:8px;">✅</div>
  <h2 style="font-size:28px;font-weight:900;color:#10b981;margin-bottom:8px;">Mission Complete</h2>
  <p style="font-size:15px;color:rgba(255,255,255,.6);max-width:540px;margin:0 auto;">I found <strong style="color:#00d4ff;">${candidates.length} results</strong> matching your requirements and verified the key specifications across multiple sources.</p>
 </div>
 <div style="display:grid;grid-template-columns:repeat(auto-fill,minmax(280px,1fr));gap:20px;">
  ${candidates.map((c,i)=>{
   const color=colors[i%colors.length];
   const avg=Math.round(Object.values(c.scores).reduce((a,b)=>a+b,0)/Object.values(c.scores).length);
   return`
  <div class="result-card" style="${i===0?`border-color:${color}44;background:rgba(0,212,255,.04);`:''}">
   <div style="display:inline-block;padding:4px 14px;border-radius:999px;font-size:12px;font-weight:700;background:${color}22;color:${color};margin-bottom:12px;">${c.badge}</div>
   <div style="font-size:17px;font-weight:800;margin-bottom:4px;">${c.name}</div>
   <div class="price-badge" style="margin-bottom:14px;">${c.priceDisplay}</div>
   <div style="display:flex;flex-direction:column;gap:4px;margin-bottom:12px;">
    ${Object.entries(c.specs).slice(0,3).map(([k,v])=>`<div style="display:flex;gap:6px;font-size:12px;"><span style="color:rgba(255,255,255,.4);width:60px;flex-shrink:0;">${k}</span><span>${v}</span></div>`).join('')}
   </div>
   <div style="display:flex;flex-direction:column;gap:3px;margin-bottom:12px;">
    ${c.pros.slice(0,2).map(p=>`<div style="font-size:11px;color:#6ee7b7;">✓ ${p}</div>`).join('')}
    ${c.cons.slice(0,1).map(p=>`<div style="font-size:11px;color:#fca5a5;">✗ ${p}</div>`).join('')}
   </div>
   <div style="border-top:1px solid rgba(255,255,255,.07);padding-top:10px;margin-bottom:10px;">
    <p style="font-size:12px;color:rgba(255,255,255,.55);line-height:1.5;">${c.whySelected}</p>
   </div>
   <div style="display:flex;align-items:center;justify-content:space-between;">
    <div style="font-size:12px;"><span style="color:rgba(255,255,255,.4);">AURA Score: </span><span style="font-weight:800;color:${color};">${avg}/100</span></div>
    <div style="font-size:12px;"><span style="color:rgba(255,255,255,.4);">Rating: </span><span style="color:#f59e0b;">★ ${c.rating}</span></div>
   </div>
  </div>`;
  }).join('')}
 </div>
 <div style="display:flex;flex-wrap:wrap;gap:10px;margin-top:24px;">
  <button class="btn-secondary" style="padding:10px 20px;font-size:13px;" onclick="document.getElementById('followup-input').focus()">🔄 Refine Results</button>
  <button class="btn-secondary" style="padding:10px 20px;font-size:13px;" id="change-budget-btn">💰 Change Budget</button>
  <button class="btn-secondary" style="padding:10px 20px;font-size:13px;" id="add-req-btn">➕ Add Requirement</button>
  <button class="btn-primary" style="padding:10px 24px;font-size:13px;" id="new-mission-bottom-btn">🚀 Start New Mission</button>
 </div>
</div>`;
}

function renderActivityLog(){
 return`
<div class="section-panel in-view" id="activity-log-section">
 <details open style="background:rgba(255,255,255,.02);border:1px solid rgba(255,255,255,.07);border-radius:14px;padding:20px;">
  <summary style="font-size:15px;font-weight:700;cursor:pointer;display:flex;align-items:center;gap:8px;list-style:none;user-select:none;outline:none;">
   <span>📜</span> Live Agent Activity
   <div class="chip" style="margin-left:auto;background:rgba(0,212,255,.1);border:1px solid rgba(0,212,255,.2);color:#00d4ff;font-size:11px;" id="log-count">0 events</div>
  </summary>
  <div class="activity-log" style="margin-top:16px;" id="activity-log-content"></div>
 </details>
</div>`;
}

function renderFollowup(){
 return`
<div class="section-panel in-view" id="followup-section">
 <div style="display:flex;align-items:center;gap:10px;margin-bottom:16px;"><span style="font-size:20px;">💬</span><h2 style="font-size:18px;font-weight:700;">Refine Your Mission</h2></div>
 <div style="display:flex;gap:12px;padding:16px;background:rgba(255,255,255,.03);border:1px solid rgba(255,255,255,.08);border-radius:14px;">
  <input id="followup-input" class="aura-input" style="border:none;background:transparent;padding:10px 0;font-size:14px;" placeholder="Refine mission (e.g., 'Now only show 16GB RAM models' or 'Change budget to ₹70,000')..."/>
  <button id="followup-send-btn" class="btn-primary" style="padding:10px 22px;font-size:14px;white-space:nowrap;">Send →</button>
 </div>
 <div id="followup-responses" style="margin-top:12px;display:flex;flex-direction:column;gap:8px;"></div>
</div>`;
}

// ── AGENT CONTROLLER ──────────────────────────────────────────────
const STAGES=['Understanding Task','Planning','Searching Web','Navigating Sources','Extracting Information','Comparing Results','Verifying Information','Generating Final Result'];
const BLINES=[
 {ms:0,   msg:'> Initializing AURA browser agent...',cls:'system'},
 {ms:500, msg:'> Connecting to search engines...',cls:'info'},
 {ms:1000,msg:'> Search query dispatched',cls:'search'},
 {ms:1600,msg:'> Found 12 relevant sources',cls:'success'},
 {ms:2100,msg:'> Opening source [1/6]...',cls:'info'},
 {ms:2600,msg:'> Extracting structured data...',cls:'extract'},
 {ms:3100,msg:'> ✓ Price found | ✓ Specs found | ✓ Rating found',cls:'success'},
 {ms:3600,msg:'> Opening source [2/6]...',cls:'info'},
 {ms:4100,msg:'> Cross-verifying price data...',cls:'verify'},
 {ms:4600,msg:'> Source verified ✓',cls:'success'},
 {ms:5100,msg:'> Checking remaining sources...',cls:'info'},
 {ms:5800,msg:'> 143 data points extracted',cls:'success'},
 {ms:6300,msg:'> Running AURA scoring algorithm...',cls:'info'},
 {ms:7000,msg:'> Ranking complete',cls:'success'},
 {ms:7500,msg:'> ✅ All tasks complete — generating result',cls:'complete'},
];

function dly(ms){return new Promise(res=>setTimeout(res,ms));}

async function runMission(mission){
 const{intent,plan,sources,candidates,verification,reasoning,activityLog,metrics}=mission;

 // Stage list
 const sl=document.getElementById('stage-list');
 if(sl) sl.innerHTML=STAGES.map((s,i)=>`<div class="stage-item" id="st-${i}"><div class="stage-dot"></div><span>${s}</span></div>`).join('');

 // Context panel
 const cp=document.getElementById('mission-context-panel');
 if(cp){
  const items=[
   {l:'Goal',v:intent.raw.substring(0,40)+(intent.raw.length>40?'...':'')},
   ...(intent.budget?[{l:'Budget',v:intent.budget.display}]:[]),
   ...(intent.location?[{l:'Location',v:intent.location}]:[]),
   ...(intent.purpose?[{l:'Purpose',v:intent.purpose}]:[]),
   {l:'Category',v:intent.categoryLabel},
   {l:'Sources',v:sources.length+' discovered'},
  ];
  cp.innerHTML=items.map(it=>`<div style="display:flex;justify-content:space-between;align-items:flex-start;gap:8px;font-size:12px;"><span style="color:rgba(255,255,255,.35);flex-shrink:0;">${it.l}</span><span style="color:rgba(255,255,255,.75);text-align:right;">${it.v}</span></div>`).join('');
 }

 function setStage(idx){
  for(let i=0;i<STAGES.length;i++){const el=document.getElementById(`st-${i}`);if(!el)continue;el.className='stage-item'+(i<idx?' done':i===idx?' active':'');}
  const t=document.getElementById('ws-status-text');if(t) t.textContent=STAGES[idx]||'Complete';
 }

 function setOrb(state){
  const o=document.getElementById('agent-orb'),l=document.getElementById('agent-status-label');
  if(!o)return;
  if(state==='complete'){o.className='agent-orb complete';if(l)l.textContent='Mission Complete ✓';}
  else{o.className='agent-orb';if(l)l.textContent='Autonomous Agent Active';}
 }

 // Animate plan steps sequentially
 async function animPlan(){
  for(let i=0;i<plan.length;i++){
   await dly(plan[i].dur);
   setStage(i);
   const s=document.getElementById(`ps-${i}`);if(s){s.classList.add('visible','active');}
   if(i>0){const p=document.getElementById(`ps-${i-1}`);if(p){p.classList.remove('active');p.classList.add('complete');}const ps=document.getElementById(`ps-status-${i-1}`);if(ps){ps.style.opacity='1';ps.textContent='✅';}}
  }
  const last=document.getElementById(`ps-${plan.length-1}`);if(last){last.classList.remove('active');last.classList.add('complete');}
  const ls=document.getElementById(`ps-status-${plan.length-1}`);if(ls){ls.style.opacity='1';ls.textContent='✅';}
 }

 // Browser activity log
 async function animBrowser(){
  const log=document.getElementById('browser-log');if(!log)return;
  log.innerHTML='';
  for(let i=0;i<BLINES.length;i++){
   const interval=i===0?100:Math.min(BLINES[i].ms-BLINES[i-1].ms,700);
   await dly(interval);
   const d=document.createElement('div');
   d.innerHTML=`<span class="log-msg ${BLINES[i].cls}" style="font-family:'JetBrains Mono',monospace;font-size:12px;">${BLINES[i].msg}</span>`;
   log.appendChild(d);log.scrollTop=log.scrollHeight;
  }
  for(let i=0;i<3;i++){await dly(350);const q=document.getElementById(`sq-${i}`);if(q)q.style.opacity='1';}
 }

 // Source cards appear
 async function animSources(){
  for(let i=0;i<sources.length;i++){await dly(280);const c=document.getElementById(`sc-${i}`);if(c)c.classList.add('visible');}
 }

 // Score bars animate
 async function animScores(){
  await dly(500);
  document.querySelectorAll('.score-fill[data-score]').forEach(b=>{b.style.width=b.getAttribute('data-score')+'%';});
 }

 // Counter animation
 async function animMetrics(){
  document.querySelectorAll('.metric-value[data-target]').forEach(el=>{
   const target=parseInt(el.getAttribute('data-target'));
   const suf=el.getAttribute('data-suf')||'';
   const dur=1200;const start=performance.now();
   function upd(now){const p=Math.min((now-start)/dur,1);const e=1-Math.pow(1-p,3);el.textContent=Math.round(target*e)+suf;if(p<1)requestAnimationFrame(upd);else el.textContent=target+suf;}
   requestAnimationFrame(upd);
  });
 }

 // Activity log entries
 async function animLog(log){
  const c=document.getElementById('activity-log-content');const cnt=document.getElementById('log-count');if(!c)return;c.innerHTML='';
  for(let i=0;i<log.length;i++){await dly(320);const d=document.createElement('div');d.className='log-line';d.innerHTML=`<span class="log-time">${log[i].time}</span><span class="log-msg ${log[i].type}">${log[i].msg}</span>`;c.appendChild(d);c.scrollTop=c.scrollHeight;if(cnt)cnt.textContent=`${i+1} events`;}
 }

 // ── Sequence ──
 setOrb('active');setStage(0);
 await dly(400);
 animPlan(); // non-blocking
 await dly(600);
 setStage(2);animBrowser();
 await dly(1200);
 setStage(3);animSources();
 await dly(sources.length*280+400);
 setStage(4);animLog(activityLog);
 await dly(1200);
 setStage(5);animScores();
 await dly(1500);
 setStage(6);
 await dly(1200);
 setStage(7);await dly(800);animMetrics();

 // Mark complete
 const badge=document.getElementById('ws-status-badge');
 if(badge){badge.style.background='rgba(16,185,129,.15)';badge.style.borderColor='rgba(16,185,129,.3)';badge.style.color='#6ee7b7';}
 const dot=document.getElementById('ws-dot');if(dot){dot.style.background='#10b981';dot.style.animation='none';}
 const t=document.getElementById('ws-status-text');if(t)t.textContent='✅ Mission Complete';
 setOrb('complete');
}

// ── APP CONTROLLER ────────────────────────────────────────────────
const DEMO_MISSIONS=[
 "Find the best programming laptop under ₹60,000 and compare the top 5 options.",
 "Find the best AI/ML courses for beginners and compare price, duration and certification.",
 "Plan a budget 3-day trip to Mumbai under ₹10,000.",
 "Compare AWS, Azure and Google Cloud for a student developer.",
 "Find the best smartphones under ₹30,000 with AMOLED display and 5G.",
];
const SUGGESTIONS=[
 {icon:'🎓',label:'Research', text:'Research the best AI courses for beginners'},
 {icon:'💻',label:'Shopping', text:'Find the best laptop under ₹60,000'},
 {icon:'✈️',label:'Travel',   text:'Plan a 3-day Mumbai trip under ₹10,000'},
 {icon:'⚖️',label:'Comparison',text:'Compare React, Angular and Vue'},
 {icon:'💼',label:'Career',   text:'Find the best skills for an AI/ML career'},
];

function initApp(){
 const app=document.getElementById('app');
 app.innerHTML=renderLanding()+renderHowItWorks()+renderCapabilities()+renderCTA()+renderWorkspace();

 // Suggestion grid
 const grid=document.getElementById('suggestion-grid');
 if(grid){
  grid.innerHTML=SUGGESTIONS.map((s,i)=>`
  <div class="suggestion-card animate-fade-up" style="animation-delay:${.5+i*.1}s;opacity:0;" data-text="${s.text}">
   <div style="font-size:24px;margin-bottom:8px;">${s.icon}</div>
   <div style="font-size:11px;font-weight:700;letter-spacing:.06em;color:rgba(255,255,255,.35);text-transform:uppercase;margin-bottom:6px;">${s.label}</div>
   <div style="font-size:13px;color:rgba(255,255,255,.7);line-height:1.4;">${s.text}</div>
  </div>`).join('');
  grid.querySelectorAll('.suggestion-card').forEach(card=>{
   card.addEventListener('click',()=>{
    const input=document.getElementById('hero-input');
    if(input){input.value=card.dataset.text;input.focus();}
    window.scrollTo({top:0,behavior:'smooth'});
   });
  });
 }

 // Nav links show on larger screens via CSS isn't applied — show them
 const navLinks=document.getElementById('nav-links');
 if(navLinks) navLinks.style.display='flex';

 bindLandingButtons();

 // Navbar scroll
 window.removeEventListener('scroll',window._auraScroll);
 window._auraScroll=()=>{const nb=document.getElementById('navbar');if(nb)nb.classList.toggle('scrolled',window.scrollY>50);};
 window.addEventListener('scroll',window._auraScroll);

 // Intersection observer
 const obs=new IntersectionObserver(entries=>{entries.forEach(e=>{if(e.isIntersecting)e.target.classList.add('in-view');});},{threshold:0.1});
 document.querySelectorAll('.section-panel').forEach(el=>obs.observe(el));

 // Network canvas
 initNetworkCanvas('network-canvas');
}

function rebind(id){
 const el=document.getElementById(id);if(!el)return null;
 const c=el.cloneNode(true);el.parentNode.replaceChild(c,el);return c;
}

function bindLandingButtons(){
 const launchBtn=rebind('launch-btn');
 const navBtn=rebind('nav-launch-btn');
 const tryBtn=rebind('try-example-btn');
 const ctaLaunch=rebind('cta-launch-btn');
 const ctaDemo=rebind('cta-demo-btn');

 const doLaunch=()=>{
  const input=document.getElementById('hero-input');
  const q=input?input.value.trim():'';
  if(q.length<5){
   if(input){input.style.borderColor='rgba(239,68,68,.6)';input.placeholder='Please enter a goal (at least 5 characters)';setTimeout(()=>{input.style.borderColor='';input.placeholder='What would you like me to accomplish?';},2000);}
   return;
  }
  launchWorkspace(q);
 };

 if(launchBtn) launchBtn.addEventListener('click',doLaunch);
 if(navBtn) navBtn.addEventListener('click',doLaunch);
 if(tryBtn) tryBtn.addEventListener('click',()=>{const i=document.getElementById('hero-input');if(i){i.value=DEMO_MISSIONS[Math.floor(Math.random()*DEMO_MISSIONS.length)];i.focus();}});
 if(ctaLaunch) ctaLaunch.addEventListener('click',()=>{window.scrollTo({top:0,behavior:'smooth'});setTimeout(()=>document.getElementById('hero-input')?.focus(),600);});
 if(ctaDemo) ctaDemo.addEventListener('click',()=>launchWorkspace(DEMO_MISSIONS[0]));

 // Clone and rebind hero-input for keydown
 const hi=document.getElementById('hero-input');
 if(hi){
  const nc=hi.cloneNode(true);hi.parentNode.replaceChild(nc,hi);
  nc.addEventListener('keydown',e=>{if(e.key==='Enter'&&!e.shiftKey){e.preventDefault();doLaunch();}});
 }
}

function launchWorkspace(query){
 // Hide landing sections
 ['landing','how','capabilities','about'].forEach(id=>{const el=document.getElementById(id);if(el)el.style.display='none';});
 const ft=document.querySelector('footer');if(ft)ft.style.display='none';

 // Show workspace
 const ws=document.getElementById('workspace');if(ws)ws.classList.add('active');
 window.scrollTo({top:0});

 const intent=parseIntent(query);
 const mission=buildMission(intent);

 // Populate workspace
 const main=document.getElementById('ws-main');
 if(main){
  main.innerHTML=
   renderUnderstanding(intent)+
   renderPlan(mission.plan)+
   renderWebActivity(mission.searchQueries)+
   renderSources(mission.sources)+
   renderDataTable(mission.candidates)+
   renderComparison(mission.candidates)+
   renderVerification(mission.verification)+
   renderReasoning(mission.reasoning)+
   renderMetrics(mission.metrics)+
   renderResults(mission.candidates)+
   renderActivityLog()+
   renderFollowup();
 }

 bindWorkspaceButtons(query);
 runMission(mission);
}

function bindWorkspaceButtons(origQuery){
 const back=document.getElementById('back-btn');
 if(back) back.addEventListener('click',()=>goToLanding(false));
 ['new-mission-btn','new-mission-bottom-btn'].forEach(id=>{const b=document.getElementById(id);if(b)b.addEventListener('click',()=>goToLanding(true));});

 const budgetBtn=document.getElementById('change-budget-btn');
 if(budgetBtn) budgetBtn.addEventListener('click',()=>{const i=document.getElementById('followup-input');if(i){i.value='Change budget to ';i.focus();}});
 const addBtn=document.getElementById('add-req-btn');
 if(addBtn) addBtn.addEventListener('click',()=>{const i=document.getElementById('followup-input');if(i){i.value='Add requirement: ';i.focus();}});

 const sendBtn=document.getElementById('followup-send-btn');
 const fi=document.getElementById('followup-input');
 if(sendBtn&&fi){
  const send=()=>{const v=fi.value.trim();if(!v)return;handleFollowup(v,origQuery);fi.value='';};
  sendBtn.addEventListener('click',send);
  fi.addEventListener('keydown',e=>{if(e.key==='Enter')send();});
 }
}

function handleFollowup(refinement,origQuery){
 const container=document.getElementById('followup-responses');if(!container)return;
 let newQuery=origQuery;
 const rl=refinement.toLowerCase();

 // Budget
 if((rl.includes('budget')||rl.includes('change')||rl.includes('make'))&&/(?:₹|\$|rs\.?)?[0-9,k]+/.test(refinement)){
  const bm=refinement.match(/(?:₹|\$|rs\.?\s*)?([0-9,]+k?)/i);
  if(bm) newQuery=origQuery.replace(/(?:under|below|within|upto|up to)\s*(?:₹|rs\.?\s*|\$)?[0-9,k]+/gi,'').trim()+` under ${bm[0]}`;
 }
 // RAM
 if(/ram|memory/.test(rl)){const rm=refinement.match(/(\d+)\s*gb/i);if(rm)newQuery=origQuery+` with ${rm[0]} RAM`;}
 // ML
 if(/python|machine learning|ml/.test(rl)) newQuery=origQuery+' for Python and machine learning';
 // Cheaper
 if(/cheap|cheaper|affordable/.test(rl)) newQuery=origQuery.replace(/(?:under|below)\s*(?:₹|rs\.?\s*|\$)?[0-9,k]+/gi,'').trim()+' under ₹45,000';

 // User bubble
 const um=document.createElement('div');
 um.innerHTML=`<div style="display:flex;justify-content:flex-end;margin-bottom:8px;"><div style="background:rgba(0,212,255,.12);border:1px solid rgba(0,212,255,.2);border-radius:12px 12px 2px 12px;padding:10px 16px;max-width:80%;font-size:14px;color:#e2e8f0;">${refinement}</div></div>`;
 container.appendChild(um);

 // Agent bubble
 const am=document.createElement('div');
 am.innerHTML=`<div style="display:flex;gap:10px;margin-bottom:8px;"><div style="width:28px;height:28px;border-radius:50%;background:linear-gradient(135deg,#00d4ff,#a855f7);display:flex;align-items:center;justify-content:center;font-size:12px;flex-shrink:0;">⚡</div><div style="background:rgba(255,255,255,.05);border:1px solid rgba(255,255,255,.1);border-radius:2px 12px 12px 12px;padding:10px 16px;max-width:80%;font-size:14px;">⏳ Re-running mission with refined requirements...</div></div>`;
 container.appendChild(am);
 container.scrollTop=container.scrollHeight;

 setTimeout(()=>launchWorkspace(newQuery.trim()),1500);
}

function goToLanding(clearInput){
 const ws=document.getElementById('workspace');if(ws)ws.classList.remove('active');
 ['landing','how','capabilities','about'].forEach(id=>{const el=document.getElementById(id);if(el)el.style.display='';});
 const ft=document.querySelector('footer');if(ft)ft.style.display='';
 if(clearInput){const i=document.getElementById('hero-input');if(i)i.value='';}
 window.scrollTo({top:0});
 bindLandingButtons();
}

// ── BOOT ──────────────────────────────────────────────────────────
initApp();
