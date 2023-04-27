import type { ActionArgs, LoaderArgs} from '@remix-run/node';
import { redirect } from '@remix-run/node'
import { json } from '@remix-run/node'
import qs from 'qs'
import invariant from 'tiny-invariant'
import { ZodError } from 'zod'
import { updateAthleteReport } from '~/models/athlete-report.server'
import { AthleteFormData } from '../$athleteId'

export async function loader({request, params}: LoaderArgs) {
    console.log(params.athleteId)
    return redirect(`/staff/athletes/${params.athleteId}`)
}

export async function action({ request, params }: ActionArgs) {
    invariant(params.reportId, 'No athlete Id')

    const reportId = parseInt(params.reportId)
    const text = await request.text()
    const jsonData = qs.parse(text) as unknown

    const result = await AthleteFormData.safeParseAsync(jsonData)

    if (!result.success) {
        if (result.error instanceof ZodError) {
            return json({ errors: 'Please fix form errors' })
        }
    }

    invariant(result.success, 'This should not happen')

    const formData = result.data

    await updateAthleteReport(reportId, formData)

    console.log('REACHED')

    return redirect('/staff/athletes')
}
