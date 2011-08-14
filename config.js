var config = {}

config.git = {};
config.mongo = {};

config.git.repository = "/tmp/core";
config.git.log_command = "git log --pretty=format:\"%H | %ad | %s%d\" --date=raw"

config.mongo.database_name = "git4";
config.mongo.collection_name = "commits";

module.exports = config;