// backend/data.js

let services = [
  {
    id: 1,
    title_ar: "المقاولات العامة للمباني",
    description_ar: "تنفيذ مشاريع المباني السكنية والتجارية والإدارية من الحفر حتى التسليم.",
    points_ar: [
      "مبانٍ سكنية (فلل، شقق، كمباوندات).",
      "مبانٍ تجارية (معارض، مكاتب، مراكز أعمال).",
      "مبانٍ تعليمية وصحية."
    ],
    order: 1
  },
  {
    id: 2,
    title_ar: "أعمال البنية التحتية",
    description_ar: "أعمال الطرق، شبكات المياه والصرف، وتصريف السيول وتجهيز المواقع.",
    points_ar: [
      "طرق داخلية ومواقف.",
      "شبكات مياه وصرف.",
      "أعمال الحفر والردم وتسوية المواقع."
    ],
    order: 2
  }
];

let projects = [
  {
    id: 1,
    title_ar: "مجمع إداري وتجاري – الرياض",
    status: "completed",
    client_ar: "مطور عقاري خاص",
    area_text: "١٨,٠٠٠ م²",
    duration_text: "١٨ شهر",
    description_ar: "تنفيذ هيكل خرساني وتشطيبات كاملة مع أعمال MEP لمجمع من ٨ طوابق.",
    order: 1,
    images: []
  },
  {
    id: 2,
    title_ar: "تطوير بنية تحتية لحي جديد",
    status: "in_progress",
    client_ar: "جهة حكومية / بلدية",
    area_text: "حي سكني كامل",
    duration_text: "قيد التنفيذ",
    description_ar: "شبكات طرق ومياه وصرف صحي وتصريف سيول.",
    order: 2,
    images: []
  }
];

let settings = {
  phone_main: "+966500000000",
  phone_alt: "+966110000000",
  email: "info@rakaez4.com",
  address_ar: "الرياض – المملكة العربية السعودية",
  social_links: {
    linkedin: "",
    x: "",
    instagram: ""
  }
};

function getNextId(collection) {
  if (!collection.length) return 1;
  return Math.max(...collection.map((item) => item.id)) + 1;
}

module.exports = {
  services,
  projects,
  settings,
  getNextId
};
