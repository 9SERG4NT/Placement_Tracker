import { pgTable, serial, text, real, integer, varchar } from "drizzle-orm/pg-core";
import { createInsertSchema } from "drizzle-zod";
import { z } from "zod/v4";

export const institutesTable = pgTable("institutes", {
  id: serial("id").primaryKey(),
  name: text("name").notNull(),
  tier: varchar("tier", { length: 1 }).notNull(),
  city: text("city").notNull(),
  state: text("state").notNull(),
  placementRate3m: real("placement_rate_3m").notNull().default(0),
  placementRate6m: real("placement_rate_6m").notNull().default(0),
  placementRate12m: real("placement_rate_12m").notNull().default(0),
  avgSalary: real("avg_salary").notNull().default(0),
  recruiterCount: integer("recruiter_count").notNull().default(0),
  naacGrade: varchar("naac_grade", { length: 2 }).notNull().default("B"),
  studentCount: integer("student_count").notNull().default(0),
});

export const insertInstituteSchema = createInsertSchema(institutesTable).omit({ id: true });
export type InsertInstitute = z.infer<typeof insertInstituteSchema>;
export type Institute = typeof institutesTable.$inferSelect;
