import { createRouteHandler } from "uploadthing/next";
import { ourFileRouter } from "./core";
 
// This creates the actual API endpoints:
// GET  /api/uploadthing - Used by UploadThing to fetch your router config
// POST /api/uploadthing - Used to handle the actual file upload process
export const { GET, POST } = createRouteHandler({
  router: ourFileRouter,
});