import "dotenv/config";
import {
  users,
  admins,
  menuItems,
  orders,
  reservations,
  contacts,
  offers
} from "../shared/schema.js";
import { db } from "./db.js";
import { eq, desc } from "drizzle-orm";
import fs from "fs";
import path from "path";
class DatabaseStorage {
  // User (Customer)
  async getUser(id) {
    const [user] = await db.select().from(users).where(eq(users.id, id));
    return user;
  }
  async getUserByUsername(username) {
    const [user] = await db.select().from(users).where(eq(users.username, username));
    return user;
  }
  async createUser(insertUser) {
    const [user] = await db.insert(users).values(insertUser).returning();
    return user;
  }
  // Admin (Staff)
  async getAdmin(id) {
    const [admin] = await db.select().from(admins).where(eq(admins.id, id));
    return admin;
  }
  async getAdminByUsername(username) {
    const [admin] = await db.select().from(admins).where(eq(admins.username, username));
    return admin;
  }
  async createAdmin(insertAdmin) {
    const [admin] = await db.insert(admins).values(insertAdmin).returning();
    return admin;
  }
  // Menu
  async getMenuItems(category, branch) {
    let query = db.select().from(menuItems);
    const allItems = await query;
    return allItems.filter((item) => {
      if (category && item.category !== category) return false;
      if (branch && item.branch !== "all" && item.branch !== branch) return false;
      return true;
    });
  }
  async getMenuItem(id) {
    const [item] = await db.select().from(menuItems).where(eq(menuItems.id, id));
    return item;
  }
  async createMenuItem(item) {
    const [newItem] = await db.insert(menuItems).values(item).returning();
    return newItem;
  }
  async updateMenuItem(id, updates) {
    const [updatedItem] = await db.update(menuItems).set(updates).where(eq(menuItems.id, id)).returning();
    return updatedItem;
  }
  async deleteMenuItem(id) {
    await db.delete(menuItems).where(eq(menuItems.id, id));
  }
  
  // Orders
  async getOrders() {
    return await db.select().from(orders).orderBy(desc(orders.createdAt));
  }
  async getOrdersByUserId(userId) {
    return await db.select().from(orders)
      .where(eq(orders.userId, userId))
      .orderBy(desc(orders.createdAt));
  }
  async createOrder(order) {
    const [newOrder] = await db.insert(orders).values(order).returning();
    return newOrder;
  }
  async updateOrderStatus(id, status, paymentStatus) {
    const updates = { status };
    if (paymentStatus) updates.paymentStatus = paymentStatus;
    const [updatedOrder] = await db.update(orders).set(updates).where(eq(orders.id, id)).returning();
    return updatedOrder;
  }

  async getOpenOrders(userId) {
    const userOrders = await db.select().from(orders)
      .where(eq(orders.userId, userId))
      .orderBy(desc(orders.createdAt));
    return userOrders.filter(o => ["pending", "preparing", "served"].includes(o.status));
  }

  async createDraftOrder(userId, itemsToAdd, orderDetails) {
    const sub = itemsToAdd.reduce((acc, i) => acc + (Number(i.price) * i.quantity), 0);
    const tx = sub * 0.05;
    const tot = sub + tx;
    
    const newOrder = {
      userId,
      customerName: orderDetails.customerName,
      phoneNumber: orderDetails.phoneNumber,
      tableNumber: orderDetails.tableNumber,
      branch: orderDetails.branch || "airoli",
      paymentMethod: orderDetails.paymentMethod || "card",
      status: "pending", // Stacked orders start as pending
      paymentStatus: "pending",
      items: itemsToAdd,
      specialRequests: orderDetails.specialRequests || null,
      subtotal: sub.toString(),
      tax: tx.toString(),
      totalAmount: tot.toFixed(2)
    };
    
    const [created] = await db.insert(orders).values(newOrder).returning();
    return created;
  }

