import React from "react";

interface FAQItem {
    question: string;
    answer: string;
}

interface FAQProps {
    items: FAQItem[];
}

export default function FAQ({ items }: FAQProps) {
    const [openIndex, setOpenIndex] = React.useState<number | null>(null);

    const toggleFAQ = (index: number) => {
        setOpenIndex(openIndex === index ? null : index);
    };

    return (
        <div className="mx-auto max-w-4xl">
            <div className="text-center mb-8">
                <h2 className="text-3xl font-bold text-gray-900">Häufig gestellte Fragen</h2>
                <p className="mt-2 text-gray-600">Alles was Sie über digitale Barrierefreiheit wissen müssen</p>
            </div>

            <div className="space-y-4">
                {items.map((item, index) => (
                    <div key={index} className="card overflow-hidden">
                        <button
                            onClick={() => toggleFAQ(index)}
                            className="w-full px-6 py-4 text-left flex items-center justify-between hover:bg-gray-50 transition-colors"
                        >
                            <h3 className="font-semibold text-gray-900 pr-4">
                                {item.question}
                            </h3>
                            <svg
                                className={`h-5 w-5 text-gray-500 transition-transform ${
                                    openIndex === index ? 'rotate-180' : ''
                                }`}
                                fill="none"
                                stroke="currentColor"
                                viewBox="0 0 24 24"
                            >
                                <path
                                    strokeLinecap="round"
                                    strokeLinejoin="round"
                                    strokeWidth={2}
                                    d="M19 9l-7 7-7-7"
                                />
                            </svg>
                        </button>

                        {openIndex === index && (
                            <div className="px-6 pb-4">
                                <div className="border-t border-gray-100 pt-4">
                                    <p className="text-gray-700 leading-relaxed">
                                        {item.answer}
                                    </p>
                                </div>
                            </div>
                        )}
                    </div>
                ))}
            </div>
        </div>
    );
}
