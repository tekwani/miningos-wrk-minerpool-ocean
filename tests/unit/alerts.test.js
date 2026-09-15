'use strict'

const test = require('brittle')
const { buildAlerts, DEVICE, ALERT_SPECS } = require('../../workers/lib/alerts')
const { POOL_TYPE } = require('../../workers/lib/constants')

test('buildAlerts: returns no alerts when components are online', (t) => {
  const alerts = buildAlerts({ datum: 'online', ocean: 'online' }, {}, 1000)
  t.is(alerts.length, 0)
})

test('buildAlerts: creates alerts when components are offline', (t) => {
  const alerts = buildAlerts({ datum: 'offline', ocean: 'offline' }, {}, 2000)
  t.is(alerts.length, 2)
  t.is(alerts[0].name, 'Datum_Offline')
  t.is(alerts[1].name, 'Ocean_pool_not_reachable')
  t.is(alerts[0].createdAt, 2000)
  t.is(alerts[0].code, POOL_TYPE)
  t.is(alerts[0].id, DEVICE.id)
  t.ok(alerts[0].uuid)
})

test('buildAlerts: reuses uuid and createdAt from previous alerts', (t) => {
  const prev = {
    Datum_Offline: { uuid: 'same-uuid', createdAt: 111 }
  }
  const alerts = buildAlerts({ datum: 'offline', ocean: 'online' }, prev, 9999)
  t.is(alerts.length, 1)
  t.is(alerts[0].uuid, 'same-uuid')
  t.is(alerts[0].createdAt, 111)
})

test('ALERT_SPECS: has datum and ocean specs', (t) => {
  t.is(ALERT_SPECS.length, 2)
  t.ok(ALERT_SPECS[0].active({ datum: 'offline' }))
  t.absent(ALERT_SPECS[0].active({ datum: 'online' }))
})
