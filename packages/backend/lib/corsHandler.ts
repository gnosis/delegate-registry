import { VercelRequest, VercelResponse } from "@vercel/node"

export const handleCors = (req: VercelRequest, res: VercelResponse) => {
  res.setHeader("Access-Control-Allow-Credentials", "true")
  res.setHeader("Access-Control-Allow-Origin", "*")
  // replace '*' with your origin in production
  res.setHeader("Access-Control-Allow-Methods", "GET,OPTIONS")
  res.setHeader(
    "Access-Control-Allow-Headers",
    "X-Requested-With, Authorization, Accept, Content-Type",
  )

  if (req.method === "OPTIONS") {
    // Pre-flight request. Reply successfully:
    res.status(200).end()
    return true
  }
  return false
}
