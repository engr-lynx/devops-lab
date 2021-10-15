import {
  Construct,
  Stack,
  StackProps,
} from '@aws-cdk/core'
import {
  Web,
} from './web'
import {
  ComponentsConfig,
} from './config'

export interface BackEndProps extends StackProps, ComponentsConfig  {}

export class BackEndStack extends Stack {
  constructor(scope: Construct, id: string, props: BackEndProps) {
    super(scope, id, props)
    new Web(this, 'Web', {
      ...props.web,
    })
  }
}