  async cancelDraftOrder(orderId, userId) {
    // Only allow canceling if it belongs to user and is still pending
    const [orderToCancel] = await db.select().from(orders).where(eq(orders.id, orderId));
    if (!orderToCancel || orderToCancel.userId !== userId) throw new Error("Order not found");
    if (orderToCancel.status !== "pending") throw new Error("Cannot cancel an order that is already being prepared");
    
    await db.delete(orders).where(eq(orders.id, orderId));
    return { success: true };
  }

  async checkoutTable(userId, paymentMethod) {
    const openOrders = await this.getOpenOrders(userId);
    if (!openOrders.length) throw new Error("No open orders found for this table");

    // Merge everything into the first order
    const primaryOrder = openOrders[openOrders.length - 1]; // Use oldest as base
    
    let allItems = [];
    openOrders.forEach(o => {
      const items = Array.isArray(o.items) ? o.items : [];
      items.forEach(item => {
        const existingItemIndex = allItems.findIndex(i => i.dishId === item.dishId && i.appliedOfferTitle === item.appliedOfferTitle);
        if (existingItemIndex !== -1) {
          allItems[existingItemIndex].quantity += item.quantity;
        } else {
          allItems.push({ ...item });
        }
      });
    });

    const newSubtotal = allItems.reduce((acc, i) => acc + (Number(i.price) * i.quantity), 0);
    const newTax = newSubtotal * 0.05;
    const newTotal = newSubtotal + newTax;

    const [updatedOrder] = await db.update(orders)
      .set({
        items: allItems,
        subtotal: newSubtotal.toString(),
        tax: newTax.toString(),
        totalAmount: newTotal.toFixed(2),
        paymentMethod: paymentMethod || primaryOrder.paymentMethod,
        status: "checkout_requested"
      })
      .where(eq(orders.id, primaryOrder.id))
      .returning();

    // Delete the other merged orders
    for (const order of openOrders) {
      if (order.id !== primaryOrder.id) {
        await db.delete(orders).where(eq(orders.id, order.id));
      }
    }

    return updatedOrder;
  }
  
