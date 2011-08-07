var config = {}

config.git = {};
config.mongo = {};

config.git.repository = "/tmp/core"

config.mongo.database_name = "git";
config.mongo.collection_name = "commits";

module.exports = config;