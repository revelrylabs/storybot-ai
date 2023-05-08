# StoryBot

An AI Powered CLI tool to generate detailed and well formatted User Stories. It uses LangChain and OpenAI to generate a User story in BDD/Markdown format into your terminal, and then allows you to create an issue in the relevant Github Repo using the `gh` CLI tools.

## Usage

### Install StoryBot

```
npm install -g storybot-ai
```

### OpenAI API Keys

In order for StoryBot to do the magic, it will need access to OpenAI's data models. This requires an API Key from OpenAI, which requires you to sign up for an account at https://platform.openai.com/signup. Once you have an OpenAI account, you can get an API Key here: https://platform.openai.com/account/api-keys. You can then export the environment variable in your terminal with `export OPENAI_API_KEY="sk-abcdefghijklmnopqrstuvwxyz"` (replace with your actual api key).

### Install GitHub CLI (optional)

If you want to be able to insert issues directly into GitHub from your command line, we recommend [installing the gh CLI](https://cli.github.com/manual/installation).

### Start Writing Stories

Use the `npx gen.story` command to start generating user stories. The first argument is required and should be a string describing the feature we are writing a user story for. 

There are a few additional options you can pass to `gen.story` to further tailor your responses:
| Flag | Description |
| ---- | ----------- |
| `--context` | Add some additional context around the feature you are writing a user story for. |
| `--stack` | Specify the tech stack that the user story will need to be implemented in. |

#### Examples

[![asciicast](https://asciinema.org/a/0lG6MByCapvyzeDnwRw7K0zIZ.svg)](https://asciinema.org/a/0lG6MByCapvyzeDnwRw7K0zIZ)
