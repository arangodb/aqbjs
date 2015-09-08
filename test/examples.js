/*jshint node: true, loopfunc: true, evil: true, -W014: true */
/*globals describe: false, it: false */
'use strict';
var expect = require('expect.js'),
  qb = require('../');

function example(aql, fn) {
  it(aql, function () {
    expect(fn().toAQL()).to.equal(aql);
  });
}

describe('Query Builder examples', function () {
  example(
    'FOR my IN mycollection RETURN my._key',
    function (aql) {
      return qb
      .for('my').in('mycollection')
      .return('my._key');
    }
  );

  example(
    'RETURN "this will be returned"',
    function (aql) {
      return qb
      .return('"this will be returned"');
    }
  );

  example(
    'FOR year IN [2011, 2012, 2013] '
    + 'FOR quarter IN [1, 2, 3, 4] '
    + 'RETURN {'
    + 'y: year, '
    + 'q: quarter, '
    + 'nice: CONCAT(TO_STRING(quarter), "/", TO_STRING(year))'
    + '}',
    function () {
      return qb
      .for('year').in([2011, 2012, 2013])
      .for('quarter').in([1, 2, 3, 4])
      .return({
        y: 'year',
        q: 'quarter',
        nice: qb.CONCAT(qb.TO_STRING('quarter'), '"/"', qb.TO_STRING('year'))
      });
    }
  );

  example(
    'FOR u IN users '
    + 'UPDATE u WITH {'
    + 'gender: TRANSLATE(u.gender, {m: "male", f: "female"})'
    + '} IN users',
    function () {
      return qb.for('u').in('users')
      .update('u').with_({
        gender: qb.TRANSLATE('u.gender', {m: '"male"', f: '"female"'})
      }).in('users');
    }
  );

  example(
    'FOR u IN users '
    + 'FILTER (u.active == true) '
    + 'UPDATE u WITH {numberOfLogins: 0} IN users',
    function () {
      return qb.for('u').in('users')
      .filter(qb.ref('u.active').eq(true))
      .update('u').with_({numberOfLogins: 0}).in('users');
    }
  );

  example(
    'FOR u IN users '
    + 'FILTER (u.active == true) '
    + 'UPDATE u WITH {'
    + 'numberOfLogins: (u.numberOfLogins + 1)'
    + '} IN users',
    function () {
      return qb.for('u').in('users')
      .filter(qb.ref('u.active').eq(true))
      .update('u').with_({
        numberOfLogins: qb.ref('u.numberOfLogins').add(1)
      }).in('users');
    }
  );

  example(
    'FOR u IN users '
    + 'FILTER (u.active == true) '
    + 'UPDATE u WITH {'
    + 'lastLogin: DATE_NOW(), '
    + 'numberOfLogins: (HAS(u, "numberOfLogins") ? (u.numberOfLogins + 1) : 1)'
    + '} IN users',
    function () {
      return qb.for('u').in('users')
      .filter(qb.ref('u.active').eq(true))
      .update('u').with_({
        lastLogin: qb.DATE_NOW(),
        numberOfLogins: (
          qb.HAS('u', '"numberOfLogins"')
          .then(qb.ref('u.numberOfLogins').add(1))
          .else_(1)
        )
      }).in('users');
    }
  );

  example(
    'FOR u IN users '
    + 'REPLACE u IN backup',
    function () {
      return qb.for('u').in('users')
      .replace('u').in('backup');
    }
  );

  example(
    'FOR u IN users '
    + 'REPLACE u IN backup OPTIONS {ignoreErrors: true}',
    function () {
      return qb.for('u').in('users')
      .replace('u').in('backup').options({ignoreErrors: true});
    }
  );

  example(
    'FOR u IN users '
    + 'FILTER (((u.active == true) && (u.age >= 35)) && (u.age <= 37)) '
    + 'REMOVE u IN users',
    function () {
      return qb.for('u').in('users')
      .filter(
        qb.ref('u.active').eq(true)
        .and(qb.ref('u.age').gte(35))
        .and(qb.ref('u.age').lte(37))
      )
      .remove('u').in('users');
    }
  );

  example(
    'FOR i IN 1..1000 '
    + 'INSERT {'
    + 'id: (100000 + i), '
    + 'age: (18 + FLOOR((RAND() * 25))), '
    + 'name: CONCAT(test, TO_STRING(i)), '
    + 'active: false, '
    + 'gender: (((i % 2) == 0) ? "male" : "female")'
    + '} INTO users',
    function () {
      return qb.for('i').in(qb.range(1, 1000))
      .insert({
        id: qb(100000).add('i'),
        age: qb(18).add(qb.FLOOR(qb.RAND().times(25))),
        name: qb.CONCAT('test', qb.TO_STRING('i')),
        active: false,
        gender: (
          qb.ref('i').mod(2).eq(0)
          .then('"male"')
          .else_('"female"')
        )
      }).into('users');
    }
  );

  example(
    'FOR u IN users '
    + 'INSERT u INTO backup',
    function () {
      return qb.for('u').in('users')
      .insert('u').into('backup');
    }
  );

  example(
    'FOR u IN users '
    + 'LIMIT 0, 3 '
    + 'RETURN {users: {'
    + 'isActive: (u.active ? "yes" : "no"), '
    + 'name: u.name'
    +'}}',
    function () {
      return qb.for('u').in('users')
      .limit(0, 3)
      .return({
        users: {
          isActive: qb.ref('u.active').then('"yes"').else_('"no"'),
          name: 'u.name'
        }
      });
    }
  );

  example(
    'FOR u IN users '
    + 'FILTER ((u.active == true) && (u.age >= 30)) '
    + 'SORT u.age DESC '
    + 'LIMIT 0, 5 '
    + 'RETURN {age: u.age, name: u.name}',
    function () {
      return qb.for('u').in('users')
      .filter(
        qb.ref('u.active').eq(true)
        .and(qb.ref('u.age').gte(30))
      )
      .sort('u.age', 'DESC')
      .limit(0, 5)
      .return({
        age: 'u.age',
        name: 'u.name'
      });
    }
  );

  example(
    'FOR u IN users '
    + 'FILTER (u.active == true) '
    + 'LIMIT 0, 4 '
    + 'FOR f IN relations '
    + 'FILTER ((f.type == "friend") && (f.from == u.id)) '
    + 'RETURN {user: u.name, friendId: f.to}',
    function () {
      return qb.for('u').in('users')
      .filter(qb.ref('u.active').eq(true))
      .limit(0, 4)
      .for('f').in('relations')
      .filter(
        qb.ref('f.type').eq('"friend"')
        .and(qb.ref('f.from').eq('u.id'))
      )
      .return({
        user: 'u.name',
        friendId: 'f.to'
      });
    }
  );

  example(
    'FOR u IN users '
    + 'FILTER (u.active == true) '
    + 'LIMIT 0, 4 '
    + 'RETURN {'
    + 'user: u.name, '
    + 'friendIds: ('
    + 'FOR f IN relations '
    + 'FILTER ((f.from == u.id) && (f.type == "friend")) '
    + 'RETURN f.to'
    + ')'
    + '}',
    function () {
      return qb.for('u').in('users')
      .filter(qb.ref('u.active').eq(true))
      .limit(0, 4)
      .return({
        user: 'u.name',
        friendIds: qb.for('f').in('relations').filter(
          qb.ref('f.from').eq('u.id')
          .and(qb.ref('f.type').eq('"friend"'))
        ).return('f.to')
      });
    }
  );

  example(
    'FOR u IN users '
    + 'FILTER (u.active == true) '
    + 'LIMIT 0, 4 '
    + 'RETURN {'
    + 'user: u.name, '
    + 'friendIds: ('
    + 'FOR f IN relations '
    + 'FILTER ((f.from == u.id) && (f.type == "friend")) '
    + 'FOR u2 IN users '
    + 'FILTER (f.to == u2.id) '
    + 'RETURN u2.name'
    + ')'
    + '}',
    function () {
      return qb.for('u').in('users')
      .filter(qb.ref('u.active').eq(true))
      .limit(0, 4)
      .return({
        user: 'u.name',
        friendIds: qb.for('f').in('relations').filter(
          qb.ref('f.from').eq('u.id')
          .and(qb.ref('f.type').eq('"friend"'))
        ).for('u2').in('users').filter(
          qb.ref('f.to').eq('u2.id')
        ).return('u2.name')
      });
    }
  );

  example(
    'FOR u IN users '
    + 'FILTER (u.active == true) '
    + 'COLLECT age = u.age INTO usersByAge '
    + 'SORT age DESC '
    + 'LIMIT 0, 5 '
    + 'RETURN {age: age, users: usersByAge[*].u.name}',
    function () {
      return qb.for('u').in('users')
      .filter(qb.ref('u.active').eq(true))
      .collect({age: 'u.age'}).into('usersByAge')
      .sort('age', 'DESC').limit(0, 5)
      .return({
        age: 'age',
        users: 'usersByAge[*].u.name'
      });
    }
  );

  example(
    'FOR u IN users '
    + 'FILTER (u.active == true) '
    + 'COLLECT age = u.age INTO usersByAge '
    + 'SORT age DESC '
    + 'LIMIT 0, 5 '
    + 'RETURN {age: age, users: ('
    + 'FOR temp IN usersByAge '
    + 'RETURN temp.u.name'
    + ')}',
    function () {
      return qb.for('u').in('users')
      .filter(qb.ref('u.active').eq(true))
      .collect({age: 'u.age'}).into('usersByAge')
      .sort('age', 'DESC').limit(0, 5)
      .return({
        age: 'age',
        users: qb.for('temp').in('usersByAge').return('temp.u.name')
      });
    }
  );

  example(
    'FOR u IN users '
    + 'FILTER (u.active == true) '
    + 'COLLECT ageGroup = (FLOOR((u.age / 5)) * 5), gender = u.gender INTO group '
    + 'SORT ageGroup DESC '
    + 'RETURN {ageGroup: ageGroup, gender: gender}',
    function () {
      return qb.for('u').in('users')
      .filter(qb.ref('u.active').eq(true))
      .collect({
        ageGroup: qb.FLOOR(qb.ref('u.age').div(5)).times(5),
        gender: 'u.gender'
      }).into('group')
      .sort('ageGroup', 'DESC')
      .return({
        ageGroup: 'ageGroup',
        gender: 'gender'
      });
    }
  );

  example(
    'FOR u IN users '
    + 'FILTER (u.active == true) '
    + 'COLLECT ageGroup = (FLOOR((u.age / 5)) * 5), gender = u.gender INTO group '
    + 'SORT ageGroup DESC '
    + 'RETURN {ageGroup: ageGroup, gender: gender, numUsers: LENGTH(group)}',
    function () {
      return qb.for('u').in('users')
      .filter(qb.ref('u.active').eq(true))
      .collect({
        ageGroup: qb.FLOOR(qb.ref('u.age').div(5)).times(5),
        gender: 'u.gender'
      }).into('group')
      .sort('ageGroup', 'DESC')
      .return({
        ageGroup: 'ageGroup',
        gender: 'gender',
        numUsers: qb.LENGTH('group')
      });
    }
  );

  example(
    'FOR u IN users '
    + 'FILTER (u.active == true) '
    + 'COLLECT ageGroup = (FLOOR((u.age / 5)) * 5) INTO group '
    + 'LET numUsers = LENGTH(group) '
    + 'FILTER (numUsers > 2) '
    + 'SORT numUsers DESC '
    + 'LIMIT 0, 3 '
    + 'RETURN {ageGroup: ageGroup, numUsers: numUsers, users: group[*].u.name}',
    function () {
      return qb.for('u').in('users')
      .filter(qb.ref('u.active').eq(true))
      .collect({
        ageGroup: qb.FLOOR(qb.ref('u.age').div(5)).times(5)
      }).into('group')
      .let('numUsers', qb.LENGTH('group'))
      .filter(qb.ref('numUsers').gt(2))
      .sort('numUsers', 'DESC')
      .limit(0, 3)
      .return({
        ageGroup: 'ageGroup',
        numUsers: 'numUsers',
        users: 'group[*].u.name'
      });
    }
  );

  example(
    'UPSERT {ip: "192.168.173.13"} '
    + 'INSERT {ip: "192.168.173.13", name: "flittard"} '
    + 'UPDATE {} '
    + 'IN hosts',
    function () {
      return qb.upsert({ip: qb.str('192.168.173.13')})
      .insert({ip: qb.str('192.168.173.13'), name: qb.str('flittard')})
      .update({})
      .in('hosts');
    }
  );

  example(
    'UPSERT {ip: "192.168.173.13"} '
    + 'INSERT {ip: "192.168.173.13", name: "flittard"} '
    + 'UPDATE {} '
    + 'IN hosts '
    + 'LET isNewInstance = (`OLD` ? false : true) '
    + 'RETURN {doc: `NEW`, isNewInstance: isNewInstance}',
    function () {
      return qb.upsert({ip: qb.str('192.168.173.13')})
      .insert({ip: qb.str('192.168.173.13'), name: qb.str('flittard')})
      .update({})
      .in('hosts')
      .let('isNewInstance', qb.ref('OLD').then(false).else(true))
      .return({doc: 'NEW', isNewInstance: 'isNewInstance'});
    }
  );

  example(
    'foo[1][2][3]',
    function () {
      return qb.ref('foo').get(1, 2, 3);
    }
  );
});