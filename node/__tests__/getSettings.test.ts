import adConfiguration from '../constants/adConfiguration'
import clConfiguration from '../constants/clConfiguration'
import { getSettings } from '../middlewares/getSettings'

function getContext(entity: string, settings: Settings): unknown {
  return {
    vtex: {
      logger: { info: () => {} },
    },
    clients: {
      apps: { getAppSettings: () => settings },
    },
    state: {
      entity,
    },
  }
}

describe('getSettings', () => {
  it('get default CL configuration', async () => {
    const context = getContext('CL', {
      updateableClientFields: [],
      entityConfigurations: [],
    }) as Context

    await getSettings(context, async () => {})
    expect(context.state.entitySettings).toStrictEqual(clConfiguration)
  })

  it('get CL configuration with custom fields', async () => {
    const context = getContext('CL', {
      updateableClientFields: ['field1', 'field2'],
      entityConfigurations: [],
    }) as Context

    await getSettings(context, async () => {})
    expect(context.state.entitySettings).toStrictEqual({
      ...clConfiguration,
      updateableFields: ['field1', 'field2'],
    })
  })

  it('get default AD configuration', async () => {
    const context = getContext('AD', {
      updateableClientFields: [],
      entityConfigurations: [],
    }) as Context

    await getSettings(context, async () => {})
    expect(context.state.entitySettings).toStrictEqual(adConfiguration)
  })

  it('get custom AD configuration', async () => {
    const customConfig: EntityConfiguration = {
      entityAcronym: 'AD',
      fieldToMatchOnEntity: 'X',
      fieldToMatchOnClient: 'Y',
      canCreate: false,
      canDelete: true,
      updateableFields: ['mytest'],
    }

    const context = getContext('AD', {
      updateableClientFields: [],
      entityConfigurations: [customConfig],
    }) as Context

    await getSettings(context, async () => {})
    expect(context.state.entitySettings).toStrictEqual(customConfig)
  })

  it('get invalid entity configuration', async () => {
    const context = getContext('XX', {
      updateableClientFields: [],
      entityConfigurations: [],
    }) as Context

    await getSettings(context, async () => {})
    expect(context.state.entitySettings).toBeUndefined()
  })

  it('get custom entity configuration', async () => {
    const customConfig: EntityConfiguration = {
      entityAcronym: 'XX',
      fieldToMatchOnEntity: 'X',
      fieldToMatchOnClient: 'Y',
      canCreate: false,
      canDelete: true,
      updateableFields: ['mytest'],
    }

    const context = getContext('XX', {
      updateableClientFields: [],
      entityConfigurations: [customConfig],
    }) as Context

    await getSettings(context, async () => {})
    expect(context.state.entitySettings).toStrictEqual(customConfig)
  })
})
