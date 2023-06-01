const auth_code = () => {
  const chars =
    "ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789";
  let randomString = "";
  for (let i = 0; i < 8; i++) {
    let randomIndex = Math.floor(Math.random() * chars.length);
    randomString += chars.charAt(randomIndex);
  }
  return randomString;
};

module.exports = auth_code;
