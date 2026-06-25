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
  },
// -------------------------
  // Auth / Roles / Permissions
  // -------------------------

  async getRolePermissions() {
    if (this.mode() === "localStorage") {
      return JSON.parse(localStorage.getItem("role_permissions") || "null");
    }

    const supabase = this.client();
    const { data, error } = await supabase
      .from("role_permissions")
      .select("role_id, permission_key, allowed");

    if (error) throw error;

    const result = {};
    (data || []).forEach(row => {
      if (!result[row.role_id]) result[row.role_id] = {};
      result[row.role_id][row.permission_key] = row.allowed;
    });

    return result;
  },

  async saveRolePermission(roleId, permissionKey, allowed) {
    if (this.mode() === "localStorage") {
      const perms = JSON.parse(localStorage.getItem("role_permissions") || "{}");
      if (!perms[roleId]) perms[roleId] = {};
      perms[roleId][permissionKey] = allowed;
      localStorage.setItem("role_permissions", JSON.stringify(perms));
      return true;
    }

    const supabase = this.client();
    const { data, error } = await supabase
      .from("role_permissions")
      .upsert({
        role_id: roleId,
        permission_key: permissionKey,
        allowed,
        updated_at: new Date().toISOString()
      }, {
        onConflict: "role_id,permission_key"
      });

    if (error) throw error;
    return data;
  },

  async getMasterData() {
    if (this.mode() === "localStorage") {
      return getMasterData();
    }

    const [programsResult, addOnsResult] = await Promise.all([
      this.client().from("master_programs").select("*").eq("active_flag", true).order("sort_order"),
      this.client().from("master_addons").select("*").eq("active_flag", true).order("sort_order")
    ]);

    if (programsResult.error) throw programsResult.error;
    if (addOnsResult.error) throw addOnsResult.error;

    return {
      programs: (programsResult.data || []).map(p => ({
        id: p.program_id,
        name: p.program_name,
        price: Number(p.default_price)
      })),
      addOns: (addOnsResult.data || []).map(a => ({
        id: a.addon_id,
        name: a.addon_name,
        defaultPrice: Number(a.default_price)
      }))
    };
  },

  async saveMasterData(masterData) {
    if (this.mode() === "localStorage") {
      saveMasterData(masterData);
      return true;
    }

    const supabase = this.client();

    for (const p of masterData.programs || []) {
      const { error } = await supabase.from("master_programs").upsert({
        program_id: p.id,
        program_name: p.name,
        default_price: p.price,
        active_flag: true
      });
      if (error) throw error;
    }

    for (const a of masterData.addOns || []) {
      const { error } = await supabase.from("master_addons").upsert({
        addon_id: a.id,
        addon_name: a.name,
        default_price: a.defaultPrice,
        active_flag: true
      });
      if (error) throw error;
    }

    return true;
  }
};
