// backend/server.js

const express = require("express");
const cors = require("cors");
const bodyParser = require("body-parser");
const path = require("path");
const multer = require("multer");

const { services, projects, settings, getNextId } = require("./data");

const app = express();
const PORT = process.env.PORT || 4000;

// مفاتيح بسيطة للدخول للوحة التحكم (غيّرها في الإنتاج)
const ADMIN_USER = "admin@rakaez4.com";
const ADMIN_PASS = "StrongPassword123";

app.use(cors());
app.use(bodyParser.json());

// إعداد تخزين الملفات (الصور) في مجلد uploads
const storage = multer.diskStorage({
  destination: function (req, file, cb) {
    cb(null, path.join(__dirname, "uploads"));
  },
  filename: function (req, file, cb) {
    const uniqueSuffix = Date.now() + "-" + Math.round(Math.random() * 1e9);
    const ext = path.extname(file.originalname);
    cb(null, uniqueSuffix + ext);
  }
});
const upload = multer({ storage });

// إتاحة مجلد الرفع كـ static
app.use("/uploads", express.static(path.join(__dirname, "uploads")));

// ============== Auth بسيط لمدير النظام ==============

app.post("/api/admin/login", (req, res) => {
  const { email, password } = req.body;
  if (email === ADMIN_USER && password === ADMIN_PASS) {
    return res.json({ success: true, token: "FAKE_TOKEN_FOR_TEST" });
  }
  return res.status(401).json({ success: false, message: "بيانات الدخول غير صحيحة" });
});

function adminAuth(req, res, next) {
  const header = req.headers["authorization"];
  if (!header) return res.status(401).json({ message: "غير مصرح" });
  const token = header.replace("Bearer ", "");
  if (token !== "FAKE_TOKEN_FOR_TEST") {
    return res.status(401).json({ message: "توكن غير صحيح" });
  }
  next();
}

// ============== Public API ==============

// الخدمات
app.get("/api/services", (req, res) => {
  const sorted = [...services].sort((a, b) => a.order - b.order);
  res.json(sorted);
});

// المشاريع
app.get("/api/projects", (req, res) => {
  const sorted = [...projects].sort((a, b) => a.order - b.order);
  res.json(sorted);
});

// الإعدادات العامة
app.get("/api/settings", (req, res) => {
  res.json(settings);
});

// ============== Admin API ==============

// رفع عدة صور لمشروع
app.post("/api/admin/upload-images", adminAuth, upload.array("images", 10), (req, res) => {
  if (!req.files || !req.files.length) {
    return res.status(400).json({ message: "لم يتم استلام أي ملفات" });
  }

  // نبني رابط كامل بالصيغ: https://backend-domain/uploads/filename
  const baseUrl = `${req.protocol}://${req.get("host")}`;
  const urls = req.files.map((file) => `${baseUrl}/uploads/${file.filename}`);

  return res.json({ urls });
});

// CRUD الخدمات
app.post("/api/admin/services", adminAuth, (req, res) => {
  const { title_ar, description_ar, points_ar, order } = req.body;
  const newService = {
    id: getNextId(services),
    title_ar,
    description_ar,
    points_ar: points_ar || [],
    order: order || services.length + 1
  };
  services.push(newService);
  res.json(newService);
});

app.put("/api/admin/services/:id", adminAuth, (req, res) => {
  const id = Number(req.params.id);
  const idx = services.findIndex((s) => s.id === id);
  if (idx === -1) return res.status(404).json({ message: "الخدمة غير موجودة" });

  const { title_ar, description_ar, points_ar, order } = req.body;
  services[idx] = {
    ...services[idx],
    ...(title_ar && { title_ar }),
    ...(description_ar && { description_ar }),
    ...(points_ar && { points_ar }),
    ...(order && { order })
  };
  res.json(services[idx]);
});

app.delete("/api/admin/services/:id", adminAuth, (req, res) => {
  const id = Number(req.params.id);
  const idx = services.findIndex((s) => s.id === id);
  if (idx === -1) return res.status(404).json({ message: "الخدمة غير موجودة" });
  const removed = services.splice(idx, 1);
  res.json({ success: true, removed });
});

// CRUD المشاريع (بصور متعددة)
app.post("/api/admin/projects", adminAuth, (req, res) => {
  const {
    title_ar,
    status,
    client_ar,
    area_text,
    duration_text,
    description_ar,
    order,
    images
  } = req.body;

  const newProject = {
    id: getNextId(projects),
    title_ar,
    status: status || "in_progress",
    client_ar,
    area_text,
    duration_text,
    description_ar,
    order: order || projects.length + 1,
    images: Array.isArray(images) ? images : []
  };
  projects.push(newProject);
  res.json(newProject);
});

app.put("/api/admin/projects/:id", adminAuth, (req, res) => {
  const id = Number(req.params.id);
  const idx = projects.findIndex((p) => p.id === id);
  if (idx === -1) return res.status(404).json({ message: "المشروع غير موجود" });

  const {
    title_ar,
    status,
    client_ar,
    area_text,
    duration_text,
    description_ar,
    order,
    images
  } = req.body;

  projects[idx] = {
    ...projects[idx],
    ...(title_ar && { title_ar }),
    ...(status && { status }),
    ...(client_ar && { client_ar }),
    ...(area_text && { area_text }),
    ...(duration_text && { duration_text }),
    ...(description_ar && { description_ar }),
    ...(order && { order }),
    ...(images !== undefined && { images: Array.isArray(images) ? images : [] })
  };
  res.json(projects[idx]);
});

app.delete("/api/admin/projects/:id", adminAuth, (req, res) => {
  const id = Number(req.params.id);
  const idx = projects.findIndex((p) => p.id === id);
  if (idx === -1) return res.status(404).json({ message: "المشروع غير موجود" });
  const removed = projects.splice(idx, 1);
  res.json({ success: true, removed });
});

// تعديل الإعدادات العامة
app.put("/api/admin/settings", adminAuth, (req, res) => {
  const { phone_main, phone_alt, email, address_ar, social_links } = req.body;
  if (phone_main !== undefined) settings.phone_main = phone_main;
  if (phone_alt !== undefined) settings.phone_alt = phone_alt;
  if (email !== undefined) settings.email = email;
  if (address_ar !== undefined) settings.address_ar = address_ar;
  if (social_links !== undefined) {
    settings.social_links = {
      ...settings.social_links,
      ...social_links
    };
  }
  res.json(settings);
});

// تشغيل السيرفر
app.listen(PORT, () => {
  console.log(`Rakaez4 backend running on port ${PORT}`);
});
