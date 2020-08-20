import React from 'react';
import { Machine } from 'xstate';
import { useMachine } from '@xstate/react';
import { createStyleSheet } from '../utls';

// The events that the machine handles
type LightEvent = { type: 'TOGGLE' };

const toggleMachine = Machine<undefined, LightEvent>({
  id: 'toggle',
  initial: 'inactive',
  states: {
    inactive: {
      on: { TOGGLE: 'active' }
    },
    active: {
      on: { TOGGLE: 'inactive' }
    }
  }
});

function Button() {
  const [state, send] = useMachine(toggleMachine);

  return (
    <div
      style={{
        ...styles.checkbox
      }}
      onClick={() => send('TOGGLE')}
    >
      {state.matches('active') ? 'X' : ''}
    </div>
  );
}

const styles = createStyleSheet({
  checkbox: {
    height: 30,
    width: 30,
    borderWidth: 1,
    borderStyle: 'solid',
    borderRadius: 5,
    alignItems: 'center',
    justifyContent: 'center',
    display: 'flex',
    userSelect: 'none',
    cursor: 'pointer',
    fontSize: '20px'
  }
});

export default Button;