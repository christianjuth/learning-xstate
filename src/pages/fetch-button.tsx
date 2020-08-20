import React from 'react';
import { Machine, assign } from 'xstate';
import { useMachine } from '@xstate/react';
import { createStyleSheet } from '../utls';

const api = {
  signUp: () => new Promise((resolve, reject) => {
    setTimeout(() => {
      const randomBool = Math.random() >= 0.5;
      randomBool ? resolve() : reject();
    }, 1000);
  })
}

type MachineContext = { 
  buttonText: string | null
};

type MachineEvent = { type: 'CLICK' };

const toggleMachine = Machine<MachineContext, MachineEvent>({
  id: 'toggle',
  initial: 'normal',
  context: {
    buttonText: null
  },
  states: {
    normal: {
      entry: assign({ buttonText: (_1, _2) => null }),
      on: { CLICK: 'fetching' }
    },
    fetching: {
      entry: assign({ buttonText: (_1, _2) => 'Loading...' }),
      invoke: {
        src: 'fetchData',
        onDone: {
          target: 'success'
        },
        onError: {
          target: 'error'
        }
      }
    },
    success: {
      entry: assign({ buttonText: (_1, _2) => 'Success!' }),
      on: { CLICK: 'fetching' }
    },
    error: {
      entry: assign({ buttonText: (_1, _2) => 'Try Again' }),
      on: { 
        CLICK: 'fetching'
      },
      after: {
        2000: 'normal'
      }
    }
  }
});

function Button() {
  const [state, send] = useMachine(toggleMachine, {
    services: {
      fetchData: () => api.signUp()
    }
  });

  return (
    <div 
      style={{
        ...styles.button,
        // @ts-ignore
        ...styles[state.value]
      }}
      onClick={() => send('CLICK')}
    >
      {state.context.buttonText ?? 'Sign Up!'}
    </div>
  );
}

const styles = createStyleSheet({
  // button base
  button: {
    backgroundColor: '#000',
    color: '#fff',
    borderRadius: 6,
    padding: '8px 12px',
    fontSize: '1.2rem'
  },
  // button states
  normal: {
    cursor: 'pointer'
  },
  fetching: {
    opacity: 0.5,
    cursor: 'progress'
  },
  success: {
    backgroundColor: '#2ecc71',
    cursor: 'pointer'
  },
  error: {
    backgroundColor: '#c0392b',
    cursor: 'pointer'
  }
});

export default Button;