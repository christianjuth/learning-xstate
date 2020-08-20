import SignupForm, { loginMachine } from '../pages/signup-form';
import { createModel } from '@xstate/test';
import { render, RenderResult, fireEvent, act } from '@testing-library/react';
jest.useFakeTimers()

const CORRECT_LOGIN_INFO = {
  username: 'johnsmith',
  password: 'password'
};
const INCORRECT_LOGIN_INFO = {
  username: 'jane',
  password: 'p@sswd'
};
const EMPTY_LOGIN_INFO = {
  username: 'jane',
  password: 'p@sswd'
}

const testLoginMachine = loginMachine.withConfig({
  services: {
    signUp: (ctx) => new Promise((resolve, reject) => {
      const { username, password } = ctx;
      
      setTimeout(() => {
        if (username === CORRECT_LOGIN_INFO.username && password === CORRECT_LOGIN_INFO.password) {
          resolve();
        } else {
          reject();
        }
      }, 1000);
    })
  }
});

const toggleModel = createModel(testLoginMachine).withEvents({
  DATA_ENTRY: {
    exec: async (p, event: any) => {
      const page = p as RenderResult;

      await act( async() => {
        fireEvent.change(page.getByPlaceholderText(/username/i), {
          target: { value: event.username },
        });
        fireEvent.change(page.getByPlaceholderText(/password/i), {
          target: { value: event.password },
        });
      });
    },
    cases: [CORRECT_LOGIN_INFO, INCORRECT_LOGIN_INFO, EMPTY_LOGIN_INFO]
  },
  SUBMIT: {
    exec: async (p) => {
      const page = p as RenderResult;

      await act(async () => {
        fireEvent.click(page.getAllByTestId('submit-button')[0])
      });
    }
  },
  // 'done.invoke.signUp': {
  // },
  // 'error.platform.signUp': {
  // }
});

describe('signup-form', () => {
  const testPlans = toggleModel.getShortestPathPlans();

  testPlans.forEach(plan => {
    describe(plan.description, () => {
      plan.paths.forEach(path => {
        it(path.description, async () => {
          // do any setup, then...
          const page = render(<SignupForm machine={testLoginMachine}/>);

          await path.test(page);
        });
      });
    });
  });

  it('should have full coverage', () => {
    return toggleModel.testCoverage();
  });
});