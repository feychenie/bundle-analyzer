import crypto from 'crypto'
import { promisify } from 'util'
import { BaseModel, mergeSchemas } from './util'
import { UserRepositoryRight } from './UserRepositoryRight'
import { User } from './User'

const generateRandomBytes = promisify(crypto.randomBytes)

export class Repository extends BaseModel {
  static tableName = 'repositories'

  static jsonSchema = mergeSchemas(BaseModel.jsonSchema, {
    required: ['githubId', 'name', 'private', 'config'],
    properties: {
      githubId: { type: 'number' },
      name: { type: 'string' },
      active: { type: 'boolean' },
      archived: { type: 'boolean' },
      token: { type: 'string' },
      organizationId: { type: ['string', null] },
      userId: { type: ['string', null] },
      private: { type: 'boolean' },
      baselineBranch: { type: 'string' },
      config: { type: 'object' },
    },
  })

  static relationMappings = {
    builds: {
      relation: BaseModel.HasManyRelation,
      modelClass: 'Build',
      join: {
        from: 'repositories.id',
        to: 'builds.repositoryId',
      },
      modify(builder) {
        return builder.orderBy('number', 'desc')
      },
    },
    installations: {
      relation: BaseModel.ManyToManyRelation,
      modelClass: 'Installation',
      join: {
        from: 'repositories.id',
        through: {
          from: 'installation_repository_rights.repositoryId',
          to: 'installation_repository_rights.installationId',
        },
        to: 'installations.id',
      },
      modify(builder) {
        return builder.where({ deleted: false })
      },
    },
    organization: {
      relation: BaseModel.BelongsToOneRelation,
      modelClass: 'Organization',
      join: {
        from: 'repositories.organizationId',
        to: 'organizations.id',
      },
    },
    user: {
      relation: BaseModel.BelongsToOneRelation,
      modelClass: 'User',
      join: {
        from: 'repositories.userId',
        to: 'users.id',
      },
    },
  }

  getUsers() {
    return this.constructor.getUsers(this.id)
  }

  async $beforeInsert(queryContext) {
    await super.$beforeInsert(queryContext)
    this.token = await Repository.generateToken()
  }

  async $relatedOwner() {
    if (this.userId) {
      if (!this.user) {
        this.user = await this.$relatedQuery('user')
      }

      return this.user
    }

    if (this.organizationId) {
      if (!this.organization) {
        this.organization = await this.$relatedQuery('organization')
      }

      return this.organization
    }

    return null
  }

  static getUsers(repositoryId) {
    return User.query()
      .select('users.*')
      .join(
        'user_repository_rights',
        'users.id',
        '=',
        'user_repository_rights.userId',
      )
      .join(
        'repositories',
        'user_repository_rights.repositoryId',
        '=',
        'repositories.id',
      )
      .where('repositories.id', repositoryId)
  }

  async $checkWritePermission(user) {
    return Repository.checkWritePermission(this, user)
  }

  async $checkReadPermission(user) {
    return Repository.checkReadPermission(this, user)
  }

  static async checkWritePermission(repository, user) {
    if (!user) return false
    const userRepositoryRight = await UserRepositoryRight.query()
      .where({ userId: user.id, repositoryId: repository.id })
      .first()
    return Boolean(userRepositoryRight)
  }

  static async checkReadPermission(repository, user) {
    if (!repository.private) return true
    return Repository.checkWritePermission(repository, user)
  }

  static async generateToken() {
    const token = await generateRandomBytes(20)
    return token.toString('hex')
  }
}
