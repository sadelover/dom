import {
  createStore,
  applyMiddleware,
  compose
} from 'redux';
import thunk from 'redux-thunk';
import {
  hashHistory
} from 'react-router';
import {
  routerMiddleware,
  push
} from 'react-router-redux';
import createLogger from 'redux-logger';
import rootReducer from './rootReducer';

// 调试中可用的 actionCreators
const actionCreators = {
  push,
};
// redux 日志扩展
const logger = createLogger({
  level: 'info',
  collapsed: true
});

// redux-react-router 扩展
const router = routerMiddleware(hashHistory);

const composeEnhancers = window.__REDUX_DEVTOOLS_EXTENSION_COMPOSE__ ?
  window.__REDUX_DEVTOOLS_EXTENSION_COMPOSE__({
    actionCreators
  }) :
  compose;

const enhancer = composeEnhancers(
  applyMiddleware(thunk, router, logger)
);

export default function configureStore(initialState) {
  const store = createStore(rootReducer, initialState, enhancer);

  if (module.hot) {
    module.hot.accept('./rootReducer', () =>
      store.replaceReducer(require('./rootReducer'))
    );
  }

  return store;
}
