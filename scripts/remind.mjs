// يبعت إشعار يومي لكل مستخدم بالساعة اللي اختارها، إذا ما درس هداك اليوم
import admin from 'firebase-admin';
admin.initializeApp({credential:admin.credential.cert(JSON.parse(process.env.FIREBASE_SA))});
const db=admin.firestore(),fcm=admin.messaging();
const ds=d=>d.getUTCFullYear()+'-'+(d.getUTCMonth()+1)+'-'+d.getUTCDate(); // نفس صيغة التطبيق
const now=Date.now();let sent=0,skip=0;
const snap=await db.collection('push').get();
for(const doc of snap.docs){const d=doc.data();
  if(!d.tok||d.off){skip++;continue}
  const local=new Date(now+(Number(d.tz)||-180)*60000);
  if(local.getUTCHours()!==Number(d.h??19)){skip++;continue}
  const today=ds(local);if(d.last===today||d.sent===today){skip++;continue}
  const y=new Date(local.getTime()-864e5),yest=ds(y);const n=Number(d.n)||0;const nm=d.nm?d.nm+'، ':'';
  const risk=n>0&&d.last===yest;
  const title=risk?`🔥 سلسلتك ${n} يوم رح تنقطع!`:'⏰ وقت البرتغالي!';
  const body=risk?`${nm}ما درست اليوم. 5 دقايق بس بتحمي سلسلتك.`:`${nm}درسك اليوم جاهز. 5 دقايق بتفرق 💪`;
  try{await fcm.send({token:d.tok,data:{title,body,url:'./#path'},webpush:{headers:{Urgency:'high',TTL:'21600'}}});await doc.ref.update({sent:today});sent++}
  catch(e){const c=e.errorInfo&&e.errorInfo.code||'';console.log('fail',doc.id,c);if(/registration-token-not-registered|invalid-registration-token|invalid-argument/.test(c))await doc.ref.update({tok:'',off:true})}}
console.log('sent',sent,'skip',skip);
