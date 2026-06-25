// =========================================================
// Supabase Config
// =========================================================
// วิธีใช้:
// 1) สร้าง Supabase project
// 2) เอา Project URL และ anon/public key มาใส่
// 3) เปลี่ยน DATA_MODE เป็น "supabase"
// 4) เปลี่ยน AUTH_MODE เป็น "supabase" เมื่อต้องการใช้ login จริง
//
// หมายเหตุ:
// - ห้ามใส่ service_role key ใน frontend เด็ดขาด
// - ใช้ anon/public key เท่านั้น
// =========================================================

const APP_CONFIG = {
  DATA_MODE: "localStorage", // "localStorage" หรือ "supabase"
  AUTH_MODE: "mock",         // "mock" หรือ "supabase"

  SUPABASE_URL: "https://iythuzkmjjshwciooaum.supabase.co/rest/v1/",
  SUPABASE_ANON_KEY: "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6Iml5dGh1emttampzaHdjaW9vYXVtIiwicm9sZSI6ImFub24iLCJpYXQiOjE3ODIzOTU3ODgsImV4cCI6MjA5Nzk3MTc4OH0.ba2S5l6yon1RDP9tImWO9NZXjHt2Y9g2K9i0zLtKbJ8"
};

function getSupabaseClient() {
  if (APP_CONFIG.DATA_MODE !== "supabase" && APP_CONFIG.AUTH_MODE !== "supabase") return null;

  if (!window.supabase) {
    throw new Error("Supabase SDK not loaded");
  }

  if (!APP_CONFIG.SUPABASE_URL.includes("supabase.co") || APP_CONFIG.SUPABASE_ANON_KEY.includes("YOUR_")) {
    throw new Error("กรุณาตั้งค่า SUPABASE_URL และ SUPABASE_ANON_KEY ใน supabase-config.js ก่อน");
  }

  if (!window.__DIVE_SUPABASE_CLIENT__) {
    window.__DIVE_SUPABASE_CLIENT__ = window.supabase.createClient(
      APP_CONFIG.SUPABASE_URL,
      APP_CONFIG.SUPABASE_ANON_KEY
    );
  }

  return window.__DIVE_SUPABASE_CLIENT__;
}
