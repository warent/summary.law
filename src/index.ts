import { Elysia, t } from "elysia";
import prisma from "./db";
import { summarizePDFs } from "./utils";

const COURTLISTENER_RECAP_DOCUMENT_URL = "https://www.courtlistener.com/api/rest/v4/recap-documents/";
const COURTLISTENER_STORAGE_URL = "https://storage.courtlistener.com/";

const app = new Elysia()
  .group("/api/v1", app => app
    .get("/summary/:pacerCaseId", async ({ params }) => {
      const summary = await prisma.summary.findMany({
        where: {
          pacerCaseId: params.pacerCaseId
        }
      })
      return summary
    })
    .post("/summary/:pacerCaseId", async ({ params, body, headers, set }) => {
      // Get the API Key from the authorization header
      const apiKey = headers.authorization;
      if (!apiKey) {
        set.status = 401
        return {
          error: "API Key is required"
        }
      }

      // Check if the API Key is valid
      const validApiKey = await prisma.apiKey.findUnique({
        where: {
          key: apiKey
        }
      })
      if (!validApiKey) {
        set.status = 401
        return {
          error: "Invalid API Key"
        }
      }

      const documents = await Promise.all(body.pacerDocumentIds.map(async (pacerDocumentId: string) => {
        const response = await fetch(`${COURTLISTENER_RECAP_DOCUMENT_URL}?pacer_doc_id=${pacerDocumentId}`, {
          headers: {
            'Authorization': `Token ${process.env.COURTLISTENER_API_KEY}`
          }
        });
        return response.json()
      }))

      const filePaths: string[] = documents
        .flatMap((document: any) => document.results)
        .map((doc: any) => `${COURTLISTENER_STORAGE_URL}${doc.filepath_local}`)
        .filter(Boolean);

      const files = await Promise.all(filePaths.map(async (filePath: string) => {
        const fileResponse = await fetch(filePath, {
          headers: {
            'Authorization': `Token ${process.env.COURTLISTENER_API_KEY}`
          }
        });
        const arrayBuffer = await fileResponse.arrayBuffer();
        const base64 = Buffer.from(arrayBuffer).toString('base64');
        return base64;
      }));

      const { summary, curationScore } = await summarizePDFs(files);

      await prisma.summary.create({
        data: {
          pacerCaseId: params.pacerCaseId,
          fullSummary: summary,
          pacerDocumentIds: body.pacerDocumentIds,
          documentUrls: filePaths,
          curationScore
        }
      })

      return {
        summary,
        curationScore
      }
    }, {
      body: t.Object({
        pacerDocumentIds: t.Array(t.String())
      })
    })
  )
  .listen(process.env.PORT || 3000);

console.log(
  `🦊 Elysia is running at ${app.server?.hostname}:${app.server?.port}`
);