  // Reservations
  async getReservations() {
    return await db.select().from(reservations).orderBy(desc(reservations.createdAt));
  }
  async createReservation(reservation) {
    const [newReservation] = await db.insert(reservations).values(reservation).returning();
    return newReservation;
  }
  async updateReservationStatus(id, status) {
    const [updatedReservation] = await db.update(reservations).set({ status }).where(eq(reservations.id, id)).returning();
    return updatedReservation;
  }
  // Contacts
  async getContacts() {
    return await db.select().from(contacts).orderBy(desc(contacts.createdAt));
  }
  async createContact(contact) {
    const [newContact] = await db.insert(contacts).values(contact).returning();
    return newContact;
  }
  // Offers
  async getOffers(activeOnly = false) {
    let query = db.select().from(offers).orderBy(desc(offers.createdAt));
    if (activeOnly) {
      query = query.where(eq(offers.isActive, true));
    }
    return await query;
  }
  async getOffer(id) {
    const [offer] = await db.select().from(offers).where(eq(offers.id, id));
    return offer;
  }
  async getOffersByMenuItemId(menuItemId) {
    return await db.select().from(offers).where(eq(offers.menuItemId, menuItemId));
  }
  async createOffer(offer) {
    const [newOffer] = await db.insert(offers).values(offer).returning();
    return newOffer;
  }
  async updateOffer(id, updates) {
    const [updatedOffer] = await db.update(offers).set(updates).where(eq(offers.id, id)).returning();
    return updatedOffer;
  }
  async deleteOffer(id) {
    await db.delete(offers).where(eq(offers.id, id));
  }
  async toggleOfferActive(id) {
    const offer = await this.getOffer(id);
    if (!offer) throw new Error("Offer not found");
    return await this.updateOffer(id, { isActive: !offer.isActive });
  }
}
class JSONStorage {
  constructor() {
    this.dataDir = path.join(process.cwd(), "server", "data");
    this.files = {
      users: path.join(this.dataDir, "users.json"),
      admins: path.join(this.dataDir, "admins.json"),
      menuItems: path.join(this.dataDir, "menu_items.json"),
      orders: path.join(this.dataDir, "orders.json"),
      reservations: path.join(this.dataDir, "reservations.json"),
      contacts: path.join(this.dataDir, "contacts.json"),
      offers: path.join(this.dataDir, "offers.json")
    };
    if (!fs.existsSync(this.dataDir)) {
      fs.mkdirSync(this.dataDir, { recursive: true });
    }
    Object.values(this.files).forEach((file) => {
      if (!fs.existsSync(file)) {
        fs.writeFileSync(file, JSON.stringify([]));
      }
    });
  }
  async read(key) {
    const content = await fs.promises.readFile(this.files[key], "utf-8");
    const data = JSON.parse(content);
    return data.map((item) => {
      if (item.createdAt) item.createdAt = new Date(item.createdAt);
      return item;
    });
  }
  async write(key, data) {
    await fs.promises.writeFile(this.files[key], JSON.stringify(data, null, 2));
  }
  async getUser(id) {
    const users2 = await this.read("users");
    return users2.find((u) => u.id === id);
  }
  async getUserByUsername(username) {
    const users2 = await this.read("users");
    return users2.find((u) => u.username === username);
  }
  async createUser(insertUser) {
    const users2 = await this.read("users");
    const id = users2.length > 0 ? Math.max(...users2.map((u) => u.id)) + 1 : 1;
    const user = {
      ...insertUser,
      id,
      createdAt: new Date()
    };
    users2.push(user);
    await this.write("users", users2);
    return user;
  }
  async getAdmin(id) {
    const admins2 = await this.read("admins");
    return admins2.find((a) => a.id === id);
  }
  async getAdminByUsername(username) {
    const admins2 = await this.read("admins");
    return admins2.find((a) => a.username === username);
  }
  async createAdmin(insertAdmin) {
    const admins2 = await this.read("admins");
    const id = admins2.length > 0 ? Math.max(...admins2.map((a) => a.id)) + 1 : 1;
    const admin = {
      ...insertAdmin,
      id,
      role: insertAdmin.role ?? "admin",
      createdAt: new Date()
    };
    admins2.push(admin);
    await this.write("admins", admins2);
    return admin;
  }
  async getMenuItems(category, branch) {
    const items = await this.read("menuItems");
    return items.filter((item) => {
      if (category && item.category !== category) return false;
      if (branch && item.branch !== "all" && item.branch !== branch) return false;
      return true;
    });
  }
  async getMenuItem(id) {
    const items = await this.read("menuItems");
    return items.find((item) => item.id === id);
  }
  async createMenuItem(item) {
    const items = await this.read("menuItems");
    const id = items.length > 0 ? Math.max(...items.map((i) => i.id)) + 1 : 1;
    const newItem = {
      ...item,
      id,
      branch: item.branch ?? "all",
      isVeg: item.isVeg ?? true,
      isAvailable: item.isAvailable ?? true
    };
    items.push(newItem);
    await this.write("menuItems", items);
    return newItem;
  }
  async updateMenuItem(id, updates) {
    const items = await this.read("menuItems");
    const index = items.findIndex((item) => item.id === id);
    if (index === -1) throw new Error("Item not found");
    const updated = { ...items[index], ...updates };
    items[index] = updated;
    await this.write("menuItems", items);
    return updated;
  }
  async deleteMenuItem(id) {
    let items = await this.read("menuItems");
    items = items.filter((item) => item.id !== id);
    await this.write("menuItems", items);
  }
  async getOrders() {
    const allOrders = await this.read("orders");
    return allOrders.sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime());
  }
  async getOrdersByUserId(userId) {
    const allOrders = await this.read("orders");
    return allOrders
      .filter(o => o.userId === userId)
      .sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime());
  }
  async createOrder(order) {
    const orders2 = await this.read("orders");
    const id = orders2.length > 0 ? Math.max(...orders2.map((o) => o.id)) + 1 : 1;
    const newOrder = {
      ...order,
      id,
      createdAt: /* @__PURE__ */ new Date(),
      status: "pending",
      paymentStatus: "pending",
      tableNumber: order.tableNumber ?? null,
      items: order.items
    };
    orders2.push(newOrder);
    await this.write("orders", orders2);
    return newOrder;
  }
  async updateOrderStatus(id, status, paymentStatus) {
    const orders2 = await this.read("orders");
    const index = orders2.findIndex((o) => o.id === id);
    if (index === -1) throw new Error("Order not found");
    orders2[index] = { ...orders2[index], status };
    if (paymentStatus) orders2[index].paymentStatus = paymentStatus;
    await this.write("orders", orders2);
    return orders2[index];
  }

  async getOpenOrders(userId) {
    const allOrders = await this.read("orders");
    return allOrders.filter(o => o.userId === userId && ["pending", "preparing", "served"].includes(o.status));
  }

  async createDraftOrder(userId, itemsToAdd, orderDetails) {
    const ordersList = await this.read("orders");
    const id = ordersList.length > 0 ? Math.max(...ordersList.map((o) => o.id)) + 1 : 1;
    const sub = itemsToAdd.reduce((acc, i) => acc + (Number(i.price) * i.quantity), 0);
    const tx = sub * 0.05;
    const tot = sub + tx;
    
    const newOrder = {
      id,
      userId,
      customerName: orderDetails.customerName,
      phoneNumber: orderDetails.phoneNumber,
      tableNumber: orderDetails.tableNumber,
      branch: orderDetails.branch || "airoli",
      paymentMethod: orderDetails.paymentMethod || "card",
      status: "pending", // Stacked orders start as pending
      paymentStatus: "pending",
      items: itemsToAdd,
      specialRequests: orderDetails.specialRequests || null,
      subtotal: sub.toString(),
      tax: tx.toString(),
      totalAmount: tot.toFixed(2),
      createdAt: new Date()
    };
    
    ordersList.push(newOrder);
    await this.write("orders", ordersList);
    return newOrder;
  }

  async cancelDraftOrder(orderId, userId) {
    const ordersList = await this.read("orders");
    const index = ordersList.findIndex(o => o.id === orderId && o.userId === userId);
    if (index === -1) throw new Error("Order not found");
    if (ordersList[index].status !== "pending") throw new Error("Cannot cancel an order that is already being prepared");
    
    ordersList.splice(index, 1);
    await this.write("orders", ordersList);
    return { success: true };
  }

  async checkoutTable(userId, paymentMethod) {
    const ordersList = await this.read("orders");
    const openOrders = ordersList.filter(o => o.userId === userId && ["pending", "preparing", "served"].includes(o.status));
    if (!openOrders.length) throw new Error("No open orders found for this table");

    const primaryOrder = openOrders[openOrders.length - 1]; // Use oldest as base
    
    let allItems = [];
    openOrders.forEach(o => {
      const items = Array.isArray(o.items) ? o.items : [];
      items.forEach(item => {
        const existingItemIndex = allItems.findIndex(i => i.dishId === item.dishId && i.appliedOfferTitle === item.appliedOfferTitle);
        if (existingItemIndex !== -1) {
          allItems[existingItemIndex].quantity += item.quantity;
        } else {
          allItems.push({ ...item });
        }
      });
    });

    const newSubtotal = allItems.reduce((acc, i) => acc + (Number(i.price) * i.quantity), 0);
    const newTax = newSubtotal * 0.05;
    const newTotal = newSubtotal + newTax;

    const updatedPrimaryOrder = {
      ...primaryOrder,
      items: allItems,
      subtotal: newSubtotal.toString(),
      tax: newTax.toString(),
      totalAmount: newTotal.toFixed(2),
      paymentMethod: paymentMethod || primaryOrder.paymentMethod,
      status: "checkout_requested"
    };

    // Filter out all open orders from list, then push the merged one back
    const primaryId = primaryOrder.id;
    const openOrderIds = openOrders.map(o => o.id);
    const newOrdersList = ordersList.filter(o => !openOrderIds.includes(o.id));
    newOrdersList.push(updatedPrimaryOrder);

    await this.write("orders", newOrdersList);
    return updatedPrimaryOrder;
  }

  async getReservations() {
    const reservations2 = await this.read("reservations");
    return reservations2.sort(
      (a, b) => (b.createdAt?.getTime() || 0) - (a.createdAt?.getTime() || 0)
    );
  }
  async createReservation(reservation) {
    const reservations2 = await this.read("reservations");
    const id = reservations2.length > 0 ? Math.max(...reservations2.map((r) => r.id)) + 1 : 1;
    const newReservation = {
      ...reservation,
      id,
      createdAt: /* @__PURE__ */ new Date(),
      status: "upcoming",
      email: reservation.email ?? null,
      specialRequests: reservation.specialRequests ?? null
    };
    reservations2.push(newReservation);
    await this.write("reservations", reservations2);
    return newReservation;
  }
  async updateReservationStatus(id, status) {
    const reservations2 = await this.read("reservations");
    const index = reservations2.findIndex((r) => r.id === id);
    if (index === -1) throw new Error("Reservation not found");
    reservations2[index] = { ...reservations2[index], status };
    await this.write("reservations", reservations2);
    return reservations2[index];
  }
  async getContacts() {
    const contacts2 = await this.read("contacts");
    return contacts2.sort(
      (a, b) => (b.createdAt?.getTime() || 0) - (a.createdAt?.getTime() || 0)
    );
  }
  async createContact(contact) {
    const contacts2 = await this.read("contacts");
    const id = contacts2.length > 0 ? Math.max(...contacts2.map((c) => c.id)) + 1 : 1;
    const newContact = { ...contact, id, createdAt: /* @__PURE__ */ new Date() };
    contacts2.push(newContact);
    await this.write("contacts", contacts2);
    return newContact;
  }
  async getOffers(activeOnly = false) {
    const allOffers = await this.read("offers");
    let result = allOffers.sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime());
    if (activeOnly) {
      result = result.filter(o => o.isActive);
    }
    return result;
  }
  async getOffer(id) {
    const offersData = await this.read("offers");
    return offersData.find((o) => o.id === id);
  }
  async getOffersByMenuItemId(menuItemId) {
    const offersData = await this.read("offers");
    return offersData.filter((o) => o.menuItemId === menuItemId);
  }
  async createOffer(offer) {
    const offersData = await this.read("offers");
    const id = offersData.length > 0 ? Math.max(...offersData.map((o) => o.id)) + 1 : 1;
    const newOffer = {
      ...offer,
      id,
      createdAt: new Date(),
      isActive: offer.isActive ?? true,
      currentUsageCount: 0
    };
    offersData.push(newOffer);
    await this.write("offers", offersData);
    return newOffer;
  }
  async updateOffer(id, updates) {
    const offersData = await this.read("offers");
    const index = offersData.findIndex((o) => o.id === id);
    if (index === -1) throw new Error("Offer not found");
    const updated = { ...offersData[index], ...updates };
    offersData[index] = updated;
    await this.write("offers", offersData);
    return updated;
  }
  async deleteOffer(id) {
    let offersData = await this.read("offers");
    offersData = offersData.filter((o) => o.id !== id);
    await this.write("offers", offersData);
  }
  async toggleOfferActive(id) {
    const offer = await this.getOffer(id);
    if (!offer) throw new Error("Offer not found");
    return await this.updateOffer(id, { isActive: !offer.isActive });
  }
}
const storage = process.env.DATABASE_URL ? new DatabaseStorage() : new JSONStorage();
console.log(`[Storage] Initialized using ${process.env.DATABASE_URL ? "Database (PostgreSQL)" : "Local JSON Files"}`);
export {
  DatabaseStorage,
  JSONStorage,
  storage
};
