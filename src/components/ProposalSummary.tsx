import { motion } from 'framer-motion';
import { type ProposalSummary as ProposalSummaryType } from '../types/proposal';
import ReactMarkdown from 'react-markdown';
import remarkGfm from 'remark-gfm';

interface ProposalSummaryProps {
  data: ProposalSummaryType;
}

export const ProposalSummary = ({ data }: ProposalSummaryProps) => {
  return (
    <motion.main
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.5 }}
      className="max-w-3xl mx-auto p-6 min-h-[calc(100vh-7rem)]"
    >
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.6, delay: 0.3 }}
        className="bg-gradient-to-br from-[#FCFCFD] to-[#F7F8FA] p-8 rounded-xl shadow-sm border border-gray-100"
      >
        <div className="prose prose-gray prose-sm sm:prose-base max-w-none">
          <ReactMarkdown
            remarkPlugins={[remarkGfm]}
            components={{
              table: ({ children }) => (
                <div className="my-4 overflow-x-auto border border-gray-200 rounded-lg">
                  <table className="min-w-full divide-y divide-gray-200">
                    {children}
                  </table>
                </div>
              ),
              th: ({ children }) => (
                <th className="px-4 py-2 text-left text-sm font-semibold text-gray-900 bg-gray-50">
                  {children}
                </th>
              ),
              td: ({ children }) => (
                <td className="px-4 py-2 text-sm text-gray-700 border-t border-gray-100">
                  {children}
                </td>
              ),
              h1: ({ children }) => (
                <h1 className="text-2xl font-bold text-gray-900 mb-4 mt-0">{children}</h1>
              ),
              h2: ({ children }) => (
                <h2 className="text-xl font-semibold text-gray-800 mt-6 mb-3">{children}</h2>
              ),
              ul: ({ children }) => (
                <ul className="my-4 space-y-2 list-disc list-inside">{children}</ul>
              ),
              li: ({ children }) => (
                <li className="text-gray-700 leading-relaxed">{children}</li>
              ),
              p: ({ children }) => (
                <p className="text-gray-700 leading-relaxed mb-4">{children}</p>
              ),
              strong: ({ children }) => (
                <strong className="font-semibold text-gray-900">{children}</strong>
              ),
              em: ({ children }) => (
                <em className="italic text-gray-800">{children}</em>
              ),
            }}
          >
            {data.summary}
          </ReactMarkdown>
        </div>
      </motion.div>
    </motion.main>
  );
};