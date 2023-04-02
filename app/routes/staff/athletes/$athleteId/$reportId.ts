import type { ActionArgs} from '@remix-run/node';
import { redirect } from '@remix-run/node'
import { json } from '@remix-run/node'
import qs from 'qs'
import invariant from 'tiny-invariant'
import { ZodError } from 'zod'
import { updateAthleteReport } from '~/models/athlete-report.server'
import { AthleteFormData } from '../$athleteId'

export async function action({ request, params }: ActionArgs) {
    invariant(params.reportId, 'No athlete Id')

    const reportId = parseInt(params.reportId)
    const text = await request.text()
    const jsonData = qs.parse(text) as unknown

    const result = await AthleteFormData.safeParseAsync(jsonData)

    if (!result.success) {
        if (result.error instanceof ZodError) {
            return json({ errors: 'Please fill all required fields' })
        }
    }

    invariant(result.success, 'This should not happen')

    const formData = result.data

    await updateAthleteReport(reportId, formData.entries)

    return redirect('/staff/athletes')
}
