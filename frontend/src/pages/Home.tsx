import React from "react";
import { useNavigate } from "react-router-dom";
import { createGroup } from "../lib/jobs";
import FAQ from "../components/FAQ";


const FAQ_DATA = [
    {
        "question": "Was bedeutet digitale Barrierefreiheit?",
        "answer": "Digitale Barrierefreiheit bedeutet, dass alle Menschen – unabhängig von Einschränkungen – Websites und digitale Angebote nutzen können. Dazu zählen zum Beispiel Menschen mit Sehbehinderungen, motorischen Einschränkungen oder kognitiven Beeinträchtigungen. Barrierefreie Seiten lassen sich mit Tastatur bedienen, haben gute Kontraste und funktionieren mit Screenreadern. Ziel ist es, gleiche Chancen für alle zu schaffen – auch digital. Es geht nicht nur um Technik, sondern um Teilhabe."
    },
    {
        "question": "Warum ist Barrierefreiheit wichtig?",
        "answer": "Barrierefreiheit sorgt dafür, dass niemand ausgeschlossen wird – weder Kund:innen noch Mitarbeitende. Sie verbessert die Nutzerfreundlichkeit für alle und kann sogar die Conversion Rate steigern. Gleichzeitig zeigt sie, dass Unternehmen gesellschaftliche Verantwortung übernehmen. Wer barrierefrei denkt, baut Vertrauen auf – und eröffnet sich neue Zielgruppen. Nicht zuletzt sind viele Verbesserungen auch für ältere Menschen oder mobile Nutzer hilfreich."
    },
    {
        "question": "Warum ist das Thema gerade jetzt besonders relevant?",
        "answer": "Am 28. Juni 2025 ist das Barrierefreiheitsstärkungsgesetz (BFSG) in Kraft getretet – es verpflichtet viele Anbieter, ihre digitalen Produkte barrierefrei zu gestalten. Auch die EU-Richtlinie für barrierefreie Webseiten (Norm EN 301 549) wird zur Pflicht. Wer sich jetzt mit dem Thema beschäftigt, ist rechtzeitig vorbereitet. Zudem steigt das Bewusstsein in der Gesellschaft: Inklusion wird auch in der digitalen Welt zum Standard. Unternehmen, die heute handeln, positionieren sich zukunftssicher."
    },
    {
        "question": "Wen betrifft das Barrierefreiheitsstärkungsgesetz konkret?",
        "answer": "Das Gesetz gilt für viele Unternehmen, insbesondere im E-Commerce, im Finanzwesen oder bei digitalen Dienstleistungen. Auch kleinere Anbieter müssen handeln, wenn sie standardisierte Produkte für Endverbraucher anbieten. Es betrifft nicht nur Behörden, sondern auch private Unternehmen – etwa Onlineshops, Buchungsportale oder Banking-Apps. Wichtig: Auch freiwillige Umsetzung kann Wettbewerbsvorteile bringen, ganz unabhängig von der Pflicht."
    },
    {
        "question": "Was leistet unser automatischer WCAG-Check – und was nicht?",
        "answer": "Der automatische Check analysiert Ihre Website auf häufige Barrieren – z. B. fehlende Alternativtexte, mangelhafte Kontraste oder Probleme bei der Tastaturbedienung. Sie erhalten sofort eine erste Einschätzung nach WCAG-Kriterien. Was der Check nicht kann: subjektive Nutzbarkeit bewerten oder komplexe Inhalte testen, wie z. B. die Lesbarkeit von PDF-Dokumenten. Er ist aber ein idealer erster Schritt, um Handlungsbedarf zu erkennen – einfach, schnell und kostenfrei."
    }
];


