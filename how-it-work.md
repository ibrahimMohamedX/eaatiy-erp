# How It Works — خطوات تشغيل المشروع

> دليل تشغيل سريع لمعاينة **Clinic Management** (مشروع `eaatiy-erp` بواجهة Archai Design System) على جهازك.

---

## المتطلبات

| الأداة | ليه؟ |
|---|---|
| **Node.js + pnpm** | تشغيل الـ dev server (`pnpm dev`) |
| **Docker Desktop** | قاعدة بيانات PostgreSQL (كونتينر `meridian-dev-db`) |

> بيانات الاتصال موجودة جاهزة في `.env.local` ومتطابقة مع إعدادات [docker-compose.yml](docker-compose.yml).

---

## خطوات التشغيل (الحالة الطبيعية)

```powershell
# 1) افتح Docker Desktop واستنى لحد ما الأيقونة تبقى green

# 2) شغّل قاعدة البيانات
docker compose up -d

# 3) شغّل المشروع
pnpm dev

# 4) افتح المتصفح على:
#    http://localhost:3000
```

البيانات (المستخدمين، المرضى، المواعيد) محفوظة في Docker volume باسم `pgdata` — **بتفضل موجودة بعد ما تقفل الكل**، ومفيش حاجة بتتحزر كل مرة.

للتأكد إن الداتابيز جاهزة:

```powershell
docker inspect --format "{{.State.Health.Status}}" meridian-dev-db
# المفروض يطبع: healthy
```

---

## حسابات الدخول

كلمة السر لكل الحسابات: **`password123`**

| البريد | الدور | الشاشة |
|---|---|---|
| `helena.marsh@northgate.com` | Receptionist | الاستقبال + الطابور الحي |
| `sara.reyes@northgate.com` | Doctor | شاشة الكشف (Queue + Vitals + Rx) |
| `amelia.monroe@northgate.com` | Admin | التحليلات + الإيرادات + Audit |

الـ Middleware بيوجّهك تلقائيًا لشاشة دورك بعد تسجيل الدخول.

---

## بعد الدخول — المعاينة الصح

من الـ **FAB** (الزراير العائمة في الأسفل) اقدر تبدّل:

- **الثيم**: `dark` / `light` — الـ dark هو هوية Archai الأساسية، والـ light استثنائي (Arc Ink بدل النيون)
- **اللغة**: `English` / `العربية` — مع دعم RTL كامل

جرّب كل شاشة في: **dark + light** و**en + ar** (ده شرط التحقق اليدوي Rule 8 في [CLAUDE.md](CLAUDE.md)).

---

## بوابة الـ Super Admin (Control Room)

البوابة بتاعة `/super-admin` محمية بمفتاح من نوع `SUPER_ADMIN_KEY` محفوظ في `.env.local`:

- من غير المفتاح (أو بمفتاح غلط) هتظهرلك **شاشة قفل** — والبوابة نفسها وكل الـ actions بتاعتها بترفض أي طلب من غير مفتاح صالح.
- لما تفتح `http://localhost:3000/super-admin` هتلاقي خانة مفتاح — حط المفتاح وهو بيفتح جلسة لمدة 8 ساعات (httpOnly cookie).
- **مفتاح الـ dev الحالي** موجود في `.env.local` عند سطر `SUPER_ADMIN_KEY=` — غيّره قبل أي deploy حقيقي.
- كل عمليات البوابة (provision / suspend / revoke / license) بتتسجل تلقائيًا في جدول `super_admin_audit` في الـ Identity DB.

---

## إيقاف كل حاجة

```powershell
# إيقاف الـ dev server: Ctrl+C في الترمنال بتاع pnpm dev

# إيقاف قاعدة البيانات (من غير مسح البيانات)
docker compose stop

# لما ترجع تاني: docker compose up -d
```

---

## إعادة التهيئة من الصفر (لو الـ volume اتمسح)

دي الحالة الوحيدة اللي تحتاج فيها تعمل setup كامل — مثلًا لو مسحت الـ Docker volume أو عملت `docker compose down -v`:

```powershell
# 1) شغّل PostgreSQL
docker compose up -d

# 2) طبّق schema الـ Identity DB
pnpm exec drizzle-kit push --config=drizzle.config.ts --force

# 3) اعمل قاعدة بيانات التينانت
docker exec meridian-dev-db psql -U meridian -d meridian_identity -c "CREATE DATABASE tenant_northgate"

# 4) طبّق schema التينانت على القاعدة الجديدة
pnpm exec drizzle-kit push --config=drizzle.tenant.config.ts --force

# 5) زرع البيانات التجريبية (Northgate Clinic)
npx tsx scripts/seed.ts

# 6) شغّل المشروع
pnpm dev
```

الـ seed script ([scripts/seed.ts](scripts/seed.ts)) بينشئ: مستأجر Northgate Clinic، 6 مستخدمين (bcrypt-hashed)، 8 مرضى، 8 مواعيد، 2 سجلات طبية، 2 روشتات، 3 فواتير، و4 audit entries.

> **ملحوظة**: الخطوات دي هي المسار الموثق للتهيئة (Phase 2A في الـ Master Plan). الحالة الحالية على الجهاز مش محتاجاها — البيانات موجودة ومشتغلة.

---

## مشاكل شائعة

| المشكلة | الحل |
|---|---|
| `failed to connect to the docker API` | Docker Desktop مش شغال — افتحه واستنى الأيقونة تبقى green |
| الـ dev server مش راضي يبدأ | اتأكد إن مفيش عملية تانية على port 3000 (`netstat -ano \| findstr :3000`) |
| خطأ اتصال بالداتابيز بعد التشغيل | `docker inspect --format "{{.State.Health.Status}}" meridian-dev-db` لازم يكون `healthy` الأول |
| صفحة login بترجعني ليها تاني | اتأكد إنك بتستخدم `password123` والبريد صح (الكوكيز بتتخزن باسم `meridian_access_token`) |

---

## ملخص سريع

```
Docker Desktop  →  docker compose up -d  →  pnpm dev  →  http://localhost:3000
```
