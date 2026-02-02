import ipaddr from "ipaddr.js";

export function getClientIp(req) {
  const xf = req.headers["x-forwarded-for"];
  if (xf) {
    const first = String(xf).split(",")[0].trim();
    return first;
  }

  return req.ip || req.connection?.remoteAddress || "";
}

export function ipInCidrs(ip, cidrs = []) {
  if (!ip) return false;

  if (ip.startsWith("::ffff:")) ip = ip.replace("::ffff:", "");

  let addr;
  try {
    addr = ipaddr.parse(ip);
  } catch {
    return false;
  }

  return cidrs.some((cidr) => {
    try {
      const [range, prefix] = ipaddr.parseCIDR(cidr);
      return addr.match(range, prefix);
    } catch {
      return false;
    }
  });
}
