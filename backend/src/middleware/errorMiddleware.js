export default function errorHandler(err, req, res, next) {
  res.status(500).json({ error: "Something went wrong!" });
}