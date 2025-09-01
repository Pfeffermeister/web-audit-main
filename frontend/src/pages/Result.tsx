import React from "react";
import { useParams, Link } from "react-router-dom";
import { getGroup } from "../lib/jobs";
import { Tabs, Tab } from "../components/Tabs";
import { A11yAccordion } from "../components/A11yAccordion";
import { SEOAccordion, SEOHtmlDisplay, transformSEODataToSections } from "../components/SEOAccordion";
import ReactMarkdown from "react-markdown";
import rehypeRaw from "rehype-raw";
import rehypeSanitize from "rehype-sanitize";


function ShieldIcon() {
    return (
        <svg className="h-5 w-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m5.618-4.016A11.955 11.955 0 0112 2.944a11.955 11.955 0 01-8.618 3.04A12.02 12.02 0 003 9c0 5.591 3.824 10.29 9 11.622 5.176-1.332 9-6.031 9-11.622 0-1.042-.133-2.052-.382-3.016z" />
        </svg>
    );
}

function ChartIcon() {
    return (
        <svg className="h-5 w-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 19v-6a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2a2 2 0 002-2zm0 0V9a2 2 0 012-2h2a2 2 0 012 2v10m-6 0a2 2 0 002 2h2a2 2 0 002-2m0 0V5a2 2 0 012-2h2a2 2 0 012 2v14a2 2 0 01-2 2h-2a2 2 0 01-2-2z" />
        </svg>
    );
}

function DownloadIcon() {
    return (
        <svg className="h-5 w-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 16v2a2 2 0 002 2h12a2 2 0 002-2v-2M7 10l5 5 5-5M12 15V3" />
        </svg>
    );
}

