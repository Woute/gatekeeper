{spawn, exec} = require 'child_process'

# ANSI terminal colors.
# ----------

red   = `'\033[0;31m'`
green = `'\033[0;32m'`
reset = `'\033[0m'`

# Commands
# ----------

herokuCreate = "heroku create --stack cedar"
herokuPush   = "git push heroku master"

# Helpers
# ----------

# Log a message with a color.
log = (message, color, explanation) ->
  console.log "#{color or ''}#{message}#{reset} #{explanation or ''}"

# Tasks
# ----------

task 'heroku:create', 'Create the app on the cedar stack', (options) ->
  exec herokuCreate, (err, stdout, stderr) ->
    throw err if err
    log stdout
    log 'Sucessfully created the app on heroku.', green

task 'heroku:push', 'Push changes to heroku', (options) ->
  exec herokuPush, (err, stdout, stderr) ->
    throw err if err
    log stdout
    log 'Sucessfully pushed app to heroku.', green
