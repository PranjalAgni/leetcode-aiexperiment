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

  // Create sample problems
  const problems = [
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
      hints: ['A really brute force way would be to search for all possible pairs of numbers but that would be too slow. Again, it\'s best to try to keep the time complexity to O(n).', 'So, if we fix one of the numbers, say x, we have to scan the entire array to find the next number y which is value - x where value is the input parameter. Can we change our array somehow so that this search becomes faster?', 'The second train of thought is, without changing the array, can we use additional space somehow? Like maybe a hash map to speed up the search?'],
      tags: ['array', 'hash-table'],
      testCases: [
        { input: '[2,7,11,15]\n9', expectedOutput: '[0,1]', isSample: true, orderIndex: 0 },
        { input: '[3,2,4]\n6', expectedOutput: '[1,2]', isSample: true, orderIndex: 1 },
        { input: '[3,3]\n6', expectedOutput: '[0,1]', isSample: false, orderIndex: 2 },
        { input: '[1,2,3,4,5]\n9', expectedOutput: '[3,4]', isSample: false, orderIndex: 3 },
      ],
    },
    {
      number: 2,
      title: 'Add Two Numbers',
      slug: 'add-two-numbers',
      difficulty: Difficulty.medium,
      description: `You are given two **non-empty** linked lists representing two non-negative integers. The digits are stored in **reverse order**, and each of their nodes contains a single digit. Add the two numbers and return the sum as a linked list.

You may assume the two numbers do not contain any leading zero, except the number 0 itself.

**Example 1:**
\`\`\`
Input: l1 = [2,4,3], l2 = [5,6,4]
Output: [7,0,8]
Explanation: 342 + 465 = 807.
\`\`\``,
      constraints: `- The number of nodes in each linked list is in the range \`[1, 100]\`.
- \`0 <= Node.val <= 9\`
- It is guaranteed that the list represents a number that does not have leading zeros.`,
      hints: [],
      tags: ['linked-list', 'math'],
      testCases: [
        { input: '[2,4,3]\n[5,6,4]', expectedOutput: '[7,0,8]', isSample: true, orderIndex: 0 },
        { input: '[0]\n[0]', expectedOutput: '[0]', isSample: true, orderIndex: 1 },
        { input: '[9,9,9,9,9,9,9]\n[9,9,9,9]', expectedOutput: '[8,9,9,9,0,0,0,1]', isSample: false, orderIndex: 2 },
      ],
    },
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
Explanation: The answer is "abc", with the length of 3.
\`\`\`

**Example 2:**
\`\`\`
Input: s = "bbbbb"
Output: 1
Explanation: The answer is "b", with the length of 1.
\`\`\``,
      constraints: `- \`0 <= s.length <= 5 * 10^4\`
- \`s\` consists of English letters, digits, symbols and spaces.`,
      hints: [],
      tags: ['string', 'hash-table', 'sliding-window'],
      testCases: [
        { input: '"abcabcbb"', expectedOutput: '3', isSample: true, orderIndex: 0 },
        { input: '"bbbbb"', expectedOutput: '1', isSample: true, orderIndex: 1 },
        { input: '"pwwkew"', expectedOutput: '3', isSample: false, orderIndex: 2 },
        { input: '""', expectedOutput: '0', isSample: false, orderIndex: 3 },
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
Explanation: The above elevation map is represented by array [0,1,0,2,1,0,1,3,2,1,2,1].
In this case, 6 units of rain water are being trapped.
\`\`\``,
      constraints: `- \`n == height.length\`
- \`1 <= n <= 2 * 10^4\`
- \`0 <= height[i] <= 10^5\``,
      hints: ['If x units of water are trapped at index i, they must come from min(max_left, max_right) - height[i]'],
      tags: ['array', 'two-pointers', 'dynamic-programming'],
      testCases: [
        { input: '[0,1,0,2,1,0,1,3,2,1,2,1]', expectedOutput: '6', isSample: true, orderIndex: 0 },
        { input: '[4,2,0,3,2,5]', expectedOutput: '9', isSample: true, orderIndex: 1 },
        { input: '[3,0,2,0,4]', expectedOutput: '7', isSample: false, orderIndex: 2 },
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

    for (const tc of problemTestCases) {
      await prisma.testCase.create({ data: { ...tc, problemId: problem.id } })
    }
  }

  // Create sample study plan
  const studyPlan = await prisma.studyPlan.upsert({
    where: { slug: 'blind-75' },
    update: {},
    create: {
      title: 'Blind 75',
      slug: 'blind-75',
      description: 'The classic 75 LeetCode questions curated for technical interviews.',
      difficultyLevel: 'Mixed',
      durationDays: 30,
    },
  })

  const twoSumProblem = await prisma.problem.findUnique({ where: { slug: 'two-sum' } })
  if (twoSumProblem) {
    await prisma.studyPlanProblem.upsert({
      where: { planId_problemId: { planId: studyPlan.id, problemId: twoSumProblem.id } },
      update: {},
      create: { planId: studyPlan.id, problemId: twoSumProblem.id, dayNumber: 1, orderIndex: 0 },
    })
  }

  console.log('✅ Database seeded successfully')
}

main()
  .catch((e) => {
    console.error(e)
    process.exit(1)
  })
  .finally(async () => {
    await prisma.$disconnect()
  })
