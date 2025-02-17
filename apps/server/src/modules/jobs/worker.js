import { getChannel } from 'services/amqp'
import { logger } from 'modules/util'

export async function consumeJobs(jobs) {
  try {
    const channel = await getChannel()
    await Promise.all(
      jobs.map(job => {
        logger.info(`Start consuming ${job.queue} queue`)
        return job.process({ channel })
      }),
    )
  } catch (error) {
    setTimeout(() => {
      throw error
    })
  }
}
