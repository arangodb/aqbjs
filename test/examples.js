/* jshint globalstrict: true, es3: true, loopfunc: true, evil: true, -W014: true */
/* globals require: false, describe: false, it: false */
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
      .for_('my').in_('mycollection')
      .return_('my._key');
    }
  );

  example(
    'RETURN "this will be returned"',
    function (aql) {
      return qb
      .return_('"this will be returned"');
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
      .for_('year').in_([2011, 2012, 2013])
      .for_('quarter').in_([1, 2, 3, 4])
      .return_({
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
      return qb.for_('u').in_('users')
      .update('u').with_({
        gender: qb.TRANSLATE('u.gender', {m: '"male"', f: '"female"'})
      }).in_('users');
    }
  );

  example(
    'FOR u IN users '
    + 'FILTER (u.active == true) '
    + 'UPDATE u WITH {numberOfLogins: 0} IN users',
    function () {
      return qb.for_('u').in_('users')
      .filter(qb.eq('u.active', true))
      .update('u').with_({numberOfLogins: 0}).in_('users');
    }
  );

  example(
    'FOR u IN users '
    + 'FILTER (u.active == true) '
    + 'UPDATE u WITH {'
    + 'numberOfLogins: (u.numberOfLogins + 1)'
    + '} IN users',
    function () {
      return qb.for_('u').in_('users')
      .filter(qb.eq('u.active', true))
      .update('u').with_({
        numberOfLogins: qb.add('u.numberOfLogins', 1)
      }).in_('users');
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
      return qb.for_('u').in_('users')
      .filter(qb.eq('u.active', true))
      .update('u').with_({
        lastLogin: qb.DATE_NOW(),
        numberOfLogins: qb.if_(qb.HAS('u', '"numberOfLogins"'), qb.add('u.numberOfLogins', 1), 1)
      }).in_('users');
    }
  );

  example(
    'FOR u IN users '
    + 'REPLACE u IN backup',
    function () {
      return qb.for_('u').in_('users')
      .replace('u').in_('backup');
    }
  );

  example(
    'FOR u IN users '
    + 'REPLACE u IN backup OPTIONS {ignoreErrors: true}',
    function () {
      return qb.for_('u').in_('users')
      .replace('u').in_('backup').options({ignoreErrors: true});
    }
  );

  example(
    'FOR u IN users '
    + 'FILTER ((u.active == true) && ((u.age >= 35) && (u.age <= 37))) '
    + 'REMOVE u IN users',
    function () {
      return qb.for_('u').in_('users')
      .filter(
        qb.and(
          qb.eq('u.active', true),
          qb.and(
            qb.gte('u.age', 35),
            qb.lte('u.age', 37)
          )
        )
      )
      .remove('u').in_('users');
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
      return qb.for_('i').in_(qb.range(1, 1000))
      .insert({
        id: qb.add(100000, 'i'),
        age: qb.add(18, qb.FLOOR(qb.mul(qb.RAND(), 25))),
        name: qb.CONCAT('test', qb.TO_STRING('i')),
        active: false,
        gender: qb.if_(
          qb.eq(qb.mod('i', 2), 0),
          '"male"',
          '"female"'
        )
      }).into('users');
    }
  );

  example(
    'FOR u IN users '
    + 'INSERT u INTO backup',
    function () {
      return qb.for_('u').in_('users')
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
      return qb.for_('u').in_('users')
      .limit(0, 3)
      .return_({
        users: {
          isActive: qb.if_('u.active', '"yes"', '"no"'),
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
      return qb.for_('u').in_('users')
      .filter(qb.and(
        qb.eq('u.active', true),
        qb.gte('u.age', 30)
      ))
      .sort('u.age', 'DESC')
      .limit(0, 5)
      .return_({
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
      return qb.for_('u').in_('users')
      .filter(qb.eq('u.active', true))
      .limit(0, 4)
      .for_('f').in_('relations')
      .filter(qb.and(
        qb.eq('f.type', '"friend"'),
        qb.eq('f.from', 'u.id')
      ))
      .return_({
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
      return qb.for_('u').in_('users')
      .filter(qb.eq('u.active', true))
      .limit(0, 4)
      .return_({
        user: 'u.name',
        friendIds: qb.for_('f').in_('relations').filter(qb.and(
          qb.eq('f.from', 'u.id'),
          qb.eq('f.type', '"friend"')
        )).return_('f.to')
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
      return qb.for_('u').in_('users')
      .filter(qb.eq('u.active', true))
      .limit(0, 4)
      .return_({
        user: 'u.name',
        friendIds: qb.for_('f').in_('relations').filter(qb.and(
          qb.eq('f.from', 'u.id'),
          qb.eq('f.type', '"friend"')
        )).for_('u2').in_('users').filter(
          qb.eq('f.to', 'u2.id')
        ).return_('u2.name')
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
      return qb.for_('u').in_('users')
      .filter(qb.eq('u.active', true))
      .collect({age: 'u.age'}).into('usersByAge')
      .sort('age', 'DESC').limit(0, 5)
      .return_({
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
      return qb.for_('u').in_('users')
      .filter(qb.eq('u.active', true))
      .collect({age: 'u.age'}).into('usersByAge')
      .sort('age', 'DESC').limit(0, 5)
      .return_({
        age: 'age',
        users: qb.for_('temp').in_('usersByAge').return_('temp.u.name')
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
      return qb.for_('u').in_('users')
      .filter(qb.eq('u.active', true))
      .collect({
        ageGroup: qb.mul(qb.FLOOR(qb.div('u.age', 5)), 5),
        gender: 'u.gender'
      }).into('group')
      .sort('ageGroup', 'DESC')
      .return_({
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
      return qb.for_('u').in_('users')
      .filter(qb.eq('u.active', true))
      .collect({
        ageGroup: qb.mul(qb.FLOOR(qb.div('u.age', 5)), 5),
        gender: 'u.gender'
      }).into('group')
      .sort('ageGroup', 'DESC')
      .return_({
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
      return qb.for_('u').in_('users')
      .filter(qb.eq('u.active', true))
      .collect({
        ageGroup: qb.mul(qb.FLOOR(qb.div('u.age', 5)), 5)
      }).into('group')
      .let_('numUsers', qb.LENGTH('group'))
      .filter(qb.gt('numUsers', 2))
      .sort('numUsers', 'DESC')
      .limit(0, 3)
      .return_({
        ageGroup: 'ageGroup',
        numUsers: 'numUsers',
        users: 'group[*].u.name'
      });
    }
  );
});