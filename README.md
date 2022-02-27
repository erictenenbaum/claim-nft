# claim-nft

## Setup

- Run `npm install` from the REPOSITORY root
- Install Serverless Framework `npm install -g serverless` **I've installed it globally - you don't necessarily have to**
- Install a local Java Runtime ([JRE for MacOS](https://docs.oracle.com/javase/9/install/installation-jdk-and-jre-macos.htm)
- Install local dynamodb: `npm run dynamo:install`

  **Alternatively you can run Dynamo via Docker (docker-compose included). I typically prefer Docker, but the serverless offline pluggin integrates nicely with the dynamodb-local pluggin and both start up in tandem. I recommend just using the dynamodb-local pluggin**

**Docker Only (you do not need to create the table, if you are not using docker. Running `npm run serve` will do that for you - see below in the _Run Locally_ Section**

- Create the Dynamo Table: `npm run createDynamoTable`

## Usage

**Run locally**

- In a separate terminal window: `npm run serve` (CTRL-C to quit)

**To delete local dynamodb instance**

- Stop server and move `shared-local-instance.db` (inside .build directory) to trash.

**Deploy**

- Create an IAM Role in AWS with Deployment Permissions and Programatic Access (Need `ACCESS_KEY_ID` and `SECRET_ACCESS_KEY`)
- Create a `.env` file in the root directory with ``ACCESS_KEY_ID`, `SECRET_ACCESS_KEY`, and `APP_APP_AWS_REGION`
- Configure your Serverless Login Credentials: `serverless config credentials --provider provider --key key --secret secret`
- Run `serverless deploy`

**Invoke the function locally.**

```
serverless invoke local --function functionName
```
