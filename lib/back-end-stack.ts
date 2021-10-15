import {
  Construct,
  Stack,
  StackProps,
} from '@aws-cdk/core'

export interface BackEndProps extends StackProps {}

export class BackEndStack extends Stack {
  constructor(scope: Construct, id: string, props: BackEndProps) {
    super(scope, id, props)
  }
}
