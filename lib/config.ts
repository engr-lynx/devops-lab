import {
  DeployableAppConfig,
} from '@engr-lynx/cdk-pipeline-builder'

interface ContInstance {
  readonly cpu?: string
  readonly memory?: string
}

export interface WebConfig extends DeployableAppConfig {
  readonly sourceRepo: string
  readonly repoName: string
  readonly deleteImageRepoWithApp?: boolean
  readonly instance?: ContInstance
}

export interface ComponentsConfig {
  readonly web: WebConfig
}

export interface AppConfig {
  readonly name: string
  readonly components: ComponentsConfig
}
