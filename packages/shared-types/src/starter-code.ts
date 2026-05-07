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
  // ── Array ──────────────────────────────────────────────────────────────────
  'best-time-to-buy-and-sell-stock': {
    meta: { functionName: 'maxProfit', inputSchema: ['intArray'], outputSchema: 'int' },
    python3: `class Solution:\n    def maxProfit(self, prices: list[int]) -> int:\n        pass\n`,
    javascript: `/**\n * @param {number[]} prices\n * @return {number}\n */\nvar maxProfit = function(prices) {\n\n};\n`,
    typescript: `function maxProfit(prices: number[]): number {\n\n}\n`,
    java: `class Solution {\n    public int maxProfit(int[] prices) {\n\n    }\n}\n`,
    cpp17: `#include <bits/stdc++.h>\nusing namespace std;\n\nclass Solution {\npublic:\n    int maxProfit(vector<int>& prices) {\n\n    }\n};\n`,
    go: `package main\n\nfunc maxProfit(prices []int) int {\n\n}\n`,
    rust: `impl Solution {\n    pub fn max_profit(prices: Vec<i32>) -> i32 {\n        todo!()\n    }\n}\n`,
  },
  'contains-duplicate': {
    meta: { functionName: 'containsDuplicate', inputSchema: ['intArray'], outputSchema: 'bool' },
    python3: `class Solution:\n    def containsDuplicate(self, nums: list[int]) -> bool:\n        pass\n`,
    javascript: `/**\n * @param {number[]} nums\n * @return {boolean}\n */\nvar containsDuplicate = function(nums) {\n\n};\n`,
    typescript: `function containsDuplicate(nums: number[]): boolean {\n\n}\n`,
    java: `class Solution {\n    public boolean containsDuplicate(int[] nums) {\n\n    }\n}\n`,
    cpp17: `#include <bits/stdc++.h>\nusing namespace std;\n\nclass Solution {\npublic:\n    bool containsDuplicate(vector<int>& nums) {\n\n    }\n};\n`,
    go: `package main\n\nfunc containsDuplicate(nums []int) bool {\n\n}\n`,
    rust: `impl Solution {\n    pub fn contains_duplicate(nums: Vec<i32>) -> bool {\n        todo!()\n    }\n}\n`,
  },
  'product-of-array-except-self': {
    meta: { functionName: 'productExceptSelf', inputSchema: ['intArray'], outputSchema: 'intArray' },
    python3: `class Solution:\n    def productExceptSelf(self, nums: list[int]) -> list[int]:\n        pass\n`,
    javascript: `/**\n * @param {number[]} nums\n * @return {number[]}\n */\nvar productExceptSelf = function(nums) {\n\n};\n`,
    typescript: `function productExceptSelf(nums: number[]): number[] {\n\n}\n`,
    java: `class Solution {\n    public int[] productExceptSelf(int[] nums) {\n\n    }\n}\n`,
    cpp17: `#include <bits/stdc++.h>\nusing namespace std;\n\nclass Solution {\npublic:\n    vector<int> productExceptSelf(vector<int>& nums) {\n\n    }\n};\n`,
    go: `package main\n\nfunc productExceptSelf(nums []int) []int {\n\n}\n`,
    rust: `impl Solution {\n    pub fn product_except_self(nums: Vec<i32>) -> Vec<i32> {\n        todo!()\n    }\n}\n`,
  },
  'maximum-subarray': {
    meta: { functionName: 'maxSubArray', inputSchema: ['intArray'], outputSchema: 'int' },
    python3: `class Solution:\n    def maxSubArray(self, nums: list[int]) -> int:\n        pass\n`,
    javascript: `/**\n * @param {number[]} nums\n * @return {number}\n */\nvar maxSubArray = function(nums) {\n\n};\n`,
    typescript: `function maxSubArray(nums: number[]): number {\n\n}\n`,
    java: `class Solution {\n    public int maxSubArray(int[] nums) {\n\n    }\n}\n`,
    cpp17: `#include <bits/stdc++.h>\nusing namespace std;\n\nclass Solution {\npublic:\n    int maxSubArray(vector<int>& nums) {\n\n    }\n};\n`,
    go: `package main\n\nfunc maxSubArray(nums []int) int {\n\n}\n`,
    rust: `impl Solution {\n    pub fn max_sub_array(nums: Vec<i32>) -> i32 {\n        todo!()\n    }\n}\n`,
  },
  'maximum-product-subarray': {
    meta: { functionName: 'maxProduct', inputSchema: ['intArray'], outputSchema: 'int' },
    python3: `class Solution:\n    def maxProduct(self, nums: list[int]) -> int:\n        pass\n`,
    javascript: `/**\n * @param {number[]} nums\n * @return {number}\n */\nvar maxProduct = function(nums) {\n\n};\n`,
    typescript: `function maxProduct(nums: number[]): number {\n\n}\n`,
    java: `class Solution {\n    public int maxProduct(int[] nums) {\n\n    }\n}\n`,
    cpp17: `#include <bits/stdc++.h>\nusing namespace std;\n\nclass Solution {\npublic:\n    int maxProduct(vector<int>& nums) {\n\n    }\n};\n`,
    go: `package main\n\nfunc maxProduct(nums []int) int {\n\n}\n`,
    rust: `impl Solution {\n    pub fn max_product(nums: Vec<i32>) -> i32 {\n        todo!()\n    }\n}\n`,
  },
  'find-minimum-in-rotated-sorted-array': {
    meta: { functionName: 'findMin', inputSchema: ['intArray'], outputSchema: 'int' },
    python3: `class Solution:\n    def findMin(self, nums: list[int]) -> int:\n        pass\n`,
    javascript: `/**\n * @param {number[]} nums\n * @return {number}\n */\nvar findMin = function(nums) {\n\n};\n`,
    typescript: `function findMin(nums: number[]): number {\n\n}\n`,
    java: `class Solution {\n    public int findMin(int[] nums) {\n\n    }\n}\n`,
    cpp17: `#include <bits/stdc++.h>\nusing namespace std;\n\nclass Solution {\npublic:\n    int findMin(vector<int>& nums) {\n\n    }\n};\n`,
    go: `package main\n\nfunc findMin(nums []int) int {\n\n}\n`,
    rust: `impl Solution {\n    pub fn find_min(nums: Vec<i32>) -> i32 {\n        todo!()\n    }\n}\n`,
  },
  'search-in-rotated-sorted-array': {
    meta: { functionName: 'search', inputSchema: ['intArray', 'int'], outputSchema: 'int' },
    python3: `class Solution:\n    def search(self, nums: list[int], target: int) -> int:\n        pass\n`,
    javascript: `/**\n * @param {number[]} nums\n * @param {number} target\n * @return {number}\n */\nvar search = function(nums, target) {\n\n};\n`,
    typescript: `function search(nums: number[], target: number): number {\n\n}\n`,
    java: `class Solution {\n    public int search(int[] nums, int target) {\n\n    }\n}\n`,
    cpp17: `#include <bits/stdc++.h>\nusing namespace std;\n\nclass Solution {\npublic:\n    int search(vector<int>& nums, int target) {\n\n    }\n};\n`,
    go: `package main\n\nfunc search(nums []int, target int) int {\n\n}\n`,
    rust: `impl Solution {\n    pub fn search(nums: Vec<i32>, target: i32) -> i32 {\n        todo!()\n    }\n}\n`,
  },
  'container-with-most-water': {
    meta: { functionName: 'maxArea', inputSchema: ['intArray'], outputSchema: 'int' },
    python3: `class Solution:\n    def maxArea(self, height: list[int]) -> int:\n        pass\n`,
    javascript: `/**\n * @param {number[]} height\n * @return {number}\n */\nvar maxArea = function(height) {\n\n};\n`,
    typescript: `function maxArea(height: number[]): number {\n\n}\n`,
    java: `class Solution {\n    public int maxArea(int[] height) {\n\n    }\n}\n`,
    cpp17: `#include <bits/stdc++.h>\nusing namespace std;\n\nclass Solution {\npublic:\n    int maxArea(vector<int>& height) {\n\n    }\n};\n`,
    go: `package main\n\nfunc maxArea(height []int) int {\n\n}\n`,
    rust: `impl Solution {\n    pub fn max_area(height: Vec<i32>) -> i32 {\n        todo!()\n    }\n}\n`,
  },

  // ── Binary ──────────────────────────────────────────────────────────────────
  'number-of-1-bits': {
    meta: { functionName: 'hammingWeight', inputSchema: ['int'], outputSchema: 'int' },
    python3: `class Solution:\n    def hammingWeight(self, n: int) -> int:\n        pass\n`,
    javascript: `/**\n * @param {number} n\n * @return {number}\n */\nvar hammingWeight = function(n) {\n\n};\n`,
    typescript: `function hammingWeight(n: number): number {\n\n}\n`,
    java: `class Solution {\n    public int hammingWeight(int n) {\n\n    }\n}\n`,
    cpp17: `#include <bits/stdc++.h>\nusing namespace std;\n\nclass Solution {\npublic:\n    int hammingWeight(uint32_t n) {\n\n    }\n};\n`,
    go: `package main\n\nfunc hammingWeight(n uint32) int {\n\n}\n`,
    rust: `impl Solution {\n    pub fn hamming_weight(n: u32) -> i32 {\n        todo!()\n    }\n}\n`,
  },
  'counting-bits': {
    meta: { functionName: 'countBits', inputSchema: ['int'], outputSchema: 'intArray' },
    python3: `class Solution:\n    def countBits(self, n: int) -> list[int]:\n        pass\n`,
    javascript: `/**\n * @param {number} n\n * @return {number[]}\n */\nvar countBits = function(n) {\n\n};\n`,
    typescript: `function countBits(n: number): number[] {\n\n}\n`,
    java: `class Solution {\n    public int[] countBits(int n) {\n\n    }\n}\n`,
    cpp17: `#include <bits/stdc++.h>\nusing namespace std;\n\nclass Solution {\npublic:\n    vector<int> countBits(int n) {\n\n    }\n};\n`,
    go: `package main\n\nfunc countBits(n int) []int {\n\n}\n`,
    rust: `impl Solution {\n    pub fn count_bits(n: i32) -> Vec<i32> {\n        todo!()\n    }\n}\n`,
  },
  'missing-number': {
    meta: { functionName: 'missingNumber', inputSchema: ['intArray'], outputSchema: 'int' },
    python3: `class Solution:\n    def missingNumber(self, nums: list[int]) -> int:\n        pass\n`,
    javascript: `/**\n * @param {number[]} nums\n * @return {number}\n */\nvar missingNumber = function(nums) {\n\n};\n`,
    typescript: `function missingNumber(nums: number[]): number {\n\n}\n`,
    java: `class Solution {\n    public int missingNumber(int[] nums) {\n\n    }\n}\n`,
    cpp17: `#include <bits/stdc++.h>\nusing namespace std;\n\nclass Solution {\npublic:\n    int missingNumber(vector<int>& nums) {\n\n    }\n};\n`,
    go: `package main\n\nfunc missingNumber(nums []int) int {\n\n}\n`,
    rust: `impl Solution {\n    pub fn missing_number(nums: Vec<i32>) -> i32 {\n        todo!()\n    }\n}\n`,
  },
  'reverse-bits': {
    meta: { functionName: 'reverseBits', inputSchema: ['int'], outputSchema: 'int' },
    python3: `class Solution:\n    def reverseBits(self, n: int) -> int:\n        pass\n`,
    javascript: `/**\n * @param {number} n - a positive integer\n * @return {number} - a positive integer\n */\nvar reverseBits = function(n) {\n\n};\n`,
    typescript: `function reverseBits(n: number): number {\n\n}\n`,
    java: `public class Solution {\n    public int reverseBits(int n) {\n\n    }\n}\n`,
    cpp17: `#include <bits/stdc++.h>\nusing namespace std;\n\nclass Solution {\npublic:\n    uint32_t reverseBits(uint32_t n) {\n\n    }\n};\n`,
    go: `package main\n\nfunc reverseBits(num uint32) uint32 {\n\n}\n`,
    rust: `impl Solution {\n    pub fn reverse_bits(x: u32) -> u32 {\n        todo!()\n    }\n}\n`,
  },
  'sum-of-two-integers': {
    meta: { functionName: 'getSum', inputSchema: ['int', 'int'], outputSchema: 'int' },
    python3: `class Solution:\n    def getSum(self, a: int, b: int) -> int:\n        pass\n`,
    javascript: `/**\n * @param {number} a\n * @param {number} b\n * @return {number}\n */\nvar getSum = function(a, b) {\n\n};\n`,
    typescript: `function getSum(a: number, b: number): number {\n\n}\n`,
    java: `class Solution {\n    public int getSum(int a, int b) {\n\n    }\n}\n`,
    cpp17: `#include <bits/stdc++.h>\nusing namespace std;\n\nclass Solution {\npublic:\n    int getSum(int a, int b) {\n\n    }\n};\n`,
    go: `package main\n\nfunc getSum(a int, b int) int {\n\n}\n`,
    rust: `impl Solution {\n    pub fn get_sum(a: i32, b: i32) -> i32 {\n        todo!()\n    }\n}\n`,
  },

  // ── Dynamic Programming ─────────────────────────────────────────────────────
  'climbing-stairs': {
    meta: { functionName: 'climbStairs', inputSchema: ['int'], outputSchema: 'int' },
    python3: `class Solution:\n    def climbStairs(self, n: int) -> int:\n        pass\n`,
    javascript: `/**\n * @param {number} n\n * @return {number}\n */\nvar climbStairs = function(n) {\n\n};\n`,
    typescript: `function climbStairs(n: number): number {\n\n}\n`,
    java: `class Solution {\n    public int climbStairs(int n) {\n\n    }\n}\n`,
    cpp17: `#include <bits/stdc++.h>\nusing namespace std;\n\nclass Solution {\npublic:\n    int climbStairs(int n) {\n\n    }\n};\n`,
    go: `package main\n\nfunc climbStairs(n int) int {\n\n}\n`,
    rust: `impl Solution {\n    pub fn climb_stairs(n: i32) -> i32 {\n        todo!()\n    }\n}\n`,
  },
  'coin-change': {
    meta: { functionName: 'coinChange', inputSchema: ['intArray', 'int'], outputSchema: 'int' },
    python3: `class Solution:\n    def coinChange(self, coins: list[int], amount: int) -> int:\n        pass\n`,
    javascript: `/**\n * @param {number[]} coins\n * @param {number} amount\n * @return {number}\n */\nvar coinChange = function(coins, amount) {\n\n};\n`,
    typescript: `function coinChange(coins: number[], amount: number): number {\n\n}\n`,
    java: `class Solution {\n    public int coinChange(int[] coins, int amount) {\n\n    }\n}\n`,
    cpp17: `#include <bits/stdc++.h>\nusing namespace std;\n\nclass Solution {\npublic:\n    int coinChange(vector<int>& coins, int amount) {\n\n    }\n};\n`,
    go: `package main\n\nfunc coinChange(coins []int, amount int) int {\n\n}\n`,
    rust: `impl Solution {\n    pub fn coin_change(coins: Vec<i32>, amount: i32) -> i32 {\n        todo!()\n    }\n}\n`,
  },
  'longest-increasing-subsequence': {
    meta: { functionName: 'lengthOfLIS', inputSchema: ['intArray'], outputSchema: 'int' },
    python3: `class Solution:\n    def lengthOfLIS(self, nums: list[int]) -> int:\n        pass\n`,
    javascript: `/**\n * @param {number[]} nums\n * @return {number}\n */\nvar lengthOfLIS = function(nums) {\n\n};\n`,
    typescript: `function lengthOfLIS(nums: number[]): number {\n\n}\n`,
    java: `class Solution {\n    public int lengthOfLIS(int[] nums) {\n\n    }\n}\n`,
    cpp17: `#include <bits/stdc++.h>\nusing namespace std;\n\nclass Solution {\npublic:\n    int lengthOfLIS(vector<int>& nums) {\n\n    }\n};\n`,
    go: `package main\n\nfunc lengthOfLIS(nums []int) int {\n\n}\n`,
    rust: `impl Solution {\n    pub fn length_of_lis(nums: Vec<i32>) -> i32 {\n        todo!()\n    }\n}\n`,
  },
  'house-robber': {
    meta: { functionName: 'rob', inputSchema: ['intArray'], outputSchema: 'int' },
    python3: `class Solution:\n    def rob(self, nums: list[int]) -> int:\n        pass\n`,
    javascript: `/**\n * @param {number[]} nums\n * @return {number}\n */\nvar rob = function(nums) {\n\n};\n`,
    typescript: `function rob(nums: number[]): number {\n\n}\n`,
    java: `class Solution {\n    public int rob(int[] nums) {\n\n    }\n}\n`,
    cpp17: `#include <bits/stdc++.h>\nusing namespace std;\n\nclass Solution {\npublic:\n    int rob(vector<int>& nums) {\n\n    }\n};\n`,
    go: `package main\n\nfunc rob(nums []int) int {\n\n}\n`,
    rust: `impl Solution {\n    pub fn rob(nums: Vec<i32>) -> i32 {\n        todo!()\n    }\n}\n`,
  },
  'house-robber-ii': {
    meta: { functionName: 'rob', inputSchema: ['intArray'], outputSchema: 'int' },
    python3: `class Solution:\n    def rob(self, nums: list[int]) -> int:\n        pass\n`,
    javascript: `/**\n * @param {number[]} nums\n * @return {number}\n */\nvar rob = function(nums) {\n\n};\n`,
    typescript: `function rob(nums: number[]): number {\n\n}\n`,
    java: `class Solution {\n    public int rob(int[] nums) {\n\n    }\n}\n`,
    cpp17: `#include <bits/stdc++.h>\nusing namespace std;\n\nclass Solution {\npublic:\n    int rob(vector<int>& nums) {\n\n    }\n};\n`,
    go: `package main\n\nfunc rob(nums []int) int {\n\n}\n`,
    rust: `impl Solution {\n    pub fn rob(nums: Vec<i32>) -> i32 {\n        todo!()\n    }\n}\n`,
  },
  'unique-paths': {
    meta: { functionName: 'uniquePaths', inputSchema: ['int', 'int'], outputSchema: 'int' },
    python3: `class Solution:\n    def uniquePaths(self, m: int, n: int) -> int:\n        pass\n`,
    javascript: `/**\n * @param {number} m\n * @param {number} n\n * @return {number}\n */\nvar uniquePaths = function(m, n) {\n\n};\n`,
    typescript: `function uniquePaths(m: number, n: number): number {\n\n}\n`,
    java: `class Solution {\n    public int uniquePaths(int m, int n) {\n\n    }\n}\n`,
    cpp17: `#include <bits/stdc++.h>\nusing namespace std;\n\nclass Solution {\npublic:\n    int uniquePaths(int m, int n) {\n\n    }\n};\n`,
    go: `package main\n\nfunc uniquePaths(m int, n int) int {\n\n}\n`,
    rust: `impl Solution {\n    pub fn unique_paths(m: i32, n: i32) -> i32 {\n        todo!()\n    }\n}\n`,
  },
  'jump-game': {
    meta: { functionName: 'canJump', inputSchema: ['intArray'], outputSchema: 'bool' },
    python3: `class Solution:\n    def canJump(self, nums: list[int]) -> bool:\n        pass\n`,
    javascript: `/**\n * @param {number[]} nums\n * @return {boolean}\n */\nvar canJump = function(nums) {\n\n};\n`,
    typescript: `function canJump(nums: number[]): boolean {\n\n}\n`,
    java: `class Solution {\n    public boolean canJump(int[] nums) {\n\n    }\n}\n`,
    cpp17: `#include <bits/stdc++.h>\nusing namespace std;\n\nclass Solution {\npublic:\n    bool canJump(vector<int>& nums) {\n\n    }\n};\n`,
    go: `package main\n\nfunc canJump(nums []int) bool {\n\n}\n`,
    rust: `impl Solution {\n    pub fn can_jump(nums: Vec<i32>) -> bool {\n        todo!()\n    }\n}\n`,
  },
  'combination-sum-iv': {
    meta: { functionName: 'combinationSum4', inputSchema: ['intArray', 'int'], outputSchema: 'int' },
    python3: `class Solution:\n    def combinationSum4(self, nums: list[int], target: int) -> int:\n        pass\n`,
    javascript: `/**\n * @param {number[]} nums\n * @param {number} target\n * @return {number}\n */\nvar combinationSum4 = function(nums, target) {\n\n};\n`,
    typescript: `function combinationSum4(nums: number[], target: number): number {\n\n}\n`,
    java: `class Solution {\n    public int combinationSum4(int[] nums, int target) {\n\n    }\n}\n`,
    cpp17: `#include <bits/stdc++.h>\nusing namespace std;\n\nclass Solution {\npublic:\n    int combinationSum4(vector<int>& nums, int target) {\n\n    }\n};\n`,
    go: `package main\n\nfunc combinationSum4(nums []int, target int) int {\n\n}\n`,
    rust: `impl Solution {\n    pub fn combination_sum4(nums: Vec<i32>, target: i32) -> i32 {\n        todo!()\n    }\n}\n`,
  },

  // ── String ──────────────────────────────────────────────────────────────────
  'valid-anagram': {
    meta: { functionName: 'isAnagram', inputSchema: ['string', 'string'], outputSchema: 'bool' },
    python3: `class Solution:\n    def isAnagram(self, s: str, t: str) -> bool:\n        pass\n`,
    javascript: `/**\n * @param {string} s\n * @param {string} t\n * @return {boolean}\n */\nvar isAnagram = function(s, t) {\n\n};\n`,
    typescript: `function isAnagram(s: string, t: string): boolean {\n\n}\n`,
    java: `class Solution {\n    public boolean isAnagram(String s, String t) {\n\n    }\n}\n`,
    cpp17: `#include <bits/stdc++.h>\nusing namespace std;\n\nclass Solution {\npublic:\n    bool isAnagram(string s, string t) {\n\n    }\n};\n`,
    go: `package main\n\nfunc isAnagram(s string, t string) bool {\n\n}\n`,
    rust: `impl Solution {\n    pub fn is_anagram(s: String, t: String) -> bool {\n        todo!()\n    }\n}\n`,
  },
  'valid-palindrome': {
    meta: { functionName: 'isPalindrome', inputSchema: ['string'], outputSchema: 'bool' },
    python3: `class Solution:\n    def isPalindrome(self, s: str) -> bool:\n        pass\n`,
    javascript: `/**\n * @param {string} s\n * @return {boolean}\n */\nvar isPalindrome = function(s) {\n\n};\n`,
    typescript: `function isPalindrome(s: string): boolean {\n\n}\n`,
    java: `class Solution {\n    public boolean isPalindrome(String s) {\n\n    }\n}\n`,
    cpp17: `#include <bits/stdc++.h>\nusing namespace std;\n\nclass Solution {\npublic:\n    bool isPalindrome(string s) {\n\n    }\n};\n`,
    go: `package main\n\nfunc isPalindrome(s string) bool {\n\n}\n`,
    rust: `impl Solution {\n    pub fn is_palindrome(s: String) -> bool {\n        todo!()\n    }\n}\n`,
  },
  'valid-parentheses': {
    meta: { functionName: 'isValid', inputSchema: ['string'], outputSchema: 'bool' },
    python3: `class Solution:\n    def isValid(self, s: str) -> bool:\n        pass\n`,
    javascript: `/**\n * @param {string} s\n * @return {boolean}\n */\nvar isValid = function(s) {\n\n};\n`,
    typescript: `function isValid(s: string): boolean {\n\n}\n`,
    java: `class Solution {\n    public boolean isValid(String s) {\n\n    }\n}\n`,
    cpp17: `#include <bits/stdc++.h>\nusing namespace std;\n\nclass Solution {\npublic:\n    bool isValid(string s) {\n\n    }\n};\n`,
    go: `package main\n\nfunc isValid(s string) bool {\n\n}\n`,
    rust: `impl Solution {\n    pub fn is_valid(s: String) -> bool {\n        todo!()\n    }\n}\n`,
  },
  'palindromic-substrings': {
    meta: { functionName: 'countSubstrings', inputSchema: ['string'], outputSchema: 'int' },
    python3: `class Solution:\n    def countSubstrings(self, s: str) -> int:\n        pass\n`,
    javascript: `/**\n * @param {string} s\n * @return {number}\n */\nvar countSubstrings = function(s) {\n\n};\n`,
    typescript: `function countSubstrings(s: string): number {\n\n}\n`,
    java: `class Solution {\n    public int countSubstrings(String s) {\n\n    }\n}\n`,
    cpp17: `#include <bits/stdc++.h>\nusing namespace std;\n\nclass Solution {\npublic:\n    int countSubstrings(string s) {\n\n    }\n};\n`,
    go: `package main\n\nfunc countSubstrings(s string) int {\n\n}\n`,
    rust: `impl Solution {\n    pub fn count_substrings(s: String) -> i32 {\n        todo!()\n    }\n}\n`,
  },
  'decode-ways': {
    meta: { functionName: 'numDecodings', inputSchema: ['string'], outputSchema: 'int' },
    python3: `class Solution:\n    def numDecodings(self, s: str) -> int:\n        pass\n`,
    javascript: `/**\n * @param {string} s\n * @return {number}\n */\nvar numDecodings = function(s) {\n\n};\n`,
    typescript: `function numDecodings(s: string): number {\n\n}\n`,
    java: `class Solution {\n    public int numDecodings(String s) {\n\n    }\n}\n`,
    cpp17: `#include <bits/stdc++.h>\nusing namespace std;\n\nclass Solution {\npublic:\n    int numDecodings(string s) {\n\n    }\n};\n`,
    go: `package main\n\nfunc numDecodings(s string) int {\n\n}\n`,
    rust: `impl Solution {\n    pub fn num_decodings(s: String) -> i32 {\n        todo!()\n    }\n}\n`,
  },

  // ── Graph ───────────────────────────────────────────────────────────────────
  'longest-consecutive-sequence': {
    meta: { functionName: 'longestConsecutive', inputSchema: ['intArray'], outputSchema: 'int' },
    python3: `class Solution:\n    def longestConsecutive(self, nums: list[int]) -> int:\n        pass\n`,
    javascript: `/**\n * @param {number[]} nums\n * @return {number}\n */\nvar longestConsecutive = function(nums) {\n\n};\n`,
    typescript: `function longestConsecutive(nums: number[]): number {\n\n}\n`,
    java: `class Solution {\n    public int longestConsecutive(int[] nums) {\n\n    }\n}\n`,
    cpp17: `#include <bits/stdc++.h>\nusing namespace std;\n\nclass Solution {\npublic:\n    int longestConsecutive(vector<int>& nums) {\n\n    }\n};\n`,
    go: `package main\n\nfunc longestConsecutive(nums []int) int {\n\n}\n`,
    rust: `impl Solution {\n    pub fn longest_consecutive(nums: Vec<i32>) -> i32 {\n        todo!()\n    }\n}\n`,
  },

  // ── Heap ────────────────────────────────────────────────────────────────────
  'kth-largest-element-in-an-array': {
    meta: { functionName: 'findKthLargest', inputSchema: ['intArray', 'int'], outputSchema: 'int' },
    python3: `class Solution:\n    def findKthLargest(self, nums: list[int], k: int) -> int:\n        pass\n`,
    javascript: `/**\n * @param {number[]} nums\n * @param {number} k\n * @return {number}\n */\nvar findKthLargest = function(nums, k) {\n\n};\n`,
    typescript: `function findKthLargest(nums: number[], k: number): number {\n\n}\n`,
    java: `class Solution {\n    public int findKthLargest(int[] nums, int k) {\n\n    }\n}\n`,
    cpp17: `#include <bits/stdc++.h>\nusing namespace std;\n\nclass Solution {\npublic:\n    int findKthLargest(vector<int>& nums, int k) {\n\n    }\n};\n`,
    go: `package main\n\nfunc findKthLargest(nums []int, k int) int {\n\n}\n`,
    rust: `impl Solution {\n    pub fn find_kth_largest(nums: Vec<i32>, k: i32) -> i32 {\n        todo!()\n    }\n}\n`,
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