export default function Home(){
    const nav = useNavigate();
    const [url, setUrl] = React.useState("");
    const [opts, setOpts] = React.useState({ "wcag":true, seo:true, statement:false });
    const [loading, setLoading] = React.useState(false);


    const valid = /^https?:\/\//i.test(url) && (opts["wcag"] || opts.seo || opts.statement);
    function toggle(k: keyof typeof opts){ setOpts(o=>({ ...o, [k]: !o[k] })); }


    async function onSubmit(e: React.FormEvent){
        e.preventDefault();
        if (!valid) return;

        setLoading(true);
        const group = createGroup(url, opts);

        // Sofort zum Ladebildschirm navigieren
        nav(`/loading/${group.groupId}`);

        // Workflows im Hintergrund starten
        // (werden asynchron im Loading-Component verarbeitet)
        setLoading(false);
    }


    return (
        <section className="mx-auto mt-10 max-w-5xl">
            <div className="text-center">
                <div className="mx-auto inline-flex items-center gap-2 rounded-full bg-white px-3 py-1 text-xs text-sky-700 shadow ring-1 ring-sky-100">
                    <svg className="h-3 w-3" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
                    </svg>
                    WebAudit Pro
                </div>
                <h1 className="mt-4 text-4xl font-extrabold tracking-tight">
                    Umfassende Website <span className="bg-gradient-to-r from-sky-600 to-cyan-600 bg-clip-text text-transparent">Analyse & Audit</span>
                </h1>
                <p className="mx-auto mt-3 max-w-2xl text-gray-600">
                    Detaillierte Einblicke in Barrierefreiheit, SEO-Leistung und eine professionelle Barrierefreiheitserklärung – in Minuten.
                </p>
            </div>


            <form onSubmit={onSubmit} className="card mx-auto mt-8 p-6">
                <h2 className="mb-3 text-lg font-semibold">Starte deine Analyse</h2>
                <div className="flex flex-col gap-3 sm:flex-row">
                    <input type="url" value={url} onChange={(e)=>setUrl(e.target.value)} placeholder="https://beispiel.de" className="w-full rounded-xl border border-gray-300 px-4 py-3 outline-none focus:ring-2 focus:ring-sky-500" required />
                    <button type="submit" disabled={!valid || loading} className="rounded-xl bg-sky-600 px-5 py-3 font-semibold text-white hover:bg-sky-700 disabled:opacity-50">Website analysieren</button>
                </div>


                <div className="mt-5 grid gap-3 sm:grid-cols-3">
                    <OptionCard checked={opts["wcag"]} onToggle={()=>toggle("wcag")} title="Barrierefreiheit" badge="WCAG" desc="Umfassender Barrierefreiheits-Check nach den WCAG Kriterien" icon={<ShieldIcon/>}/>
                    <OptionCard checked={opts.seo} onToggle={()=>toggle("seo")} title="SEO Analyse" badge="Basis" desc="Grundlegende SEO Analyse & Empfehlungen" icon={<ChartIcon/>}/>
                    <OptionCard checked={opts.statement} onToggle={()=>toggle("statement")} title="Statement" badge="PDF" desc="Nicht rechtsverbindliche Barrierefreiheitserklärung als PDF" icon={<PdfIcon/>}/>
                </div>


                <p className="mt-4 text-center text-xs text-gray-500">Gültige URL eingeben und mindestens eine Analyse wählen.</p>
            </form>


            <div className="mx-auto mt-8 grid max-w-5xl gap-4 sm:grid-cols-3">
                <FeatureCard
                    title="Detaillierte Berichte"
                    desc="Website-Analyse mit konkreten Handlungsempfehlungen"
                    icon="📊"
                />
                <FeatureCard
                    title="PDF-Export"
                    desc="Barrierefreiheitserklärung als PDF exportieren"
                    icon="📄"
                />
                <FeatureCard
                    title="Schnell & Zuverlässig"
                    desc="Ergebnisse in wenigen Minuten"
                    icon="⚡"
                />
            </div>


            {/* FAQ Bereich */}
            <div className="mt-16 mb-8">
                <FAQ items={FAQ_DATA} />
            </div>
        </section>
    );
}

// Hilfsfunktionen für die Icons
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

function PdfIcon() {
    return (
        <svg className="h-5 w-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
        </svg>
    );
}

function OptionCard({ checked, onToggle, title, badge, desc, icon }: {
    checked: boolean;
    onToggle: () => void;
    title: string;
    badge: string;
    desc: string;
    icon: React.ReactNode;
}) {
    return (
        <label className={`cursor-pointer rounded-xl border-2 p-4 transition-all ${checked ? 'border-sky-500 bg-sky-50' : 'border-gray-200 bg-white hover:border-gray-300'}`}>
            <input
                type="checkbox"
                checked={checked}
                onChange={onToggle}
                className="sr-only"
            />
            <div className="flex items-start gap-3">
                <div className={`rounded-lg p-2 ${checked ? 'bg-sky-100 text-sky-600' : 'bg-gray-100 text-gray-600'}`}>
                    {icon}
                </div>
                <div className="flex-1">
                    <div className="flex items-center gap-2">
                        <h3 className="font-semibold">{title}</h3>
                        <span className={`rounded px-1.5 py-0.5 text-xs font-medium ${checked ? 'bg-sky-100 text-sky-700' : 'bg-gray-100 text-gray-600'}`}>
                            {badge}
                        </span>
                    </div>
                    <p className="mt-1 text-sm text-gray-600">{desc}</p>
                </div>
            </div>
        </label>
    );
}

function FeatureCard({ title, desc, icon }: { title: string; desc: string; icon: string }) {
    return (
        <div className="card p-6 text-center">
            <div className="mb-3 text-2xl">{icon}</div>
            <h3 className="mb-2 font-semibold">{title}</h3>
            <p className="text-sm text-gray-600">{desc}</p>
        </div>
    );
}
