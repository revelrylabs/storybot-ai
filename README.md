# StoryBot

An AI Powered CLI tool to generate detailed and well formatted User Stories. It uses LangChain and OpenAI to generate a User story in BDD/Markdown format into your terminal, and then allows you to create an issue in the relevant Github Repo using the `gh` CLI tools.

## Usage

### Install StoryBot

```
npm install -g storybot
```

### OpenAI API Keys

In order for StoryBot to do the magic, it will need access to OpenAI's data models. This requires an API Key from OpenAI, which requires you to sign up for an account at https://platform.openai.com/signup. Once you have an OpenAI account, you can get an API Key here: https://platform.openai.com/account/api-keys. You can then export the environment variable in your terminal with `export OPEN_API_KEY="sk-abcdefghijklmnopqrstuvwxyz"` (replace with your actual api key).

### Install GitHub CLI (optional)

If you want to be able to insert issues directly into GitHub from your command line, we recommend [installing the gh CLI](https://cli.github.com/manual/installation).

### Start Writing Stories

Use the `npx gen.story` command to start generating user stories. The first argument is required and should be a string describing the feature we are writing a user story for. 

#### Example

```
❯ npx gen.story "MFA"


We can work with that...



## Background
Multi-factor authentication (MFA) is an important security feature that helps protect user accounts from unauthorized access. It requires users to provide two or more pieces of evidence (or factors) to verify their identity. Implementing MFA will help ensure that only authorized users can access the application.

## Scenario - User Enables MFA
- [ ] User is able to navigate to the MFA settings page
- [ ] User is able to select an MFA authentication method (e.g. SMS, email, etc.)
- [ ] User is able to enter their authentication credentials (e.g. phone number, email address, etc.)
- [ ] User is able to confirm their authentication credentials
- [ ] User is able to enable MFA
- [ ] User is able to see a success message confirming that MFA has been enabled

## Scenario - User Disables MFA
- [ ] User is able to navigate to the MFA settings page
- [ ] User is able to select an MFA authentication method (e.g. SMS, email, etc.)
- [ ] User is able to enter their authentication credentials (e.g. phone number, email address, etc

==========================================================


Would you like to create an issue in GitHub? (NOTE: This requires the GitHub CLI. See https://github.com/cli/cli#installation if you don't have it.) y/n  

y
What you like to call this issue?

Feature / Auth - MFA
Enter the `organization/repo` (e.g. `revelrylabs/ai`) for this issue: 

revelrylabs/ai


Continue from your browswer to finish adding your issue to to revelrylabs/ai! 🤘
```

