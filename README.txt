Dive Booking V2.10

Fix:
- เพิ่มหน้า “กำหนดสิทธิ์” ให้ Admin ปรับ permission ของแต่ละ Role ได้
- สิทธิ์ถูกเก็บใน localStorage key: role_permissions
- Island Staff default มีสิทธิ์:
  - ซื้อเพิ่มบนเกาะ
  - บันทึก/แก้ไข Booking เพื่อให้ island add-on ถูก update
- ปรับ permissions ได้เองจากหน้า “กำหนดสิทธิ์”
- Admin ยังถูกล็อกให้มีสิทธิ์กำหนดสิทธิ์เสมอ เพื่อกันเผลอปิดตัวเอง

บัญชีทดสอบ:
admin / 1234
counter / 1234
island / 1234
boat / 1234
manager / 1234
