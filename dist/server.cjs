

   import { createRequire } from 'module';

   const require = createRequire(import.meta.url);

  
"use strict";
var __create = Object.create;
var __defProp = Object.defineProperty;
var __getOwnPropDesc = Object.getOwnPropertyDescriptor;
var __getOwnPropNames = Object.getOwnPropertyNames;
var __getProtoOf = Object.getPrototypeOf;
var __hasOwnProp = Object.prototype.hasOwnProperty;
var __copyProps = (to, from, except, desc) => {
  if (from && typeof from === "object" || typeof from === "function") {
    for (let key of __getOwnPropNames(from))
      if (!__hasOwnProp.call(to, key) && key !== except)
        __defProp(to, key, { get: () => from[key], enumerable: !(desc = __getOwnPropDesc(from, key)) || desc.enumerable });
  }
  return to;
};
var __toESM = (mod, isNodeMode, target) => (target = mod != null ? __create(__getProtoOf(mod)) : {}, __copyProps(
  // If the importer is in node compatibility mode or this is not an ESM
  // file that has been converted to a CommonJS file using a Babel-
  // compatible transform (i.e. "__esModule" has not been set), then set
  // "default" to the CommonJS "module.exports" for node compatibility.
  isNodeMode || !mod || !mod.__esModule ? __defProp(target, "default", { value: mod, enumerable: true }) : target,
  mod
));

// src/app.ts
var import_express3 = __toESM(require("express"), 1);
var import_cors = __toESM(require("cors"), 1);
var import_cookie_parser = __toESM(require("cookie-parser"), 1);

// src/config/index.ts
var import_path = __toESM(require("path"), 1);
var import_dotenv = __toESM(require("dotenv"), 1);
import_dotenv.default.config({
  path: import_path.default.join(process.cwd(), ".env")
});
var config = {
  CONNECTION_STRING: process.env.CONNECTION_STRING,
  PORT: process.env.PORT,
  SALT_ROUNDS: process.env.SALT_ROUNDS,
  JWT_ACCESSTOKEN_SECRET: process.env.JWT_ACCESSTOKEN_SECRET,
  JWT_REFRESHTOKEN_SECRET: process.env.JWT_REFRESHTOKEN_SECRET
};
var config_default = config;

// src/db/index.ts
var import_pg = require("pg");
var pool = new import_pg.Pool({
  connectionString: config_default.CONNECTION_STRING
});
var initDB = async () => {
  try {
    await pool.query(`
            
            CREATE TABLE IF NOT EXISTS users(
            id SERIAL PRIMARY KEY,
            name VARCHAR(100) NOT NULL,
            email VARCHAR(100) UNIQUE NOT NULL,
            password TEXT NOT NULL,
            role VARCHAR(50) DEFAULT 'contributor' CHECK (role IN ('contributor', 'maintainer')),
            crated_at TIMESTAMP DEFAULT NOW(),
            updated_at TIMESTAMP DEFAULT NOW()
            )
            
            
            
            `);
    await pool.query(`
                CREATE TABLE IF NOT EXISTS issues(
                id SERIAL PRIMARY KEY,
                title VARCHAR(150) NOT NULL,
                description TEXT NOT NULL  CHECK (char_length(description) >19 ),
                type VARCHAR(50) NOT NULL CHECK (type IN ('bug', 'feature_request')),
                status VARCHAR(50)  DEFAULT 'open' CHECK (status IN ('open', 'in_progress', 'resolved')),
                reporter_id INT NOT NULL REFERENCES users(id) ON DELETE CASCADE,
                created_at TIMESTAMP DEFAULT NOW(),
                updated_at TIMESTAMP DEFAULT NOW()

            )`);
    console.log("database connected successfull");
  } catch (error) {
    console.log("Error from database initialization:", error);
  }
};
var db_default = initDB;

// src/module/user/auth.route.ts
var import_express = require("express");

// src/utils/hashedPassword.ts
var import_bcrypt = __toESM(require("bcrypt"), 1);
var hashedPassword = async (password) => {
  const hashedPassword2 = await import_bcrypt.default.hash(password, 10);
  return hashedPassword2;
};

