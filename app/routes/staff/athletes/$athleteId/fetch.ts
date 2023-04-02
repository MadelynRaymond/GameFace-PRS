import type { ActionArgs} from "@remix-run/node";
import { json } from "@remix-run/node";
import invariant from "tiny-invariant";
import { z } from "zod";
import { getAthleteReport } from "~/models/athlete-report.server";
import { getEntriesOnReport } from "~/models/drill-entry.server";

export async function action({request}: ActionArgs) {
  const formData = await request.formData()

  const id = formData.get('id')
  if (!id) return null
  
  const report = await getAthleteReport(parseInt(id as string))

  invariant(report, "Report should exists")

  const formatDate= z.coerce.date().transform(d => d.toISOString().substring(0, 10))
  const formattedDate = formatDate.parse(report.created_at)

  return json({entries: report.entries, created_at: formattedDate})

}