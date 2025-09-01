import React from "react";

type Step = { id: string; label: string; weight: number; messages: string[] };

function pick<T>(arr: T[]): T { return arr[Math.floor(Math.random() * arr.length)]; }

export function useFakeProgress(
    done: boolean,
    {
        selectedWorkflows = []
    }: {
        selectedWorkflows?: string[];
    } = {}
) {
    const [progress, setProgress] = React.useState(0);
    const [currentStep, setCurrentStep] = React.useState<Step | null>(null);
    const [message, setMessage] = React.useState<string>("");
    const lastMessageTimeRef = React.useRef<number>(performance.now());

    // Filter steps basierend auf ausgewählten Workflows
    const activeSteps = React.useMemo(() => {
        const baseSteps = [
            {
                id: "fetch",
                label: "Seite abrufen & rendern",
                weight: 1,
                messages: ["Website wird geladen…", "Seiten-Content analysieren…", "Externe Ressourcen sammeln…"]
            }
        ];

        if (selectedWorkflows.includes('wcag')) {
            baseSteps.push({
                id: "wcag",
                label: "Barrierefreiheit prüfen",
                weight: 2,
                messages: [
                    "WCAG-Kriterien werden geprüft…",
                    "Farb-Kontraste messen…",
                    "Tastatur-Navigation testen…",
                    "Screen-Reader Kompatibilität…",
                    "Alt-Texte kontrollieren…"
                ]
            });
        }

        if (selectedWorkflows.includes('seo')) {
            baseSteps.push({
                id: "seo",
                label: "SEO-Analyse durchführen",
                weight: 2,
                messages: [
                    "Meta-Tags analysieren…",
                    "Page Speed messen…",
                    "Sitemap prüfen…",
                    "Content-Struktur bewerten…",
                    "KI generiert SEO-Empfehlungen…"
                ]
            });
        }

        if (selectedWorkflows.includes('statement')) {
            baseSteps.push({
                id: "statement",
                label: "Statement erstellen",
                weight: 1.5,
                messages: [
                    "PDF wird generiert…",
                    "Rechtliche Formulierungen…",
                    "Compliance-Check läuft…"
                ]
            });
        }

        baseSteps.push({
            id: "finalize",
            label: "Ergebnisse finalisieren",
            weight: 0.5,
            messages: [
                "Ergebnisse werden zusammengefasst…",
                "Letzte Qualitätsprüfung…",
                "Fast geschafft…"
            ]
        });

        return baseSteps;
    }, [selectedWorkflows]);

    // Berechne Schwellenwerte für Steps
    const thresholds = React.useMemo(() => {
        const total = activeSteps.reduce((sum, step) => sum + step.weight, 0);
        let accumulator = 0;
        return activeSteps.map((step) => {
            const from = accumulator / total;
            accumulator += step.weight;
            const to = accumulator / total;
            return { from, to, step };
        });
    }, [activeSteps]);

    React.useEffect(() => {
        if (activeSteps.length === 0) return;

        // Setze initial Step
        if (!currentStep) {
            setCurrentStep(activeSteps[0]);
            setMessage(pick(activeSteps[0].messages));
        }

        const interval = setInterval(() => {
            const now = performance.now();

            setProgress(prev => {
                if (done) {
                    // Wenn fertig, schnell auf 100%
                    return Math.min(1, prev + 0.1);
                }

                // Monoton steigender Progress - niemals rückwärts!
                // Langsamer, konstanter Fortschritt
                const increment = 0.005 + Math.random() * 0.003; // 0.5% bis 0.8% pro Update
                const newProgress = Math.min(0.95, prev + increment); // Maximal 95% bis done=true

                return newProgress;
            });

            // Update Step basierend auf aktuellem Progress
            const currentThreshold = thresholds.find(th => progress >= th.from && progress < th.to);
            if (currentThreshold && currentStep?.id !== currentThreshold.step.id) {
                setCurrentStep(currentThreshold.step);
                setMessage(pick(currentThreshold.step.messages));
                lastMessageTimeRef.current = now;
            }

            // Update Message alle 3-5 Sekunden
            if (now - lastMessageTimeRef.current > 3000 + Math.random() * 2000) {
                if (currentStep) {
                    setMessage(pick(currentStep.messages));
                    lastMessageTimeRef.current = now;
                }
            }
        }, 500); // Update alle 500ms

        return () => clearInterval(interval);
    }, [done, progress, currentStep, activeSteps, thresholds]);

    return {
        progress,
        message,
        currentStep: currentStep?.label || "Wird geladen…"
    };
}
