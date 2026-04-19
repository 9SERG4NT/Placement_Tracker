import { db, institutesTable, studentsTable, alertsTable } from "@workspace/db";

const institutes = [
  { name: "IIT Bombay", tier: "A", city: "Mumbai", state: "Maharashtra", placementRate3m: 0.88, placementRate6m: 0.95, placementRate12m: 0.98, avgSalary: 95000, recruiterCount: 312, naacGrade: "A+", studentCount: 245 },
  { name: "IIM Ahmedabad", tier: "A", city: "Ahmedabad", state: "Gujarat", placementRate3m: 0.92, placementRate6m: 0.97, placementRate12m: 0.99, avgSalary: 140000, recruiterCount: 280, naacGrade: "A+", studentCount: 180 },
  { name: "BITS Pilani", tier: "A", city: "Pilani", state: "Rajasthan", placementRate3m: 0.82, placementRate6m: 0.91, placementRate12m: 0.96, avgSalary: 78000, recruiterCount: 210, naacGrade: "A", studentCount: 320 },
  { name: "Manipal Institute of Technology", tier: "B", city: "Manipal", state: "Karnataka", placementRate3m: 0.68, placementRate6m: 0.80, placementRate12m: 0.90, avgSalary: 52000, recruiterCount: 145, naacGrade: "A", studentCount: 480 },
  { name: "VIT Vellore", tier: "B", city: "Vellore", state: "Tamil Nadu", placementRate3m: 0.65, placementRate6m: 0.78, placementRate12m: 0.88, avgSalary: 48000, recruiterCount: 130, naacGrade: "A", studentCount: 620 },
  { name: "Symbiosis International University", tier: "B", city: "Pune", state: "Maharashtra", placementRate3m: 0.62, placementRate6m: 0.75, placementRate12m: 0.85, avgSalary: 55000, recruiterCount: 118, naacGrade: "A", studentCount: 380 },
  { name: "Amity University", tier: "C", city: "Noida", state: "Uttar Pradesh", placementRate3m: 0.45, placementRate6m: 0.62, placementRate12m: 0.75, avgSalary: 35000, recruiterCount: 78, naacGrade: "B+", studentCount: 850 },
  { name: "Lovely Professional University", tier: "C", city: "Phagwara", state: "Punjab", placementRate3m: 0.42, placementRate6m: 0.58, placementRate12m: 0.72, avgSalary: 30000, recruiterCount: 65, naacGrade: "B+", studentCount: 1200 },
  { name: "Presidency College", tier: "C", city: "Chennai", state: "Tamil Nadu", placementRate3m: 0.38, placementRate6m: 0.54, placementRate12m: 0.68, avgSalary: 28000, recruiterCount: 42, naacGrade: "B", studentCount: 450 },
  { name: "Regional Engineering College", tier: "D", city: "Bhopal", state: "Madhya Pradesh", placementRate3m: 0.25, placementRate6m: 0.40, placementRate12m: 0.58, avgSalary: 22000, recruiterCount: 28, naacGrade: "B", studentCount: 680 },
];

