import clConfiguration from '../constants/clConfiguration'

export async function getSettings(ctx: Context, next: () => Promise<unknown>) {
  const {
    clients: { apps },
    state: { entity },
  } = ctx

  const appSettings = (await apps.getAppSettings(
    process.env.VTEX_APP_ID as string
  )) as Settings

  ctx.state.entitySettings =
    entity === 'CL'
      ? {
          ...clConfiguration,
          ...{ updateableFields: appSettings.updateableClientFields },
        }
      : appSettings.entityConfigurations.find(
          (value) => entity === value.entityAcronym
        )
  await next()
}

// function getCL() {}
