(() => {
  const SESSION_KEY = "student-portal-session";
  const USER_KEY = "student-portal-users";
  const protectedRoutes = {
    "academic-head.html": ["academic-head"],
    "academic-head-original.html": ["academic-head"],
    "accounting.html": ["accounting-staff"],
    "accounting-original.html": ["accounting-staff"],
    "administrative-staff.html": ["administrative-staff"],
    "administrative-staff-original.html": ["administrative-staff"],
    "faculty.html": ["faculty"],
    "faculty-original.html": ["faculty"],
    "guidance.html": ["guidance-counselor"],
    "guidance-original.html": ["guidance-counselor"],
    "guidance.backup.html": ["guidance-counselor"],
    "body.html": ["guidance-counselor"],
    "it-admin.html": ["it-system-admin", "admin"],
    "it-admin-original.html": ["it-system-admin", "admin"],
    "president.html": ["president"],
    "president-original.html": ["president", "principal"],
    "principal.html": ["principal"],
    "vice-president.html": ["vice-president"],
    "vice-president-original.html": ["vice-president"],
    "student.html": ["student"]
  };
  const page = decodeURIComponent(location.pathname.split("/").pop() || "").toLowerCase();
  const allowedRoles = protectedRoutes[page];
  const loginPath = location.pathname.toLowerCase().includes("/_build/") ? "../login.html" : "login.html";
  document.documentElement.style.visibility = "hidden";

  let session = null;
  let accounts = [];
  try {
    session = JSON.parse(localStorage.getItem(SESSION_KEY) || "null");
    accounts = JSON.parse(localStorage.getItem(USER_KEY) || "[]");
    if (!Array.isArray(accounts)) accounts = [];
  } catch {
    session = null;
    accounts = [];
  }

  const role = String(session?.role || "").toLowerCase();
  const account = accounts.find(user => {
    const idMatches = session?.accountId && String(user.id || "") === String(session.accountId);
    const emailMatches = String(user.email || "").trim().toLowerCase() === String(session?.email || "").trim().toLowerCase();
    return idMatches || emailMatches;
  });
  const activeAccount = account
    && String(account.status || "active").toLowerCase() !== "inactive"
    && String(account.role || "").toLowerCase() === role;
  if (allowedRoles && activeAccount && allowedRoles.includes(role)) {
    document.documentElement.dataset.riseAccess = "granted";
    document.documentElement.style.visibility = "";
    return;
  }

  if (session) localStorage.removeItem(SESSION_KEY);
  location.replace(loginPath);
})();