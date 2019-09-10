/* eslint-disable default-case */
import { Installation } from '../../models'
import { synchronizeFromInstallationId } from '../../jobs/synchronize'

async function createOrUpdateInstallation(payload) {
  let installation = await Installation.query()
    .where({ githubId: payload.githubId })
    .first()

  if (installation) {
    await installation.$query().patch(payload)
  } else {
    installation = Installation.query().insertAndFetch(payload)
  }

  return installation
}

export async function handleGitHubEvents({ name, payload }) {
  try {
    switch (name) {
      case 'installation_repositories': {
        switch (payload.action) {
          case 'removed':
          case 'added': {
            const installation = await createOrUpdateInstallation({
              githubId: payload.installation.id,
              deleted: false,
            })
            await synchronizeFromInstallationId(installation.id)
            return
          }
        }
        return
      }
      case 'installation': {
        switch (payload.action) {
          case 'created': {
            const installation = await createOrUpdateInstallation({
              githubId: payload.installation.id,
              deleted: false,
            })
            await synchronizeFromInstallationId(installation.id)
            return
          }
          case 'deleted': {
            const installation = await createOrUpdateInstallation({
              githubId: payload.installation.id,
              deleted: true,
            })
            await synchronizeFromInstallationId(installation.id)
            return
          }
        }
        return
      }
    }
  } catch (error) {
    console.error(error)
  }
}
