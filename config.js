var config = {}

config.git = {};
config.mongo = {};
config.go= {};

config.git.repository = "/tmp/core";
config.git.log_command = "git log --pretty=format:\"%H | %ad | %s%d\" --date=raw"

config.mongo.database_name = "git4";
config.mongo.collection_name = "commits";

config.go.hostname = "172.18.20.31"
config.go.port = 8153
config.go.buildTimesUrl = "/go/properties/search?pipelineName=main&stageName=build&jobName=build&limitCount=1000"

module.exports = config;