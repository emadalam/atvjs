import chai from 'chai';
import stubs from './tvjs-stubs';
import Library from '../src/index';

let expect = chai.expect;

describe('Internal library tests', () => {
    describe('Library', () => {
        it('should have Ajax', () => {
            expect(Library).to.have.property('Ajax');
        });

        it('should have Navigation', () => {
            expect(Library).to.have.property('Navigation');
        });

        it('should have Page', () => {
            expect(Library).to.have.property('Page');
        });

        it('should have Parser', () => {
            expect(Library).to.have.property('Parser');
        });

        it('should have Handler', () => {
            expect(Library).to.have.property('Handler');
        });

        it('should have Settings', () => {
            expect(Library).to.have.property('Settings');
        });

        it('should have Menu', () => {
            expect(Library).to.have.property('Menu');
        });
    });
});