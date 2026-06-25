// =========================================================
// Auth Service
// mock <-> Supabase Auth adapter
// =========================================================

const AuthService = {
  mode() {
    return APP_CONFIG?.AUTH_MODE || "mock";
  },

  client() {
    return getSupabaseClient();
  },

  async login(username, password) {
    if (this.mode() === "mock") {
      const user = AUTH_USERS.find(u => u.username === username && u.password === password);
      if (!user) throw new Error("Username หรือ Password ไม่ถูกต้อง");

      const currentUser = {
        username: user.username,
        role: user.role,
        displayName: user.displayName,
        loginAt: new Date().toISOString()
      };

      localStorage.setItem("current_user", JSON.stringify(currentUser));
      localStorage.setItem("current_role", user.role);
      return currentUser;
    }

    const supabase = this.client();

    // In Supabase mode, username field is treated as email.
    const { data, error } = await supabase.auth.signInWithPassword({
      email: username,
      password
    });

    if (error) throw error;

    const profile = await this.loadCurrentUserProfile(data.user);
    localStorage.setItem("current_user", JSON.stringify(profile));
    localStorage.setItem("current_role", profile.role);
    return profile;
  },

  async logout() {
    if (this.mode() === "supabase") {
      const supabase = this.client();
      await supabase.auth.signOut();
    }

    localStorage.removeItem("current_user");
    localStorage.removeItem("current_role");
  },

  async getSessionUser() {
    if (this.mode() === "mock") {
      return JSON.parse(localStorage.getItem("current_user") || "null");
    }

    const supabase = this.client();
    const { data, error } = await supabase.auth.getUser();
    if (error || !data?.user) return null;

    const profile = await this.loadCurrentUserProfile(data.user);
    localStorage.setItem("current_user", JSON.stringify(profile));
    localStorage.setItem("current_role", profile.role);
    return profile;
  },

  async loadCurrentUserProfile(authUser) {
    const supabase = this.client();

    // app_users.auth_user_id should point to auth.users.id
    let { data, error } = await supabase
      .from("app_users")
      .select("user_id, username, display_name, role_id, active_flag")
      .eq("auth_user_id", authUser.id)
      .maybeSingle();

    if (error) throw error;

    if (!data) {
      // fallback for migration: match by email/username
      const fallback = await supabase
        .from("app_users")
        .select("user_id, username, display_name, role_id, active_flag")
        .eq("username", authUser.email)
        .maybeSingle();

      if (fallback.error) throw fallback.error;
      data = fallback.data;
    }

    if (!data || !data.active_flag) {
      throw new Error("ไม่พบ user profile หรือ user ถูกปิดใช้งาน");
    }

    return {
      userId: data.user_id,
      username: data.username,
      role: data.role_id,
      displayName: data.display_name,
      email: authUser.email,
      loginAt: new Date().toISOString()
    };
  }
};
