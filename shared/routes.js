import { z } from "zod";
import {
  insertMenuItemSchema,
  insertOrderSchema,
  insertReservationSchema,
  insertContactSchema,
  insertOfferSchema
} from "./schema.js";
const errorSchemas = {
  validation: z.object({
    message: z.string(),
    field: z.string().optional()
  }),
  notFound: z.object({
    message: z.string()
  }),
  internal: z.object({
    message: z.string()
  }),
  unauthorized: z.object({
    message: z.string()
  })
};
const api = {
  auth: {
    login: {
      method: "POST",
      path: "/api/auth/login",
      input: z.object({
        username: z.string(),
        password: z.string()
      }),
      responses: {
        200: z.object({ message: z.string(), user: z.any() }),
        401: errorSchemas.unauthorized
      }
    },
    logout: {
      method: "POST",
      path: "/api/auth/logout",
      responses: {
        200: z.object({ message: z.string() })
      }
    },
    me: {
      method: "GET",
      path: "/api/auth/me",
      responses: {
        200: z.any(),
        // Returns user object
        401: errorSchemas.unauthorized
      }
    },
    register: {
      method: "POST",
      path: "/api/auth/register",
      input: z.object({
        username: z.string(),
        password: z.string(),
        fullName: z.string().optional(),
        email: z.string().optional(),
        phoneNumber: z.string().optional()
      }),
      responses: {
        201: z.object({ message: z.string(), user: z.any() }),
        400: errorSchemas.validation
      }
    }
  },
  menu: {
    list: {
      method: "GET",
      path: "/api/menu",
      input: z.object({
        category: z.string().optional(),
        branch: z.string().optional()
      }).optional(),
      responses: {
        200: z.array(z.any())
      }
    },
    get: {
      method: "GET",
      path: "/api/menu/:id",
      responses: {
        200: z.any(),
        404: errorSchemas.notFound
      }
    },
    create: {
      method: "POST",
      path: "/api/menu",
      input: insertMenuItemSchema,
      responses: {
        201: z.any(),
        400: errorSchemas.validation,
        401: errorSchemas.unauthorized
      }
    },
    update: {
      method: "PUT",
      path: "/api/menu/:id",
      input: insertMenuItemSchema.partial(),
      responses: {
        200: z.any(),
        400: errorSchemas.validation,
        401: errorSchemas.unauthorized,
        404: errorSchemas.notFound
      }
    },
    delete: {
      method: "DELETE",
      path: "/api/menu/:id",
      responses: {
        204: z.void(),
        401: errorSchemas.unauthorized,
        404: errorSchemas.notFound
      }
    }
  },
  orders: {
    list: {
      method: "GET",
      path: "/api/orders",
      responses: {
        200: z.array(z.any()),
        401: errorSchemas.unauthorized
      }
    },
    myOrders: {
      method: "GET",
      path: "/api/orders/my",
      responses: {
        200: z.array(z.any()),
        401: errorSchemas.unauthorized
      }
    },
    create: {
      method: "POST",
      path: "/api/orders",
      input: insertOrderSchema,
      responses: {
        201: z.any(),
        400: errorSchemas.validation
      }
    },
    updateStatus: {
      method: "PATCH",
      path: "/api/orders/:id/status",
      input: z.object({
        status: z.string(),
        paymentStatus: z.string().optional()
      }),
      responses: {
        200: z.any(),
        400: errorSchemas.validation,
        401: errorSchemas.unauthorized,
        404: errorSchemas.notFound
      }
    }
  },
  reservations: {
    list: {
      method: "GET",
      path: "/api/reservations",
      responses: {
        200: z.array(z.any()),
        401: errorSchemas.unauthorized
      }
    },
    create: {
      method: "POST",
      path: "/api/reservations",
      input: insertReservationSchema,
      responses: {
        201: z.any(),
        400: errorSchemas.validation
      }
    },
    updateStatus: {
      method: "PATCH",
      path: "/api/reservations/:id/status",
      input: z.object({
        status: z.string()
      }),
      responses: {
        200: z.any(),
        400: errorSchemas.validation,
        401: errorSchemas.unauthorized,
        404: errorSchemas.notFound
      }
    }
  },
  contact: {
    create: {
      method: "POST",
      path: "/api/contact",
      input: insertContactSchema,
      responses: {
        201: z.any(),
        400: errorSchemas.validation
      }
    },
    list: {
      method: "GET",
      path: "/api/contact",
      responses: {
        200: z.array(z.any()),
        401: errorSchemas.unauthorized
      }
    }
  },
  offers: {
    list: {
      method: "GET",
      path: "/api/offers",
      input: z.object({
        active: z.enum(["true", "false"]).optional()
      }).optional(),
      responses: {
        200: z.array(z.any()),
        401: errorSchemas.unauthorized
      }
    },
    get: {
      method: "GET",
      path: "/api/offers/:id",
      responses: {
        200: z.any(),
        404: errorSchemas.notFound
      }
    },
    create: {
      method: "POST",
      path: "/api/offers",
      input: insertOfferSchema,
      responses: {
        201: z.any(),
        400: errorSchemas.validation,
        401: errorSchemas.unauthorized
      }
    },
    update: {
      method: "PUT",
      path: "/api/offers/:id",
      input: insertOfferSchema.partial(),
      responses: {
        200: z.any(),
        400: errorSchemas.validation,
        401: errorSchemas.unauthorized,
        404: errorSchemas.notFound
      }
    },
    delete: {
      method: "DELETE",
      path: "/api/offers/:id",
      responses: {
        204: z.void(),
        401: errorSchemas.unauthorized,
        404: errorSchemas.notFound
      }
    },
    toggle: {
      method: "PATCH",
      path: "/api/offers/:id/toggle",
      responses: {
        200: z.any(),
        401: errorSchemas.unauthorized,
        404: errorSchemas.notFound
      }
    }
  },
  stats: {
    get: {
      method: "GET",
      path: "/api/stats",
      responses: {
        200: z.object({
          totalOrders: z.number(),
          totalRevenue: z.number(),
          totalReservations: z.number(),
          popularDish: z.string().optional()
        }),
        401: errorSchemas.unauthorized
      }
    }
  }
};
function buildUrl(path, params) {
  let url = path;
  if (params) {
    Object.entries(params).forEach(([key, value]) => {
      if (url.includes(`:${key}`)) {
        url = url.replace(`:${key}`, String(value));
      }
    });
  }
  return url;
}
export {
  api,
  buildUrl,
  errorSchemas
};
