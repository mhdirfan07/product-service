// Middleware untuk memastikan hanya admin yang dapat melakukan operasi tertentu
function verifyAdmin(req, res, next) {
  // Verifikasi apakah role adalah admin
  if (req.user.role !== "admin") {
    return res
      .status(403)
      .send({
        message: "Access denied. You must be an admin to perform this action.",
      });
  }

  next(); // Jika role adalah admin, lanjutkan ke route berikutnya
}

module.exports = verifyAdmin;