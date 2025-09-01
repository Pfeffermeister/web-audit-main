import type { A11yCategory, A11yCriterion } from "../lib/types";


export function A11yAccordion({ categories }: { categories: A11yCategory[] }) {
    return (
        <div className="space-y-4">
            {categories.map((cat) => {
                const s = summarize(cat.criteria);
                return (
                    <details key={cat.id} className="overflow-hidden rounded-xl border border-slate-200 bg-white shadow-sm">
                        <summary className="flex cursor-pointer list-none items-center gap-3 px-4 py-3">
                            <span className="text-base font-semibold">{cat.label} ({cat.criteria.length})</span>
                            <span className="ml-1 rounded-full bg-sky-100 px-2 py-0.5 text-xs font-medium text-sky-800">{s.score}%</span>
                            <div className="ml-auto flex items-center gap-4 text-xs text-gray-600">
                                <span><strong>{s.passed}</strong> bestanden</span>
                                <span><strong>{s.failed}</strong> fehlgeschlagen</span>
                                <div className="h-2 w-28 rounded-full bg-gray-200">
                                    <div className="h-2 rounded-full bg-sky-500" style={{ width: `${s.score}%` }} />
                                </div>
                            </div>
                        </summary>
                        <div className="px-4 pb-4">
                            <div className="space-y-2">
                                {cat.criteria.map((c) => (<CriterionRow key={c.id} c={c} />))}
                            </div>
                        </div>
                    </details>
                );
            })}
        </div>
    );
}


function CriterionRow({ c }: { c: A11yCriterion }){
    // Erweiterte Icon und Farb-Logik für alle fünf Status - mit denselben Icons wie in der Übersicht
    const getStatusDisplay = (status: string) => {
        switch(status) {
            case "pass":
                return { icon: "✅", tone: "text-emerald-700 border-emerald-700" };
            case "fail":
                return { icon: "❌", tone: "text-rose-700 border-rose-700" };
            case "untested":
                return { icon: "⚠️", tone: "text-amber-700 border-amber-700" };
            case "inapplicable":
                return { icon: "➖", tone: "text-purple-700 border-purple-700" };
            case "incomplete":
                return { icon: "🔍", tone: "text-orange-700 border-orange-700" };
            default:
                return { icon: "⚠️", tone: "text-amber-700 border-amber-700" };
        }
    };

    const { icon, tone } = getStatusDisplay(c.status);

    return (
        <details className="rounded-lg border border-slate-100 bg-slate-50 p-3">
            <summary className="flex cursor-pointer list-none items-start justify-between gap-3">
                <div className="flex items-start gap-2">
                    <span aria-hidden>{icon}</span>
                    <div>
                        <div className="font-medium">{c.title}</div>
                        {c.description && <div className="text-xs text-gray-600">{c.description}</div>}
                        {/* Link direkt sichtbar ohne Ausklappen */}
                        {c.link && (
                            <a
                                href={c.link}
                                target="_blank"
                                rel="noopener noreferrer"
                                className="inline-flex items-center gap-1 mt-1 text-xs text-blue-600 hover:text-blue-800 hover:underline"
                                onClick={(e) => e.stopPropagation()} // Verhindere, dass das Details-Element auf-/zugeklappt wird
                            >
                                <svg className="h-3 w-3" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10 6H6a2 2 0 00-2 2v10a2 2 0 002 2h10a2 2 0 002-2v-4M14 4h6m0 0v6m0-6L10 14" />
                                </svg>
                                {c.linkText || 'Leitfaden'}
                            </a>
                        )}
                    </div>
                </div>
                <span className={`rounded-full border px-2 py-0.5 text-xs whitespace-nowrap ${tone}`}>{labelFor(c.status)}</span>
            </summary>
            <div className="mt-2 space-y-2 text-sm text-gray-700">
                {c.wcag && c.wcag.length > 0 && (<p className="text-xs text-gray-500">WCAG: {c.wcag.join(", ")}</p>)}
                {c.advice && (<div className="rounded-md border border-amber-200 bg-amber-50 p-2 text-amber-800"><strong>Empfehlung:</strong> {c.advice}</div>)}
                {c.checked && c.checked.length > 0 && (
                    <div>
                        <div className="mb-2 text-xs font-semibold uppercase tracking-wide text-gray-500">Geprüfte Elemente</div>
                        <div className="space-y-2">
                            {c.checked.map((e, i) => (
                                <div key={i} className="grid grid-cols-1 lg:grid-cols-2 gap-3 p-3 border border-gray-200 rounded-lg bg-gray-50">
                                    {/* Target/Selector Spalte */}
                                    <div>
                                        <div className="text-xs font-medium text-gray-600 mb-1">CSS-Selektor:</div>
                                        {e.selector ? (
                                            <code className="block rounded bg-blue-50 border border-blue-200 px-2 py-1 text-sm text-blue-800 break-all">
                                                {e.selector}
                                            </code>
                                        ) : (
                                            <span className="text-gray-400 text-sm italic">Kein Selektor verfügbar</span>
                                        )}
                                    </div>

                                    {/* HTML/Text Spalte */}
                                    <div>
                                        <div className="text-xs font-medium text-gray-600 mb-1">HTML-Element:</div>
                                        {e.text ? (
                                            <code className="block rounded bg-green-50 border border-green-200 px-2 py-1 text-sm text-green-800 break-all max-h-20 overflow-y-auto">
                                                {e.text}
                                            </code>
                                        ) : (
                                            <span className="text-gray-400 text-sm italic">Kein HTML-Code verfügbar</span>
                                        )}
                                    </div>

                                    {/* Dokumentations-Link falls vorhanden */}
                                    {e.src && (
                                        <div className="lg:col-span-2 mt-2 pt-2 border-t border-gray-300">
                                            <div className="text-xs font-medium text-gray-600 mb-1">Axe Core Dokumentation:</div>
                                            <a
                                                href={e.src}
                                                target="_blank"
                                                rel="noopener noreferrer"
                                                className="inline-flex items-center gap-1 text-xs text-blue-600 hover:text-blue-800 hover:underline"
                                            >
                                                <svg className="h-3 w-3" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10 6H6a2 2 0 00-2 2v10a2 2 0 002 2h10a2 2 0 002-2v-4M14 4h6m0 0v6m0-6L10 14" />
                                                </svg>
                                                Zur Dokumentation
                                            </a>
                                        </div>
                                    )}
                                </div>
                            ))}
                        </div>
                    </div>
                )}
            </div>
        </details>
    );
}


function labelFor(s: "pass"|"fail"|"untested"|"inapplicable"|"incomplete"){
    switch(s) {
        case "pass": return "Bestanden";
        case "fail": return "Nicht Bestanden";
        case "untested": return "Nicht getestet";
        case "inapplicable": return "Nicht anwendbar";
        case "incomplete": return "Unvollständig";
        default: return "Unbekannt";
    }
}


function summarize(items: A11yCriterion[]){
    const passed = items.filter(i=>i.status==="pass").length;
    const failed = items.filter(i=>i.status==="fail").length;
    const warnings = items.filter(i=>i.status==="untested").length;
    const incomplete = items.filter(i=>i.status==="incomplete").length;

    // Berechne Score nur basierend auf bestanden + fehlgeschlagen (ignoriere untested, inapplicable und incomplete)
    const testableTotal = passed + failed;
    const score = testableTotal > 0 ? Math.round((passed / testableTotal) * 100) : 0;

    return { total: items.length, passed, warnings, failed, incomplete, score };
}
