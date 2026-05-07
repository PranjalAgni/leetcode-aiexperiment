import { PrismaClient, Difficulty, ProblemStatus } from '@prisma/client'
import bcrypt from 'bcryptjs'

const prisma = new PrismaClient()

async function main() {
  console.log('Seeding database...')

  // Create tags
  const tags = await Promise.all(
    [
      { name: 'Array', slug: 'array' },
      { name: 'String', slug: 'string' },
      { name: 'Hash Table', slug: 'hash-table' },
      { name: 'Dynamic Programming', slug: 'dynamic-programming' },
      { name: 'Math', slug: 'math' },
      { name: 'Two Pointers', slug: 'two-pointers' },
      { name: 'Binary Search', slug: 'binary-search' },
      { name: 'Tree', slug: 'tree' },
      { name: 'Graph', slug: 'graph' },
      { name: 'Sliding Window', slug: 'sliding-window' },
      { name: 'Linked List', slug: 'linked-list' },
      { name: 'Stack', slug: 'stack' },
      { name: 'Heap', slug: 'heap' },
      { name: 'Interval', slug: 'interval' },
      { name: 'Matrix', slug: 'matrix' },
      { name: 'Bit Manipulation', slug: 'bit-manipulation' },
      { name: 'Backtracking', slug: 'backtracking' },
      { name: 'Trie', slug: 'trie' },
      { name: 'Greedy', slug: 'greedy' },
    ].map((tag) =>
      prisma.tag.upsert({
        where: { slug: tag.slug },
        update: {},
        create: tag,
      })
    )
  )

  // Create admin user
  const adminPassword = await bcrypt.hash('Admin123!', 12)
  const admin = await prisma.user.upsert({
    where: { email: 'admin@algoarena.dev' },
    update: {},
    create: {
      email: 'admin@algoarena.dev',
      username: 'admin',
      passwordHash: adminPassword,
      displayName: 'Admin',
      role: 'admin',
      emailVerified: true,
    },
  })

  // Create test user
  const userPassword = await bcrypt.hash('User123!', 12)
  await prisma.user.upsert({
    where: { email: 'user@algoarena.dev' },
    update: {},
    create: {
      email: 'user@algoarena.dev',
      username: 'testuser',
      passwordHash: userPassword,
      displayName: 'Test User',
      emailVerified: true,
    },
  })

  // ─── Blind 75 Problems ───────────────────────────────────────────────────────
  const problems = [
    // ── Array ──────────────────────────────────────────────────────────────────
    {
      number: 1,
      title: 'Two Sum',
      slug: 'two-sum',
      difficulty: Difficulty.easy,
      description: `Given an array of integers \`nums\` and an integer \`target\`, return *indices of the two numbers such that they add up to* \`target\`.

You may assume that each input would have **exactly one solution**, and you may not use the same element twice.

You can return the answer in any order.

**Example 1:**
\`\`\`
Input: nums = [2,7,11,15], target = 9
Output: [0,1]
Explanation: Because nums[0] + nums[1] == 9, we return [0, 1].
\`\`\`

**Example 2:**
\`\`\`
Input: nums = [3,2,4], target = 6
Output: [1,2]
\`\`\``,
      constraints: `- \`2 <= nums.length <= 10^4\`
- \`-10^9 <= nums[i] <= 10^9\`
- \`-10^9 <= target <= 10^9\`
- **Only one valid answer exists.**`,
      hints: ['Try using a hash map to store numbers you have seen so far.'],
      tags: ['array', 'hash-table'],
      testCases: [
        { input: '[2,7,11,15]\n9', expectedOutput: '[0,1]', isSample: true, orderIndex: 0 },
        { input: '[3,2,4]\n6', expectedOutput: '[1,2]', isSample: true, orderIndex: 1 },
        { input: '[3,3]\n6', expectedOutput: '[0,1]', isSample: false, orderIndex: 2 },
        { input: '[1,2,3,4,5]\n9', expectedOutput: '[3,4]', isSample: false, orderIndex: 3 },
      ],
    },
    {
      number: 121,
      title: 'Best Time to Buy and Sell Stock',
      slug: 'best-time-to-buy-and-sell-stock',
      difficulty: Difficulty.easy,
      description: `You are given an array \`prices\` where \`prices[i]\` is the price of a given stock on the \`i\`th day.

You want to maximize your profit by choosing a **single day** to buy one stock and choosing a **different day in the future** to sell that stock.

Return *the maximum profit you can achieve from this transaction*. If you cannot achieve any profit, return \`0\`.

**Example 1:**
\`\`\`
Input: prices = [7,1,5,3,6,4]
Output: 5
Explanation: Buy on day 2 (price = 1) and sell on day 5 (price = 6), profit = 6-1 = 5.
\`\`\`

**Example 2:**
\`\`\`
Input: prices = [7,6,4,3,1]
Output: 0
Explanation: No profit is possible.
\`\`\``,
      constraints: `- \`1 <= prices.length <= 10^5\`
- \`0 <= prices[i] <= 10^4\``,
      hints: ['Track the minimum price seen so far and the maximum profit achievable.'],
      tags: ['array', 'dynamic-programming'],
      testCases: [
        { input: '[7,1,5,3,6,4]', expectedOutput: '5', isSample: true, orderIndex: 0 },
        { input: '[7,6,4,3,1]', expectedOutput: '0', isSample: true, orderIndex: 1 },
        { input: '[2,4,1]', expectedOutput: '2', isSample: false, orderIndex: 2 },
        { input: '[3,1,4,8,7,2,6]', expectedOutput: '7', isSample: false, orderIndex: 3 },
      ],
    },
    {
      number: 217,
      title: 'Contains Duplicate',
      slug: 'contains-duplicate',
      difficulty: Difficulty.easy,
      description: `Given an integer array \`nums\`, return \`true\` if any value appears **at least twice** in the array, and return \`false\` if every element is distinct.

**Example 1:**
\`\`\`
Input: nums = [1,2,3,1]
Output: true
\`\`\`

**Example 2:**
\`\`\`
Input: nums = [1,2,3,4]
Output: false
\`\`\``,
      constraints: `- \`1 <= nums.length <= 10^5\`
- \`-10^9 <= nums[i] <= 10^9\``,
      hints: ['Use a hash set to track seen elements.'],
      tags: ['array', 'hash-table'],
      testCases: [
        { input: '[1,2,3,1]', expectedOutput: 'true', isSample: true, orderIndex: 0 },
        { input: '[1,2,3,4]', expectedOutput: 'false', isSample: true, orderIndex: 1 },
        { input: '[1,1,1,3,3,4,3,2,4,2]', expectedOutput: 'true', isSample: false, orderIndex: 2 },
        { input: '[5]', expectedOutput: 'false', isSample: false, orderIndex: 3 },
      ],
    },
    {
      number: 238,
      title: 'Product of Array Except Self',
      slug: 'product-of-array-except-self',
      difficulty: Difficulty.medium,
      description: `Given an integer array \`nums\`, return *an array* \`answer\` *such that* \`answer[i]\` *is equal to the product of all the elements of* \`nums\` *except* \`nums[i]\`.

The product of any prefix or suffix of \`nums\` is **guaranteed** to fit in a **32-bit** integer.

You must write an algorithm that runs in \`O(n)\` time and without using the division operation.

**Example 1:**
\`\`\`
Input: nums = [1,2,3,4]
Output: [24,12,8,6]
\`\`\`

**Example 2:**
\`\`\`
Input: nums = [-1,1,0,-3,3]
Output: [0,0,9,0,0]
\`\`\``,
      constraints: `- \`2 <= nums.length <= 10^5\`
- \`-30 <= nums[i] <= 30\`
- The product of any prefix or suffix of \`nums\` is guaranteed to fit in a 32-bit integer.`,
      hints: ['Build a prefix product array and a suffix product array.'],
      tags: ['array'],
      testCases: [
        { input: '[1,2,3,4]', expectedOutput: '[24,12,8,6]', isSample: true, orderIndex: 0 },
        { input: '[-1,1,0,-3,3]', expectedOutput: '[0,0,9,0,0]', isSample: true, orderIndex: 1 },
        { input: '[2,3,4]', expectedOutput: '[12,8,6]', isSample: false, orderIndex: 2 },
        { input: '[1,0]', expectedOutput: '[0,1]', isSample: false, orderIndex: 3 },
      ],
    },
    {
      number: 53,
      title: 'Maximum Subarray',
      slug: 'maximum-subarray',
      difficulty: Difficulty.medium,
      description: `Given an integer array \`nums\`, find the subarray with the largest sum, and return *its sum*.

**Example 1:**
\`\`\`
Input: nums = [-2,1,-3,4,-1,2,1,-5,4]
Output: 6
Explanation: The subarray [4,-1,2,1] has the largest sum 6.
\`\`\`

**Example 2:**
\`\`\`
Input: nums = [1]
Output: 1
\`\`\``,
      constraints: `- \`1 <= nums.length <= 10^5\`
- \`-10^4 <= nums[i] <= 10^4\``,
      hints: ['Use Kadane\'s algorithm: track current sum and reset to 0 if it goes negative.'],
      tags: ['array', 'dynamic-programming'],
      testCases: [
        { input: '[-2,1,-3,4,-1,2,1,-5,4]', expectedOutput: '6', isSample: true, orderIndex: 0 },
        { input: '[1]', expectedOutput: '1', isSample: true, orderIndex: 1 },
        { input: '[5,4,-1,7,8]', expectedOutput: '23', isSample: false, orderIndex: 2 },
        { input: '[-1,-2,-3]', expectedOutput: '-1', isSample: false, orderIndex: 3 },
      ],
    },
    {
      number: 152,
      title: 'Maximum Product Subarray',
      slug: 'maximum-product-subarray',
      difficulty: Difficulty.medium,
      description: `Given an integer array \`nums\`, find a subarray that has the largest product, and return *the product*.

**Example 1:**
\`\`\`
Input: nums = [2,3,-2,4]
Output: 6
Explanation: [2,3] has the largest product 6.
\`\`\`

**Example 2:**
\`\`\`
Input: nums = [-2,0,-1]
Output: 0
\`\`\``,
      constraints: `- \`1 <= nums.length <= 2 * 10^4\`
- \`-10 <= nums[i] <= 10\`
- The product of any prefix or suffix of \`nums\` is guaranteed to fit in a 32-bit integer.`,
      hints: ['Track both the maximum and minimum product ending at each position, since a negative * negative = positive.'],
      tags: ['array', 'dynamic-programming'],
      testCases: [
        { input: '[2,3,-2,4]', expectedOutput: '6', isSample: true, orderIndex: 0 },
        { input: '[-2,0,-1]', expectedOutput: '0', isSample: true, orderIndex: 1 },
        { input: '[-2,3,-4]', expectedOutput: '24', isSample: false, orderIndex: 2 },
        { input: '[0,2]', expectedOutput: '2', isSample: false, orderIndex: 3 },
      ],
    },
    {
      number: 153,
      title: 'Find Minimum in Rotated Sorted Array',
      slug: 'find-minimum-in-rotated-sorted-array',
      difficulty: Difficulty.medium,
      description: `Suppose an array of length \`n\` sorted in ascending order is **rotated** between \`1\` and \`n\` times. Given the sorted rotated array \`nums\` of **unique** elements, return *the minimum element of this array*.

You must write an algorithm that runs in \`O(log n)\` time.

**Example 1:**
\`\`\`
Input: nums = [3,4,5,1,2]
Output: 1
\`\`\`

**Example 2:**
\`\`\`
Input: nums = [4,5,6,7,0,1,2]
Output: 0
\`\`\``,
      constraints: `- \`n == nums.length\`
- \`1 <= n <= 5000\`
- \`-5000 <= nums[i] <= 5000\`
- All the integers of \`nums\` are unique.
- \`nums\` is sorted and rotated between 1 and n times.`,
      hints: ['Use binary search. The minimum is in the unsorted half.'],
      tags: ['array', 'binary-search'],
      testCases: [
        { input: '[3,4,5,1,2]', expectedOutput: '1', isSample: true, orderIndex: 0 },
        { input: '[4,5,6,7,0,1,2]', expectedOutput: '0', isSample: true, orderIndex: 1 },
        { input: '[11,13,15,17]', expectedOutput: '11', isSample: false, orderIndex: 2 },
        { input: '[2,1]', expectedOutput: '1', isSample: false, orderIndex: 3 },
      ],
    },
    {
      number: 33,
      title: 'Search in Rotated Sorted Array',
      slug: 'search-in-rotated-sorted-array',
      difficulty: Difficulty.medium,
      description: `Given the array \`nums\` after the possible rotation and an integer \`target\`, return *the index of* \`target\` *if it is in* \`nums\`*, or* \`-1\` *if it is not in* \`nums\`.

You must write an algorithm with \`O(log n)\` runtime complexity.

**Example 1:**
\`\`\`
Input: nums = [4,5,6,7,0,1,2], target = 0
Output: 4
\`\`\`

**Example 2:**
\`\`\`
Input: nums = [4,5,6,7,0,1,2], target = 3
Output: -1
\`\`\``,
      constraints: `- \`1 <= nums.length <= 5000\`
- \`-10^4 <= nums[i] <= 10^4\`
- All values of \`nums\` are unique.
- \`nums\` is an ascending array that is possibly rotated.
- \`-10^4 <= target <= 10^4\``,
      hints: ['Use binary search. Determine which half is sorted, then check if target is in that half.'],
      tags: ['array', 'binary-search'],
      testCases: [
        { input: '[4,5,6,7,0,1,2]\n0', expectedOutput: '4', isSample: true, orderIndex: 0 },
        { input: '[4,5,6,7,0,1,2]\n3', expectedOutput: '-1', isSample: true, orderIndex: 1 },
        { input: '[1]\n0', expectedOutput: '-1', isSample: false, orderIndex: 2 },
        { input: '[1,3,5]\n3', expectedOutput: '1', isSample: false, orderIndex: 3 },
      ],
    },
    {
      number: 15,
      title: '3Sum',
      slug: '3sum',
      difficulty: Difficulty.medium,
      description: `Given an integer array \`nums\`, return all the triplets \`[nums[i], nums[j], nums[k]]\` such that \`i != j\`, \`i != k\`, and \`j != k\`, and \`nums[i] + nums[j] + nums[k] == 0\`.

Notice that the solution set must not contain duplicate triplets.

**Example 1:**
\`\`\`
Input: nums = [-1,0,1,2,-1,-4]
Output: [[-1,-1,2],[-1,0,1]]
\`\`\`

**Example 2:**
\`\`\`
Input: nums = [0,1,1]
Output: []
\`\`\``,
      constraints: `- \`3 <= nums.length <= 3000\`
- \`-10^5 <= nums[i] <= 10^5\``,
      hints: ['Sort the array first, then use two pointers for the inner loop.'],
      tags: ['array', 'two-pointers'],
      testCases: [
        { input: '[-1,0,1,2,-1,-4]', expectedOutput: '[[-1,-1,2],[-1,0,1]]', isSample: true, orderIndex: 0 },
        { input: '[0,1,1]', expectedOutput: '[]', isSample: true, orderIndex: 1 },
        { input: '[0,0,0]', expectedOutput: '[[0,0,0]]', isSample: false, orderIndex: 2 },
        { input: '[-2,0,1,1,2]', expectedOutput: '[[-2,0,2],[-2,1,1]]', isSample: false, orderIndex: 3 },
      ],
    },
    {
      number: 11,
      title: 'Container With Most Water',
      slug: 'container-with-most-water',
      difficulty: Difficulty.medium,
      description: `You are given an integer array \`height\` of length \`n\`. There are \`n\` vertical lines drawn such that the two endpoints of the \`i\`th line are \`(i, 0)\` and \`(i, height[i])\`.

Find two lines that together with the x-axis form a container, such that the container contains the most water.

Return *the maximum amount of water a container can store*.

**Example 1:**
\`\`\`
Input: height = [1,8,6,2,5,4,8,3,7]
Output: 49
\`\`\`

**Example 2:**
\`\`\`
Input: height = [1,1]
Output: 1
\`\`\``,
      constraints: `- \`n == height.length\`
- \`2 <= n <= 10^5\`
- \`0 <= height[i] <= 10^4\``,
      hints: ['Use two pointers starting from both ends. Move the pointer with the smaller height inward.'],
      tags: ['array', 'two-pointers', 'greedy'],
      testCases: [
        { input: '[1,8,6,2,5,4,8,3,7]', expectedOutput: '49', isSample: true, orderIndex: 0 },
        { input: '[1,1]', expectedOutput: '1', isSample: true, orderIndex: 1 },
        { input: '[4,3,2,1,4]', expectedOutput: '16', isSample: false, orderIndex: 2 },
        { input: '[1,2,1]', expectedOutput: '2', isSample: false, orderIndex: 3 },
      ],
    },
    {
      number: 42,
      title: 'Trapping Rain Water',
      slug: 'trapping-rain-water',
      difficulty: Difficulty.hard,
      description: `Given \`n\` non-negative integers representing an elevation map where the width of each bar is \`1\`, compute how much water it can trap after raining.

**Example 1:**
\`\`\`
Input: height = [0,1,0,2,1,0,1,3,2,1,2,1]
Output: 6
\`\`\``,
      constraints: `- \`n == height.length\`
- \`1 <= n <= 2 * 10^4\`
- \`0 <= height[i] <= 10^5\``,
      hints: ['For each position, the water trapped is min(max_left, max_right) - height[i].'],
      tags: ['array', 'two-pointers', 'dynamic-programming'],
      testCases: [
        { input: '[0,1,0,2,1,0,1,3,2,1,2,1]', expectedOutput: '6', isSample: true, orderIndex: 0 },
        { input: '[4,2,0,3,2,5]', expectedOutput: '9', isSample: true, orderIndex: 1 },
        { input: '[3,0,2,0,4]', expectedOutput: '7', isSample: false, orderIndex: 2 },
      ],
    },

    // ── Binary ─────────────────────────────────────────────────────────────────
    {
      number: 371,
      title: 'Sum of Two Integers',
      slug: 'sum-of-two-integers',
      difficulty: Difficulty.medium,
      description: `Given two integers \`a\` and \`b\`, return *the sum of the two integers without using the operators* \`+\` *and* \`-\`.

**Example 1:**
\`\`\`
Input: a = 1, b = 2
Output: 3
\`\`\`

**Example 2:**
\`\`\`
Input: a = 2, b = 3
Output: 5
\`\`\``,
      constraints: `- \`-1000 <= a, b <= 1000\``,
      hints: ['Use XOR for sum without carry, AND followed by left shift for the carry.'],
      tags: ['bit-manipulation'],
      testCases: [
        { input: '1\n2', expectedOutput: '3', isSample: true, orderIndex: 0 },
        { input: '2\n3', expectedOutput: '5', isSample: true, orderIndex: 1 },
        { input: '-1\n1', expectedOutput: '0', isSample: false, orderIndex: 2 },
        { input: '10\n5', expectedOutput: '15', isSample: false, orderIndex: 3 },
      ],
    },
    {
      number: 191,
      title: 'Number of 1 Bits',
      slug: 'number-of-1-bits',
      difficulty: Difficulty.easy,
      description: `Given a positive integer \`n\`, write a function that returns the number of set bits in its binary representation (also known as the **Hamming weight**).

**Example 1:**
\`\`\`
Input: n = 11
Output: 3
Explanation: 11 in binary is 1011, which has 3 set bits.
\`\`\`

**Example 2:**
\`\`\`
Input: n = 128
Output: 1
\`\`\``,
      constraints: `- \`1 <= n <= 2^31 - 1\``,
      hints: ['Use n & (n-1) to clear the lowest set bit in each iteration.'],
      tags: ['bit-manipulation'],
      testCases: [
        { input: '11', expectedOutput: '3', isSample: true, orderIndex: 0 },
        { input: '128', expectedOutput: '1', isSample: true, orderIndex: 1 },
        { input: '2147483645', expectedOutput: '30', isSample: false, orderIndex: 2 },
        { input: '255', expectedOutput: '8', isSample: false, orderIndex: 3 },
      ],
    },
    {
      number: 338,
      title: 'Counting Bits',
      slug: 'counting-bits',
      difficulty: Difficulty.easy,
      description: `Given an integer \`n\`, return *an array* \`ans\` *of length* \`n + 1\` *such that for each* \`i\` \`(0 <= i <= n)\`*,* \`ans[i]\` *is the **number of*** \`1\`***'s** in the binary representation of* \`i\`.

**Example 1:**
\`\`\`
Input: n = 2
Output: [0,1,1]
\`\`\`

**Example 2:**
\`\`\`
Input: n = 5
Output: [0,1,1,2,1,2]
\`\`\``,
      constraints: `- \`0 <= n <= 10^5\``,
      hints: ['Use DP: ans[i] = ans[i >> 1] + (i & 1).'],
      tags: ['dynamic-programming', 'bit-manipulation'],
      testCases: [
        { input: '2', expectedOutput: '[0,1,1]', isSample: true, orderIndex: 0 },
        { input: '5', expectedOutput: '[0,1,1,2,1,2]', isSample: true, orderIndex: 1 },
        { input: '0', expectedOutput: '[0]', isSample: false, orderIndex: 2 },
        { input: '8', expectedOutput: '[0,1,1,2,1,2,2,3,1]', isSample: false, orderIndex: 3 },
      ],
    },
    {
      number: 268,
      title: 'Missing Number',
      slug: 'missing-number',
      difficulty: Difficulty.easy,
      description: `Given an array \`nums\` containing \`n\` distinct numbers in the range \`[0, n]\`, return *the only number in the range that is missing from the array*.

**Example 1:**
\`\`\`
Input: nums = [3,0,1]
Output: 2
\`\`\`

**Example 2:**
\`\`\`
Input: nums = [0,1]
Output: 2
\`\`\``,
      constraints: `- \`n == nums.length\`
- \`1 <= n <= 10^4\`
- \`0 <= nums[i] <= n\`
- All the numbers of \`nums\` are unique.`,
      hints: ['Use the Gauss formula: expected sum = n*(n+1)/2. Missing = expected - actual sum.'],
      tags: ['array', 'bit-manipulation', 'math'],
      testCases: [
        { input: '[3,0,1]', expectedOutput: '2', isSample: true, orderIndex: 0 },
        { input: '[0,1]', expectedOutput: '2', isSample: true, orderIndex: 1 },
        { input: '[9,6,4,2,3,5,7,0,1]', expectedOutput: '8', isSample: false, orderIndex: 2 },
        { input: '[0]', expectedOutput: '1', isSample: false, orderIndex: 3 },
      ],
    },
    {
      number: 190,
      title: 'Reverse Bits',
      slug: 'reverse-bits',
      difficulty: Difficulty.easy,
      description: `Reverse bits of a given 32 bits unsigned integer.

**Example 1:**
\`\`\`
Input: n = 00000010100101000001111010011100
Output: 964176192 (00111001011110000010100101000000)
\`\`\`

**Example 2:**
\`\`\`
Input: n = 11111111111111111111111111111101
Output: 3221225471 (10111111111111111111111111111111)
\`\`\``,
      constraints: `- The input must be a **binary string** of length \`32\``,
      hints: ['Process each bit from right to left, shifting into the result.'],
      tags: ['bit-manipulation'],
      testCases: [
        { input: '43261596', expectedOutput: '964176192', isSample: true, orderIndex: 0 },
        { input: '4294967293', expectedOutput: '3221225471', isSample: true, orderIndex: 1 },
        { input: '0', expectedOutput: '0', isSample: false, orderIndex: 2 },
        { input: '1', expectedOutput: '2147483648', isSample: false, orderIndex: 3 },
      ],
    },

    // ── Dynamic Programming ────────────────────────────────────────────────────
    {
      number: 70,
      title: 'Climbing Stairs',
      slug: 'climbing-stairs',
      difficulty: Difficulty.easy,
      description: `You are climbing a staircase. It takes \`n\` steps to reach the top.

Each time you can either climb \`1\` or \`2\` steps. In how many distinct ways can you climb to the top?

**Example 1:**
\`\`\`
Input: n = 2
Output: 2
Explanation: (1 step + 1 step) or (2 steps).
\`\`\`

**Example 2:**
\`\`\`
Input: n = 3
Output: 3
Explanation: (1+1+1), (1+2), (2+1).
\`\`\``,
      constraints: `- \`1 <= n <= 45\``,
      hints: ['This is essentially the Fibonacci sequence.'],
      tags: ['dynamic-programming', 'math'],
      testCases: [
        { input: '2', expectedOutput: '2', isSample: true, orderIndex: 0 },
        { input: '3', expectedOutput: '3', isSample: true, orderIndex: 1 },
        { input: '10', expectedOutput: '89', isSample: false, orderIndex: 2 },
        { input: '45', expectedOutput: '1836311903', isSample: false, orderIndex: 3 },
      ],
    },
    {
      number: 322,
      title: 'Coin Change',
      slug: 'coin-change',
      difficulty: Difficulty.medium,
      description: `You are given an integer array \`coins\` representing coins of different denominations and an integer \`amount\` representing a total amount of money.

Return *the fewest number of coins that you need to make up that amount*. If that amount of money cannot be made up by any combination of the coins, return \`-1\`.

**Example 1:**
\`\`\`
Input: coins = [1,5,11], amount = 15
Output: 2
Explanation: 5 + 10 ... wait, [1,5,11] -> 11+... use 5+5+5=15 -> 3 coins, or 11+... no. 5+5+5=15 -> 3.
\`\`\`

**Example 2:**
\`\`\`
Input: coins = [2], amount = 3
Output: -1
\`\`\``,
      constraints: `- \`1 <= coins.length <= 12\`
- \`1 <= coins[i] <= 2^31 - 1\`
- \`0 <= amount <= 10^4\``,
      hints: ['Use bottom-up DP. dp[i] = min coins to make amount i.'],
      tags: ['dynamic-programming'],
      testCases: [
        { input: '[1,5,11]\n15', expectedOutput: '3', isSample: true, orderIndex: 0 },
        { input: '[2]\n3', expectedOutput: '-1', isSample: true, orderIndex: 1 },
        { input: '[1]\n0', expectedOutput: '0', isSample: false, orderIndex: 2 },
        { input: '[1,2,5]\n11', expectedOutput: '3', isSample: false, orderIndex: 3 },
      ],
    },
    {
      number: 300,
      title: 'Longest Increasing Subsequence',
      slug: 'longest-increasing-subsequence',
      difficulty: Difficulty.medium,
      description: `Given an integer array \`nums\`, return *the length of the longest **strictly increasing subsequence***.

**Example 1:**
\`\`\`
Input: nums = [10,9,2,5,3,7,101,18]
Output: 4
Explanation: The longest increasing subsequence is [2,3,7,101], length 4.
\`\`\`

**Example 2:**
\`\`\`
Input: nums = [0,1,0,3,2,3]
Output: 4
\`\`\``,
      constraints: `- \`1 <= nums.length <= 2500\`
- \`-10^4 <= nums[i] <= 10^4\``,
      hints: ['Use DP: dp[i] = length of LIS ending at index i.', 'For O(n log n), use binary search with a patience sorting approach.'],
      tags: ['dynamic-programming', 'binary-search'],
      testCases: [
        { input: '[10,9,2,5,3,7,101,18]', expectedOutput: '4', isSample: true, orderIndex: 0 },
        { input: '[0,1,0,3,2,3]', expectedOutput: '4', isSample: true, orderIndex: 1 },
        { input: '[7,7,7,7,7,7,7]', expectedOutput: '1', isSample: false, orderIndex: 2 },
        { input: '[1,3,6,7,9,4,10,5,6]', expectedOutput: '6', isSample: false, orderIndex: 3 },
      ],
    },
    {
      number: 1143,
      title: 'Longest Common Subsequence',
      slug: 'longest-common-subsequence',
      difficulty: Difficulty.medium,
      description: `Given two strings \`text1\` and \`text2\`, return *the length of their longest **common subsequence***. If there is no common subsequence, return \`0\`.

**Example 1:**
\`\`\`
Input: text1 = "abcde", text2 = "ace"
Output: 3
Explanation: The longest common subsequence is "ace", length 3.
\`\`\`

**Example 2:**
\`\`\`
Input: text1 = "abc", text2 = "abc"
Output: 3
\`\`\``,
      constraints: `- \`1 <= text1.length, text2.length <= 1000\`
- \`text1\` and \`text2\` consist of only lowercase English characters.`,
      hints: ['Use 2D DP: dp[i][j] = LCS of text1[0..i] and text2[0..j].'],
      tags: ['dynamic-programming', 'string'],
      testCases: [
        { input: '"abcde"\n"ace"', expectedOutput: '3', isSample: true, orderIndex: 0 },
        { input: '"abc"\n"abc"', expectedOutput: '3', isSample: true, orderIndex: 1 },
        { input: '"abc"\n"def"', expectedOutput: '0', isSample: false, orderIndex: 2 },
        { input: '"oxcpqrsvwf"\n"shmtulqrypy"', expectedOutput: '2', isSample: false, orderIndex: 3 },
      ],
    },
    {
      number: 139,
      title: 'Word Break',
      slug: 'word-break',
      difficulty: Difficulty.medium,
      description: `Given a string \`s\` and a dictionary of strings \`wordDict\`, return \`true\` if \`s\` can be segmented into a space-separated sequence of one or more dictionary words.

**Example 1:**
\`\`\`
Input: s = "leetcode", wordDict = ["leet","code"]
Output: true
\`\`\`

**Example 2:**
\`\`\`
Input: s = "applepenapple", wordDict = ["apple","pen"]
Output: true
\`\`\``,
      constraints: `- \`1 <= s.length <= 300\`
- \`1 <= wordDict.length <= 1000\`
- \`1 <= wordDict[i].length <= 20\`
- \`s\` and \`wordDict[i]\` consist of only lowercase English letters.`,
      hints: ['Use DP: dp[i] = true if s[0..i] can be segmented.'],
      tags: ['dynamic-programming', 'hash-table', 'string'],
      testCases: [
        { input: '"leetcode"\n["leet","code"]', expectedOutput: 'true', isSample: true, orderIndex: 0 },
        { input: '"applepenapple"\n["apple","pen"]', expectedOutput: 'true', isSample: true, orderIndex: 1 },
        { input: '"catsandog"\n["cats","dog","sand","and","cat"]', expectedOutput: 'false', isSample: false, orderIndex: 2 },
        { input: '"cars"\n["car","ca","rs"]', expectedOutput: 'true', isSample: false, orderIndex: 3 },
      ],
    },
    {
      number: 377,
      title: 'Combination Sum IV',
      slug: 'combination-sum-iv',
      difficulty: Difficulty.medium,
      description: `Given an array of **distinct** integers \`nums\` and a target integer \`target\`, return *the number of possible combinations that add up to* \`target\`.

**Example 1:**
\`\`\`
Input: nums = [1,2,3], target = 4
Output: 7
Explanation: (1,1,1,1), (1,1,2), (1,2,1), (1,3), (2,1,1), (2,2), (3,1).
\`\`\``,
      constraints: `- \`1 <= nums.length <= 200\`
- \`1 <= nums[i] <= 1000\`
- All the elements of \`nums\` are unique.
- \`1 <= target <= 1000\``,
      hints: ['Use DP: dp[i] = number of ways to reach sum i.'],
      tags: ['dynamic-programming'],
      testCases: [
        { input: '[1,2,3]\n4', expectedOutput: '7', isSample: true, orderIndex: 0 },
        { input: '[9]\n3', expectedOutput: '0', isSample: true, orderIndex: 1 },
        { input: '[1,2,3]\n1', expectedOutput: '1', isSample: false, orderIndex: 2 },
        { input: '[2,3,5]\n10', expectedOutput: '5', isSample: false, orderIndex: 3 },
      ],
    },
    {
      number: 198,
      title: 'House Robber',
      slug: 'house-robber',
      difficulty: Difficulty.medium,
      description: `You are a professional robber planning to rob houses along a street. Each house has a certain amount of money stashed, the only constraint stopping you from robbing each of them is that adjacent houses have security systems connected.

Given an integer array \`nums\` representing the amount of money of each house, return *the maximum amount of money you can rob tonight without alerting the police*.

**Example 1:**
\`\`\`
Input: nums = [1,2,3,1]
Output: 4
Explanation: Rob house 1 (money = 1) then rob house 3 (money = 3).
\`\`\`

**Example 2:**
\`\`\`
Input: nums = [2,7,9,3,1]
Output: 12
\`\`\``,
      constraints: `- \`1 <= nums.length <= 100\`
- \`0 <= nums[i] <= 400\``,
      hints: ['dp[i] = max(dp[i-1], dp[i-2] + nums[i])'],
      tags: ['dynamic-programming'],
      testCases: [
        { input: '[1,2,3,1]', expectedOutput: '4', isSample: true, orderIndex: 0 },
        { input: '[2,7,9,3,1]', expectedOutput: '12', isSample: true, orderIndex: 1 },
        { input: '[2,1,1,2]', expectedOutput: '4', isSample: false, orderIndex: 2 },
        { input: '[1]', expectedOutput: '1', isSample: false, orderIndex: 3 },
      ],
    },
    {
      number: 213,
      title: 'House Robber II',
      slug: 'house-robber-ii',
      difficulty: Difficulty.medium,
      description: `All houses are arranged in a **circle**. Given an integer array \`nums\` representing the amount of money of each house, return *the maximum amount of money you can rob tonight without alerting the police*.

**Example 1:**
\`\`\`
Input: nums = [2,3,2]
Output: 3
\`\`\`

**Example 2:**
\`\`\`
Input: nums = [1,2,3,1]
Output: 4
\`\`\``,
      constraints: `- \`1 <= nums.length <= 100\`
- \`0 <= nums[i] <= 1000\``,
      hints: ['Run House Robber twice: once on nums[0..n-2] and once on nums[1..n-1]. Take the max.'],
      tags: ['dynamic-programming'],
      testCases: [
        { input: '[2,3,2]', expectedOutput: '3', isSample: true, orderIndex: 0 },
        { input: '[1,2,3,1]', expectedOutput: '4', isSample: true, orderIndex: 1 },
        { input: '[1,2,3]', expectedOutput: '3', isSample: false, orderIndex: 2 },
        { input: '[5,1,1,5]', expectedOutput: '10', isSample: false, orderIndex: 3 },
      ],
    },
    {
      number: 91,
      title: 'Decode Ways',
      slug: 'decode-ways',
      difficulty: Difficulty.medium,
      description: `A message containing letters from \`A-Z\` can be encoded into numbers using the following mapping: 'A' -> "1", 'B' -> "2", ..., 'Z' -> "26".

Given a string \`s\` containing only digits, return *the **number of ways** to decode it*.

**Example 1:**
\`\`\`
Input: s = "12"
Output: 2
Explanation: "12" could be decoded as "AB" (1 2) or "L" (12).
\`\`\`

**Example 2:**
\`\`\`
Input: s = "226"
Output: 3
\`\`\``,
      constraints: `- \`1 <= s.length <= 100\`
- \`s\` contains only digits and may contain leading zero(s).`,
      hints: ['Use DP. Be careful with \'0\' — it can only be part of 10 or 20.'],
      tags: ['dynamic-programming', 'string'],
      testCases: [
        { input: '"12"', expectedOutput: '2', isSample: true, orderIndex: 0 },
        { input: '"226"', expectedOutput: '3', isSample: true, orderIndex: 1 },
        { input: '"06"', expectedOutput: '0', isSample: false, orderIndex: 2 },
        { input: '"11106"', expectedOutput: '2', isSample: false, orderIndex: 3 },
      ],
    },
    {
      number: 62,
      title: 'Unique Paths',
      slug: 'unique-paths',
      difficulty: Difficulty.medium,
      description: `There is a robot on an \`m x n\` grid. The robot is initially located at the **top-left corner**. The robot tries to move to the **bottom-right corner**. The robot can only move either down or right at any point in time.

Given the two integers \`m\` and \`n\`, return *the number of possible unique paths*.

**Example 1:**
\`\`\`
Input: m = 3, n = 7
Output: 28
\`\`\`

**Example 2:**
\`\`\`
Input: m = 3, n = 2
Output: 3
\`\`\``,
      constraints: `- \`1 <= m, n <= 100\``,
      hints: ['Use 2D DP or combinatorics: C(m+n-2, m-1).'],
      tags: ['dynamic-programming', 'math'],
      testCases: [
        { input: '3\n7', expectedOutput: '28', isSample: true, orderIndex: 0 },
        { input: '3\n2', expectedOutput: '3', isSample: true, orderIndex: 1 },
        { input: '1\n1', expectedOutput: '1', isSample: false, orderIndex: 2 },
        { input: '7\n3', expectedOutput: '28', isSample: false, orderIndex: 3 },
      ],
    },
    {
      number: 55,
      title: 'Jump Game',
      slug: 'jump-game',
      difficulty: Difficulty.medium,
      description: `You are given an integer array \`nums\`. You are initially positioned at the array's **first index**, and each element in the array represents your maximum jump length at that position.

Return \`true\` *if you can reach the last index, or* \`false\` *otherwise*.

**Example 1:**
\`\`\`
Input: nums = [2,3,1,1,4]
Output: true
\`\`\`

**Example 2:**
\`\`\`
Input: nums = [3,2,1,0,4]
Output: false
\`\`\``,
      constraints: `- \`1 <= nums.length <= 10^4\`
- \`0 <= nums[i] <= 10^5\``,
      hints: ['Track the farthest reachable index. If you ever reach a position beyond it, return false.'],
      tags: ['array', 'greedy', 'dynamic-programming'],
      testCases: [
        { input: '[2,3,1,1,4]', expectedOutput: 'true', isSample: true, orderIndex: 0 },
        { input: '[3,2,1,0,4]', expectedOutput: 'false', isSample: true, orderIndex: 1 },
        { input: '[0]', expectedOutput: 'true', isSample: false, orderIndex: 2 },
        { input: '[2,0,0]', expectedOutput: 'true', isSample: false, orderIndex: 3 },
      ],
    },

    // ── String ─────────────────────────────────────────────────────────────────
    {
      number: 3,
      title: 'Longest Substring Without Repeating Characters',
      slug: 'longest-substring-without-repeating-characters',
      difficulty: Difficulty.medium,
      description: `Given a string \`s\`, find the length of the **longest substring** without duplicate characters.

**Example 1:**
\`\`\`
Input: s = "abcabcbb"
Output: 3
\`\`\`

**Example 2:**
\`\`\`
Input: s = "bbbbb"
Output: 1
\`\`\``,
      constraints: `- \`0 <= s.length <= 5 * 10^4\``,
      hints: ['Use a sliding window with a hash set.'],
      tags: ['string', 'hash-table', 'sliding-window'],
      testCases: [
        { input: '"abcabcbb"', expectedOutput: '3', isSample: true, orderIndex: 0 },
        { input: '"bbbbb"', expectedOutput: '1', isSample: true, orderIndex: 1 },
        { input: '"pwwkew"', expectedOutput: '3', isSample: false, orderIndex: 2 },
        { input: '""', expectedOutput: '0', isSample: false, orderIndex: 3 },
      ],
    },
    {
      number: 424,
      title: 'Longest Repeating Character Replacement',
      slug: 'longest-repeating-character-replacement',
      difficulty: Difficulty.medium,
      description: `You are given a string \`s\` and an integer \`k\`. You can choose any character of the string and change it to any other uppercase English character. You can perform this operation at most \`k\` times.

Return *the length of the longest substring containing the same letter you can get after performing the above operations*.

**Example 1:**
\`\`\`
Input: s = "ABAB", k = 2
Output: 4
\`\`\`

**Example 2:**
\`\`\`
Input: s = "AABABBA", k = 1
Output: 4
\`\`\``,
      constraints: `- \`1 <= s.length <= 10^5\`
- \`s\` consists of only uppercase English letters.
- \`0 <= k <= s.length\``,
      hints: ['Use a sliding window. The window is valid if (window size - max freq char count) <= k.'],
      tags: ['string', 'sliding-window'],
      testCases: [
        { input: '"ABAB"\n2', expectedOutput: '4', isSample: true, orderIndex: 0 },
        { input: '"AABABBA"\n1', expectedOutput: '4', isSample: true, orderIndex: 1 },
        { input: '"AAAA"\n2', expectedOutput: '4', isSample: false, orderIndex: 2 },
        { input: '"ABCDE"\n1', expectedOutput: '2', isSample: false, orderIndex: 3 },
      ],
    },
    {
      number: 76,
      title: 'Minimum Window Substring',
      slug: 'minimum-window-substring',
      difficulty: Difficulty.hard,
      description: `Given two strings \`s\` and \`t\` of lengths \`m\` and \`n\` respectively, return *the **minimum window substring** of* \`s\` *such that every character in* \`t\` *(including duplicates) is included in the window*. If there is no such substring, return the empty string \`""\`.

**Example 1:**
\`\`\`
Input: s = "ADOBECODEBANC", t = "ABC"
Output: "BANC"
\`\`\`

**Example 2:**
\`\`\`
Input: s = "a", t = "a"
Output: "a"
\`\`\``,
      constraints: `- \`m == s.length\`
- \`n == t.length\`
- \`1 <= m, n <= 10^5\``,
      hints: ['Use a sliding window with two frequency maps.'],
      tags: ['string', 'sliding-window', 'hash-table'],
      testCases: [
        { input: '"ADOBECODEBANC"\n"ABC"', expectedOutput: '"BANC"', isSample: true, orderIndex: 0 },
        { input: '"a"\n"a"', expectedOutput: '"a"', isSample: true, orderIndex: 1 },
        { input: '"a"\n"aa"', expectedOutput: '""', isSample: false, orderIndex: 2 },
        { input: '"aa"\n"aa"', expectedOutput: '"aa"', isSample: false, orderIndex: 3 },
      ],
    },
    {
      number: 242,
      title: 'Valid Anagram',
      slug: 'valid-anagram',
      difficulty: Difficulty.easy,
      description: `Given two strings \`s\` and \`t\`, return \`true\` *if* \`t\` *is an anagram of* \`s\`*, and* \`false\` *otherwise*.

**Example 1:**
\`\`\`
Input: s = "anagram", t = "nagaram"
Output: true
\`\`\`

**Example 2:**
\`\`\`
Input: s = "rat", t = "car"
Output: false
\`\`\``,
      constraints: `- \`1 <= s.length, t.length <= 5 * 10^4\`
- \`s\` and \`t\` consist of lowercase English letters.`,
      hints: ['Count character frequencies in both strings and compare.'],
      tags: ['string', 'hash-table'],
      testCases: [
        { input: '"anagram"\n"nagaram"', expectedOutput: 'true', isSample: true, orderIndex: 0 },
        { input: '"rat"\n"car"', expectedOutput: 'false', isSample: true, orderIndex: 1 },
        { input: '"a"\n"a"', expectedOutput: 'true', isSample: false, orderIndex: 2 },
        { input: '"ab"\n"a"', expectedOutput: 'false', isSample: false, orderIndex: 3 },
      ],
    },
    {
      number: 49,
      title: 'Group Anagrams',
      slug: 'group-anagrams',
      difficulty: Difficulty.medium,
      description: `Given an array of strings \`strs\`, group **the anagrams** together. You can return the answer in **any order**.

**Example 1:**
\`\`\`
Input: strs = ["eat","tea","tan","ate","nat","bat"]
Output: [["bat"],["nat","tan"],["ate","eat","tea"]]
\`\`\`

**Example 2:**
\`\`\`
Input: strs = [""]
Output: [[""]]
\`\`\``,
      constraints: `- \`1 <= strs.length <= 10^4\`
- \`0 <= strs[i].length <= 100\`
- \`strs[i]\` consists of lowercase English letters.`,
      hints: ['Sort each string as a key into a hash map.'],
      tags: ['string', 'hash-table'],
      testCases: [
        { input: '["eat","tea","tan","ate","nat","bat"]', expectedOutput: '[["bat"],["nat","tan"],["ate","eat","tea"]]', isSample: true, orderIndex: 0 },
        { input: '[""]', expectedOutput: '[[""]]', isSample: true, orderIndex: 1 },
        { input: '["a"]', expectedOutput: '[["a"]]', isSample: false, orderIndex: 2 },
      ],
    },
    {
      number: 20,
      title: 'Valid Parentheses',
      slug: 'valid-parentheses',
      difficulty: Difficulty.easy,
      description: `Given a string \`s\` containing just the characters \`'('\`, \`')'\`, \`'{'\`, \`'}'\`, \`'['\` and \`']'\`, determine if the input string is valid.

An input string is valid if:
1. Open brackets must be closed by the same type of brackets.
2. Open brackets must be closed in the correct order.
3. Every close bracket has a corresponding open bracket of the same type.

**Example 1:**
\`\`\`
Input: s = "()"
Output: true
\`\`\`

**Example 2:**
\`\`\`
Input: s = "()[]{}"
Output: true
\`\`\``,
      constraints: `- \`1 <= s.length <= 10^4\`
- \`s\` consists of parentheses only \`'()[]{}'.\``,
      hints: ['Use a stack. Push open brackets, pop when you see a closing bracket.'],
      tags: ['string', 'stack'],
      testCases: [
        { input: '"()"', expectedOutput: 'true', isSample: true, orderIndex: 0 },
        { input: '"()[]{}"', expectedOutput: 'true', isSample: true, orderIndex: 1 },
        { input: '"(]"', expectedOutput: 'false', isSample: false, orderIndex: 2 },
        { input: '"([)]"', expectedOutput: 'false', isSample: false, orderIndex: 3 },
      ],
    },
    {
      number: 125,
      title: 'Valid Palindrome',
      slug: 'valid-palindrome',
      difficulty: Difficulty.easy,
      description: `A phrase is a **palindrome** if, after converting all uppercase letters into lowercase letters and removing all non-alphanumeric characters, it reads the same forward and backward.

Given a string \`s\`, return \`true\` *if it is a **palindrome**, or* \`false\` *otherwise*.

**Example 1:**
\`\`\`
Input: s = "A man, a plan, a canal: Panama"
Output: true
\`\`\`

**Example 2:**
\`\`\`
Input: s = "race a car"
Output: false
\`\`\``,
      constraints: `- \`1 <= s.length <= 2 * 10^5\`
- \`s\` consists only of printable ASCII characters.`,
      hints: ['Use two pointers from both ends, skipping non-alphanumeric characters.'],
      tags: ['string', 'two-pointers'],
      testCases: [
        { input: '"A man, a plan, a canal: Panama"', expectedOutput: 'true', isSample: true, orderIndex: 0 },
        { input: '"race a car"', expectedOutput: 'false', isSample: true, orderIndex: 1 },
        { input: '" "', expectedOutput: 'true', isSample: false, orderIndex: 2 },
        { input: '"0P"', expectedOutput: 'false', isSample: false, orderIndex: 3 },
      ],
    },
    {
      number: 5,
      title: 'Longest Palindromic Substring',
      slug: 'longest-palindromic-substring',
      difficulty: Difficulty.medium,
      description: `Given a string \`s\`, return *the longest palindromic substring* in \`s\`.

**Example 1:**
\`\`\`
Input: s = "babad"
Output: "bab"
\`\`\`

**Example 2:**
\`\`\`
Input: s = "cbbd"
Output: "bb"
\`\`\``,
      constraints: `- \`1 <= s.length <= 1000\`
- \`s\` consist of only digits and English letters.`,
      hints: ['Expand around each center (both odd and even length palindromes).'],
      tags: ['string', 'dynamic-programming'],
      testCases: [
        { input: '"babad"', expectedOutput: '"bab"', isSample: true, orderIndex: 0 },
        { input: '"cbbd"', expectedOutput: '"bb"', isSample: true, orderIndex: 1 },
        { input: '"a"', expectedOutput: '"a"', isSample: false, orderIndex: 2 },
        { input: '"racecar"', expectedOutput: '"racecar"', isSample: false, orderIndex: 3 },
      ],
    },
    {
      number: 647,
      title: 'Palindromic Substrings',
      slug: 'palindromic-substrings',
      difficulty: Difficulty.medium,
      description: `Given a string \`s\`, return *the number of **palindromic substrings** in it*.

A string is a **palindrome** when it reads the same backward as forward.

**Example 1:**
\`\`\`
Input: s = "abc"
Output: 3
Explanation: "a", "b", "c"
\`\`\`

**Example 2:**
\`\`\`
Input: s = "aaa"
Output: 6
Explanation: "a", "a", "a", "aa", "aa", "aaa"
\`\`\``,
      constraints: `- \`1 <= s.length <= 1000\`
- \`s\` consists of lowercase English letters.`,
      hints: ['Expand around each center to count palindromes.'],
      tags: ['string', 'dynamic-programming'],
      testCases: [
        { input: '"abc"', expectedOutput: '3', isSample: true, orderIndex: 0 },
        { input: '"aaa"', expectedOutput: '6', isSample: true, orderIndex: 1 },
        { input: '"a"', expectedOutput: '1', isSample: false, orderIndex: 2 },
        { input: '"abba"', expectedOutput: '6', isSample: false, orderIndex: 3 },
      ],
    },

    // ── Interval ───────────────────────────────────────────────────────────────
    {
      number: 57,
      title: 'Insert Interval',
      slug: 'insert-interval',
      difficulty: Difficulty.medium,
      description: `You are given an array of non-overlapping intervals \`intervals\` where \`intervals[i] = [starti, endi]\` represent the start and the end of the \`i\`th interval and \`intervals\` is sorted in ascending order by \`starti\`. You are also given an interval \`newInterval = [start, end]\` that represents the start and end of another interval.

Insert \`newInterval\` into \`intervals\` such that \`intervals\` is still sorted and non-overlapping.

**Example 1:**
\`\`\`
Input: intervals = [[1,3],[6,9]], newInterval = [2,5]
Output: [[1,5],[6,9]]
\`\`\``,
      constraints: `- \`0 <= intervals.length <= 10^4\`
- \`intervals[i].length == 2\`
- \`0 <= starti <= endi <= 10^5\``,
      hints: ['Add all intervals that end before the new interval starts, merge overlapping ones, then add the rest.'],
      tags: ['array', 'interval'],
      testCases: [
        { input: '[[1,3],[6,9]]\n[2,5]', expectedOutput: '[[1,5],[6,9]]', isSample: true, orderIndex: 0 },
        { input: '[[1,2],[3,5],[6,7],[8,10],[12,16]]\n[4,8]', expectedOutput: '[[1,2],[3,10],[12,16]]', isSample: true, orderIndex: 1 },
        { input: '[]\n[5,7]', expectedOutput: '[[5,7]]', isSample: false, orderIndex: 2 },
      ],
    },
    {
      number: 56,
      title: 'Merge Intervals',
      slug: 'merge-intervals',
      difficulty: Difficulty.medium,
      description: `Given an array of \`intervals\` where \`intervals[i] = [starti, endi]\`, merge all overlapping intervals, and return *an array of the non-overlapping intervals that cover all the intervals in the input*.

**Example 1:**
\`\`\`
Input: intervals = [[1,3],[2,6],[8,10],[15,18]]
Output: [[1,6],[8,10],[15,18]]
\`\`\`

**Example 2:**
\`\`\`
Input: intervals = [[1,4],[4,5]]
Output: [[1,5]]
\`\`\``,
      constraints: `- \`1 <= intervals.length <= 10^4\`
- \`intervals[i].length == 2\`
- \`0 <= starti <= endi <= 10^4\``,
      hints: ['Sort by start time, then greedily merge overlapping intervals.'],
      tags: ['array', 'interval'],
      testCases: [
        { input: '[[1,3],[2,6],[8,10],[15,18]]', expectedOutput: '[[1,6],[8,10],[15,18]]', isSample: true, orderIndex: 0 },
        { input: '[[1,4],[4,5]]', expectedOutput: '[[1,5]]', isSample: true, orderIndex: 1 },
        { input: '[[1,4],[0,4]]', expectedOutput: '[[0,4]]', isSample: false, orderIndex: 2 },
        { input: '[[1,4],[2,3]]', expectedOutput: '[[1,4]]', isSample: false, orderIndex: 3 },
      ],
    },
    {
      number: 435,
      title: 'Non-overlapping Intervals',
      slug: 'non-overlapping-intervals',
      difficulty: Difficulty.medium,
      description: `Given an array of intervals \`intervals\` where \`intervals[i] = [starti, endi]\`, return *the minimum number of intervals you need to remove to make the rest of the intervals non-overlapping*.

**Example 1:**
\`\`\`
Input: intervals = [[1,2],[2,3],[3,4],[1,3]]
Output: 1
\`\`\`

**Example 2:**
\`\`\`
Input: intervals = [[1,2],[1,2],[1,2]]
Output: 2
\`\`\``,
      constraints: `- \`1 <= intervals.length <= 10^5\`
- \`intervals[i].length == 2\`
- \`-5 * 10^4 <= starti < endi <= 5 * 10^4\``,
      hints: ['Sort by end time. Greedily keep the interval with the earliest end time.'],
      tags: ['array', 'interval', 'greedy'],
      testCases: [
        { input: '[[1,2],[2,3],[3,4],[1,3]]', expectedOutput: '1', isSample: true, orderIndex: 0 },
        { input: '[[1,2],[1,2],[1,2]]', expectedOutput: '2', isSample: true, orderIndex: 1 },
        { input: '[[1,2],[2,3]]', expectedOutput: '0', isSample: false, orderIndex: 2 },
        { input: '[[0,2],[1,3],[2,4],[3,5],[4,6]]', expectedOutput: '2', isSample: false, orderIndex: 3 },
      ],
    },

    // ── Matrix ─────────────────────────────────────────────────────────────────
    {
      number: 73,
      title: 'Set Matrix Zeroes',
      slug: 'set-matrix-zeroes',
      difficulty: Difficulty.medium,
      description: `Given an \`m x n\` integer matrix \`matrix\`, if an element is \`0\`, set its entire row and column to \`0\`'s.

You must do it **in place**.

**Example 1:**
\`\`\`
Input: matrix = [[1,1,1],[1,0,1],[1,1,1]]
Output: [[1,0,1],[0,0,0],[1,0,1]]
\`\`\``,
      constraints: `- \`m == matrix.length\`
- \`n == matrix[0].length\`
- \`1 <= m, n <= 200\`
- \`-2^31 <= matrix[i][j] <= 2^31 - 1\``,
      hints: ['Use the first row and column as markers to avoid extra space.'],
      tags: ['array', 'matrix'],
      testCases: [
        { input: '[[1,1,1],[1,0,1],[1,1,1]]', expectedOutput: '[[1,0,1],[0,0,0],[1,0,1]]', isSample: true, orderIndex: 0 },
        { input: '[[0,1,2,0],[3,4,5,2],[1,3,1,5]]', expectedOutput: '[[0,0,0,0],[0,4,5,0],[0,3,1,0]]', isSample: true, orderIndex: 1 },
      ],
    },
    {
      number: 54,
      title: 'Spiral Matrix',
      slug: 'spiral-matrix',
      difficulty: Difficulty.medium,
      description: `Given an \`m x n\` \`matrix\`, return *all elements of the* \`matrix\` *in spiral order*.

**Example 1:**
\`\`\`
Input: matrix = [[1,2,3],[4,5,6],[7,8,9]]
Output: [1,2,3,6,9,8,7,4,5]
\`\`\``,
      constraints: `- \`m == matrix.length\`
- \`n == matrix[i].length\`
- \`1 <= m, n <= 10\`
- \`-100 <= matrix[i][j] <= 100\``,
      hints: ['Maintain top, bottom, left, right boundaries and shrink them as you traverse.'],
      tags: ['array', 'matrix'],
      testCases: [
        { input: '[[1,2,3],[4,5,6],[7,8,9]]', expectedOutput: '[1,2,3,6,9,8,7,4,5]', isSample: true, orderIndex: 0 },
        { input: '[[1,2,3,4],[5,6,7,8],[9,10,11,12]]', expectedOutput: '[1,2,3,4,8,12,11,10,9,5,6,7]', isSample: true, orderIndex: 1 },
      ],
    },
    {
      number: 48,
      title: 'Rotate Image',
      slug: 'rotate-image',
      difficulty: Difficulty.medium,
      description: `You are given an \`n x n\` 2D \`matrix\` representing an image, rotate the image by **90 degrees (clockwise)**.

You have to rotate the image **in-place**.

**Example 1:**
\`\`\`
Input: matrix = [[1,2,3],[4,5,6],[7,8,9]]
Output: [[7,4,1],[8,5,2],[9,6,3]]
\`\`\``,
      constraints: `- \`n == matrix.length == matrix[i].length\`
- \`1 <= n <= 20\`
- \`-1000 <= matrix[i][j] <= 1000\``,
      hints: ['Transpose the matrix, then reverse each row.'],
      tags: ['array', 'matrix'],
      testCases: [
        { input: '[[1,2,3],[4,5,6],[7,8,9]]', expectedOutput: '[[7,4,1],[8,5,2],[9,6,3]]', isSample: true, orderIndex: 0 },
        { input: '[[5,1,9,11],[2,4,8,10],[13,3,6,7],[15,14,12,16]]', expectedOutput: '[[15,13,2,5],[14,3,4,1],[12,6,8,9],[16,7,10,11]]', isSample: true, orderIndex: 1 },
      ],
    },

    // ── Linked List ────────────────────────────────────────────────────────────
    {
      number: 206,
      title: 'Reverse Linked List',
      slug: 'reverse-linked-list',
      difficulty: Difficulty.easy,
      description: `Given the \`head\` of a singly linked list, reverse the list, and return *the reversed list*.

**Example 1:**
\`\`\`
Input: head = [1,2,3,4,5]
Output: [5,4,3,2,1]
\`\`\`

**Example 2:**
\`\`\`
Input: head = [1,2]
Output: [2,1]
\`\`\``,
      constraints: `- The number of nodes in the list is the range \`[0, 5000]\`.
- \`-5000 <= Node.val <= 5000\``,
      hints: ['Use three pointers: prev, curr, next.'],
      tags: ['linked-list'],
      testCases: [
        { input: '[1,2,3,4,5]', expectedOutput: '[5,4,3,2,1]', isSample: true, orderIndex: 0 },
        { input: '[1,2]', expectedOutput: '[2,1]', isSample: true, orderIndex: 1 },
        { input: '[]', expectedOutput: '[]', isSample: false, orderIndex: 2 },
      ],
    },
    {
      number: 21,
      title: 'Merge Two Sorted Lists',
      slug: 'merge-two-sorted-lists',
      difficulty: Difficulty.easy,
      description: `You are given the heads of two sorted linked lists \`list1\` and \`list2\`.

Merge the two lists into one **sorted** list. The list should be made by splicing together the nodes of the first two lists.

Return *the head of the merged linked list*.

**Example 1:**
\`\`\`
Input: list1 = [1,2,4], list2 = [1,3,4]
Output: [1,1,2,3,4,4]
\`\`\``,
      constraints: `- The number of nodes in both lists is in the range \`[0, 50]\`.
- \`-100 <= Node.val <= 100\`
- Both \`list1\` and \`list2\` are sorted in non-decreasing order.`,
      hints: ['Use a dummy head node and compare values iteratively.'],
      tags: ['linked-list'],
      testCases: [
        { input: '[1,2,4]\n[1,3,4]', expectedOutput: '[1,1,2,3,4,4]', isSample: true, orderIndex: 0 },
        { input: '[]\n[]', expectedOutput: '[]', isSample: true, orderIndex: 1 },
        { input: '[]\n[0]', expectedOutput: '[0]', isSample: false, orderIndex: 2 },
      ],
    },
    {
      number: 141,
      title: 'Linked List Cycle',
      slug: 'linked-list-cycle',
      difficulty: Difficulty.easy,
      description: `Given \`head\`, the head of a linked list, determine if the linked list has a cycle in it.

Return \`true\` if there is a cycle in the linked list. Otherwise, return \`false\`.

**Example 1:**
\`\`\`
Input: head = [3,2,0,-4], pos = 1 (tail connects to node index 1)
Output: true
\`\`\``,
      constraints: `- The number of nodes in the list is in the range \`[0, 10^4]\`.
- \`-10^5 <= Node.val <= 10^5\``,
      hints: ['Use Floyd\'s cycle detection: slow and fast pointers.'],
      tags: ['linked-list', 'two-pointers'],
      testCases: [
        { input: '[3,2,0,-4]\n1', expectedOutput: 'true', isSample: true, orderIndex: 0 },
        { input: '[1,2]\n0', expectedOutput: 'true', isSample: true, orderIndex: 1 },
        { input: '[1]\n-1', expectedOutput: 'false', isSample: false, orderIndex: 2 },
      ],
    },
    {
      number: 23,
      title: 'Merge K Sorted Lists',
      slug: 'merge-k-sorted-lists',
      difficulty: Difficulty.hard,
      description: `You are given an array of \`k\` linked-lists \`lists\`, each linked-list is sorted in ascending order.

*Merge all the linked-lists into one sorted linked-list and return it.*

**Example 1:**
\`\`\`
Input: lists = [[1,4,5],[1,3,4],[2,6]]
Output: [1,1,2,3,4,4,5,6]
\`\`\``,
      constraints: `- \`k == lists.length\`
- \`0 <= k <= 10^4\`
- \`0 <= lists[i].length <= 500\``,
      hints: ['Use a min-heap or divide and conquer merge.'],
      tags: ['linked-list', 'heap'],
      testCases: [
        { input: '[[1,4,5],[1,3,4],[2,6]]', expectedOutput: '[1,1,2,3,4,4,5,6]', isSample: true, orderIndex: 0 },
        { input: '[[]]', expectedOutput: '[]', isSample: true, orderIndex: 1 },
        { input: '[]', expectedOutput: '[]', isSample: false, orderIndex: 2 },
      ],
    },
    {
      number: 19,
      title: 'Remove Nth Node From End of List',
      slug: 'remove-nth-node-from-end-of-list',
      difficulty: Difficulty.medium,
      description: `Given the \`head\` of a linked list, remove the \`n\`th node from the end of the list and return its head.

**Example 1:**
\`\`\`
Input: head = [1,2,3,4,5], n = 2
Output: [1,2,3,5]
\`\`\``,
      constraints: `- The number of nodes in the list is \`sz\`.
- \`1 <= sz <= 30\`
- \`0 <= Node.val <= 100\`
- \`1 <= n <= sz\``,
      hints: ['Use two pointers with a gap of n nodes between them.'],
      tags: ['linked-list', 'two-pointers'],
      testCases: [
        { input: '[1,2,3,4,5]\n2', expectedOutput: '[1,2,3,5]', isSample: true, orderIndex: 0 },
        { input: '[1]\n1', expectedOutput: '[]', isSample: true, orderIndex: 1 },
        { input: '[1,2]\n1', expectedOutput: '[1]', isSample: false, orderIndex: 2 },
      ],
    },
    {
      number: 143,
      title: 'Reorder List',
      slug: 'reorder-list',
      difficulty: Difficulty.medium,
      description: `You are given the head of a singly linked-list: \`L0 → L1 → … → Ln-1 → Ln\`.

Reorder it to: \`L0 → Ln → L1 → Ln-1 → L2 → Ln-2 → …\`

**Example 1:**
\`\`\`
Input: head = [1,2,3,4]
Output: [1,4,2,3]
\`\`\``,
      constraints: `- The number of nodes in the list is in the range \`[1, 5 * 10^4]\`.
- \`1 <= Node.val <= 1000\``,
      hints: ['Find the middle, reverse the second half, then merge both halves.'],
      tags: ['linked-list', 'two-pointers'],
      testCases: [
        { input: '[1,2,3,4]', expectedOutput: '[1,4,2,3]', isSample: true, orderIndex: 0 },
        { input: '[1,2,3,4,5]', expectedOutput: '[1,5,2,4,3]', isSample: true, orderIndex: 1 },
      ],
    },

    // ── Tree ───────────────────────────────────────────────────────────────────
    {
      number: 104,
      title: 'Maximum Depth of Binary Tree',
      slug: 'maximum-depth-of-binary-tree',
      difficulty: Difficulty.easy,
      description: `Given the \`root\` of a binary tree, return *its maximum depth*.

A binary tree's maximum depth is the number of nodes along the longest path from the root node down to the farthest leaf node.

**Example 1:**
\`\`\`
Input: root = [3,9,20,null,null,15,7]
Output: 3
\`\`\``,
      constraints: `- The number of nodes in the tree is in the range \`[0, 10^4]\`.
- \`-100 <= Node.val <= 100\``,
      hints: ['Use recursion: depth = 1 + max(left depth, right depth).'],
      tags: ['tree'],
      testCases: [
        { input: '[3,9,20,null,null,15,7]', expectedOutput: '3', isSample: true, orderIndex: 0 },
        { input: '[1,null,2]', expectedOutput: '2', isSample: true, orderIndex: 1 },
        { input: '[]', expectedOutput: '0', isSample: false, orderIndex: 2 },
      ],
    },
    {
      number: 100,
      title: 'Same Tree',
      slug: 'same-tree',
      difficulty: Difficulty.easy,
      description: `Given the roots of two binary trees \`p\` and \`q\`, write a function to check if they are the same or not.

Two binary trees are considered the same if they are structurally identical, and the nodes have the same value.

**Example 1:**
\`\`\`
Input: p = [1,2,3], q = [1,2,3]
Output: true
\`\`\``,
      constraints: `- The number of nodes in both trees is in the range \`[0, 100]\`.
- \`-10^4 <= Node.val <= 10^4\``,
      hints: ['Recursively compare left and right subtrees.'],
      tags: ['tree'],
      testCases: [
        { input: '[1,2,3]\n[1,2,3]', expectedOutput: 'true', isSample: true, orderIndex: 0 },
        { input: '[1,2]\n[1,null,2]', expectedOutput: 'false', isSample: true, orderIndex: 1 },
        { input: '[1,2,1]\n[1,1,2]', expectedOutput: 'false', isSample: false, orderIndex: 2 },
      ],
    },
    {
      number: 226,
      title: 'Invert Binary Tree',
      slug: 'invert-binary-tree',
      difficulty: Difficulty.easy,
      description: `Given the \`root\` of a binary tree, invert the tree, and return *its root*.

**Example 1:**
\`\`\`
Input: root = [4,2,7,1,3,6,9]
Output: [4,7,2,9,6,3,1]
\`\`\``,
      constraints: `- The number of nodes in the tree is in the range \`[0, 100]\`.
- \`-100 <= Node.val <= 100\``,
      hints: ['Swap left and right children recursively.'],
      tags: ['tree'],
      testCases: [
        { input: '[4,2,7,1,3,6,9]', expectedOutput: '[4,7,2,9,6,3,1]', isSample: true, orderIndex: 0 },
        { input: '[2,1,3]', expectedOutput: '[2,3,1]', isSample: true, orderIndex: 1 },
        { input: '[]', expectedOutput: '[]', isSample: false, orderIndex: 2 },
      ],
    },
    {
      number: 124,
      title: 'Binary Tree Maximum Path Sum',
      slug: 'binary-tree-maximum-path-sum',
      difficulty: Difficulty.hard,
      description: `A **path** in a binary tree is a sequence of nodes where each pair of adjacent nodes in the sequence has an edge connecting them. A node can only appear in the sequence **at most once**. The path does not need to pass through the root.

The **path sum** of a path is the sum of the node's values in the path.

Given the \`root\` of a binary tree, return *the maximum **path sum** of any **non-empty** path*.

**Example 1:**
\`\`\`
Input: root = [1,2,3]
Output: 6
\`\`\``,
      constraints: `- The number of nodes in the tree is in the range \`[1, 3 * 10^4]\`.
- \`-1000 <= Node.val <= 1000\``,
      hints: ['For each node, consider it as the highest point of the path. Track global max.'],
      tags: ['tree', 'dynamic-programming'],
      testCases: [
        { input: '[1,2,3]', expectedOutput: '6', isSample: true, orderIndex: 0 },
        { input: '[-10,9,20,null,null,15,7]', expectedOutput: '42', isSample: true, orderIndex: 1 },
        { input: '[2,-1]', expectedOutput: '2', isSample: false, orderIndex: 2 },
      ],
    },
    {
      number: 102,
      title: 'Binary Tree Level Order Traversal',
      slug: 'binary-tree-level-order-traversal',
      difficulty: Difficulty.medium,
      description: `Given the \`root\` of a binary tree, return *the level order traversal of its nodes' values* (i.e., from left to right, level by level).

**Example 1:**
\`\`\`
Input: root = [3,9,20,null,null,15,7]
Output: [[3],[9,20],[15,7]]
\`\`\``,
      constraints: `- The number of nodes in the tree is in the range \`[0, 2000]\`.
- \`-1000 <= Node.val <= 1000\``,
      hints: ['Use BFS with a queue. Track level boundaries.'],
      tags: ['tree'],
      testCases: [
        { input: '[3,9,20,null,null,15,7]', expectedOutput: '[[3],[9,20],[15,7]]', isSample: true, orderIndex: 0 },
        { input: '[1]', expectedOutput: '[[1]]', isSample: true, orderIndex: 1 },
        { input: '[]', expectedOutput: '[]', isSample: false, orderIndex: 2 },
      ],
    },
    {
      number: 98,
      title: 'Validate Binary Search Tree',
      slug: 'validate-binary-search-tree',
      difficulty: Difficulty.medium,
      description: `Given the \`root\` of a binary tree, *determine if it is a valid binary search tree (BST)*.

A valid BST is defined as follows:
- The left subtree of a node contains only nodes with keys **less than** the node's key.
- The right subtree of a node contains only nodes with keys **greater than** the node's key.
- Both the left and right subtrees must also be binary search trees.

**Example 1:**
\`\`\`
Input: root = [2,1,3]
Output: true
\`\`\``,
      constraints: `- The number of nodes in the tree is in the range \`[1, 10^4]\`.
- \`-2^31 <= Node.val <= 2^31 - 1\``,
      hints: ['Pass min and max bounds down recursively.'],
      tags: ['tree', 'binary-search'],
      testCases: [
        { input: '[2,1,3]', expectedOutput: 'true', isSample: true, orderIndex: 0 },
        { input: '[5,1,4,null,null,3,6]', expectedOutput: 'false', isSample: true, orderIndex: 1 },
        { input: '[2,2,2]', expectedOutput: 'false', isSample: false, orderIndex: 2 },
      ],
    },
    {
      number: 230,
      title: 'Kth Smallest Element in a BST',
      slug: 'kth-smallest-element-in-a-bst',
      difficulty: Difficulty.medium,
      description: `Given the \`root\` of a binary search tree, and an integer \`k\`, return *the* \`k\`th *smallest value (1-indexed) of all the values of the nodes in the tree*.

**Example 1:**
\`\`\`
Input: root = [3,1,4,null,2], k = 1
Output: 1
\`\`\``,
      constraints: `- The number of nodes in the tree is \`n\`.
- \`1 <= k <= n <= 10^4\`
- \`0 <= Node.val <= 10^4\``,
      hints: ['In-order traversal of a BST gives sorted order.'],
      tags: ['tree', 'binary-search'],
      testCases: [
        { input: '[3,1,4,null,2]\n1', expectedOutput: '1', isSample: true, orderIndex: 0 },
        { input: '[5,3,6,2,4,null,null,1]\n3', expectedOutput: '3', isSample: true, orderIndex: 1 },
      ],
    },
    {
      number: 235,
      title: 'Lowest Common Ancestor of a Binary Search Tree',
      slug: 'lowest-common-ancestor-of-a-bst',
      difficulty: Difficulty.medium,
      description: `Given a binary search tree (BST), find the lowest common ancestor (LCA) node of two given nodes in the BST.

**Example 1:**
\`\`\`
Input: root = [6,2,8,0,4,7,9,null,null,3,5], p = 2, q = 8
Output: 6
\`\`\``,
      constraints: `- The number of nodes in the tree is in the range \`[2, 10^5]\`.
- \`-10^9 <= Node.val <= 10^9\``,
      hints: ['If both p and q are less than root, LCA is in left subtree. If both greater, it\'s in right subtree. Otherwise, root is LCA.'],
      tags: ['tree', 'binary-search'],
      testCases: [
        { input: '[6,2,8,0,4,7,9,null,null,3,5]\n2\n8', expectedOutput: '6', isSample: true, orderIndex: 0 },
        { input: '[6,2,8,0,4,7,9,null,null,3,5]\n2\n4', expectedOutput: '2', isSample: true, orderIndex: 1 },
      ],
    },
    {
      number: 105,
      title: 'Construct Binary Tree from Preorder and Inorder Traversal',
      slug: 'construct-binary-tree-from-preorder-and-inorder-traversal',
      difficulty: Difficulty.medium,
      description: `Given two integer arrays \`preorder\` and \`inorder\` where \`preorder\` is the preorder traversal of a binary tree and \`inorder\` is the inorder traversal of the same tree, construct and return *the binary tree*.

**Example 1:**
\`\`\`
Input: preorder = [3,9,20,15,7], inorder = [9,3,15,20,7]
Output: [3,9,20,null,null,15,7]
\`\`\``,
      constraints: `- \`1 <= preorder.length <= 3000\`
- \`inorder.length == preorder.length\``,
      hints: ['The first element of preorder is the root. Find it in inorder to split left/right subtrees.'],
      tags: ['tree'],
      testCases: [
        { input: '[3,9,20,15,7]\n[9,3,15,20,7]', expectedOutput: '[3,9,20,null,null,15,7]', isSample: true, orderIndex: 0 },
        { input: '[-1]\n[-1]', expectedOutput: '[-1]', isSample: true, orderIndex: 1 },
      ],
    },
    {
      number: 572,
      title: 'Subtree of Another Tree',
      slug: 'subtree-of-another-tree',
      difficulty: Difficulty.easy,
      description: `Given the roots of two binary trees \`root\` and \`subRoot\`, return \`true\` if there is a subtree of \`root\` with the same structure and node values of \`subRoot\` and \`false\` otherwise.

**Example 1:**
\`\`\`
Input: root = [3,4,5,1,2], subRoot = [4,1,2]
Output: true
\`\`\``,
      constraints: `- The number of nodes in the \`root\` tree is in the range \`[1, 2000]\`.
- The number of nodes in the \`subRoot\` tree is in the range \`[1, 1000]\`.`,
      hints: ['Check if sameTree at every node.'],
      tags: ['tree'],
      testCases: [
        { input: '[3,4,5,1,2]\n[4,1,2]', expectedOutput: 'true', isSample: true, orderIndex: 0 },
        { input: '[3,4,5,1,2,null,null,null,null,0]\n[4,1,2]', expectedOutput: 'false', isSample: true, orderIndex: 1 },
      ],
    },
    {
      number: 297,
      title: 'Serialize and Deserialize Binary Tree',
      slug: 'serialize-and-deserialize-binary-tree',
      difficulty: Difficulty.hard,
      description: `Serialization is the process of converting a data structure or object into a sequence of bits so that it can be stored in a file or memory buffer.

Design an algorithm to serialize and deserialize a binary tree. There is no restriction on how your serialization/deserialization algorithm should work. Just make sure that a binary tree can be serialized to a string and this string can be deserialized to the original tree structure.

**Example 1:**
\`\`\`
Input: root = [1,2,3,null,null,4,5]
Output: [1,2,3,null,null,4,5]
\`\`\``,
      constraints: `- The number of nodes in the tree is in the range \`[0, 10^4]\`.
- \`-1000 <= Node.val <= 1000\``,
      hints: ['Use BFS or preorder DFS with null markers.'],
      tags: ['tree'],
      testCases: [
        { input: '[1,2,3,null,null,4,5]', expectedOutput: '[1,2,3,null,null,4,5]', isSample: true, orderIndex: 0 },
        { input: '[]', expectedOutput: '[]', isSample: true, orderIndex: 1 },
      ],
    },

    // ── Graph ──────────────────────────────────────────────────────────────────
    {
      number: 128,
      title: 'Longest Consecutive Sequence',
      slug: 'longest-consecutive-sequence',
      difficulty: Difficulty.medium,
      description: `Given an unsorted array of integers \`nums\`, return *the length of the longest consecutive elements sequence*.

You must write an algorithm that runs in \`O(n)\` time.

**Example 1:**
\`\`\`
Input: nums = [100,4,200,1,3,2]
Output: 4
Explanation: [1,2,3,4] is the longest consecutive sequence.
\`\`\`

**Example 2:**
\`\`\`
Input: nums = [0,3,7,2,5,8,4,6,0,1]
Output: 9
\`\`\``,
      constraints: `- \`0 <= nums.length <= 10^5\`
- \`-10^9 <= nums[i] <= 10^9\``,
      hints: ['Use a hash set. For each number, only start counting if num-1 is not in the set.'],
      tags: ['array', 'hash-table', 'graph'],
      testCases: [
        { input: '[100,4,200,1,3,2]', expectedOutput: '4', isSample: true, orderIndex: 0 },
        { input: '[0,3,7,2,5,8,4,6,0,1]', expectedOutput: '9', isSample: true, orderIndex: 1 },
        { input: '[]', expectedOutput: '0', isSample: false, orderIndex: 2 },
        { input: '[1,2,0,1]', expectedOutput: '3', isSample: false, orderIndex: 3 },
      ],
    },
    {
      number: 200,
      title: 'Number of Islands',
      slug: 'number-of-islands',
      difficulty: Difficulty.medium,
      description: `Given an \`m x n\` 2D binary grid \`grid\` which represents a map of \`'1'\`s (land) and \`'0'\`s (water), return *the number of islands*.

An **island** is surrounded by water and is formed by connecting adjacent lands horizontally or vertically.

**Example 1:**
\`\`\`
Input: grid = [["1","1","1","1","0"],["1","1","0","1","0"],["1","1","0","0","0"],["0","0","0","0","0"]]
Output: 1
\`\`\``,
      constraints: `- \`m == grid.length\`
- \`n == grid[i].length\`
- \`1 <= m, n <= 300\`
- \`grid[i][j]\` is \`'0'\` or \`'1'\`.`,
      hints: ['Use DFS/BFS. When you find a \'1\', flood fill it with \'0\' and increment count.'],
      tags: ['graph', 'matrix'],
      testCases: [
        { input: '[["1","1","1","1","0"],["1","1","0","1","0"],["1","1","0","0","0"],["0","0","0","0","0"]]', expectedOutput: '1', isSample: true, orderIndex: 0 },
        { input: '[["1","1","0","0","0"],["1","1","0","0","0"],["0","0","1","0","0"],["0","0","0","1","1"]]', expectedOutput: '3', isSample: true, orderIndex: 1 },
      ],
    },
    {
      number: 207,
      title: 'Course Schedule',
      slug: 'course-schedule',
      difficulty: Difficulty.medium,
      description: `There are a total of \`numCourses\` courses you have to take, labeled from \`0\` to \`numCourses - 1\`. You are given an array \`prerequisites\` where \`prerequisites[i] = [ai, bi]\` indicates that you **must** take course \`bi\` first if you want to take course \`ai\`.

Return \`true\` if you can finish all courses. Otherwise, return \`false\`.

**Example 1:**
\`\`\`
Input: numCourses = 2, prerequisites = [[1,0]]
Output: true
\`\`\`

**Example 2:**
\`\`\`
Input: numCourses = 2, prerequisites = [[1,0],[0,1]]
Output: false
\`\`\``,
      constraints: `- \`1 <= numCourses <= 2000\`
- \`0 <= prerequisites.length <= 5000\``,
      hints: ['Build a directed graph and detect cycles using DFS or topological sort (Kahn\'s algorithm).'],
      tags: ['graph'],
      testCases: [
        { input: '2\n[[1,0]]', expectedOutput: 'true', isSample: true, orderIndex: 0 },
        { input: '2\n[[1,0],[0,1]]', expectedOutput: 'false', isSample: true, orderIndex: 1 },
        { input: '1\n[]', expectedOutput: 'true', isSample: false, orderIndex: 2 },
      ],
    },

    // ── Heap ───────────────────────────────────────────────────────────────────
    {
      number: 347,
      title: 'Top K Frequent Elements',
      slug: 'top-k-frequent-elements',
      difficulty: Difficulty.medium,
      description: `Given an integer array \`nums\` and an integer \`k\`, return *the* \`k\` *most frequent elements*. You may return the answer in **any order**.

**Example 1:**
\`\`\`
Input: nums = [1,1,1,2,2,3], k = 2
Output: [1,2]
\`\`\`

**Example 2:**
\`\`\`
Input: nums = [1], k = 1
Output: [1]
\`\`\``,
      constraints: `- \`1 <= nums.length <= 10^5\`
- \`-10^4 <= nums[i] <= 10^4\`
- \`k\` is in the range \`[1, the number of unique elements in the array]\`.`,
      hints: ['Use a frequency map, then a min-heap of size k, or bucket sort.'],
      tags: ['array', 'hash-table', 'heap'],
      testCases: [
        { input: '[1,1,1,2,2,3]\n2', expectedOutput: '[1,2]', isSample: true, orderIndex: 0 },
        { input: '[1]\n1', expectedOutput: '[1]', isSample: true, orderIndex: 1 },
        { input: '[4,1,1,2,2,2,3]\n2', expectedOutput: '[2,1]', isSample: false, orderIndex: 2 },
      ],
    },
    {
      number: 215,
      title: 'Kth Largest Element in an Array',
      slug: 'kth-largest-element-in-an-array',
      difficulty: Difficulty.medium,
      description: `Given an integer array \`nums\` and an integer \`k\`, return *the* \`k\`th *largest element in the array*.

Note that it is the \`k\`th largest element in the sorted order, not the \`k\`th distinct element.

**Example 1:**
\`\`\`
Input: nums = [3,2,1,5,6,4], k = 2
Output: 5
\`\`\`

**Example 2:**
\`\`\`
Input: nums = [3,2,3,1,2,4,5,5,6], k = 4
Output: 4
\`\`\``,
      constraints: `- \`1 <= k <= nums.length <= 10^5\`
- \`-10^4 <= nums[i] <= 10^4\``,
      hints: ['Use a min-heap of size k, or Quickselect for O(n) average.'],
      tags: ['array', 'heap', 'binary-search'],
      testCases: [
        { input: '[3,2,1,5,6,4]\n2', expectedOutput: '5', isSample: true, orderIndex: 0 },
        { input: '[3,2,3,1,2,4,5,5,6]\n4', expectedOutput: '4', isSample: true, orderIndex: 1 },
        { input: '[1]\n1', expectedOutput: '1', isSample: false, orderIndex: 2 },
        { input: '[7,6,5,4,3,2,1]\n5', expectedOutput: '3', isSample: false, orderIndex: 3 },
      ],
    },

    // ── Trie ───────────────────────────────────────────────────────────────────
    {
      number: 208,
      title: 'Implement Trie (Prefix Tree)',
      slug: 'implement-trie-prefix-tree',
      difficulty: Difficulty.medium,
      description: `A **trie** (pronounced as "try") or **prefix tree** is a tree data structure used to efficiently store and retrieve keys in a dataset of strings.

Implement the \`Trie\` class:
- \`Trie()\` Initializes the trie object.
- \`void insert(String word)\` Inserts the string \`word\` into the trie.
- \`boolean search(String word)\` Returns \`true\` if the string \`word\` is in the trie.
- \`boolean startsWith(String prefix)\` Returns \`true\` if there is a previously inserted string that has the prefix \`prefix\`.

**Example 1:**
\`\`\`
Input: ["Trie","insert","search","search","startsWith","insert","search"]
       [[],["apple"],["apple"],["app"],["app"],["app"],["app"]]
Output: [null,null,true,false,true,null,true]
\`\`\``,
      constraints: `- \`1 <= word.length, prefix.length <= 2000\`
- \`word\` and \`prefix\` consist only of lowercase English letters.`,
      hints: ['Each node stores children[26] and an isEnd flag.'],
      tags: ['trie', 'hash-table'],
      testCases: [
        { input: '["insert","search","search","startsWith","insert","search"]\n["apple","apple","app","app","app","app"]', expectedOutput: '[null,true,false,true,null,true]', isSample: true, orderIndex: 0 },
      ],
    },
    {
      number: 211,
      title: 'Design Add and Search Words Data Structure',
      slug: 'design-add-and-search-words-data-structure',
      difficulty: Difficulty.medium,
      description: `Design a data structure that supports adding new words and finding if a string matches any previously added string.

Implement the \`WordDictionary\` class:
- \`WordDictionary()\` Initializes the object.
- \`void addWord(word)\` Adds \`word\` to the data structure.
- \`bool search(word)\` Returns \`true\` if there is any string in the data structure that matches \`word\` or \`false\` otherwise. \`word\` may contain dots \`'.'\` where dots can be matched with any letter.

**Example 1:**
\`\`\`
Input: ["addWord","addWord","addWord","search","search","search","search"]
       [["bad"],["dad"],["mad"],["pad"],["bad"],[".ad"],["b.."]]
Output: [null,null,null,false,true,true,true]
\`\`\``,
      constraints: `- \`1 <= word.length <= 25\`
- \`word\` in \`addWord\` consists of lowercase English letters.
- \`word\` in \`search\` consists of \`'.'\` or lowercase English letters.`,
      hints: ['Use a trie with DFS for wildcard \'.\' matching.'],
      tags: ['trie', 'backtracking'],
      testCases: [
        { input: '["addWord","addWord","addWord","search","search","search","search"]\n[["bad"],["dad"],["mad"],["pad"],["bad"],[".ad"],["b.."]]', expectedOutput: '[null,null,null,false,true,true,true]', isSample: true, orderIndex: 0 },
      ],
    },
    {
      number: 212,
      title: 'Word Search II',
      slug: 'word-search-ii',
      difficulty: Difficulty.hard,
      description: `Given an \`m x n\` \`board\` of characters and a list of strings \`words\`, return *all words on the board*.

Each word must be constructed from letters of sequentially adjacent cells. The same letter cell may not be used more than once in a word.

**Example 1:**
\`\`\`
Input: board = [["o","a","a","n"],["e","t","a","e"],["i","h","k","r"],["i","f","l","v"]], words = ["oath","pea","eat","rain"]
Output: ["eat","oath"]
\`\`\``,
      constraints: `- \`m == board.length\`
- \`n == board[i].length\`
- \`1 <= m, n <= 12\`
- \`1 <= words.length <= 3 * 10^4\``,
      hints: ['Build a Trie from words, then DFS on the board using the trie to prune.'],
      tags: ['trie', 'backtracking', 'matrix'],
      testCases: [
        { input: '[["o","a","a","n"],["e","t","a","e"],["i","h","k","r"],["i","f","l","v"]]\n["oath","pea","eat","rain"]', expectedOutput: '["eat","oath"]', isSample: true, orderIndex: 0 },
        { input: '[["a","b"],["c","d"]]\n["abcb"]', expectedOutput: '[]', isSample: true, orderIndex: 1 },
      ],
    },

    // ── Existing problems (kept for completeness) ──────────────────────────────
    {
      number: 2,
      title: 'Add Two Numbers',
      slug: 'add-two-numbers',
      difficulty: Difficulty.medium,
      description: `You are given two **non-empty** linked lists representing two non-negative integers. The digits are stored in **reverse order**, and each of their nodes contains a single digit. Add the two numbers and return the sum as a linked list.

**Example 1:**
\`\`\`
Input: l1 = [2,4,3], l2 = [5,6,4]
Output: [7,0,8]
\`\`\``,
      constraints: `- The number of nodes in each linked list is in the range \`[1, 100]\`.`,
      hints: [],
      tags: ['linked-list', 'math'],
      testCases: [
        { input: '[2,4,3]\n[5,6,4]', expectedOutput: '[7,0,8]', isSample: true, orderIndex: 0 },
        { input: '[0]\n[0]', expectedOutput: '[0]', isSample: true, orderIndex: 1 },
      ],
    },
  ]

  for (const problemData of problems) {
    const { tags: problemTags, testCases: problemTestCases, ...problemFields } = problemData

    const problem = await prisma.problem.upsert({
      where: { slug: problemFields.slug },
      update: {},
      create: {
        ...problemFields,
        hints: problemFields.hints,
        status: ProblemStatus.published,
        createdBy: admin.id,
        totalSubmissions: Math.floor(Math.random() * 100000),
        totalAccepted: Math.floor(Math.random() * 50000),
        acceptanceRate: Math.random() * 70 + 20,
      },
    })

    for (const tagSlug of problemTags) {
      const tag = tags.find((t) => t.slug === tagSlug)
      if (tag) {
        await prisma.problemTag.upsert({
          where: { problemId_tagId: { problemId: problem.id, tagId: tag.id } },
          update: {},
          create: { problemId: problem.id, tagId: tag.id },
        })
      }
    }

    // Delete existing test cases before re-adding (upsert not available without unique key)
    await prisma.testCase.deleteMany({ where: { problemId: problem.id } })
    for (const tc of problemTestCases) {
      await prisma.testCase.create({ data: { ...tc, problemId: problem.id } })
    }
  }

  // ─── Blind 75 Study Plan ──────────────────────────────────────────────────
  const studyPlan = await prisma.studyPlan.upsert({
    where: { slug: 'blind-75' },
    update: {},
    create: {
      title: 'Blind 75',
      slug: 'blind-75',
      description: 'The classic 75 LeetCode questions curated for technical interviews at top companies.',
      difficultyLevel: 'Mixed',
      durationDays: 30,
    },
  })

  const blind75Slugs = [
    'two-sum', 'best-time-to-buy-and-sell-stock', 'contains-duplicate',
    'product-of-array-except-self', 'maximum-subarray', 'maximum-product-subarray',
    'find-minimum-in-rotated-sorted-array', 'search-in-rotated-sorted-array',
    '3sum', 'container-with-most-water', 'trapping-rain-water',
    'sum-of-two-integers', 'number-of-1-bits', 'counting-bits',
    'missing-number', 'reverse-bits',
    'climbing-stairs', 'coin-change', 'longest-increasing-subsequence',
    'longest-common-subsequence', 'word-break', 'combination-sum-iv',
    'house-robber', 'house-robber-ii', 'decode-ways', 'unique-paths', 'jump-game',
    'longest-substring-without-repeating-characters',
    'longest-repeating-character-replacement', 'minimum-window-substring',
    'valid-anagram', 'group-anagrams', 'valid-parentheses', 'valid-palindrome',
    'longest-palindromic-substring', 'palindromic-substrings',
    'insert-interval', 'merge-intervals', 'non-overlapping-intervals',
    'set-matrix-zeroes', 'spiral-matrix', 'rotate-image',
    'reverse-linked-list', 'merge-two-sorted-lists', 'linked-list-cycle',
    'merge-k-sorted-lists', 'remove-nth-node-from-end-of-list', 'reorder-list',
    'maximum-depth-of-binary-tree', 'same-tree', 'invert-binary-tree',
    'binary-tree-maximum-path-sum', 'binary-tree-level-order-traversal',
    'validate-binary-search-tree', 'kth-smallest-element-in-a-bst',
    'lowest-common-ancestor-of-a-bst',
    'construct-binary-tree-from-preorder-and-inorder-traversal',
    'subtree-of-another-tree', 'serialize-and-deserialize-binary-tree',
    'longest-consecutive-sequence', 'number-of-islands', 'course-schedule',
    'top-k-frequent-elements', 'kth-largest-element-in-an-array',
    'implement-trie-prefix-tree', 'design-add-and-search-words-data-structure',
    'word-search-ii',
  ]

  for (let i = 0; i < blind75Slugs.length; i++) {
    const slug = blind75Slugs[i]!
    const problem = await prisma.problem.findUnique({ where: { slug } })
    if (problem) {
      await prisma.studyPlanProblem.upsert({
        where: { planId_problemId: { planId: studyPlan.id, problemId: problem.id } },
        update: {},
        create: { planId: studyPlan.id, problemId: problem.id, dayNumber: Math.floor(i / 3) + 1, orderIndex: i },
      })
    }
  }

  console.log('✅ Database seeded with Blind 75 problems!')
}

main()
  .catch((e) => {
    console.error(e)
    process.exit(1)
  })
  .finally(async () => {
    await prisma.$disconnect()
  })
