const fse = require("fs-extra")

const databaseFilePath = "./storage.json"
module.exports = class Storage {
  read() {
    return fse.readJSONSync(databaseFilePath)
  }

  write(value) {
    return fse.writeJSONSync(databaseFilePath, value)
  }

  getAll() {
    return this.read()
  }

  get(key) {
    return this.read()[key]
  }

  set(key, value) {
    const db = this.read()
    db[key] = value
    this.write(db)
  }

  list(prefix) {
    const db = this.read()
    return Object.keys(db).filter(function(key) {
      return key.startsWith(prefix)
    })
  }
}