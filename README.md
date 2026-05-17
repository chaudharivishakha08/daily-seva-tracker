# Shri Swami Samarth - Seva Poll App

This app now uses a shared `data.json` file through a small Node.js server, so all users who open the app through that server can see the same students and responses.

## Files

```text
seva-tracker/
|-- add-student.html
|-- config.js
|-- daily.html
|-- data.json
|-- index.html
|-- package.json
|-- poll.html
|-- results.html
|-- server.js
|-- style.css
`-- README.md
```

## How it works

- `server.js` serves the HTML files and exposes API endpoints.
- `data.json` stores:
  - `extraStudents`
  - `responses`
- Every user sees the same data as long as they open the app from the same running server.

## Run the app locally

1. Open a terminal in this folder.
2. Run:

```bash
npm start
```

3. Open [http://localhost:3000](http://localhost:3000)

## Shared storage behavior

- One student can have one response per day.
- If the same student submits again on the same date, the record is updated.
- Added students are saved in `data.json` and become visible to all users.

## Important

- Users must open the app through the Node server, not by double-clicking `index.html`.
- If you want other devices on the same network to use it, open the server machine's IP on port `3000`.

## Render deployment note

For Render, set `DATA_DIR=/var/data` and attach a persistent disk mounted at `/var/data`.
That keeps `data.json` safe across restarts and redeploys.
