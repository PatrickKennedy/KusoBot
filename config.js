const yaml = require('js-yaml');
const fs = require('fs');

// Load basic config options
try {
  var common = yaml.safeLoad(fs.readFileSync('./config/common.yml', 'utf8'));
} catch (e) { console.log(e); }

// Load config options specific to environments but not secret
try {
  let env = process.env.NODE_ENV || "development";
  var config = yaml.safeLoad(fs.readFileSync(`./config/${env}.yml`, 'utf8'));
} catch (e) { console.log(e); }


// Load local overwrites - not commited to git
try {
  var local = yaml.safeLoad(fs.readFileSync('./config/local.yml', 'utf8'));
} catch (e) { console.log(e); }


// Load environment variable mappings
try {
  var env_map = yaml.safeLoad(fs.readFileSync('./config/env-map.yml', 'utf8'));
} catch (e) { console.log(e); }

config = module.exports = Object.assign({}, common, config, local);

// traverse an object tree an run a callback on each leaf node
function traverse (obj, callback, trail) {
  trail = trail || []

  Object.keys(obj).forEach(function (key) {
    var value = obj[key]

    if (Object.getPrototypeOf(value) === Object.prototype) {
      traverse(value, callback, trail.concat(key))
    } else {
      callback.call(obj, key, value, trail)
    }
  })
}

// ala http://stackoverflow.com/questions/6491463/accessing-nested-javascript-objects-with-string-key
// resolve "obj.path.to.value" into the nested value of on the object
Object.resolve = function(path, obj) {
    return path.split('.').reduce(function(prev, curr) {
        return prev ? prev[curr] : undefined
    }, obj || self)
}

// like the above, set "obj.path.to.value" on a nested object
Object.setByPath = function(path, obj, value) {
  var parts = path.split('.');
  return parts.reduce(function(prev, curr, ix) {
    return (ix + 1 == parts.length)
      ? prev[curr] = value
      : prev[curr] = prev[curr] || {};
  }, obj);
}

// Process the environment variable mapping - Traverse the config tree and
// replace config values with the envrionment key configured in env-map.yml
traverse(config, (key, value, trail) => {
  let path = trail.join('.');
  let env_key = Object.resolve(path, env_map);
  let env_value = process.env[env_key];
  if (typeof env_value === "undefined")
    return;

  Object.setByPath(path, config, env_value);
})
