/* RISE SIS — Role-specific data */
(() => {
  const pages={
    "principal.html":["Principal","Principal Dashboard",["Students","Faculty","Enrollment","Academic Records","Attendance","Guidance","Reports","Announcements"]],
    "vice-president.html":["Vice President","Vice President Dashboard",["Students","Faculty","Enrollment","Academic Records","Attendance","Guidance","Reports","Announcements"]],
    "academic-head.html":["Academic Head","Academic Management",["Programs","Subjects","Curriculum","Sections","Faculty Assignment","Schedules","Grades","Academic Reports"]],
    "it-admin.html":["IT / System Administrator","System Administration",["User Accounts","Roles & Permissions","System Settings","Database","Backups","Security","Audit Logs","System Monitoring"]],
    "accounting.html":["Accounting Staff","Accounting Dashboard",["Students","Billing","Payments","Balances","Receipts","Financial Reports"]],
    "guidance.html":["Guidance Counselor","Guidance Dashboard",["Student Profiles","Counseling Records","Appointments","Interventions","Behavioral/Incident Records","Guidance Reports"]],
    "administrative-staff.html":["Administrative Staff","Administrative Dashboard",["Student Registration","Student Profiles","Documents","Announcements","Basic Reports"]],
    "faculty.html":["Faculty / Teachers","Teacher Portal",["My Classes","My Students","Attendance","Grades","Schedule","Announcements"]]
  };
  const vals={
    Students:["1,240","Active students",92],Faculty:["96","Faculty members",96],Enrollment:["1,312","Current enrollment",94],"Academic Records":["88%","Achievement rate",88],Attendance:["96.4%","Daily attendance",96],Guidance:["24","Active cases",80],Reports:["12","Reports ready",86],Announcements:["6","Active notices",76],
    Programs:["8","Active programs",89],Subjects:["42","Current subjects",93],Curriculum:["100%","Programs reviewed",100],Sections:["38","Active sections",92],"Faculty Assignment":["96%","Teaching load filled",96],Schedules:["142","Class schedules",91],Grades:["92%","Grades submitted",92],"Academic Reports":["9","Reports ready",90],
    "User Accounts":["1,486","Active accounts",94],"Roles & Permissions":["12","Defined roles",100],"System Settings":["24","Configurations",96],Database:["99.9%","System availability",99.9],Backups:["7","Recent backups",100],Security:["0","Critical alerts",100],"Audit Logs":["328","Recent activities",91],"System Monitoring":["99.9%","Service uptime",99.9],
    Billing:["842","Open billings",84],Payments:["PHP 1.8M","Recorded payments",91],Balances:["PHP 320K","Outstanding balances",72],Receipts:["624","Receipts issued",93],"Financial Reports":["8","Reports ready",88],
    "Student Profiles":["1,240","Student records",95],"Counseling Records":["86","Session records",87],Appointments:["18","Upcoming sessions",78],Interventions:["24","Open interventions",82],"Behavioral/Incident Records":["11","Open records",74],"Guidance Reports":["6","Reports ready",90],
    "Student Registration":["138","New registrations",89],Documents:["276","Pending documents",73],"Basic Reports":["5","Reports ready",88],
    "My Classes":["3","Assigned classes",92],"My Students":["96","Students assigned",94],Schedule:["18","Weekly sessions",90]
  };
  const desc={
    Students:"Monitor learner population, participation, retention, and school-wide student progress from one executive view.",
    Faculty:"Review teaching coverage, staffing readiness, workload distribution, and instructional support.",
    Enrollment:"Track admissions, retention, enrollment movement, and the institution's current growth outlook.",
    "Academic Records":"Review grade trends, academic standing, performance summaries, and achievement indicators.",
    Attendance:"Monitor attendance performance, daily presence, participation trends, and operational reliability.",
    Guidance:"Track counseling needs, student interventions, appointments, and support-service activity.",
    Reports:"Access leadership-ready reports, performance summaries, and decision-support information.",
    Announcements:"Stay informed about school-wide notices, events, deadlines, and institutional communications.",
    Programs:"Oversee active programs, academic delivery, quality monitoring, and institutional program performance.",
    Subjects:"Review subject coverage, academic offerings, instructional balance, and subject availability.",
    Curriculum:"Track curriculum review, alignment, implementation readiness, and academic quality standards.",
    Sections:"Monitor section assignments, learner grouping, capacity, and section planning.",
    "Faculty Assignment":"Review faculty placement, teaching loads, staffing balance, and assignment readiness.",
    Schedules:"Review timetable flow, class sequencing, room utilization, and instructional coordination.",
    Grades:"Track grade submission, assessment quality, academic achievement, and performance trends.",
    "Academic Reports":"Access academic summaries, quarterly performance insights, and leadership reporting.",
    "User Accounts":"Manage system accounts, account status, access readiness, and user lifecycle information.",
    "Roles & Permissions":"Review defined roles, access levels, permissions, and security boundaries.",
    "System Settings":"Monitor important system configurations and administrative settings.",
    Database:"Monitor database availability, reliability, and core system health.",
    Backups:"Review backup readiness, recent backup activity, and recovery preparedness.",
    Security:"Monitor security indicators, alerts, and access-risk conditions.",
    "Audit Logs":"Review recent system activity and maintain accountability across role-based actions.",
    "System Monitoring":"Monitor service uptime, availability, and technical health.",
    Billing:"Manage student billing activity, open charges, invoices, and collection readiness.",
    Payments:"Monitor recorded payments, payment activity, and collection performance.",
    Balances:"Track outstanding balances, aging concerns, and collection priorities.",
    Receipts:"Monitor issued receipts and payment documentation.",
    "Financial Reports":"Prepare financial summaries, accounting reports, and management-ready statements.",
    "Student Profiles":"Maintain student profile information and review learner records.",
    "Counseling Records":"Review counseling sessions, case activity, and student support records.",
    Appointments:"Monitor upcoming counseling appointments and service schedules.",
    Interventions:"Track open interventions and student support follow-through.",
    "Behavioral/Incident Records":"Review behavioral concerns, incidents, and required follow-up.",
    "Guidance Reports":"Prepare guidance summaries, case statistics, and support-service reports.",
    "Student Registration":"Monitor new registrations and registration workflow progress.",
    Documents:"Track pending documents and administrative document completion.",
    "Basic Reports":"Access routine administrative reports and operational summaries.",
    "My Classes":"Review assigned classes, teaching coverage, and current instructional responsibilities.",
    "My Students":"Monitor assigned learners and student-related classroom information.",
    Schedule:"Review weekly teaching sessions and timetable responsibilities."
  };
  const charts={Students:[52,58,61,67,72,79,86],Enrollment:[58,62,65,69,73,78,84],Attendance:[89,91,90,94,95,96,96],Programs:[62,66,71,73,79,84,89],Curriculum:[76,82,88,91,95,98,100],Billing:[52,61,58,70,68,76,84],Payments:[55,60,67,72,79,85,91],Balances:[88,83,81,78,75,74,72],Receipts:[60,67,71,76,82,88,93]};
  const icons=["◆","●","▣","▤","◉","✦","▦","◇"];
  const key=location.pathname.split("/").pop(), page=pages[key];
  if(!page||!window.RoleDashboard)return;
  const [role,title,labels]=page;
  const items=labels.map((label,i)=>{
    const [value,valueLabel,score]=vals[label]||[String(i+1),label,80];
    const chart=charts[label]||[Math.max(30,score-24),Math.max(34,score-19),Math.max(38,score-15),Math.max(42,score-11),Math.max(46,score-8),Math.max(50,score-4),score];
    return {label,icon:icons[i%icons.length],heading:`${label} overview`,value,valueLabel,score,progress:score,description:desc[label]||`Review current ${label.toLowerCase()} information in this secure role-based workspace.`,chart,chartTitle:`${label} performance trend`,pill:score>=90?"Excellent":score>=80?"On track":"Needs review",insightValue:value,insightTitle:`${label} status`,insight:`Current ${label.toLowerCase()} information is available for review. Use the workspace actions below for the next step.`,cards:[{label:"Current status",value,note:`${valueLabel}.`},{label:"This week",value:i%2?"Updated":"On track",note:"Latest activity is available."},{label:"Priority",value:score<80?"Review":"Ready",note:score<80?"Monitor this area closely.":"No critical action is required."}],detailTitle:`${label} workspace`,detail:`This workspace provides a focused view of ${label.toLowerCase()} for the ${role.toLowerCase()} role, with current indicators and role-specific actions.`,actions:[`Review ${label.toLowerCase()} details`,"Export a role-based summary","View recent activity"],activity:[[`${label} data refreshed`,`The latest ${label.toLowerCase()} information is available.`,"Just now"],["Performance check completed","Current indicators are ready for leadership review.","Today"],["Next review cycle","Continue monitoring this module during the next review period.","This week"]]};
  });
  window.RoleDashboard.mount({role,title,items});
})();