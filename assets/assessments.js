/* HCM Academy pre-assessment and final assessment questions.
   Single source for the assessment pages (assessment/pre, assessment/final) and the review document
   (node tools/build_assessment_doc.cjs). topic = the card id on the landing page.
   a = index of the correct option. draft = topic has no course yet; confirm with the SME. */
window.HCM_ASSESS = {
  pass: 0.9,
  topics: {
    start: 'Start Here: HCM Foundations', recruiting: 'Recruitment & Hiring', payroll: 'Payroll & Timecards',
    positions: 'Onboarding, Offboarding, Transfers & Managing Positions', leave: 'Leave Management',
    costing: 'Costing Management', students: 'Student & Faculty Hiring and Assignment Changes', records: 'Document Records & Reporting'
  },
  pre: [
    {"topic":"start","q":"What is the HCM role?","o":["The Oracle system that runs payroll","People in the business who own the people transactions for their area","The central HR team that approves all hires"],"a":1},
    {"topic":"start","q":"Where do you start most Oracle transactions for an employee?","o":["Our Workforce > Quick Actions","The UKG main menu","The payroll calendar"],"a":0},
    {"topic":"recruiting","q":"What must you have before a position can be posted?","o":["A signed offer letter","The compensation memo from Compensation","A costing string from finance"],"a":1},
    {"topic":"recruiting","q":"Who normally adds a sign-on bonus?","o":["The recruiter, on the offer","Payroll, after the first paycheck","The employee, in Oracle"],"a":0},
    {"topic":"payroll","q":"Who runs the payroll cycle?","o":["The HCM","Payroll","The employee's manager"],"a":1},
    {"topic":"payroll","q":"You enter hours on a time card in an open pay period. What do you click?","o":["Submit","Save","Approve"],"a":1},
    {"topic":"positions","q":"After you submit a termination, do you need to send payroll a separate request to stop pay?","o":["Yes, email payroll","No, the termination stops pay and payroll is notified","Yes, file an off-cycle request"],"a":1},
    {"topic":"positions","q":"An employee resigns. Which action do you choose?","o":["Voluntary separation","Involuntary termination","Change salary"],"a":0},
    {"topic":"leave","q":"Where is exempt (monthly) employee time off managed?","o":["Oracle","UKG","A paper form"],"a":0,"draft":true},
    {"topic":"leave","q":"Does pay frequency (monthly vs. biweekly) change how you process a leave?","o":["Yes","No, it's always the same","Only for faculty"],"a":0,"draft":true},
    {"topic":"costing","q":"An assignment has no costing. What happens?","o":["Payroll fails","Salary charges to the work unit's default account","The employee isn't paid"],"a":1},
    {"topic":"costing","q":"Who gives you the account (COA or POET) string to enter?","o":["Payroll","Your finance partner","The employee"],"a":1},
    {"topic":"students","q":"What does FERPA protect?","o":["Student education records","Employee salary data","Faculty research grants"],"a":0,"draft":true},
    {"topic":"students","q":"Can a staff supplement be used for a student worker?","o":["Yes","No, staff supplements are not for students, faculty, post-docs, or temps","Only over the summer"],"a":1,"draft":true},
    {"topic":"records","q":"Where does a signed retention letter belong?","o":["In an email to payroll","On the employee's file in Oracle, as a document record","In your department's shared drive"],"a":1},
    {"topic":"records","q":"What is a document record?","o":["A report of all employees","A file plus details about it: type, name, and the dates it covers","A payroll transaction"],"a":1}
  ],
  final: [
    {"topic":"start","q":"You submitted a salary change. How do you see where it is in approval?","o":["Email payroll","The notifications bell at the top of Oracle","Wait for the next paycheck"],"a":1,"why":"Every transaction's status shows under the notifications bell."},
    {"topic":"start","q":"Where do you confirm this month's payroll cutoff date?","o":["Always the 18th, no need to check","The payroll calendar","Ask the employee"],"a":1,"why":"Cutoff is usually the 15th to 18th, and earlier in December. The calendar is the source of truth."},
    {"topic":"recruiting","q":"A hiring manager wants a new role posted on Monday, and you don't have a compensation memo yet. What do you do?","o":["Post it and get the memo later","Request the memo from vu.compensation@vanderbilt.edu. The position can't post without it.","Use the memo from a similar job"],"a":1},
    {"topic":"recruiting","q":"A visiting researcher needs Oracle access but won't be paid. How do you set them up?","o":["As a staff employee","As a non-worker","As a student worker"],"a":1,"draft":true},
    {"topic":"payroll","q":"An employee should take home exactly $500 from a one-time stipend. Which field do you use?","o":["Amount","Net","Either one"],"a":1,"why":"Net is take-home and Oracle grosses it up. Amount is gross."},
    {"topic":"payroll","q":"On Nov 20 you enter a one-time payment the employee wanted on the November check. What start date do you use?","o":["Nov 1","Nov 20","Dec 1"],"a":2,"why":"November's cutoff has passed, so date it for the next payroll month."},
    {"topic":"payroll","q":"A salary change failed in Oracle and the employee was underpaid. What does payroll need from you to pay them before the next payroll?","o":["The off-cycle form only","The Oracle transaction resubmitted plus the off-cycle request form","An email to payroll"],"a":1},
    {"topic":"payroll","q":"An employee has punches on Tuesday and needs 4 hours of sick time that day. How do you enter it?","o":["Type the pay code over the punch","Add a new row on Tuesday, Browse to the sick pay code, enter 4 hours, and Save","You can't enter PTO on a day with punches"],"a":1},
    {"topic":"positions","q":"An employee emails a resignation on Mar 3 with a last day of Mar 17. What dates do you enter?","o":["Notification date Mar 3, termination date Mar 17","Both Mar 3","Both Mar 17"],"a":0},
    {"topic":"positions","q":"An employee is notified of a reduction in force on Oct 20 with non-working notice. What dates do you enter?","o":["Termination Oct 20, last working day Dec 20","Termination Dec 20, last working day Oct 20","Both Oct 20"],"a":1},
    {"topic":"positions","q":"You must terminate someone for misconduct today. What do you do first?","o":["Open Terminate Employment","Revoke their access","Agree on access timing and the rehire field with your PCB consultant and leadership"],"a":2},
    {"topic":"leave","q":"An FMLA approval letter is approved for Jan 5 to Mar 31. How do you file it?","o":["Leave and Accommodation Documentation, with From Date Jan 5 and To Date Mar 31","Compensation Letters, with no dates","Performance Review, with From Date Jan 5"],"a":0,"draft":true},
    {"topic":"leave","q":"An employee is approved for FMLA to attend weekly treatment appointments. Which type is this?","o":["Continuous","Intermittent","Personal leave"],"a":1,"draft":true},
    {"topic":"costing","q":"Another area pays 20% of an employee's salary. What do you enter?","o":["One line for 20% and let the rest default","Two lines, 80% and 20%, totaling 100%","Nothing, finance handles it"],"a":1,"why":"Vanderbilt won't let a remainder fall to a default."},
    {"topic":"costing","q":"Grant funding ends May 31 and the department default should take over. Which action and search date do you use?","o":["End Date, searching on May 31","Update, searching on May 1","Delete Record, searching on June 1"],"a":0},
    {"topic":"costing","q":"A staff member's bonus should charge a different account than their salary. What do you do?","o":["Change the costing on the whole assignment","Cost the bonus element, with Account 5120","Leave Account blank on the element"],"a":1},
    {"topic":"students","q":"A faculty member is acting in an interim administrative role. Do you use a staff supplement?","o":["Yes, Administrative Supplement","No, faculty have their own supplements","Yes, Temporary Supplement"],"a":1,"draft":true},
    {"topic":"students","q":"What Account goes on element costing for a faculty member?","o":["5110","5120","5130"],"a":0,"draft":true},
    {"topic":"records","q":"A written discipline is issued Jan 10, 2026. What are the dates?","o":["Issued On Jan 10, To Date Jan 10, 2026","Issued On Jan 10, From Date Jan 10, To Date Jan 10, 2027","Issued On the upload date, with no To Date"],"a":1},
    {"topic":"records","q":"Before the HCM Transaction Cutoff, how do you check costing for your whole unit at once?","o":["Open every employee one by one","Run the HCM Assignment Cost Allocation Plan report from the Departmental Playbook","Ask payroll for a list"],"a":1}
  ]
};