// src/module/user/auth.service.ts
var import_bcrypt2 = __toESM(require("bcrypt"), 1);

// src/utils/userToken.ts
var import_jsonwebtoken = __toESM(require("jsonwebtoken"), 1);
var userToken = (jwtPayload, tokenSecret, options) => {
  const token = import_jsonwebtoken.default.sign(jwtPayload, tokenSecret, options);
  return token;
};

// src/module/user/auth.service.ts
var createUser = async (payload) => {
  const { id, name, email, password, role } = payload;
  const hashedPasswordValue = await hashedPassword(password);
  const result = await pool.query(`
        INSERT INTO users (id, name, email, password, role)
        VALUES ($1, $2, $3, $4 , COALESCE($5, 'contributor'))
        RETURNING *
        
        `, [id, name, email, hashedPasswordValue, role]);
  delete result.rows[0].password;
  return result.rows[0];
};
var userLogin = async (payload) => {
  const { email, password } = payload;
  const userData = await pool.query(`
         SELECT * FROM users WHERE email = $1
        `, [email]);
  if (userData.rows.length === 0) {
    throw new Error("Invalid User credentials");
  }
  const verifyPassword = await import_bcrypt2.default.compare(password, userData?.rows[0]?.password);
  if (!verifyPassword) {
    throw new Error("Invalid User Credentials");
  }
  const userInfo = userData.rows[0];
  const jwtPayload = {
    id: userInfo.id,
    email: userInfo.email,
    role: userInfo.role
  };
  const accessToken = userToken(jwtPayload, config_default.JWT_ACCESSTOKEN_SECRET, { expiresIn: "5h" });
  const refreshToken = userToken(jwtPayload, config_default.JWT_REFRESHTOKEN_SECRET, { expiresIn: "30d" });
  delete userData.rows[0].password;
  return {
    accessToken,
    refreshToken,
    user: userData.rows[0]
  };
};
var authService = {
  createUser,
  userLogin
};

// src/utils/sendResponse.ts
var sendResponse = (res, data) => {
  res.status(data.statusCode).json({
    success: data.success,
    message: data.message,
    data: data.data,
    error: data.error
  });
};
var sendResponse_default = sendResponse;

// src/module/user/auth.controller.ts
var userSignup = async (req, res) => {
  try {
    const result = await authService.createUser(req.body);
    sendResponse_default(
      res,
      {
        statusCode: 201,
        success: true,
        message: "user created successfully",
        data: result
      }
    );
  } catch (error) {
    sendResponse_default(
      res,
      {
        statusCode: 400,
        success: false,
        message: error.message,
        error
      }
    );
  }
};
var userLogin2 = async (req, res) => {
  const { email, password } = req.body;
  try {
    const result = await authService.userLogin({ email, password });
    const { accessToken, refreshToken, user } = result;
    res.cookie("refreshToken", refreshToken, {
      httpOnly: true,
      secure: true,
      sameSite: "lax"
    });
    sendResponse_default(res, {
      statusCode: 200,
      success: true,
      message: "Login successful",
      data: {
        token: accessToken,
        user
      }
    });
  } catch (error) {
    sendResponse_default(
      res,
      {
        statusCode: 401,
        success: false,
        message: error.message,
        error
      }
    );
  }
};
var authController = {
  userSignup,
  userLogin: userLogin2
};

// src/module/user/auth.route.ts
var router = (0, import_express.Router)();
router.post("/signup", authController.userSignup);
router.post("/login", authController.userLogin);
var AuthRouter = router;

// src/module/issues/issues.route.ts
var import_express2 = require("express");

