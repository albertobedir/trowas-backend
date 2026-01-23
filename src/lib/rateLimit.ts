import { RateLimiterMemory } from "rate-limiter-flexible";

const rateLimiter = new RateLimiterMemory({
  points: 5, // Her IP için 5 istek
  duration: 10, // 10 saniyede 5 istek
});

const isDevelopment = process.env.NODE_ENV === "development";

export const rateLimit = async (req: Request) => {
  //   if (isDevelopment) {
  //     return;
  //   }

  const ip =
    req.headers.get("x-forwarded-for")?.split(",")[0] ||
    req.headers.get("remoteAddress");

  if (!ip) {
    throw new Error("Unable to determine IP address");
  }

  try {
    await rateLimiter.consume(ip);
  } catch (error) {
    throw new Error("Too many requests, please try again later.");
  }
};
