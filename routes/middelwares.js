const date_format = (date_raw) => {
  let year = date_raw.getFullYear();
  let month = ("0" + (date_raw.getMonth() + 1)).slice(-2);
  let day = ("0" + date_raw.getDate()).slice(-2);
  let dateString = year + "-" + month + "-" + day;
  return dateString;
};

const parse_rrno_get_birth = (rrno_raw) => {
  let split = rrno_raw.split("-");
  let birth = split[0];
  return birth;
};

module.exports = { date_format, parse_rrno_get_birth };
