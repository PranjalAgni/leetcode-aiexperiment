// Starter code templates per problem per language.
// These are shown in the editor AND define the exact function signature the judge calls.
// When adding a new problem, add its templates here.

export interface JudgeMeta {
  functionName: string
  inputSchema: Array<'intArray' | 'int' | 'string' | 'stringArray' | 'intMatrix'>
  outputSchema: 'intArray' | 'int' | 'string' | 'bool' | 'stringArray'
}

export interface ProblemTemplates {
  python3: string
  javascript: string
  typescript: string
  java: string
  cpp17: string
  go: string
  rust: string
  meta: JudgeMeta
}

// ─── Problem templates registry ─────────────────────────────────────────────

export const PROBLEM_TEMPLATES: Record<string, ProblemTemplates> = {
  'two-sum': {
    meta: {
      functionName: 'twoSum',
      inputSchema: ['intArray', 'int'],
      outputSchema: 'intArray',
    },
    python3: `class Solution:
    def twoSum(self, nums: list[int], target: int) -> list[int]:
        pass
`,
    javascript: `/**
 * @param {number[]} nums
 * @param {number} target
 * @return {number[]}
 */
var twoSum = function(nums, target) {

};
`,
    typescript: `function twoSum(nums: number[], target: number): number[] {

}
`,
    java: `class Solution {
    public int[] twoSum(int[] nums, int target) {

    }
}
`,
    cpp17: `#include <bits/stdc++.h>
using namespace std;

class Solution {
public:
    vector<int> twoSum(vector<int>& nums, int target) {

    }
};
`,
    go: `package main

func twoSum(nums []int, target int) []int {

}
`,
    rust: `impl Solution {
    pub fn two_sum(nums: Vec<i32>, target: i32) -> Vec<i32> {
        todo!()
    }
}
`,
  },

  'longest-substring-without-repeating-characters': {
    meta: {
      functionName: 'lengthOfLongestSubstring',
      inputSchema: ['string'],
      outputSchema: 'int',
    },
    python3: `class Solution:
    def lengthOfLongestSubstring(self, s: str) -> int:
        pass
`,
    javascript: `/**
 * @param {string} s
 * @return {number}
 */
var lengthOfLongestSubstring = function(s) {

};
`,
    typescript: `function lengthOfLongestSubstring(s: string): number {

}
`,
    java: `class Solution {
    public int lengthOfLongestSubstring(String s) {

    }
}
`,
    cpp17: `#include <bits/stdc++.h>
using namespace std;

class Solution {
public:
    int lengthOfLongestSubstring(string s) {

    }
};
`,
    go: `package main

func lengthOfLongestSubstring(s string) int {

}
`,
    rust: `impl Solution {
    pub fn length_of_longest_substring(s: String) -> i32 {
        todo!()
    }
}
`,
  },

  'trapping-rain-water': {
    meta: {
      functionName: 'trap',
      inputSchema: ['intArray'],
      outputSchema: 'int',
    },
    python3: `class Solution:
    def trap(self, height: list[int]) -> int:
        pass
`,
    javascript: `/**
 * @param {number[]} height
 * @return {number}
 */
var trap = function(height) {

};
`,
    typescript: `function trap(height: number[]): number {

}
`,
    java: `class Solution {
    public int trap(int[] height) {

    }
}
`,
    cpp17: `#include <bits/stdc++.h>
using namespace std;

class Solution {
public:
    int trap(vector<int>& height) {

    }
};
`,
    go: `package main

func trap(height []int) int {

}
`,
    rust: `impl Solution {
    pub fn trap(height: Vec<i32>) -> i32 {
        todo!()
    }
}
`,
  },

  'add-two-numbers': {
    meta: {
      functionName: 'addTwoNumbers',
      inputSchema: ['intArray', 'intArray'], // simplified: pass as arrays, convert to linked list
      outputSchema: 'intArray',
    },
    python3: `# Definition for singly-linked list.
class ListNode:
    def __init__(self, val=0, next=None):
        self.val = val
        self.next = next

class Solution:
    def addTwoNumbers(self, l1: ListNode, l2: ListNode) -> ListNode:
        pass
`,
    javascript: `/**
 * Definition for singly-linked list.
 * function ListNode(val, next) {
 *     this.val = (val===undefined ? 0 : val)
 *     this.next = (next===undefined ? null : next)
 * }
 * @param {ListNode} l1
 * @param {ListNode} l2
 * @return {ListNode}
 */
var addTwoNumbers = function(l1, l2) {

};
`,
    typescript: `class ListNode {
    val: number;
    next: ListNode | null;
    constructor(val?: number, next?: ListNode | null) {
        this.val = (val === undefined ? 0 : val);
        this.next = (next === undefined ? null : next);
    }
}

function addTwoNumbers(l1: ListNode | null, l2: ListNode | null): ListNode | null {

}
`,
    java: `class ListNode {
    int val;
    ListNode next;
    ListNode() {}
    ListNode(int val) { this.val = val; }
    ListNode(int val, ListNode next) { this.val = val; this.next = next; }
}

class Solution {
    public ListNode addTwoNumbers(ListNode l1, ListNode l2) {

    }
}
`,
    cpp17: `#include <bits/stdc++.h>
using namespace std;

struct ListNode {
    int val;
    ListNode *next;
    ListNode() : val(0), next(nullptr) {}
    ListNode(int x) : val(x), next(nullptr) {}
    ListNode(int x, ListNode *next) : val(x), next(next) {}
};

class Solution {
public:
    ListNode* addTwoNumbers(ListNode* l1, ListNode* l2) {

    }
};
`,
    go: `package main

type ListNode struct {
    Val  int
    Next *ListNode
}

func addTwoNumbers(l1 *ListNode, l2 *ListNode) *ListNode {

}
`,
    rust: `#[derive(PartialEq, Eq, Clone, Debug)]
pub struct ListNode {
    pub val: i32,
    pub next: Option<Box<ListNode>>,
}

impl Solution {
    pub fn add_two_numbers(l1: Option<Box<ListNode>>, l2: Option<Box<ListNode>>) -> Option<Box<ListNode>> {
        todo!()
    }
}
`,
  },
}

// Fallback generic template for problems not yet in registry
export function getDefaultTemplate(language: string): string {
  const defaults: Record<string, string> = {
    python3:    'class Solution:\n    def solve(self):\n        pass\n',
    javascript: 'var solve = function() {\n\n};\n',
    typescript: 'function solve(): void {\n\n}\n',
    java:       'class Solution {\n    public void solve() {\n\n    }\n}\n',
    cpp17:      '#include <bits/stdc++.h>\nusing namespace std;\n\nclass Solution {\npublic:\n    void solve() {\n\n    }\n};\n',
    go:         'package main\n\nfunc solve() {\n\n}\n',
    rust:       'fn solve() {\n    todo!()\n}\n',
    csharp:     'public class Solution {\n    public void Solve() {\n\n    }\n}\n',
    kotlin:     'class Solution {\n    fun solve() {\n\n    }\n}\n',
    ruby:       'def solve\n\nend\n',
  }
  return defaults[language] ?? '// write your solution here\n'
}
