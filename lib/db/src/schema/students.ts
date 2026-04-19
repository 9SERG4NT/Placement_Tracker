import { pgTable, serial, text, real, integer, varchar, timestamp, boolean } from "drizzle-orm/pg-core";
import { createInsertSchema } from "drizzle-zod";
import { z } from "zod/v4";

export const studentsTable = pgTable("students", {
  id: serial("id").primaryKey(),
  name: text("name").notNull(),
  email: text("email").notNull().unique(),
  courseType: text("course_type").notNull(),
  program: text("program").notNull(),
  graduationYear: integer("graduation_year").notNull(),
  cgpa: real("cgpa").notNull(),
  instituteId: integer("institute_id").notNull(),
  loanAmount: real("loan_amount").notNull(),
  internshipMonths: integer("internship_months").notNull().default(0),
  internshipEmployerType: varchar("internship_employer_type", { length: 10 }).notNull().default("None"),
  hasInternship: boolean("has_internship").notNull().default(false),
  certifications: text("certifications").notNull().default("[]"),
  jobPortalActivityScore: real("job_portal_activity_score").notNull().default(0),
  interviewStage: text("interview_stage").notNull().default("Not Started"),
  riskBand: varchar("risk_band", { length: 10 }).notNull().default("medium"),
  placementScore3m: real("placement_score_3m").notNull().default(0),
  placementScore6m: real("placement_score_6m").notNull().default(0),
  placementScore12m: real("placement_score_12m").notNull().default(0),
  expectedSalaryLow: real("expected_salary_low").notNull().default(0),
  expectedSalaryMedian: real("expected_salary_median").notNull().default(0),
  expectedSalaryHigh: real("expected_salary_high").notNull().default(0),
  fieldDemandScore: real("field_demand_score").notNull().default(50),
  macroClimateIndex: real("macro_climate_index").notNull().default(50),
  placementCellEffectiveness: real("placement_cell_effectiveness").notNull().default(50),
  lastScoredAt: timestamp("last_scored_at").notNull().defaultNow(),
  createdAt: timestamp("created_at").notNull().defaultNow(),
});

export const insertStudentSchema = createInsertSchema(studentsTable).omit({ id: true, lastScoredAt: true, createdAt: true });
export type InsertStudent = z.infer<typeof insertStudentSchema>;
export type Student = typeof studentsTable.$inferSelect;
