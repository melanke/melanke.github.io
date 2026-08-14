---
kind: linkedin-post
shape: Cold observation
status: ready
---

## Post

AWS is the one part of the stack most teams still test by hoping nobody else touches the dev account at the same time. The fix most reach for is a sandbox account per developer, which trades a collision problem for a provisioning one. Someone still has to request that account and remember to kill it before the bill does the remembering instead.

Local emulators skip the account dance entirely, and for years LocalStack was the only serious option. Now there is Floci, and I've had it running locally this week. The whole setup is three lines.

floci start
eval $(floci env)
aws s3 mb s3://whatever

It binds the same port LocalStack uses (4566), so anything already pointed at an emulator keeps working. The free edition I'm running reports 70 services enabled, Lambda and DynamoDB and Step Functions and Cognito included. Once it is running locally, it also changes what is practical. Wire it into a git hook or run it in CI without waiting on a shared account, and it gives an AI agent something real to deploy and break in a loop instead of a mocked call it cannot actually fail on.

Competition here is good news, LocalStack needed some. Since March this year it requires an account and an auth token just to pull the image, community and pro merged into one. The free Hobby plan covers non-commercial use, but CI credits, the exact thing most teams relied on, aren't included. The backlash had less to do with the price and more with the pattern, years of free community bug reports and pull requests, now behind a login wall.

The gap both LocalStack and Floci still leave you is IAM. I created a user with no policy attached, used its keys, and happily made a bucket. Real AWS would have said no. The emulator tests your logic. Your permissions are still tested in production.

Most System Design material has the same shape, a diagram and a description of the happy path. AWS setup guides have the same problem, a terraform apply you copy once and never watch fail. Discovering Floci this week showed me what was missing, infrastructure cheap enough to break on my own laptop instead of just drawing it. So I started aws-patterns-lab, small AWS architecture patterns that spin up on Floci and inject a failure on purpose, then check how far the damage actually spreads. Most material stops at "it works." This stops at "and here is what breaks when it does not."

It's early. If you want the patterns as they land, hit Watch, link in the comments.

hashtag#SoftwareEngineering hashtag#AWS hashtag#SystemDesign hashtag#CloudComputing hashtag#DevOps hashtag#Testing

## First comment

github.com/melanke/aws-patterns-lab
