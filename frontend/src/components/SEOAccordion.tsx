import ReactMarkdown from "react-markdown";
import rehypeRaw from "rehype-raw";
import rehypeSanitize from "rehype-sanitize";

interface SEOBlock {
    key?: string;
    title: string;
    content: string;
}

interface SEOSection {
    title: string;
    blocks: SEOBlock[];
}

interface SEOAccordionProps {
    blocks?: SEOBlock[];
    sections?: SEOSection[];
}

export function SEOAccordion({ blocks, sections }: SEOAccordionProps) {
    // Wenn sections verwendet werden, verwende die strukturierte Darstellung
    if (sections && sections.length > 0) {
        return (
            <div className="space-y-6">
                {sections.map((section, sectionIndex) => (
                    <div key={sectionIndex} className="space-y-4">
                        {/* Zeige Sektion-Titel nur an, wenn es nicht "SEO Analyse Ergebnisse" ist */}
                        {section.title !== "SEO Analyse Ergebnisse" && (
                            <h3 className="text-lg font-semibold text-gray-900 border-b border-gray-200 pb-2">
                                {section.title}
                            </h3>
                        )}
                        <div className="space-y-4">
                            {section.blocks.map((block, blockIndex) => (
                                <details key={block.key || `${sectionIndex}-${blockIndex}`} className="overflow-hidden rounded-xl border border-slate-200 bg-white shadow-sm">
                                    <summary className="flex cursor-pointer list-none items-center gap-3 px-4 py-3 hover:bg-gray-50 transition-colors">
                                        <div className="flex items-center gap-3">
                                            <div className="flex-shrink-0">
                                                <svg className="h-5 w-5 text-blue-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 19v-6a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2a2 2 0 002-2zm0 0V9a2 2 0 012-2h2a2 2 0 012 2v10m-6 0a2 2 0 002 2h2a2 2 0 002-2m0 0V5a2 2 0 012-2h2a2 2 0 012 2v14a2 2 0 01-2 2h-2a2 2 0 01-2-2z" />
                                                </svg>
                                            </div>
                                            <span className="text-base font-semibold text-gray-900">
                                                {block.title !== "SEO Analyse Ergebnisse" && block.title !== "SEO Analyse"
                                                    ? block.title
                                                    : "SEO Ergebnisse"
                                                }
                                            </span>
                                        </div>
                                        <div className="ml-auto">
                                            <svg className="h-5 w-5 text-gray-400 transform transition-transform duration-200" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
                                            </svg>
                                        </div>
                                    </summary>
                                    <div className="px-4 pb-4 pt-2 border-t border-gray-100">
                                        <div
                                            className="prose prose-gray max-w-none prose-headings:text-gray-900 prose-p:text-gray-700 prose-li:text-gray-700 prose-a:text-blue-600 prose-strong:text-gray-900"
                                            style={{
                                                fontFamily: 'inherit',
                                                color: 'inherit'
                                            }}
                                        >
                                            <ReactMarkdown rehypePlugins={[rehypeRaw, rehypeSanitize]}>
                                                {formatContent(block.content, block.key) || 'Keine Daten verfügbar'}
                                            </ReactMarkdown>
                                        </div>
                                    </div>
                                </details>
                            ))}
                        </div>
                    </div>
                ))}
            </div>
        );
    }

    // Fallback auf alte blocks-Darstellung
    if (!blocks || blocks.length === 0) {
        return <div className="text-center py-8 text-gray-500">Keine SEO-Daten verfügbar</div>;
    }

    return (
        <div className="space-y-4">
            {blocks.map((block, index) => (
                <details key={block.key || index} className="overflow-hidden rounded-xl border border-slate-200 bg-white shadow-sm">
                    <summary className="flex cursor-pointer list-none items-center gap-3 px-4 py-3 hover:bg-gray-50 transition-colors">
                        <div className="flex items-center gap-3">
                            <div className="flex-shrink-0">
                                <svg className="h-5 w-5 text-blue-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 19v-6a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2a2 2 0 002-2zm0 0V9a2 2 0 012-2h2a2 2 0 012 2v10m-6 0a2 2 0 002 2h2a2 2 0 002-2m0 0V5a2 2 0 012-2h2a2 2 0 012 2v14a2 2 0 01-2 2h-2a2 2 0 01-2-2z" />
                                </svg>
                            </div>
                            <span className="text-base font-semibold text-gray-900">
                                {block.title !== "SEO Analyse Ergebnisse" && block.title !== "SEO Analyse"
                                    ? block.title
                                    : "SEO Ergebnisse"
                                }
                            </span>
                        </div>
                        <div className="ml-auto">
                            <svg className="h-5 w-5 text-gray-400 transform transition-transform duration-200" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
                            </svg>
                        </div>
                    </summary>
                    <div className="px-4 pb-4 pt-2 border-t border-gray-100">
                        <div
                            className="prose prose-gray max-w-none prose-headings:text-gray-900 prose-p:text-gray-700 prose-li:text-gray-700 prose-a:text-blue-600 prose-strong:text-gray-900"
                            style={{
                                fontFamily: 'inherit',
                                color: 'inherit'
                            }}
                        >
                            <ReactMarkdown rehypePlugins={[rehypeRaw, rehypeSanitize]}>
                                {formatContent(block.content, block.key) || 'Keine Daten verfügbar'}
                            </ReactMarkdown>
                        </div>
                    </div>
                </details>
            ))}
        </div>
    );
}

