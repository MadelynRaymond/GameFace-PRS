export default function ReportCardHeader({header, firstName, lastName, dispatch}: {header: string, firstName?: string, lastName?: string, dispatch: any}) {
    return (
        <div className="report-card-header">
            <div className="report-card-title">
                <h2>{header}</h2>
                <p>Athlete: {firstName} {lastName}</p>
            </div>
            <div className="button-group">
                <p className="filter-heading">Select Filter:</p>
                <div className="filter-button-group">
                    <button onClick={() => dispatch({ type: 'update', payload: 30 })} className="filter-button month">
                        Month
                    </button>
                    <button onClick={() => dispatch({ type: 'update', payload: 365 })} className="filter-button year">
                        Year
                    </button>
                    <button onClick={() => dispatch({ type: 'update' })} className="filter-button lifetime">
                        Lifetime
                    </button>
                </div>
            </div>
        </div>
    )
}