export default function Result(){
    const { groupId } = useParams();
    const group = getGroup(groupId!);

    if (!group) return <div className="mt-8 rounded-xl bg-white p-6 text-rose-700">Unbekannte groupId</div>;

    const wcag = group.jobs.find(j=>j.kind==="wcag")?.[`wcag`];
    const seo = group.jobs.find(j=>j.kind==="seo")?.seo;
    const statement = group.jobs.find(j=>j.kind==="statement")?.statement;

    // Erstelle Tabs nur für ausgewählte Analysen
    const availableTabs: Tab[] = [];
    if (group.selected.wcag) {
        availableTabs.push({ id: "wcag", label: "Barrierefreiheit", icon: <ShieldIcon/> });
    }
    if (group.selected.seo) {
        availableTabs.push({ id: "seo", label: "SEO", icon: <ChartIcon/> });
    }

    // Debug: Logge die empfangenen Daten - Erweiterte Logs
    console.log('Debug - Group data:', group);
    console.log('Debug - All jobs:', group.jobs);
    console.log('Debug - SEO job:', group.jobs.find(j=>j.kind==="seo"));
    console.log('Debug - SEO data:', seo);
    console.log('Debug - SEO data type:', typeof seo);
    console.log('Debug - SEO data keys:', seo ? Object.keys(seo) : 'no seo data');
    console.log('Debug - Available tabs:', availableTabs.map(t => t.id));

    // Setze den ersten verfügbaren Tab als Standard
    const [tab, setTab] = React.useState<"wcag" | "seo">(
        availableTabs.length > 0 ? availableTabs[0].id as "wcag" | "seo" : "wcag"
    );

    // Transformiere SEO-Daten einmal außerhalb des Render-Blocks
    const seoSections = React.useMemo(() => {
        return transformSEODataToSections(seo);
    }, [seo]);

    // Erstelle eine Zusammenfassung basierend auf den n8n-Daten
    const createWcagSummary = (wcagData: any) => {
        if (!wcagData?.criteria) return "Keine Zusammenfassung vorhanden.";

        // Verwende die tatsächlichen Kriterien-Daten statt der summary
        const criteria = wcagData.criteria || [];

        // Debug: Schaue, was für Status-Werte wir haben
        console.log('WCAG Criteria Status Distribution:',
            criteria.reduce((acc: any, c: any) => {
                acc[c.status] = (acc[c.status] || 0) + 1;
                return acc;
            }, {})
        );

        // Nur Kriterien zählen, die tatsächlich von Axe getestet wurden (haben rules)
        const testedCriteria = criteria.filter((c: any) => c.rules && c.rules.length > 0);

        // Zähle die verschiedenen Status-Kategorien
        // Für untested nehmen wir alle Kriterien, nicht nur die mit rules
        const statusCounts = {
            passes: testedCriteria.filter((c: any) => c.status === 'pass').length,
            violations: testedCriteria.filter((c: any) => c.status === 'fail').length,
            untested: criteria.filter((c: any) => c.status === 'untested').length, // Alle untested, nicht nur getestete
            inapplicable: testedCriteria.filter((c: any) => c.status === 'inapplicable').length,
            incomplete: criteria.filter((c: any) => c.status === 'incomplete').length // Alle incomplete
        };

        // Berechne Score nur auf Basis der Pflicht-Kriterien (Level A und AA)
        // Nur Kriterien einbeziehen, die tatsächlich bewertbar sind (pass oder fail)
        const mandatoryCriteria = testedCriteria.filter((c: any) => {
            const level = (c.stufe || '').toLowerCase();
            const isApplicable = c.status === 'pass' || c.status === 'fail';
            return (level === 'a' || level === 'aa') && isApplicable;
        });

        const mandatoryPassed = mandatoryCriteria.filter((c: any) => c.status === 'pass').length;
        const mandatoryFailed = mandatoryCriteria.filter((c: any) => c.status === 'fail').length;
        const mandatoryTotal = mandatoryPassed + mandatoryFailed;
        const score = mandatoryTotal > 0 ? Math.round((mandatoryPassed / mandatoryTotal) * 100) : 0;

        const totalTested = statusCounts.passes + statusCounts.violations + statusCounts.inapplicable + statusCounts.incomplete;

        // Berechne Level-Verteilung nur für getestete Kriterien
        const levelCounts: Record<string, { total: number; passed: number }> = {};
        testedCriteria.forEach((c: any) => {
            const level = c.stufe || 'Unknown';
            if (!levelCounts[level]) {
                levelCounts[level] = { total: 0, passed: 0 };
            }
            levelCounts[level].total++;
            if (c.status === 'pass') {
                levelCounts[level].passed++;
            }
        });

        const analysisUrl = wcagData.meta?.url || group.url;
        const spacer = '\n\n<br/>\n\n'; // erzeugt einen sichtbaren Leerraum

        return `**Barrierefreiheits-Score: ${score}%** 
        
*Hinweis: Basiert auf bestandenen und fehlgeschlagenen Kriterien (Level A + AA)*
---
**${totalTested} Kriterien getestet** 

${spacer}

## Status-Übersicht:

✅ **${statusCounts.passes} Bestanden (passes)** 

❌ **${statusCounts.violations} Verstöße (violations)** 

➖ **${statusCounts.inapplicable} nicht anwendbar (inapplicable)** – 
*Regel trifft auf diesen Inhalt nicht zu. Beispielsweise ein Formular-Test auf einer Seite ohne Formulare.*

🔍 **${statusCounts.incomplete} unvollständig (incomplete)** – 
*Unklare Ergebnisse. Manuelle Prüfung nötig.*

⚠️ **${statusCounts.untested} nicht getestet (untested)** – 
*Diese Kriterien wurden nicht automatisch getestet und benötigen eine manuelle Überprüfung.*

${spacer}

**Verteilung nach Level:**  
${Object.entries(levelCounts).map(([level, counts]) => 
    `• **${level.toUpperCase()}:** ${counts.total} Kriterien (davon ${counts.passed} bestanden)`
).join('  \n')}

---

*Hinweis: Einige WCAG-Kriterien müssen manuell überprüft werden, weil sie nicht automatisch geprüft werden können.*

${spacer}

Analysiert: [${analysisUrl}](${analysisUrl})  
Zeitpunkt: ${wcagData.meta?.scannedAt ? new Date(wcagData.meta.scannedAt).toLocaleString('de-DE') : 'Unbekannt'}`;
    };

    return (
        <section className="mx-auto mt-4 max-w-6xl">
            {/* Header Bereich */}
            <div className="mb-6 rounded-xl bg-white shadow border p-6">
                <div className="grid grid-cols-3 items-center gap-4 min-h-[60px]">
                    {/* Neue Analyse Button - links */}
                    <div className="flex justify-start">
                        <Link to="/" className="inline-flex items-center gap-2 rounded-xl bg-slate-900 px-4 py-2 text-sm font-semibold text-white hover:bg-slate-800 transition-colors shadow-lg border border-slate-200">
                            <svg className="h-4 w-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
                            </svg>
                            Neue Analyse
                        </Link>
                    </div>

                    {/* Titel - perfekt mittig */}
                    <div className="flex items-center justify-center">
                        <h1 className="bg-gradient-to-r from-gray-900 via-sky-800 to-cyan-800 bg-clip-text text-3xl font-extrabold text-transparent leading-tight py-1">
                            Analyse Ergebnisse
                        </h1>
                    </div>

                    {/* Download Button für Statement - rechts */}
                    <div className="flex justify-end">
                        {group.selected.statement ? (
                            statement?.pdfUrl ? (
                                <a
                                    className="inline-flex items-center gap-2 rounded-xl bg-sky-600 px-4 py-2 font-semibold text-white hover:bg-sky-700 transition-colors shadow-md"
                                    href={statement.pdfUrl}
                                    target="_blank"
                                    rel="noopener noreferrer"
                                    download
                                >
                                    <DownloadIcon />
                                    Statement PDF
                                </a>
                            ) : (
                                <button
                                    className="inline-flex items-center gap-2 rounded-xl bg-gray-400 px-4 py-2 font-semibold text-white cursor-not-allowed"
                                    disabled
                                >
                                    <DownloadIcon />
                                    Statement wird erstellt...
                                </button>
                            )
                        ) : null}
                    </div>
                </div>
            </div>

            {/* Tabs für verfügbare Analysen - immer anzeigen wenn Analysen vorhanden */}
            {availableTabs.length > 0 && (
                <div className="mb-6 flex justify-center">
                    <Tabs tabs={availableTabs} value={tab} onChange={(id)=>setTab(id as any)} />
                </div>
            )}

            {/* Legal Statement / Disclaimer - immer anzeigen, egal welche Workflows getriggert wurden */}
            <div className="mb-6 rounded-lg border border-amber-200 bg-amber-50 p-4">
                <div className="flex items-start gap-3">
                    <div className="flex-shrink-0">
                        <svg className="h-5 w-5 text-amber-600 mt-0.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-2.5L13.732 4c-.77-.833-1.964-.833-2.732 0L4.082 16.5c-.77.833.192 2.5 1.732 2.5z" />
                        </svg>
                    </div>
                    <div className="flex-1 text-sm text-amber-800">
                        <p className="font-semibold mb-2">Wichtiger Hinweis zu den Analyseergebnissen</p>
                        <p className="leading-relaxed">
                            Diese Ergebnisse wurden automatisiert mit KI-gestützten Verfahren erstellt.
                            Sie dienen nur der ersten Orientierung, können Fehler enthalten und ersetzen keine Expertenprüfung.
                            Die Angaben sind nicht rechtsverbindlich.
                        </p>
                    </div>
                </div>
            </div>

            {/* Spezielle Nachricht wenn nur Statement ausgewählt wurde */}
            {group.selected.statement && !group.selected.wcag && !group.selected.seo && (
                <div className="mb-6 rounded-xl border-l-4 border-blue-400 bg-blue-50 p-5">
                    <div className="flex items-center gap-2 text-blue-700">
                        <svg className="h-5 w-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                        </svg>
                        <h2 className="text-lg font-semibold">Barrierefreiheitserklärung wurde erstellt</h2>
                    </div>
                    <p className="mt-2 text-blue-600">
                        Sie haben nur die Erstellung einer Barrierefreiheitserklärung ausgewählt.
                        Das PDF wird automatisch generiert und steht dann oben rechts zum Download bereit.
                        {!statement?.pdfUrl && " Die Erstellung kann einige Minuten dauern..."}
                    </p>
                </div>
            )}

            {/* Zusammenfassung - nur bei WCAG-Tab anzeigen */}
            {availableTabs.length > 0 && tab === "wcag" && !(group.selected.statement && !group.selected.wcag && !group.selected.seo) && (
                <div className="mb-6 rounded-xl border-l-4 border-emerald-400 bg-white p-5 shadow">
                    <div className="mb-2 flex items-center gap-2 text-emerald-700">
                        <ShieldIcon/>
                        <h2 className="text-lg font-semibold">Zusammenfassung</h2>
                    </div>
                    <div className="prose prose-sm max-w-none prose-a:text-blue-600 prose-a:font-semibold prose-a:underline prose-a:decoration-2 prose-a:underline-offset-2 hover:prose-a:text-blue-800 hover:prose-a:bg-blue-50 prose-a:transition-colors prose-a:rounded prose-a:px-1 prose-a:py-0.5">
                        <ReactMarkdown rehypePlugins={[rehypeRaw, rehypeSanitize]}>
                            {createWcagSummary(wcag)}
                        </ReactMarkdown>
                    </div>
                </div>
            )}

            {/* Detaillierte Ergebnisse - nur anzeigen wenn es Analyseergebnisse gibt */}
            {availableTabs.length > 0 && (
                <>
                    <h3 className="mb-3 text-lg font-semibold">Detaillierte Ergebnisse</h3>
                    {tab === "wcag" ? (
                        <>
                            {wcag ? (
                                <A11yAccordion categories={normalizeWcagData(wcag)} />
                            ) : (
                                <div className="card p-4">Keine Daten zur Barrierefreiheit.</div>
                            )}
                        </>
                    ) : (
                        <>
                            {seoSections.length > 0 ? (
                                <SEOAccordion sections={seoSections} />
                            ) : seo?.blocks ? (
                                <SEOAccordion blocks={seo.blocks} />
                            ) : seo?.html ? (
                                <SEOHtmlDisplay htmlContent={extractBodyContent(seo.html)} />
                            ) : seo?.htmlContent ? (
                                <SEOHtmlDisplay htmlContent={extractBodyContent(seo.htmlContent)} />
                            ) : typeof seo === 'string' ? (
                                <SEOHtmlDisplay htmlContent={extractBodyContent(seo)} />
                            ) : (
                                <div className="text-center py-12 text-slate-500">
                                    <ChartIcon />
                                    <p className="mt-4 text-lg">Keine SEO-Daten gefunden.</p>
                                    {import.meta.env.DEV && (
                                        <details className="mt-4 p-3 bg-gray-100 rounded">
                                            <summary className="cursor-pointer font-bold text-sm">Debug: SEO-Daten</summary>
                                            <pre className="mt-2 text-xs overflow-auto">
                                                {JSON.stringify(seo, null, 2)}
                                            </pre>
                                        </details>
                                    )}
                                </div>
                            )}
                        </>
                    )}
                </>
            )}
        </section>
    );
}


