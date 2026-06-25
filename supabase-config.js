// =========================================================
// Supabase Config
// =========================================================
// วิธีใช้:
// 1) สร้าง Supabase project
// 2) เอา Project URL และ anon/public key มาใส่
// 3) เปลี่ยน DATA_MODE เป็น "supabase"
// 4) เปิดเว็บผ่าน Live Server
//
// หมายเหตุ:
// - ห้ามใส่ service_role key ใน frontend เด็ดขาด
// - ใช้ anon/public key เท่านั้น
// =========================================================

const APP_CONFIG = {
  DATA_MODE: "localStorage", // "localStorage" หรือ "supabase"

  SUPABASE_URL: "https://YOUR_PROJECT_ID.supabase.co",
  SUPABASE_ANON_KEY: "YOUR_SUPABASE_ANON_OR_PUBLISHABLE_KEY"
};

function getSupabaseClient() {
  if (APP_CONFIG.DATA_MODE !== "supabase") return null;

  if (!window.supabase) {
    throw new Error("Supabase SDK not loaded");
  }

  if (!APP_CONFIG.SUPABASE_URL.includes("supabase.co") || APP_CONFIG.SUPABASE_ANON_KEY.includes("YOUR_")) {
    throw new Error("กรุณาตั้งค่า SUPABASE_URL และ SUPABASE_ANON_KEY ใน supabase-config.js ก่อน");
  }

  return window.supabase.createClient(APP_CONFIG.SUPABASE_URL, APP_CONFIG.SUPABASE_ANON_KEY);
}
