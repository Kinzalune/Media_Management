# Media Management

A modular REST API built with Node.js, Express, and MongoDB, featuring secure JWT authentication, media asset pipelines, and scalable database schemas.

[Data Model & Architecture](Model%20link)

---

## Key Features

- **Authentication & Security:** Access and refresh token lifecycle (JWT), bcrypt hashing, and cookie-based sessions.
- **Media Processing:** Multi-part file uploads and cloud storage integration using Multer and Cloudinary.
- **Data Modeling:** Complex Mongoose schemas with aggregation pipelines for video feeds, comments, likes, and subscriptions.
- **API Standards:** Centralized async handlers with standardized `ApiResponse` and `ApiError` utilities.

---

## Tech Stack

- **Runtime:** Node.js
- **Framework:** Express.js
- **Database:** MongoDB & Mongoose
- **Storage:** Cloudinary via Multer
- **Security:** JSON Web Tokens, bcrypt

---

## Setup & Installation

1. **Clone the repository:**
   ```bash
   git clone [https://github.com/Kinzalune/chai-backend.git](https://github.com/Kinzalune/chai-backend.git)
   cd chai-backend
