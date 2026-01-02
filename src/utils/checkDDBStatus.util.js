import dbConnection from '../config/connectionMySQL.js'

const checkDBStatus = async (req, res) => {
  try {
    const [rows] = await dbConnection.query("SELECT 1");
    res.json({ ok: true });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
};

export default checkDBStatus;