// Fallback für HTML-basierte SEO-Daten
export function SEOHtmlDisplay({ htmlContent }: { htmlContent: string }) {
    return (
        <div className="overflow-hidden rounded-xl border border-slate-200 bg-white shadow-sm p-4">
            <div
                className="prose prose-gray max-w-none prose-headings:text-gray-900 prose-p:text-gray-700 prose-li:text-gray-700 prose-a:text-blue-600 prose-strong:text-gray-900"
                style={{
                    fontFamily: 'inherit',
                    color: 'inherit',
                    backgroundColor: 'transparent'
                }}
                dangerouslySetInnerHTML={{ __html: htmlContent }}
            />
        </div>
    );
}

// Hilfsfunktion um SEO-Daten in die gewünschte Struktur zu transformieren
export function transformSEODataToSections(seoData: any): SEOSection[] {
    console.log('Debug - transformSEODataToSections called with:', seoData);
    console.log('Debug - seoData type:', typeof seoData);
    console.log('Debug - seoData keys:', seoData ? Object.keys(seoData) : 'no data');

    // Wenn bereits strukturierte Daten vorliegen
    if (seoData?.sections && Array.isArray(seoData.sections)) {
        return seoData.sections;
    }

    const sections: SEOSection[] = [];

    // Priorität 1: Wenn seoData direkt blocks enthält
    if (seoData?.blocks && Array.isArray(seoData.blocks)) {
        // Verwende die vorhandenen Blöcke ohne weitere Strukturierung
        sections.push({
            title: 'SEO Analyse Ergebnisse',
            blocks: seoData.blocks
        });
        console.log('Debug - Using blocks array:', seoData.blocks);
        return sections;
    }

    // Priorität 2: Strukturierte SEO-Daten mit bekannten Keys
    if (seoData && typeof seoData === 'object') {
        // Mapping für SEO-Tools mit ihren deutschen Titeln
        const toolMapping: { [key: string]: string } = {
            'pagespeed': 'Google Page Speed Insights',
            'sitemap': 'Sitemap',
            'robots': 'robots.txt',
            'metatitle': 'Meta Title',
            'metadescription': 'Meta Description',
            'linkstatus_api': 'Broken Link Check (API)',
            'technical': 'On-Page Technical Audit',
            'content': 'On-Page SEO Content Audit'
        };

        // Sammle alle verfügbaren Blöcke
        const allBlocks: SEOBlock[] = [];

        Object.entries(seoData).forEach(([key, value]) => {
            // Überspringe Meta-Felder und leere Werte
            if (['meta', 'timestamp', 'version', 'id', '__typename'].includes(key.toLowerCase()) ||
                !value || (typeof value === 'string' && value.trim() === '')) {
                return;
            }

            let content: string;
            let title = toolMapping[key] || key.charAt(0).toUpperCase() + key.slice(1).replace(/[-_]/g, ' ');

            // Verarbeite verschiedene Datentypen
            if (typeof value === 'string') {
                content = value;
            } else if (typeof value === 'object') {
                // Type Guards für Object-Properties
                const valueObj = value as any;
                if (valueObj.content && typeof valueObj.content === 'string') {
                    content = valueObj.content;
                } else if (valueObj.html && typeof valueObj.html === 'string') {
                    content = valueObj.html;
                } else if (valueObj.text && typeof valueObj.text === 'string') {
                    content = valueObj.text;
                } else {
                    // Als JSON darstellen, wenn keine bekannte Struktur
                    content = JSON.stringify(value, null, 2);
                }
            } else {
                content = String(value);
            }

            // Füge den Block hinzu, wenn Inhalt vorhanden ist
            if (content && content.trim() !== '') {
                allBlocks.push({
                    key: key,
                    title: title,
                    content: content
                });
            }
        });

        // Erstelle eine einzige Sektion mit allen Blöcken
        if (allBlocks.length > 0) {
            sections.push({
                title: 'SEO Analyse Ergebnisse',
                blocks: allBlocks
            });
        }

        console.log('Debug - Created blocks from structured data:', allBlocks.length);
        return sections;
    }

    // Priorität 3: Wenn seoData ein HTML-String ist
    if (typeof seoData === 'string' && seoData.trim() !== '') {
        sections.push({
            title: 'SEO Analyse Ergebnisse',
            blocks: [{
                key: 'general',
                title: 'SEO Analyse Ergebnisse',
                content: seoData
            }]
        });
        console.log('Debug - Using string data');
        return sections;
    }

    // Priorität 4: Wenn seoData HTML-Content hat
    if (seoData?.html || seoData?.htmlContent) {
        const htmlContent = seoData.html || seoData.htmlContent;
        sections.push({
            title: 'SEO Analyse Ergebnisse',
            blocks: [{
                key: 'html-content',
                title: 'SEO Analyse Ergebnisse',
                content: htmlContent
            }]
        });
        console.log('Debug - Using HTML content');
        return sections;
    }

    console.log('Debug - No valid SEO data found, seoData:', seoData);
    return sections;
}