// src/module/issues/issues.service.ts
var createIssesToDB = async (data) => {
  const { id, title, description, type, status, reporter_id } = data;
  const result = await pool.query(`
        
        INSERT INTO issues (id,title, description, type, status, reporter_id) VALUES($1, $2, $3, $4, COALESCE($5,'open'),$6)
        RETURNING *
        
        `, [id, title, description, type, status, reporter_id]);
  return result.rows[0];
};
var getAllIssuesFromDB = async (query) => {
  const { sort, type, status } = query;
  let sql = `
        SELECT 
        issues.id,
        issues.title,
        issues.description,
        issues.type,
        issues.status,

        json_build_object(
        'id', users.id,
        'name', users.name,
        'role', users.role
        ) AS reporter,
         issues.created_at,
         issues.updated_at
        FROM issues
        JOIN users ON issues.reporter_id = users.id

        
        
        `;
  const conditions = [];
  const values = [];
  if (type) {
    values.push(type);
    conditions.push(`issues.type = $${values.length}`);
  }
  if (status) {
    values.push(status);
    conditions.push(`issues.status = $${values.length}`);
  }
  if (conditions.length > 0) {
    sql += ` WHERE ` + conditions.join(" AND ");
  }
  if (sort === "oldest") {
    sql += ` ORDER BY issues.created_at ASC`;
  } else {
    sql += ` ORDER BY issues.created_at DESC`;
  }
  const result = await pool.query(sql, values);
  return result.rows;
};
var getSingleIssuesFromDB = async (id) => {
  const result = await pool.query(`
        SELECT 
        issues.id,
        issues.title,
        issues.description,
        issues.type,
        issues.status,

        json_build_object(
         'id', users.id,
         'name', users.name,
         'role' , users.role
        
         ) AS reporter,
          
        issues.created_at,
        issues.updated_at



        FROM issues
        JOIN users ON issues.reporter_id = users.id
        WHERE issues.id = $1
        
        `, [id]);
  return result;
};
var updateIssuesToDB = async (id, data, user) => {
  const { title, description, type, status } = data;
  if (user.role !== "maintainer" && user.role === "contributor") {
    const existingIssue = await pool.query(`
        SELECT * FROM issues WHERE id = $1
        
        `, [id]);
    const issues_reporter_id = existingIssue.rows[0]?.reporter_id;
    if (issues_reporter_id !== user.id) {
      throw new Error("Unauthorized to update this issue");
    }
  }
  const result = await pool.query(`
            UPDATE issues
            SET title = COALESCE($1, title),
                description = COALESCE($2, description),
                type = COALESCE($3, type),
                status = COALESCE($4, status)
            WHERE id = $5
            RETURNING *
        `, [title, description, type, status, id]);
  console.log("result from service: ", result.rows[0]);
  return result.rows;
};
var deleteIssuesFromDB = async (id) => {
  const result = await pool.query(`
        DELETE FROM issues WHERE id = $1
        
        `, [id]);
  return result;
};
var IssuesService = {
  createIssesToDB,
  getAllIssuesFromDB,
  getSingleIssuesFromDB,
  updateIssuesToDB,
  deleteIssuesFromDB
};

// src/module/issues/issues.controller.ts
var createIssues = async (req, res) => {
  console.log("from controller: ", req?.user);
  try {
    const result = await IssuesService.createIssesToDB(req.body);
    res.status(201).json({
      status: "success",
      message: "issue created successfully",
      data: result
    });
  } catch (error) {
    res.status(400).json({
      status: false,
      message: error.message,
      error
    });
  }
};
var getAllIssues = async (req, res) => {
  try {
    const issues = await IssuesService.getAllIssuesFromDB(req.query);
    if (issues.length === 0) {
      return sendResponse_default(
        res,
        {
          statusCode: 404,
          success: false,
          message: "No issues found !"
        }
      );
    }
    sendResponse_default(
      res,
      {
        statusCode: 200,
        success: true,
        message: "Issues retrieved successfully",
        data: issues
      }
    );
  } catch (error) {
    sendResponse_default(
      res,
      {
        statusCode: 500,
        success: false,
        message: error.message,
        error
      }
    );
  }
};
var getSingleIssue = async (req, res) => {
  const { id } = req.params;
  try {
    const issue = await IssuesService.getSingleIssuesFromDB(id);
    if (issue.rows.length === 0) {
      return res.status(404).json({
        status: false,
        message: "No issues found!"
      });
    }
    sendResponse_default(
      res,
      {
        statusCode: 200,
        success: true,
        message: "Issues retrieved successfully",
        data: issue.rows[0]
      }
    );
  } catch (error) {
    res.status(500).json({
      status: false,
      message: error.message,
      error
    });
  }
};
var updateIssue = async (req, res) => {
  const { id } = req.params;
  const user = req.user;
  const { title, description, type, status } = req.body;
  try {
    const updatedIssue = await IssuesService.updateIssuesToDB(id, req.body, user);
    if (updatedIssue.length === 0) {
      return res.status(404).json({
        status: false,
        message: "Issue not found!"
      });
    }
    sendResponse_default(
      res,
      {
        statusCode: 201,
        success: true,
        message: "User Created successfully!",
        data: updatedIssue
      }
    );
  } catch (error) {
    sendResponse_default(
      res,
      {
        statusCode: 500,
        success: false,
        message: error.message,
        error
      }
    );
  }
};
var deleteIssue = async (req, res) => {
  const { id } = req.params;
  try {
    const result = await IssuesService.deleteIssuesFromDB(id);
    sendResponse_default(
      res,
      {
        statusCode: 20,
        success: true,
        message: "User deleted successfull!"
      }
    );
  } catch (error) {
    sendResponse_default(
      res,
      {
        statusCode: 500,
        success: false,
        message: error.message,
        error
      }
    );
  }
};
var IssuesController = {
  createIssues,
  getAllIssues,
  getSingleIssue,
  updateIssue,
  deleteIssue
};

