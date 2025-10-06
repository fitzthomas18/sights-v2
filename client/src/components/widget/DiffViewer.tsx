import React from "react";

interface DiffViewerProps {
  oldText: string;
  newText: string;
}

interface DiffLine {
  type: 'same' | 'added' | 'removed';
  line: string;
  oldNum?: number;
  newNum?: number;
}

interface Hunk {
  contextBefore: DiffLine[];
  changes: DiffLine[];
  contextAfter: DiffLine[];
}

const DiffViewer: React.FC<DiffViewerProps> = ({ oldText, newText }) => {
  // LCS-based diff algorithm
  const createDiff = (oldText: string, newText: string): Hunk[] => {
    const oldLines = oldText.split('\n');
    const newLines = newText.split('\n');

    const m = oldLines.length;
    const n = newLines.length;
    const dp: number[][] = Array(m + 1).fill(null).map(() => Array(n + 1).fill(0));

    // Build LCS table
    for (let i = 1; i <= m; i++) {
      for (let j = 1; j <= n; j++) {
        if (oldLines[i - 1] === newLines[j - 1]) {
          dp[i][j] = dp[i - 1][j - 1] + 1;
        } else {
          dp[i][j] = Math.max(dp[i - 1][j], dp[i][j - 1]);
        }
      }
    }

    // Backtrack to find diff
    const diff: DiffLine[] = [];
    let i = m, j = n;

    while (i > 0 || j > 0) {
      if (i > 0 && j > 0 && oldLines[i - 1] === newLines[j - 1]) {
        diff.unshift({ type: 'same', line: oldLines[i - 1], oldNum: i, newNum: j });
        i--;
        j--;
      } else if (j > 0 && (i === 0 || dp[i][j - 1] >= dp[i - 1][j])) {
        diff.unshift({ type: 'added', line: newLines[j - 1], newNum: j });
        j--;
      } else if (i > 0) {
        diff.unshift({ type: 'removed', line: oldLines[i - 1], oldNum: i });
        i--;
      }
    }

    // Group consecutive changes into hunks
    const hunks: Hunk[] = [];
    let currentHunk: Hunk | null = null;
    let contextBefore: DiffLine[] = [];
    const CONTEXT_LINES = 3;

    diff.forEach((line) => {
      if (line.type === 'same') {
        if (currentHunk) {
          if (currentHunk.contextAfter.length < CONTEXT_LINES) {
            currentHunk.contextAfter.push(line);
          } else {
            hunks.push(currentHunk);
            currentHunk = null;
            contextBefore = [line];
          }
        } else {
          contextBefore.push(line);
          if (contextBefore.length > CONTEXT_LINES) {
            contextBefore.shift();
          }
        }
      } else {
        if (!currentHunk) {
          currentHunk = {
            contextBefore: [...contextBefore],
            changes: [],
            contextAfter: []
          };
          contextBefore = [];
        }
        currentHunk.changes.push(line);
      }
    });

    if (currentHunk) {
      hunks.push(currentHunk);
    }

    return hunks;
  };

  const hunks = createDiff(oldText, newText);

  return (
    <div className="font-mono text-sm bg-gray-50 dark:bg-neutral-900 rounded-lg overflow-hidden">
      {hunks.length === 0 ? (
        <div className="p-8 text-center text-gray-500 dark:text-gray-400">
          No changes detected
        </div>
      ) : (
        hunks.map((hunk, hunkIdx) => (
          <div key={hunkIdx} className="border-b border-gray-200 dark:border-neutral-700 last:border-b-0">
            {/* Context before */}
            {hunk.contextBefore.map((line, idx) => (
              <div key={`before-${idx}`} className="px-4 py-1 text-gray-600 dark:text-gray-400 bg-gray-50 dark:bg-neutral-900">
                <span className="inline-block w-12 text-gray-400 dark:text-gray-500 select-none text-right mr-4">
                  {line.oldNum}
                </span>
                <span className="inline-block w-12 text-gray-400 dark:text-gray-500 select-none text-right mr-4">
                  {line.newNum}
                </span>
                <span>{line.line || ' '}</span>
              </div>
            ))}

            {/* Changes */}
            <div className="bg-white dark:bg-neutral-800">
              {hunk.changes.map((line, idx) => (
                <div
                  key={`change-${idx}`}
                  className={`
                    px-4 py-1
                    ${line.type === 'removed' ? 'bg-red-50 dark:bg-red-900/20 text-red-700 dark:text-red-300' : ''}
                    ${line.type === 'added' ? 'bg-green-50 dark:bg-green-900/20 text-green-700 dark:text-green-300' : ''}
                  `}
                >
                  <span className="inline-block w-12 text-gray-400 dark:text-gray-500 select-none text-right mr-4">
                    {line.type === 'removed' ? line.oldNum : ''}
                  </span>
                  <span className="inline-block w-12 text-gray-400 dark:text-gray-500 select-none text-right mr-4">
                    {line.type === 'added' ? line.newNum : ''}
                  </span>
                  <span className="inline-block w-6 font-bold select-none">
                    {line.type === 'removed' ? '-' : '+'}
                  </span>
                  <span>{line.line || ' '}</span>
                </div>
              ))}
            </div>

            {/* Context after */}
            {hunk.contextAfter.map((line, idx) => (
              <div key={`after-${idx}`} className="px-4 py-1 text-gray-600 dark:text-gray-400 bg-gray-50 dark:bg-neutral-900">
                <span className="inline-block w-12 text-gray-400 dark:text-gray-500 select-none text-right mr-4">
                  {line.oldNum}
                </span>
                <span className="inline-block w-12 text-gray-400 dark:text-gray-500 select-none text-right mr-4">
                  {line.newNum}
                </span>
                <span>{line.line || ' '}</span>
              </div>
            ))}
          </div>
        ))
      )}
    </div>
  );
};

export default DiffViewer;
