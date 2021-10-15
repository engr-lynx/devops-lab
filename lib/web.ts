import {
  join,
} from 'path'
import {
  Construct,
  RemovalPolicy,
} from '@aws-cdk/core'
import {
  DockerImageAsset,
} from '@aws-cdk/aws-ecr-assets'
import {
  StackRemovableRepository,
  ImageServiceRunner,
  RepositoryType,
} from '@engr-lynx/cdk-service-patterns'
import {
  SourceAction,
  SourceType,
  ImageBuildAction,
  StartablePipeline,
} from '@engr-lynx/cdk-pipeline-builder'
import {
  ForkedRepository,
} from '@engr-lynx/cdk-forked-codecommit'
import {
  ECRDeployment,
  DockerImageName,
} from 'cdk-ecr-deployment'
import {
  WebConfig,
} from './config'

export interface WebProps extends WebConfig {}

export class Web extends Construct {

  constructor(scope: Construct, id: string, props: WebProps) {
    super(scope, id)
    const stages = []
    const repo = new ForkedRepository(this, 'Repo', {
      repositoryName: props.repoName,
      srcRepo: props.sourceRepo,
    })
    const sourceAction = new SourceAction(this, 'SourceAction', {
      type: SourceType.CodeCommit,
      name: repo.repositoryName,
    })
    const sourceActions = [
      sourceAction.action,
    ]
    const sourceStage = {
      stageName: 'Source',
      actions: sourceActions,
    }
    stages.push(sourceStage)
    const removalPolicy = props.deleteImageRepoWithApp ? RemovalPolicy.DESTROY : RemovalPolicy.RETAIN
    const imageRepo = new StackRemovableRepository(this, 'ImageRepo', {
      removalPolicy,
    })
    const directory = join(__dirname, 'base-image')
    const baseImage = new DockerImageAsset(this, 'BaseImage', {
      directory,
    })
    const src = new DockerImageName(baseImage.imageUri)
    const dest = new DockerImageName(imageRepo.repositoryUri)
    const baseImageEcr = new ECRDeployment(this, 'BaseImageEcr', {
      src,
      dest,
    })
    const imageId = imageRepo.repositoryUri + ':latest'
    const serviceRunner = new ImageServiceRunner(this, 'ServiceRunner', {
      repositoryType: RepositoryType.ECR,
      imageId,
      port: "80",
      willAutoDeploy: true,
      cpu: props?.instance?.cpu,
      memory: props?.instance?.memory,
    })
    serviceRunner.node.addDependency(baseImageEcr)
    const imageBuildAction = new ImageBuildAction(this, 'ImageBuildAction', {
      ...props.pipeline.build,
      repoName: imageRepo.repositoryName,
      sourceCode: sourceAction.sourceCode,
    })
    const buildActions = [
      imageBuildAction.action,
    ]
    const buildStage = {
      stageName: 'Build',
      actions: buildActions,
    }
    stages.push(buildStage)
    new StartablePipeline(this, 'Pipeline', {
      ...props.pipeline,
      stages,
      restartExecutionOnUpdate: true,
    })
  }

}
