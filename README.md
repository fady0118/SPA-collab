## Video Request Platform

A single-page application (SPA) where users can submit and vote on video requests for a content creator.

---

### Overview

This repository is a small full‑stack project using Vanilla JavaScript for the client and Node.js + Express for the server, with MongoDB as the data store. It implements a request-and-vote workflow so users can suggest and vote on video ideas and an admin ("super user") can manage status and add a reference video link when a request is completed.

---

### Tech Stack

- **Frontend:** Vanilla JavaScript, Bootstrap (CDN)
- **Backend:** Node.js, Express
- **Database:** MongoDB (local or Atlas)
- **ORM:** Mongoose
- **Notes:** No frontend framework (React/Vue) is used — a lightweight SPA using hash-based routing

---

### Features

- Submit video requests (title, details, optional expected result, target level)
- Upvote / downvote requests (unique per user)
- Admin (super user) controls: change request status, delete requests, add final video link
- Light / dark theme toggle, search, sort and filter on the request list
- Simple authentication via `userId` in request bodies (see authMiddleware section)

---
### Quickstart (Local)

#### Environment

Create a `.env` in the project root with at least the following keys:

```env
PORT=4000
MongoDb_URI=mongodb://<user>:<password>@<host>:<port>/<db>?options...
```

**Note** 
the frontend expects the backend to be reachable at http://localhost:4000 by default (the client calls that host). Make sure `PORT` matches the client or update the client URLs in `clientSide` files.

#### Run server

The repo's `package.json` has a `dev` script (`node --env-file=.env --watch ./server.js`) 
or you can use a **dotenv** & **nodemon** instead of the experimental flags

#### Run frontend

The frontend is in `clientSide/`.
you can use 
1. use the backend server (recommended) 
`server.js` serves the frontend as static files, so the app runs at a single URL on PORT `http://localhost:4000`.
2. use a static live server like the VSCode Live Server to run it seperately.


#### Notes

- The project uses a simple `authMiddleware` that expects `userId` in request bodies. This is intentionally minimal for demo purposes but NOT secure for production.
- The `package.json` `dev` script uses `--env-file` which may not work on all Node versions. Use the alternatives above (dotenv or dotenv-cli) or update `package.json` to use `dotenv-cli` or `nodemon`.
