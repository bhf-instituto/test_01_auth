import dbConnection from '../config/connectionMySQL.js'

export const dbStatus = async (req, res) => {
  try {
    const [rows] = await dbConnection.query("SELECT 1");
    res.json({ ok: true });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
};
