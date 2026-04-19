import { pgTable, serial, integer, text, varchar, timestamp } from "drizzle-orm/pg-core";
import { createInsertSchema } from "drizzle-zod";
import { z } from "zod/v4";

export const alertsTable = pgTable("alerts", {
  id: serial("id").primaryKey(),
  studentId: integer("student_id").notNull(),
  alertType: varchar("alert_type", { length: 30 }).notNull(),
  severity: varchar("severity", { length: 10 }).notNull(),
  message: text("message").notNull(),
  riskBand: varchar("risk_band", { length: 10 }).notNull(),
  daysToEmiStart: integer("days_to_emi_start").notNull().default(90),
  status: varchar("status", { length: 15 }).notNull().default("active"),
  createdAt: timestamp("created_at").notNull().defaultNow(),
});

export const insertAlertSchema = createInsertSchema(alertsTable).omit({ id: true, createdAt: true });
export type InsertAlert = z.infer<typeof insertAlertSchema>;
export type Alert = typeof alertsTable.$inferSelect;
