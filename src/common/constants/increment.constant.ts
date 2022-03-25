/**
 * @file Increment ID collection constant
 * @description Configuration for auto-increment table
 * @module constant/increment
 */

import { AutoIncrementIDOptions } from '@typegoose/auto-increment'

export const generalAutoIncrementIDConfig: AutoIncrementIDOptions = {
  field: 'id',
  startAt: 1,
  incrementBy: 1,
  trackerCollection: 'identitycounters',
  trackerModelName: 'identitycounter',
}