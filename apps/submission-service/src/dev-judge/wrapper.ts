/**
 * Wraps user solution code with a stdin-reading driver harness.
 * The function name and input/output types come from judgeMetadata stored in the DB —
 * the same metadata that generated the starter code the user sees in the editor.
 */

export interface JudgeMeta {
  functionName: string
  inputSchema: string[]
  outputSchema: string
}

export function wrapCode(language: string, userCode: string, meta: JudgeMeta): string {
  switch (language) {
    case 'python3':    return wrapPython(userCode, meta)
    case 'javascript': return wrapJavaScript(userCode, meta)
    case 'typescript': return wrapJavaScript(userCode, meta) // same driver
    case 'java':       return wrapJava(userCode, meta)
    case 'cpp17':      return wrapCpp(userCode, meta)
    default:           return userCode // unsupported: run as-is, will likely error
  }
}

// ─── Python ──────────────────────────────────────────────────────────────────

function wrapPython(code: string, meta: JudgeMeta): string {
  const ind = '        ' // 8 spaces — inside def _driver(): try:
  const inputParsers = meta.inputSchema.map((type, i) => {
    switch (type) {
      case 'intArray':    return `${ind}line${i} = list(map(int, input().strip().lstrip('[').rstrip(']').split(',')))`
      case 'int':         return `${ind}line${i} = int(input().strip())`
      case 'string':      return `${ind}line${i} = input().strip().strip('"')`
      case 'stringArray': return `${ind}line${i} = input().strip().lstrip('[').rstrip(']').replace('"','').split(',')`
      default:            return `${ind}line${i} = input().strip()`
    }
  })
  const args = meta.inputSchema.map((_, i) => `line${i}`).join(', ')
  const callExpr = `Solution().${meta.functionName}(${args})`
  const printer = pythonPrinter(meta.outputSchema)

  return `${code.trimEnd()}

import sys

def _driver():
    if not hasattr(Solution, '${meta.functionName}'):
        print("Your solution must define a method named '${meta.functionName}' inside class Solution.", file=sys.stderr)
        sys.exit(1)
    try:
${inputParsers.join('\n')}
        result = ${callExpr}
        ${printer}
    except Exception as e:
        print(str(e), file=sys.stderr)
        sys.exit(1)

_driver()
`
}

function pythonPrinter(schema: string): string {
  switch (schema) {
    case 'intArray':    return "print('[' + ','.join(map(str, result)) + ']')"
    case 'stringArray': return "print('[' + ','.join(result) + ']')"
    case 'int':         return 'print(result)'
    case 'bool':        return "print('true' if result else 'false')"
    default:            return 'print(result)'
  }
}

// ─── JavaScript / TypeScript ─────────────────────────────────────────────────

function wrapJavaScript(code: string, meta: JudgeMeta): string {
  const inputParsers = meta.inputSchema.map((type, i) => {
    switch (type) {
      case 'intArray':    return `  const line${i} = JSON.parse(lines[${i}]);`
      case 'int':         return `  const line${i} = parseInt(lines[${i}], 10);`
      case 'string':      return `  const line${i} = lines[${i}].replace(/^"|"$/g, '');`
      case 'stringArray': return `  const line${i} = JSON.parse(lines[${i}]);`
      default:            return `  const line${i} = lines[${i}];`
    }
  })
  const args = meta.inputSchema.map((_, i) => `line${i}`).join(', ')
  const printer = jsPrinter(meta.outputSchema)
  // For JS: user code defines a function like `var twoSum = function(...) {...}`
  // The driver calls it directly by name
  return `${code.trimEnd()}

const lines = require('fs').readFileSync('/dev/stdin', 'utf8').trim().split('\\n');
(function main() {
  if (typeof ${meta.functionName} !== 'function') {
    process.stderr.write("Your solution must define a function named '${meta.functionName}'.\\nMake sure you haven't renamed it.\\n");
    process.exit(1);
  }
${inputParsers.join('\n')}
  const result = ${meta.functionName}(${args});
  ${printer}
})();
`
}

function jsPrinter(schema: string): string {
  switch (schema) {
    case 'intArray':
    case 'stringArray': return 'console.log(JSON.stringify(result));'
    case 'int':         return 'console.log(result);'
    case 'bool':        return 'console.log(result ? "true" : "false");'
    default:            return 'console.log(JSON.stringify(result));'
  }
}

// ─── Java ─────────────────────────────────────────────────────────────────────

function wrapJava(code: string, meta: JudgeMeta): string {
  const inputParsers = meta.inputSchema.map((type, i) => {
    switch (type) {
      case 'intArray': return `
        String raw${i} = sc.nextLine().trim().replaceAll("[\\\\[\\\\]]", "");
        int[] line${i} = raw${i}.isEmpty() ? new int[0] : Arrays.stream(raw${i}.split(",")).mapToInt(Integer::parseInt).toArray();`
      case 'int':    return `        int line${i} = Integer.parseInt(sc.nextLine().trim());`
      case 'string': return `        String line${i} = sc.nextLine().trim().replaceAll("^\\"|\\"$", "");`
      default:       return `        String line${i} = sc.nextLine().trim();`
    }
  })
  const args = meta.inputSchema.map((_, i) => `line${i}`).join(', ')
  const printer = javaPrinter(meta.outputSchema)

  return `import java.util.*;
${code.trimEnd()}

class Main {
    public static void main(String[] args) {
        Scanner sc = new Scanner(System.in);
        Solution sol = new Solution();
${inputParsers.join('\n')}
        var result = sol.${meta.functionName}(${args});
        ${printer}
    }
}
`
}

function javaPrinter(schema: string): string {
  switch (schema) {
    case 'intArray': return 'System.out.println(Arrays.toString(result).replaceAll(" ", ""));'
    case 'int':      return 'System.out.println(result);'
    case 'bool':     return 'System.out.println(result);'
    default:         return 'System.out.println(result);'
  }
}

// ─── C++ ─────────────────────────────────────────────────────────────────────

function wrapCpp(code: string, meta: JudgeMeta): string {
  const inputParsers = meta.inputSchema.map((type, i) => {
    switch (type) {
      case 'intArray': return `
    string raw${i}; getline(cin, raw${i});
    vector<int> line${i};
    { istringstream ss(raw${i}); char c; int x; while(ss >> c) if(isdigit(c) || c=='-'){ss.putback(c);ss>>x;line${i}.push_back(x);} }`
      case 'int':    return `    int line${i}; cin >> line${i}; cin.ignore();`
      case 'string': return `    string line${i}; getline(cin, line${i});`
      default:       return `    string line${i}; getline(cin, line${i});`
    }
  })
  const args = meta.inputSchema.map((_, i) => `line${i}`).join(', ')
  const printer = cppPrinter(meta.outputSchema)

  return `#include <bits/stdc++.h>
using namespace std;
${code.trimEnd()}

int main() {
    ios::sync_with_stdio(false); cin.tie(0);
    Solution sol;
${inputParsers.join('\n')}
    auto result = sol.${meta.functionName}(${args});
    ${printer}
    return 0;
}
`
}

function cppPrinter(schema: string): string {
  switch (schema) {
    case 'intArray': return 'cout << "["; for(int i=0;i<(int)result.size();i++){if(i)cout<<",";cout<<result[i];}cout<<"]"<<endl;'
    case 'int':      return 'cout << result << endl;'
    case 'bool':     return 'cout << (result ? "true" : "false") << endl;'
    default:         return 'cout << result << endl;'
  }
}
