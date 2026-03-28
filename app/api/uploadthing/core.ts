import { createUploadthing, type FileRouter } from "uploadthing/next";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";

const f = createUploadthing();

export const ourFileRouter = {
  // We define a route called "evidenceUploader"
  evidenceUploader: f({
    // Allow images up to 4MB (for camera/photos)
    image: { maxFileSize: "4MB", maxFileCount: 1 },
    // Allow PDFs and Word docs up to 8MB
    pdf: { maxFileSize: "8MB", maxFileCount: 1 },
    blob: { maxFileSize: "8MB", maxFileCount: 1 },
  })
    // This middleware runs on your server before the upload happens
    .middleware(async () => {
      const session = await getServerSession(authOptions);

      // If no session, throw an error to stop the upload
      if (!session || !session.user) throw new Error("Unauthorized");

      // Whatever is returned here is accessible in onUploadComplete as "metadata"
      return { userId: (session.user as any).id };
    })
    .onUploadComplete(async ({ metadata, file }) => {
      // This code runs on your server AFTER the upload is successful
      console.log("Upload complete for userId:", metadata.userId);
      console.log("File URL:", file.url);

      // We return this so the client knows it worked
      return { uploadedBy: metadata.userId, url: file.url };
    }),
} satisfies FileRouter;

export type OurFileRouter = typeof ourFileRouter;