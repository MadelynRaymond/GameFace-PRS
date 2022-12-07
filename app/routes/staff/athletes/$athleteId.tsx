import type { LoaderArgs } from "@remix-run/node";
import { json, Response } from "@remix-run/node";
import { useLoaderData } from "@remix-run/react";
import invariant from "tiny-invariant";
import { getAthleteWithReports } from "~/models/athlete.server";

export async function loader({request, params}: LoaderArgs) {
  invariant(params.athleteId, "Not athlete id in params")

  const athleteId = parseInt(params.athleteId)
  const athlete = await getAthleteWithReports(athleteId)

  if (!athlete) {
    throw new Response("Not Found", {status: 404})
  }

  return json({reports: athlete.reports, profile: athlete.profile})

}

export default function AthleteDetails() {

  const {reports, profile} = useLoaderData<typeof loader>()

  return (
    <div>
      <select id="mounth">
        <option value=""></option>
      </select> 
    </div>
  );
}