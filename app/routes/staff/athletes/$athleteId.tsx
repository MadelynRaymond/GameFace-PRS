import type { ActionArgs, LoaderArgs } from '@remix-run/node'
import { redirect } from '@remix-run/node'
import { json, Response } from '@remix-run/node'
import { Form, useActionData, useFetcher, useLoaderData } from '@remix-run/react'
import React from 'react'
import invariant from 'tiny-invariant'
import { getAthleteWithReports } from '~/models/athlete.server'
import { getDrills } from '~/models/drill.server'
import { getExerciseCategories } from '~/models/exercise-category.server'
import qs from 'qs'
import { createEntryOnReport } from '~/models/drill-entry.server'
import { createAthleteReport } from '~/models/athlete-report.server'
import { z, ZodError } from 'zod'
import { toDateString } from '~/util'
import { requireStaff } from '~/session.server'

const EntrySchema = z.object({
    unit: z.string(),
    value: z.coerce.number().gt(0),
    outOf: z.optional(z.coerce.number().gt(0)),
    drillId: z.coerce.number(),
    userId: z.coerce.number(),
})

export const EntriesSchema = z.object({
    entries: z.array(EntrySchema),
})

export type Entry = z.infer<typeof EntrySchema>
type FormActivity = { mode: 'edit' | 'new'; selectedReportId?: number }
//type EntryErrors = z.inferFlattenedErrors<typeof EntrySchema>

export async function loader({ request, params }: LoaderArgs) {
    await requireStaff(request)
    invariant(params.athleteId, 'Not athlete id in params')

    const athleteId = parseInt(params.athleteId)

    const [athlete, categories, drills] = await Promise.all([getAthleteWithReports(athleteId), getExerciseCategories(), getDrills()])

    if (!athlete) {
        throw new Response('Not Found', { status: 404 })
    }

    return json({
        reports: athlete.reports,
        athlete,
        categories,
        drills,
    })
}
export async function action({ request, params }: ActionArgs) {
    invariant(params.athleteId, 'No athlete Id')

    const athleteId = parseInt(params.athleteId)
    const text = await request.text()
    const jsonData = qs.parse(text) as unknown

    const result = await EntriesSchema.safeParseAsync(jsonData)

    if (!result.success) {
        if (result.error instanceof ZodError) {
            return json({ errors: 'Please fill all required fields' })
        }
    }

    invariant(result.success, 'This should not happen')

    const formData = result.data
    const report = await createAthleteReport(athleteId)
    await createEntryOnReport(report.id, formData.entries)

    return redirect('/staff/athletes')
}
type DrillUnit = 'integral' | 'decimal' | 'time'

export default function AthleteDetails() {
    const { drills, categories, reports, athlete } = useLoaderData<typeof loader>()
    const actionData = useActionData<typeof action>()

    //drill categories
    const [category, setCategory] = React.useState<number>(0)
    const reportQuery = useFetcher()

    //set action to edit or new report
    function formModeReducer(state: FormActivity, action: { type: 'change_mode'; payload?: number }): FormActivity {
        if (action.type === 'change_mode' && action.payload) {
            return action.payload === state.selectedReportId ? { mode: 'new', selectedReportId: undefined } : { mode: 'edit', selectedReportId: action.payload }
        }

        throw Error('Unknown action')
    }

    //hook for reducer
    const [state, dispatch] = React.useReducer(formModeReducer, { mode: 'new' })
    const formRef = React.useRef<HTMLFormElement>(null)

    function handleReportClick(reportId: number) {
        dispatch({ type: 'change_mode', payload: reportId })

        populateReport(reportId)
    }

    function populateReport(reportId: number) {
        reportQuery.submit({ id: reportId.toString() }, { method: 'post', action: `/staff/athletes/${athlete.id}/fetch` })
    }

    return (
        <div className="athlete-overview-container">
            <div className="athlete-reports">
                <div className="report-list">
                    {reports.map((report) => (
                        <Report
                            key={report.id}
                            id={report.id}
                            createdAt={report.created_at}
                            athleteFirstName={athlete.profile?.firstName}
                            athleteLastName={athlete.profile?.lastName}
                            handleReportClick={handleReportClick}
                        />
                    ))}
                </div>
            </div>
            <div className="athlete-report-form">
                <select style={{ marginBottom: '1rem' }} onChange={(e) => setCategory(parseInt(e.currentTarget.value))} name="" id="">
                    <option value="0">Filter Category</option>
                    {categories.map((category) => (
                        <option key={category.id} value={category.id}>
                            {category.name}
                        </option>
                    ))}
                </select>
                <Form method="post" ref={formRef} action={state.mode === 'new' ? `/staff/athletes/${athlete.id}` : `${state.selectedReportId}`}>
                    {drills.map((drill, i) => (
                        <EntryField
                            visible={drill.categoryId === category || category === 0}
                            key={drill.id}
                            id={drill.id}
                            index={i}
                            drillName={drill.name}
                            drillUnit={drill.drillUnit as DrillUnit}
                            valueDefault={reportQuery.data?.entries.find((e: Entry) => e.drillId === drill.id).value || undefined}
                            outOfDefault={reportQuery.data?.entries.find((e: Entry) => e.drillId === drill.id).outOf || undefined}
                            formMode={state.mode}
                        />
                    ))}
                    <button type="submit">Submit</button>
                    <span className="error-text">{actionData?.errors}</span>
                </Form>
            </div>
        </div>
    )
}

