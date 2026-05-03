require('dotenv').config();

const express    = require('express');
const cors       = require('cors');
const multer     = require('multer');
const path       = require('path');
const fs         = require('fs');
const pool       = require('./db');

const app  = express();
const PORT = process.env.PORT || 5000;

// ─── Middleware ────────────────────────────────────────────────────────────────
app.use(cors({
  origin: ['http://localhost:5173', 'http://localhost:5174'],
  credentials: true,
}));
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

// Serve uploaded profile pictures statically
const uploadsDir = path.join(__dirname, 'uploads');
if (!fs.existsSync(uploadsDir)) fs.mkdirSync(uploadsDir, { recursive: true });
app.use('/uploads', express.static(uploadsDir));

// ─── Multer (profile picture uploads) ─────────────────────────────────────────
const storage = multer.diskStorage({
  destination: (req, file, cb) => cb(null, uploadsDir),
  filename:    (req, file, cb) => {
    const ext      = path.extname(file.originalname).toLowerCase();
    const fileName = `${Date.now()}_${Math.random().toString(36).slice(2)}${ext}`;
    cb(null, fileName);
  },
});

const fileFilter = (req, file, cb) => {
  const allowed = ['image/jpeg', 'image/png', 'image/gif', 'image/webp'];
  if (allowed.includes(file.mimetype)) {
    cb(null, true);
  } else {
    cb(new Error('Invalid file type. Only JPG, PNG, GIF, and WEBP are allowed.'));
  }
};

const upload = multer({
  storage,
  fileFilter,
  limits: { fileSize: 3 * 1024 * 1024 }, // 3MB
});

// ─── Helper: get user_id from request ─────────────────────────────────────────
// TEST MODE: hardcoded to TEST_USER_ID in .env (defaults to 1).
// Replace with real auth (JWT, session, etc.) when ready.
const TEST_USER_ID = parseInt(process.env.TEST_USER_ID, 10) || 1;

function getUserId(_req) {
  return TEST_USER_ID;
}

// ─── Routes ───────────────────────────────────────────────────────────────────

/**
 * GET /api/get-profile
 * Returns the logged-in user's profile, education, and projects.
 */
app.get('/api/get-profile', async (req, res) => {
  const user_id = getUserId(req);
  if (!user_id) return res.status(401).json({ success: false, message: 'Not logged in' });

  try {
    // User base info
    const userResult = await pool.query(
      'SELECT first_name, last_name, role FROM users WHERE id = $1',
      [user_id]
    );
    if (userResult.rows.length === 0) {
      return res.status(404).json({ success: false, message: 'User not found' });
    }
    const user = userResult.rows[0];

    // Profile details
    const profileResult = await pool.query(
      'SELECT name, headline, location, about, profile_pic FROM user_profiles WHERE id = $1',
      [user_id]
    );
    const profile = profileResult.rows[0] || {};

    // Education
    const eduResult = await pool.query(
      'SELECT id, title, description FROM education WHERE user_id = $1 ORDER BY id DESC',
      [user_id]
    );

    // Projects
    const projResult = await pool.query(
      'SELECT id, project_name AS title, description FROM projects WHERE user_id = $1 ORDER BY id DESC',
      [user_id]
    );

    res.json({
      success:    true,
      name:       profile.name       || `${user.first_name} ${user.last_name}`,
      headline:   profile.headline   || '',
      location:   profile.location   || '',
      about:      profile.about      || '',
      profilePic: profile.profile_pic || null,
      role:       user.role          || 'Member',
      education:  eduResult.rows,
      projects:   projResult.rows,
    });

  } catch (err) {
    console.error('GET /api/get-profile error:', err);
    res.status(500).json({ success: false, message: 'Server error' });
  }
});

/**
 * POST /api/update-profile
 * Upserts profile info and optionally updates profile picture.
 */
