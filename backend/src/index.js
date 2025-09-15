import express from 'express';
import { supabase } from './supabaseClient.js';

const app = express();
app.use(express.json());

app.get('/health', (_req, res) => res.json({ ok: true }));

// quick Supabase test — reads up to 5 rows from "posts" (create the table later if not present)
app.get('/supabase-test', async (_req, res) => {
  try {
    const { data, error } = await supabase.from('posts').select('id, title').limit(5);
    if (error) return res.status(500).json({ error: error.message });
    res.json({ data });
  } catch (err) {
    res.status(500).json({ error: err.message || String(err) });
  }
});

const port = process.env.PORT || 4000;
app.listen(port, () => console.log(`Server listening on http://localhost:${port}`));