// Konvertiere n8n-Workflow-Daten in das erwartete Format für A11yAccordion
function normalizeWcagData(wcagData: any) {
    if (!wcagData?.criteria) return [];

    // Gruppiere Kriterien nach Prinzipien
    const principleMap: Record<string, any> = {};

    wcagData.criteria.forEach((criterion: any) => {
        const principleKey = criterion.prinzip || 'Unbekannt';

        if (!principleMap[principleKey]) {
            principleMap[principleKey] = {
                id: principleKey.toLowerCase().replace(/\s+/g, '-'),
                label: principleKey,
                criteria: []
            };
        }

        // Konvertiere Kriterium in das erwartete Format
        const normalizedCriterion = {
            id: criterion.nummer,
            title: `${criterion.nummer} - ${criterion.beschreibung}`,
            description: `WCAG Level ${criterion.stufe}`,
            status: mapStatus(criterion.status),
            wcag: [criterion.nummer],
            advice: getAdviceForStatus(criterion.status),
            link: criterion.link || '', // Füge den Leitfaden-Link aus dem JSON hinzu
            checked: criterion.rules?.flatMap((rule: any) => {
                // Für jede Rule, sammle die tatsächlichen DOM-Elemente die geprüft wurden
                if (rule.nodes && Array.isArray(rule.nodes) && rule.nodes.length > 0) {
                    return rule.nodes.map((node: any) => ({
                        selector: Array.isArray(node.target) ? node.target.join(', ') : (node.target || ''),
                        text: node.html || node.failureSummary || rule.help || rule.description || '',
                        src: rule.helpUrl || '' // Axe-Dokumentation als zusätzliche Info
                    }));
                } else {
                    // Fallback wenn keine spezifischen Nodes vorhanden sind
                    return [{
                        selector: rule.selector || '',
                        text: rule.help || rule.description || 'Element geprüft',
                        src: rule.helpUrl || ''
                    }];
                }
            }) || []
        };

        principleMap[principleKey].criteria.push(normalizedCriterion);
    });

    return Object.values(principleMap);
}

