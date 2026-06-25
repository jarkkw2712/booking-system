// =========================================================
// Migration Tool: localStorage backup JSON -> Supabase
// Run from browser console after configuring Supabase.
// =========================================================

async function migrateLocalStorageBookingsToSupabase() {
  if (!DataService || APP_CONFIG.DATA_MODE !== "supabase") {
    alert("กรุณาตั้ง APP_CONFIG.DATA_MODE = 'supabase' ก่อน");
    return;
  }

  const bookings = JSON.parse(localStorage.getItem("bookings") || "[]");

  if (!bookings.length) {
    alert("ไม่มี booking ใน localStorage ให้ migrate");
    return;
  }

  if (!confirm(`ต้องการ migrate ${bookings.length} bookings ไป Supabase ใช่ไหม?`)) {
    return;
  }

  const results = [];

  for (const booking of bookings) {
    try {
      const result = await DataService.saveBooking(booking);
      results.push({ bookingCode: booking.bookingCode, success: true, result });
      console.log("Migrated", booking.bookingCode, result);
    } catch (error) {
      results.push({ bookingCode: booking.bookingCode, success: false, error: error.message });
      console.error("Failed", booking.bookingCode, error);
    }
  }

  console.table(results);
  alert("Migration เสร็จแล้ว ดูผลใน Console");
}
