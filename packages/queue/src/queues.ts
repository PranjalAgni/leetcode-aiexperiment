import { Queue } from 'bullmq'
import { getRedisConnection } from './redis'
import type { JudgeJobData } from './jobs'
import { QUEUE_NAMES } from './jobs'

export function getJudgeQueue(): Queue<JudgeJobData> {
  return new Queue<JudgeJobData>(QUEUE_NAMES.JUDGE, {
    connection: getRedisConnection(),
    defaultJobOptions: {
      attempts: 3,
      backoff: { type: 'exponential', delay: 2000 },
      removeOnComplete: { count: 1000 },
      removeOnFail: { count: 500 },
    },
  })
}
