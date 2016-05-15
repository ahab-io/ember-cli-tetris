import { Adapter } from 'ember-pouch';
import PouchDB from 'pouchdb';
import config from '../config/environment';
import Ember from 'ember';

const { assert, isEmpty } = Ember;

if (config.environment === 'development') {
  // PouchDB.debug.enable('*');
}

function createDb() {
  let localDb = config.emberPouch.localDb;

  assert('emberPouch.localDb must be set', !isEmpty(localDb));

  let db = new PouchDB(localDb);

  if (config.emberPouch.remoteDb) {
    let remoteDb = new PouchDB(config.emberPouch.remoteDb);

    db.sync(remoteDb, {
      live: true,
      retry: true
    })//.on('change', function (info) {
    //   console.log('change - ' + info);
    //   // handle change
    // }).on('paused', function (err) {
    //   console.log('paused - ' + err);
    //   // replication paused (e.g. replication up to date, user went offline)
    // }).on('active', function () {
    //   console.log('active');
    //   // replicate resumed (e.g. new changes replicating, user went back online)
    // }).on('denied', function (err) {
    //   console.log('denied - ' + err);
    //   // a document failed to replicate (e.g. due to permissions)
    // }).on('complete', function (info) {
    //   console.log('complete - ' + info);
    //   // handle complete
    // }).on('error', function (err) {
    //   console.log('error - ' + err);
    //   // handle error
    // });;
  }

  return db;
}

export default Adapter.extend({
  init() {
    this._super(...arguments);
    this.set('db', createDb());
  }
});
