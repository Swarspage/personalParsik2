import { storage } from "./storage.js";
import { api } from "../shared/routes.js";
import { z } from "zod";
import session from "express-session";
import passport from "passport";
import { Strategy as LocalStrategy } from "passport-local";
import { scrypt } from "crypto";
import { promisify } from "util";
import MemoryStoreFactory from "memorystore";
import connectPgSimple from "connect-pg-simple";
import { pool } from "./db.js";

const scryptAsync = promisify(scrypt);
const MemoryStore = MemoryStoreFactory(session);
const PostgresStore = connectPgSimple(session);

const SessionStore = (process.env.DATABASE_URL && pool)
  ? new PostgresStore({
    pool,
    createTableIfMissing: true
  })
  : new MemoryStore({
    checkPeriod: 86400000 // 24h
  });

async function registerRoutes(httpServer, app) {
  const sessionSecret = process.env.SESSION_SECRET || "parsik_cafe_secret_key";
  app.use(session({
    secret: sessionSecret,
    resave: false,
    saveUninitialized: false,
    store: SessionStore,
    proxy: true,
    cookie: {
      secure: false, // Bypass proxy-trust issues, Render handles SSL at the edge
      sameSite: "lax",
      maxAge: 24 * 60 * 60 * 1000 // 24 hours
    }
  }));
  app.use(passport.initialize());
  app.use(passport.session());
  passport.use(new LocalStrategy(async (username, password, done) => {
    try {
      // Check admins first
      let entity = await storage.getAdminByUsername(username);
      let type = "admin";

      if (!entity) {
        // If not admin, check customers
        entity = await storage.getUserByUsername(username);
        type = "user";
      }

      if (!entity) {
        return done(null, false, { message: "Incorrect username." });
      }
      if (entity.password !== password) {
        return done(null, false, { message: "Incorrect password." });
      }
      return done(null, { ...entity, _type: type });
    } catch (err) {
      return done(err);
    }
  }));
  passport.serializeUser((user, done) => {
    done(null, { id: user.id, type: user._type });
  });
  passport.deserializeUser(async (obj, done) => {
    try {
      let entity;
      if (obj.type === "admin") {
        entity = await storage.getAdmin(obj.id);
      } else {
        entity = await storage.getUser(obj.id);
      }
      if (entity) entity._type = obj.type;
      done(null, entity);
    } catch (err) {
      done(err);
    }
  });
  const isAuthenticated = (req, res, next) => {
    if (req.isAuthenticated()) {
      return next();
    }
    res.status(401).json({ message: "Unauthorized" });
  };
  app.post(api.auth.register.path, async (req, res, next) => {
    try {
      const { username, password, fullName, email, phoneNumber } = req.body;
      const existingUser = await storage.getUserByUsername(username);
      const existingAdmin = await storage.getAdminByUsername(username);
      if (existingUser || existingAdmin) {
        return res.status(400).json({ message: "Username already exists" });
      }
      const user = await storage.createUser({
        username,
        password,
        fullName,
        email,
        phoneNumber
      });
      req.login({ ...user, _type: "user" }, (err) => {
        if (err) return next(err);
        return res.status(201).json({ message: "Registration successful", user });
      });
    } catch (err) {
      next(err);
    }
  });
  app.post(api.auth.login.path, (req, res, next) => {
    passport.authenticate("local", (err, user, info) => {
      if (err) return next(err);
      if (!user) return res.status(401).json({ message: info.message || "Login failed" });
      req.logIn(user, (err2) => {
        if (err2) return next(err2);
        return res.json({ message: "Login successful", user });
      });
    })(req, res, next);
  });
  app.post(api.auth.logout.path, (req, res, next) => {
    req.logout((err) => {
      if (err) return next(err);
      res.json({ message: "Logged out" });
    });
  });
  app.get(api.auth.me.path, (req, res) => {
    if (req.isAuthenticated()) {
      res.json(req.user);
    } else {
      res.status(401).json({ message: "Not authenticated" });
    }
  });
  app.get(api.menu.list.path, async (req, res) => {
    const category = req.query.category;
    const branch = req.query.branch;
    const items = await storage.getMenuItems(category, branch);
    res.json(items);
  });
  app.get(api.menu.get.path, async (req, res) => {
    const item = await storage.getMenuItem(Number(req.params.id));
    if (!item) return res.status(404).json({ message: "Item not found" });
    res.json(item);
  });
  app.post(api.menu.create.path, isAuthenticated, async (req, res) => {
    try {
      const input = api.menu.create.input.parse(req.body);
      const item = await storage.createMenuItem(input);
      res.status(201).json(item);
    } catch (err) {
      if (err instanceof z.ZodError) {
        return res.status(400).json({ message: err.errors[0].message });
      }
      throw err;
    }
  });
  app.put(api.menu.update.path, isAuthenticated, async (req, res) => {
    try {
      const input = api.menu.update.input.parse(req.body);
      const item = await storage.updateMenuItem(Number(req.params.id), input);
      if (!item) return res.status(404).json({ message: "Item not found" });
      res.json(item);
    } catch (err) {
      if (err instanceof z.ZodError) {
        return res.status(400).json({ message: err.errors[0].message });
      }
      throw err;
    }
  });
  app.delete(api.menu.delete.path, isAuthenticated, async (req, res) => {
    await storage.deleteMenuItem(Number(req.params.id));
    res.status(204).send();
  });
  app.get(api.orders.list.path, isAuthenticated, async (req, res) => {
    const orders = await storage.getOrders();
    res.json(orders);
  });
  app.get(api.orders.myOrders.path, isAuthenticated, async (req, res) => {
    if (req.user._type !== "user") {
      return res.status(403).json({ message: "Only customers can view their orders" });
    }
    const orders = await storage.getOrdersByUserId(req.user.id);
    res.json(orders);
  });

  // New Route: Get current open orders for user/table
  app.get("/api/orders/open", isAuthenticated, async (req, res) => {
    if (req.user._type !== "user") {
      return res.status(403).json({ message: "Only customers can have active orders" });
    }
    const openOrders = await storage.getOpenOrders(req.user.id);
    res.json(openOrders || []);
  });

  // New Route: Create a new draft order ticket
  app.post("/api/orders/draft", isAuthenticated, async (req, res) => {
    try {
      if (req.user._type !== "user") {
        return res.status(403).json({ message: "Only customers can place new orders" });
      }

      const { items, orderDetails } = req.body;
      const newOrder = await storage.createDraftOrder(req.user.id, items, {
         customerName: req.user.fullName || req.user.username,
         phoneNumber: req.user.phoneNumber,
         ...orderDetails
      });
      res.json(newOrder);
    } catch (err) {
      console.error('Error creating draft order:', err);
      res.status(500).json({ message: "Failed to create order ticket" });
    }
  });

  // New Route: Cancel a specific draft order ticket
  app.delete("/api/orders/:id", isAuthenticated, async (req, res) => {
    try {
      if (req.user._type !== "user") {
        return res.status(403).json({ message: "Only customers can cancel orders" });
      }

      await storage.cancelDraftOrder(Number(req.params.id), req.user.id);
      res.json({ message: "Order cancelled successfully" });
    } catch (err) {
      console.error('Error cancelling order:', err);
      res.status(400).json({ message: err.message || "Failed to cancel order" });
    }
  });

  // New Route: Checkout the entire table
  app.post("/api/orders/checkout-table", isAuthenticated, async (req, res) => {
    try {
      if (req.user._type !== "user") {
        return res.status(403).json({ message: "Only customers can checkout tables" });
      }
      
      const { paymentMethod } = req.body;
      const order = await storage.checkoutTable(req.user.id, paymentMethod);
      res.json(order);
    } catch (err) {
      console.error('Error checking out table:', err);
      res.status(400).json({ message: err.message || "Failed to checkout table" });
    }
  });

  app.post(api.orders.create.path, async (req, res) => {
    try {
      const input = api.orders.create.input.parse(req.body);
      if (req.isAuthenticated() && req.user._type === "user") {
        input.userId = req.user.id;
      }
      const order = await storage.createOrder(input);
      res.status(201).json(order);
    } catch (err) {
      if (err instanceof z.ZodError) {
        return res.status(400).json({ message: err.errors[0].message });
      }
      throw err;
    }
  });
  app.patch(api.orders.updateStatus.path, isAuthenticated, async (req, res) => {
    const { status, paymentStatus } = req.body;
    const order = await storage.updateOrderStatus(Number(req.params.id), status, paymentStatus);
    res.json(order);
  });
  app.get(api.reservations.list.path, isAuthenticated, async (req, res) => {
    const reservations = await storage.getReservations();
    res.json(reservations);
  });
  app.post(api.reservations.create.path, async (req, res) => {
    try {
      const input = api.reservations.create.input.parse(req.body);
      const reservation = await storage.createReservation(input);
      res.status(201).json(reservation);
    } catch (err) {
      if (err instanceof z.ZodError) {
        return res.status(400).json({ message: err.errors[0].message });
      }
      throw err;
    }
  });
  app.patch(api.reservations.updateStatus.path, isAuthenticated, async (req, res) => {
    const { status } = req.body;
    const reservation = await storage.updateReservationStatus(Number(req.params.id), status);
    res.json(reservation);
  });
  app.get(api.contact.list.path, isAuthenticated, async (req, res) => {
    const contacts = await storage.getContacts();
    res.json(contacts);
  });
  app.post(api.contact.create.path, async (req, res) => {
    try {
      const input = api.contact.create.input.parse(req.body);
      const contact = await storage.createContact(input);
      res.status(201).json(contact);
    } catch (err) {
      if (err instanceof z.ZodError) {
        return res.status(400).json({ message: err.errors[0].message });
      }
      throw err;
    }
  });
  app.get(api.offers.list.path, async (req, res) => {
    const activeOnly = req.query.active === "true";
    const offers = await storage.getOffers(activeOnly);
    const now = new Date();
    const formattedOffers = offers.map(o => {
      if (o.isActive && new Date(o.endDate) < now) {
        o.isActive = false;
      }
      return o;
    });
    res.json(formattedOffers);
  });
  app.get(api.offers.get.path, async (req, res) => {
    const offer = await storage.getOffer(Number(req.params.id));
    if (!offer) return res.status(404).json({ message: "Offer not found" });
    res.json(offer);
  });
  app.post(api.offers.create.path, isAuthenticated, async (req, res) => {
    try {
      console.log('Received payload:', req.body);
      const input = api.offers.create.input.parse(req.body);
      const offer = await storage.createOffer(input);
      res.status(201).json(offer);
    } catch (err) {
      if (err instanceof z.ZodError) {
        console.error('Validation Error:', JSON.stringify(err.errors, null, 2));
        return res.status(400).json({ message: err.errors[0].message });
      }
      console.error('Unexpected Offer Create Error:', err);
      return res.status(500).json({ message: "Internal server error" });
    }
  });
  app.put(api.offers.update.path, isAuthenticated, async (req, res) => {
    try {
      const input = api.offers.update.input.parse(req.body);
      const offer = await storage.updateOffer(Number(req.params.id), input);
      if (!offer) return res.status(404).json({ message: "Offer not found" });
      res.json(offer);
    } catch (err) {
      if (err instanceof z.ZodError) {
        return res.status(400).json({ message: err.errors[0].message });
      }
      throw err;
    }
  });
  app.delete(api.offers.delete.path, isAuthenticated, async (req, res) => {
    await storage.deleteOffer(Number(req.params.id));
    res.status(204).send();
  });
  app.patch(api.offers.toggle.path, isAuthenticated, async (req, res) => {
    try {
      const offer = await storage.toggleOfferActive(Number(req.params.id));
      res.json(offer);
    } catch (err) {
      return res.status(404).json({ message: err.message });
    }
  });
  app.get(api.stats.get.path, isAuthenticated, async (req, res) => {
    const orders = await storage.getOrders();
    const reservations = await storage.getReservations();
    const totalOrders = orders.length;
    const totalRevenue = orders.reduce((acc, order) => acc + Number(order.totalAmount), 0);
    const totalReservations = reservations.length;
    const popularDish = "Cappuccino";
    res.json({
      totalOrders,
      totalRevenue,
      totalReservations,
      popularDish
    });
  });
  if (process.env.NODE_ENV !== "production") {
    const admin = await storage.getAdminByUsername("admin@parsikcafe.com");
    if (!admin) {
      await storage.createAdmin({
        username: "admin@parsikcafe.com",
        password: "Parsik@2024",
        role: "admin"
      });
      console.log("Admin account initialized in database.");
    }
    const menuItems = await storage.getMenuItems();
    if (menuItems.length === 0) {
      await storage.createMenuItem({
        name: "Classic Cappuccino",
        description: "Rich espresso with steamed milk foam",
        price: "180",
        category: "Beverages",
        imageUrl: "https://images.unsplash.com/photo-1572442388796-11668a67e53d?w=800&q=80",
        isVeg: true,
        isAvailable: true,
        branch: "all"
      });
      await storage.createMenuItem({
        name: "Avocado Toast",
        description: "Sourdough bread topped with fresh avocado and cherry tomatoes",
        price: "350",
        category: "Starters",
        imageUrl: "https://images.unsplash.com/photo-1588137372308-15f75323ca8d?w=800&q=80",
        isVeg: true,
        isAvailable: true,
        branch: "all"
      });
      await storage.createMenuItem({
        name: "Grilled Chicken Burger",
        description: "Juicy grilled chicken patty with lettuce, tomato, and house sauce",
        price: "420",
        category: "Burgers & Wraps",
        imageUrl: "https://images.unsplash.com/photo-1568901346375-23c9450c58cd?w=800&q=80",
        isVeg: false,
        isAvailable: true,
        branch: "all"
      });
      console.log("Menu items seeded");
    }
  }
  return httpServer;
}
export {
  registerRoutes
};