// Mappe n8n-Status auf erwartete Status-Werte
function mapStatus(status: string): "pass" | "fail" | "untested" | "inapplicable" | "incomplete" {
    switch (status) {
        case 'pass':
            return 'pass';
        case 'fail':
            return 'fail';
        case 'inapplicable':
            return 'inapplicable';
        case 'incomplete':
            return 'incomplete';
        case 'untested':
        default:
            return 'untested';
    }
}

// Generiere Empfehlungen basierend auf Status
function getAdviceForStatus(status: string): string {
    switch (status) {
        case 'fail':
            return 'Dieses Kriterium wurde nicht erfüllt und sollte überprüft werden.';
        case 'incomplete':
            return 'Dieses Kriterium konnte nicht vollständig automatisch geprüft werden und benötigt manuelle Überprüfung.';
        case 'untested':
            return 'Dieses Kriterium wurde nicht automatisch getestet.';
        case 'pass':
            return 'Dieses Kriterium wurde erfolgreich erfüllt.';
        case 'inapplicable':
            return 'Dieses Kriterium ist auf dieser Seite nicht anwendbar.';
        default:
            return 'Status unbekannt.';
    }
}

// Hilfsfunktion um den Body-Inhalt aus dem HTML zu extrahieren
function extractBodyContent(html: string) {
    try {
        const parser = new DOMParser();
        const doc = parser.parseFromString(html, 'text/html');
        const container = doc.createElement('div');
        Array.from(doc.body.childNodes).forEach(node => {
            container.appendChild(node);
        });
        return container.innerHTML;
    } catch (e) {
        // Fallback: Regex extrahiert Body-Inhalt
        const match = html.match(/<body[^>]*>([\s\S]*?)<\/body>/i);
        return match ? match[1] : html;
    }
}
