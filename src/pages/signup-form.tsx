import React from 'react';
import { createMachine, assign, StateValue } from 'xstate';
import { useMachine } from '@xstate/react';
import { createStyleSheet } from '../utls';
import { RenderResult, waitFor } from '@testing-library/react';

const api = {
  signUp: () => new Promise((resolve, reject) => {
    setTimeout(() => {
      const randomBool = Math.random() >= 0.5;
      randomBool ? resolve() : reject();
    }, 1000);
  })
}

type MachineState =
  | { value: 'dataEntry'; context: MachineContext }
  | { value: 'submitting'; context: MachineContext }
  | { value: 'success'; context: MachineContext }
  | { value: 'error'; context: MachineContext };

type MachineContext = { 
  username: string;
  password: string;
};

type MachineEvent = 
  | { type: 'DATA_ENTRY'; username?: string; password?: string; }
  | { type: 'SUBMIT' };

export const loginMachine = createMachine<MachineContext, MachineEvent, MachineState>({
  id: 'login',
  initial: 'dataEntry',
  context: {
    username: '',
    password: ''
  },
  states: {
    dataEntry: {
      on: {
        DATA_ENTRY: {
          target: 'dataEntry',
          actions: ['handleInput']
        },
        SUBMIT: [{
          target: 'submitting',
          cond: { type: 'dataIsValid' }
        }, {
          target: "dataEntry.invalid"
        }]
      },
      initial: "idle",
      states: {
        idle: {},
        invalid: {}
      },
      meta: {
        test: async (page: RenderResult) => {
          await waitFor(() => page.getByText(/sign up/i))
        }
      }
    },
    submitting: {
      invoke: {
        src: 'signUp',
        onDone: {
          target: 'success'
        },
        onError: {
          target: 'error'
        }
      },
      meta: {
        test: async (page: RenderResult) => {
          await waitFor(() => page.getByText(/submitting/i))
        }
      }
    },
    success: {
      type: 'final',
      meta: {
        test: async (page: RenderResult) => {
          await waitFor(() => page.getByText(/success/i))
        }
      }
    },
    error: {
      on: {
        DATA_ENTRY: {
          target: 'dataEntry',
          actions: ['handleInput']
        },
        SUBMIT: [{
          target: 'submitting',
          cond: { type: 'dataIsValid' }
        }, {
          target: "dataEntry.invalid"
        }]
      },
      meta: {
        test: async (page: RenderResult) => {
          await waitFor(() => page.getByText(/try again/i))
        }
      }
    }
  }
}, {
  actions: {
    handleInput: assign<MachineContext, MachineEvent>((_, evt) => {
      if (evt.type !== 'DATA_ENTRY') {
        return {};
      }

      const { username, password } = evt;
      const updatedContext: Partial<MachineContext> = {};

      if (username !== undefined) {
        updatedContext.username = username;
      }

      if (password !== undefined) {
        updatedContext.password = password;
      }

      return updatedContext;
    })
  },
  guards: {
    dataIsValid: (ctx) => {
      return ctx.username !== '' && ctx.password !== '';
    }
  }
});

function buttonTextFromState(stateValue: StateValue) {
  switch(stateValue) {
    case 'submitting':
      return 'Submitting...';
    case 'success': 
      return 'Success!';
    case 'error': 
      return 'Try Again';
    default: 
      return 'Sign Up!';
  }
}

function computeValue(value: any) {
  if (typeof value === 'object') {
    const key = Object.keys(value)[0];
    const prop = value[key]
    return `${key}.${prop}`
  } else {
    return value;
  }
}

function Button({
  machine = loginMachine.withConfig({
    services: {
      signUp: () => api.signUp()
    }
  })
}) {
  const [state, send] = useMachine(machine);
  const value = computeValue(state.value);

  return (
    <form 
      data-testid='form'
      data-statevalue={value}
      style={styles.form}
      onSubmit={e => e.preventDefault()}
    >
      <span style={styles.title}>Join Our Platform!</span>
      <div style={styles.spacer}/>
      <input
        style={{
          ...styles.input,
          // @ts-ignore
          ...styles['input_'+value]
        }}
        placeholder='Username'
        onChange={e => {
          send({
            type: 'DATA_ENTRY',
            username: e.target.value
          })
        }}
        value={state.context.username}
      />
      <div style={styles.spacer}/>
      <input
        style={{
          ...styles.input,
          // @ts-ignore
          ...styles['input_'+value]
        }}
        placeholder='Password'
        onChange={e => {
          send({
            type: 'DATA_ENTRY',
            password: e.target.value
          })
        }}
        value={state.context.password}
        type='password'
      />
      <div style={styles.spacer}/>
      <button 
        data-testid="submit-button"
        type='submit'
        style={{
          ...styles.button,
          // @ts-ignore
          ...styles['button_'+value]
        }}
        onClick={() => send('SUBMIT')}
      >
        {buttonTextFromState(value)}
      </button>
    </form>
  );
}

const styles = createStyleSheet({
  // button base
  form: {
    display: 'flex',
    flexDirection: 'column',
    alignItems: 'center',
    padding: '15px 20px',
    border: '1px solid #bbb',
    borderRadius: 6,
    userSelect: 'none'
  },
  title: {
    fontWeight: 900,
    fontSize: '2rem'
  },
  input: {
    fontSize: '1.2rem',
    padding: '10px 12px',
    width: '100%',
    borderStyle: 'solid',
    borderWidth: 1,
    borderRadius: 4
  },
  button: {
    backgroundColor: '#000',
    color: '#fff',
    borderRadius: 4,
    padding: '10px',
    fontSize: '1.2rem',
    width: '100%',
    textAlign: 'center',
    cursor: 'pointer',
    outline: 'none',
    border: 'none'
  },
  spacer: {
    height: 12
  },
  // button states
  button_submitting: {
    opacity: 0.5,
    cursor: 'progress'
  },
  button_success: {
    backgroundColor: '#2ecc71',
    cursor: 'default'
  },
  button_error: {
    backgroundColor: '#c0392b'
  },
  // input states
  'input_dataEntry.invalid': {
    borderColor: '#c0392b'
  }
});

export default Button;