app.post('/api/update-profile', upload.single('profilePic'), async (req, res) => {
  const user_id = getUserId(req);
  if (!user_id) return res.status(401).json({ success: false, message: 'Not logged in' });

  const { name, profession: headline, location, about } = req.body;
  const profilePic = req.file ? `uploads/${req.file.filename}` : null;

  try {
    // Update first_name in users table if name provided
    if (name) {
      await pool.query(
        'UPDATE users SET first_name = $1 WHERE id = $2',
        [name.split(' ')[0], user_id]
      );
    }

    // Upsert user_profiles
    await pool.query(
      `INSERT INTO user_profiles (id, name, headline, location, about, profile_pic)
       VALUES ($1, $2, $3, $4, $5, $6)
       ON CONFLICT (id) DO UPDATE SET
         name        = EXCLUDED.name,
         headline    = EXCLUDED.headline,
         location    = EXCLUDED.location,
         about       = EXCLUDED.about,
         profile_pic = COALESCE($6, user_profiles.profile_pic)`,
      [user_id, name || null, headline || '', location || '', about || '', profilePic]
    );

    res.json({ success: true });

  } catch (err) {
    console.error('POST /api/update-profile error:', err);
    res.status(500).json({ success: false, message: 'Server error' });
  }
});

/**
 * POST /api/add-education
 * Inserts a new education entry for the logged-in user.
 */
app.post('/api/add-education', async (req, res) => {
  const user_id = getUserId(req);
  if (!user_id) return res.status(401).json({ success: false, message: 'Not logged in' });

  const { title, description } = req.body;
  if (!title || !description) {
    return res.status(400).json({ success: false, message: 'All fields are required.' });
  }

  try {
    const result = await pool.query(
      'INSERT INTO education (user_id, title, description) VALUES ($1, $2, $3) RETURNING id',
      [user_id, title, description]
    );
    res.json({ success: true, id: result.rows[0].id });

  } catch (err) {
    console.error('POST /api/add-education error:', err);
    res.status(500).json({ success: false, message: 'Server error' });
  }
});

/**
 * POST /api/delete-education
 * Deletes an education entry belonging to the logged-in user.
 */
app.post('/api/delete-education', async (req, res) => {
  const user_id = getUserId(req);
  if (!user_id) return res.status(401).json({ success: false, message: 'Not logged in' });

  const id = parseInt(req.body.id, 10);
  if (!id) return res.status(400).json({ success: false, message: 'Invalid ID.' });

  try {
    await pool.query(
      'DELETE FROM education WHERE id = $1 AND user_id = $2',
      [id, user_id]
    );
    res.json({ success: true });

  } catch (err) {
    console.error('POST /api/delete-education error:', err);
    res.status(500).json({ success: false, message: 'Server error' });
  }
});

/**
 * POST /api/add-project
 * Inserts a new project for the logged-in user.
 */
app.post('/api/add-project', async (req, res) => {
  const user_id = getUserId(req);
  if (!user_id) return res.status(401).json({ success: false, message: 'Not logged in' });

  const { title, description } = req.body;
  if (!title || !description) {
    return res.status(400).json({ success: false, message: 'All fields are required.' });
  }

  try {
    const result = await pool.query(
      'INSERT INTO projects (user_id, project_name, description) VALUES ($1, $2, $3) RETURNING id',
      [user_id, title, description]
    );
    res.json({ success: true, id: result.rows[0].id });

  } catch (err) {
    console.error('POST /api/add-project error:', err);
    res.status(500).json({ success: false, message: 'Server error' });
  }
});

/**
 * POST /api/delete-project
 * Deletes a project belonging to the logged-in user.
 */
app.post('/api/delete-project', async (req, res) => {
  const user_id = getUserId(req);
  if (!user_id) return res.status(401).json({ success: false, message: 'Not logged in' });

  const id = parseInt(req.body.id, 10);
  if (!id) return res.status(400).json({ success: false, message: 'Invalid ID.' });

  try {
    await pool.query(
      'DELETE FROM projects WHERE id = $1 AND user_id = $2',
      [id, user_id]
    );
    res.json({ success: true });

  } catch (err) {
    console.error('POST /api/delete-project error:', err);
    res.status(500).json({ success: false, message: 'Server error' });
  }
});

// ─── Start ─────────────────────────────────────────────────────────────────────
app.listen(PORT, () => {
  console.log(`🚀 Y2O Profile API running at http://localhost:${PORT}`);
});