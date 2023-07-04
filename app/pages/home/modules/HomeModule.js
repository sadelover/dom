// ------------------------------------
// Constants
// ------------------------------------
export const TOGGLE_SIDER = 'TOGGLE_SIDER';

// ------------------------------------
// Actions
// ------------------------------------
export function onToggleSider () {
  return {
    type: TOGGLE_SIDER
  }
}

export const actions = {
}

// ------------------------------------
// Action Handlers
// ------------------------------------
const ACTION_HANDLERS = {
}

// ------------------------------------
// Reducer
// ------------------------------------
const initialState = {};
export default function homeReducer (state = initialState, action) {
  const handler = ACTION_HANDLERS[action.type]

  return handler ? handler(state, action) : state
}
