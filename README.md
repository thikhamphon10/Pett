# Bubble Paws – Pet Grooming Management System

ระบบจัดการร้านอาบน้ำและตัดขนสัตว์เลี้ยง (HTML/CSS/JS ล้วน ไม่ต้อง build)

Flow: จองคิว → Grooming → เสร็จ → แจ้งเตือน → ชำระเงิน → รับสัตว์กลับ

## โครงสร้างไฟล์
```
├── index.html
├── vercel.json
├── README.md
└── assets/
    ├── css/style.css
    └── js/app.js      # แก้ SERVICES / STYLES ได้ที่บนสุดของไฟล์
```

## รันในเครื่อง
เปิด `index.html` ด้วยเบราว์เซอร์ หรือรัน `npx serve .`

## Deploy: GitHub + Vercel
1. สร้าง repository บน GitHub แล้ว push โปรเจกต์นี้ขึ้นไป
2. เข้า vercel.com → Add New → Project → เลือก repository
3. Framework Preset: **Other** · Build Command: เว้นว่าง · Output Directory: เว้นว่าง (root)
4. กด Deploy ทุกครั้งที่ push เข้า `main` Vercel จะ deploy ให้อัตโนมัติ

## หมายเหตุ
- ข้อมูลเก็บใน localStorage ของเบราว์เซอร์ (ไม่ซิงค์ข้ามเครื่อง)
- การแจ้งเตือนเป็นแบบจำลอง ยังไม่ส่ง LINE/SMS จริง
