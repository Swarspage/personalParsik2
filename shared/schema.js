import { pgTable, text, serial, integer, boolean, timestamp, numeric, jsonb } from "drizzle-orm/pg-core";
import { createInsertSchema } from "drizzle-zod";
import { z } from "zod";
const users = pgTable("users", {
  id: serial("id").primaryKey(),
  username: text("username").notNull().unique(),
  password: text("password").notNull(),
  fullName: text("full_name").notNull(),
  email: text("email").notNull(),
  phoneNumber: text("phone_number").notNull(),
  createdAt: timestamp("created_at").defaultNow()
});
const admins = pgTable("admins", {
  id: serial("id").primaryKey(),
  username: text("username").notNull().unique(),
  password: text("password").notNull(),
  role: text("role").default("admin").notNull(),
  createdAt: timestamp("created_at").defaultNow()
});
const menuItems = pgTable("menu_items", {
  id: serial("id").primaryKey(),
  name: text("name").notNull(),
  description: text("description").notNull(),
  price: numeric("price").notNull(),
  // using numeric for currency
  category: text("category").notNull(),
  // Starters, Mains, etc.
  imageUrl: text("image_url").notNull(),
  isVeg: boolean("is_veg").default(true).notNull(),
  isAvailable: boolean("is_available").default(true).notNull(),
  branch: text("branch").default("all").notNull()
  // 'all', 'airoli', 'thane'
});
const orders = pgTable("orders", {
  id: serial("id").primaryKey(),
  userId: integer("user_id"),
  customerName: text("customer_name").notNull(),
  phoneNumber: text("phone_number").notNull(),
  tableNumber: integer("table_number"),
  // nullable for takeaway/delivery if ever added, but required for dine-in
  branch: text("branch").notNull(),
  // 'airoli' or 'thane'
  items: jsonb("items").notNull(),
  subtotal: numeric("subtotal").notNull(),
  tax: numeric("tax").notNull(),
  totalAmount: numeric("total_amount").notNull(),
  paymentMethod: text("payment_method").notNull(),
  // 'card', 'upi', 'cash'
  paymentStatus: text("payment_status").default("pending").notNull(),
  // 'paid', 'unpaid'
  status: text("status").default("pending").notNull(),
  // 'active', 'checkout_requested', 'pending', 'preparing', 'served', 'completed'
  specialRequests: text("special_requests"),
  createdAt: timestamp("created_at").defaultNow()
});
const reservations = pgTable("reservations", {
  id: serial("id").primaryKey(),
  customerName: text("customer_name").notNull(),
  phoneNumber: text("phone_number").notNull(),
  email: text("email"),
  branch: text("branch").notNull(),
  date: text("date").notNull(),
  // YYYY-MM-DD
  time: text("time").notNull(),
  // HH:MM
  guestCount: integer("guest_count").notNull(),
  specialRequests: text("special_requests"),
  status: text("status").default("upcoming").notNull(),
  // 'upcoming', 'completed', 'cancelled'
  createdAt: timestamp("created_at").defaultNow()
});
const contacts = pgTable("contacts", {
  id: serial("id").primaryKey(),
  name: text("name").notNull(),
  email: text("email").notNull(),
  subject: text("subject").notNull(),
  message: text("message").notNull(),
  createdAt: timestamp("created_at").defaultNow()
});
const offers = pgTable("offers", {
  id: serial("id").primaryKey(),
  menuItemId: integer("menu_item_id").notNull(),       // FK to menu_items
  discountType: text("discount_type").notNull(),       // 'percentage' or 'flat'
  discountValue: numeric("discount_value").notNull(),  // e.g. 20 (for 20%) or 50 (for ₹50 off)
  title: text("title").notNull(),                      // e.g. "Weekend Special"
  description: text("description"),                    // optional promo text
  startDate: timestamp("start_date").notNull(),        // when the offer begins
  endDate: timestamp("end_date").notNull(),            // when the offer expires
  isActive: boolean("is_active").default(true).notNull(),
  maxUsageCount: integer("max_usage_count"),           // optional cap on total redemptions
  currentUsageCount: integer("current_usage_count").default(0),
  minOrderValue: numeric("min_order_value"),           // optional minimum order value
  branch: text("branch").default("all").notNull(),     // 'all', 'airoli', 'thane'
  createdAt: timestamp("created_at").defaultNow(),
});
const insertUserSchema = createInsertSchema(users).omit({ id: true, createdAt: true });
const insertAdminSchema = createInsertSchema(admins).omit({ id: true, createdAt: true });
const insertMenuItemSchema = createInsertSchema(menuItems).omit({ id: true });
const insertOrderSchema = createInsertSchema(orders).omit({ id: true, createdAt: true, status: true, paymentStatus: true });
const insertReservationSchema = createInsertSchema(reservations).omit({ id: true, createdAt: true, status: true });
const insertContactSchema = createInsertSchema(contacts).omit({ id: true, createdAt: true });
const insertOfferSchema = createInsertSchema(offers, {
  startDate: z.coerce.date(),
  endDate: z.coerce.date(),
  discountValue: z.union([z.string(), z.number()]).transform(v => v.toString()),
  minOrderValue: z.union([z.string(), z.number(), z.null()]).optional().nullable().transform(v => v ? v.toString() : null),
  maxUsageCount: z.union([z.number(), z.string(), z.null()]).optional().nullable().transform(v => v ? Number(v) : null),
  menuItemId: z.coerce.number().int()
}).omit({ id: true, createdAt: true, currentUsageCount: true });
export {
  contacts,
  insertContactSchema,
  insertMenuItemSchema,
  insertOrderSchema,
  insertReservationSchema,
  insertUserSchema,
  insertAdminSchema,
  insertOfferSchema,
  menuItems,
  orders,
  reservations,
  users,
  admins,
  offers
};
