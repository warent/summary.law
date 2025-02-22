import { Elysia, t } from "elysia";
import prisma from "./db";
import { summarizePDFs } from "./utils";

const COURTLISTENER_RECAP_DOCUMENT_URL = "https://www.courtlistener.com/api/rest/v4/recap-documents/";
const COURTLISTENER_STORAGE_URL = "https://storage.courtlistener.com/";

const app = new Elysia()
  .group("/v1", app => app
    .get("/summary/:docketId", async ({ params }) => {
      // Validate docketId is a number
      if (isNaN(Number(params.docketId))) {
        return {
          error: "Docket ID must be a number"
        }
      }
      const summary = await prisma.summary.findMany({
        where: {
          docketId: Number(params.docketId)
        }
      })
      return summary
    })
    .post("/summary/:docketId", async ({ params, body }) => {
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
        .map((doc: any) => doc.filepath_local)
        .filter(Boolean);

      const files = await Promise.all(filePaths.map(async (filePath: string) => {
        const fileResponse = await fetch(`${COURTLISTENER_STORAGE_URL}${filePath}`, {
          headers: {
            'Authorization': `Token ${process.env.COURTLISTENER_API_KEY}`
          }
        });
        const arrayBuffer = await fileResponse.arrayBuffer();
        const base64 = Buffer.from(arrayBuffer).toString('base64');
        return base64;
      }));

      const summary = await summarizePDFs(files);
      return summary;
    }, {
      body: t.Object({
        pacerDocumentIds: t.Array(t.String())
      })
    })
  )
  .listen(3000);

console.log(
  `🦊 Elysia is running at ${app.server?.hostname}:${app.server?.port}`
);

