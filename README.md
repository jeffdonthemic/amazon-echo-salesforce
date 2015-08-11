# AWS Lambda function for Alexa & Salesforce
A sample [AWS Lambda](http://aws.amazon.com/lambda) function that demonstrates the following use cases for Salesforce:

* Create a new lead
* Check an Opportunity status by name
* Get new leads for today
* Check my calendar for today

[See this video for a quick demo.](https://www.youtube.com/watch?v=LPhSf7SFFTk)

The application uses [nforce](https://github.com/kevinohara80/nforce) with Amazon Lambda in a single user model. I could have easily used Heroku to host the application but most of the AWS samples use Lambda and it's dead simple to use.

## Examples

"Alexa, ask Salesforce for my new leads"

"Alexa, ask Salesforce to create a lead"

"Alexa, ask Salesforce for opportunity Edge SLA"

"Alexa, ask Salesforce for my calendar for today"

## Setup
To run this example skill you need to do two things. The first is to deploy the example code in lambda, and the second is to configure the Alexa skill to use Lambda.

### AWS Lambda Setup
1. Go to the AWS Console and click on the Lambda link. Note: ensure you are in us-east or you won't be able to use Alexa with Lambda.
2. Click on the Create a Lambda Function or Get Started Now button.
3. Name the Lambda Function "Salesforce_Skill".
4. Go to the the src directory, select all files and folders and then create a zip file, make sure the zip file does not contain the src directory itself, otherwise Lambda function will not work.
5. Upload the .zip file to the Lambda
6. Keep the Handler as index.handler (this refers to the main js file in the zip).
7. Create a basic execution role and click create.
8. Return to the main Lambda page, and click on "Events Sources" tab and click "Add Event Source".
9. Choose Alexa Skills Kit and click submit.
10. Copy the ARN from the upper right to be used later in the Alexa Skill Setup

### Alexa Skill Setup
1. Go to the [Alexa Console](https://developer.amazon.com/edw/home.html) and click Add a New Skill.
2. Set "Salesforce" as the skill name and "salesforce" as the invocation name, this is what is used to activate your skill. For example you would say: "Alexa, Ask Salesforce for for my new leads."
3. Select the Lambda ARN for the skill Endpoint and paste the ARN copied from above. Click Next.
4. Copy the Intent Schema from the included IntentSchema.json.
5. Copy the Sample Utterances from the included SampleUtterances.txt. Click Next.
6. [optional] go back to the skill Information tab and copy the appId. Paste the appId into the index.js file for the variable APP_ID,
   then update the lambda source zip file with this change and upload to lambda again, this step makes sure the lambda function only serves request from authorized source.
7. You are now able to start testing your sample skill! You should be able to go to the [Echo webpage](http://echo.amazon.com/#skills) and see your skill enabled.
9. Your skill is now saved and once you are finished testing you can continue to publish your skill.
