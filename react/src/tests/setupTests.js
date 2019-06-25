import { configure } from 'dom-testing-library';

configure({ testIdAttribute: 'data-test-id' });

global.fetch = () => {};
