import { PrismaClient } from '@prisma/client'
import { PROBLEM_TEMPLATES } from '@algoarena/shared-types'

const prisma = new PrismaClient()

async function main() {
  console.log('Seeding starter code and judge metadata...')

  for (const [slug, templates] of Object.entries(PROBLEM_TEMPLATES)) {
    const { meta, ...languageTemplates } = templates

    const updated = await prisma.problem.updateMany({
      where: { slug },
      data: {
        starterCode: languageTemplates as object,
        judgeMetadata: meta as object,
      },
    })

    if (updated.count > 0) {
      console.log(`  ✓ ${slug}`)
    } else {
      console.log(`  ✗ ${slug} — not found in DB`)
    }
  }

  console.log('Done.')
}

main()
  .catch((e) => { console.error(e); process.exit(1) })
  .finally(() => prisma.$disconnect())
