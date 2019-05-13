import Enzyme from 'enzyme';
import EnzymeAdapterReact16 from 'enzyme-adapter-react-16';
import 'regenerator-runtime/runtime';

global.Promise = jest.requireActual('promise');

Enzyme.configure({adapter: new EnzymeAdapterReact16()});
