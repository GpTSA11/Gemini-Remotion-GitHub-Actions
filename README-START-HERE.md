# تحديث واجهة استوديو الفيديو الذكي

هذه حزمة **تحديث** لمشروعك الحالي، وليست بديلًا عنه. انسخ محتويات الحزمة إلى جذر مستودع `GpTSA11/Gemini-Remotion-GitHub-Actions`، ووافق على استبدال ملفات `render.yml` و`generate.mjs` و`validate.mjs` فقط. لا تحذف الملفات الأخرى، ولا ترفع ملفات `.env` أو أي أسرار.

## ماذا تعمل النسخة؟

- `docs/index.html`: واجهة عربية للجوال والكمبيوتر، تتيح إدخال موضوع الفيديو واختيار المدة 15 أو 30 أو 60 ثانية، والمقاس 9:16 أو 16:9، والأسلوب، وتفضيل الصوت.
- `worker/index.js`: خدمة Cloudflare Worker وسيطة ترسل الطلبات إلى GitHub Actions باستخدام رمز GitHub مخفي في إعدادات Worker Secrets وتستطلع حالة المهمة.
- `.github/workflows/render.yml`: يقبل مدخلات الواجهة ويُشغّل Gemini للتخطيط ثم Remotion للتصيير ويتيح MP4 ضمن Artifacts.
- `scripts/generate.mjs`: يضبط زمن المشاهد تلقائيًا بحسب المدة، ويمرر الأسلوب إلى Gemini.
- `scripts/validate.mjs`: يقبل أطوال المشاهد الجديدة ضمن 60 ثانية.

## الإعداد مرة واحدة

1. ارفع ملفات التحديث إلى GitHub باستخدام GitHub Desktop ثم Commit ثم Push origin. سيتم تشغيل العرض التجريبي آليًا.
2. من إعدادات المستودع، فعّل Pages عبر Settings → Pages → Build and deployment: Deploy from a branch → `main` / `/docs`، ثم Save. ستظهر الواجهة على `https://gptsa11.github.io/Gemini-Remotion-GitHub-Actions/`.
3. أنشئ **GitHub fine-grained personal access token** محصورًا في مستودع `Gemini-Remotion-GitHub-Actions` فقط، بصلاحية `Actions: Read and write`. احتفظ به سرًا، ولا تضعه داخل مشروعك أو واجهة الويب.
4. أنشئ Cloudflare Worker (يمكن البدء بخطة مجانية متاحة بحسب الاستخدام) وضع محتوى `worker/index.js` ككود الخدمة. استخدم اسمًا مناسبًا، وضمن Settings → Variables and Secrets أضف Secret باسم `GITHUB_TOKEN` يحوي الرمز السابق، وSecret باسم `STUDIO_PASSWORD` يحوي كلمة مرور قوية مستقلة. أضف Variable نصية `ALLOWED_ORIGIN` بالقيمة `https://gptsa11.github.io`.
5. ضع رابط Worker العام (https) وكلمة مرور الاستوديو في «إعداد الربط» داخل الواجهة. **لا تضع Gemini API key هنا**؛ يجب أن يكون أصلًا محفوظًا في GitHub Actions Secrets باسم `GEMINI_API_KEY`.
6. اكتب الموضوع ثم اضغط «أنشئ الفيديو». ستظهر حالة التشغيل ورابط Artifact عند نجاح المهمة.

## ملاحظات أمنية ووظيفية

- **الصوت غير مولد حاليًا**؛ الاختيار صوت رجالي/نسائي تفضيل للمراحل القادمة فقط.
- **المعاينة في الصفحة شكل توضيحي وليست الفيديو النهائي**. الملف النهائي يتاح من صفحة تشغيل GitHub Actions، ضمن Artifacts.
- لا تضع الأسرار في المستودع العام. أضف قيد المصادقة Cloudflare Access أو حدّد معدل الطلبات إذا كنت ستشارك رابط Worker مع آخرين؛ كلمة مرور واحدة قد تُشارك ويُساء استخدامها.
- لا تتوقع تشغيلًا مجانيًا بلا حدود. يخضع GitHub Actions وCloudflare Worker وGemini لحدود استخدام وحصص.
- إذا كنت تخطط لرفع صور الطلاب وملفات حساسة، لا تستخدم المستودع العام كمساحة ملفات. يلزم مسار تخزين خاص وصلاحيات منفصلة.
- اسم المستودع في كود Worker ثابت. إذا غيّرت الاسم عدّل `REPO`.
- بعد رفع التحديث، قد يظهر خطأ في ملف workflow إن كان مستودعك يخضع لسياسات تمنع GitHub Actions أو خدمة Gemini؛ راجع سجل التشغيل.
