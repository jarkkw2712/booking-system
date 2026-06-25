// =========================================================
// Data Service Adapter
// Phase 2: localStorage <-> Supabase
// =========================================================
//
// Current UI ยังเรียก function เดิมอยู่เป็นหลัก
// ไฟล์นี้เตรียม adapter สำหรับย้ายไป Supabase ทีละส่วน
//
// Supabase functions ที่ใช้:
// - list_bookings_json
// - upsert_booking_from_json
// - cancel_booking_by_code
//
// =========================================================

const DataService = {
  mode() {
    return APP_CONFIG?.DATA_MODE || "localStorage";
  },

  client() {
    return getSupabaseClient();
  },

  // -------------------------
  // Booking
  // -------------------------

  async listBookings() {
    if (this.mode() === "localStorage") {
      return JSON.parse(localStorage.getItem("bookings") || "[]");
    }

    const supabase = this.client();
    const { data, error } = await supabase.rpc("list_bookings_json");

    if (error) throw error;
    return data || [];
  },

  async saveBooking(booking) {
    if (this.mode() === "localStorage") {
      const data = JSON.parse(localStorage.getItem("bookings") || "[]");
      data.push(booking);
      localStorage.setItem("bookings", JSON.stringify(data));
      return booking;
    }

    const supabase = this.client();
    const { data, error } = await supabase.rpc("upsert_booking_from_json", {
      p_booking: booking
    });

    if (error) throw error;
    return data;
  },

  async updateBooking(bookingCode, booking) {
    if (this.mode() === "localStorage") {
      const data = JSON.parse(localStorage.getItem("bookings") || "[]")
        .map(b => b.bookingCode === bookingCode ? booking : b);
      localStorage.setItem("bookings", JSON.stringify(data));
      return booking;
    }

    const supabase = this.client();
    const { data, error } = await supabase.rpc("upsert_booking_from_json", {
      p_booking: booking
    });

    if (error) throw error;
    return data;
  },

  async cancelBooking(bookingCode, reason) {
    if (this.mode() === "localStorage") {
      const data = JSON.parse(localStorage.getItem("bookings") || "[]")
        .map(b => {
          if (b.bookingCode !== bookingCode) return b;
          return {
            ...b,
            status: "cancelled",
            cancelReason: reason,
            cancelledAt: new Date().toISOString()
          };
        });

      localStorage.setItem("bookings", JSON.stringify(data));
      return true;
    }

    const supabase = this.client();
    const { data, error } = await supabase.rpc("cancel_booking_by_code", {
      p_booking_code: bookingCode,
      p_reason: reason
    });

    if (error) throw error;
    return data;
  },

  // -------------------------
  // Master Data
  // -------------------------

  async listMasterPrograms() {
    if (this.mode() === "localStorage") {
      return getMasterData().programs;
    }

    const supabase = this.client();
    const { data, error } = await supabase
      .from("master_programs")
      .select("*")
      .eq("active_flag", true)
      .order("sort_order");

    if (error) throw error;
    return data;
  },

  async listMasterAddOns() {
    if (this.mode() === "localStorage") {
      return getMasterData().addOns;
    }

    const supabase = this.client();
    const { data, error } = await supabase
      .from("master_addons")
      .select("*")
      .eq("active_flag", true)
      .order("sort_order");

    if (error) throw error;
    return data;
  },

  // -------------------------
  // Audit
  // -------------------------

  async listAuditLogs() {
    if (this.mode() === "localStorage") {
      return JSON.parse(localStorage.getItem("audit_logs") || "[]");
    }

    const supabase = this.client();
    const { data, error } = await supabase
      .from("audit_logs")
      .select("*")
      .order("changed_at", { ascending: false })
      .limit(500);

    if (error) throw error;
    return data;
  }
};