function Report({
    id,
    createdAt,
    athleteFirstName,
    athleteLastName,
    handleReportClick,
}: {
    id: number
    athleteFirstName?: string
    athleteLastName?: string
    createdAt: string
    handleReportClick: (id: number) => void
}) {
    return (
        <div onClick={() => handleReportClick(id)} className="athlete-report">
            <p>{id}</p>
            <p>
                {athleteFirstName} {athleteLastName}
            </p>
            <p>{toDateString(createdAt)}</p>
        </div>
    )
}

function EntryField({
    drillName,
    drillUnit,
    visible,
    id,
    index,
    valueDefault,
    outOfDefault,
    formMode,
}: {
    drillName: string
    drillUnit: DrillUnit
    visible: boolean
    id: number
    index: number
    valueDefault?: string | number
    outOfDefault?: string | number
    formMode: 'edit' | 'new'
}) {
    const value = React.useRef<HTMLInputElement | null>(null)
    const second = React.useRef<HTMLInputElement | null>(null)
    const { athlete } = useLoaderData<typeof loader>()

    const normalizeLabels = () => {
        const labelMap = {
            integral: ['Score', 'Out Of'],
            decimal: ['Score', 'none'],
            time: ['Time', 'none'],
        }
        return labelMap[drillUnit]
    }

    const normalizeValues = () => {
        const valueMap = {
            integral: ['value', 'outOf'],
            decimal: ['value', 'none'],
            time: ['value', 'none'],
        }

        return valueMap[drillUnit]
    }

    const [fieldOne, fieldTwo] = normalizeLabels()
    const [valueOne, valueTwo] = normalizeValues()

    return (
        <div style={{ display: `${visible ? 'block' : 'none'}` }}>
            <p className="bold">{drillName}</p>
            <input type="hidden" name={`entries[${index}][userId]`} value={athlete.id} />
            <input type="hidden" name={`entries[${index}][unit]`} value={drillUnit} />
            <input type="hidden" name={`entries[${index}][drillId]`} value={id} />
            <div className="flex gap-2">
                <div className="w-full">
                    <label htmlFor="score">{fieldOne}</label>
                    <input
                        ref={value}
                        type="number"
                        name={`entries[${index}][${valueOne}]`}
                        defaultValue={formMode === 'edit' ? valueDefault : undefined}
                        id=""
                    />
                </div>
                {fieldTwo !== 'none' && (
                    <div className="w-full">
                        <label htmlFor="out-of">{fieldTwo}</label>
                        <input
                            ref={second}
                            type="number"
                            name={`entries[${index}][${valueTwo}]`}
                            defaultValue={formMode === 'edit' ? outOfDefault : undefined}
                            id=""
                        />
                    </div>
                )}
            </div>
        </div>
    )
}
