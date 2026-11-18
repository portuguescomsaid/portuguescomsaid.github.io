// يبعت إشعار للمستخدم لما الإدارة ترد على رسالته أو تخلّص التعديل
import admin from 'firebase-admin';
admin.initializeApp({credential:admin.credential.cert(JSON.parse(process.env.FIREBASE_SA))});
const db=admin.firestore(),fcm=admin.messaging();let sent=0;
const snap=await db.collection('inbox').get();
for(const doc of snap.docs){const v=doc.data();const items=Array.isArray(v.items)?v.items:[];
  const due=items.filter(m=>(m.status==='done'||m.status==='replied')&&!m.pn&&!m.seenU);if(!due.length)continue;
  const p=await db.doc('push/'+doc.id).get();const tok=p.exists&&p.data().tok;
  if(tok){const done=due.some(m=>m.status==='done');
    const title=done?'✅ تم التعديل':'💬 وصلك رد من الإدارة';
    const body=done?'اللي بلّغت عنه انعدّل. شكرًا إلك!':'افتح التطبيق وشوف الرد.';
    try{await fcm.send({token:tok,data:{title,body,url:'./#settings'},webpush:{headers:{Urgency:'high',TTL:'86400'}}});sent++}
    catch(e){console.log('fail',doc.id,e.errorInfo&&e.errorInfo.code)}}
  due.forEach(m=>m.pn=1);await doc.ref.update({items});}
console.log('sent',sent);
