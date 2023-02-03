import { ActionArgs, json } from "@remix-run/node";
import invariant from "tiny-invariant";
import { getEntriesOnReport } from "~/models/drill-entry.server";

export async function action({request}: ActionArgs) {
  const formData = await request.formData()

  const id = formData.get('id')
  if (!id) return null

  const entries = await getEntriesOnReport(parseInt(id as string))
  return json({entries})

}