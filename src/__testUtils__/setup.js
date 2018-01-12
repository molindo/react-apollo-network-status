import Enzyme from 'enzyme';
import EnzymeAdapterReact16 from 'enzyme-adapter-react-16';

Enzyme.configure({adapter: new EnzymeAdapterReact16()});
