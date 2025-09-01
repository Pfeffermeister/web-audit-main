import React from "react";
import { useNavigate, useParams } from "react-router-dom";
import { getGroup, allSelectedDone, allSelectedSuccessful, startSelectedWorkflows } from "../lib/jobs";
import { useFakeProgress } from "../components/FakeProgress";

export default function Loading() {
    const { groupId } = useParams<{ groupId: string }>();
    const nav = useNavigate();
    const [done, setDone] = React.useState(false);
    const [url, setUrl] = React.useState<string>("");
    const [hasErrors, setHasErrors] = React.useState(false);
    const [errorMessages, setErrorMessages] = React.useState<string[]>([]);
    const [workflowsStarted, setWorkflowsStarted] = React.useState(false);
    const [realProgress, setRealProgress] = React.useState(0);
    const [selectedWorkflows, setSelectedWorkflows] = React.useState<string[]>([]);
    const [displayWorkflows, setDisplayWorkflows] = React.useState<string[]>([]);

    // Berechne echten Progress basierend auf Workflow-Status (immer monoton steigend)
    const calculateRealProgress = (group: any) => {
        if (!group) return 0;

        const selected = [];
        if (group.selected.wcag) selected.push('wcag');
        if (group.selected.seo) selected.push('seo');
        if (group.selected.statement) selected.push('statement');

        if (selected.length === 0) return 0;

        // Basis-Progress: 10% sobald Workflows definiert sind
        let progress = 0.1;

        // 20% wenn Workflows gestartet wurden
        if (workflowsStarted) {
            progress = 0.2;
        }

        // 70% basierend auf abgeschlossenen Jobs (20% + 70% = 90%)
        if (group.jobs.length > 0) {
            const completedJobs = group.jobs.filter((job: any) =>
                job.status === 'done' || job.status === 'error'
            ).length;

            const jobProgress = (completedJobs / selected.length) * 0.7;
            progress = 0.2 + jobProgress;
        }

        // Nie rückwärts gehen - verwende Math.max mit vorherigem Wert
        return Math.max(progress, realProgress);
    };

    // Setze Display-Workflows basierend auf Auswahl (sofort sichtbar)
    const updateDisplayWorkflows = (group: any) => {
        if (!group) return;

        const workflows = [];
        if (group.selected.wcag) workflows.push('Barrierefreiheit');
        if (group.selected.seo) workflows.push('SEO');
        if (group.selected.statement) workflows.push('Statement');

        setDisplayWorkflows(workflows);
    };

    React.useEffect(() => {
        let cancelled = false;

        async function loop() {
            const group = getGroup(groupId!);
            if (!group) return;

            setUrl(group.url);

            // Setze Display-Workflows sofort beim ersten Load
            if (displayWorkflows.length === 0) {
                updateDisplayWorkflows(group);
            }

            // Setze ausgewählte Workflows einmalig
            if (selectedWorkflows.length === 0) {
                const selected = [];
                if (group.selected.wcag) selected.push('wcag');
                if (group.selected.seo) selected.push('seo');
                if (group.selected.statement) selected.push('statement');
                setSelectedWorkflows(selected);
            }

            // Wenn noch keine Jobs vorhanden sind UND Workflows noch nicht gestartet wurden
            if (group.jobs.length === 0 && !workflowsStarted) {
                console.log('Starting workflows for the first time...');
                setWorkflowsStarted(true);

                try {
                    await startSelectedWorkflows(group);
                    console.log('Workflows started successfully');
                } catch (error) {
                    console.error("Failed to start workflows:", error);
                    setWorkflowsStarted(false);
                }
            }

            // Hole aktuelle Gruppe (nach potentiellem Workflow-Start)
            const currentGroup = getGroup(groupId!);
            if (!currentGroup || cancelled) return;

            // Berechne und setze echten Progress (monoton steigend)
            const newProgress = calculateRealProgress(currentGroup);
            setRealProgress(prev => Math.max(prev, newProgress));

            // Prüfe, ob alle ausgewählten Workflows abgeschlossen sind
            if (allSelectedDone(currentGroup)) {
                console.log('All workflows completed');
                // Setze Progress auf mindestens 95% wenn fertig
                setRealProgress(prev => Math.max(prev, 0.95));

                // Alle erfolgreich -> zur Result-Seite
                if (allSelectedSuccessful(currentGroup)) {
                    setDone(true);
                } else {
                    // Mindestens ein Workflow hat einen Fehler -> Fehlerseite anzeigen
                    const errors = currentGroup.jobs.filter((job: any) => job.status === "error");
                    setHasErrors(true);
                    setErrorMessages(errors.map((job: any) => job.error || "Unbekannter Fehler"));
                }
                return; // Stoppe das Polling
            }

            // Nur weiteres Polling wenn Workflows bereits gestartet wurden aber noch nicht fertig sind
            if (!cancelled && workflowsStarted && !allSelectedDone(currentGroup)) {
                console.log('Workflows still running, checking again in 3s');
                setTimeout(loop, 3000); // Längere Intervalle für stabilere Anzeige
            }
        }

        loop();
        return () => { cancelled = true; };
    }, [groupId, workflowsStarted, selectedWorkflows.length, displayWorkflows.length, realProgress]);

    const { progress, message } = useFakeProgress(done, {
        selectedWorkflows
    });
    const pct = Math.round(progress * 100);

    React.useEffect(() => {
        if (done) setTimeout(() => nav(`/result/${groupId}`), 400);
    }, [done, groupId, nav]);

    // Fehler-Anzeige
    if (hasErrors) {
        return (
            <section className="mx-auto mt-16 flex max-w-xl justify-center">
                <div className="card w-full p-6 text-center">
                    <div className="mx-auto mb-3 flex h-12 w-12 items-center justify-center rounded-full bg-red-50 text-red-600">
                        <svg className="h-6 w-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-2.5L13.732 4c-.77-.833-1.684-.833-2.464 0L5.732 15.5c-.77.833.192 2.5 1.732 2.5z" />
                        </svg>
                    </div>
                    <h1 className="text-2xl font-bold text-red-600">Analyse fehlgeschlagen</h1>
                    <p className="mt-1 text-sm text-gray-600">Bei der Analyse von <span className="font-mono">{url || "…"}</span> ist ein Fehler aufgetreten.</p>

                    <div className="mt-4 rounded-lg bg-red-50 p-4 text-left">
                        <h3 className="font-semibold text-red-800 mb-2">Fehlermeldung(en):</h3>
                        {errorMessages.map((error, index) => (
                            <div key={index} className="text-sm text-red-700 mb-1">
                                • {error}
                            </div>
                        ))}
                    </div>

                    <div className="mt-4 text-sm text-gray-600">
                        <p>Mögliche Ursachen:</p>
                        <ul className="mt-2 text-left space-y-1">
                            {errorMessages.some(msg => msg.includes('Timeout') || msg.includes('timeout')) ? (
                                <>
                                    <li>• <strong>Timeout:</strong> Die Website ist sehr komplex oder der n8n-Service ist überlastet</li>
                                    <li>• Versuchen Sie es in ein paar Minuten erneut</li>
                                    <li>• Bei wiederholten Timeouts wenden Sie sich an den Support</li>
                                </>
                            ) : (
                                <>
                                    <li>• Quota-Limit erreicht (versuchen Sie es später erneut)</li>
                                    <li>• Website nicht erreichbar oder blockiert den Zugriff</li>
                                    <li>• Temporärer Service-Fehler</li>
                                    <li>• n8n-Workflow ist nicht verfügbar</li>
                                </>
                            )}
                        </ul>
                    </div>

                    <div className="mt-6 flex gap-3">
                        <button
                            onClick={() => nav('/')}
                            className="flex-1 rounded-xl bg-gray-600 px-4 py-2 text-white hover:bg-gray-700"
                        >
                            Neue Analyse starten
                        </button>
                        <button
                            onClick={() => window.location.reload()}
                            className="flex-1 rounded-xl bg-sky-600 px-4 py-2 text-white hover:bg-sky-700"
                        >
                            Erneut versuchen
                        </button>
                    </div>
                </div>
            </section>
        );
    }

    // Normale Loading-Anzeige
    return (
        <section className="mx-auto mt-16 flex max-w-xl justify-center">
            <div className="card w-full p-6 text-center">
                <div className="mx-auto mb-3 flex h-12 w-12 items-center justify-center rounded-full bg-sky-50 text-sky-600">
                    <svg className="h-6 w-6 animate-spin" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15" />
                    </svg>
                </div>

                <h1 className="text-2xl font-bold text-slate-900">Analyse läuft...</h1>
                <p className="mt-1 text-sm text-gray-600">Analysiere <span className="font-mono">{url || "…"}</span></p>

                <div className="mt-6">
                    <div className="mb-2 flex justify-between text-sm">
                        <span className="text-slate-600">{message}</span>
                        <span className="font-semibold text-slate-900">{pct}%</span>
                    </div>
                    <div className="h-2 overflow-hidden rounded-full bg-gray-200">
                        <div
                            className="h-full bg-gradient-to-r from-sky-400 to-blue-500 transition-all duration-500"
                            style={{ width: `${pct}%` }}
                        />
                    </div>
                </div>

                {displayWorkflows.length > 0 && (
                    <div className="mt-4 text-sm text-gray-600">
                        <p>Aktive Analysen: {displayWorkflows.join(', ')}</p>
                    </div>
                )}

                <div className="mt-4 text-xs text-gray-500">
                    Dies kann einige Minuten dauern...
                </div>
            </div>
        </section>
    );
}