// src/types/index.ts
var USER_ROLE = {
  contributor: "contributor",
  maintainer: "maintainer"
};

// src/middleware/auth.ts
var import_jsonwebtoken2 = __toESM(require("jsonwebtoken"), 1);
var auth = (...roles) => {
  return async (req, res, next) => {
    try {
      const token = req.headers.authorization;
      if (!token) {
        res.status(401).json({
          success: false,
          message: "Unauthorized access!"
        });
      }
      const decoded = import_jsonwebtoken2.default.verify(token, config_default.JWT_ACCESSTOKEN_SECRET);
      const userData = await pool.query(`
    
    SELECT * FROM users WHERE email = $1
 `, [decoded?.email]);
      if (userData.rows.length === 0) {
        return res.status(401).json({
          success: false,
          message: "Unauthorized access!"
        });
      }
      if (roles.length && !roles.includes(userData.rows[0].role)) {
        return res.status(403).json({
          success: false,
          message: "Forbidden access!"
        });
      }
      req.user = decoded;
      next();
    } catch (error) {
      next(error);
    }
  };
};
var auth_default = auth;

// src/module/issues/issues.route.ts
var router2 = (0, import_express2.Router)();
router2.post("/issues", auth_default(USER_ROLE.contributor, USER_ROLE.maintainer), IssuesController.createIssues);
router2.put("/issues/:id", auth_default(USER_ROLE.contributor, USER_ROLE.maintainer), IssuesController.updateIssue);
router2.get("/issues", IssuesController.getAllIssues);
router2.get("/issues/:id", IssuesController.getSingleIssue);
router2.delete("/issues/:id", auth_default(USER_ROLE.maintainer), IssuesController.deleteIssue);
var issuesRoute = router2;

// src/middleware/globalErrorHandler.ts
var globalErrorHandler = (err, req, res, next) => {
  res.status(500).json({
    success: false,
    message: err.message || "Internal Server Error"
  });
};
var globalErrorHandler_default = globalErrorHandler;

// src/app.ts
var app = (0, import_express3.default)();
app.use((0, import_cookie_parser.default)());
app.use(import_express3.default.json());
app.use(import_express3.default.urlencoded({ extended: true }));
app.use((0, import_cors.default)({ origin: "*" }));
app.get("/", (req, res) => {
  res.status(200).json({ message: "server is working fine" });
});
app.use("/api/auth", AuthRouter);
app.use("/api", issuesRoute);
app.use(globalErrorHandler_default);
var app_default = app;

// src/server.ts
var main = () => {
  db_default();
  app_default.listen(config_default.PORT, () => {
    console.log(`Example app listening on port ${config_default.PORT}`);
  });
};
main();
//# sourceMappingURL=server.cjs.map