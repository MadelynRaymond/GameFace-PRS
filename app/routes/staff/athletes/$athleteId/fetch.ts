import type { ActionArgs} from "@remix-run/node";
import { json } from "@remix-run/node";
import { getEntriesOnReport } from "~/models/drill-entry.server";

export async function action({request}: ActionArgs) {
  const formData = await request.formData()

  const id = formData.get('id')
  if (!id) return null

  const entries = await getEntriesOnReport(parseInt(id as string))
  return json({entries})

}