// Hilfsfunktion um Inhalte zu formatieren, insbesondere für PageSpeed Insights
function formatContent(content: string, key?: string): string {
    if (!content) return content;

    // Spezielle Formatierung für PageSpeed Insights
    if (key === 'pagespeed' && content.includes('Weitere Lighthouse Befunde (Kurzfassung)')) {
        // Finde den Abschnitt "Weitere Lighthouse Befunde (Kurzfassung)"
        const lighthouseMatch = content.match(/Weitere Lighthouse Befunde \(Kurzfassung\):\s*(.*?)(?=\n\n|\n$|$)/s);

        if (lighthouseMatch) {
            const lighthouseBefunde = lighthouseMatch[1];

            // Ersetze Kommata zwischen Stichpunkten mit Zeilenumbrüchen
            // Aber achte darauf, dass wir nicht Kommata in Klammern oder innerhalb von Sätzen trennen
            const formattedBefunde = lighthouseBefunde
                .split(/,\s*(?=[A-Z])/) // Teile bei Kommata gefolgt von Großbuchstaben
                .map(item => item.trim())
                .filter(item => item.length > 0)
                .map(item => `• ${item}`) // Füge Bullet Points hinzu
                .join('\n');

            // Ersetze den ursprünglichen Abschnitt mit der formatierten Version
            return content.replace(
                lighthouseMatch[0],
                `Weitere Lighthouse Befunde (Kurzfassung):\n\n${formattedBefunde}`
            );
        }
    }

    return content;
}
