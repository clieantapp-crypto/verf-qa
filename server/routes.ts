import type { Express, Request } from "express";
import { type Server } from "http";
import { storage } from "./storage";
import { insertUserSchema, insertApplicationSchema, insertVisitorSchema } from "@shared/schema";
import { z } from "zod";
import bcrypt from "bcryptjs";

// Extend Express session
declare module "express-session" {
  interface SessionData {
    userId?: string;
    adminId?: string;
  }
}

export async function registerRoutes(
  httpServer: Server,
  app: Express
): Promise<Server> {
  
  // ============= AUTH ROUTES =============
  
  // User Registration
  app.post("/api/auth/register", async (req, res) => {
    try {
      const data = req.body;
      
      // Hash password
      const hashedPassword = await bcrypt.hash(data.password, 10);
      
      const user = await storage.createUser({
        ...data,
        password: hashedPassword,
      });
      
      // Create application entry for inbox
      await storage.createApplication({
        userId: user.id,
        applicantName: data.fullNameEnglish || data.username,
        applicantEmail: data.email,
        applicationType: "New Registration",
        status: "pending",
      });
      
      res.json({ success: true, userId: user.id });
    } catch (error: any) {
      console.error("Registration error:", error);
      res.status(400).json({ error: error.message || "Registration failed" });
    }
  });
  
  // User Login
  app.post("/api/auth/login", async (req, res) => {
    try {
      const { username, password } = req.body;
      
      const user = await storage.getUserByUsername(username);
      if (!user) {
        return res.status(401).json({ error: "Invalid credentials" });
      }
      
      const validPassword = await bcrypt.compare(password, user.password);
      if (!validPassword) {
        return res.status(401).json({ error: "Invalid credentials" });
      }
      
      req.session.userId = user.id;
      res.json({ success: true, user: { id: user.id, username: user.username } });
    } catch (error: any) {
      console.error("Login error:", error);
      res.status(500).json({ error: "Login failed" });
    }
  });
  
  // Admin Login
  app.post("/api/admin/login", async (req, res) => {
    try {
      const { username, password } = req.body;
      
      const admin = await storage.getAdminByUsername(username);
      if (!admin) {
        return res.status(401).json({ error: "Invalid credentials" });
      }
      
      const validPassword = await bcrypt.compare(password, admin.password);
      if (!validPassword) {
        return res.status(401).json({ error: "Invalid credentials" });
      }
      
      req.session.adminId = admin.id;
      res.json({ success: true, admin: { id: admin.id, username: admin.username, role: admin.role } });
    } catch (error: any) {
      console.error("Admin login error:", error);
      res.status(500).json({ error: "Login failed" });
    }
  });
  
  // Logout
  app.post("/api/auth/logout", (req, res) => {
    req.session.destroy((err) => {
      if (err) {
        return res.status(500).json({ error: "Logout failed" });
      }
      res.json({ success: true });
    });
  });
  
  // Get current user/admin
  app.get("/api/auth/me", async (req, res) => {
    try {
      if (req.session.userId) {
        const user = await storage.getUser(req.session.userId);
        if (user) {
          const { password, ...safeUser } = user;
          return res.json({ type: "user", data: safeUser });
        }
      }
      
      if (req.session.adminId) {
        const admin = await storage.getAdmin(req.session.adminId);
        if (admin) {
          const { password, ...safeAdmin } = admin;
          return res.json({ type: "admin", data: safeAdmin });
        }
      }
      
      res.status(401).json({ error: "Not authenticated" });
    } catch (error) {
      res.status(500).json({ error: "Failed to get user" });
    }
  });
  
  // ============= VISITOR TRACKING =============
  
  app.post("/api/visitors/track", async (req, res) => {
    try {
      const visitorData = {
        ipAddress: req.ip,
        userAgent: req.headers["user-agent"],
        country: req.body.country || "Qatar",
        page: req.body.page || "/",
        referrer: req.body.referrer,
        sessionId: req.sessionID,
      };
      
      await storage.trackVisitor(visitorData);
      res.json({ success: true });
    } catch (error) {
      console.error("Visitor tracking error:", error);
      res.status(500).json({ error: "Tracking failed" });
    }
  });
  
  // ============= ADMIN ROUTES =============
  
  // Middleware to check admin authentication
  const requireAdmin = (req: Request, res: any, next: any) => {
    if (!req.session.adminId) {
      return res.status(403).json({ error: "Admin access required" });
    }
    next();
  };
  
  // Get dashboard stats
  app.get("/api/admin/dashboard/stats", async (req, res) => {
    try {
      const today = new Date();
      today.setHours(0, 0, 0, 0);
      
      const visitorStats = await storage.getVisitorStats(today);
      const activeVisitors = await storage.getActiveVisitors();
      const applicationStats = await storage.getApplicationStats();
      
      // Mock revenue calculation (QAR 10 per completed application)
      const revenue = applicationStats.completed * 10;
      
      res.json({
        totalVisitors: visitorStats.total,
        activeNow: activeVisitors,
        applications: applicationStats.total,
        revenue: revenue,
        visitorsByCountry: visitorStats.byCountry,
        applicationsByStatus: {
          pending: applicationStats.pending,
          completed: applicationStats.completed,
          review: applicationStats.review,
          rejected: applicationStats.rejected,
        },
      });
    } catch (error) {
      console.error("Dashboard stats error:", error);
      res.status(500).json({ error: "Failed to get stats" });
    }
  });
  
  // Get applications (inbox)
  app.get("/api/admin/applications", async (req, res) => {
    try {
      const limit = req.query.limit ? parseInt(req.query.limit as string) : 50;
      const applications = await storage.getApplications(limit);
      res.json(applications);
    } catch (error) {
      console.error("Get applications error:", error);
      res.status(500).json({ error: "Failed to get applications" });
    }
  });
  
  // Update application status
  app.patch("/api/admin/applications/:id", async (req, res) => {
    try {
      const { id } = req.params;
      const { status } = req.body;
      
      const updated = await storage.updateApplicationStatus(
        id,
        status,
        req.session.adminId
      );
      
      if (!updated) {
        return res.status(404).json({ error: "Application not found" });
      }
      
      res.json(updated);
    } catch (error) {
      console.error("Update application error:", error);
      res.status(500).json({ error: "Failed to update application" });
    }
  });
  
  // Get visitor analytics
  app.get("/api/admin/visitors/analytics", async (req, res) => {
    try {
      const days = req.query.days ? parseInt(req.query.days as string) : 7;
      const startDate = new Date();
      startDate.setDate(startDate.getDate() - days);
      
      const stats = await storage.getVisitorStats(startDate);
      res.json(stats);
    } catch (error) {
      console.error("Visitor analytics error:", error);
      res.status(500).json({ error: "Failed to get analytics" });
    }
  });
  
  // ============= USER PROFILE ROUTES =============
  
  // Update user profile/registration data
  app.patch("/api/users/:id", async (req, res) => {
    try {
      const { id } = req.params;
      
      // Verify user can only update their own data
      if (req.session.userId !== id && !req.session.adminId) {
        return res.status(403).json({ error: "Unauthorized" });
      }
      
      const updated = await storage.updateUser(id, req.body);
      
      if (!updated) {
        return res.status(404).json({ error: "User not found" });
      }
      
      const { password, ...safeUser } = updated;
      res.json(safeUser);
    } catch (error) {
      console.error("Update user error:", error);
      res.status(500).json({ error: "Failed to update user" });
    }
  });

  return httpServer;
}