const studentProfiles = [
  { name: "Arjun Sharma", email: "arjun.sharma@email.com", courseType: "Engineering", program: "B.Tech Computer Science", graduationYear: 2025, cgpa: 8.7, instituteIdx: 0, loanAmount: 1200000, internshipMonths: 6, internshipEmployerType: "MNC", certifications: ["AWS Solutions Architect", "Google Cloud Professional"], jobPortalActivityScore: 82, interviewStage: "Final Round", fieldDemandScore: 85, macroClimateIndex: 68 },
  { name: "Priya Nair", email: "priya.nair@email.com", courseType: "MBA", program: "MBA Finance", graduationYear: 2025, cgpa: 8.2, instituteIdx: 1, loanAmount: 2500000, internshipMonths: 4, internshipEmployerType: "MNC", certifications: ["CFA Level 1", "Bloomberg Market Concepts"], jobPortalActivityScore: 75, interviewStage: "Second Round", fieldDemandScore: 78, macroClimateIndex: 65 },
  { name: "Rohit Menon", email: "rohit.menon@email.com", courseType: "Engineering", program: "M.Tech Data Science", graduationYear: 2025, cgpa: 7.9, instituteIdx: 2, loanAmount: 900000, internshipMonths: 3, internshipEmployerType: "Startup", certifications: ["TensorFlow Developer"], jobPortalActivityScore: 68, interviewStage: "Technical Round", fieldDemandScore: 90, macroClimateIndex: 70 },
  { name: "Ananya Singh", email: "ananya.singh@email.com", courseType: "Data Science", program: "M.Sc Data Science", graduationYear: 2025, cgpa: 8.4, instituteIdx: 3, loanAmount: 800000, internshipMonths: 2, internshipEmployerType: "MNC", certifications: ["Python Data Science", "Tableau Desktop Specialist"], jobPortalActivityScore: 71, interviewStage: "HR Round", fieldDemandScore: 88, macroClimateIndex: 65 },
  { name: "Vikram Patel", email: "vikram.patel@email.com", courseType: "MBA", program: "MBA Marketing", graduationYear: 2025, cgpa: 7.1, instituteIdx: 4, loanAmount: 1100000, internshipMonths: 1, internshipEmployerType: "SME", certifications: [], jobPortalActivityScore: 42, interviewStage: "Applied", fieldDemandScore: 55, macroClimateIndex: 60 },
  { name: "Kavitha Reddy", email: "kavitha.reddy@email.com", courseType: "Finance", program: "M.Sc Finance", graduationYear: 2025, cgpa: 7.6, instituteIdx: 5, loanAmount: 950000, internshipMonths: 3, internshipEmployerType: "MNC", certifications: ["Financial Risk Manager"], jobPortalActivityScore: 64, interviewStage: "Second Round", fieldDemandScore: 72, macroClimateIndex: 62 },
  { name: "Siddharth Kumar", email: "siddharth.kumar@email.com", courseType: "Engineering", program: "B.Tech Electronics", graduationYear: 2025, cgpa: 6.5, instituteIdx: 6, loanAmount: 750000, internshipMonths: 0, internshipEmployerType: "None", certifications: [], jobPortalActivityScore: 28, interviewStage: "Not Started", fieldDemandScore: 48, macroClimateIndex: 52 },
  { name: "Meera Iyer", email: "meera.iyer@email.com", courseType: "Healthcare", program: "MBA Hospital Management", graduationYear: 2025, cgpa: 7.3, instituteIdx: 6, loanAmount: 1300000, internshipMonths: 2, internshipEmployerType: "SME", certifications: ["Healthcare Management"], jobPortalActivityScore: 38, interviewStage: "Applied", fieldDemandScore: 50, macroClimateIndex: 55 },
  { name: "Aakash Gupta", email: "aakash.gupta@email.com", courseType: "Engineering", program: "B.Tech Mechanical", graduationYear: 2025, cgpa: 6.2, instituteIdx: 7, loanAmount: 680000, internshipMonths: 0, internshipEmployerType: "None", certifications: [], jobPortalActivityScore: 20, interviewStage: "Not Started", fieldDemandScore: 38, macroClimateIndex: 48 },
  { name: "Divya Krishnan", email: "divya.krishnan@email.com", courseType: "Arts", program: "MA English Literature", graduationYear: 2025, cgpa: 7.8, instituteIdx: 8, loanAmount: 450000, internshipMonths: 1, internshipEmployerType: "SME", certifications: [], jobPortalActivityScore: 32, interviewStage: "Not Started", fieldDemandScore: 28, macroClimateIndex: 52 },
  { name: "Rahul Verma", email: "rahul.verma@email.com", courseType: "Engineering", program: "B.Tech Civil", graduationYear: 2025, cgpa: 5.9, instituteIdx: 9, loanAmount: 600000, internshipMonths: 0, internshipEmployerType: "None", certifications: [], jobPortalActivityScore: 15, interviewStage: "Not Started", fieldDemandScore: 32, macroClimateIndex: 45 },
  { name: "Sneha Joshi", email: "sneha.joshi@email.com", courseType: "Computer Science", program: "MCA", graduationYear: 2025, cgpa: 8.1, instituteIdx: 3, loanAmount: 720000, internshipMonths: 4, internshipEmployerType: "Startup", certifications: ["React Developer", "Node.js Certified"], jobPortalActivityScore: 78, interviewStage: "Final Round", fieldDemandScore: 84, macroClimateIndex: 66 },
  { name: "Karthik Subramanian", email: "karthik.s@email.com", courseType: "Data Science", program: "M.Sc Statistics", graduationYear: 2025, cgpa: 8.6, instituteIdx: 0, loanAmount: 1050000, internshipMonths: 5, internshipEmployerType: "MNC", certifications: ["SAS Certified", "Python Data Science", "R Programming"], jobPortalActivityScore: 88, interviewStage: "Offer Stage", fieldDemandScore: 90, macroClimateIndex: 70 },
  { name: "Pooja Bhatt", email: "pooja.bhatt@email.com", courseType: "Nursing", program: "M.Sc Nursing", graduationYear: 2025, cgpa: 7.2, instituteIdx: 8, loanAmount: 520000, internshipMonths: 6, internshipEmployerType: "SME", certifications: ["ICU Nursing Certificate"], jobPortalActivityScore: 45, interviewStage: "Applied", fieldDemandScore: 60, macroClimateIndex: 58 },
  { name: "Nikhil Agarwal", email: "nikhil.agarwal@email.com", courseType: "Finance", program: "MBA Finance", graduationYear: 2025, cgpa: 6.8, instituteIdx: 7, loanAmount: 1400000, internshipMonths: 1, internshipEmployerType: "SME", certifications: [], jobPortalActivityScore: 35, interviewStage: "Applied", fieldDemandScore: 58, macroClimateIndex: 56 },
];

