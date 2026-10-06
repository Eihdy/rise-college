(() => {
  const admin = window.RiseAdmin;
  if (!admin) {
    if (document.documentElement.dataset.riseAccess === "granted") throw new Error("Administrator account controls are unavailable.");
    return;
  }

  const USER_KEY = "student-portal-users";
  const CATALOG_KEY = "rise-bsit-subject-catalog";
  const SCHEDULE_KEY = "rise-bsit-schedules";
  const YEARS = ["1st Year", "2nd Year", "3rd Year", "4th Year"];
  const SECTIONS = YEARS.flatMap(year => ["A", "B", "C", "D"].map(letter => `BSIT ${year[0]}-${letter}`));
  const DAYS = ["Monday", "Tuesday", "Wednesday", "Thursday", "Friday"];
  const SLOTS = [["08:00", "09:30"], ["10:00", "11:30"], ["13:00", "14:30"], ["15:00", "16:30"]];
  const GRADE_TERMS = ["Prelim", "Midterm", "Pre-finals", "Finals"];
  const DEFAULT_SUBJECTS = {
    "1st Year": [
      ["IT 101", "Introduction to Computing"], ["IT 102", "Programming Fundamentals"],
      ["IT 103", "Discrete Mathematics"], ["IT 104", "Computer Systems and Architecture"],
      ["IT 105", "Human-Computer Interaction"], ["IT 106", "Web Technologies"]
    ],
    "2nd Year": [
      ["IT 201", "Object-Oriented Programming"], ["IT 202", "Data Structures and Algorithms"],
      ["IT 203", "Database Management Systems"], ["IT 204", "Networking Fundamentals"],
      ["IT 205", "Systems Analysis and Design"], ["IT 206", "Information Assurance"]
    ],
    "3rd Year": [
      ["IT 301", "Operating Systems"], ["IT 302", "Software Engineering"],
      ["IT 303", "Web Application Development"], ["IT 304", "Network Administration"],
      ["IT 305", "Data Analytics"], ["IT 306", "IT Project Management"]
    ],
    "4th Year": [
      ["IT 401", "Cloud Computing"], ["IT 402", "Cybersecurity"],
      ["IT 403", "IT Capstone Project"], ["IT 404", "Professional Issues in IT"],
      ["IT 405", "Systems Integration"], ["IT 406", "Emerging Technologies"]
    ]
  };
  const esc = value => String(value ?? "").replace(/[&<>"']/g, char => ({"&":"&amp;", "<":"&lt;", ">":"&gt;", '"':"&quot;", "'":"&#39;"})[char]);
  const normalizeHeader = value => String(value ?? "").trim().toLowerCase().replace(/[^a-z0-9]/g, "");
  const gradeTerm = value => {
    const normalized = normalizeHeader(value);
    if (normalized === "prelim" || normalized === "prelims") return "Prelim";
    if (normalized === "midterm" || normalized === "midterms") return "Midterm";
    if (normalized === "prefinal" || normalized === "prefinals") return "Pre-finals";
    if (normalized === "final" || normalized === "finals") return "Finals";
    return "";
  };
  function gradeMatrix(grades) {
    const subjects = new Map();
    const otherTerms = new Set();
    grades.forEach(grade => {
      const subject = String(grade.subject || "Unspecified subject");
      const term = gradeTerm(grade.term || grade.period) || String(grade.term || grade.period || "").trim();
      if (!subjects.has(subject)) subjects.set(subject, {});
      if (term && !GRADE_TERMS.includes(term)) otherTerms.add(term);
      if (term) subjects.get(subject)[term] = grade.score ?? grade.grade ?? "";
    });
    const columns = [...GRADE_TERMS, ...otherTerms];
    const rows = [...subjects.entries()].map(([subject, scores]) =>
      `<tr><td>${esc(subject)}</td>${columns.map(term => `<td>${esc(scores[term] ?? "—")}</td>`).join("")}</tr>`
    ).join("");
    return `<div class="aat-table-wrap"><table class="aat-table aat-grade-table"><thead><tr><th>Subject</th>${columns.map(term => `<th>${esc(term)}</th>`).join("")}</tr></thead><tbody>${rows || `<tr><td colspan="${columns.length + 1}">No grades uploaded</td></tr>`}</tbody></table></div>`;
  }
  const read = (key, fallback) => {
    try {
      const value = JSON.parse(localStorage.getItem(key));
      return value ?? fallback;
    } catch (error) {
      console.error(`Unable to read ${key}.`, error);
      return fallback;
    }
  };
  const write = (key, value) => localStorage.setItem(key, JSON.stringify(value));
  const catalog = () => {
    const saved = read(CATALOG_KEY, null);
    if (saved && YEARS.every(year => Array.isArray(saved[year]))) return saved;
    write(CATALOG_KEY, DEFAULT_SUBJECTS);
    return structuredClone(DEFAULT_SUBJECTS);
  };
  const schedules = () => read(SCHEDULE_KEY, {});
  const currentPage = () => document.body.dataset.adminPage || "students";
  let manageAccountsOpen = true;
  const controls = (year = "", section = "") => `
    <label class="aat-filter">Year level<select data-filter-year><option value="">All years</option>${YEARS.map(value => `<option ${value === year ? "selected" : ""}>${value}</option>`).join("")}</select></label>
    <label class="aat-filter">Section<select data-filter-section><option value="">All sections</option>${SECTIONS.filter(value => !year || value.startsWith(`BSIT ${year[0]}-`)).map(value => `<option ${value === section ? "selected" : ""}>${value}</option>`).join("")}</select></label>`;
  const setHeader = (title, description) => {
    document.getElementById("workspaceTitle").textContent = title;
    document.getElementById("workspaceDescription").textContent = description;
  };
  const addStyles = () => {
    if (document.getElementById("admin-academic-tools-styles")) return;
    const style = document.createElement("style");
    style.id = "admin-academic-tools-styles";
    style.textContent = `
      body.rise-admin-workflow .main>section:not(.workspace),body.rise-admin-workflow .main>.hero,body.rise-admin-workflow .main>.stats-grid,body.rise-admin-workflow .main>.content-grid {display:none!important}
      body.rise-admin-workflow .workspace{width:100%;margin-top:24px}
      body.rise-admin-workflow .workspace-grid{grid-template-columns:minmax(0,1fr);gap:22px}
      .aat-page{display:grid;gap:22px;width:100%}.aat-toolbar{display:flex;align-items:end;gap:14px;flex-wrap:wrap;padding:20px;border:1px solid var(--border);border-radius:16px;background:var(--surface)}
      .aat-filter{display:grid;gap:7px;color:var(--text-soft);font-size:12px;font-weight:800}.aat-filter select,.aat-filter input,.aat-toolbar input[type=text]{min-height:44px;padding:10px 13px;border:1px solid var(--border);border-radius:10px;color:var(--text);background:var(--surface-2);font:inherit}
      .aat-note{margin:0;color:var(--text-soft);font-size:12px;line-height:1.65}.aat-message{min-height:20px;color:var(--text-soft);font-size:12px}.aat-table{width:100%;border-collapse:collapse;min-width:760px}.aat-table th,.aat-table td{padding:15px 17px;border-bottom:1px solid var(--border);text-align:left;font-size:12px;vertical-align:middle}.aat-table th{color:var(--text-soft);font-size:10px;text-transform:uppercase;letter-spacing:.06em}.aat-table tr:last-child td{border-bottom:0}.aat-card{min-height:250px;overflow:hidden;border:1px solid var(--border);border-radius:19px;background:var(--surface);box-shadow:var(--shadow-soft)}.aat-card-head{display:flex;align-items:center;justify-content:space-between;gap:12px;padding:20px 23px;border-bottom:1px solid var(--border)}.aat-card-head h4{margin:0;font-size:16px}.aat-card-head span{color:var(--text-soft);font-size:12px}.aat-table-wrap{overflow:auto}.aat-actions{display:flex;gap:7px;flex-wrap:wrap}.aat-inline{display:flex;gap:7px;flex-wrap:wrap}.aat-grade-table{margin:12px 0 14px;min-width:500px}.aat-grade-table th,.aat-grade-table td{padding:9px 11px;font-size:11px}.aat-grade-details{padding:3px 0}.aat-grade-details summary{width:fit-content;color:var(--text);cursor:pointer;font-size:12px;font-weight:700}.aat-grade-details[open] summary{margin-bottom:8px}.aat-grade-details .aat-table-wrap{max-width:100%}.aat-button-danger{color:var(--red)}.aat-empty{padding:32px;text-align:center;color:var(--text-soft);font-size:12px}.aat-warning{padding:15px 18px;border:1px solid rgba(244,201,93,.2);border-radius:13px;color:var(--text-soft);background:rgba(244,201,93,.05);font-size:12px;line-height:1.65}.aat-cell-input{width:min(320px,100%);min-height:40px;padding:8px 11px;border:1px solid var(--border);border-radius:9px;color:var(--text);background:var(--surface-2)}.aat-schedule-grid{display:grid;grid-template-columns:repeat(auto-fit,minmax(220px,1fr));gap:14px;padding:20px}.aat-schedule-day{padding:16px;border:1px solid var(--border);border-radius:13px;background:var(--surface-2)}.aat-schedule-day h5{margin:0 0 12px;font-size:12px}.aat-schedule-item{padding:11px 0;border-top:1px solid var(--border);font-size:11px}.aat-schedule-item strong,.aat-schedule-item span{display:block}.aat-schedule-item span{margin-top:5px;color:var(--text-soft)}.aat-file{display:none}
      .aat-manage-panel[hidden]{display:none}.aat-search{min-width:min(300px,100%);flex:1}.aat-status-filter{min-width:150px}
      .aat-student-overview{display:grid;gap:16px}
      .aat-student-welcome{display:flex;align-items:center;justify-content:space-between;gap:24px;padding:24px 26px;border:1px solid var(--border);border-left:4px solid #78b8e7;border-radius:12px;background:linear-gradient(110deg,var(--surface),var(--surface-2))}
      .aat-student-welcome h2{margin:4px 0 6px;color:var(--text);font-size:clamp(22px,2.6vw,30px);letter-spacing:-.035em}
      .aat-student-welcome p{max-width:640px;margin:0;color:var(--text-soft);font-size:13px;line-height:1.6}
      .aat-student-kicker{color:var(--blue-2);font-size:10px;font-weight:800;letter-spacing:.12em;text-transform:uppercase}
      .aat-student-welcome .admin-button{flex:0 0 auto;min-height:42px;padding:10px 15px}
      .aat-student-stats{display:grid;grid-template-columns:repeat(3,minmax(0,1fr));gap:12px}
      .aat-student-stat{position:relative;overflow:hidden;min-height:102px;padding:16px 18px;border:1px solid var(--border);border-radius:10px;background:var(--surface)}
      .aat-student-stat:after{position:absolute;right:0;top:0;width:4px;height:100%;background:var(--stat-accent,#78b8e7);content:""}
      .aat-student-stat span{display:block;color:var(--text-soft);font-size:11px}
      .aat-student-stat strong{display:block;margin-top:8px;color:var(--text);font-size:27px;line-height:1}
      .aat-year-summary{padding:17px 19px;border:1px solid var(--border);border-radius:10px;background:var(--surface)}
      .aat-year-summary-head{display:flex;align-items:center;justify-content:space-between;gap:12px;margin-bottom:15px}
      .aat-year-summary-head h3{margin:0;color:var(--text);font-size:14px}
      .aat-year-summary-head span{color:var(--text-soft);font-size:11px}
      .aat-year-list{display:grid;grid-template-columns:repeat(4,minmax(0,1fr));gap:14px}
      .aat-year-item{min-width:0}
      .aat-year-label{display:flex;justify-content:space-between;gap:8px;margin-bottom:7px;color:var(--text-soft);font-size:11px}
      .aat-year-label strong{color:var(--text);font-weight:700}
      .aat-year-track{height:5px;overflow:hidden;border-radius:5px;background:var(--surface-3)}
      .aat-year-track span{display:block;height:100%;border-radius:inherit;background:#78b8e7}
      .aat-directory{margin-top:2px}
      .aat-directory .aat-card-head{background:var(--surface-2)}
      .aat-directory .aat-toolbar{border-bottom:1px solid var(--border)}
      .aat-directory .aat-table tbody tr[data-student-row]:hover{background:rgba(120,184,231,.06)}
      .aat-directory .aat-table td strong{color:var(--text);font-size:13px}
      @media(max-width:760px){.aat-student-welcome{align-items:flex-start;flex-direction:column}.aat-student-stats{grid-template-columns:repeat(3,minmax(0,1fr))}.aat-student-stat{padding:14px}.aat-student-stat strong{font-size:23px}.aat-year-list{grid-template-columns:repeat(2,minmax(0,1fr))}}
      @media(max-width:480px){.aat-student-stats{grid-template-columns:1fr}.aat-student-stat{min-height:82px}.aat-student-welcome{padding:20px}}
      @media(max-width:620px){.aat-toolbar>*{width:100%}.aat-actions{min-width:135px}}
    `;
    document.head.append(style);
  };
  const allStudents = () => admin.accountList()
    .filter(account => account.role === "student")
    .sort((a, b) => a.name.localeCompare(b.name));
  const profileFor = account => account.profile || {};
  const selectedStudents = (year, section) => allStudents().filter(account => {
    const profile = profileFor(account);
    return (!year || profile.year === year) && (!section || profile.section === section);
  });
  const setView = (page, title, description) => {
    document.body.classList.add("rise-admin-workflow");
    document.body.dataset.adminPage = page;
    document.querySelectorAll(".sidebar-nav .nav-item").forEach(item => item.classList.toggle("active", item.dataset.module === page));
    setHeader(title, description);
  };
  const studentActions = account => {
    const key = esc(account.id || account.email);
    const profile = profileFor(account);
    const grades = profileFor(account).grades || [];
    const gradeTable = grades.length
      ? gradeMatrix(grades)
      : `<p class="aat-note">No grades uploaded yet.</p>`;
    const search = [account.name, account.email, profile.studentId, account.studentId, profile.year, profile.section].join(" ").toLowerCase();
    return `<tr data-student-row data-search="${esc(search)}" data-status="${esc(account.status)}"><td><strong>${esc(account.name)}</strong><br><span class="account-identities">${esc(profile.studentId || account.studentId || "No student ID")}</span></td><td>${esc(account.email)}</td><td>${esc(profile.year || "Not assigned")}</td><td>${esc(profile.section || "Not assigned")}</td><td>${esc(account.status === "inactive" ? "Inactive" : "Active")}</td><td><div class="aat-actions"><button class="admin-button" data-account-action="edit" data-account-key="${key}" type="button">Edit record</button><button class="admin-button" data-account-action="view" data-account-key="${key}" type="button">View</button><button class="admin-button" data-account-action="toggle" data-account-key="${key}" type="button">${account.status === "inactive" ? "Activate" : "Deactivate"}</button><button class="admin-button danger" data-account-action="delete" data-account-key="${key}" type="button">Delete</button></div></td></tr><tr><td colspan="6">${gradeTable}</td></tr>`;
  };
  function renderStudents() {
    setView("students", "Students", "Create student login accounts and maintain administrator-managed student records.");
    const students = allStudents();
    const activeStudents = students.filter(account => account.status !== "inactive").length;
    const inactiveStudents = students.length - activeStudents;
    const unassignedStudents = students.filter(account => !profileFor(account).year || !profileFor(account).section).length;
    const yearCounts = YEARS.map(year => [year, students.filter(account => profileFor(account).year === year).length]);
    const largestYearCount = Math.max(1, ...yearCounts.map(([, count]) => count));
    const yearSummary = yearCounts.map(([year, count]) => `<div class="aat-year-item"><div class="aat-year-label"><span>${esc(year)}</span><strong>${count}</strong></div><div class="aat-year-track" role="img" aria-label="${count} students in ${esc(year)}"><span style="width:${Math.round(count / largestYearCount * 100)}%"></span></div></div>`).join("");
    document.getElementById("workspaceGrid").innerHTML = `
      <div class="aat-page">
        <section class="aat-student-overview" aria-label="Student overview">
          <div class="aat-student-welcome">
            <div>
              <span class="aat-student-kicker">Student records</span>
              <h2>Keep every student record in order.</h2>
              <p>Create accounts, check year and section placements, and manage student access from one place.</p>
            </div>
            <button class="admin-button primary" data-create-account type="button">+ Add student</button>
          </div>
          <div class="aat-student-stats" aria-label="Student account summary">
            <article class="aat-student-stat" style="--stat-accent:#78b8e7"><span>Student accounts</span><strong>${students.length}</strong></article>
            <article class="aat-student-stat" style="--stat-accent:#75c6a0"><span>Active accounts</span><strong>${activeStudents}</strong></article>
            <article class="aat-student-stat" style="--stat-accent:#d8bb70"><span>Needs year or section</span><strong>${unassignedStudents}</strong></article>
          </div>
          <section class="aat-year-summary" aria-label="Students by year level">
            <div class="aat-year-summary-head"><h3>Enrollment by year</h3><span>${inactiveStudents} inactive</span></div>
            <div class="aat-year-list">${yearSummary}</div>
          </section>
        </section>
        <section class="aat-card aat-manage-panel aat-directory" data-manage-panel ${manageAccountsOpen ? "" : "hidden"}>
          <div class="aat-card-head"><h4>Student directory</h4><span>${students.length} records</span></div>
          <div class="aat-toolbar">
            <p class="aat-note">Search and filter records, then use the row actions to view or update an account.</p>
            <div class="aat-actions">
              <button class="admin-button" data-manage-accounts type="button" aria-expanded="${manageAccountsOpen}">${manageAccountsOpen ? "Hide directory" : "Show directory"}</button>
            </div>
          </div>
          <div class="aat-toolbar">
            <input class="aat-search" data-account-search type="search" placeholder="Search by student, email, or ID">
            <label class="aat-filter aat-status-filter">Status<select data-account-status><option value="">All statuses</option><option value="active">Active</option><option value="inactive">Inactive</option></select></label>
          </div>
          <div class="aat-table-wrap"><table class="aat-table"><thead><tr><th>Student</th><th>Email / login</th><th>Year</th><th>Section</th><th>Status</th><th>Actions</th></tr></thead><tbody>${students.length ? students.map(studentActions).join("") : `<tr><td colspan="6" class="aat-empty">No student accounts have been created yet.</td></tr>`}</tbody></table></div>
        </section>
        ${manageAccountsOpen ? "" : `<button class="admin-button" data-manage-accounts type="button" aria-expanded="${manageAccountsOpen}">Show student directory</button>`}
      </div>`;
    const filterAccounts = () => {
      const query = document.querySelector("[data-account-search]").value.trim().toLowerCase();
      const status = document.querySelector("[data-account-status]").value;
      document.querySelectorAll("[data-student-row]").forEach(row => {
        row.hidden = !(row.dataset.search.includes(query) && (!status || row.dataset.status === status));
        const gradesRow = row.nextElementSibling;
        if (gradesRow) gradesRow.hidden = row.hidden;
      });
    };
    document.querySelector("[data-account-search]").addEventListener("input", filterAccounts);
    document.querySelector("[data-account-status]").addEventListener("change", filterAccounts);
  }
  window.riseAdminRenderStudents = renderStudents;
  function renderSubjects() {
    setView("subjects", "Subjects", "Review and manage the BSIT subjects available to each year level and section.");
    const years = YEARS;
    const currentYear = document.querySelector("[data-filter-year]")?.value || years[0];
    const selectedSection = document.querySelector("[data-filter-section]")?.value || "";
    const currentSection = selectedSection && !selectedSection.startsWith(`BSIT ${currentYear[0]}-`) ? "" : selectedSection;
    const subjects = catalog()[currentYear];
    document.getElementById("workspaceGrid").innerHTML = `<div class="aat-page"><div class="aat-warning">Starter BSIT catalog for planning purposes. Confirm it against the college's official curriculum before using it as an official subject list.</div><section class="aat-card"><div class="aat-toolbar">${controls(currentYear, currentSection)}<button class="admin-button primary" data-add-subject type="button">+ Add subject</button></div><div class="aat-card-head"><h4>${esc(currentSection || currentYear)} · BSIT subjects</h4><span>${subjects.length} available subjects</span></div><div class="aat-table-wrap"><table class="aat-table"><thead><tr><th>Subject code</th><th>Subject title</th><th>Availability</th><th>Action</th></tr></thead><tbody>${subjects.map((subject, index) => `<tr><td><strong>${esc(subject[0])}</strong></td><td>${esc(subject[1])}</td><td>${esc(currentSection || currentYear)}</td><td><button class="admin-button danger" data-remove-subject="${index}" type="button">Remove</button></td></tr>`).join("")}</tbody></table></div></section></div>`;
    const yearSelect = document.querySelector("[data-filter-year]");
    const sectionSelect = document.querySelector("[data-filter-section]");
    yearSelect.addEventListener("change", () => renderSubjects());
    sectionSelect.addEventListener("change", () => renderSubjects());
  }
  function renderGrades() {
    setView("grades", "Grades", "Filter BSIT students by year and section, then import or export each student's grades.");
    const previousYear = document.querySelector("[data-filter-year]")?.value || "";
    const selectedSection = document.querySelector("[data-filter-section]")?.value || "";
    const previousSection = previousYear && selectedSection && !selectedSection.startsWith(`BSIT ${previousYear[0]}-`) ? "" : selectedSection;
    const initialStudents = selectedStudents(previousYear, previousSection);
    const year = previousYear || initialStudents[0]?.profile?.year || "";
    const section = previousSection;
    const students = selectedStudents(year, section);
    document.getElementById("workspaceGrid").innerHTML = `<div class="aat-page"><div class="aat-toolbar">${controls(year, section)}<span class="aat-message" id="gradeMessage" role="status"></span></div><p class="aat-note">Upload either a spreadsheet with <strong>Subject, Prelim, Midterm, Pre-finals, Finals</strong> columns or the older <strong>Subject, Term, Score</strong> format. Grades are saved to the selected student's account and displayed here and in the student portal.</p><section class="aat-card"><div class="aat-card-head"><h4>${esc(section || year || "All BSIT students")} · individual grade records</h4><span>${students.length} students</span></div><div class="aat-table-wrap"><table class="aat-table"><thead><tr><th>Student</th><th>Year / section</th><th>Saved grades</th><th>Excel actions</th></tr></thead><tbody>${students.length ? students.map(account => {
      const profile = profileFor(account);
      const rows = Array.isArray(profile.grades) ? profile.grades : [];
      const key = esc(account.id || account.email);
      const gradeTable = rows.length ? gradeMatrix(rows) : `<span class="aat-note">No grades uploaded</span>`;
      const gradeDisclosure = rows.length
        ? `<details class="aat-grade-details"><summary>View uploaded grades (${rows.length})</summary>${gradeTable}</details>`
        : `<span class="aat-note">No grades uploaded</span>`;
      return `<tr><td><strong>${esc(account.name)}</strong><br><span class="account-identities">${esc(profile.studentId || account.studentId || "")} · ${esc(account.email)}</span></td><td>${esc(profile.year || "—")} · ${esc(profile.section || "—")}</td><td>${rows.length} grade${rows.length === 1 ? "" : "s"}</td><td><div class="aat-actions"><button class="admin-button" data-export-grades="${key}" type="button">Export grades</button><button class="admin-button" data-grade-template-for="${key}" type="button">Download template</button><button class="admin-button primary" data-import-grades="${key}" type="button">Upload Excel</button>${rows.length ? `<button class="admin-button aat-button-danger" data-delete-grades="${key}" type="button">Delete grades</button>` : ""}<input class="aat-file" type="file" data-grade-file="${key}" accept=".xlsx,.xls,.csv"></div></td></tr><tr><td colspan="4">${gradeDisclosure}</td></tr>`;
    }).join("") : `<tr><td colspan="4" class="aat-empty">No students match this year and section.</td></tr>`}</tbody></table></div></section></div>`;
    document.querySelector("[data-filter-year]").addEventListener("change", () => renderGrades());
    document.querySelector("[data-filter-section]").addEventListener("change", () => renderGrades());
  }
  function renderSchedules() {
    setView("schedules", "Schedules", "Generate and review a conflict-free starter timetable for each BSIT section.");
    const currentSection = document.querySelector("[data-schedule-section]")?.value || SECTIONS[0];
    const year = YEARS.find(value => value[0] === currentSection[5]) || YEARS[0];
    const schedule = schedules()[currentSection] || [];
    const byDay = Object.fromEntries(DAYS.map(day => [day, schedule.filter(item => item.day === day).sort((a, b) => a.start.localeCompare(b.start))]));
    document.getElementById("workspaceGrid").innerHTML = `<div class="aat-page"><div class="aat-warning">Uses the editable starter BSIT subject catalog and default Monday–Friday time slots. Each section gets its own room and non-overlapping class periods; replace the starter plan with the school's actual room and instructor assignments before publishing.</div><section class="aat-card"><div class="aat-toolbar"><label class="aat-filter">Section<select data-schedule-section>${SECTIONS.map(value => `<option ${value === currentSection ? "selected" : ""}>${value}</option>`).join("")}</select></label><button class="admin-button primary" data-generate-schedule type="button">Generate this section</button><button class="admin-button" data-generate-all-schedules type="button">Generate all 16 sections</button><span class="aat-message" id="scheduleMessage" role="status"></span></div><div class="aat-card-head"><h4>${esc(currentSection)} · ${esc(year)}</h4><span>${schedule.length ? "Generated timetable" : "No timetable generated"}</span></div>${schedule.length ? `<div class="aat-schedule-grid">${DAYS.map(day => `<div class="aat-schedule-day"><h5>${day}</h5>${byDay[day].length ? byDay[day].map(item => `<div class="aat-schedule-item"><strong>${esc(item.start)}–${esc(item.end)} · ${esc(item.code)}</strong><span>${esc(item.name)}</span><span>${esc(item.room)}</span></div>`).join("") : `<p class="aat-note">No classes</p>`}</div>`).join("")}</div>` : `<div class="aat-empty">Choose a section and generate its timetable.</div>`}</section></div>`;
    document.querySelector("[data-schedule-section]").addEventListener("change", renderSchedules);
  }
  function renderPage(page) {
    if (page === "students") renderStudents();
    else if (page === "subjects") renderSubjects();
    else if (page === "grades") renderGrades();
    else if (page === "schedules") renderSchedules();
  }
  function exportWorkbook(filename, rows, sheetName = "Grades") {
    if (!window.XLSX) throw new Error("Excel support is unavailable. Check your internet connection and reload the page.");
    const worksheet = window.XLSX.utils.aoa_to_sheet(rows);
    const workbook = window.XLSX.utils.book_new();
    window.XLSX.utils.book_append_sheet(workbook, worksheet, sheetName);
    const content = window.XLSX.write(workbook, {bookType:"xlsx", type:"array"});
    const url = URL.createObjectURL(new Blob([content], {type:"application/vnd.openxmlformats-officedocument.spreadsheetml.sheet"}));
    const link = document.createElement("a");
    link.href = url;
    link.download = filename;
    link.click();
    URL.revokeObjectURL(url);
  }
  function buildSchedule(section, subjects) {
    const sectionLetter = section.slice(-1).charCodeAt(0) - 65;
    const room = `BSIT-${section[5]}${sectionLetter + 1}-ROOM`;
    return subjects.map((subject, index) => {
      const dayIndex = (index + sectionLetter) % DAYS.length;
      const slotIndex = Math.floor(index / DAYS.length);
      const slot = SLOTS[slotIndex % SLOTS.length];
      return {day:DAYS[dayIndex], start:slot[0], end:slot[1], code:subject[0], name:subject[1], room};
    }).sort((a, b) => DAYS.indexOf(a.day) - DAYS.indexOf(b.day) || a.start.localeCompare(b.start));
  }
  function filenamePart(value) {
    return String(value || "student").normalize("NFKD").replace(/[^a-zA-Z0-9_-]+/g, "-").replace(/^-+|-+$/g, "") || "student";
  }
  async function importGrades(input, account) {
    const message = document.getElementById("gradeMessage");
    const file = input.files?.[0];
    if (!file) return;
    try {
      if (!window.XLSX) throw new Error("Excel support is unavailable. Check your internet connection and reload the page.");
      const bytes = await file.arrayBuffer();
      const workbook = window.XLSX.read(bytes, {type:"array"});
      const sheet = workbook.Sheets[workbook.SheetNames[0]];
      if (!sheet) throw new Error("The selected workbook has no worksheet.");
      const rows = window.XLSX.utils.sheet_to_json(sheet, {defval:"", raw:false});
      if (!rows.length) throw new Error("The selected worksheet has no grade rows.");
      const profile = account.profile || {};
      const subjects = catalog()[profile.year] || [];
      const prepared = [];
      rows.forEach((row, index) => {
        const cells = Object.fromEntries(Object.entries(row).map(([key, value]) => [normalizeHeader(key), value]));
        const subject = String(cells.subject || cells.subjectcode || "").trim();
        if (!subject && Object.values(cells).every(value => !String(value ?? "").trim())) return;
        const matchingSubject = subjects.find(item => item[0].toLowerCase() === subject.toLowerCase() || item[1].toLowerCase() === subject.toLowerCase());
        if (!subject || !matchingSubject) throw new Error(`Row ${index + 2}: "${subject || "missing subject"}" is not in the BSIT ${profile.year || "student"} catalog.`);
        const canonicalSubject = matchingSubject[0];
        const longFormatTerm = cells.term || cells.period;
        if (longFormatTerm) {
          const term = gradeTerm(longFormatTerm);
          if (!term) throw new Error(`Row ${index + 2}: term must be Prelim, Midterm, Pre-finals, or Finals.`);
          const scoreText = String(cells.score ?? cells.grade ?? "").trim();
          const score = Number(scoreText);
          if (!scoreText || !Number.isFinite(score) || score < 0 || score > 100) throw new Error(`Row ${index + 2}: enter a grade from 0 to 100.`);
          prepared.push({subject:canonicalSubject, term, score});
          return;
        }
        GRADE_TERMS.forEach(term => {
          const header = normalizeHeader(term);
          const aliases = term === "Pre-finals" ? [header, "prefinal"] : [header];
          const headerKey = aliases.find(key => Object.prototype.hasOwnProperty.call(cells, key));
          const scoreText = String(headerKey ? cells[headerKey] : "").trim();
          if (!scoreText) return;
          const score = Number(scoreText);
          if (!Number.isFinite(score) || score < 0 || score > 100) throw new Error(`Row ${index + 2}: ${term} grade must be a number from 0 to 100.`);
          prepared.push({subject:canonicalSubject, term, score});
        });
      });
      if (!prepared.length) throw new Error("No grades were found. Fill in at least one grade for each subject.");
      const current = Array.isArray(profile.grades) ? profile.grades : [];
      const merged = [...current];
      prepared.forEach(grade => {
        const index = merged.findIndex(item => item.subject === grade.subject && gradeTerm(item.term || item.period) === grade.term);
        if (index >= 0) merged[index] = grade;
        else merged.push(grade);
      });
      admin.saveProfile(account, {...profile, grades:merged});
      admin.recordAction("Imported student grades", account.name);
      message.textContent = `Imported ${prepared.length} grade${prepared.length === 1 ? "" : "s"} across ${new Set(prepared.map(grade => grade.term)).size} term${new Set(prepared.map(grade => grade.term)).size === 1 ? "" : "s"} for ${account.name}.`;
      renderGrades();
      const refreshedMessage = document.getElementById("gradeMessage");
      if (refreshedMessage) refreshedMessage.textContent = message.textContent;
    } catch (error) {
      console.error("Student grade import failed.", error);
      if (message) message.textContent = error.message;
    } finally {
      input.value = "";
    }
  }
  document.querySelectorAll(".sidebar-nav .nav-item").forEach(item => item.addEventListener("click", () => {
    renderPage(item.dataset.module);
    window.scrollTo({top:0, behavior:"smooth"});
  }));
  document.getElementById("workspaceGrid").addEventListener("click", event => {
    const target = event.target;
    if (!(target instanceof HTMLElement)) return;
    if (target.matches("[data-manage-accounts]")) {
      manageAccountsOpen = !manageAccountsOpen;
      renderStudents();
      document.querySelector("[data-manage-accounts]")?.focus();
    }
    if (target.matches("[data-add-subject]")) {
      const year = document.querySelector("[data-filter-year]").value;
      const code = prompt("Enter the IT subject code (for example, IT 210):");
      if (code === null) return;
      const name = prompt("Enter the BSIT subject title:");
      if (name === null) return;
      if (!code.trim() || !name.trim()) { toast("Subject code and title are required."); return; }
      if (!/^IT\s?\d{3}$/i.test(code.trim())) { toast("Use an IT-only subject code such as IT 210."); return; }
      const data = catalog();
      if (data[year].some(subject => subject[0].toLowerCase() === code.trim().toLowerCase())) { toast("That subject code already exists for this year level."); return; }
      data[year].push([code.trim(), name.trim()]);
      write(CATALOG_KEY, data);
      admin.recordAction("Added BSIT subject", `${code.trim()} · ${year}`);
      renderSubjects();
    }
    if (target.matches("[data-remove-subject]")) {
      const year = document.querySelector("[data-filter-year]").value;
      const data = catalog();
      const subject = data[year][Number(target.dataset.removeSubject)];
      if (!subject || !confirm(`Remove ${subject[0]} — ${subject[1]} from ${year}?`)) return;
      data[year].splice(Number(target.dataset.removeSubject), 1);
      write(CATALOG_KEY, data);
      admin.recordAction("Removed BSIT subject", `${subject[0]} · ${year}`);
      renderSubjects();
    }
    if (target.matches("[data-generate-schedule]")) {
      const section = document.querySelector("[data-schedule-section]").value;
      const year = YEARS.find(value => value[0] === section[5]);
      const subjects = catalog()[year] || [];
      if (!subjects.length) { document.getElementById("scheduleMessage").textContent = "Add BSIT subjects to this year before generating a schedule."; return; }
      if (subjects.length > DAYS.length * SLOTS.length) { document.getElementById("scheduleMessage").textContent = "This section has more subjects than the 20 available weekly time slots."; return; }
      const generated = buildSchedule(section, subjects);
      const all = schedules();
      all[section] = generated;
      write(SCHEDULE_KEY, all);
      admin.recordAction("Generated section schedule", section);
      renderSchedules();
      document.getElementById("scheduleMessage").textContent = `Generated ${generated.length} class sessions.`;
    }
    if (target.matches("[data-generate-all-schedules]")) {
      const subjectsByYear = catalog();
      const missing = YEARS.filter(year => !subjectsByYear[year]?.length);
      if (missing.length) {
        document.getElementById("scheduleMessage").textContent = `Add subjects for ${missing.join(", ")} before generating all section schedules.`;
        return;
      }
      const oversized = YEARS.filter(year => subjectsByYear[year].length > DAYS.length * SLOTS.length);
      if (oversized.length) {
        document.getElementById("scheduleMessage").textContent = `Reduce the subject count to 20 or fewer for ${oversized.join(", ")} before generating all schedules.`;
        return;
      }
      const all = schedules();
      SECTIONS.forEach(section => {
        const year = YEARS.find(value => value[0] === section[5]);
        all[section] = buildSchedule(section, subjectsByYear[year]);
      });
      write(SCHEDULE_KEY, all);
      admin.recordAction("Generated all section schedules", "16 BSIT sections");
      renderSchedules();
      document.getElementById("scheduleMessage").textContent = `Generated schedules for all ${SECTIONS.length} sections.`;
    }
    if (target.matches("[data-import-grades]")) document.querySelector(`[data-grade-file="${CSS.escape(target.dataset.importGrades)}"]`)?.click();
    if (target.matches("[data-export-grades]")) {
      const account = admin.accountList().find(item => String(item.id || item.email) === target.dataset.exportGrades);
      if (!account) { toast("Student account was not found."); return; }
      const profile = profileFor(account);
      const grades = Array.isArray(profile.grades) ? profile.grades : [];
      const otherTerms = [...new Set(grades.map(grade => gradeTerm(grade.term || grade.period) || String(grade.term || grade.period || "").trim()).filter(term => term && !GRADE_TERMS.includes(term)))];
      const terms = [...GRADE_TERMS, ...otherTerms];
      const rows = [["Student name", account.name], ["Student ID", profile.studentId || account.studentId || ""], ["Year level", profile.year || ""], ["Section", profile.section || ""], [], ["Subject", ...terms]];
      const gradeRows = new Map();
      grades.forEach(grade => {
        const term = gradeTerm(grade.term || grade.period) || String(grade.term || grade.period || "Finals").trim();
        if (!gradeRows.has(grade.subject)) gradeRows.set(grade.subject, Object.fromEntries(terms.map(name => [name, ""])));
        gradeRows.get(grade.subject)[term] = grade.score ?? grade.grade ?? "";
      });
      gradeRows.forEach((scores, subject) => rows.push([subject, ...terms.map(term => scores[term])]));
      try { exportWorkbook(`${filenamePart(profile.studentId || account.name)}-grades.xlsx`, rows, "Student Grades"); }
      catch (error) { console.error("Grade export failed.", error); toast(error.message); }
    }
    if (target.matches("[data-grade-template-for]")) {
      const student = admin.accountList().find(item => String(item.id || item.email) === target.dataset.gradeTemplateFor);
      if (!student) { toast("Student account was not found."); return; }
      const profile = profileFor(student);
      const subjects = catalog()[profile.year] || [];
      if (!profile.year || !profile.section || !subjects.length) {
        toast("Assign this student a year level and section before downloading a grade template.");
        return;
      }
      const rows = [["Section", "Subject code", "Subject name", ...GRADE_TERMS], ...subjects.map(([code, name]) => [profile.section, code, name, "", "", "", ""])];
      try { exportWorkbook(`${filenamePart(profile.studentId || student.name)}-grade-template.xlsx`, rows, "Grade Template"); }
      catch (error) { console.error("Grade template export failed.", error); toast(error.message); }
    }
    if (target.matches("[data-delete-grades]")) {
      const account = admin.accountList().find(item => String(item.id || item.email) === target.dataset.deleteGrades);
      if (!account || account.role !== "student") { toast("Student account was not found."); return; }
      const profile = profileFor(account);
      const grades = Array.isArray(profile.grades) ? profile.grades : [];
      if (!grades.length) { toast("This student has no uploaded grades to remove."); return; }
      if (!confirm(`Remove all ${grades.length} grade record${grades.length === 1 ? "" : "s"} for ${account.name}? This cannot be undone.`)) return;
      admin.saveProfile(account, {...profile, grades:[]});
      admin.recordAction("Deleted student grades", `${account.name} · ${profile.studentId || account.studentId || account.email}`);
      renderGrades();
      document.getElementById("gradeMessage").textContent = `Removed all grades for ${account.name}.`;
    }
  });
  document.getElementById("workspaceGrid").addEventListener("change", event => {
    const input = event.target;
    if (!(input instanceof HTMLInputElement) || !input.matches("[data-grade-file]")) return;
    const account = admin.accountList().find(item => String(item.id || item.email) === input.dataset.gradeFile);
    if (!account) { toast("Student account was not found."); return; }
    importGrades(input, account);
  });
  renderStudents();
  addStyles();
})();
