import type userEvent from '@testing-library/user-event'
import { SLOT_FIELDS } from '../../src/engine/draft'
import type { MissionConfiguration } from '../../src/engine/types'

/** Explicitly use the actual controls; never seed App with a fitted preset. */
export async function assemble(user: ReturnType<typeof userEvent.setup>, config: MissionConfiguration) {
  for(const field of SLOT_FIELDS) {
    const control=document.getElementById(field) as HTMLSelectElement
    if(!control)throw Error(`Missing assembly control ${field}`)
    await user.selectOptions(control,config[field])
  }
}