async function seed() {
  console.log("Seeding institutes...");
  const insertedInstitutes = await db.insert(institutesTable).values(institutes).returning();
  console.log(`Inserted ${insertedInstitutes.length} institutes`);

  console.log("Seeding students...");
  const { computeRiskScore } = await import("../../artifacts/api-server/src/lib/scoring.js");

  const studentsToInsert = studentProfiles.map((profile) => {
    const inst = insertedInstitutes[profile.instituteIdx];
    const scoreInputs = {
      cgpa: profile.cgpa,
      instituteTier: inst.tier,
      internshipMonths: profile.internshipMonths,
      internshipEmployerType: profile.internshipEmployerType,
      hasInternship: profile.internshipMonths > 0,
      certifications: profile.certifications,
      jobPortalActivityScore: profile.jobPortalActivityScore,
      fieldDemandScore: profile.fieldDemandScore,
      macroClimateIndex: profile.macroClimateIndex,
      placementCellEffectiveness: inst.placementRate6m * 100,
      instituteAvg3mPlacementRate: inst.placementRate3m,
      courseType: profile.courseType,
    };
    const score = computeRiskScore(scoreInputs);
    return {
      name: profile.name,
      email: profile.email,
      courseType: profile.courseType,
      program: profile.program,
      graduationYear: profile.graduationYear,
      cgpa: profile.cgpa,
      instituteId: inst.id,
      loanAmount: profile.loanAmount,
      internshipMonths: profile.internshipMonths,
      internshipEmployerType: profile.internshipEmployerType,
      hasInternship: profile.internshipMonths > 0,
      certifications: JSON.stringify(profile.certifications),
      jobPortalActivityScore: profile.jobPortalActivityScore,
      interviewStage: profile.interviewStage,
      fieldDemandScore: profile.fieldDemandScore,
      macroClimateIndex: profile.macroClimateIndex,
      placementCellEffectiveness: inst.placementRate6m * 100,
      ...score,
    };
  });

  const insertedStudents = await db.insert(studentsTable).values(studentsToInsert).returning();
  console.log(`Inserted ${insertedStudents.length} students`);

  const highRiskStudents = insertedStudents.filter((s) => s.riskBand === "high");
  const mediumRiskStudents = insertedStudents.filter((s) => s.riskBand === "medium");

  const alertsToInsert = [
    ...highRiskStudents.map((s) => ({
      studentId: s.id,
      alertType: "high_risk_threshold",
      severity: "critical" as const,
      message: `${s.name}'s placement probability has dropped to ${s.placementScore6m}% at 6 months — immediate intervention recommended before EMI start date.`,
      riskBand: s.riskBand,
      daysToEmiStart: Math.floor(Math.random() * 60) + 30,
      status: "active",
    })),
    ...mediumRiskStudents.slice(0, 2).map((s) => ({
      studentId: s.id,
      alertType: "score_drop",
      severity: "high" as const,
      message: `${s.name}'s risk score has deteriorated — field demand index declined and no recent job portal activity detected.`,
      riskBand: s.riskBand,
      daysToEmiStart: Math.floor(Math.random() * 90) + 60,
      status: "active",
    })),
    ...highRiskStudents.slice(0, 1).map((s) => ({
      studentId: s.id,
      alertType: "emi_at_risk",
      severity: "critical" as const,
      message: `EMI repayment at risk: ${s.name} has under 45 days to EMI start with ${s.placementScore6m}% 6-month placement probability. Consider EMI restructuring.`,
      riskBand: s.riskBand,
      daysToEmiStart: Math.floor(Math.random() * 30) + 15,
      status: "active",
    })),
  ];

  if (alertsToInsert.length > 0) {
    const insertedAlerts = await db.insert(alertsTable).values(alertsToInsert).returning();
    console.log(`Inserted ${insertedAlerts.length} alerts`);
  }

  console.log("Seeding complete!");
}

seed().catch(console.error);
